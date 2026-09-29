import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  UserRole,
  User,
  CaseItem,
  CaseTimelineEvent,
  CaseStatus,
  EvidenceFile,
  NotificationItem,
  AuditLogItem,
  ThreatFeedItem,
  AIAnalysisResult,
} from '../types';

/* -------------------------------------------------------------------------- */
/* API TYPES                                                                  */
/* -------------------------------------------------------------------------- */

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: T;
  cases?: CaseItem[];
  case?: CaseItem;
  notifications?: NotificationItem[];
  auditLogs?: AuditLogItem[];
  analyses?: unknown[];
  analysis?: AIAnalysisResult;
}

/* -------------------------------------------------------------------------- */
/* CONTEXT TYPE                                                               */
/* -------------------------------------------------------------------------- */

type NewCaseInput = Omit<CaseItem, 'id' | 'reportedDate' | 'status' | 'timeline' | 'comments' | 'evidenceFiles'> & {
  initialEvidence?: EvidenceFile[];
};

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  switchRole: (role: UserRole) => void;
  registerUser: (userData: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; message: string }>;
  loginUser: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => Promise<void>;
  isAuthenticated: boolean;
  cases: CaseItem[];
  addCase: (newCaseData: NewCaseInput) => Promise<CaseItem>;
  updateCaseStatus: (caseId: string, status: CaseStatus, commentText?: string) => Promise<void>;
  addEvidenceToCase: (caseId: string, file: EvidenceFile) => Promise<void>;
  addCommentToCase: (caseId: string, text: string, isInternal: boolean) => Promise<void>;
  assignOfficerToCase: (caseId: string, officerName: string) => Promise<void>;
  addTimelineEventToCase: (caseId: string, eventData: Omit<CaseTimelineEvent, 'id'>) => Promise<void>;
updateTimelineEventInCase: (caseId: string, eventId: string, updatedFields: Partial<CaseTimelineEvent>) => Promise<void>;
deleteTimelineEventFromCase: (caseId: string, eventId: string) => Promise<void>;
addNoteToTimelineEvent: (caseId: string, eventId: string, noteText: string) => Promise<void>;
attachEvidenceToTimelineEvent: (
  caseId: string,
  eventId: string,
  evidence: { name: string; type: string; size?: string; sha256Hash?: string }
) => Promise<void>;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => void;
  auditLogs: AuditLogItem[];
  threatFeed: ThreatFeedItem[];
  analyzeEvidenceAI: (content: string, type?: string, title?: string) => Promise<AIAnalysisResult>;
}

/* -------------------------------------------------------------------------- */
/* CONTEXT                                                                    */
/* -------------------------------------------------------------------------- */

const AppContext = createContext<AppContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/* STORAGE KEYS                                                               */
/* -------------------------------------------------------------------------- */

const TOKEN_STORAGE_KEY = 'forensiq_auth_token';
const SESSION_STORAGE_KEY = 'forensiq_session';

/* -------------------------------------------------------------------------- */
/* API HELPER                                                                 */
/* -------------------------------------------------------------------------- */

