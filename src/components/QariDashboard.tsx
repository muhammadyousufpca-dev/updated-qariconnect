import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  DollarSign,
  Clock,
  Globe2,
  FileText,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Send,
  User,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Agreement, LearningRequirement, Proposal, QariProfile } from '../types';
import {
  fetchAllRequirements,
  fetchProposalsForUser,
  fetchAgreementsForUser,
  fetchAgreementByProposalId,
} from '../services/marketplaceService';
import { SubmitProposalModal } from './SubmitProposalModal';
import { ProposalReviewModal } from './ProposalReviewModal';
import { AgreementStageModal } from './AgreementStageModal';
import { formatCurrency, COMMISSION_PERCENTAGE, TEACHER_PAYOUT_PERCENTAGE, COMMISSION_RATE } from '../data/currencies';

interface QariDashboardProps {
  onNavigateToTab: (tab: string) => void;
  onStartChatWithParent: (parentId: string, parentName: string) => void;
}

export const QariDashboard: React.FC<QariDashboardProps> = ({
  onNavigateToTab,
  onStartChatWithParent,
}) => {
  const { qariProfile, userProfile } = useAuth();
  const qariId = qariProfile?.qariId || userProfile?.uid || 'seed_qari_1';
  const teacherCurrency = qariProfile?.currency || 'USD';

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'proposals' | 'contracts'>('requests');
  const [requirements, setRequirements] = useState<LearningRequirement[]>([]);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [myAgreements, setMyAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  // Proposal modal
  const [targetReqForProposal, setTargetReqForProposal] = useState<LearningRequirement | null>(null);
  const [reviewingProposal, setReviewingProposal] = useState<Proposal | null>(null);

  // Agreement stage modal
  const [selectedAgreementForStage, setSelectedAgreementForStage] = useState<Agreement | null>(null);

  const handleOpenAgreementForProposal = async (propId: string) => {
    try {
      const agr = await fetchAgreementByProposalId(propId);
      if (agr) {
        setSelectedAgreementForStage(agr);
        return;
      }
    } catch (e) {
      console.error('Error fetching agreement by proposal id:', e);
    }
    const found = myAgreements.find((a) => a.proposalId === propId);
    if (found) setSelectedAgreementForStage(found);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [reqs, props, agrs] = await Promise.all([
          fetchAllRequirements(),
          fetchProposalsForUser(qariId),
          fetchAgreementsForUser(qariId),
        ]);
        setRequirements(reqs);
        setMyProposals(props.filter((p) => p.qariId === qariId));
        setMyAgreements(agrs.filter((a) => a.qariId === qariId));
      } catch (err) {
        console.error('Error loading Qari dashboard data from Firestore:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [qariId]);

  // Aggregate stats grouped by currency
  const currencyBreakdown = myAgreements.reduce((acc, a) => {
    const curr = a.currency || teacherCurrency;
    const val = a.agreedFirstFee || a.monthlyFee;
    acc[curr] = (acc[curr] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const currencyKeys = Object.keys(currencyBreakdown);
  const totalEarningsFormatted =
    currencyKeys.length > 0
      ? currencyKeys.map((c) => formatCurrency(currencyBreakdown[c] * (1 - COMMISSION_RATE), c)).join(' • ')
      : formatCurrency(0, teacherCurrency);

  const totalCommissionFormatted =
    currencyKeys.length > 0
      ? currencyKeys.map((c) => formatCurrency(currencyBreakdown[c] * COMMISSION_RATE, c)).join(' • ')
      : formatCurrency(0, teacherCurrency);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Teacher Profile Summary Card */}
      <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 text-white border border-emerald-800/50 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-emerald-800/60">
          <div className="flex items-start gap-4">
            <img
              src={
                qariProfile?.avatarUrl ||
                'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300'
              }
              alt="Qari Avatar"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-md shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif">
                  {qariProfile?.fullName || 'Sheikh Ahmad Al-Masri'}
                </h2>
                {qariProfile?.hasSanad && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-emerald-950">
                    <Award className="w-3.5 h-3.5" />
                    Sanad Muttasil Verified
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-emerald-200">
                {qariProfile?.title || 'Certified Qari & Tajweed Instructor'}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-300">
                <span className="flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5" />
                  {qariProfile?.country || 'Egypt'} ({qariProfile?.city || 'Cairo'})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {qariProfile?.experienceYears || 10} Years Teaching
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  ★ {qariProfile?.rating || 5.0} ({qariProfile?.reviewCount || 24} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateToTab('qari_profile')}
              className="px-4 py-2.5 rounded-xl border border-emerald-400/50 bg-emerald-800/70 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <User className="w-4 h-4 text-amber-300" />
              Edit Teacher Profile & Sanad
            </button>
            <button
              onClick={() => onNavigateToTab('messages')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              Open Direct Messages
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-emerald-200 uppercase font-semibold">Active Students</div>
            <div className="text-2xl font-black font-serif text-white mt-1">
              {myAgreements.length}
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5">Under contract</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-emerald-200 uppercase font-semibold">Teacher Receives ({TEACHER_PAYOUT_PERCENTAGE}%)</div>
            <div className="text-xl sm:text-2xl font-black font-serif text-emerald-300 mt-1 break-words">
              {totalEarningsFormatted}
            </div>
            <div className="text-[10px] text-emerald-200 mt-0.5">Your net monthly earnings</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-amber-300 uppercase font-semibold">Platform Fee ({COMMISSION_PERCENTAGE}%)</div>
            <div className="text-xl sm:text-2xl font-black font-serif text-amber-300 mt-1 break-words">
              {totalCommissionFormatted}
            </div>
            <div className="text-[10px] text-emerald-200 mt-0.5">QariConnect {COMMISSION_PERCENTAGE}% share</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-emerald-200 uppercase font-semibold">Sent Proposals</div>
            <div className="text-2xl font-black font-serif text-white mt-1">
              {myProposals.length}
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5">To prospective parents</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'requests'
                ? 'bg-white text-emerald-950 font-bold shadow-xs'
                : 'text-gray-600 hover:text-emerald-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>Parent Requests Feed ({requirements.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('proposals')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'proposals'
                ? 'bg-white text-emerald-950 font-bold shadow-xs'
                : 'text-gray-600 hover:text-emerald-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-emerald-700" />
            <span>My Submitted Proposals ({myProposals.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('contracts')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'contracts'
                ? 'bg-white text-emerald-950 font-bold shadow-xs'
                : 'text-gray-600 hover:text-emerald-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Active Teaching Contracts ({myAgreements.length})</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Content */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading data from Firestore...</div>
      ) : activeSubTab === 'requests' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Browse learning requirements from families worldwide and submit your teaching proposal</span>
            <span className="font-semibold text-emerald-800">{TEACHER_PAYOUT_PERCENTAGE}% Teacher payout ({COMMISSION_PERCENTAGE}% QariConnect commission)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs hover:border-emerald-200 transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-950 font-serif">
                      Student: {req.studentName} ({req.studentAge} yrs)
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'matched'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {req.status === 'matched' ? '✓ Matched' : 'Open'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">Level:</span>
                    <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {req.currentLevel}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {req.goals.map((g, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[10px] bg-gray-100 text-gray-700">
                        {g}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                    <div>Location: <strong>{req.country}</strong></div>
                    <div>Language: <strong>{req.preferredLanguage}</strong></div>
                    <div>Schedule: <strong>{req.weeklyFrequency}x/wk</strong></div>
                    <div>Budget: <strong className="text-emerald-900 font-bold">{formatCurrency(req.monthlyBudget, req.currency)}/mo</strong></div>
                  </div>

                  {req.notes && (
                    <p className="text-[11px] text-gray-500 italic bg-gray-50/70 p-2 rounded-lg">
                      "{req.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <span className="text-[11px] text-gray-500">
                    Parent: <strong>{req.parentName}</strong>
                  </span>
                  {req.status === 'open' && (
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
            ))}
          </div>
        </div>
      ) : activeSubTab === 'proposals' ? (
        <div className="space-y-4">
          {myProposals.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-400 space-y-2 border border-gray-100">
              <Send className="w-10 h-10 mx-auto text-gray-300" />
              <p>You haven't submitted any proposals yet.</p>
              <button
                onClick={() => setActiveSubTab('requests')}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition"
              >
                Browse Parent Requests
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myProposals.map((prop) => {
                const propCurrency = prop.currency || teacherCurrency;
                const monthly = prop.proposedMonthlyFee > 0 ? prop.proposedMonthlyFee : 100;
                const payoutShare = Number((monthly * (1 - COMMISSION_RATE)).toFixed(2));
                const commShare = Number((monthly * COMMISSION_RATE).toFixed(2));

                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <div>
                        <div className="font-bold text-sm text-gray-950 font-serif">
                          Proposal #{prop.id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-xs text-emerald-800">
                          Classes: {prop.hoursPerWeek} classes / week
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-extrabold text-emerald-950 font-serif">
                          {formatCurrency(monthly, propCurrency)} <span className="text-xs font-normal text-gray-500">/ mo</span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Teacher receives: <strong className="text-emerald-700">{TEACHER_PAYOUT_PERCENTAGE}% ({formatCurrency(payoutShare, propCurrency)})</strong> • QariConnect commission: {COMMISSION_PERCENTAGE}% ({formatCurrency(commShare, propCurrency)})
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/70 p-3 rounded-xl">
                      "{prop.message}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 pt-1">
                      <span>Status: <strong className="text-emerald-800 capitalize font-bold">{prop.status}</strong></span>
                      <div className="flex items-center gap-2">
                        {prop.status === 'accepted' && (
                          <button
                            onClick={() => handleOpenAgreementForProposal(prop.id)}
                            className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                            View Agreement Stage
                          </button>
                        )}
                        <button
                          onClick={() => setReviewingProposal(prop)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-300" />
                          Proposal Review
                        </button>
                        <button
                          onClick={() => onStartChatWithParent(prop.parentId, 'Parent')}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          Message Parent
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {myAgreements.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-400 space-y-2 border border-gray-100">
              <ShieldCheck className="w-10 h-10 mx-auto text-gray-300" />
              <p>No active contracts yet. When parents accept your proposal, the contract will be listed here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAgreements.map((agr) => (
                <div
                  key={agr.id}
                  className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <div className="font-bold text-sm text-gray-950 font-serif">
                        Student: {agr.studentName}
                      </div>
                      <div className="text-xs text-gray-500">Parent: {agr.parentName}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {agr.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div>Syllabus: <strong>{agr.subject}</strong></div>
                    <div>Schedule: <strong>{agr.hoursPerWeek} classes / week</strong></div>
                    <div>Start Date: <strong>{agr.startDate}</strong></div>
                  </div>

                  <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/60 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Agreed Fee ({agr.currency || teacherCurrency}):</span>
                      <strong className="text-gray-950 font-mono">
                        {formatCurrency(agr.agreedFirstFee || agr.monthlyFee, agr.currency || teacherCurrency)}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-emerald-900 font-bold">
                      <span>Teacher receives: {TEACHER_PAYOUT_PERCENTAGE}%</span>
                      <span className="font-mono">
                        {formatCurrency((agr.agreedFirstFee || agr.monthlyFee) * (1 - COMMISSION_RATE), agr.currency || teacherCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-amber-900">
                      <span>QariConnect commission: {COMMISSION_PERCENTAGE}%</span>
                      <span className="font-mono">
                        {formatCurrency((agr.agreedFirstFee || agr.monthlyFee) * COMMISSION_RATE, agr.currency || teacherCurrency)}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-emerald-200/50 flex justify-between items-center font-bold">
                      <span className="text-gray-700">Payment Status:</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-400 text-amber-950 flex items-center gap-1 shadow-2xs">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Recorded Contract
                    </span>
                    <button
                      onClick={() => setSelectedAgreementForStage(agr)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                      View Agreement Stage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Proposal Modal */}
      {targetReqForProposal && (
        <SubmitProposalModal
          isOpen={!!targetReqForProposal}
          onClose={() => setTargetReqForProposal(null)}
          requirement={targetReqForProposal}
          onSubmitted={(newProp) => {
            setMyProposals((prev) => [newProp, ...prev]);
            setRequirements((prev) =>
              prev.map((r) =>
                r.id === newProp.requirementId
                  ? { ...r, proposalsCount: (r.proposalsCount || 0) + 1 }
                  : r
              )
            );
            setActiveSubTab('proposals');
          }}
        />
      )}

      {/* Proposal Review Modal */}
      {reviewingProposal && (
        <ProposalReviewModal
          isOpen={!!reviewingProposal}
          onClose={() => setReviewingProposal(null)}
          proposal={reviewingProposal}
          requirement={requirements.find((r) => r.id === reviewingProposal.requirementId)}
          onAccept={() => {}}
          onReject={() => {}}
          onStartChat={() => {
            onStartChatWithParent(reviewingProposal.parentId, 'Parent');
            setReviewingProposal(null);
          }}
          onViewAgreement={(p) => {
            setReviewingProposal(null);
            handleOpenAgreementForProposal(p.id);
          }}
          isOwner={false}
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
            setMyAgreements((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
          }}
          viewerRole="qari"
        />
      )}
    </div>
  );
};
