import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Search,
  Award,
  Globe2,
  Users,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sanadOnlyFilter: boolean;
  setSanadOnlyFilter: (val: boolean) => void;
  openPostRequirementModal: () => void;
  setActiveTab: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  sanadOnlyFilter,
  setSanadOnlyFilter,
  openPostRequirementModal,
  setActiveTab,
}) => {
  const { userProfile, activateDemoPersona } = useAuth();
  const currentRole = userProfile?.role || 'parent';

  return (
    <div className="relative overflow-hidden bg-linear-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
      {/* Background Islamic Geometric Subtle Accent */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {/* Hadith Banner */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-emerald-200 text-xs font-medium tracking-wide shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»</span>
            <span className="text-emerald-400">|</span>
            <span className="text-amber-200">"The best of you are those who learn the Quran and teach it"</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-serif leading-tight">
            Connect With Vetted <span className="text-amber-300">Quran & Tajweed</span> Teachers Worldwide
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Find certified Qaris holding authentic <strong className="text-amber-300 font-semibold">Sanad & Ijazah</strong> chains.
            Personalized 1-on-1 lessons for children, teens, and adults with transparent pricing and safe agreement contracts.
          </p>

          {/* Quick Search Bar */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl">
              <div className="flex items-center gap-2.5 px-3 flex-1 w-full text-white">
                <Search className="w-5 h-5 text-amber-300 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by teacher name, country, language, or Riwayah..."
                  className="bg-transparent border-none text-white placeholder-emerald-200/70 text-sm focus:outline-hidden w-full"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSanadOnlyFilter(!sanadOnlyFilter)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer w-full sm:w-auto justify-center ${
                    sanadOnlyFilter
                      ? 'bg-amber-400 text-emerald-950 font-bold'
                      : 'bg-white/15 text-white hover:bg-white/20'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Sanad Holders Only
                </button>

                {currentRole === 'parent' ? (
                  <button
                    onClick={openPostRequirementModal}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl text-xs transition cursor-pointer shrink-0 shadow-md shadow-amber-400/20"
                  >
                    Post Request
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('requirements')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
                  >
                    View Parent Requests
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Registration & Teacher Onboarding Action Prompts */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs">
            <button
              onClick={() => setActiveTab('register_teacher')}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer transition"
            >
              <Award className="w-4 h-4 text-emerald-950" />
              <span>Register as Teacher / Create Profile &rarr;</span>
            </button>

            <button
              onClick={() => setActiveTab('register_student')}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold border border-white/20 flex items-center gap-1.5 cursor-pointer transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Register as Student (Free Trial)</span>
            </button>
          </div>
        </div>

        {/* Feature Trust Pills */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-800/80 text-amber-300 flex items-center justify-center mx-auto mb-2">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white">Sanad Verified</div>
            <div className="text-xs text-emerald-200 mt-0.5">Ijazah muttasil back to Prophet ﷺ</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-800/80 text-amber-300 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white">15% Fair Fee</div>
            <div className="text-xs text-emerald-200 mt-0.5">Teachers keep 85% of monthly tuition</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-800/80 text-amber-300 flex items-center justify-center mx-auto mb-2">
              <Globe2 className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white">Global Teachers</div>
            <div className="text-xs text-emerald-200 mt-0.5">Egypt, Madinah, UK, Turkey & more</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-800/80 text-amber-300 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white">Child-Safe</div>
            <div className="text-xs text-emerald-200 mt-0.5">Structured agreements & messaging</div>
          </div>
        </div>
      </div>
    </div>
  );
};
