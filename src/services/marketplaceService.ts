import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Agreement,
  Conversation,
  LearningRequirement,
  Message,
  ParentProfile,
  Proposal,
  QariProfile,
  TransactionRecord,
  LessonSession,
} from '../types';
import { formatCurrency, COMMISSION_RATE } from '../data/currencies';

/* ================================================================
   1. QARI PROFILES (Persistent Firestore: /qari_profiles/{qariId})
================================================================ */
export async function fetchQariProfiles(): Promise<QariProfile[]> {
  try {
    const qariCol = collection(db, 'qari_profiles');
    const snapshot = await getDocs(qariCol);
    const profiles: QariProfile[] = [];

    snapshot.forEach((docSnap) => {
      profiles.push({ id: docSnap.id, ...(docSnap.data() as QariProfile) });
    });

    return profiles;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'qari_profiles');
  }
}

export async function fetchQariProfileById(qariId: string): Promise<QariProfile | null> {
  try {
    const docRef = doc(db, 'qari_profiles', qariId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as QariProfile) };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `qari_profiles/${qariId}`);
  }
}

export async function saveQariProfileDirect(profile: QariProfile): Promise<void> {
  try {
    const docRef = doc(db, 'qari_profiles', profile.qariId);
    await setDoc(docRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `qari_profiles/${profile.qariId}`);
  }
}

/* ================================================================
   2. PARENT PROFILES (Persistent Firestore: /parent_profiles/{parentId})
================================================================ */
export async function fetchParentProfile(parentId: string): Promise<ParentProfile | null> {
  try {
    const docRef = doc(db, 'parent_profiles', parentId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as ParentProfile) };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `parent_profiles/${parentId}`);
  }
}

export async function saveParentProfileDirect(profile: ParentProfile): Promise<void> {
  try {
    const docRef = doc(db, 'parent_profiles', profile.parentId);
    await setDoc(docRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `parent_profiles/${profile.parentId}`);
  }
}

/* ================================================================
   3. PARENT REQUIREMENTS (Persistent Firestore: /requirements/{id})
================================================================ */
export async function createLearningRequirement(
  req: Omit<LearningRequirement, 'id' | 'createdAt' | 'updatedAt' | 'proposalsCount'>
): Promise<LearningRequirement> {
  const reqId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newReq: LearningRequirement = {
    ...req,
    id: reqId,
    proposalsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const reqRef = doc(db, 'requirements', reqId);
    await setDoc(reqRef, newReq);
    return newReq;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `requirements/${reqId}`);
  }
}

export async function fetchAllRequirements(): Promise<LearningRequirement[]> {
  try {
    const reqCol = collection(db, 'requirements');
    const snapshot = await getDocs(reqCol);
    const list: LearningRequirement[] = [];

    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as LearningRequirement);
    });

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'requirements');
  }
}

export function subscribeToRequirements(
  onUpdate: (requirements: LearningRequirement[]) => void
): Unsubscribe {
  const reqCol = collection(db, 'requirements');
  return onSnapshot(
    reqCol,
    (snapshot) => {
      const list: LearningRequirement[] = [];
      snapshot.forEach((d) => list.push(d.data() as LearningRequirement));
      const sorted = list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onUpdate(sorted);
    },
    (err) => console.error('Real-time requirements error:', err)
  );
}

/* ================================================================
   4. PROPOSALS (Persistent Firestore: /proposals/{proposalId})
================================================================ */
export async function submitProposal(
  proposal: Omit<Proposal, 'id' | 'createdAt' | 'status'>
): Promise<Proposal> {
  const proposalId = 'prop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newProposal: Proposal = {
    ...proposal,
    id: proposalId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    const propRef = doc(db, 'proposals', proposalId);
    await setDoc(propRef, newProposal);

    // Increment proposalsCount on parent requirement document in Firestore
    try {
      const reqRef = doc(db, 'requirements', proposal.requirementId);
      const snap = await getDoc(reqRef);
      if (snap.exists()) {
        const count = (snap.data().proposalsCount || 0) + 1;
        await setDoc(
          reqRef,
          { proposalsCount: count, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      }
    } catch {
      // Continue even if count update has delay
    }

    return newProposal;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `proposals/${proposalId}`);
  }
}

