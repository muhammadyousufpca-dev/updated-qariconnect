import React from 'react';
import {
  X,
  Award,
  Globe2,
  Clock,
  Star,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Calendar,
  BookOpen,
  Lock,
} from 'lucide-react';
import { QariProfile } from '../types';
import {
  formatCurrency,
  COMMISSION_RATE,
  COMMISSION_PERCENTAGE,
  TEACHER_PAYOUT_PERCENTAGE,
  maskContactNumber,
} from '../data/currencies';
import { useAuth } from '../context/AuthContext';

interface QariDetailModalProps {
  qari: QariProfile | null;
  onClose: () => void;
  onMessage: (qari: QariProfile) => void;
  onInitiateAgreement: (qari: QariProfile) => void;
  onBookTrial?: (qari: QariProfile) => void;
}

export const QariDetailModal: React.FC<QariDetailModalProps> = ({
  qari,
  onClose,
  onMessage,
  onInitiateAgreement,
  onBookTrial,
}) => {
  const { isSuperAdmin } = useAuth();

  // Close on Escape key press
  React.useEffect(() => {
    if (!qari) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qari, onClose]);

  if (!qari) return null;

  // 15% one-time platform commission calculation preview (85% teacher payout on month 1)
  const platformFee = (qari.monthlyFee * COMMISSION_RATE).toFixed(2);
  const teacherPayout = (qari.monthlyFee * (1 - COMMISSION_RATE)).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-emerald-100 overflow-hidden relative my-8 animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold transition cursor-pointer"
            aria-label="Wapis Jayein (Close)"
            title="Wapis Jayein (Close)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Wapis (Close)</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={
                qari.avatarUrl ||
                'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300'
              }
              alt={qari.fullName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-300 shadow-md shrink-0"
            />
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif">{qari.fullName}</h2>
                {qari.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 font-medium">{qari.title}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-emerald-300">
                <span className="flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5" />
                  {qari.city ? `${qari.city}, ${qari.country}` : qari.country}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {qari.experienceYears} Years Exp
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {qari.rating || 5.0} ({qari.reviewCount || 10} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Sanad / Ijazah Highlight Card */}
          {qari.hasSanad && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Authentic Sanad Muttasil (Ijazah)</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-semibold">
                    Verified Chain
                  </span>
                </h4>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  {qari.sanadDetails ||
                    'Teacher holds a direct chain of transmission (Sanad) connecting back to the Prophet Muhammad ﷺ.'}
                </p>
              </div>
            </div>
          )}

          {/* Contact Details Privacy & Protection */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wide">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Contact Details Privacy</span>
                {isSuperAdmin ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Super Admin View
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Protected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">
                {isSuperAdmin ? (
                  <span>
                    Direct Contact: <strong className="font-mono text-emerald-950 font-bold">{qari.contactNumber || 'Not provided'}</strong>
                  </span>
                ) : (
                  <span>
                    Phone/WhatsApp: <strong className="font-mono text-gray-800">{maskContactNumber(qari.contactNumber, false)}</strong>. Direct details are masked to ensure child safety and prevent off-platform contract bypass.
                  </span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onMessage(qari)}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
              <span>Send Message In-App</span>
            </button>
          </div>

          {/* About / Bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Teacher Introduction &amp; Methodology
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/70 p-4 rounded-xl border border-gray-100">
              {qari.bio}
            </p>
          </div>

          {/* Qualifications & Specialization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide mb-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Tajweed Specialization
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {qari.tajweedSpecialization}
              </p>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide mb-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                Formal Qualifications
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {qari.qualifications}
              </p>
            </div>
          </div>

          {/* Languages & Age Groups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-gray-700 block mb-1">Languages Spoken:</span>
              <div className="flex flex-wrap gap-1.5">
                {qari.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-gray-700 block mb-1">Preferred Student Age:</span>
              <div className="flex flex-wrap gap-1.5">
                {qari.preferredAgeGroups.map((group, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-medium"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Teaching Availability */}
          <div className="flex items-start gap-2.5 bg-gray-50 p-3 rounded-xl border border-gray-200/60 text-xs text-gray-700">
            <Calendar className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-900">Teaching Availability: </span>
              <span>{qari.availability}</span>
            </div>
          </div>

          {/* Transparent Fee & Commission Breakdown */}
          <div className="bg-linear-to-r from-emerald-50 to-teal-50/60 border border-emerald-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
              <div>
                <div className="text-xs text-gray-600 font-medium">Monthly Tuition Fee</div>
                <div className="text-2xl font-extrabold text-emerald-950 font-serif">
                  {formatCurrency(qari.monthlyFee, qari.currency)}
                  <span className="text-xs font-normal text-gray-500"> / month</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 font-medium">Approx. Hourly Rate</div>
                <div className="text-lg font-bold text-gray-800">{formatCurrency(qari.hourlyFee, qari.currency)} / hr</div>
              </div>
            </div>

            {/* Transparent 15% One-Time Breakdown */}
            <div className="mt-3 pt-2 text-xs space-y-1.5 text-gray-700">
              <div className="flex justify-between items-center text-gray-600">
                <span>Teacher Payout (Month 1 - {TEACHER_PAYOUT_PERCENTAGE}%):</span>
                <span className="font-semibold text-emerald-800">{formatCurrency(Number(teacherPayout), qari.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span className="flex items-center gap-1">
                  <span>QariConnect One-Time Fee (Month 1 Only - {COMMISSION_PERCENTAGE}%):</span>
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                </span>
                <span className="font-semibold text-amber-800">{formatCurrency(Number(platformFee), qari.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-950 font-bold bg-white/80 p-2 rounded-lg border border-emerald-200">
                <span>Subsequent Months (Month 2+):</span>
                <span className="text-emerald-800 font-extrabold">Teacher Keeps 100% &bull; 0% Commission</span>
              </div>
              <p className="text-[11px] text-gray-500 italic pt-1">
                *The 15% platform commission is charged ONLY ONCE on the first month's tuition. Recurring months have 0% commission.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition cursor-pointer"
          >
            Back / Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {onBookTrial && (
              <button
                onClick={() => onBookTrial(qari)}
                className="px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Calendar className="w-4 h-4 text-amber-700" />
                Book Free Trial (30m)
              </button>
            )}

            <button
              onClick={() => onMessage(qari)}
              className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              Send Message
            </button>

            <button
              onClick={() => onInitiateAgreement(qari)}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/20"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              Agree & Create Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
