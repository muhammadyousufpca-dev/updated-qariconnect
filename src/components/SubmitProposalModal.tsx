import React, { useState } from 'react';
import {
  X,
  DollarSign,
  Clock,
  Send,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LearningRequirement, Proposal } from '../types';
import { submitProposal } from '../services/marketplaceService';
import {
  formatCurrency,
  getCurrencyInfo,
  getCurrencySymbol,
  getCurrencyPresets,
  CURRENCY_LIST,
  COMMISSION_RATE,
  COMMISSION_PERCENTAGE,
  TEACHER_PAYOUT_PERCENTAGE,
} from '../data/currencies';

interface SubmitProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: LearningRequirement | null;
  onSubmitted: (proposal: Proposal) => void;
}

export const SubmitProposalModal: React.FC<SubmitProposalModalProps> = ({
  isOpen,
  onClose,
  requirement,
  onSubmitted,
}) => {
  const { userProfile, qariProfile } = useAuth();

  const [currency, setCurrency] = useState<string>(
    qariProfile?.currency || requirement?.currency || 'USD'
  );
  const [proposedMonthlyFee, setProposedMonthlyFee] = useState<number>(
    qariProfile?.monthlyFee || requirement?.monthlyBudget || 100
  );
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(
    requirement?.weeklyFrequency || 3
  );
  const [message, setMessage] = useState(
    'Assalamu Alaikum. I reviewed your learning requirements and would be delighted to teach your child. I will focus on proper Makharij, step-by-step Tajweed, and keeping lessons interactive and enjoyable.'
  );
  const [submitting, setSubmitting] = useState(false);

  // Handle ESC key press to close cleanly
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !requirement) return null;

  const presets = getCurrencyPresets(currency);
  const currencySymbol = getCurrencySymbol(currency);

  // 15% one-time platform commission (first month only) / 85% teacher payout
  const platformCut = Number((proposedMonthlyFee * COMMISSION_RATE).toFixed(2));
  const teacherTakeHome = Number((proposedMonthlyFee * (1 - COMMISSION_RATE)).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (proposedMonthlyFee <= 0 || !message.trim()) return;

    setSubmitting(true);
    try {
      const qariId = userProfile?.uid || 'seed_qari_1';
      const qariName = qariProfile?.fullName || userProfile?.displayName || 'Sheikh Ahmad Al-Masri';

      const newProposal = await submitProposal({
        requirementId: requirement.id,
        qariId,
        qariName,
        parentId: requirement.parentId,
        proposedMonthlyFee: Number(proposedMonthlyFee),
        currency,
        hoursPerWeek: Number(hoursPerWeek),
        message,
        teacherProfile: {
          fullName: qariName,
          title: qariProfile?.title || 'Certified Qari & Tajweed Instructor',
          bio: qariProfile?.bio || 'Experienced Quran tutor dedicated to personalized teaching with proper Makharij and Tajweed rules.',
          qualifications: qariProfile?.qualifications || 'Certified Qari & Ijazah Holder',
          experienceYears: qariProfile?.experienceYears ?? 8,
          country: qariProfile?.country || 'Egypt',
          city: qariProfile?.city || 'Cairo',
          contactNumber: qariProfile?.contactNumber || '',
          languages: qariProfile?.languages || ['Arabic (Native)', 'English (Fluent)'],
          hasSanad: qariProfile?.hasSanad ?? true,
          sanadDetails: qariProfile?.sanadDetails || 'Sanad in Riwayah Hafs \'an Asim',
          tajweedSpecialization: qariProfile?.tajweedSpecialization || 'Makharij & Tajweed Rules',
          hourlyFee: qariProfile?.hourlyFee || 18,
          monthlyFee: Number(proposedMonthlyFee),
          currency,
          subjects: qariProfile?.subjects || ['Quran Recitation', 'Tajweed', 'Hifz'],
          classesGrades: qariProfile?.classesGrades || ['All Age Groups'],
          avatarUrl: qariProfile?.avatarUrl || '',
        },
      });

      onSubmitted(newProposal);
      onClose();
    } catch (err) {
      console.error('Error submitting proposal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden relative my-6 animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Submit Teaching Proposal</h2>
              <p className="text-xs text-emerald-200">
                Responding to {requirement.parentName} for student {requirement.studentName}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Requirement Context preview */}
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs text-gray-700 space-y-1">
            <div className="font-semibold text-gray-900">
              Student: {requirement.studentName} ({requirement.studentAge} yrs) • {requirement.currentLevel}
            </div>
            <div className="text-gray-500">
              Parent Budget: {formatCurrency(requirement.monthlyBudget, requirement.currency)}/month •{' '}
              {requirement.country} • {requirement.preferredTiming}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Currency *
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  const newC = e.target.value;
                  setCurrency(newC);
                  const info = getCurrencyInfo(newC);
                  setProposedMonthlyFee(info.defaultMonthlyFee);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-emerald-600 font-bold"
              >
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Proposed Fee ({currencySymbol}) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-bold text-gray-400 text-xs select-none pointer-events-none">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  max={500000}
                  value={proposedMonthlyFee}
                  onChange={(e) => setProposedMonthlyFee(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Hours / Classes
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  required
                  min={1}
                  max={15}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Quick presets for proposed fee */}
          <div className="flex flex-wrap items-center gap-1.5 -mt-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mr-1">
              Presets ({currency}):
            </span>
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setProposedMonthlyFee(preset)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                  proposedMonthlyFee === preset
                    ? 'bg-amber-400 text-amber-950'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatCurrency(preset, currency)}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Introduction &amp; Teaching Plan for the Parent *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce your experience, teaching style, trial lesson offer, and how you will help the student reach their goals..."
              className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
            />
          </div>

          {/* 15% one-time commission breakdown card */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs">
            <div className="font-bold text-emerald-950 flex items-center justify-between pb-1 border-b border-emerald-200/50">
              <span>Commission Breakdown ({currency})</span>
              <span className="text-[10px] text-amber-900 font-semibold uppercase bg-amber-100 px-2 py-0.5 rounded">
                {COMMISSION_PERCENTAGE}% One-Time (Month 1 Only)
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Proposed Fee:</span>
              <span className="font-bold text-gray-950 font-mono">{formatCurrency(proposedMonthlyFee, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-900 font-medium">
              <span>Teacher receives ({TEACHER_PAYOUT_PERCENTAGE}%):</span>
              <span className="font-extrabold text-emerald-800 font-mono">{formatCurrency(teacherTakeHome, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-amber-900 font-medium">
              <span>QariConnect commission ({COMMISSION_PERCENTAGE}%):</span>
              <span className="font-extrabold text-amber-900 font-mono">{formatCurrency(platformCut, currency)}</span>
            </div>
            <div className="pt-1 border-t border-emerald-200/40 flex justify-between items-center text-[11px] text-gray-600 font-medium">
              <span>Payment status:</span>
              <span className="text-amber-900 font-bold bg-amber-200/80 px-2 py-0.2 rounded text-[10px]">Pending</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-amber-300" />
              {submitting ? 'Submitting...' : 'Send Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