export async function fetchProposalsForRequirement(requirementId: string): Promise<Proposal[]> {
  try {
    const propCol = collection(db, 'proposals');
    const q = query(propCol, where('requirementId', '==', requirementId));
    const snapshot = await getDocs(q);
    const list: Proposal[] = [];
    snapshot.forEach((d) => list.push(d.data() as Proposal));

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    try {
      const propCol = collection(db, 'proposals');
      const snapshot = await getDocs(propCol);
      const list: Proposal[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Proposal;
        if (data.requirementId === requirementId) list.push(data);
      });
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err2) {
      handleFirestoreError(error, OperationType.LIST, 'proposals');
    }
  }
}

export async function fetchAllProposals(): Promise<Proposal[]> {
  try {
    const propCol = collection(db, 'proposals');
    const snapshot = await getDocs(propCol);
    const list: Proposal[] = [];

    snapshot.forEach((d) => {
      list.push(d.data() as Proposal);
    });

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'proposals');
  }
}

export function subscribeToAllProposals(
  onUpdate: (proposals: Proposal[]) => void
): Unsubscribe {
  const propCol = collection(db, 'proposals');
  return onSnapshot(
    propCol,
    (snapshot) => {
      const list: Proposal[] = [];
      snapshot.forEach((d) => list.push(d.data() as Proposal));
      const sorted = list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onUpdate(sorted);
    },
    (err) => console.error('Real-time proposals listener error:', err)
  );
}

export async function updateProposalStatus(
  proposalId: string,
  status: 'pending' | 'accepted' | 'declined'
): Promise<void> {
  try {
    const docRef = doc(db, 'proposals', proposalId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `proposals/${proposalId}`);
  }
}

export async function fetchProposalsForUser(userId: string): Promise<Proposal[]> {
  try {
    const propCol = collection(db, 'proposals');
    const snapshot = await getDocs(propCol);
    const list: Proposal[] = [];

    snapshot.forEach((d) => {
      const data = d.data() as Proposal;
      if (data.qariId === userId || data.parentId === userId) {
        list.push(data);
      }
    });

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'proposals');
  }
}