const apiRequest = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}.`);
  }

  return data as T;
};

/* -------------------------------------------------------------------------- */
/* SESSION HELPERS                                                            */
/* -------------------------------------------------------------------------- */

const getStoredSession = (): User | null => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const saveSession = (user: User) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

/* -------------------------------------------------------------------------- */
/* ID / TIMESTAMP HELPERS                                                     */
/* -------------------------------------------------------------------------- */

const generateId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const getTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
};

/* -------------------------------------------------------------------------- */
/* NORMALIZE USER                                                             */
/* -------------------------------------------------------------------------- */

const normalizeUser = (user: any): User => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? undefined,
    govtId: user.govtId ?? user.govt_id ?? undefined,
    address: user.address ?? undefined,
    badgeId: user.badgeId ?? user.badge_id ?? undefined,
    department: user.department ?? undefined,
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? undefined,
    isVerified: user.isVerified ?? user.is_verified ?? false,
  };
};

/* -------------------------------------------------------------------------- */
/* NORMALIZE CASE                                                             */
/* -------------------------------------------------------------------------- */

const normalizeCase = (row: any): CaseItem => {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    urgency: row.urgency,
    status: row.status,
    victimName: row.victimName ?? row.victim_name ?? '',
    victimContact: row.victimContact ?? row.victim_contact ?? '',
    victimGovtId: row.victimGovtId ?? row.victim_govt_id ?? undefined,
    victimAddress: row.victimAddress ?? row.victim_address ?? undefined,
    incidentLocation: row.incidentLocation ?? row.incident_location ?? undefined,
    incidentDate: row.incidentDate ?? row.incident_date ?? undefined,
    reportedDate: row.reportedDate ?? row.reported_date ?? '',
    assignedOfficer: row.assignedOfficer ?? row.assigned_officer ?? 'Pending Assignment',
    description: row.description ?? '',
    lossAmount: row.lossAmount !== undefined && row.lossAmount !== null ? Number(row.lossAmount) : undefined,
    financialDetails: row.financialDetails ?? row.financial_details ?? undefined,
    evidenceFiles: Array.isArray(row.evidenceFiles ?? row.evidence_files) ? (row.evidenceFiles ?? row.evidence_files) : [],
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    aiAnalysis: row.aiAnalysis ?? row.ai_analysis ?? undefined,
    suspectInfo: row.suspectInfo ?? row.suspect_info ?? undefined,
    comments: Array.isArray(row.comments) ? row.comments : [],
  };
};

/* -------------------------------------------------------------------------- */
/* PROVIDER                                                                   */
/* -------------------------------------------------------------------------- */

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredSession());

  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    const session = getStoredSession();
    return session?.role ?? null;
  });

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [threatFeed] = useState<ThreatFeedItem[]>([]);

  const isAuthenticated = currentUser !== null;

  /* ---------------------------------------------------------------------- */
  /* SWITCH ROLE                                                            */
  /* ---------------------------------------------------------------------- */

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    if (currentUser.role !== role) return;
    setCurrentRole(role);
  };

  /* ---------------------------------------------------------------------- */
  /* LOAD CURRENT USER                                                      */
  /* ---------------------------------------------------------------------- */

  const loadCurrentUser = async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return;

    try {
      const data = await apiRequest<ApiResponse<User>>('/api/auth/me');
      if (!data.user) throw new Error('No user returned by server.');

      const user = normalizeUser(data.user);
      setCurrentUser(user);
      setCurrentRole(user.role);
      saveSession(user);
    } catch (error) {
      console.warn('Session validation failed:', error);
      clearSession();
      setCurrentUser(null);
      setCurrentRole(null);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* LOAD CASES                                                             */
  /* ---------------------------------------------------------------------- */

  const loadCases = async () => {
    try {
      const data = await apiRequest<ApiResponse>('/api/cases');
      const serverCases = Array.isArray(data.cases) ? data.cases.map(normalizeCase) : [];
      setCases(serverCases);
    } catch (error) {
      console.warn('Unable to load cases:', error);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* LOAD NOTIFICATIONS                                                     */
  /* ---------------------------------------------------------------------- */

  const loadNotifications = async () => {
    try {
      const data = await apiRequest<ApiResponse>('/api/notifications');
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (error) {
      console.warn('Unable to load notifications:', error);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* LOAD AUDIT LOGS                                                        */
  /* ---------------------------------------------------------------------- */

  const loadAuditLogs = async () => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'officer')) {
      return;
    }

    try {
      const data = await apiRequest<ApiResponse>('/api/audit-logs');
      setAuditLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
    } catch (error) {
      console.warn('Unable to load audit logs:', error);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* INITIAL SESSION VALIDATION                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      loadCurrentUser();
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* LOAD SERVER DATA AFTER LOGIN                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!currentUser) {
      setCases([]);
      setNotifications([]);
      setAuditLogs([]);
      return;
    }

    loadCases();
    loadNotifications();
    loadAuditLogs();
  }, [currentUser]);

  /* ---------------------------------------------------------------------- */
  /* REGISTER USER                                                          */
  /* ---------------------------------------------------------------------- */

  const registerUser = async (
    userData: Omit<User, 'id'> & { password: string }
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!userData.name?.trim()) {
        return { success: false, message: 'Full name is required.' };
      }
      if (!userData.email?.trim()) {
        return { success: false, message: 'Email address is required.' };
      }
      if (!userData.password || userData.password.length < 8) {
        return { success: false, message: 'Password must contain at least 8 characters.' };
      }
      if (!userData.phone?.trim()) {
        return { success: false, message: 'Mobile number is required.' };
      }
      if (!userData.address?.trim()) {
        return { success: false, message: 'City / State is required.' };
      }
      if (userData.role !== 'victim' && (!userData.badgeId?.trim() || !userData.department?.trim())) {
        return { success: false, message: 'Official ID and department are required for this account type.' };
      }

      const data = await apiRequest<ApiResponse<User>>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name.trim(),
          email: userData.email.trim().toLowerCase(),
          phone: userData.phone?.trim(),
          address: userData.address?.trim(),
          role: userData.role,
          badgeId: userData.badgeId?.trim(),
          department: userData.department?.trim(),
          govtId: userData.govtId?.trim(),
          avatarUrl: userData.avatarUrl,
          password: userData.password,
        }),
      });

      if (!data.user) {
        return { success: false, message: 'Registration succeeded but no user account was returned.' };
      }

      const registeredUser = normalizeUser(data.user);

      if (data.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      }

      setCurrentUser(registeredUser);
      setCurrentRole(registeredUser.role);
      saveSession(registeredUser);

      return { success: true, message: data.message || 'Account created successfully.' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, message: error?.message || 'Unable to create the account. Please try again.' };
    }
  };

  /* ---------------------------------------------------------------------- */
  /* LOGIN USER                                                             */
  /* ---------------------------------------------------------------------- */

  const loginUser = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!email.trim()) {
        return { success: false, message: 'Email address is required.' };
      }
      if (!password) {
        return { success: false, message: 'Password is required.' };
      }

      const data = await apiRequest<ApiResponse<User>>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, role }),
      });

      if (!data.user) {
        return { success: false, message: 'Login succeeded but no user account was returned.' };
      }

      if (data.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      }

      const authenticatedUser = normalizeUser(data.user);
      setCurrentUser(authenticatedUser);
      setCurrentRole(authenticatedUser.role);
      saveSession(authenticatedUser);

      return { success: true, message: data.message || 'Login successful.' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error?.message || 'Unable to complete login.' };
    }
  };

  /* ---------------------------------------------------------------------- */
  /* LOGOUT                                                                 */
  /* ---------------------------------------------------------------------- */

  const logoutUser = async () => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        try {
          await apiRequest('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.warn('Server logout failed:', error);
        }
      }
    } finally {
      clearSession();
      setCurrentUser(null);
      setCurrentRole(null);
      setCases([]);
      setNotifications([]);
      setAuditLogs([]);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* ADD CASE                                                               */
  /* ---------------------------------------------------------------------- */

  const addCase = async (newCaseData: NewCaseInput): Promise<CaseItem> => {
    try {
      const data = await apiRequest<ApiResponse>('/api/cases', {
        method: 'POST',
        body: JSON.stringify({
          title: newCaseData.title,
          category: newCaseData.category,
          urgency: newCaseData.urgency || 'Medium',
          victimName: newCaseData.victimName || currentUser?.name || '',
          victimContact: newCaseData.victimContact || currentUser?.email || '',
          victimGovtId: newCaseData.victimGovtId,
          victimAddress: newCaseData.victimAddress,
          incidentLocation: newCaseData.incidentLocation,
          incidentDate: newCaseData.incidentDate,
          assignedOfficer: newCaseData.assignedOfficer || 'Pending Assignment',
          description: newCaseData.description,
          lossAmount: newCaseData.lossAmount ?? 0,
          financialDetails: newCaseData.financialDetails,
          evidenceFiles: newCaseData.initialEvidence || [],
          timeline: [],
          aiAnalysis: newCaseData.aiAnalysis,
          suspectInfo: newCaseData.suspectInfo,
          comments: [],
        }),
      });

      if (!data.case) {
        throw new Error('Server did not return the created case.');
      }

      const createdCase = normalizeCase(data.case);

      setCases(prev => [createdCase, ...prev.filter(c => c.id !== createdCase.id)]);

      await loadNotifications();

      return createdCase;
    } catch (error) {
      console.error('Case creation error:', error);
      throw error;
    }
  };

  /* ---------------------------------------------------------------------- */
  /* UPDATE CASE STATUS                                                     */
  /* ---------------------------------------------------------------------- */

  const updateCaseStatus = async (caseId: string, newStatus: CaseStatus, commentText?: string) => {
    try {
      const data = await apiRequest<ApiResponse>(`/api/cases/${caseId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, commentText }),
      });

      if (!data.success || !data.case) {
        console.error('Failed to update case status:', data.error);
        return;
      }

      const updatedCase = normalizeCase(data.case);
      setCases(prev => prev.map(c => (c.id === caseId ? updatedCase : c)));
    } catch (error) {
      console.error('Update case status error:', error);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* ADD EVIDENCE                                                           */
  /* ---------------------------------------------------------------------- */

  const addEvidenceToCase = async (caseId: string, file: EvidenceFile) => {
  try {
    const data = await apiRequest<ApiResponse>(`/api/cases/${caseId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(file),
    });

    if (!data.success || !data.case) {
      console.error('Failed to add evidence:', data.error);
      return;
    }

    const updatedCase = normalizeCase(data.case);
    setCases(prev => prev.map(c => (c.id === caseId ? updatedCase : c)));
  } catch (error) {
    console.error('Add evidence error:', error);
  }
};

  /* ---------------------------------------------------------------------- */
  /* ADD COMMENT                                                            */
  /* ---------------------------------------------------------------------- */

  const addCommentToCase = async (caseId: string, text: string, isInternal: boolean) => {
  if (!text.trim()) return;

  try {
    const data = await apiRequest<ApiResponse>(`/api/cases/${caseId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text: text.trim(), isInternal }),
    });

    if (!data.success || !data.case) {
      console.error('Failed to add comment:', data.error);
      return;
    }

    const updatedCase = normalizeCase(data.case);
    setCases(prev => prev.map(c => (c.id === caseId ? updatedCase : c)));
  } catch (error) {
    console.error('Add comment error:', error);
  }
};

  /* ---------------------------------------------------------------------- */
  /* ASSIGN OFFICER                                                         */
  /* ---------------------------------------------------------------------- */

  const assignOfficerToCase = async (caseId: string, officerName: string) => {
  try {
    const data = await apiRequest<ApiResponse>(`/api/cases/${caseId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ officerName }),
    });

    if (!data.success || !data.case) {
      console.error('Failed to assign officer:', data.error);
      return;
    }

    const updatedCase = normalizeCase(data.case);
    setCases(prev => prev.map(c => (c.id === caseId ? updatedCase : c)));
  } catch (error) {
    console.error('Assign officer error:', error);
  }
};

  /* ---------------------------------------------------------------------- */
  /* ADD TIMELINE EVENT                                                     */
  /* ---------------------------------------------------------------------- */

  const addTimelineEventToCase = async (caseId: string, eventData: Omit<CaseTimelineEvent, 'id'>) => {
  try {
    const data = await apiRequest<ApiResponse>(`/api/cases/${caseId}/timeline`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });

    if (!data.success || !data.case) {
      console.error('Failed to add timeline event:', data.error);
      return;
    }

    const updatedCase = normalizeCase(data.case);
    setCases(prev => prev.map(c => (c.id === caseId ? updatedCase : c)));
  } catch (error) {
    console.error('Add timeline event error:', error);
  }
};

const updateTimelineEventInCase = async (
  caseId: string,
  eventId: string,
  updatedFields: Partial<CaseTimelineEvent>
) => {
  try {
    const data = await apiRequest<ApiResponse>(`/api/cases/${caseId}/timeline/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(updatedFields),
    });

    if (!data.success || !data.case) {
      console.error('Failed to update timeline event:', data.error);
      return;
    }

    const updatedCase = normalizeCase(data.case);
    setCases(prev => prev.map(c => (c.id === caseId ? updatedCase : c)));
  } catch (error) {
    console.error('Update timeline event error:', error);
  }
};

