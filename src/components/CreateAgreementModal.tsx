import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Calendar,
  DollarSign,
  User,
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle2,
  Globe2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QariProfile, LearningRequirement } from '../types';
import { createTeachingAgreement } from '../services/marketplaceService';
import {
  formatCurrency,
  getCurrencySymbol,
  CURRENCY_LIST,
  getCurrencyInfo,
  COMMISSION_RATE,
  COMMISSION_PERCENTAGE,
  TEACHER_PAYOUT_PERCENTAGE,
} from '../data/currencies';

interface CreateAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetQari: QariProfile | null;
  targetRequirement?: LearningRequirement | null;
  onSuccess: () => void;
}

export const CreateAgreementModal: React.FC<CreateAgreementModalProps> = ({
  isOpen,
  onClose,
  targetQari,
  targetRequirement,
  onSuccess,
}) => {
  const { userProfile } = useAuth();

  const initialCurrency = targetQari?.currency || targetRequirement?.currency || 'USD';
  const [currency, setCurrency] = useState<string>(initialCurrency);

  const [studentName, setStudentName] = useState(targetRequirement?.studentName || 'Zayd Rahman');
  const [subject, setSubject] = useState(
    targetRequirement
      ? `${targetRequirement.currentLevel} - ${targetRequirement.goals.join(', ')}`
      : 'Nazra Quran & Tajweed Rules with Makharij'
  );
  const [monthlyFee, setMonthlyFee] = useState<number>(
    targetQari?.monthlyFee ||
      targetRequirement?.monthlyBudget ||
      (initialCurrency === 'PKR' ? 5000 : 100)
  );
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(
    targetRequirement?.weeklyFrequency || 3
  );
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(
    targetRequirement?.notes ||
      'Classes 3 times weekly (45 mins per session). Timings agreed in messages.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);
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

  if (!isOpen || !targetQari) return null;

  // 15% one-time platform commission calculation (first month only - Teacher receives 85%)
  const platformCommissionAmount = Number((monthlyFee * COMMISSION_RATE).toFixed(2));
  const teacherPayoutAmount = Number((monthlyFee * (1 - COMMISSION_RATE)).toFixed(2));
  const currencySymbol = getCurrencySymbol(currency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || monthlyFee <= 0) return;

    setSubmitting(true);
    try {
      const parentId = userProfile?.uid || 'demo_parent_user';
      const parentName = userProfile?.displayName || 'Parent / Student';

      await createTeachingAgreement({
        requirementId: targetRequirement?.id,
        parentId,
        parentName,
        qariId: targetQari.qariId,
        qariName: targetQari.fullName,
        studentName,
        subject,
        monthlyFee: Number(monthlyFee),
        currency,
        hoursPerWeek: Number(hoursPerWeek),
        startDate,
        notes,
      });

      setSuccessState(true);
      setTimeout(() => {
        setSuccessState(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error creating agreement:', err);
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
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-emerald-100 overflow-hidden relative my-6 animate-in fade-in zoom-in-95 duration-150 cursor-default"
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Create Quran Teaching Contract</h2>
              <p className="text-xs text-emerald-200">
                Formal learning agreement with {targetQari.fullName}
              </p>
            </div>
          </div>
        </div>

        {successState ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Contract Successfully Created!</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              The teaching agreement is now active. The {COMMISSION_PERCENTAGE}% platform commission ({formatCurrency(platformCommissionAmount, currency)}) and {TEACHER_PAYOUT_PERCENTAGE}% teacher payout ({formatCurrency(teacherPayoutAmount, currency)}) have been recorded in the transaction ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Teacher Card summary */}
            <div className="flex items-center gap-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <img
                src={
                  targetQari.avatarUrl ||
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150'
                }
                alt={targetQari.fullName}
                className="w-12 h-12 rounded-xl object-cover border border-emerald-300"
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-emerald-950">{targetQari.fullName}</div>
                <div className="text-xs text-gray-600 truncate">{targetQari.title}</div>
                <div className="text-[11px] text-emerald-800 font-medium">
                  {targetQari.hasSanad ? '✓ Verified Sanad Muttasil' : 'Verified Instructor'}
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Student Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Zayd Rahman"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Subject & Syllabus Focus *
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Noorani Qaida, Nazra Quran, Tajweed Makharij, Hifz"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
                  />
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
                      setMonthlyFee(info.defaultMonthlyFee);
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
                    Monthly Agreed Tuition ({currencySymbol}) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-gray-400 text-xs select-none pointer-events-none">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      step={currency === 'PKR' ? 100 : 5}
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Classes / Week *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      required
                      min={1}
                      max={20}
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Schedule & Special Terms
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Class timings: Mon, Wed, Fri at 17:00 GMT via Zoom"
                  className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
                />
              </div>

              {/* Commission Calculation Card */}
              <div className="bg-linear-to-br from-amber-50/70 to-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 uppercase tracking-wider pb-1 border-b border-gray-200/60">
                  <span>Transparent Fee & Commission Breakdown</span>
                  <span className="text-emerald-800 font-semibold">{currency} Transaction</span>
                </div>

                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200/40">
                  <span className="text-gray-700 font-medium">Agreed First Fee:</span>
                  <span className="text-gray-950 font-bold">{formatCurrency(monthlyFee, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200/40 text-emerald-900">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Teacher Receives ({TEACHER_PAYOUT_PERCENTAGE}%):
                  </span>
                  <span className="font-extrabold text-emerald-800">{formatCurrency(teacherPayoutAmount, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-sm py-1 border-b border-gray-200/40 text-amber-950">
                  <span className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    QariConnect Commission ({COMMISSION_PERCENTAGE}%):
                  </span>
                  <span className="font-extrabold text-amber-900">{formatCurrency(platformCommissionAmount, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-xs py-1 text-gray-700">
                  <span className="font-medium">Payment Status:</span>
                  <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">Pending</span>
                </div>

                <p className="text-[11px] text-gray-500 italic pt-1">
                  *Calculated in transaction currency ({currency}). 15% platform commission is charged ONLY on the first month's fee (0% recurring commission on subsequent months).
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
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
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                {submitting ? 'Creating Contract...' : 'Agree & Create Contract'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
