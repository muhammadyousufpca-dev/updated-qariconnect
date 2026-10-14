import React, { useEffect, useState } from 'react';
import {
  Award,
  Globe2,
  Clock,
  Star,
  CheckCircle2,
  Filter,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { QariProfile } from '../types';
import { fetchQariProfiles } from '../services/marketplaceService';
import {
  formatCurrency,
  CURRENCY_LIST,
  COMMISSION_RATE,
  COMMISSION_PERCENTAGE,
  TEACHER_PAYOUT_PERCENTAGE,
} from '../data/currencies';
import { QariDetailModal } from './QariDetailModal';
import { CreateAgreementModal } from './CreateAgreementModal';
import { BookTrialModal } from './BookTrialModal';

interface QariDirectoryProps {
  searchQuery: string;
  sanadOnlyFilter: boolean;
  onStartChat: (qari: QariProfile) => void;
  onSelectQariForContract: (qari: QariProfile) => void;
  onBookTrialSession?: (qari: QariProfile) => void;
}

export const QariDirectory: React.FC<QariDirectoryProps> = ({
  searchQuery,
  sanadOnlyFilter,
  onStartChat,
  onSelectQariForContract,
  onBookTrialSession,
}) => {
  const [qaris, setQaris] = useState<QariProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');

  // Modals
  const [selectedQari, setSelectedQari] = useState<QariProfile | null>(null);
  const [agreementQari, setAgreementQari] = useState<QariProfile | null>(null);
  const [trialQari, setTrialQari] = useState<QariProfile | null>(null);

  useEffect(() => {
    const loadQaris = async () => {
      setLoading(true);
      const list = await fetchQariProfiles();
      setQaris(list);
      setLoading(false);
    };
    loadQaris();
  }, []);

  // Filter & Search Logic
  const filteredQaris = qaris
    .filter((q) => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = q.fullName.toLowerCase().includes(query);
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesBio = q.bio.toLowerCase().includes(query);
        const matchesCountry = q.country.toLowerCase().includes(query);
        const matchesSpecialization = q.tajweedSpecialization.toLowerCase().includes(query);
        const matchesLangs = q.languages.some((l) => l.toLowerCase().includes(query));
        if (!matchesName && !matchesTitle && !matchesBio && !matchesCountry && !matchesSpecialization && !matchesLangs) {
          return false;
        }
      }

      // Sanad only
      if (sanadOnlyFilter && !q.hasSanad) {
        return false;
      }

      // Country filter
      if (selectedCountry !== 'all' && q.country.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }

      // Language filter
      if (selectedLanguage !== 'all' && !q.languages.some((l) => l.toLowerCase().includes(selectedLanguage.toLowerCase()))) {
        return false;
      }

      // Currency filter
      if (selectedCurrency !== 'all') {
        const qCurr = (q.currency || 'USD').toUpperCase();
        if (qCurr !== selectedCurrency.toUpperCase()) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'fee_low') return a.monthlyFee - b.monthlyFee;
      if (sortBy === 'fee_high') return b.monthlyFee - a.monthlyFee;
      return (b.hasSanad ? 1 : 0) - (a.hasSanad ? 1 : 0);
    });

  const allCountries = Array.from(new Set(qaris.map((q) => q.country)));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Country filter */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 font-medium focus:outline-emerald-600"
          >
            <option value="all">All Countries</option>
            {allCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Language filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 font-medium focus:outline-emerald-600"
          >
            <option value="all">All Languages</option>
            <option value="english">English</option>
            <option value="arabic">Arabic</option>
            <option value="urdu">Urdu</option>
            <option value="french">French</option>
            <option value="turkish">Turkish</option>
          </select>

          {/* Currency filter */}
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 font-medium focus:outline-emerald-600"
          >
            <option value="all">All Currencies</option>
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 font-medium focus:outline-emerald-600"
          >
            <option value="recommended">Sanad Certified First</option>
            <option value="rating">Highest Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="fee_low">Tuition: Low to High</option>
            <option value="fee_high">Tuition: High to Low</option>
          </select>
        </div>
      </div>

      {/* Results Count & Badges */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div>
          Showing <strong className="text-emerald-900">{filteredQaris.length}</strong> qualified teachers
          {sanadOnlyFilter && <span className="text-amber-800 font-semibold ml-1">(Sanad Holders Only)</span>}
        </div>
        <div className="hidden sm:block text-[11px] text-gray-400">
          All contracts include {COMMISSION_PERCENTAGE}% platform commission on monthly student fees
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredQaris.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No matching teachers found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, lowering the fee filter, or expanding the country selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQaris.map((qari) => {
            const platformCut = (qari.monthlyFee * COMMISSION_RATE).toFixed(0);
            const teacherCut = (qari.monthlyFee * (1 - COMMISSION_RATE)).toFixed(0);

            return (
              <div
                key={qari.qariId}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Top Header Card */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={
                          qari.avatarUrl ||
                          'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={qari.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border border-emerald-200 group-hover:scale-105 transition"
                      />
                      {qari.isVerified && (
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 rounded-full text-white flex items-center justify-center border-2 border-white shadow-xs"
                          title="Identity & Sanad Verified"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-sm text-gray-950 truncate group-hover:text-emerald-900 transition font-serif">
                          {qari.fullName}
                        </h3>
                        <div className="flex items-center gap-0.5 text-xs text-amber-600 font-bold shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{qari.rating || 5.0}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{qari.title}</p>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Globe2 className="w-3 h-3 text-emerald-700" />
                          {qari.country}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-700" />
                          {qari.experienceYears} yrs exp
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sanad Badge */}
                  {qari.hasSanad ? (
                    <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-amber-900">
                      <Award className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="font-semibold line-clamp-1">Sanad Muttasil (Ijazah Holder)</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium line-clamp-1">Certified Quran Teacher</span>
                    </div>
                  )}

                  {/* Bio Preview */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{qari.bio}</p>

                  {/* Specializations & Languages Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-100">
                      {qari.tajweedSpecialization.split(',')[0]}
                    </span>
                    {qari.languages.slice(0, 2).map((l, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-700"
                      >
                        {l.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Pricing & Actions */}
                <div className="p-4 bg-gray-50/80 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        Monthly Tuition
                      </div>
                      <div className="text-lg font-black text-emerald-950 font-serif">
                        {formatCurrency(qari.monthlyFee, qari.currency)}
                        <span className="text-[11px] font-normal text-gray-500"> / mo</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-gray-500 font-medium">Approx. Hourly</div>
                      <div className="text-xs font-bold text-gray-800">{formatCurrency(qari.hourlyFee, qari.currency)} / hr</div>
                    </div>
                  </div>

                  {/* Commission calculation preview on card */}
                  <div className="text-[10px] text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-200/60 flex items-center justify-between">
                    <span>Teacher gets: <strong className="text-emerald-700">{formatCurrency(Number(teacherCut), qari.currency)} ({TEACHER_PAYOUT_PERCENTAGE}%)</strong></span>
                    <span>QariConnect: <strong className="text-amber-800">{formatCurrency(Number(platformCut), qari.currency)} ({COMMISSION_PERCENTAGE}%)</strong></span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      onClick={() => setSelectedQari(qari)}
                      className="py-2 px-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold transition text-center cursor-pointer"
                    >
                      Profile
                    </button>

                    <button
                      onClick={() => onStartChat(qari)}
                      className="py-2 px-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                      Chat
                    </button>

                    <button
                      onClick={() => setTrialQari(qari)}
                      className="py-2 px-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      Trial
                    </button>

                    <button
                      onClick={() => setAgreementQari(qari)}
                      className="py-2 px-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                      Contract
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher Detail Modal */}
      {selectedQari && (
        <QariDetailModal
          qari={selectedQari}
          onClose={() => setSelectedQari(null)}
          onMessage={(q) => {
            setSelectedQari(null);
            onStartChat(q);
          }}
          onInitiateAgreement={(q) => {
            setSelectedQari(null);
            setAgreementQari(q);
          }}
          onBookTrial={(q) => {
            setSelectedQari(null);
            setTrialQari(q);
          }}
        />
      )}

      {/* Create Agreement Contract Modal */}
      {agreementQari && (
        <CreateAgreementModal
          isOpen={!!agreementQari}
          onClose={() => setAgreementQari(null)}
          targetQari={agreementQari}
          onSuccess={() => {
            setAgreementQari(null);
            onSelectQariForContract(agreementQari);
          }}
        />
      )}

      {/* Book Free Trial Modal */}
      {trialQari && (
        <BookTrialModal
          isOpen={!!trialQari}
          onClose={() => setTrialQari(null)}
          qari={trialQari}
          onBooked={() => {
            setTrialQari(null);
            if (onBookTrialSession) onBookTrialSession(trialQari);
          }}
        />
      )}
    </section>
  );
};