/* ================================================================
   5. AGREEMENTS & 20% COMMISSION (Persistent Firestore: /agreements)
================================================================ */
export async function createTeachingAgreement(params: {
  requirementId?: string;
  proposalId?: string;
  parentId: string;
  parentName: string;
  qariId: string;
  qariName: string;
  studentName: string;
  subject: string;
  monthlyFee: number;
  currency?: string;
  hoursPerWeek: number;
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
  status?: 'pending' | 'accepted' | 'completed' | 'active' | 'cancelled';
}): Promise<{ agreement: Agreement; transaction: TransactionRecord }> {
  const agreementId = 'agr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const transactionId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  // Business Model Commission Calculation (15% QariConnect One-Time Commission / 85% Teacher Direct Payout on Month 1, 100% on Month 2+):
  // When an agreement is confirmed, calculate:
  // - Agreed monthly fee
  // - QariConnect one-time commission: 15% on first month's student fee only
  // - Teacher receives: 85% of first month's fee, and 100% of recurring months
  // - Payment status: Pending
  const currency = params.currency || 'USD';
  const commissionRate = COMMISSION_RATE;
  const platformCommissionAmount = Number((params.monthlyFee * COMMISSION_RATE).toFixed(2));
  const teacherPayoutAmount = Number((params.monthlyFee * (1 - COMMISSION_RATE)).toFixed(2));

  const status = params.status || 'accepted';

  const bothAgreedConfirmation = params.bothAgreedConfirmation || {
    agreedAt: new Date().toISOString(),
    parentConfirmed: true,
    teacherConfirmed: true,
    confirmationText: `Formal Agreement Confirmed: Both ${params.parentName} (Parent) and ${params.qariName} (Teacher) have agreed to the teaching terms and tuition fee of ${formatCurrency(params.monthlyFee, currency)}.`,
  };

  const agreement: Agreement = {
    id: agreementId,
    requirementId: params.requirementId || '',
    proposalId: params.proposalId || '',
    parentId: params.parentId,
    parentName: params.parentName,
    qariId: params.qariId,
    qariName: params.qariName,
    studentName: params.studentName,
    subject: params.subject,
    monthlyFee: params.monthlyFee,
    agreedFirstFee: params.monthlyFee,
    currency,
    hoursPerWeek: params.hoursPerWeek,
    platformCommissionRate: commissionRate,
    platformCommissionAmount,
    teacherPayoutAmount,
    paymentStatus: 'Pending',
    paymentSummary: {
      agreedFirstFee: params.monthlyFee,
      commissionRate,
      commissionAmount: platformCommissionAmount,
      teacherReceivesAmount: teacherPayoutAmount,
      paymentStatus: 'Pending',
      currency,
    },
    status,
    startDate: params.startDate,
    notes: params.notes || '',
    proposalMessage: params.proposalMessage || '',
    requirementDetails: params.requirementDetails,
    bothAgreedConfirmation,
    createdAt: new Date().toISOString(),
  };

  const transaction: TransactionRecord = {
    id: transactionId,
    agreementId,
    parentId: params.parentId,
    qariId: params.qariId,
    grossAmount: params.monthlyFee,
    commissionRate,
    commissionAmount: platformCommissionAmount,
    netTeacherAmount: teacherPayoutAmount,
    currency,
    paymentStatus: 'simulated_pending',
    createdAt: new Date().toISOString(),
  };

  try {
    // Persist agreement and financial transaction in Firestore
    await setDoc(doc(db, 'agreements', agreementId), agreement);
    await setDoc(doc(db, 'transactions', transactionId), transaction);

    // If linked to requirement, update status to matched
    if (params.requirementId) {
      try {
        await setDoc(
          doc(db, 'requirements', params.requirementId),
          { status: 'matched', updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch {
        // ignore
      }
    }

    return { agreement, transaction };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `agreements/${agreementId}`);
  }
}

export async function updateAgreementStatus(
  agreementId: string,
  status: 'pending' | 'accepted' | 'completed' | 'active' | 'cancelled'
): Promise<void> {
  try {
    const docRef = doc(db, 'agreements', agreementId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `agreements/${agreementId}`);
  }
}

export async function updateAgreementFee(
  agreementId: string,
  newMonthlyFee: number,
  currency?: string
): Promise<{ agreementUpdates: Partial<Agreement> }> {
  try {
    const commissionRate = 0.15;
    const platformCommissionAmount = Number((newMonthlyFee * 0.15).toFixed(2));
    const teacherPayoutAmount = Number((newMonthlyFee * 0.85).toFixed(2));

    const agreementUpdates: Partial<Agreement> = {
      monthlyFee: newMonthlyFee,
      agreedFirstFee: newMonthlyFee,
      ...(currency ? { currency } : {}),
      platformCommissionRate: commissionRate,
      platformCommissionAmount,
      teacherPayoutAmount,
      paymentSummary: {
        agreedFirstFee: newMonthlyFee,
        commissionRate,
        commissionAmount: platformCommissionAmount,
        teacherReceivesAmount: teacherPayoutAmount,
        paymentStatus: 'Pending',
        ...(currency ? { currency } : {}),
      },
    };

    const docRef = doc(db, 'agreements', agreementId);
    await updateDoc(docRef, agreementUpdates);
    return { agreementUpdates };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `agreements/${agreementId}`);
    throw error;
  }
}

export async function fetchAgreementById(agreementId: string): Promise<Agreement | null> {
  try {
    const docRef = doc(db, 'agreements', agreementId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Agreement;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `agreements/${agreementId}`);
  }
}

export async function fetchAgreementByRequirementId(requirementId: string): Promise<Agreement | null> {
  try {
    const agCol = collection(db, 'agreements');
    const snapshot = await getDocs(agCol);
    for (const d of snapshot.docs) {
      const data = d.data() as Agreement;
      if (data.requirementId === requirementId) {
        return data;
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'agreements');
  }
}

export async function fetchAgreementByProposalId(proposalId: string): Promise<Agreement | null> {
  try {
    const agCol = collection(db, 'agreements');
    const snapshot = await getDocs(agCol);
    for (const d of snapshot.docs) {
      const data = d.data() as Agreement;
      if (data.proposalId === proposalId) {
        return data;
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'agreements');
  }
}

export async function fetchAgreementsForUser(userId: string): Promise<Agreement[]> {
  try {
    const agCol = collection(db, 'agreements');
    const snapshot = await getDocs(agCol);
    const list: Agreement[] = [];

    snapshot.forEach((d) => {
      const data = d.data() as Agreement;
      if (data.parentId === userId || data.qariId === userId) {
        list.push(data);
      }
    });

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'agreements');
  }
}

export function subscribeToAgreements(
  userId: string,
  onUpdate: (agreements: Agreement[]) => void
): Unsubscribe {
  const agCol = collection(db, 'agreements');
  return onSnapshot(
    agCol,
    (snapshot) => {
      const list: Agreement[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Agreement;
        if (data.parentId === userId || data.qariId === userId) {
          list.push(data);
        }
      });
      const sorted = list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onUpdate(sorted);
    },
    (err) => console.error('Real-time agreements error:', err)
  );
}

export async function fetchTransactionsForUser(userId: string): Promise<TransactionRecord[]> {
  try {
    const txCol = collection(db, 'transactions');
    const snapshot = await getDocs(txCol);
    const list: TransactionRecord[] = [];

    snapshot.forEach((d) => {
      const data = d.data() as TransactionRecord;
      if (data.parentId === userId || data.qariId === userId) {
        list.push(data);
      }
    });

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'transactions');
  }
}