const deleteTimelineEventFromCase = async (caseId: string, eventId: string) => {
  try {
    const data = await apiRequest<ApiResponse>(`/api/cases/${caseId}/timeline/${eventId}`, {
      method: 'DELETE',
    });

    if (!data.success || !data.case) {
      console.error('Failed to delete timeline event:', data.error);
      return;
    }

    const updatedCase = normalizeCase(data.case);
    setCases(prev => prev.map(c => (c.id === caseId ? updatedCase : c)));
  } catch (error) {
    console.error('Delete timeline event error:', error);
  }
};

const addNoteToTimelineEvent = async (caseId: string, eventId: string, noteText: string) => {
  if (!noteText.trim()) return;

  try {
    const data = await apiRequest<ApiResponse>(`/api/cases/${caseId}/timeline/${eventId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ noteText: noteText.trim() }),
    });

    if (!data.success || !data.case) {
      console.error('Failed to add timeline note:', data.error);
      return;
    }

    const updatedCase = normalizeCase(data.case);
    setCases(prev => prev.map(c => (c.id === caseId ? updatedCase : c)));
  } catch (error) {
    console.error('Add timeline note error:', error);
  }
};

const attachEvidenceToTimelineEvent = async (
  caseId: string,
  eventId: string,
  evidence: { name: string; type: string; size?: string; sha256Hash?: string }
) => {
  try {
    const data = await apiRequest<ApiResponse>(`/api/cases/${caseId}/timeline/${eventId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(evidence),
    });

    if (!data.success || !data.case) {
      console.error('Failed to attach evidence to timeline event:', data.error);
      return;
    }

    const updatedCase = normalizeCase(data.case);
    setCases(prev => prev.map(c => (c.id === caseId ? updatedCase : c)));
  } catch (error) {
    console.error('Attach evidence to timeline event error:', error);
  }
};


  /* ---------------------------------------------------------------------- */
  /* MARK NOTIFICATION READ                                                 */
  /* ---------------------------------------------------------------------- */

  const markNotificationRead = async (id: string) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Notification update error:', error);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  /* ---------------------------------------------------------------------- */
  /* MARK ALL NOTIFICATIONS READ                                            */
  /* ---------------------------------------------------------------------- */

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  /* ---------------------------------------------------------------------- */
  /* AI FORENSIC ANALYSIS                                                   */
  /* ---------------------------------------------------------------------- */

  const analyzeEvidenceAI = async (
    content: string,
    type?: string,
    title?: string
  ): Promise<AIAnalysisResult> => {
    if (!content || !content.trim()) {
      throw new Error('Evidence content is required for AI analysis.');
    }

    try {
      const data = await apiRequest<ApiResponse>('/api/analyze-evidence', {
        method: 'POST',
        body: JSON.stringify({
          content,
          type: type || 'Digital Evidence',
          title: title || 'Forensic Evidence Artifact',
        }),
      });

      if (!data.analysis) {
        throw new Error('The AI server returned no analysis result.');
      }

      return data.analysis;
    } catch (error: any) {
      console.error('Gemini AI analysis failed:', error);
      throw new Error(error?.message || 'Forensic AI analysis failed. Please try again.');
    }
  };

  /* ---------------------------------------------------------------------- */
  /* PROVIDER VALUE                                                         */
  /* ---------------------------------------------------------------------- */

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentUser,
        switchRole,
        registerUser,
        loginUser,
        logoutUser,
        isAuthenticated,
        cases,
        addCase,
        updateCaseStatus,
        addEvidenceToCase,
        addCommentToCase,
        assignOfficerToCase,
        addTimelineEventToCase,
        updateTimelineEventInCase,
        deleteTimelineEventFromCase,
        addNoteToTimelineEvent,
        attachEvidenceToTimelineEvent,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        auditLogs,
        threatFeed,
        analyzeEvidenceAI,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/* USE APP                                                                    */
/* -------------------------------------------------------------------------- */

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};