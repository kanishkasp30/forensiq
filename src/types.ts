// ============================================================================
// ForensIQ - Shared Type Definitions
// ============================================================================

/**
 * Supported application roles.
 */
export type UserRole =
  | 'victim'
  | 'officer'
  | 'admin';

/**
 * User account information.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;

  phone?: string;
  govtId?: string;
  address?: string;

  badgeId?: string;
  department?: string;

  avatarUrl?: string;
  isVerified?: boolean;
}

// ============================================================================
// CASE MANAGEMENT
// ============================================================================

/**
 * Case urgency levels.
 */
export type UrgencyLevel =
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low';

/**
 * Current state of a cybercrime case.
 */
export type CaseStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Evidence Verified'
  | 'Escalated'
  | 'In Court'
  | 'Solved'
  | 'Closed';

/**
 * Cybercrime categories supported by ForensIQ.
 */
export type CaseCategory =
  | 'Phishing / Social Engineering'
  | 'Cryptocurrency Scam'
  | 'Ransomware / Extortion'
  | 'Financial & Bank Fraud'
  | 'Identity Theft'
  | 'Cyber Harassment'
  | 'Data Breach';

// ============================================================================
// CHAIN OF CUSTODY
// ============================================================================

/**
 * Individual chain-of-custody event for evidence.
 */
export interface CustodyStep {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  hashMatch: boolean;
  notes?: string;
}

/**
 * Uploaded digital evidence file.
 */
export interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;

  /**
   * SHA-256 integrity hash.
   */
  sha256Hash: string;

  verificationStatus:
    | 'Verified'
    | 'Pending'
    | 'Flagged';

  uploadedBy: string;

  custodyChain: CustodyStep[];

  /**
   * Optional local/server URL for the evidence.
   */
  url?: string;
}

/**
 * Evidence attached to a timeline event.
 */
export interface TimelineEvidence {
  id: string;
  name: string;
  type: string;

  size?: string;
  sha256Hash?: string;
  uploadedAt?: string;
}

// ============================================================================
// CASE TIMELINE
// ============================================================================

/**
 * Timeline event types.
 */
export type CaseTimelineEventType =
  | 'submission'
  | 'verification'
  | 'officer_assigned'
  | 'status_change'
  | 'ai_scan'
  | 'evidence_added'
  | 'sms'
  | 'phishing'
  | 'transaction'
  | 'complaint'
  | 'note'
  | string;

/**
 * Timeline event for a case.
 */
export interface CaseTimelineEvent {
  id: string;

  /**
   * Full ISO timestamp.
   */
  timestamp: string;

  /**
   * Optional human-readable time.
   */
  time?: string;

  title: string;
  description: string;

  type: CaseTimelineEventType;

  actor: string;

  caseId?: string;

  notes?: string[];

  evidenceAttachments?: TimelineEvidence[];
}

// ============================================================================
// AI FORENSIC ANALYSIS
// ============================================================================

/**
 * Risk levels returned by the forensic analysis engine.
 */
export type AIRiskLevel =
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low'
  | 'Clean';

/**
 * AI-generated forensic evidence analysis.
 */
export interface AIAnalysisResult {
  riskScore: number;

  riskLevel: AIRiskLevel;

  category: string;

  /**
   * AI confidence percentage.
   */
  confidence?: number;

  summary: string;

  keyFindings?: string[];

  indicatorsOfCompromise: string[];

  forensicRecommendations: string[];

  preservationRecommendations?: string[];

  /**
   * SHA-256 hash associated with the analyzed evidence.
   */
  evidenceHashSHA256: string;

  recommendedActionForOfficer: string;

  investigativePriority?: AIRiskLevel;
}

// ============================================================================
// SUSPECT INFORMATION
// ============================================================================

/**
 * Information associated with a suspected threat actor.
 */
export interface SuspectInfo {
  name?: string;
  alias?: string;
  contact?: string;

  ipAddress?: string;

  cryptoWallet?: string;

  associatedDomain?: string;

  location?: string;

  paymentDetails?: string;

  threatLevel?:
    | 'Known Syndicate'
    | 'Lone Actor'
    | 'Automated Botnet'
    | 'Under Investigation';

  additionalNotes?: string;
}

// ============================================================================
// FINANCIAL INFORMATION
// ============================================================================

/**
 * Financial information associated with a cybercrime case.
 *
 * IMPORTANT:
 * All monetary amounts are stored as numeric values.
 * The UI should display them using INR / ₹ formatting.
 *
 * Example:
 *   50000
 *
 * Display:
 *   ₹50,000
 */
export interface FinancialDetails {
  hasLoss: boolean;

  /**
   * Amount lost in Indian Rupees (INR).
   */
  lossAmount?: number;

  paymentMethod?: string;

  transactionId?: string;

  transactionDate?: string;

