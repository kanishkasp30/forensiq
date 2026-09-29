import express, {
  Request,
  Response,
  NextFunction,
} from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const { Pool } = pg;

const app = express();

const PORT =
  Number(process.env.PORT) || 3000;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "forensiq-development-secret";

/* -------------------------------------------------------------------------- */
/* Middleware                                                                 */
/* -------------------------------------------------------------------------- */

app.use(
  express.json({
    limit: "10mb",
  })
);

/* -------------------------------------------------------------------------- */
/* PostgreSQL                                                                 */
/* -------------------------------------------------------------------------- */

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL,

  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

pool.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL error:",
    error
  );
});

/* -------------------------------------------------------------------------- */
/* Database Initialization                                                    */
/* -------------------------------------------------------------------------- */

async function initializeDatabase() {
  /* Users */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      name VARCHAR(150) NOT NULL,

      email VARCHAR(255)
        UNIQUE NOT NULL,

      password_hash TEXT NOT NULL,

      role VARCHAR(20) NOT NULL
        CHECK (
          role IN (
            'victim',
            'officer',
            'admin'
          )
        ),

      phone VARCHAR(30),

      govt_id VARCHAR(100),

      address TEXT,

      badge_id VARCHAR(100),

      department VARCHAR(200),

      avatar_url TEXT,

      is_verified BOOLEAN
        DEFAULT FALSE,

      created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
    );
  `);

  /* Cases */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cases (
      id VARCHAR(50) PRIMARY KEY,

      title VARCHAR(255) NOT NULL,

      category VARCHAR(100) NOT NULL,

      urgency VARCHAR(20) NOT NULL,

      status VARCHAR(50) NOT NULL
        DEFAULT 'Submitted',

      victim_name VARCHAR(150) NOT NULL,

      victim_contact VARCHAR(255) NOT NULL,

      victim_govt_id VARCHAR(100),

      victim_address TEXT,

      incident_location TEXT,

      incident_date VARCHAR(100),

      reported_date TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

      assigned_officer VARCHAR(150)
        DEFAULT 'Pending assignment',

      description TEXT NOT NULL,

      loss_amount NUMERIC,

      financial_details JSONB,

      evidence_files JSONB
        DEFAULT '[]'::jsonb,

      timeline JSONB
        DEFAULT '[]'::jsonb,

      ai_analysis JSONB,

      suspect_info JSONB,

      comments JSONB
        DEFAULT '[]'::jsonb,

      created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL
    );
  `);

  /* Notifications */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

      user_id UUID
        REFERENCES users(id)
        ON DELETE CASCADE,

      title VARCHAR(255) NOT NULL,

      message TEXT NOT NULL,

      time VARCHAR(100) NOT NULL,

      read BOOLEAN
        DEFAULT FALSE,

      type VARCHAR(30) NOT NULL,

      case_id VARCHAR(50),

      created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
    );
  `);

  /* Audit logs */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

      actor VARCHAR(150) NOT NULL,

      role VARCHAR(20) NOT NULL,

      action TEXT NOT NULL,

      target TEXT NOT NULL,

      ip_address VARCHAR(100),

      status VARCHAR(20) NOT NULL,

      timestamp TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
    );
  `);

  /* Evidence analysis history */

  await pool.query(`
    CREATE TABLE IF NOT EXISTS evidence_analyses (
      id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

      user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

      case_id VARCHAR(50),

      evidence_type VARCHAR(100),

      evidence_title VARCHAR(255),

      content_hash_sha256 VARCHAR(64)
        NOT NULL,

      content_size INTEGER,

      risk_score INTEGER,

      risk_level VARCHAR(20),

      category VARCHAR(150),

      analysis JSONB,

      created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log(
    "PostgreSQL database initialized."
  );
}

/* -------------------------------------------------------------------------- */
/* Gemini AI                                                                  */
/* -------------------------------------------------------------------------- */

let aiClient:
  | GoogleGenAI
  | null = null;

function getGenAIClient():
  | GoogleGenAI
  | null {
  if (
    !aiClient &&
    process.env.GEMINI_API_KEY
  ) {
    aiClient = new GoogleGenAI({
      apiKey:
        process.env.GEMINI_API_KEY,
    });
  }

  return aiClient;
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type UserRole =
  | "victim"
  | "officer"
  | "admin";

interface AuthenticatedRequest
  extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

/* -------------------------------------------------------------------------- */
/* JWT Helpers                                                                */
/* -------------------------------------------------------------------------- */

function createToken(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader?.startsWith(
      "Bearer "
    )
  ) {
    return res.status(401).json({
      success: false,
      error:
        "Authentication required.",
    });
  }

  const token =
    authHeader.substring(7);

  try {
    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      ) as AuthenticatedRequest["user"];

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      error:
        "Invalid or expired authentication token.",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Utility Helpers                                                            */
/* -------------------------------------------------------------------------- */

function sha256(
  value: string
): string {
  return crypto
    .createHash("sha256")
    .update(value, "utf8")
    .digest("hex");
}

function unique(
  values: string[]
): string[] {
  return [
    ...new Set(
      values.filter(Boolean)
    ),
  ];
}

/* -------------------------------------------------------------------------- */
/* Indian Currency Helpers                                                    */
/* -------------------------------------------------------------------------- */

/**
 * ForensIQ uses Indian Rupees as the default
 * financial currency.
 *
 * IMPORTANT:
 * The database stores loss_amount as a numeric
 * value only. Currency formatting should happen
 * at the presentation layer.
 */

const DEFAULT_CURRENCY = "INR";
const DEFAULT_CURRENCY_SYMBOL = "₹";
const DEFAULT_LOCALE = "en-IN";

function normalizeLossAmount(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue =
    Number(value);

  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return null;
  }

  return numericValue;
}

function formatFinancialDetails(
  financialDetails: any,
  lossAmount: unknown
) {
  const normalizedAmount =
    normalizeLossAmount(
      lossAmount
    );

  return {
    ...(financialDetails || {}),

    currency:
      DEFAULT_CURRENCY,

    currencyCode:
      DEFAULT_CURRENCY,

    currencySymbol:
      DEFAULT_CURRENCY_SYMBOL,

    locale:
      DEFAULT_LOCALE,

    lossAmount:
      normalizedAmount,
  };
}

function buildCaseResponse(
  row: any
) {
  const lossAmount =
    normalizeLossAmount(
      row.loss_amount
    );

  return {
    id: row.id,

    title: row.title,

    category:
      row.category,

    urgency:
      row.urgency,

    status:
      row.status,

    victimName:
      row.victim_name,

    victimContact:
      row.victim_contact,

    victimGovtId:
      row.victim_govt_id,

    victimAddress:
      row.victim_address,

    incidentLocation:
      row.incident_location,

    incidentDate:
      row.incident_date,

    reportedDate:
      row.reported_date,

    assignedOfficer:
      row.assigned_officer,

    description:
      row.description,

    lossAmount,

    /* Indian financial information */

    currency:
      DEFAULT_CURRENCY,

    currencyCode:
      DEFAULT_CURRENCY,

    currencySymbol:
      DEFAULT_CURRENCY_SYMBOL,

    locale:
      DEFAULT_LOCALE,

    financialDetails:
      formatFinancialDetails(
        row.financial_details,
        lossAmount
      ),

    evidenceFiles:
      Array.isArray(row.evidence_files)
        ? row.evidence_files
        : [],

    timeline:
      Array.isArray(row.timeline)
        ? row.timeline
        : [],

    aiAnalysis:
      row.ai_analysis,

    suspectInfo:
      row.suspect_info,

    comments:
      Array.isArray(row.comments)
        ? row.comments
        : [],
  };
}

/* -------------------------------------------------------------------------- */
/* IOC Extraction                                                             */
/* -------------------------------------------------------------------------- */

interface ExtractedIndicators {
  emails: string[];
  phoneNumbers: string[];
  ipv4Addresses: string[];
  urls: string[];
  domains: string[];
  cryptoAddresses: string[];
  hashes: string[];
}

function extractIndicators(
  content: string
): ExtractedIndicators {
  const emails =
    content.match(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    ) || [];

  const ipv4Addresses =
    content.match(
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
    ) || [];

  const urls =
    content.match(
      /https?:\/\/[^\s<>"']+/gi
    ) || [];

  const phoneNumbers =
    content.match(
      /(?:\+?\d[\d\s().-]{7,}\d)/g
    ) || [];

  const domains =
    content.match(
      /\b(?:[a-zA-Z0-9-]+\.)+(?:com|net|org|in|io|xyz|co|info|biz|me|app|dev)\b/gi
    ) || [];

  const cryptoAddresses =
    content.match(
      /\b(?:bc1[a-zA-HJ-NP-Z0-9]{20,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|0x[a-fA-F0-9]{40})\b/g
    ) || [];

  const hashes =
    content.match(
      /\b[a-fA-F0-9]{32}\b|\b[a-fA-F0-9]{40}\b|\b[a-fA-F0-9]{64}\b|\b[a-fA-F0-9]{128}\b/g
    ) || [];

  return {
    emails:
      unique(emails),

    phoneNumbers:
      unique(phoneNumbers),

    ipv4Addresses:
      unique(ipv4Addresses),

    urls:
      unique(urls),

    domains:
      unique(domains),

    cryptoAddresses:
      unique(cryptoAddresses),

    hashes:
      unique(hashes),
  };
}

/* -------------------------------------------------------------------------- */
/* Entity Extraction                                                          */
/* -------------------------------------------------------------------------- */

interface ExtractedEntities {
  emails: string[];
  phones: string[];
  ipAddresses: string[];
  urls: string[];
  domains: string[];
  cryptoAddresses: string[];
  hashes: string[];
}

function extractEntities(
  indicators: ExtractedIndicators
): ExtractedEntities {
  return {
    emails:
      indicators.emails,

    phones:
      indicators.phoneNumbers,

    ipAddresses:
      indicators.ipv4Addresses,

    urls:
      indicators.urls,

    domains:
      indicators.domains,

    cryptoAddresses:
      indicators.cryptoAddresses,

    hashes:
      indicators.hashes,
  };
}

/* -------------------------------------------------------------------------- */
/* Basic Risk Heuristic                                                       */
/* -------------------------------------------------------------------------- */

function calculateHeuristicRisk(
  indicators: ExtractedIndicators,
  content: string
) {
  let score = 0;

  const reasons: string[] =
    [];

  if (
    indicators.ipv4Addresses
      .length > 0
  ) {
    score += 10;

    reasons.push(
      "IP address indicator detected."
    );
  }

  if (
    indicators.urls.length > 0
  ) {
    score += 10;

    reasons.push(
      "URL indicator detected."
    );
  }

  if (
    indicators.cryptoAddresses
      .length > 0
  ) {
    score += 15;

    reasons.push(
      "Cryptocurrency address detected."
    );
  }

  if (
    indicators.hashes.length > 0
  ) {
    score += 10;

    reasons.push(
      "Potential digital hash detected."
    );
  }

  const suspiciousTerms = [
    "phishing",
    "malware",
    "ransomware",
    "trojan",
    "credential",
    "password",
    "exploit",
    "fraud",
    "scam",
    "blackmail",
    "extortion",
    "bitcoin",
    "cryptocurrency",
    "keylogger",
    "backdoor",
    "botnet",
    "unauthorized",
  ];

  const lower =
    content.toLowerCase();

  const matchedTerms =
    suspiciousTerms.filter(
      (term) =>
        lower.includes(term)
    );

  if (
    matchedTerms.length > 0
  ) {
    score += Math.min(
      matchedTerms.length * 5,
      35
    );

    reasons.push(
      `Suspicious terminology detected: ${matchedTerms.join(
        ", "
      )}.`
    );
  }

  score = Math.min(
    score,
    100
  );

  let riskLevel:
    | "Critical"
    | "High"
    | "Medium"
    | "Low"
    | "Clean";

  if (score >= 80) {
    riskLevel = "Critical";
  } else if (score >= 60) {
    riskLevel = "High";
  } else if (score >= 35) {
    riskLevel = "Medium";
  } else if (score > 0) {
    riskLevel = "Low";
  } else {
    riskLevel = "Clean";
  }

  return {
    score,
    riskLevel,
    reasons,
  };
}

/* -------------------------------------------------------------------------- */
/* Health Check                                                               */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/health",
  async (_req, res) => {
    try {
      const result =
        await pool.query(
          "SELECT NOW() AS time"
        );

      res.json({
        success: true,
        server: "online",
        database: "connected",
        timestamp:
          result.rows[0].time,
      });
    } catch (error) {
      console.error(
        "Database health check failed:",
        error
      );

      res.status(503).json({
        success: false,
        server: "online",
        database: "disconnected",
        error:
          "Database connection failed",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Database Test                                                              */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/db-test",
  async (_req, res) => {
    try {
      const result =
        await pool.query(
          "SELECT NOW() AS current_time"
        );

      res.json({
        success: true,
        message:
          "PostgreSQL connection successful",
        time:
          result.rows[0]
            .current_time,
      });
    } catch (error) {
      console.error(
        "PostgreSQL test failed:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Unable to connect to PostgreSQL",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Authentication - Register                                                 */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const {
        fullName,
        name,
        email,
        password,
        role,
        badgeId,
        department,
        phone,
        govtId,
        address,
        avatarUrl,
      } = req.body;

      const userName = (
        fullName ||
        name ||
        ""
      ).trim();

      const userEmail = String(
        email || ""
      )
        .trim()
        .toLowerCase();

      const userPassword =
        String(password || "");

      const userRole: UserRole =
        role || "victim";

      if (!userName) {
        return res.status(400).json({
          success: false,
          error:
            "Full name is required.",
        });
      }

      if (!userEmail) {
        return res.status(400).json({
          success: false,
          error:
            "Email address is required.",
        });
      }

      if (
        !userEmail.includes("@")
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Enter a valid email address.",
        });
      }

      if (
        userPassword.length < 8
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Password must contain at least 8 characters.",
        });
      }

      if (
        ![
          "victim",
          "officer",
          "admin",
        ].includes(userRole)
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid user role.",
        });
      }

      if (
        (
          userRole ===
            "officer" ||
          userRole === "admin"
        ) &&
        (
          !badgeId?.trim() ||
          !department?.trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Badge/Admin ID and department are required for this role.",
        });
      }

      const existingUser =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [userEmail]
        );

      if (
        existingUser.rows
          .length > 0
      ) {
        return res.status(409).json({
          success: false,
          error:
            "An account with this email already exists.",
        });
      }

      const passwordHash =
        await bcrypt.hash(
          userPassword,
          12
        );

      const result =
        await pool.query(
          `
          INSERT INTO users (
            name,
            email,
            password_hash,
            role,
            phone,
            govt_id,
            address,
            badge_id,
            department,
            avatar_url,
            is_verified
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11
          )
          RETURNING
            id,
            name,
            email,
            role,
            phone,
            govt_id AS "govtId",
            address,
            badge_id AS "badgeId",
            department,
            avatar_url AS "avatarUrl",
            is_verified AS "isVerified"
          `,
          [
            userName,
            userEmail,
            passwordHash,
            userRole,
            phone || null,
            govtId || null,
            address || null,
            badgeId || null,
            department || null,
            avatarUrl || null,
            false,
          ]
        );

      const user =
        result.rows[0];

      const token =
        createToken({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });

      await pool.query(
        `
        INSERT INTO audit_logs (
          actor,
          role,
          action,
          target,
          ip_address,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          user.name,
          user.role,
          "Account registration",
          user.id,
          req.ip,
          "Success",
        ]
      );

      return res.status(201).json({
        success: true,
        message:
          "Account created successfully.",
        token,
        user,
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to create account.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Authentication - Login                                                    */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
        role,
      } = req.body;

      const userEmail = String(
        email || ""
      )
        .trim()
        .toLowerCase();

      const userPassword =
        String(password || "");

      if (
        !userEmail ||
        !userPassword
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Email and password are required.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            name,
            email,
            password_hash,
            role,
            phone,
            govt_id AS "govtId",
            address,
            badge_id AS "badgeId",
            department,
            avatar_url AS "avatarUrl",
            is_verified AS "isVerified"
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [userEmail]
        );

      if (
        result.rows.length === 0
      ) {
        await pool.query(
          `
          INSERT INTO audit_logs (
            actor,
            role,
            action,
            target,
            ip_address,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            userEmail,
            role || "victim",
            "Login attempt",
            userEmail,
            req.ip,
            "Denied",
          ]
        );

        return res.status(401).json({
          success: false,
          error:
            "Invalid email or password.",
        });
      }

      const dbUser =
        result.rows[0];

      const passwordMatches =
        await bcrypt.compare(
          userPassword,
          dbUser.password_hash
        );

      if (!passwordMatches) {
        await pool.query(
          `
          INSERT INTO audit_logs (
            actor,
            role,
            action,
            target,
            ip_address,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            dbUser.name,
            dbUser.role,
            "Login attempt",
            dbUser.id,
            req.ip,
            "Denied",
          ]
        );

        return res.status(401).json({
          success: false,
          error:
            "Invalid email or password.",
        });
      }

      if (
        role &&
        role !== dbUser.role
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Selected portal role does not match this account.",
        });
      }

      const user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        phone: dbUser.phone,
        govtId:
          dbUser.govtId,
        address:
          dbUser.address,
        badgeId:
          dbUser.badgeId,
        department:
          dbUser.department,
        avatarUrl:
          dbUser.avatarUrl,
        isVerified:
          dbUser.isVerified,
      };

      const token =
        createToken(user);

      await pool.query(
        `
        INSERT INTO audit_logs (
          actor,
          role,
          action,
          target,
          ip_address,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          user.name,
          user.role,
          "User login",
          user.id,
          req.ip,
          "Success",
        ]
      );

      return res.json({
        success: true,
        message:
          "Login successful.",
        token,
        user,
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to process login.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Authentication - Current User                                             */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/auth/me",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            id,
            name,
            email,
            role,
            phone,
            govt_id AS "govtId",
            address,
            badge_id AS "badgeId",
            department,
            avatar_url AS "avatarUrl",
            is_verified AS "isVerified"
          FROM users
          WHERE id = $1
          LIMIT 1
          `,
          [req.user?.id]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          error:
            "User account no longer exists.",
        });
      }

      return res.json({
        success: true,
        user:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to retrieve account.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Authentication - Logout                                                   */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/auth/logout",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      if (req.user) {
        await pool.query(
          `
          INSERT INTO audit_logs (
            actor,
            role,
            action,
            target,
            ip_address,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            req.user.name,
            req.user.role,
            "User logout",
            req.user.id,
            req.ip,
            "Success",
          ]
        );
      }

      return res.json({
        success: true,
        message:
          "Logged out successfully.",
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      return res.json({
        success: true,
        message:
          "Logged out.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Users - Admin                                                             */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/users",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      if (
        req.user?.role !==
        "admin"
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Administrator access required.",
        });
      }

      const result =
        await pool.query(`
          SELECT
            id,
            name,
            email,
            role,
            phone,
            govt_id AS "govtId",
            address,
            badge_id AS "badgeId",
            department,
            avatar_url AS "avatarUrl",
            is_verified AS "isVerified",
            created_at AS "createdAt"
          FROM users
          ORDER BY created_at DESC
        `);

      return res.json({
        success: true,
        users:
          result.rows,
      });
    } catch (error) {
      console.error(
        "Users retrieval error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to retrieve users.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Get                                                               */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/cases",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      let result;

      if (
        req.user?.role ===
        "victim"
      ) {
        result =
          await pool.query(
            `
            SELECT *
            FROM cases
            WHERE created_by = $1
            ORDER BY reported_date DESC
            `,
            [req.user.id]
          );
      } else {
        result =
          await pool.query(`
            SELECT *
            FROM cases
            ORDER BY reported_date DESC
          `);
      }

      const cases =
        result.rows.map(
          (row) =>
            buildCaseResponse(
              row
            )
        );

      return res.json({
        success: true,
        cases,
      });
    } catch (error) {
      console.error(
        "Cases retrieval error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to retrieve cases.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Create                                                            */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/cases",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const {
        id,
        title,
        category,
        urgency,
        victimName,
        victimContact,
        victimGovtId,
        victimAddress,
        incidentLocation,
        incidentDate,
        assignedOfficer,
        description,
        lossAmount,
        financialDetails,
        evidenceFiles,
        timeline,
        aiAnalysis,
        suspectInfo,
        comments,
      } = req.body;

      if (
        !title ||
        !category ||
        !description
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Title, category and description are required.",
        });
      }

      const caseId =
        id ||
        `FIQ-${new Date().getFullYear()}-${Math.floor(
          1000 +
            Math.random() *
              9000
        )}`;

      /* Normalize financial amount as INR */

      const normalizedLossAmount =
        normalizeLossAmount(
          lossAmount
        );

      const normalizedFinancialDetails =
        formatFinancialDetails(
          financialDetails,
          normalizedLossAmount
        );

      // Embed JSONB payloads directly in the SQL text using Postgres
      // dollar-quoting instead of bind parameters. This sidesteps an
      // intermittent driver-level parameter corruption bug we observed
      // specifically when evidence files were attached (case creation
      // succeeded with empty evidenceFiles but failed once evidence was
      // present, even though the JSON itself was verified valid).
      const financialDetailsJson = JSON.stringify(normalizedFinancialDetails);
      const evidenceFilesJson = JSON.stringify(evidenceFiles || []);
      const timelineJson = JSON.stringify(timeline || []);
      const aiAnalysisJson = JSON.stringify(aiAnalysis || null);
      const suspectInfoJson = JSON.stringify(suspectInfo || null);
      const commentsJson = JSON.stringify(comments || []);

      // Sanity-check each payload is valid JSON before it ever touches SQL
      for (const [label, json] of [
        ['financial_details', financialDetailsJson],
        ['evidence_files', evidenceFilesJson],
        ['timeline', timelineJson],
        ['ai_analysis', aiAnalysisJson],
        ['suspect_info', suspectInfoJson],
        ['comments', commentsJson],
      ] as const) {
        try {
          JSON.parse(json);
        } catch (parseErr) {
          console.error(`Invalid JSON built for ${label}:`, parseErr, json);
          return res.status(500).json({
            success: false,
            error: `Internal error building ${label} payload.`,
          });
        }
      }

      const tag = `json${Date.now()}`;

      const result =
        await pool.query(
          `
          INSERT INTO cases (
            id,
            title,
            category,
            urgency,
            status,
            victim_name,
            victim_contact,
            victim_govt_id,
            victim_address,
            incident_location,
            incident_date,
            assigned_officer,
            description,
            loss_amount,
            financial_details,
            evidence_files,
            timeline,
            ai_analysis,
            suspect_info,
            comments,
            created_by
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $${tag}$${financialDetailsJson}$${tag}$::jsonb,
            $${tag}$${evidenceFilesJson}$${tag}$::jsonb,
            $${tag}$${timelineJson}$${tag}$::jsonb,
            $${tag}$${aiAnalysisJson}$${tag}$::jsonb,
            $${tag}$${suspectInfoJson}$${tag}$::jsonb,
            $${tag}$${commentsJson}$${tag}$::jsonb,
            $15
          )
          RETURNING *
          `,
          [
            caseId,

            title,

            category,

            urgency ||
              "Medium",

            "Submitted",

            victimName ||
              req.user?.name ||
              "",

            victimContact ||
              req.user?.email ||
              "",

            victimGovtId ||
              null,

            victimAddress ||
              null,

            incidentLocation ||
              null,

            incidentDate ||
              null,

            assignedOfficer ||
              "Pending assignment",

            description,

            normalizedLossAmount,

            req.user?.id ||
              null,
          ]
        );

      await pool.query(
        `
        INSERT INTO notifications (
          user_id,
          title,
          message,
          time,
          read,
          type,
          case_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          req.user?.id,

          "Complaint submitted",

          `Your complaint ${caseId} has been submitted successfully.`,

          "Just now",

          false,

          "case_update",

          caseId,
        ]
      );

      const row =
        result.rows[0];

      return res.status(201).json({
        success: true,

        case:
          buildCaseResponse(
            row
          ),
      });
    } catch (error) {
      console.error(
        "Case creation error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to create case.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Update Status                                                     */
/* -------------------------------------------------------------------------- */

app.patch(
  "/api/cases/:id/status",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const { status, commentText } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: "Status is required.",
        });
      }

      const caseResult = await pool.query(
        `SELECT * FROM cases WHERE id = $1`,
        [req.params.id]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Case not found.",
        });
      }

      const existingCase = caseResult.rows[0];
      const actorName = req.user?.name || "System User";
      const now = new Date().toISOString();

      const updatedTimeline = [
        ...(Array.isArray(existingCase.timeline) ? existingCase.timeline : []),
        {
          id: `tl-${crypto.randomUUID()}`,
          timestamp: now,
          title: `Case Status Updated to ${status}`,
          description:
            commentText ||
            `Status transitioned from ${existingCase.status} to ${status} by ${actorName}.`,
          type: "status_change",
          actor: actorName,
          caseId: req.params.id,
        },
      ];

      let updatedComments = Array.isArray(existingCase.comments) ? existingCase.comments : [];

      if (commentText) {
        updatedComments = [
          ...updatedComments,
          {
            id: `cm-${crypto.randomUUID()}`,
            author: actorName,
            role: req.user?.role || "victim",
            timestamp: now,
            text: commentText,
            isInternal:
              req.user?.role === "officer" ||
              req.user?.role === "admin",
          },
        ];
      }

      const result = await pool.query(
        `
        UPDATE cases
        SET status = $1,
            timeline = $2::jsonb,
            comments = $3::jsonb
        WHERE id = $4
        RETURNING *
        `,
        [
          status,
          JSON.stringify(updatedTimeline),
          JSON.stringify(updatedComments),
          req.params.id,
        ]
      );

      return res.json({
        success: true,
        case: buildCaseResponse(result.rows[0]),
      });
    } catch (error) {
      console.error("Case status update error:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to update case status.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Add Evidence                                                      */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/cases/:id/evidence",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const file = req.body;

      if (!file || !file.name || !file.sha256Hash) {
        return res.status(400).json({
          success: false,
          error: "Evidence file name and SHA-256 hash are required.",
        });
      }

      const caseResult = await pool.query(
        `SELECT * FROM cases WHERE id = $1`,
        [req.params.id]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Case not found.",
        });
      }

      const existingCase = caseResult.rows[0];
      const actorName = req.user?.name || "System User";
      const now = new Date().toISOString();

      const evidenceItem = {
        id: file.id || `ev-${crypto.randomUUID()}`,
        name: file.name,
        type: file.type || "Artifact",
        size: file.size || "Unknown",
        uploadDate: file.uploadDate || now,
        sha256Hash: file.sha256Hash,
        verificationStatus: file.verificationStatus || "Verified",
        uploadedBy: file.uploadedBy || actorName,
        custodyChain: file.custodyChain || [],
        url: file.url,
      };

      const updatedEvidenceFiles = [
        ...(Array.isArray(existingCase.evidence_files) ? existingCase.evidence_files : []),
        evidenceItem,
      ];

      const updatedTimeline = [
        ...(Array.isArray(existingCase.timeline) ? existingCase.timeline : []),
        {
          id: `tl-${crypto.randomUUID()}`,
          timestamp: now,
          title: `New Evidence File Added (${evidenceItem.name})`,
          description: `File ingested with SHA-256 hash ${evidenceItem.sha256Hash.slice(
            0,
            16
          )}... and verified into Chain of Custody.`,
          type: "evidence_added",
          actor: actorName,
          caseId: req.params.id,
        },
      ];

      const result = await pool.query(
        `
        UPDATE cases
        SET evidence_files = $1::jsonb,
            timeline = $2::jsonb
        WHERE id = $3
        RETURNING *
        `,
        [
          JSON.stringify(updatedEvidenceFiles),
          JSON.stringify(updatedTimeline),
          req.params.id,
        ]
      );

      return res.json({
        success: true,
        case: buildCaseResponse(result.rows[0]),
      });
    } catch (error) {
      console.error("Add evidence error:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to add evidence to case.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Add Comment                                                       */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/cases/:id/comments",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const { text, isInternal } = req.body;

      if (typeof text !== "string" || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: "Comment text is required.",
        });
      }

      const caseResult = await pool.query(
        `SELECT * FROM cases WHERE id = $1`,
        [req.params.id]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Case not found.",
        });
      }

      const existingCase = caseResult.rows[0];
      const actorName = req.user?.name || "System User";
      const now = new Date().toISOString();

      const newComment = {
        id: `cm-${crypto.randomUUID()}`,
        author: actorName,
        role: req.user?.role || "victim",
        timestamp: now,
        text: text.trim(),
        isInternal: Boolean(isInternal),
      };

      const updatedComments = [
        ...(Array.isArray(existingCase.comments) ? existingCase.comments : []),
        newComment,
      ];

      const result = await pool.query(
        `
        UPDATE cases
        SET comments = $1::jsonb
        WHERE id = $2
        RETURNING *
        `,
        [JSON.stringify(updatedComments), req.params.id]
      );

      return res.json({
        success: true,
        case: buildCaseResponse(result.rows[0]),
      });
    } catch (error) {
      console.error("Add comment error:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to add comment to case.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Assign Officer                                                    */
/* -------------------------------------------------------------------------- */

app.patch(
  "/api/cases/:id/assign",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const { officerName } = req.body;

      if (typeof officerName !== "string" || !officerName.trim()) {
        return res.status(400).json({
          success: false,
          error: "Officer name is required.",
        });
      }

      const caseResult = await pool.query(
        `SELECT * FROM cases WHERE id = $1`,
        [req.params.id]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Case not found.",
        });
      }

      const existingCase = caseResult.rows[0];
      const actorName = req.user?.name || "System User";
      const now = new Date().toISOString();

      const updatedTimeline = [
        ...(Array.isArray(existingCase.timeline) ? existingCase.timeline : []),
        {
          id: `tl-${crypto.randomUUID()}`,
          timestamp: now,
          title: "Investigating Officer Assigned",
          description: `Case assigned to ${officerName.trim()} for forensic inquiry and evidence verification.`,
          type: "officer_assigned",
          actor: actorName,
          caseId: req.params.id,
        },
      ];

      const result = await pool.query(
        `
        UPDATE cases
        SET assigned_officer = $1,
            timeline = $2::jsonb
        WHERE id = $3
        RETURNING *
        `,
        [officerName.trim(), JSON.stringify(updatedTimeline), req.params.id]
      );

      return res.json({
        success: true,
        case: buildCaseResponse(result.rows[0]),
      });
    } catch (error) {
      console.error("Assign officer error:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to assign officer to case.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Add Timeline Event                                                */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/cases/:id/timeline",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const eventData = req.body;

      if (!eventData || !eventData.title || !eventData.description) {
        return res.status(400).json({
          success: false,
          error: "Timeline event title and description are required.",
        });
      }

      const caseResult = await pool.query(
        `SELECT * FROM cases WHERE id = $1`,
        [req.params.id]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Case not found.",
        });
      }

      const existingCase = caseResult.rows[0];
      const now = new Date().toISOString();

      const newEvent = {
        id: `tl-${crypto.randomUUID()}`,
        timestamp: eventData.timestamp || now,
        time: eventData.time,
        title: eventData.title,
        description: eventData.description,
        type: eventData.type || "note",
        actor: eventData.actor || req.user?.name || "System User",
        caseId: req.params.id,
        notes: eventData.notes || [],
        evidenceAttachments: eventData.evidenceAttachments || [],
      };

      const updatedTimeline = [
        ...(Array.isArray(existingCase.timeline) ? existingCase.timeline : []),
        newEvent,
      ];

      const result = await pool.query(
        `
        UPDATE cases
        SET timeline = $1::jsonb
        WHERE id = $2
        RETURNING *
        `,
        [JSON.stringify(updatedTimeline), req.params.id]
      );

      return res.json({
        success: true,
        case: buildCaseResponse(result.rows[0]),
      });
    } catch (error) {
      console.error("Add timeline event error:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to add timeline event.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Update Timeline Event                                             */
/* -------------------------------------------------------------------------- */

app.patch(
  "/api/cases/:id/timeline/:eventId",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const updatedFields = req.body;

      const caseResult = await pool.query(
        `SELECT * FROM cases WHERE id = $1`,
        [req.params.id]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Case not found.",
        });
      }

      const existingCase = caseResult.rows[0];

      const updatedTimeline = (Array.isArray(existingCase.timeline) ? existingCase.timeline : []).map(
        (event: any) =>
          event.id === req.params.eventId
            ? { ...event, ...updatedFields }
            : event
      );

      const result = await pool.query(
        `
        UPDATE cases
        SET timeline = $1::jsonb
        WHERE id = $2
        RETURNING *
        `,
        [JSON.stringify(updatedTimeline), req.params.id]
      );

      return res.json({
        success: true,
        case: buildCaseResponse(result.rows[0]),
      });
    } catch (error) {
      console.error("Update timeline event error:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to update timeline event.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Delete Timeline Event                                             */
/* -------------------------------------------------------------------------- */

app.delete(
  "/api/cases/:id/timeline/:eventId",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const caseResult = await pool.query(
        `SELECT * FROM cases WHERE id = $1`,
        [req.params.id]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Case not found.",
        });
      }

      const existingCase = caseResult.rows[0];

      const updatedTimeline = (Array.isArray(existingCase.timeline) ? existingCase.timeline : []).filter(
        (event: any) => event.id !== req.params.eventId
      );

      const result = await pool.query(
        `
        UPDATE cases
        SET timeline = $1::jsonb
        WHERE id = $2
        RETURNING *
        `,
        [JSON.stringify(updatedTimeline), req.params.id]
      );

      return res.json({
        success: true,
        case: buildCaseResponse(result.rows[0]),
      });
    } catch (error) {
      console.error("Delete timeline event error:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to delete timeline event.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Add Note to Timeline Event                                        */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/cases/:id/timeline/:eventId/notes",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const { noteText } = req.body;

      if (typeof noteText !== "string" || !noteText.trim()) {
        return res.status(400).json({
          success: false,
          error: "Note text is required.",
        });
      }

      const caseResult = await pool.query(
        `SELECT * FROM cases WHERE id = $1`,
        [req.params.id]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Case not found.",
        });
      }

      const existingCase = caseResult.rows[0];
      const actorName = req.user?.name || "System User";

      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const timestampedNote = `[${timestamp} - ${actorName}]: ${noteText.trim()}`;

      const updatedTimeline = (Array.isArray(existingCase.timeline) ? existingCase.timeline : []).map(
        (event: any) => {
          if (event.id !== req.params.eventId) return event;

          const existingNotes = event.notes || [];

          return {
            ...event,
            notes: [...existingNotes, timestampedNote],
          };
        }
      );

      const result = await pool.query(
        `
        UPDATE cases
        SET timeline = $1::jsonb
        WHERE id = $2
        RETURNING *
        `,
        [JSON.stringify(updatedTimeline), req.params.id]
      );

      return res.json({
        success: true,
        case: buildCaseResponse(result.rows[0]),
      });
    } catch (error) {
      console.error("Add timeline note error:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to add note to timeline event.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Cases - Attach Evidence to Timeline Event                                 */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/cases/:id/timeline/:eventId/evidence",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const evidence = req.body;

      if (!evidence || !evidence.name) {
        return res.status(400).json({
          success: false,
          error: "Evidence name is required.",
        });
      }

      const caseResult = await pool.query(
        `SELECT * FROM cases WHERE id = $1`,
        [req.params.id]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Case not found.",
        });
      }

      const existingCase = caseResult.rows[0];

      const newEvidenceItem = {
        id: `ev-tl-${crypto.randomUUID()}`,
        name: evidence.name,
        type: evidence.type || "Artifact",
        size: evidence.size || "1.2 MB",
        sha256Hash:
          evidence.sha256Hash ||
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        uploadedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const updatedTimeline = (Array.isArray(existingCase.timeline) ? existingCase.timeline : []).map(
        (event: any) => {
          if (event.id !== req.params.eventId) return event;

          const existingEvidence = event.evidenceAttachments || [];

          return {
            ...event,
            evidenceAttachments: [...existingEvidence, newEvidenceItem],
          };
        }
      );

      const result = await pool.query(
        `
        UPDATE cases
        SET timeline = $1::jsonb
        WHERE id = $2
        RETURNING *
        `,
        [JSON.stringify(updatedTimeline), req.params.id]
      );

      return res.json({
        success: true,
        case: buildCaseResponse(result.rows[0]),
      });
    } catch (error) {
      console.error("Attach evidence to timeline event error:", error);
      return res.status(500).json({
        success: false,
        error: "Unable to attach evidence to timeline event.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Notifications                                                             */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/notifications",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            id,
            title,
            message,
            time,
            read,
            type,
            case_id AS "caseId"
          FROM notifications
          WHERE user_id = $1
          ORDER BY created_at DESC
          `,
          [req.user?.id]
        );

      return res.json({
        success: true,
        notifications:
          result.rows,
      });
    } catch (error) {
      console.error(
        "Notification retrieval error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to retrieve notifications.",
      });
    }
  }
);

app.patch(
  "/api/notifications/:id/read",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      await pool.query(
        `
        UPDATE notifications
        SET read = TRUE
        WHERE id = $1
          AND user_id = $2
        `,
        [
          req.params.id,
          req.user?.id,
        ]
      );

      return res.json({
        success: true,
      });
    } catch (error) {
      console.error(
        "Notification update error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to update notification.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* AI FORENSIC EVIDENCE ANALYSIS                                              */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/analyze-evidence",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const {
        type,
        content,
        title,
        caseId,
      } = req.body;

      /* Validate */

      if (
        typeof content !==
          "string" ||
        !content.trim()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Evidence content is required.",
        });
      }

      if (
        content.length >
        1000000
      ) {
        return res.status(413).json({
          success: false,
          error:
            "Evidence content is too large.",
        });
      }

      /* SHA-256 */

      const evidenceHash =
        sha256(content);

      /* IOC extraction */

      const indicators =
        extractIndicators(
          content
        );

      /* Entities */

      const entities =
        extractEntities(
          indicators
        );

      /* Heuristic risk */

      const heuristic =
        calculateHeuristicRisk(
          indicators,
          content
        );

      /* Gemini */

      const ai =
        getGenAIClient();

      if (!ai) {
        return res.status(503).json({
          success: false,
          error:
            "Gemini AI is not configured. Add GEMINI_API_KEY to the environment.",
        });
      }

      const prompt = `
You are ForensIQ AI, a digital forensics and cybercrime investigation assistant.

Your role is to assist investigators by analyzing digital evidence.

IMPORTANT:

- Do not invent facts.
- Do not state that something is malicious unless the evidence supports that conclusion.
- Distinguish observed indicators from confirmed findings.
- Treat extracted indicators as potentially relevant, not automatically malicious.
- Provide actionable forensic recommendations.
- Return ONLY valid JSON.

Evidence Type:
${type || "General Digital Evidence"}

Evidence Title:
${title || "Untitled Evidence"}

Evidence SHA-256:
${evidenceHash}

Pre-Analysis Indicator Extraction:
${JSON.stringify(
  indicators,
  null,
  2
)}

Heuristic Risk Score:
${heuristic.score}

Heuristic Risk Reasons:
${JSON.stringify(
  heuristic.reasons
)}

Evidence Content:
"""
${content}
"""

Return exactly this JSON structure:

{
  "riskScore": 0,
  "riskLevel": "Clean",
  "category": "Unknown",
  "confidence": 0,
  "summary": "",
  "keyFindings": [],
  "indicatorsOfCompromise": [],
  "entities": {
    "emails": [],
    "phones": [],
    "ipAddresses": [],
    "urls": [],
    "domains": [],
    "cryptoAddresses": [],
    "hashes": []
  },
  "forensicRecommendations": [],
  "preservationRecommendations": [],
  "recommendedActionForOfficer": "",
  "investigativePriority": "Low"
}

Rules:

riskScore:

- integer from 0 to 100.

riskLevel:

- Critical
- High
- Medium
- Low
- Clean

confidence:

- integer from 0 to 100.
- Represents confidence in the analysis, not guilt.

investigativePriority:

- Critical
- High
- Medium
- Low

keyFindings:

- factual observations supported by the supplied evidence.

indicatorsOfCompromise:

- suspicious technical indicators only.
- Do not automatically classify every IP, URL, email or hash as malicious.

entities:

- preserve useful extracted entities.

forensicRecommendations:

- actionable steps an investigator can take.

preservationRecommendations:

- recommendations for preserving evidence integrity.

recommendedActionForOfficer:

- one concise next action.

The evidence hash supplied above is the authoritative SHA-256 hash generated by the server.
`;

      // Gemini's servers occasionally return 503 "UNAVAILABLE" (high
      // demand). These are transient — retry a few times with backoff,
      // and fall back to a second model if the primary keeps failing.
      const modelsToTry = [
        "gemini-flash-lite-latest",
        "gemini-2.5-flash-lite",
        "gemini-flash-latest",
        "gemini-2.5-flash",
      ];

      let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
      let lastError: any = null;

      outer:
      for (const modelName of modelsToTry) {
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
              },
            });
            lastError = null;
            break outer;
          } catch (err: any) {
            lastError = err;
            const status =
              err?.status ||
              err?.error?.code;
            const isRetryable =
              status === 503 ||
              status === 429 ||
              status === "UNAVAILABLE";

            if (!isRetryable) {
              break outer;
            }

            // Exponential backoff: 500ms, 1000ms, 2000ms
            await new Promise((resolve) =>
              setTimeout(resolve, 500 * Math.pow(2, attempt))
            );
          }
        }
      }

      if (!response) {
        console.error(
          "AI Forensic Analysis Error (all retries/models failed):",
          lastError
        );
        return res.status(503).json({
          success: false,
          error:
            "The Gemini AI service is currently experiencing high demand. Please try again in a moment.",
        });
      }

      const text =
        response.text?.trim();

      if (!text) {
        return res.status(502).json({
          success: false,
          error:
            "The AI service returned an empty analysis.",
        });
      }

      let analysis: any;

      try {
        analysis =
          JSON.parse(text);
      } catch {
        console.error(
          "Invalid JSON returned by Gemini:",
          text
        );

        return res.status(502).json({
          success: false,
          error:
            "The AI service returned an invalid analysis format.",
        });
      }

      /* ------------------------------------------------------------------ */
      /* Normalize AI response                                               */
      /* ------------------------------------------------------------------ */

      const finalRiskScore =
        Math.max(
          0,
          Math.min(
            100,
            Number(
              analysis.riskScore ??
                heuristic.score
            )
          )
        );

      const validRiskLevels = [
        "Critical",
        "High",
        "Medium",
        "Low",
        "Clean",
      ];

      const finalRiskLevel =
        validRiskLevels.includes(
          analysis.riskLevel
        )
          ? analysis.riskLevel
          : heuristic.riskLevel;

      const normalizedAnalysis = {
        riskScore:
          finalRiskScore,

        riskLevel:
          finalRiskLevel,

        category:
          analysis.category ||
          "Unknown",

        confidence:
          Math.max(
            0,
            Math.min(
              100,
              Number(
                analysis.confidence ||
                  0
              )
            )
          ),

        summary:
          analysis.summary ||
          "No summary was generated.",

        keyFindings:
          Array.isArray(
            analysis.keyFindings
          )
            ? analysis.keyFindings
            : [],

        indicatorsOfCompromise:
          Array.isArray(
            analysis.indicatorsOfCompromise
          )
            ? analysis.indicatorsOfCompromise
            : [],

        entities: {
          emails:
            Array.isArray(
              analysis.entities
                ?.emails
            )
              ? analysis.entities
                  .emails
              : entities.emails,

          phones:
            Array.isArray(
              analysis.entities
                ?.phones
            )
              ? analysis.entities
                  .phones
              : entities.phones,

          ipAddresses:
            Array.isArray(
              analysis.entities
                ?.ipAddresses
            )
              ? analysis.entities
                  .ipAddresses
              : entities.ipAddresses,

          urls:
            Array.isArray(
              analysis.entities
                ?.urls
            )
              ? analysis.entities
                  .urls
              : entities.urls,

          domains:
            Array.isArray(
              analysis.entities
                ?.domains
            )
              ? analysis.entities
                  .domains
              : entities.domains,

          cryptoAddresses:
            Array.isArray(
              analysis.entities
                ?.cryptoAddresses
            )
              ? analysis.entities
                  .cryptoAddresses
              : entities.cryptoAddresses,

          hashes:
            Array.isArray(
              analysis.entities
                ?.hashes
            )
              ? analysis.entities
                  .hashes
              : entities.hashes,
        },

        forensicRecommendations:
          Array.isArray(
            analysis.forensicRecommendations
          )
            ? analysis.forensicRecommendations
            : [],

        preservationRecommendations:
          Array.isArray(
            analysis.preservationRecommendations
          )
            ? analysis.preservationRecommendations
            : [],

        recommendedActionForOfficer:
          analysis.recommendedActionForOfficer ||
          "Review the evidence and preserve the original artifact before further analysis.",

        investigativePriority:
          analysis.investigativePriority ||
          finalRiskLevel,
      };

      /* ------------------------------------------------------------------ */
      /* Store analysis                                                       */
      /* ------------------------------------------------------------------ */

      await pool.query(
        `
        INSERT INTO evidence_analyses (
          user_id,
          case_id,
          evidence_type,
          evidence_title,
          content_hash_sha256,
          content_size,
          risk_score,
          risk_level,
          category,
          analysis
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10
        )
        `,
        [
          req.user?.id ||
            null,

          caseId ||
            null,

          type ||
            "General Digital Evidence",

          title ||
            "Untitled Evidence",

          evidenceHash,

          Buffer.byteLength(
            content,
            "utf8"
          ),

          normalizedAnalysis.riskScore,

          normalizedAnalysis.riskLevel,

          normalizedAnalysis.category,

          JSON.stringify(
            normalizedAnalysis
          ),
        ]
      );

      /* ------------------------------------------------------------------ */
      /* Audit log                                                           */
      /* ------------------------------------------------------------------ */

      await pool.query(
        `
        INSERT INTO audit_logs (
          actor,
          role,
          action,
          target,
          ip_address,
          status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6
        )
        `,
        [
          req.user?.name ||
            "Unknown",

          req.user?.role ||
            "victim",

          "Forensic evidence analysis",

          evidenceHash,

          req.ip,

          "Success",
        ]
      );

      return res.json({
        success: true,

        analysis:
          normalizedAnalysis,

        evidenceMetadata: {
          sha256:
            evidenceHash,

          size:
            Buffer.byteLength(
              content,
              "utf8"
            ),

          type:
            type ||
            "General Digital Evidence",

          title:
            title ||
            "Untitled Evidence",

          analyzedAt:
            new Date().toISOString(),
        },

        extractedIndicators:
          indicators,

        heuristicAssessment: {
          score:
            heuristic.score,

          riskLevel:
            heuristic.riskLevel,

          reasons:
            heuristic.reasons,
        },
      });
    } catch (error: any) {
      console.error(
        "AI Forensic Analysis Error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error?.message ||
          "Forensic analysis failed.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Evidence Analysis History                                                  */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/evidence-analyses",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      let result;

      if (
        req.user?.role ===
        "victim"
      ) {
        result =
          await pool.query(
            `
            SELECT
              id,
              case_id AS "caseId",
              evidence_type AS "evidenceType",
              evidence_title AS "evidenceTitle",
              content_hash_sha256 AS "sha256",
              content_size AS "contentSize",
              risk_score AS "riskScore",
              risk_level AS "riskLevel",
              category,
              analysis,
              created_at AS "createdAt"
            FROM evidence_analyses
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [req.user.id]
          );
      } else {
        result =
          await pool.query(`
            SELECT
              id,
              user_id AS "userId",
              case_id AS "caseId",
              evidence_type AS "evidenceType",
              evidence_title AS "evidenceTitle",
              content_hash_sha256 AS "sha256",
              content_size AS "contentSize",
              risk_score AS "riskScore",
              risk_level AS "riskLevel",
              category,
              analysis,
              created_at AS "createdAt"
            FROM evidence_analyses
            ORDER BY created_at DESC
            LIMIT 500
          `);
      }

      return res.json({
        success: true,
        analyses:
          result.rows,
      });
    } catch (error) {
      console.error(
        "Evidence history retrieval error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to retrieve evidence analysis history.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Evidence Hash Verification                                                 */
/* -------------------------------------------------------------------------- */

app.post(
  "/api/evidence/verify-hash",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      const {
        content,
        expectedHash,
      } = req.body;

      if (
        typeof content !==
          "string" ||
        !content
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Evidence content is required.",
        });
      }

      if (
        typeof expectedHash !==
        "string"
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Expected SHA-256 hash is required.",
        });
      }

      const actualHash =
        sha256(content);

      const normalizedExpected =
        expectedHash
          .trim()
          .toLowerCase();

      const matches =
        actualHash ===
        normalizedExpected;

      await pool.query(
        `
        INSERT INTO audit_logs (
          actor,
          role,
          action,
          target,
          ip_address,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          req.user?.name ||
            "Unknown",

          req.user?.role ||
            "victim",

          "Evidence hash verification",

          actualHash,

          req.ip,

          matches
            ? "Success"
            : "Denied",
        ]
      );

      return res.json({
        success: true,

        verified:
          matches,

        expectedHash:
          normalizedExpected,

        actualHash,

        message: matches
          ? "Evidence integrity verified. SHA-256 hashes match."
          : "Evidence integrity verification failed. SHA-256 hashes do not match.",
      });
    } catch (error) {
      console.error(
        "Hash verification error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to verify evidence hash.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Audit Logs                                                                 */
/* -------------------------------------------------------------------------- */

app.get(
  "/api/audit-logs",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res
  ) => {
    try {
      if (
        req.user?.role !==
          "admin" &&
        req.user?.role !==
          "officer"
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Officer or administrator access required.",
        });
      }

      const result =
        await pool.query(`
          SELECT
            id,
            timestamp,
            actor,
            role,
            action,
            target,
            ip_address AS "ipAddress",
            status
          FROM audit_logs
          ORDER BY timestamp DESC
          LIMIT 500
        `);

      return res.json({
        success: true,
        auditLogs:
          result.rows,
      });
    } catch (error) {
      console.error(
        "Audit log retrieval error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to retrieve audit logs.",
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* Vite / Production                                                          */
/* -------------------------------------------------------------------------- */

async function startServer() {
  await initializeDatabase();

  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true,
        },

        appType: "spa",
      });

    app.use(
      vite.middlewares
    );
  } else {
    const distPath =
      path.join(
        process.cwd(),
        "dist"
      );

    app.use(
      express.static(
        distPath
      )
    );

    app.get(
      "*",
      (_req, res) => {
        res.sendFile(
          path.join(
            distPath,
            "index.html"
          )
        );
      }
    );
  }

  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `ForensIQ server running on http://localhost:${PORT}`
      );

      console.log(
        `Default financial currency: ${DEFAULT_CURRENCY} (${DEFAULT_CURRENCY_SYMBOL})`
      );
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Start                                                                      */
/* -------------------------------------------------------------------------- */

startServer().catch(
  (error) => {
    console.error(
      "Failed to start ForensIQ server:",
      error
    );

    process.exit(1);
  }
);