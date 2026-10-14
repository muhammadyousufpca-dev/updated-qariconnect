import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Globe2,
  DollarSign,
  MessageSquare,
  Sparkles,
  User,
  GraduationCap,
  Briefcase,
  ChevronRight,
  Phone,
  Check,
  AlertCircle,
  Layers,
  FileText,
  Receipt,
} from 'lucide-react';
import { Proposal, LearningRequirement, QariProfile } from '../types';
import { fetchQariProfileById } from '../services/marketplaceService';
import { INITIAL_SEED_QARIS } from '../data/seedQaris';
import {
  formatCurrency,
  getCurrencyInfo,
  getCurrencySymbol,
  getCurrencyPresets,
  COMMISSION_RATE,
  COMMISSION_PERCENTAGE,
  TEACHER_PAYOUT_PERCENTAGE,
} from '../data/currencies';

interface ProposalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  requirement?: LearningRequirement | null;
  onAccept: (req: LearningRequirement, prop: Proposal, agreedFeePkr?: number) => Promise<void> | void;
  onReject: (prop: Proposal) => Promise<void> | void;
  onStartChat?: (qari: QariProfile) => void;
  onViewAgreement?: (prop: Proposal, req?: LearningRequirement | null) => void;
  isOwner?: boolean;
}

export const ProposalReviewModal: React.FC<ProposalReviewModalProps> = ({
  isOpen,
  onClose,
  proposal,
  requirement,
  onAccept,
  onReject,
  onStartChat,
  onViewAgreement,
  isOwner = true,
}) => {
  const [profile, setProfile] = useState<Partial<QariProfile> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<'accepted' | 'declined' | null>(null);
  // Handle ESC key press to close cleanly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!proposal) return;

    let isMounted = true;
    setActionSuccess(null);

    // Prioritize snapshot stored with proposal
    if (
      proposal.teacherProfile &&
      proposal.teacherProfile.bio &&
      proposal.teacherProfile.qualifications
    ) {
      setProfile(proposal.teacherProfile);
      return;
    }

    // Otherwise lookup in Firestore or seed data
    async function resolveTeacherProfile() {
      if (!proposal) return;
      try {
        const firestoreProf = await fetchQariProfileById(proposal.qariId);
        if (firestoreProf && isMounted) {
          setProfile(firestoreProf);
          return;
        }
      } catch (e) {
        console.error('Could not fetch teacher profile from firestore:', e);
      }

      // Check seed data
      const seed = INITIAL_SEED_QARIS.find(
        (s) =>
          s.qariId === proposal.qariId ||
          s.fullName.toLowerCase() === proposal.qariName.toLowerCase()
      );
      if (seed && isMounted) {
        setProfile(seed);
        return;
      }

      // Sensible fallback
      if (isMounted) {
        setProfile({
          fullName: proposal.qariName,
          title: 'Certified Qari & Tajweed Instructor',
          bio: 'Assalamu Alaikum. Dedicated Quran instructor committed to teaching Tajweed with proper Makharij, patient guidance, and engaging learning methodologies for children and adults.',
          qualifications: 'Certified Hafiz & Tajweed Instructor (Ijazah in Hafs \'an Asim)',
          experienceYears: 8,
          country: 'Global',
          city: 'Cairo',
          languages: ['Arabic (Native)', 'English (Fluent)'],
          hasSanad: true,
          sanadDetails: 'Sanad Muttasil in Riwayah Hafs \'an Asim with unbroken chain of recitation.',
          tajweedSpecialization: 'Makharij & Sifat, Noorani Qaida, Tarteel Recitation',
          subjects: ['Quran Recitation', 'Tajweed Rules', 'Hifz Memorization'],
          classesGrades: ['Primary (Grades 1-5)', 'Middle School', 'Adults'],
        });
      }
    }

    resolveTeacherProfile();

    return () => {
      isMounted = false;
    };
  }, [proposal]);

  if (!isOpen || !proposal) return null;

  const currentStatus = actionSuccess || proposal.status;

  // Currency of the proposal (defaults to proposal currency or teacher's profile currency)
  const currency = proposal.currency || profile?.currency || requirement?.currency || 'USD';
  const currencyInfo = getCurrencyInfo(currency);
  const currencySymbol = getCurrencySymbol(currency);
  const presets = getCurrencyPresets(currency);

  const rawProposedFee =
    proposal.proposedMonthlyFee > 0 ? proposal.proposedMonthlyFee : currencyInfo.defaultMonthlyFee;
  const [agreedFeeInput, setAgreedFeeInput] = useState<number>(rawProposedFee);

  // Synchronize when proposal changes
  useEffect(() => {
    if (proposal) {
      const fee =
        proposal.proposedMonthlyFee > 0 ? proposal.proposedMonthlyFee : currencyInfo.defaultMonthlyFee;
      setAgreedFeeInput(fee);
    }
  }, [proposal, currencyInfo.defaultMonthlyFee]);

  // Platform commission calculations (85% teacher net / 15% QariConnect one-time first month only)
  const activeAgreedFee = agreedFeeInput > 0 ? agreedFeeInput : rawProposedFee;
  const teacherShare = Number((activeAgreedFee * (1 - COMMISSION_RATE)).toFixed(2));
  const platformCut = Number((activeAgreedFee * COMMISSION_RATE).toFixed(2));

  // Resolved fields
  const teacherName = profile?.fullName || proposal.qariName;
  const teacherBio =
    profile?.bio ||
    'Assalamu Alaikum. Experienced Quran tutor dedicated to structured learning, proper pronunciation (Makharij), and nurturing love for the Holy Quran.';
  const qualifications =
    profile?.qualifications || 'Certified Qari & Ijazah in Hafs \'an Asim';
  const experienceYears = profile?.experienceYears ?? 8;
  const subjects = profile?.subjects && profile.subjects.length > 0
    ? profile.subjects
    : ['Quran Recitation', 'Tajweed Rules', 'Noorani Qaida', 'Hifz'];
  const classesGrades = profile?.classesGrades && profile.classesGrades.length > 0
    ? profile.classesGrades
    : ['Primary (Grades 1-5)', 'Middle School (Grades 6-8)', 'Adults'];
  const location = [profile?.city, profile?.country].filter(Boolean).join(', ') || 'Online / Global';
  const languages = profile?.languages?.join(', ') || 'Arabic, English';

  const handleAccept = async () => {
    if (!requirement) return;
    setActionLoading(true);
    try {
      await onAccept(requirement, proposal, activeAgreedFee);
      setActionSuccess('accepted');
    } catch (err) {
      console.error('Error accepting proposal:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await onReject(proposal);
      setActionSuccess('declined');
    } catch (err) {
      console.error('Error rejecting proposal:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChat = () => {
    if (!onStartChat) return;
    onStartChat({
      qariId: proposal.qariId,
      fullName: teacherName,
      title: profile?.title || 'Certified Qari & Tajweed Instructor',
      bio: teacherBio,
      country: profile?.country || 'Global',
      city: profile?.city || '',
      languages: profile?.languages || ['English', 'Arabic'],
      experienceYears,
      hasSanad: profile?.hasSanad ?? true,
      sanadDetails: profile?.sanadDetails,
      qualifications,
      tajweedSpecialization: profile?.tajweedSpecialization || 'Makharij & Tajweed',
      hourlyFee: profile?.hourlyFee || 18,
      monthlyFee: proposal.proposedMonthlyFee,
      preferredAgeGroups: ['All'],
      availability: profile?.availability || 'Flexible',
      avatarUrl: profile?.avatarUrl,
      createdAt: '',
      updatedAt: '',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-emerald-100 overflow-hidden relative my-6 flex flex-col max-h-[92vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 text-white relative shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Proposal Review &bull; #{proposal.id.slice(-6).toUpperCase()}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">
                Teacher Proposal Review
              </h2>
              {requirement && (
                <p className="text-xs text-emerald-200 mt-1 flex items-center gap-2">
                  <span>For student: <strong className="text-white">{requirement.studentName}</strong></span>
                  <span>&bull;</span>
                  <span>
                    Target Budget: {formatCurrency(requirement.monthlyBudget, requirement.currency)}/mo
                  </span>
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Badge in Header */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {currentStatus === 'pending' && (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 border border-amber-300 flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Status: Pending Parent Review</span>
              </span>
            )}
            {currentStatus === 'accepted' && (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-400 text-emerald-950 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: Accepted &amp; Contract Active ({COMMISSION_PERCENTAGE}% Comm / {TEACHER_PAYOUT_PERCENTAGE}% Payout)</span>
              </span>
            )}
            {currentStatus === 'declined' && (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800 border border-gray-300 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>Status: Proposal Declined</span>
              </span>
            )}

            <span className="text-[11px] text-emerald-200/80">
              Submitted on {new Date(proposal.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Action Success Alert */}
          {actionSuccess === 'accepted' && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
              <div className="text-xs">
                <strong className="block font-bold text-sm">Proposal Successfully Accepted!</strong>
                A signed teaching agreement has been activated with {teacherName}. You can now schedule trial lessons and message the teacher.
              </div>
            </div>
          )}

          {actionSuccess === 'declined' && (
            <div className="bg-gray-50 border border-gray-300 rounded-2xl p-4 flex items-center gap-3 text-gray-800 animate-in fade-in">
              <XCircle className="w-6 h-6 text-gray-600 shrink-0" />
              <div className="text-xs">
                <strong className="block font-bold text-sm">Proposal Declined</strong>
                This proposal has been marked as declined. You can still review other proposals or post new requirements.
              </div>
            </div>
          )}

          {/* 1. TEACHER NAME & PROFILE INTRODUCTION */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-4">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={teacherName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-amber-300 font-serif font-black flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {teacherName.charAt(0) || 'Q'}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-950 font-serif">
                      {teacherName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Verified Qari
                    </span>
                    {profile?.hasSanad && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-700" />
                        Sanad Holder
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 font-medium">
                    {profile?.title || 'Senior Quran & Tajweed Instructor'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Globe2 className="w-3.5 h-3.5 text-emerald-700" />
                      {location}
                    </span>
                    <span>&bull;</span>
                    <span>Languages: {languages}</span>
                  </div>
                </div>
              </div>

              {onStartChat && (
                <button
                  onClick={handleChat}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Chat with Qari</span>
                </button>
              )}
            </div>

            {/* Teacher Profile / Introduction */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                Teacher Profile &amp; Introduction
              </span>
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 text-xs sm:text-sm text-gray-800 leading-relaxed italic">
                "{teacherBio}"
              </div>
            </div>

            {/* Subjects & Grades */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Subjects Taught
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {subjects.map((sub, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Classes / Grades
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {classesGrades.map((grade, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {grade}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. QUALIFICATION & EXPERIENCE */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>Qualification &amp; Experience</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Qualification */}
              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[11px] text-gray-500 font-semibold block flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  Academic &amp; Quranic Qualifications
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                  {qualifications}
                </p>
                {profile?.sanadDetails && (
                  <p className="text-[11px] text-gray-600 mt-1 italic">
                    Chain: {profile.sanadDetails}
                  </p>
                )}
              </div>

              {/* Experience */}
              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[11px] text-gray-500 font-semibold block flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                  Teaching Experience &amp; Specialization
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                  {experienceYears} Years of Professional Quran Teaching
                </p>
                <p className="text-[11px] text-gray-600 mt-1">
                  Specialization: {profile?.tajweedSpecialization || 'Makharij, Sifat & Tajweed Rules'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. PROPOSED SERVICE / TEACHING FEE & AGREED FEE */}
          <div className="bg-white rounded-2xl border-2 border-emerald-200/90 p-5 shadow-xs space-y-4 bg-linear-to-b from-emerald-50/20 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                  <span>Proposed Service &amp; Agreed Fee Terms ({currency})</span>
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Fee currency: {currencyInfo.name} ({currency}) &bull; {COMMISSION_PERCENTAGE}% platform commission / {TEACHER_PAYOUT_PERCENTAGE}% teacher receives
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-2xl font-black font-serif text-emerald-950">
                  {formatCurrency(activeAgreedFee, currency)}{' '}
                  <span className="text-xs font-normal text-gray-500">/ month</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-800">
                  {proposal.hoursPerWeek} classes per week
                </div>
              </div>
            </div>

            {/* AGREED FEE INPUT */}
            {isOwner && currentStatus === 'pending' && (
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3.5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label
                      htmlFor="review-agreed-fee"
                      className="block text-xs font-bold uppercase tracking-wider text-emerald-950"
                    >
                      Agreed Fee Input ({currency})
                    </label>
                    <p className="text-[11px] text-emerald-900/80">
                      Confirm or adjust the agreed fee in {currency} before creating the contract:
                    </p>
                  </div>

                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-gray-700 text-sm select-none pointer-events-none">
                      {currencySymbol}
                    </span>
                    <input
                      id="review-agreed-fee"
                      type="number"
                      min={1}
                      max={500000}
                      step={currency === 'PKR' ? 100 : 5}
                      value={agreedFeeInput}
                      onChange={(e) => setAgreedFeeInput(Number(e.target.value) || 0)}
                      className="pl-11 pr-3 py-1.5 w-36 text-base font-extrabold font-serif text-gray-950 bg-white rounded-xl border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wide mr-1">
                    Presets ({currency}):
                  </span>
                  {presets.map((preset: number) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAgreedFeeInput(preset)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                        activeAgreedFee === preset
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-white text-gray-700 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {formatCurrency(preset, currency)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Display: 4 Required Items */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Agreed Fee */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="text-[11px] text-gray-500 block font-bold uppercase tracking-wider">
                  Agreed Fee: {currency}
                </span>
                <span className="text-lg font-extrabold text-emerald-950 font-serif block mt-0.5">
                  {formatCurrency(activeAgreedFee, currency)}
                </span>
                <span className="text-[10px] text-gray-500 mt-1 block">Monthly agreed fee</span>
              </div>

              {/* QariConnect commission: 15% (Month 1 only) */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-amber-900 block font-bold uppercase tracking-wider">Platform Commission</span>
                  <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-1 rounded">{COMMISSION_PERCENTAGE}% (Month 1)</span>
                </div>
                <span className="text-lg font-extrabold text-amber-950 font-serif block mt-0.5">
                  {formatCurrency(platformCut, currency)}
                </span>
                <span className="text-[10px] text-amber-800 mt-1 block">One-time {COMMISSION_PERCENTAGE}% on first month only</span>
              </div>

              {/* Teacher receives: 90% */}
              <div className="bg-white p-3.5 rounded-xl border border-teal-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-teal-900 block font-bold uppercase tracking-wider">Teacher receives</span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-1 rounded">{TEACHER_PAYOUT_PERCENTAGE}%</span>
                </div>
                <span className="text-lg font-extrabold text-emerald-900 font-serif block mt-0.5">
                  {formatCurrency(teacherShare, currency)}
                </span>
                <span className="text-[10px] text-emerald-700 mt-1 block">{TEACHER_PAYOUT_PERCENTAGE}% of agreed fee</span>
              </div>

              {/* Payment status: Pending */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-300 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-amber-900 block font-bold uppercase tracking-wider">Payment status</span>
                  <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-400 text-amber-950 shadow-2xs">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                </div>
                <span className="text-[10px] text-amber-800 mt-1 block">Calculated upon confirmation</span>
              </div>
            </div>
          </div>

          {/* 4. TEACHER'S MESSAGE / PROPOSAL PLAN */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
              <span>Teacher's Message &amp; Personalized Proposal</span>
            </span>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line font-normal">
              {proposal.message}
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-2 self-start sm:self-auto">
            <span>Proposal ID: <strong className="font-mono text-gray-700">{proposal.id}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-white text-gray-700 text-xs font-bold cursor-pointer transition"
            >
              Back to Requests
            </button>

            {/* Reject Button */}
            {isOwner && currentStatus === 'pending' && (
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject Proposal</span>
              </button>
            )}

            {/* Accept Button */}
            {isOwner && currentStatus === 'pending' && (
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>{actionLoading ? 'Processing...' : 'Accept Proposal & Create Contract'}</span>
              </button>
            )}

            {currentStatus === 'accepted' && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Accepted &bull; Contract Active</span>
                </div>
                {onViewAgreement && (
                  <button
                    onClick={() => onViewAgreement(proposal, requirement)}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-300" />
                    <span>View Agreement Stage</span>
                  </button>
                )}
              </div>
            )}

            {currentStatus === 'declined' && (
              <div className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 border border-gray-300">
                <XCircle className="w-4 h-4 text-gray-500" />
                <span>Proposal Declined</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
