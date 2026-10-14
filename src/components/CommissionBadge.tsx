import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShieldCheck,
  Info,
  CheckCircle2,
  Globe2,
  X,
  ArrowLeft,
  Phone,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import {
  CURRENCY_LIST,
  formatCurrency,
  calculateCommission,
  COMMISSION_PERCENTAGE,
  TEACHER_PAYOUT_PERCENTAGE,
  QARICONNECT_SUPPORT,
} from '../data/currencies';

export const CommissionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialCurrency?: string;
  initialAmount?: number;
}> = ({
  isOpen,
  onClose,
  initialCurrency = 'PKR',
  initialAmount,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(initialCurrency);

  // Close on Escape key press
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

  if (!isOpen) return null;

  const defaultSample =
    selectedCurrency === 'PKR' ? 5000 : selectedCurrency === 'SAR' || selectedCurrency === 'AED' ? 400 : 100;
  const sampleFee = initialAmount && initialAmount > 0 ? initialAmount : defaultSample;
  const { teacherPayout, commissionAmount } = calculateCommission(sampleFee, true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="commission-modal-title"
    >
      {/* Modal Dialog Card */}
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-emerald-100 relative flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5 bg-linear-to-r from-emerald-900 to-teal-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 id="commission-modal-title" className="text-lg sm:text-xl font-bold font-serif text-white">
                One-Time {COMMISSION_PERCENTAGE}% Platform Fee Policy
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                Charged ONLY on Month 1 &bull; 0% Commission on Months 2+
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold transition cursor-pointer shrink-0"
            aria-label="Close Modal"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 text-sm text-gray-700 overflow-y-auto flex-1">
          {/* Key Rule Callout Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>One-Time Fee Guarantee:</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              QariConnect charges a <strong>one-time 15% platform commission ONLY on the first month's tuition fee</strong>. This is <strong>NOT charged on subsequent recurring monthly fees</strong>. From month 2 onwards, teachers retain <strong>100% of all student payments</strong>.
            </p>
          </div>

          <p className="leading-relaxed text-xs sm:text-sm">
            Students pay the agreed tuition fee directly to the teacher via EasyPaisa, JazzCash, or Bank Transfer. At the end of the first month, the teacher submits the 15% onboarding commission to QariConnect with payment proof sent to our official WhatsApp support.
          </p>

          <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fees and commissions are always calculated in the teacher's selected fee currency with zero hidden conversion markups.</span>
          </p>

          {/* Interactive Currency Selector for Example */}
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700 pt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>Example Currency Calculator:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-gray-300 bg-white font-bold text-emerald-950 focus:outline-emerald-600"
            >
              {CURRENCY_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Breakdown Graphic */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4">
            <div className="text-xs font-semibold text-emerald-900 mb-2 uppercase tracking-wider">
              First Month Breakdown on {formatCurrency(sampleFee, selectedCurrency)}:
            </div>
            <div className="flex items-center justify-between py-2 border-b border-emerald-200/50">
              <span className="text-gray-800 font-medium">Agreed First Month Fee ({selectedCurrency}):</span>
              <span className="text-gray-900 font-bold">{formatCurrency(sampleFee, selectedCurrency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-emerald-200/50 text-emerald-900">
              <span className="flex items-center gap-1.5 font-medium">
                <span>Teacher Receives ({TEACHER_PAYOUT_PERCENTAGE}% Month 1):</span>
              </span>
              <span className="font-bold text-emerald-800">{formatCurrency(teacherPayout, selectedCurrency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-emerald-200/50 text-amber-900">
              <span className="flex items-center gap-1.5 font-medium">
                <span>QariConnect One-Time Fee ({COMMISSION_PERCENTAGE}% Month 1 Only):</span>
              </span>
              <span className="font-bold text-amber-800">{formatCurrency(commissionAmount, selectedCurrency)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-emerald-900 text-xs font-bold bg-white/70 px-2 rounded-lg mt-1 border border-emerald-200">
              <span>Subsequent Months (Month 2+):</span>
              <span className="text-emerald-800">Teacher Keeps 100% ({formatCurrency(sampleFee, selectedCurrency)})</span>
            </div>
          </div>

          {/* Official Payment Methods & WhatsApp Submission Notice */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-700" />
              <span>Official Payment Channels &amp; Fee Submission</span>
            </div>
            <div className="text-xs text-amber-950 space-y-1.5">
              <div>
                <strong>Accepted Methods:</strong> {QARICONNECT_SUPPORT.paymentMethods.join(', ')}
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/70 text-xs text-amber-900">
                Please submit the first month's one-time 15% receipt to our official WhatsApp support:{' '}
                <a
                  href={QARICONNECT_SUPPORT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-800 underline hover:text-emerald-950 inline-flex items-center gap-1 ml-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {QARICONNECT_SUPPORT.whatsappDisplay}
                </a>
              </div>
            </div>
          </div>

          {/* Support breakdown */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
              What does the one-time {COMMISSION_PERCENTAGE}% fee fund?
            </h4>
            <div className="grid gap-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Sanad &amp; Background Verification:</strong> Manual vetting of teacher credentials, Ijazah authenticity, and recitation.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Child Safety &amp; Parent Oversight:</strong> Safe communication channels, lesson tracking, and agreement mediation.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>24/7 Support Hotline:</strong> Real-time support at {QARICONNECT_SUPPORT.whatsappDisplay} for inquiries and lesson coordination.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <a
            href={QARICONNECT_SUPPORT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 border border-emerald-300"
          >
            <MessageCircle className="w-4 h-4 text-emerald-700" />
            <span>Support: {QARICONNECT_SUPPORT.whatsappDisplay}</span>
          </a>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Application</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const CommissionNoticeBar: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-linear-to-r from-emerald-950 via-emerald-800 to-teal-900 text-white py-2 px-3 sm:px-4 text-xs font-medium border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center flex-wrap gap-2">
            <span className="px-2 py-0.5 bg-amber-400 text-emerald-950 font-bold rounded-sm text-[10px] tracking-wide uppercase">
              15% One-Time Commission
            </span>
            <span className="text-emerald-100 text-[11px] sm:text-xs">
              Charged <strong>ONLY ONCE</strong> on the first month (0% recurring fee on subsequent months &bull; Teachers keep 100%).
            </span>
            <span className="hidden md:inline text-emerald-300 text-[11px]">
              &bull; WhatsApp Support: <strong className="text-white">{QARICONNECT_SUPPORT.whatsappDisplay}</strong>
            </span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-700/60 hover:bg-emerald-600 text-white text-[11px] sm:text-xs font-semibold cursor-pointer transition border border-emerald-500/40"
            title="View One-Time Commission & Payment Details"
          >
            <Info className="w-3.5 h-3.5 text-amber-300" />
            <span>Commission Policy</span>
          </button>
        </div>
      </div>

      <CommissionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