/* ================================================================
   6. CHAT MESSAGING (Persistent Firestore: /conversations/{id}/messages)
================================================================ */
export async function getOrCreateConversation(
  parentId: string,
  parentName: string,
  qariId: string,
  qariName: string,
  requirementId?: string
): Promise<Conversation> {
  const convId = `conv_${[parentId, qariId].sort().join('_')}`;

  try {
    const convRef = doc(db, 'conversations', convId);
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      const existing = snap.data() as Conversation;
      // Ensure participantIds includes both participants
      if (!existing.participantIds || existing.participantIds.length < 2) {
        const participantIds = Array.from(new Set([parentId, qariId, ...(existing.participantIds || [])]));
        await updateDoc(convRef, { participantIds });
        existing.participantIds = participantIds;
      }
      return existing;
    }

    const newConv: Conversation = {
      id: convId,
      parentId,
      parentName,
      qariId,
      qariName,
      participantIds: [parentId, qariId],
      requirementId: requirementId || '',
      lastMessage: 'Conversation started',
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await setDoc(convRef, newConv);
    return newConv;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversations/${convId}`);
  }
}

export async function fetchUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const convCol = collection(db, 'conversations');
    const snap = await getDocs(convCol);
    const list: Conversation[] = [];

    snap.forEach((d) => {
      const data = d.data() as Conversation;
      if (
        data.participantIds?.includes(userId) ||
        data.parentId === userId ||
        data.qariId === userId
      ) {
        list.push(data);
      }
    });

    return list.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'conversations');
  }
}

export function subscribeToConversations(
  userId: string,
  onUpdate: (conversations: Conversation[]) => void
): Unsubscribe {
  const convCol = collection(db, 'conversations');
  return onSnapshot(
    convCol,
    (snapshot) => {
      const list: Conversation[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Conversation;
        if (
          data.participantIds?.includes(userId) ||
          data.parentId === userId ||
          data.qariId === userId
        ) {
          list.push(data);
        }
      });
      const sorted = list.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      onUpdate(sorted);
    },
    (err) => console.error('Real-time conversations error:', err)
  );
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  content: string
): Promise<Message> {
  const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const newMsg: Message = {
    id: msgId,
    conversationId,
    senderId,
    senderName,
    content,
    createdAt: new Date().toISOString(),
  };

  try {
    // 1. Write the message document directly to Firestore subcollection
    const msgRef = doc(db, 'conversations', conversationId, 'messages', msgId);
    await setDoc(msgRef, newMsg);

    // 2. Update conversation header document in Firestore
    const convRef = doc(db, 'conversations', conversationId);
    await setDoc(
      convRef,
      {
        lastMessage: content,
        lastMessageAt: newMsg.createdAt,
      },
      { merge: true }
    );

    return newMsg;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversations/${conversationId}/messages/${msgId}`);
  }
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  try {
    const msgCol = collection(db, 'conversations', conversationId, 'messages');
    const snap = await getDocs(msgCol);
    const list: Message[] = [];

    snap.forEach((d) => list.push(d.data() as Message));

    return list.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `conversations/${conversationId}/messages`);
  }
}

