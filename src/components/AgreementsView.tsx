import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  DollarSign,
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Download,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Agreement, TransactionRecord } from '../types';
import {
  fetchAgreementsForUser,
  fetchTransactionsForUser,
} from '../services/marketplaceService';
import { AgreementStageModal } from './AgreementStageModal';
import { formatCurrency, COMMISSION_PERCENTAGE, TEACHER_PAYOUT_PERCENTAGE, COMMISSION_RATE } from '../data/currencies';

export const AgreementsView: React.FC = () => {
  const { userProfile, isDemoUser } = useAuth();
  const currentUserId = userProfile?.uid || 'demo_parent_user';
  const currentRole = userProfile?.role || 'parent';

  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contracts' | 'ledger'>('contracts');
  const [selectedAgreementForModal, setSelectedAgreementForModal] = useState<Agreement | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [agrs, txs] = await Promise.all([
      fetchAgreementsForUser(currentUserId),
      fetchTransactionsForUser(currentUserId),
    ]);
    setAgreements(agrs);
    setTransactions(txs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  // Aggregate Metrics grouped by Currency
  const currencyBreakdown = agreements.reduce((acc, a) => {
    const curr = a.currency || 'USD';
    const val = a.agreedFirstFee || a.monthlyFee;
    acc[curr] = (acc[curr] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const currencyKeys = Object.keys(currencyBreakdown);
  const totalVolumeFormatted =
    currencyKeys.length > 0
      ? currencyKeys.map((c) => formatCurrency(currencyBreakdown[c], c)).join(' • ')
      : '$0.00';

  const totalCommissionFormatted =
    currencyKeys.length > 0
      ? currencyKeys.map((c) => formatCurrency(currencyBreakdown[c] * 0.15, c)).join(' • ')
      : '$0.00';

  const totalTeacherPayoutFormatted =
    currencyKeys.length > 0
      ? currencyKeys.map((c) => formatCurrency(currencyBreakdown[c] * 0.85, c)).join(' • ')
      : '$0.00';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Overview Metric Banner */}
      <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 text-white border border-emerald-800/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-emerald-950">
                {COMMISSION_PERCENTAGE}% Commission Model
              </span>
              <span className="text-xs text-emerald-300 font-medium">Multi-Currency Contract Ledger</span>
            </div>
            <h2 className="text-2xl font-bold font-serif mt-1">Teaching Agreements &amp; Commission</h2>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-xl">
              Every agreed lesson produces a formal agreement in the database. QariConnect earns {COMMISSION_PERCENTAGE}% on monthly student fees; teachers receive {TEACHER_PAYOUT_PERCENTAGE}% net payout, calculated in the original transaction currency.
            </p>
          </div>

          <div className="flex bg-emerald-900/80 p-1.5 rounded-2xl border border-emerald-700/50 text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'contracts'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Active Contracts ({agreements.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              {COMMISSION_PERCENTAGE}% Commission Invoices
            </button>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-emerald-200 uppercase font-semibold">Total Contract Value</div>
            <div className="text-xl sm:text-2xl font-black font-serif text-white mt-1 break-words">
              {totalVolumeFormatted}
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5">Agreed tuition volume</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-amber-300 uppercase font-semibold">Platform Fee ({COMMISSION_PERCENTAGE}%)</div>
            <div className="text-xl sm:text-2xl font-black font-serif text-amber-300 mt-1 break-words">
              {totalCommissionFormatted}
            </div>
            <div className="text-[10px] text-emerald-200 mt-0.5">QariConnect {COMMISSION_PERCENTAGE}% share</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-emerald-200 uppercase font-semibold">Teacher Payouts ({TEACHER_PAYOUT_PERCENTAGE}%)</div>
            <div className="text-xl sm:text-2xl font-black font-serif text-emerald-300 mt-1 break-words">
              {totalTeacherPayoutFormatted}
            </div>
            <div className="text-[10px] text-emerald-200 mt-0.5">Direct to teacher</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-emerald-200 uppercase font-semibold">Enrolled Students</div>
            <div className="text-2xl font-black font-serif text-white mt-1">
              {agreements.length}
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5">Active Quran mentorships</div>
          </div>
        </div>
      </div>

      {/* Main Content: Contracts Tab vs Ledger Tab */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : activeTab === 'contracts' ? (
        <div className="space-y-6">
          {agreements.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-800">No active contracts yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                When a parent and teacher agree on learning terms or accept a proposal, a signed teaching
                contract will appear here with the 15% commission breakdown.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agreements.map((agreement) => (
                <div
                  key={agreement.id}
                  className="bg-white rounded-3xl border border-emerald-100 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    {/* Contract Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-gray-950 font-serif">
                            Contract #{agreement.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {agreement.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Student: <strong className="text-gray-800">{agreement.studentName}</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-950 font-serif">
                          ${agreement.monthlyFee.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-gray-500">/ month</div>
                      </div>
                    </div>

                    {/* Parties info */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
                      <div>
                        <span className="text-gray-400 block font-medium">Quran Teacher</span>
                        <span className="font-bold text-gray-900 mt-0.5 block truncate">
                          {agreement.qariName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-medium">Parent / Student</span>
                        <span className="font-bold text-gray-900 mt-0.5 block truncate">
                          {agreement.parentName}
                        </span>
                      </div>
                    </div>

                    {/* Syllabus & Schedule */}
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-gray-400 font-medium">Subject / Syllabus: </span>
                        <span className="font-semibold text-gray-800">{agreement.subject}</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          {agreement.hoursPerWeek} classes / week
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                          Start: {agreement.startDate}
                        </span>
                      </div>
                      {agreement.notes && (
                        <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                          "{agreement.notes}"
                        </p>
                      )}
                    </div>

                    {/* Payment Summary Structure (15% Commission / 85% Teacher Payout) */}
                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-gray-700">
                        <span>Agreed Fee ({agreement.currency || 'USD'}):</span>
                        <strong className="text-gray-900 font-mono">
                          {formatCurrency(agreement.agreedFirstFee || agreement.monthlyFee, agreement.currency)}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-gray-700">
                        <span>QariConnect commission: {COMMISSION_PERCENTAGE}%</span>
                        <span className="font-bold text-amber-800 font-mono">
                          {formatCurrency((agreement.agreedFirstFee || agreement.monthlyFee) * COMMISSION_RATE, agreement.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-700">
                        <span>Teacher receives: {TEACHER_PAYOUT_PERCENTAGE}%</span>
                        <span className="font-bold text-emerald-800 font-mono">
                          {formatCurrency((agreement.agreedFirstFee || agreement.monthlyFee) * (1 - COMMISSION_RATE), agreement.currency)}
                        </span>
                      </div>
                      <div className="pt-1.5 border-t border-emerald-200/50 flex justify-between items-center font-bold text-emerald-950">
                        <span className="flex items-center gap-1">
                          <span>Payment Status:</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-400 text-amber-950 flex items-center gap-1 shadow-2xs">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Recorded in Database
                    </span>

                    <button
                      onClick={() => setSelectedAgreementForModal(agreement)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
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
      ) : (
        /* Transactions & 15% Commission Ledger Table */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-950 font-serif">
                Transaction Ledger &amp; Payment Summary
              </h3>
              <p className="text-xs text-gray-500">
                Payment simulation records with automated 15% platform commission calculation (Payment status: Pending)
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {transactions.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Agreement Ref</th>
                  <th className="py-3 px-4">Agreed First Fee</th>
                  <th className="py-3 px-4">Platform Fee ({COMMISSION_PERCENTAGE}%)</th>
                  <th className="py-3 px-4">Teacher Receives ({TEACHER_PAYOUT_PERCENTAGE}%)</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-800">
                      {tx.id.slice(0, 14)}...
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-800">
                      {tx.agreementId.slice(0, 10)}...
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {formatCurrency(tx.grossAmount, tx.currency)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">
                      {formatCurrency(tx.commissionAmount || tx.grossAmount * COMMISSION_RATE, tx.currency)} ({COMMISSION_PERCENTAGE}%)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatCurrency(tx.netTeacherAmount || tx.grossAmount * (1 - COMMISSION_RATE), tx.currency)} ({TEACHER_PAYOUT_PERCENTAGE}%)
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-700" />
                        Pending
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Formal Agreement Stage Modal */}
      {selectedAgreementForModal && (
        <AgreementStageModal
          isOpen={!!selectedAgreementForModal}
          onClose={() => setSelectedAgreementForModal(null)}
          agreement={selectedAgreementForModal}
          onStatusUpdated={(updated) => {
            setSelectedAgreementForModal(updated);
            setAgreements((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
          }}
          viewerRole={currentRole as any}
        />
      )}
    </section>
  );
};
