export type UserRole = 'qari' | 'parent' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QariProfile {
  id?: string;
  qariId: string;
  fullName: string;
  title: string;
  bio: string;
  country: string;
  city?: string;
  contactNumber?: string;
  subjects?: string[];
  classesGrades?: string[];
  languages: string[];
  experienceYears: number;
  hasSanad: boolean;
  sanadDetails?: string;
  qualifications: string;
  tajweedSpecialization: string;
  hourlyFee: number;
  monthlyFee: number;
  currency?: string;
  preferredAgeGroups: string[];
  availability: string;
  avatarUrl?: string;
  videoIntroUrl?: string;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParentProfile {
  id?: string;
  parentId: string;
  parentName: string;
  country: string;
  city?: string;
  preferredLanguage: string;
  timezone?: string;
  childrenNames?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningRequirement {
  id: string;
  parentId: string;
  parentName: string;
  studentName: string;
  studentAge: number;
  studentGender: 'male' | 'female' | 'any';
  currentLevel: string; // e.g. "Noorani Qaida", "Basic Nazra", "Hifz", "Advanced Tajweed"
  goals: string[]; // e.g. ["Makharij Correctness", "Tajweed Rules", "Hifz Memorization", "Fluent Recitation"]
  country: string;
  preferredLanguage: string;
  preferredTiming: string;
  weeklyFrequency: number; // e.g. 3 classes/week
  monthlyBudget: number;
  currency?: string;
  notes?: string;
  status: 'open' | 'matched' | 'closed';
  proposalsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  requirementId: string;
  qariId: string;
  qariName: string;
  parentId: string;
  proposedMonthlyFee: number;
  currency?: string;
  hoursPerWeek: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  teacherProfile?: Partial<QariProfile>;
}

export interface Conversation {
  id: string;
  parentId: string;
  parentName: string;
  qariId: string;
  qariName: string;
  participantIds: string[];
  requirementId?: string;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface Agreement {
  id: string;
  requirementId?: string;
  proposalId?: string;
  parentId: string;
  parentName: string;
  qariId: string;
  qariName: string;
  studentName: string;
  subject: string;
  monthlyFee: number;
  agreedFirstFee?: number;
  currency?: string;
  hoursPerWeek: number;
  platformCommissionRate: number; // 0.15 (15% one-time on first month only)
  platformCommissionAmount: number; // 15% of first month fee
  teacherPayoutAmount: number; // 85% of first month fee
  isOneTimeFirstMonthCommission?: boolean; // true - one-time fee on first month only
  subsequentRecurringCommissionRate?: number; // 0.00 (0% on months 2+)
  paymentStatus?: 'Pending' | 'Paid' | 'Processing' | string;
  paymentSummary?: AgreementPaymentSummary;
  status: 'pending' | 'accepted' | 'completed' | 'active' | 'cancelled';
  startDate: string;
  notes?: string;
  proposalMessage?: string;
  requirementDetails?: {
    studentName?: string;
    currentLevel?: string;
    goals?: string[];
    schedule?: string;
    preferredLanguage?: string;
    country?: string;
    learningNeeds?: string;
  };
  bothAgreedConfirmation?: {
    agreedAt: string;
    parentConfirmed: boolean;
    teacherConfirmed: boolean;
    confirmationText: string;
  };
  createdAt: string;
}

export interface AgreementPaymentSummary {
  agreedFirstFee: number;
  commissionRate: number; // 0.15 (15% one-time)
  commissionAmount: number; // 15% of first month fee
  teacherReceivesAmount: number; // 85% of first month fee (100% on subsequent months)
  isOneTimeOnly?: boolean; // true
  paymentStatus: 'Pending' | 'Paid' | 'Processing';
  currency?: string;
}

export interface TransactionRecord {
  id: string;
  agreementId: string;
  parentId: string;
  qariId: string;
  grossAmount: number;
  commissionRate: number; // 0.20
  commissionAmount: number;
  netTeacherAmount: number;
  currency: string;
  paymentStatus: 'simulated_pending' | 'simulated_settled';
  createdAt: string;
}

export interface LessonSession {
  id?: string;
  sessionId: string;
  agreementId?: string;
  qariId: string;
  qariName: string;
  parentId: string;
  parentName: string;
  studentName: string;
  sessionType: 'trial' | 'regular';
  date: string;
  time: string;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
  tajweedFocus?: string;
  teacherNotes?: string;
  studentHomework?: string;
  parentRating?: number;
  parentFeedback?: string;
  createdAt: string;
}