export function subscribeToMessages(
  conversationId: string,
  onUpdate: (messages: Message[]) => void
): Unsubscribe {
  const msgCol = collection(db, 'conversations', conversationId, 'messages');

  return onSnapshot(
    msgCol,
    (snapshot) => {
      const list: Message[] = [];
      snapshot.forEach((d) => list.push(d.data() as Message));
      const sorted = list.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onUpdate(sorted);
    },
    (error) => {
      console.error('Real-time messages listener error:', error);
    }
  );
}

/* ================================================================
   7. LESSON SESSIONS & PROGRESS LOGS (Persistent Firestore: /lesson_sessions)
================================================================ */
export async function createLessonSession(
  session: Omit<LessonSession, 'sessionId' | 'createdAt' | 'status'>
): Promise<LessonSession> {
  const sessionId = 'ses_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newSession: LessonSession = {
    ...session,
    sessionId,
    status: 'scheduled',
    meetingLink: session.meetingLink || 'https://meet.google.com/qariconnect-room',
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'lesson_sessions', sessionId);
    await setDoc(docRef, newSession);
    return newSession;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `lesson_sessions/${sessionId}`);
  }
}

export async function fetchLessonSessionsForUser(userId: string): Promise<LessonSession[]> {
  try {
    const col = collection(db, 'lesson_sessions');
    const snapshot = await getDocs(col);
    const list: LessonSession[] = [];

    snapshot.forEach((d) => {
      const data = d.data() as LessonSession;
      if (data.parentId === userId || data.qariId === userId) {
        list.push(data);
      }
    });

    return list.sort(
      (a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'lesson_sessions');
  }
}

export function subscribeToLessonSessions(
  userId: string,
  onUpdate: (sessions: LessonSession[]) => void
): Unsubscribe {
  const col = collection(db, 'lesson_sessions');
  return onSnapshot(
    col,
    (snapshot) => {
      const list: LessonSession[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as LessonSession;
        if (data.parentId === userId || data.qariId === userId) {
          list.push(data);
        }
      });
      const sorted = list.sort(
        (a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
      );
      onUpdate(sorted);
    },
    (err) => console.error('Real-time lesson sessions error:', err)
  );
}

export async function updateLessonSession(
  sessionId: string,
  updates: Partial<LessonSession>
): Promise<void> {
  try {
    const docRef = doc(db, 'lesson_sessions', sessionId);
    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `lesson_sessions/${sessionId}`);
  }
}