  fraudulentAccount?: string;

  bankName?: string;
}

// ============================================================================
// CASE COMMENTS
// ============================================================================

/**
 * Comment added to a case.
 */
export interface CaseComment {
  id: string;

  author: string;

  role: UserRole;

  timestamp: string;

  text: string;

  /**
   * Internal comments are visible only to authorized
   * investigation personnel.
   */
  isInternal: boolean;
}

// ============================================================================
// CASE
// ============================================================================

/**
 * Complete cybercrime case representation.
 */
export interface CaseItem {
  id: string;

  title: string;

  category: CaseCategory;

  urgency: UrgencyLevel;

  status: CaseStatus;

  // --------------------------------------------------------------------------
  // Victim information
  // --------------------------------------------------------------------------

  victimName: string;

  victimContact: string;

  victimGovtId?: string;

  victimAddress?: string;

  // --------------------------------------------------------------------------
  // Incident information
  // --------------------------------------------------------------------------

  incidentLocation?: string;

  incidentDate?: string;

  reportedDate: string;

  // --------------------------------------------------------------------------
  // Investigation
  // --------------------------------------------------------------------------

  assignedOfficer: string;

  description: string;

  // --------------------------------------------------------------------------
  // Financial information
  // --------------------------------------------------------------------------

  /**
   * Financial loss in Indian Rupees (INR).
   */
  lossAmount?: number;

  financialDetails?: FinancialDetails;

  // --------------------------------------------------------------------------
  // Evidence
  // --------------------------------------------------------------------------

  evidenceFiles: EvidenceFile[];

  // --------------------------------------------------------------------------
  // Investigation timeline
  // --------------------------------------------------------------------------

  timeline: CaseTimelineEvent[];

  // --------------------------------------------------------------------------
  // AI analysis
  // --------------------------------------------------------------------------

  aiAnalysis?: AIAnalysisResult;

  // --------------------------------------------------------------------------
  // Suspect
  // --------------------------------------------------------------------------

  suspectInfo?: SuspectInfo;

  // --------------------------------------------------------------------------
  // Comments
  // --------------------------------------------------------------------------

  comments: CaseComment[];
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Notification types.
 */
export type NotificationType =
  | 'alert'
  | 'case_update'
  | 'ai_flag'
  | 'system';

/**
 * Application notification.
 */
export interface NotificationItem {
  id: string;

  title: string;

  message: string;

  time: string;

  read: boolean;

  type: NotificationType;

  caseId?: string;
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

/**
 * Audit log status.
 */
export type AuditLogStatus =
  | 'Success'
  | 'Denied'
  | 'Flagged';

/**
 * Security/audit event.
 */
export interface AuditLogItem {
  id: string;

  timestamp: string;

  actor: string;

  role: UserRole;

  action: string;

  target: string;

  ipAddress: string;

  status: AuditLogStatus;
}

// ============================================================================
// THREAT INTELLIGENCE FEED
// ============================================================================

/**
 * Threat intelligence feed item.
 */
export interface ThreatFeedItem {
  id: string;

  title: string;

  type: string;

  sourceIp: string;

  targetSector: string;

  threatLevel:
    | 'Critical'
    | 'High'
    | 'Medium';

  timestamp: string;

  status: string;
}

// ============================================================================
// CURRENCY / LOCALIZATION
// ============================================================================

/**
 * ForensIQ uses Indian Rupees (INR) for all
 * financial amounts displayed in the application.
 */
export const CURRENCY_CODE = 'INR';

/**
 * Indian currency symbol.
 */
export const CURRENCY_SYMBOL = '₹';

/**
 * Format a numeric amount as Indian Rupees.
 *
 * Example:
 *   formatINR(50000)
 *   => ₹50,000
 *
 *   formatINR(1250000)
 *   => ₹12,50,000
 */
export function formatINR(
  amount: number | null | undefined
): string {
  if (
    amount === null ||
    amount === undefined ||
    Number.isNaN(Number(amount))
  ) {
    return '₹0';
  }

  return new Intl.NumberFormat(
    'en-IN',
    {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }
  ).format(Number(amount));
}

/**
 * Format an amount without decimals.
 *
 * Example:
 *   formatINRCompact(50000)
 *   => ₹50,000
 */
export function formatINRCompact(
  amount: number | null | undefined
): string {
  if (
    amount === null ||
    amount === undefined ||
    Number.isNaN(Number(amount))
  ) {
    return '₹0';
  }

  return `₹${Number(amount).toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 0,
    }
  )}`;
}

/**
 * Parse an INR amount entered by the user.
 *
 * Supports values such as:
 *   "₹50,000"
 *   "50,000"
 *   "50000"
 *   "₹1,25,000"
 */
export function parseINR(
  value: string | number
): number {
  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  const cleaned = value
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .trim();

  const parsed = Number(cleaned);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}