import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  User,
  Globe2,
  Calendar,
  Clock,
  DollarSign,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  LayoutDashboard,
  Check,
  XCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LearningRequirement, Proposal, QariProfile, Agreement } from '../types';
import {
  fetchAllRequirements,
  subscribeToRequirements,
  fetchAllProposals,
  subscribeToAllProposals,
  createTeachingAgreement,
  updateProposalStatus,
  fetchAgreementByProposalId,
  fetchAgreementByRequirementId,
} from '../services/marketplaceService';
import { SubmitProposalModal } from './SubmitProposalModal';
import { ProposalReviewModal } from './ProposalReviewModal';
import { AgreementStageModal } from './AgreementStageModal';
import {
  formatCurrency,
  COMMISSION_RATE,
  COMMISSION_PERCENTAGE,
  TEACHER_PAYOUT_PERCENTAGE,
} from '../data/currencies';

interface ParentRequirementsViewProps {
  openPostRequirementModal: () => void;
  onStartChat: (qari: QariProfile) => void;
  onAgreementCreated: () => void;
}

export const ParentRequirementsView: React.FC<ParentRequirementsViewProps> = ({
  openPostRequirementModal,
  onStartChat,
  onAgreementCreated,
}) => {
  const { userProfile, isDemoUser } = useAuth();
  const currentRole = userProfile?.role || 'parent';
  const currentUserId = userProfile?.uid || 'demo_parent_user';

  const [requirements, setRequirements] = useState<LearningRequirement[]>([]);
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<'all' | 'mine' | 'with_proposals'>('all');

  // Proposal modal for Qari
  const [targetReqForProposal, setTargetReqForProposal] = useState<LearningRequirement | null>(null);

  // Track expanded requirements
  const [expandedReqIds, setExpandedReqIds] = useState<Record<string, boolean>>({});

  // Success alert message when proposal accepted
  const [acceptedNotice, setAcceptedNotice] = useState<string | null>(null);

  // Proposal review modal
  const [reviewingProposal, setReviewingProposal] = useState<Proposal | null>(null);
  const [reviewingRequirement, setReviewingRequirement] = useState<LearningRequirement | null>(null);

  // Agreement stage modal
  const [selectedAgreementForStage, setSelectedAgreementForStage] = useState<Agreement | null>(null);

  const handleOpenProposalReview = (prop: Proposal, req?: LearningRequirement) => {
    const parentReq = req || requirements.find((r) => r.id === prop.requirementId) || null;
    setReviewingProposal(prop);
    setReviewingRequirement(parentReq);
  };

  const handleOpenAgreementForRequirementOrProposal = async (
    reqId?: string,
    propId?: string
  ) => {
    try {
      if (propId) {
        const agr = await fetchAgreementByProposalId(propId);
        if (agr) {
          setSelectedAgreementForStage(agr);
          return;
        }
      }
      if (reqId) {
        const agr = await fetchAgreementByRequirementId(reqId);
        if (agr) {
          setSelectedAgreementForStage(agr);
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching agreement:', e);
    }
  };

  const handleRejectProposal = async (prop: Proposal) => {
    try {
      await updateProposalStatus(prop.id, 'declined');
      setAllProposals((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, status: 'declined' } : p))
      );
      if (reviewingProposal && reviewingProposal.id === prop.id) {
        setReviewingProposal({ ...reviewingProposal, status: 'declined' });
      }
    } catch (err) {
      console.error('Error rejecting proposal:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Initial load
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [reqList, propList] = await Promise.all([
          fetchAllRequirements(),
          fetchAllProposals(),
        ]);
        if (isMounted) {
          if (reqList) setRequirements(reqList);
          if (propList) setAllProposals(propList);
        }
      } catch (err) {
        console.error('Error loading requirements and proposals:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    // Real-time listener for requirements
    const unsubReq = subscribeToRequirements((list) => {
      if (isMounted) {
        setRequirements(list);
        setLoading(false);
      }
    });

    // Real-time listener for proposals
    const unsubProp = subscribeToAllProposals((props) => {
      if (isMounted) {
        setAllProposals(props);
      }
    });

    return () => {
      isMounted = false;
      unsubReq();
      unsubProp();
    };
  }, []);

  const handleToggleExpandProposals = (reqId: string) => {
    setExpandedReqIds((prev) => ({
      ...prev,
      [reqId]: !prev[reqId],
    }));
  };

  const handleAcceptProposal = async (req: LearningRequirement, prop: Proposal, agreedFee?: number) => {
    try {
      const propCurrency = prop.currency || prop.teacherProfile?.currency || req.currency || 'USD';
      const finalMonthlyFee =
        agreedFee && agreedFee > 0
          ? agreedFee
          : prop.proposedMonthlyFee > 0
          ? prop.proposedMonthlyFee
          : 100;

      const res = await createTeachingAgreement({
        requirementId: req.id,
        proposalId: prop.id,
        parentId: req.parentId,
        parentName: req.parentName,
        qariId: prop.qariId,
        qariName: prop.qariName,
        studentName: req.studentName,
        subject: `${req.currentLevel} - ${req.goals.join(', ')}`,
        monthlyFee: finalMonthlyFee,
        currency: propCurrency,
        hoursPerWeek: prop.hoursPerWeek,
        startDate: new Date().toISOString().split('T')[0],
        notes: `Agreed via Proposal response from ${prop.qariName}.`,
        proposalMessage: prop.message,
        requirementDetails: {
          studentName: req.studentName,
          currentLevel: req.currentLevel,
          goals: req.goals,
          schedule: `${req.weeklyFrequency} classes / week (${req.preferredTiming})`,
          preferredLanguage: req.preferredLanguage,
          country: req.country,
          learningNeeds: req.notes,
        },
        status: 'accepted',
        bothAgreedConfirmation: {
          agreedAt: new Date().toISOString(),
          parentConfirmed: true,
          teacherConfirmed: true,
          confirmationText: `Formal Agreement Confirmed: Both ${req.parentName} (Parent) and ${prop.qariName} (Teacher) have agreed to the teaching terms and agreed fee of ${formatCurrency(finalMonthlyFee, propCurrency)} for student ${req.studentName}.`,
        },
      });

      // Update proposal status in Firestore to accepted
      await updateProposalStatus(prop.id, 'accepted');

      // Update local state immediately
      setRequirements((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: 'matched' } : r))
      );
      setAllProposals((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, status: 'accepted' } : p))
      );

      if (reviewingProposal && reviewingProposal.id === prop.id) {
        setReviewingProposal({ ...reviewingProposal, status: 'accepted' });
      }

      setAcceptedNotice(
        `Proposal from ${prop.qariName} accepted! Agreement Stage created and confirmed for student ${req.studentName}.`
      );
      setTimeout(() => setAcceptedNotice(null), 8000);

      if (res?.agreement) {
        setSelectedAgreementForStage(res.agreement);
      }

      onAgreementCreated();
    } catch (err) {
      console.error('Error accepting proposal:', err);
    }
  };

  const isOwner = (req: LearningRequirement) => {
    if (isDemoUser) {
      return (
        req.parentId === currentUserId ||
        req.parentId === 'demo_parent_user' ||
        req.parentId === 'parent_user_2'
      );
    }
    return req.parentId === currentUserId;
  };

  const myRequirements = requirements.filter(isOwner);
  const requirementsWithProposals = requirements.filter((r) => {
    const props = allProposals.filter((p) => p.requirementId === r.id);
    return props.length > 0;
  });

  const filteredList = requirements.filter((r) => {
    if (tabFilter === 'mine') {
      return isOwner(r);
    }
    if (tabFilter === 'with_proposals') {
      const props = allProposals.filter((p) => p.requirementId === r.id);
      return props.length > 0;
    }
    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Success Notification Bar */}
      {acceptedNotice && (
        <div className="bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-lg border border-emerald-700 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{acceptedNotice}</span>
          </div>
          <button
            onClick={() => setAcceptedNotice(null)}
            className="text-emerald-300 hover:text-white text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner & Filter Controls */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-1">
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
            <span>Parent Dashboard &bull; Parent Requests &amp; Teaching Proposals</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-950 font-serif">
            Parent Quran Requests &amp; Submitted Proposals
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Parents share learning goals; verified Qaris submit teaching proposals with customized rates and study plans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Filter tabs */}
          <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setTabFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                tabFilter === 'all' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Open Requests ({requirements.length})
            </button>
            <button
              onClick={() => setTabFilter('mine')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                tabFilter === 'mine' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Child Requests ({myRequirements.length})
            </button>
            <button
              onClick={() => setTabFilter('with_proposals')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                tabFilter === 'with_proposals' ? 'bg-white text-emerald-950 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Send className="w-3 h-3 text-emerald-700" />
              <span>With Proposals ({requirementsWithProposals.length})</span>
            </button>
          </div>

          {currentRole === 'parent' && (
            <button
              onClick={openPostRequirementModal}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              Post Request
            </button>
          )}
        </div>
      </div>

      {/* Requirements List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 space-y-3">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">
            {tabFilter === 'mine'
              ? "You haven't posted any learning requests yet."
              : tabFilter === 'with_proposals'
              ? 'No requests have received teacher proposals yet.'
              : 'No learning requests posted.'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {tabFilter === 'mine'
              ? "Click below to post your child's Quran goals, schedule, and budget."
              : tabFilter === 'with_proposals'
              ? 'Teachers browse requests and submit proposals regularly. Check back shortly.'
              : 'Parents post Quran learning requirements here.'}
          </p>
          {currentRole === 'parent' && (
            <button
              onClick={openPostRequirementModal}
              className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition cursor-pointer"
            >
              Post a Requirement Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredList.map((req) => {
            const reqIsOwner = isOwner(req);
            const proposals = allProposals.filter((p) => p.requirementId === req.id);
            const pendingCount = proposals.filter((p) => p.status === 'pending').length;
            const isExpanded = !!expandedReqIds[req.id];

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:border-emerald-200 transition overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-base text-gray-900 font-serif">
                        Student: {req.studentName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {req.studentAge} years old
                      </span>
                      {req.studentGender !== 'any' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 capitalize">
                          {req.studentGender} teacher preferred
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Proposals Received Pill */}
                      {proposals.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                          <Send className="w-3 h-3 text-amber-700" />
                          <span>{proposals.length} Proposal{proposals.length > 1 ? 's' : ''} Received</span>
                        </span>
                      )}

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          req.status === 'matched'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {req.status === 'matched' ? '✓ Matched & Contract Active' : '● Open for Proposals'}
                      </span>
                      {reqIsOwner && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-200 text-gray-800 uppercase">
                          Your Posting
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Level & Goals */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-gray-500 uppercase tracking-wide">
                        Current Level:
                      </span>
                      <span className="font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        {req.currentLevel}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs font-bold text-gray-500 mr-1">Goals:</span>
                      {req.goals.map((goal, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Logistics: Country, Timing, Frequency, Budget */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">Location</span>
                      <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                        <Globe2 className="w-3.5 h-3.5 text-emerald-700" />
                        {req.country}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Instruction Language</span>
                      <span className="font-bold text-gray-800 mt-0.5 block">{req.preferredLanguage}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Schedule</span>
                      <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        {req.weeklyFrequency}x/week ({req.preferredTiming})
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Monthly Budget</span>
                      <span className="font-extrabold text-emerald-950 text-sm font-serif mt-0.5 block">
                        {formatCurrency(req.monthlyBudget, req.currency)}{' '}
                        <span className="text-[10px] font-normal text-gray-500">/ mo</span>
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {req.notes && (
                    <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-100 italic">
                      "{req.notes}"
                    </p>
                  )}

                  {/* Prominent notification banner if proposals have been submitted */}
                  {proposals.length > 0 && (
                    <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <div className="text-xs">
                          <span className="font-bold text-emerald-950">
                            {proposals.length} Teaching Proposal{proposals.length > 1 ? 's' : ''} Received from Verified Qaris
                          </span>
                          {pendingCount > 0 ? (
                            <span className="text-amber-800 font-semibold ml-2">
                              &bull; {pendingCount} Pending Review
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold ml-2">
                              &bull; Contract Active
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {/* Proposal Review Button */}
                        <button
                          onClick={() => handleOpenProposalReview(proposals[0], req)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-300" />
                          <span>Proposal Review ({proposals.length})</span>
                        </button>

                        {/* View Agreement Stage Button */}
                        {(req.status === 'matched' || proposals.some((p) => p.status === 'accepted')) && (
                          <button
                            onClick={() => {
                              const acceptedProp = proposals.find((p) => p.status === 'accepted') || proposals[0];
                              handleOpenAgreementForRequirementOrProposal(req.id, acceptedProp?.id);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                            <span>View Agreement Stage</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleExpandProposals(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-950 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide' : 'Quick View'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-gray-500">
                      Posted by <strong className="text-gray-700">{req.parentName}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Proposals View Toggle Button */}
                      <button
                        onClick={() => handleToggleExpandProposals(req.id)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                          proposals.length > 0
                            ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-700" />
                        <span>
                          {proposals.length} Teaching Proposal{proposals.length === 1 ? '' : 's'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Qari Submit Proposal button */}
                      {currentRole === 'qari' && req.status === 'open' && (
                        <button
                          onClick={() => setTargetReqForProposal(req)}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5 text-amber-300" />
                          Submit Proposal
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Proposals Drawer */}
                {isExpanded && (
                  <div className="bg-emerald-50/50 border-t border-emerald-100 p-6 space-y-4 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-700" />
                          Teacher Proposals for student {req.studentName} ({proposals.length})
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Review each teacher's proposed rate, qualifications, and curriculum plan.
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                        {COMMISSION_PERCENTAGE}% platform commission on monthly fee (Teacher receives {TEACHER_PAYOUT_PERCENTAGE}%)
                      </span>
                    </div>

                    {proposals.length === 0 ? (
                      <div className="text-xs text-gray-500 py-6 text-center bg-white rounded-2xl border border-gray-100 space-y-1">
                        <Send className="w-6 h-6 mx-auto text-gray-300" />
                        <p className="font-medium text-gray-700">No proposals submitted yet.</p>
                        <p className="text-[11px] text-gray-400">Verified Qaris will review your requirements and submit teaching offers shortly.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {proposals.map((prop) => {
                          const propCurrency = prop.currency || prop.teacherProfile?.currency || 'USD';
                          const fee = prop.proposedMonthlyFee > 0 ? prop.proposedMonthlyFee : 100;
                          const platformCut = Number((fee * COMMISSION_RATE).toFixed(2));
                          const teacherCut = Number((fee * (1 - COMMISSION_RATE)).toFixed(2));

                          return (
                            <div
                              key={prop.id}
                              className={`bg-white rounded-2xl p-5 border shadow-xs space-y-3.5 transition ${
                                prop.status === 'pending'
                                  ? 'border-amber-200 bg-linear-to-b from-amber-50/20 to-white'
                                  : prop.status === 'accepted'
                                  ? 'border-emerald-300 bg-linear-to-b from-emerald-50/20 to-white'
                                  : 'border-gray-200'
                              }`}
                            >
                              {/* Proposal Header: Teacher info + STATUS BADGE */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 pb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 font-serif font-black flex items-center justify-center text-base shadow-xs shrink-0">
                                    {prop.qariName.charAt(0) || 'Q'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-gray-950 font-serif">
                                        {prop.qariName}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        Verified Qari
                                      </span>
                                    </div>
                                    <div className="text-xs text-emerald-900 font-medium flex items-center gap-2 mt-0.5">
                                      <span>{prop.hoursPerWeek} classes / week</span>
                                      <span className="text-gray-300">&bull;</span>
                                      <span className="text-gray-500 text-[11px]">
                                        Submitted {new Date(prop.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* CLEAR PROPOSAL STATUS BADGE */}
                                <div className="flex items-center gap-2">
                                  {prop.status === 'pending' && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                                      <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin-slow" />
                                      <span>Status: Pending Review</span>
                                    </span>
                                  )}
                                  {prop.status === 'accepted' && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>Status: Accepted &amp; Contract Active</span>
                                    </span>
                                  )}
                                  {prop.status === 'declined' && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300 flex items-center gap-1.5">
                                      <XCircle className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Status: Declined</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Pricing breakdown: 85% teacher payout / 15% platform fee */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs">
                                <div>
                                  <span className="text-gray-500 block text-[11px]">Proposed Tuition ({propCurrency})</span>
                                  <span className="text-base font-extrabold text-emerald-950 font-serif mt-0.5 block">
                                    {formatCurrency(fee, propCurrency)} <span className="text-xs font-normal text-gray-500">/ mo</span>
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-[11px]">Teacher receives: {TEACHER_PAYOUT_PERCENTAGE}%</span>
                                  <span className="font-bold text-emerald-800 text-sm mt-0.5 block">
                                    {formatCurrency(teacherCut, propCurrency)} <span className="text-[10px] font-normal text-emerald-600">/ mo</span>
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block text-[11px]">QariConnect commission: {COMMISSION_PERCENTAGE}%</span>
                                  <span className="font-bold text-amber-900 text-sm mt-0.5 block">
                                    {formatCurrency(platformCut, propCurrency)} <span className="text-[10px] font-normal text-amber-700">monthly</span>
                                  </span>
                                </div>
                              </div>

                              {/* Teacher's message / proposal plan */}
                              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                  Teacher Message &amp; Learning Plan:
                                </span>
                                <p className="text-xs text-gray-800 leading-relaxed italic">
                                  "{prop.message}"
                                </p>
                              </div>

                              {/* Proposal Actions */}
                              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                                <div className="text-[11px] text-gray-400 font-mono">
                                  ID: {prop.id.slice(-8)}
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* PROPOSAL REVIEW BUTTON */}
                                  <button
                                    onClick={() => handleOpenProposalReview(prop, req)}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-amber-300" />
                                    Proposal Review
                                  </button>

                                  <button
                                    onClick={() =>
                                      onStartChat({
                                        qariId: prop.qariId,
                                        fullName: prop.qariName,
                                        title: 'Quran & Tajweed Instructor',
                                        bio: prop.message,
                                        country: 'Global',
                                        languages: ['English', 'Arabic'],
                                        experienceYears: 5,
                                        hasSanad: true,
                                        qualifications: 'Certified Qari',
                                        tajweedSpecialization: 'Makharij & Tajweed',
                                        hourlyFee: 18,
                                        monthlyFee: prop.proposedMonthlyFee,
                                        currency: prop.currency || 'USD',
                                        preferredAgeGroups: ['All'],
                                        availability: 'Flexible',
                                        createdAt: '',
                                        updatedAt: '',
                                      })
                                    }
                                    className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                                    Chat with Qari
                                  </button>

                                  {reqIsOwner && prop.status === 'pending' && req.status === 'open' && (
                                    <button
                                      onClick={() => handleAcceptProposal(req, prop)}
                                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                                    >
                                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                                      Accept Proposal &amp; Create Contract
                                    </button>
                                  )}

                                  {prop.status === 'accepted' && (
                                    <div className="flex items-center gap-2">
                                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                        Contract Created
                                      </span>
                                      <button
                                        onClick={() => handleOpenAgreementForRequirementOrProposal(req.id, prop.id)}
                                        className="px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                                      >
                                        <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                                        <span>View Agreement Stage</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Qari Submit Proposal Modal */}
      {targetReqForProposal && (
        <SubmitProposalModal
          isOpen={!!targetReqForProposal}
          onClose={() => setTargetReqForProposal(null)}
          requirement={targetReqForProposal}
          onSubmitted={(newProp) => {
            // Updated in real-time by subscription, but also update local state
            setAllProposals((prev) => [newProp, ...prev]);
            setRequirements((prev) =>
              prev.map((r) =>
                r.id === newProp.requirementId
                  ? { ...r, proposalsCount: (r.proposalsCount || 0) + 1 }
                  : r
              )
            );
            if (targetReqForProposal) {
              setExpandedReqIds((prev) => ({
                ...prev,
                [targetReqForProposal.id]: true,
              }));
            }
          }}
        />
      )}

      {/* Proposal Review Modal / Page */}
      {reviewingProposal && (
        <ProposalReviewModal
          isOpen={!!reviewingProposal}
          onClose={() => {
            setReviewingProposal(null);
            setReviewingRequirement(null);
          }}
          proposal={reviewingProposal}
          requirement={reviewingRequirement}
          onAccept={handleAcceptProposal}
          onReject={handleRejectProposal}
          onStartChat={onStartChat}
          onViewAgreement={(p, r) => handleOpenAgreementForRequirementOrProposal(r?.id, p.id)}
          isOwner={reviewingRequirement ? isOwner(reviewingRequirement) : true}
        />
      )}

      {/* Formal Agreement Stage Modal */}
      {selectedAgreementForStage && (
        <AgreementStageModal
          isOpen={!!selectedAgreementForStage}
          onClose={() => setSelectedAgreementForStage(null)}
          agreement={selectedAgreementForStage}
          onStatusUpdated={(updated) => {
            setSelectedAgreementForStage(updated);
            onAgreementCreated();
          }}
          viewerRole="parent"
        />
      )}
    </section>
  );
};

