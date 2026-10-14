import React from 'react';
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  Video,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  Award,
  Globe2,
} from 'lucide-react';
import { Subject, Gender, Language } from '../types/qari';

interface HeroProps {
  onSearchChange: (query: string) => void;
  onSubjectSelect: (subject: 'all' | Subject) => void;
  onGenderSelect: (gender: 'all' | Gender) => void;
  onLanguageSelect: (language: 'all' | Language) => void;
  onBookFreeTrial: () => void;
  onExploreQaris: () => void;
  selectedSubject: 'all' | Subject;
  selectedGender: 'all' | Gender;
  selectedLanguage: 'all' | Language;
  searchQuery: string;
}

export const Hero: React.FC<HeroProps> = ({
  onSearchChange,
  onSubjectSelect,
  onGenderSelect,
  onLanguageSelect,
  onBookFreeTrial,
  onExploreQaris,
  selectedSubject,
  selectedGender,
  selectedLanguage,
  searchQuery,
}) => {
  return (
    <div className="relative overflow-hidden bg-linear-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/60 shadow-xl">
      {/* Subtle Islamic geometric pattern overlay & decorative ambient glows */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fef08a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 text-center space-y-8">
        {/* Top Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-emerald-200 shadow-sm animate-in fade-in duration-300">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Global 1-on-1 Quran Education Platform</span>
          <span className="hidden sm:inline text-white/50">&bull;</span>
          <span className="hidden sm:inline text-amber-300 font-semibold">Sanad Muttasil &amp; Al-Azhar Certified</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-tight text-white">
            Find Certified Quran Tutors for{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-amber-300 to-amber-400">
              Online Tajweed &amp; Hifz
            </span>{' '}
            Classes
          </h1>
          <p className="text-base sm:text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-light">
            Learn Tajweed, Hifz, and Islamic Studies from verified male and female Qaris worldwide. Flexible timings with dedicated individual care.
          </p>
        </div>

        {/* Integrated Quick Search & Filter Card */}
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 text-gray-900 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Keyword Search */}
            <div className="relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Search Tutor
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="e.g. Al-Azhar, Hafiz, Maryam..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/80 focus:bg-white focus:outline-emerald-600 font-medium"
                />
              </div>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => onSubjectSelect(e.target.value as 'all' | Subject)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/80 focus:bg-white focus:outline-emerald-600 font-medium cursor-pointer"
              >
                <option value="all">All Subjects</option>
                <option value="Tajweed">Tajweed Rules</option>
                <option value="Nazra">Nazra Quran</option>
                <option value="Hifz">Hifz (Memorization)</option>
                <option value="Noorani Qaida">Noorani Qaida</option>
                <option value="Arabic Language">Arabic Language</option>
                <option value="Islamic Studies">Islamic Studies</option>
                <option value="Tafseer">Tafseer</option>
              </select>
            </div>

            {/* Gender Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Tutor Gender
              </label>
              <select
                value={selectedGender}
                onChange={(e) => onGenderSelect(e.target.value as 'all' | Gender)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/80 focus:bg-white focus:outline-emerald-600 font-medium cursor-pointer"
              >
                <option value="all">Any Gender (Male / Female)</option>
                <option value="male">Male Qari</option>
                <option value="female">Female Qaria / Ustadha</option>
              </select>
            </div>

            {/* Language Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Instruction Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageSelect(e.target.value as 'all' | Language)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/80 focus:bg-white focus:outline-emerald-600 font-medium cursor-pointer"
              >
                <option value="all">All Languages</option>
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
                <option value="Arabic">Arabic</option>
                <option value="Pashto">Pashto</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-emerald-800">Popular topics:</span>
              <button
                type="button"
                onClick={() => onSubjectSelect('Tajweed')}
                className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 transition"
              >
                Tajweed
              </button>
              <button
                type="button"
                onClick={() => onSubjectSelect('Hifz')}
                className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 transition"
              >
                Hifz
              </button>
              <button
                type="button"
                onClick={() => onSubjectSelect('Noorani Qaida')}
                className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium hover:bg-emerald-100 transition"
              >
                Noorani Qaida
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onExploreQaris}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                View All Tutors
              </button>
              <button
                type="button"
                onClick={onBookFreeTrial}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/20 cursor-pointer"
              >
                <span>Book Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2.5 bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 text-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-white uppercase tracking-wider">100% Verified Tutors</div>
              <div className="text-[11px] text-emerald-200">Sanad &amp; Ijazah Authenticated</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 text-emerald-100">
            <Video className="w-5 h-5 text-amber-300 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-white uppercase tracking-wider">1-on-1 Live Sessions</div>
              <div className="text-[11px] text-emerald-200">Interactive Audio &amp; Video Class</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 text-emerald-100">
            <Clock className="w-5 h-5 text-amber-300 shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Flexible Timings</div>
              <div className="text-[11px] text-emerald-200">Worldwide Time Zone Fit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
