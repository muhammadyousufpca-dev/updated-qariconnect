import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  GraduationCap,
  Calendar,
  DollarSign,
  FileText,
  Sparkles,
  BookOpen,
  MessageSquare,
  AlertCircle,
  Award,
  CheckCheck,
  RefreshCw,
  TrendingUp,
  Receipt,
  Calculator,
} from 'lucide-react';
import { Agreement } from '../types';
import { updateAgreementStatus, updateAgreementFee } from '../services/marketplaceService';
import {
  formatCurrency,
  getCurrencyInfo,
  getCurrencySymbol,
  getCurrencyPresets,
  COMMISSION_RATE,
  COMMISSION_PERCENTAGE,
  TEACHER_PAYOUT_PERCENTAGE,
  QARICONNECT_SUPPORT,
} from '../data/currencies';

interface AgreementStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: Agreement;
  onStatusUpdated?: (updatedAgreement: Agreement) => void;
  viewerRole?: 'parent' | 'qari' | 'admin';
}

export const AgreementStageModal: React.FC<AgreementStageModalProps> = ({
  isOpen,
  onClose,
  agreement: initialAgreement,
  onStatusUpdated,
  viewerRole = 'parent',
}) => {
  const [agreement, setAgreement] = useState<Agreement>(initialAgreement);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync state if initialAgreement prop updates
  React.useEffect(() => {
    setAgreement(initialAgreement);
  }, [initialAgreement]);

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

  if (!isOpen || !agreement) return null;

  // Normalize status
  const currentStatus: 'pending' | 'accepted' | 'completed' =
    agreement.status === 'completed'
      ? 'completed'
      : agreement.status === 'pending'
      ? 'pending'
      : 'accepted';

  const handleUpdateStatus = async (newStatus: 'pending' | 'accepted' | 'completed') => {
    setUpdatingStatus(true);
    setStatusMessage(null);
    try {
      await updateAgreementStatus(agreement.id, newStatus);
      const updated = { ...agreement, status: newStatus };
      setAgreement(updated);
      setStatusMessage(`Agreement status updated to ${newStatus.toUpperCase()}`);
      if (onStatusUpdated) {
        onStatusUpdated(updated);
      }
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Error updating agreement status:', err);
      setStatusMessage('Could not update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formattedDate = agreement.createdAt
    ? new Date(agreement.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString();

  const confirmationTime = agreement.bothAgreedConfirmation?.agreedAt
    ? new Date(agreement.bothAgreedConfirmation.agreedAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date(agreement.createdAt || Date.now()).toLocaleString();

  const currency = agreement.currency || agreement.paymentSummary?.currency || 'USD';
  const currencyInfo = getCurrencyInfo(currency);
  const currencySymbol = currencyInfo.symbol;
  const presets = getCurrencyPresets(currency);

  const rawFee = agreement.agreedFirstFee ?? agreement.monthlyFee ?? currencyInfo.defaultMonthlyFee;
  const defaultFee = rawFee > 0 ? rawFee : currencyInfo.defaultMonthlyFee;

  const [feeInput, setFeeInput] = useState<string>(String(defaultFee));
  const [savingFee, setSavingFee] = useState<boolean>(false);
  const [feeSavedNotice, setFeeSavedNotice] = useState<boolean>(false);

  // Parse active fee from input, falling back to default fee
  const numericInput = parseFloat(feeInput);
  const activeFee = !isNaN(numericInput) && numericInput > 0 ? numericInput : defaultFee;

  // QariConnect 15% One-Time Commission & 85% Teacher Direct Payout (Month 1 only)
  const commissionRate = COMMISSION_RATE; // 15% one-time
  const teacherShareRate = 1 - COMMISSION_RATE; // 85%
  const qariConnectCommission = Number((activeFee * commissionRate).toFixed(2));
  const teacherReceives = Number((activeFee * teacherShareRate).toFixed(2));
  const paymentStatus = agreement.paymentStatus || 'Pending';

  const formatFee = (amount: number) => formatCurrency(amount, currency);

  const exampleAgreedFee = presets[1] || currencyInfo.defaultMonthlyFee;
  const examplePlatformCut = Number((exampleAgreedFee * COMMISSION_RATE).toFixed(2));
  const exampleTeacherCut = Number((exampleAgreedFee * (1 - COMMISSION_RATE)).toFixed(2));

  const handleSaveFee = async () => {
    if (activeFee <= 0) return;
    setSavingFee(true);
    try {
      const res = await updateAgreementFee(agreement.id, activeFee, currency);
      const updated = {
        ...agreement,
        ...res.agreementUpdates,
      };
      setAgreement(updated);
      if (onStatusUpdated) {
        onStatusUpdated(updated);
      }
      setFeeSavedNotice(true);
      setTimeout(() => setFeeSavedNotice(false), 3500);
    } catch (err) {
      console.error('Failed to update agreement fee in Firestore:', err);
    } finally {
      setSavingFee(false);
    }
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
        {/* Header with Islamic Aesthetics */}
        <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 text-white relative shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>QariConnect &bull; Formal Agreement Stage</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">
                Teaching Agreement &amp; Contract Terms
              </h2>
              <p className="text-xs text-emerald-200 mt-1 flex items-center gap-2">
                <span>Contract ID: <strong className="font-mono text-white">{agreement.id}</strong></span>
                <span>&bull;</span>
                <span>Created: {formattedDate}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper: Pending -> Terms Confirmed -> Payment Summary */}
          <div className="mt-5 pt-4 border-t border-emerald-800/80">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              {/* Step 1: Pending */}
              <div
                className={`p-2.5 rounded-xl border text-xs transition ${
                  currentStatus === 'pending'
                    ? 'bg-amber-400 text-amber-950 font-bold border-amber-300 shadow-sm'
                    : 'bg-white/5 text-emerald-200 border-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">1. Proposal</span>
                </div>
                <span className="text-[10px] opacity-80 block mt-0.5">Submitted</span>
              </div>

              {/* Step 2: Accepted / Confirmed */}
              <div
                className={`p-2.5 rounded-xl border text-xs transition ${
                  currentStatus === 'accepted' || currentStatus === 'completed'
                    ? 'bg-emerald-500 text-emerald-950 font-bold border-emerald-300 shadow-sm'
                    : 'bg-white/5 text-emerald-200 border-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">2. Confirmed</span>
                </div>
                <span className="text-[10px] opacity-80 block mt-0.5">Both Agreed</span>
              </div>

              {/* Step 3: Payment Summary */}
              <div
                className={`p-2.5 rounded-xl border text-xs transition ${
                  currentStatus === 'accepted' || currentStatus === 'completed'
                    ? 'bg-amber-400 text-amber-950 font-bold border-amber-300 shadow-sm ring-2 ring-amber-300/40'
                    : 'bg-white/5 text-emerald-200 border-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">3. Payment Summary</span>
                </div>
                <span className="text-[10px] opacity-90 block mt-0.5 font-bold">Status: Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-900 font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {statusMessage}
            </span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable Agreement Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-gray-800 flex-1">
          {/* SECTION 1: CLEAR CONFIRMATION THAT BOTH SIDES HAVE AGREED */}
          <div className="bg-linear-to-br from-emerald-50 via-teal-50 to-emerald-100/70 rounded-2xl border-2 border-emerald-200 p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <h3 className="font-bold font-serif text-sm sm:text-base text-emerald-950">
                  Clear Confirmation of Mutual Agreement
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-800 text-white shadow-2xs">
                Both Sides Agreed
              </span>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              {agreement.bothAgreedConfirmation?.confirmationText ||
                `Both parties have officially agreed to the terms: ${agreement.parentName} (Parent) has accepted the teaching proposal and service requirement terms submitted by ${agreement.qariName} (Teacher).`}
            </p>

            {/* Verification checklist for both sides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/80">
              <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-500 block text-[10px] font-medium">Parent Confirmation</span>
                  <strong className="text-gray-900">{agreement.parentName}</strong>
                  <span className="text-[10px] text-emerald-700 block font-medium">✓ Terms Confirmed &amp; Signed</span>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-500 block text-[10px] font-medium">Teacher Confirmation</span>
                  <strong className="text-gray-900">{agreement.qariName}</strong>
                  <span className="text-[10px] text-emerald-700 block font-medium">✓ Proposal &amp; Schedule Committed</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-emerald-800/90 flex items-center justify-between pt-1">
              <span>Timestamp: <strong className="font-mono text-emerald-950">{confirmationTime}</strong></span>
              <span className="font-medium text-emerald-900">QariConnect Verified Digital Agreement</span>
            </div>
          </div>

          {/* SECTION: CLEAR PAYMENT SUMMARY (NEXT STEP AFTER AGREEMENT CONFIRMED) */}
          <div className="bg-linear-to-br from-amber-50/90 via-emerald-50/40 to-teal-50/70 rounded-2xl border-2 border-amber-300/90 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950 shadow-2xs">
                    Next Step in Workflow
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-900">
                    Agreement Confirmed &bull; Payment Summary
                  </span>
                </div>
                <h3 className="text-lg font-bold font-serif text-gray-950 mt-1 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-700" />
                  <span>Payment Summary</span>
                </h3>
              </div>

              {/* Payment Status: Pending */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                <span className="text-xs font-semibold text-gray-500">Payment Status:</span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-400 text-amber-950 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed font-medium">
              After agreement confirmation between <strong>{agreement.parentName}</strong> and{' '}
              <strong>{agreement.qariName}</strong>, the automated payment breakdown for the agreed fee in {currencyInfo.name} ({currency}) is:
            </p>

            {/* AGREED FEE INPUT */}
            <div className="bg-white rounded-2xl border-2 border-emerald-400/90 p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label
                    htmlFor="agreed-fee-input"
                    className="block text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5"
                  >
                    <Calculator className="w-4 h-4 text-emerald-700" />
                    <span>Agreed Fee Input ({currency})</span>
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Enter or adjust the agreed fee in {currency}. Calculations update automatically.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-gray-700 text-sm select-none pointer-events-none">
                      {currencySymbol}
                    </span>
                    <input
                      id="agreed-fee-input"
                      type="number"
                      min={1}
                      max={500000}
                      step={currency === 'PKR' ? 100 : 5}
                      value={feeInput}
                      onChange={(e) => setFeeInput(e.target.value)}
                      placeholder={String(defaultFee)}
                      className="pl-11 pr-3 py-2 w-36 sm:w-44 text-base font-extrabold font-serif text-gray-950 bg-gray-50 rounded-xl border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveFee}
                    disabled={savingFee || activeFee <= 0}
                    className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {savingFee ? 'Saving...' : 'Save Fee'}
                  </button>
                </div>
              </div>

              {feeSavedNotice && (
                <div className="bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Agreed fee of {formatFee(activeFee)} updated and saved to contract!</span>
                </div>
              )}

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mr-1">
                  Presets ({currency}):
                </span>
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFeeInput(String(preset))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                      activeFee === preset
                        ? 'bg-amber-400 text-amber-950 border border-amber-500 shadow-2xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    {formatFee(preset)}
                  </button>
                ))}
                {feeInput !== String(defaultFee) && (
                  <button
                    type="button"
                    onClick={() => setFeeInput(String(defaultFee))}
                    className="px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:underline cursor-pointer ml-auto"
                  >
                    Reset ({formatFee(defaultFee)})
                  </button>
                )}
              </div>
            </div>

            {/* The 4 Core Required Items: Display */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              {/* 1. Agreed Fee */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider font-bold block">
                  Agreed Fee: {currency}
                </span>
                <div className="text-2xl font-black font-serif text-emerald-950 mt-1.5">
                  {formatFee(activeFee)}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Agreed tuition for {agreement.studentName}
                </div>
              </div>

              {/* 2. QariConnect commission: 15% (Month 1 only) */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-amber-900 uppercase tracking-wider font-bold block">
                    Platform Commission
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900">
                    {COMMISSION_PERCENTAGE}% (Month 1)
                  </span>
                </div>
                <div className="text-2xl font-black font-serif text-amber-900 mt-1.5">
                  {formatFee(qariConnectCommission)}
                </div>
                <div className="text-[10px] text-amber-700 mt-1">
                  One-time {COMMISSION_PERCENTAGE}% on first month only
                </div>
              </div>

              {/* 3. Teacher receives: 90% */}
              <div className="bg-white rounded-2xl p-4 border border-teal-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-teal-900 uppercase tracking-wider font-bold block">
                    Teacher Receives
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    {TEACHER_PAYOUT_PERCENTAGE}%
                  </span>
                </div>
                <div className="text-2xl font-black font-serif text-emerald-900 mt-1.5">
                  {formatFee(teacherReceives)}
                </div>
                <div className="text-[10px] text-emerald-700 mt-1">
                  {TEACHER_PAYOUT_PERCENTAGE}% direct teacher payout
                </div>
              </div>

              {/* 4. Payment status: Pending */}
              <div className="bg-white rounded-2xl p-4 border border-amber-300 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-amber-900 uppercase tracking-wider font-bold block">
                    Payment Status
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-400 text-amber-950 flex items-center gap-1.5 shadow-2xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending</span>
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-amber-800 mt-2 font-medium">
                  WhatsApp: {QARICONNECT_SUPPORT.whatsappDisplay}
                </div>
              </div>
            </div>

            {/* Automatic Calculation & Example Display */}
            <div className="bg-white/95 rounded-xl p-4 border border-amber-200/80 text-xs space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-amber-700" />
                  <span>Automatic Calculation Details:</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Agreed Fee: {formatFee(activeFee)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                <div className="bg-gray-50/90 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block text-[11px]">QariConnect Commission ({COMMISSION_PERCENTAGE}%)</span>
                  <span className="font-mono text-amber-900 font-extrabold text-sm">{formatFee(qariConnectCommission)}</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Calculated: {formatFee(activeFee)} &times; {COMMISSION_PERCENTAGE}%</span>
                </div>
                <div className="bg-gray-50/90 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block text-[11px]">Teacher Receives ({TEACHER_PAYOUT_PERCENTAGE}%)</span>
                  <span className="font-mono text-emerald-900 font-extrabold text-sm">{formatFee(teacherReceives)}</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Calculated: {formatFee(activeFee)} &times; {TEACHER_PAYOUT_PERCENTAGE}%</span>
                </div>
              </div>

              {/* Example calculation note */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-gray-600">
                  <strong>Example Reference:</strong> If agreed fee is <strong>{formatFee(exampleAgreedFee)}</strong> &rarr; QariConnect commission = <strong>{formatFee(examplePlatformCut)} ({COMMISSION_PERCENTAGE}%)</strong>, Teacher receives = <strong>{formatFee(exampleTeacherCut)} ({TEACHER_PAYOUT_PERCENTAGE}%)</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFeeInput(String(exampleAgreedFee))}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      activeFee === exampleAgreedFee
                        ? 'bg-amber-400 text-amber-950 border border-amber-500 shadow-2xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    Load {formatFee(exampleAgreedFee)} Example
                  </button>
                </div>
              </div>
            </div>

            {/* Official Payment Methods & Notice */}
            <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>QariConnect Payment Methods: {QARICONNECT_SUPPORT.paymentMethods.join(', ')}</span>
              </div>
              <div className="leading-relaxed text-amber-900/90">
                For manual fee payment confirmation or commission submission, send payment receipts to WhatsApp:{' '}
                <a
                  href={QARICONNECT_SUPPORT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-emerald-800"
                >
                  {QARICONNECT_SUPPORT.whatsappDisplay}
                </a>
              </div>
            </div>
          </div>

          {/* SECTION 2: PARTIES INVOLVED (Parent & Teacher Names) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Parent Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Parent / Guardian
                  </span>
                  <h4 className="font-serif font-bold text-base text-gray-950">
                    {agreement.parentName}
                  </h4>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5 text-xs text-gray-600 space-y-1">
                <div>Student: <strong className="text-gray-900">{agreement.studentName}</strong></div>
                {agreement.requirementDetails?.country && (
                  <div>Location: <strong className="text-gray-900">{agreement.requirementDetails.country}</strong></div>
                )}
                <div className="text-[10px] text-emerald-700 font-medium">
                  Authorizer of monthly tuition &amp; learning sessions
                </div>
              </div>
            </div>

            {/* Teacher Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Quran Teacher (Qari)
                  </span>
                  <h4 className="font-serif font-bold text-base text-gray-950">
                    {agreement.qariName}
                  </h4>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5 text-xs text-gray-600 space-y-1">
                <div>Role: <strong className="text-gray-900">Certified Quran &amp; Tajweed Tutor</strong></div>
                <div className="text-[10px] text-emerald-700 font-medium">
                  Committed to scheduled lessons &amp; student Quranic mentorship
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: SERVICE / TEACHING REQUIREMENT */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Service &amp; Teaching Requirement Details</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-500 block font-medium">Subject / Syllabus</span>
                <span className="text-xs font-bold text-gray-900 mt-1 block">
                  {agreement.subject}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-500 block font-medium">Class Frequency</span>
                <span className="text-xs font-bold text-emerald-900 mt-1 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  {agreement.hoursPerWeek} classes / week
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-500 block font-medium">Start Date</span>
                <span className="text-xs font-bold text-gray-900 mt-1 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  {agreement.startDate || formattedDate}
                </span>
              </div>
            </div>

            {/* Extended goals / requirements if available */}
            {agreement.requirementDetails && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs space-y-1.5">
                {agreement.requirementDetails.currentLevel && (
                  <div>
                    <span className="text-gray-400">Current Level: </span>
                    <span className="font-semibold text-gray-800">{agreement.requirementDetails.currentLevel}</span>
                  </div>
                )}
                {agreement.requirementDetails.goals && agreement.requirementDetails.goals.length > 0 && (
                  <div>
                    <span className="text-gray-400">Learning Goals: </span>
                    <span className="font-semibold text-emerald-900">
                      {agreement.requirementDetails.goals.join(' &bull; ')}
                    </span>
                  </div>
                )}
                {agreement.requirementDetails.schedule && (
                  <div>
                    <span className="text-gray-400">Preferred Schedule: </span>
                    <span className="font-semibold text-gray-800">{agreement.requirementDetails.schedule}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 4: AGREED FEE & 15/85 MARKETPLACE BREAKDOWN */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-700" />
              <span>Agreed Fee &amp; Commission Terms ({currency})</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-950 p-4 rounded-xl text-white">
                <span className="text-[11px] text-emerald-300 block font-medium">Agreed Fee: {currency}</span>
                <div className="text-2xl font-black font-serif text-amber-300 mt-1">
                  {formatFee(activeFee)}
                </div>
                <span className="text-[10px] text-emerald-200 block mt-0.5">Payment status: Pending</span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 block font-medium">Teacher receives: {TEACHER_PAYOUT_PERCENTAGE}%</span>
                <div className="text-2xl font-black font-serif text-emerald-900 mt-1">
                  {formatFee(teacherReceives)}
                </div>
                <span className="text-[10px] text-emerald-700 block mt-0.5">{TEACHER_PAYOUT_PERCENTAGE}% of agreed fee</span>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <span className="text-[11px] text-amber-900 block font-medium">QariConnect commission: {COMMISSION_PERCENTAGE}%</span>
                <div className="text-2xl font-black font-serif text-amber-950 mt-1">
                  {formatFee(qariConnectCommission)}
                </div>
                <span className="text-[10px] text-amber-800 block mt-0.5">{COMMISSION_PERCENTAGE}% of agreed fee</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: TEACHER'S PROPOSAL */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
              <span>Teacher's Proposal &amp; Teaching Plan</span>
            </span>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line font-normal">
              {agreement.proposalMessage ||
                agreement.notes ||
                `Teacher proposed dedicated one-on-one sessions focused on Tajweed mastery, proper articulation points (Makharij), and customized pace for ${agreement.studentName}.`}
            </div>
          </div>

          {/* SECTION 6: ISLAMIC TEACHING ETIQUETTE & MUTUAL COMMITMENT */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 text-xs text-emerald-950 space-y-1.5">
            <div className="font-bold font-serif flex items-center gap-1.5 text-emerald-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Islamic Teaching Etiquette &amp; Code of Conduct</span>
            </div>
            <p className="text-[11px] text-emerald-900/90 leading-relaxed">
              Both parties agree to uphold punctuality, respect, and patience in all lessons. The teacher agrees to maintain highest standards of Quran recitation according to established Tajweed rules.
            </p>
          </div>
        </div>

        {/* Footer with Status Management & Close */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Switcher (Pending / Accepted / Completed) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] text-gray-500 font-semibold whitespace-nowrap">
              Agreement Stage:
            </span>
            <div className="flex bg-gray-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleUpdateStatus('pending')}
                disabled={updatingStatus}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                  currentStatus === 'pending'
                    ? 'bg-amber-400 text-amber-950 font-bold shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('accepted')}
                disabled={updatingStatus}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                  currentStatus === 'accepted'
                    ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Accepted
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('completed')}
                disabled={updatingStatus}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                  currentStatus === 'completed'
                    ? 'bg-teal-700 text-white font-bold shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Close Agreement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
