'use client';

import React, { useState, useMemo } from 'react';
import { Navbar } from '../src/components/Navbar';
import { Hero } from '../src/components/Hero';
import { FilterBar } from '../src/components/FilterBar';
import { QariCard } from '../src/components/QariCard';
import { BookingModal } from '../src/components/BookingModal';
import { QariConnectAIChat } from '../src/components/QariConnectAIChat';
import { Footer } from '../src/components/Footer';
import { TeacherRegistrationForm } from '../src/components/TeacherRegistrationForm';
import { StudentRegistrationForm } from '../src/components/StudentRegistrationForm';
import { FAQSection } from '../src/components/FAQSection';
import { MOCK_QARIS } from '../src/data/mockQaris';
import { QariProfile, FilterState, BookingDetails, Subject, Gender, Language } from '../src/types/qari';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Phone,
  BookOpen,
  DollarSign,
  Award,
  Video,
  ArrowRight,
  User,
  X,
} from 'lucide-react';

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    gender: 'all',
    subject: 'all',
    language: 'all',
    minPrice: 10,
    maxPrice: 40,
    currency: 'USD',
    sanadOnly: false,
    sortBy: 'recommended',
  });

  // Modal states
  const [selectedQariForModal, setSelectedQariForModal] = useState<QariProfile | null>(null);
  const [selectedQariForDetail, setSelectedQariForDetail] = useState<QariProfile | null>(null);
  const [bookingsList, setBookingsList] = useState<BookingDetails[]>([]);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [becomeQariModalOpen, setBecomeQariModalOpen] = useState(false);

  // Filter computation
  const filteredQaris = useMemo(() => {
    return MOCK_QARIS.filter((q) => {
      // Search Query
      if (filters.searchQuery.trim()) {
        const qText = filters.searchQuery.toLowerCase();
        const matchesName = q.name.toLowerCase().includes(qText);
        const matchesTitle = q.title.toLowerCase().includes(qText);
        const matchesQual = q.qualification.toLowerCase().includes(qText);
        const matchesBio = q.bio.toLowerCase().includes(qText);
        const matchesSubjects = q.subjects.some((s) => s.toLowerCase().includes(qText));
        const matchesLanguages = q.languages.some((l) => l.toLowerCase().includes(qText));
        if (!matchesName && !matchesTitle && !matchesQual && !matchesBio && !matchesSubjects && !matchesLanguages) {
          return false;
        }
      }

      // Gender filter
      if (filters.gender !== 'all' && q.gender !== filters.gender) {
        return false;
      }

      // Subject filter
      if (filters.subject !== 'all' && !q.subjects.includes(filters.subject)) {
        return false;
      }

      // Language filter
      if (filters.language !== 'all' && !q.languages.includes(filters.language)) {
        return false;
      }

      // Sanad filter
      if (filters.sanadOnly && !q.hasSanad) {
        return false;
      }

      // Price filter
      const qPrice = filters.currency === 'PKR' ? q.hourlyRatePKR : q.hourlyRateUSD;
      if (qPrice > filters.maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (filters.sortBy === 'price_low') {
        const pA = filters.currency === 'PKR' ? a.hourlyRatePKR : a.hourlyRateUSD;
        const pB = filters.currency === 'PKR' ? b.hourlyRatePKR : b.hourlyRateUSD;
        return pA - pB;
      }
      if (filters.sortBy === 'price_high') {
        const pA = filters.currency === 'PKR' ? a.hourlyRatePKR : a.hourlyRateUSD;
        const pB = filters.currency === 'PKR' ? b.hourlyRatePKR : b.hourlyRateUSD;
        return pB - pA;
      }
      // Recommended: featured first, then hasSanad, then rating
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });
  }, [filters]);

  const handleBookingConfirmed = (booking: BookingDetails) => {
    setBookingsList((prev) => [booking, ...prev]);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      gender: 'all',
      subject: 'all',
      language: 'all',
      minPrice: filters.currency === 'PKR' ? 2500 : 10,
      maxPrice: filters.currency === 'PKR' ? 12000 : 40,
      currency: filters.currency,
      sanadOnly: false,
      sortBy: 'recommended',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Commission & Support Announcement Ribbon */}
      <div className="bg-linear-to-r from-emerald-950 via-emerald-800 to-teal-950 text-white py-2 px-4 text-xs font-medium border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-400 text-emerald-950 font-bold rounded-sm text-[10px] uppercase">
              15% Platform Commission
            </span>
            <span className="text-emerald-100 text-xs">
              Teachers receive 85% &bull; Official WhatsApp Support:{' '}
              <strong className="text-white">03006856772</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-emerald-200">
            <span className="hidden sm:inline">Supported: EasyPaisa, JazzCash, Bank Transfer</span>
            <button
              onClick={() => setActiveTab('how_it_works')}
              className="text-amber-300 hover:text-white underline cursor-pointer"
            >
              How It Works &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openPostRequirementModal={() => setSelectedQariForModal(MOCK_QARIS[0])}
        onBookFreeTrial={() => setSelectedQariForModal(MOCK_QARIS[0])}
        onOpenTeacherSignup={() => setActiveTab('register_teacher')}
        onOpenStudentSignup={() => setActiveTab('register_student')}
      />

      {/* TAB CONTENT: HOME / FIND QARI */}
      {(activeTab === 'home' || activeTab === 'directory' || activeTab === 'find_qari') && (
        <div className="flex-1 space-y-8">
          {/* Hero Section */}
          <Hero
            searchQuery={filters.searchQuery}
            selectedSubject={filters.subject}
            selectedGender={filters.gender}
            selectedLanguage={filters.language}
            onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
            onSubjectSelect={(s) => setFilters((prev) => ({ ...prev, subject: s }))}
            onGenderSelect={(g) => setFilters((prev) => ({ ...prev, gender: g }))}
            onLanguageSelect={(l) => setFilters((prev) => ({ ...prev, language: l }))}
            onBookFreeTrial={() => setSelectedQariForModal(MOCK_QARIS[0])}
            onExploreQaris={() => {
              const el = document.getElementById('qari-results');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Directory & Filters Section */}
          <main id="qari-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-6">
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              totalResults={filteredQaris.length}
            />

            {/* Qari Cards Grid */}
            {filteredQaris.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQaris.map((qari) => (
                  <QariCard
                    key={qari.id}
                    qari={qari}
                    currency={filters.currency}
                    onViewProfile={(q) => setSelectedQariForDetail(q)}
                    onBookTrial={(q) => setSelectedQariForModal(q)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Quran Tutors Matched Your Filters</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Try adjusting the gender, language, subject, or rate slider to find more available qualified teachers.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>

          {/* Fully Responsive FAQs Section on Main Home Page */}
          <FAQSection
            onRegisterTeacher={() => setActiveTab('register_teacher')}
            onRegisterStudent={() => setActiveTab('register_student')}
          />
        </div>
      )}

      {/* TAB CONTENT: HOW IT WORKS */}
      {activeTab === 'how_it_works' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10 flex-1">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold font-serif text-emerald-950">
              How QariConnect Works
            </h2>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              A transparent, safe, and rigorous process to connect your family with genuine Sanad-holding Quran educators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-base text-gray-900">Select &amp; Filter Tutors</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Filter male or female Qaris by Tajweed specialization, languages spoken (English, Urdu, Arabic), and verified Sanad chains.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-base text-gray-900">Free 30-Min Live Trial</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Book a 1-on-1 trial session via Google Meet. The teacher assesses the student’s pronunciation, alphabet familiarity, and rhythm.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-base text-gray-900">Flexible Learning &amp; Safe Fee</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Once satisfied, start monthly lessons. Teachers pay a one-time 15% platform commission ONLY on the first month's fee (keeping 85% on month 1, and 100% of all subsequent recurring months).
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TAB CONTENT: PRICING */}
      {activeTab === 'pricing' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8 flex-1">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold font-serif text-emerald-950">
              Honest &amp; Halal Pricing
            </h2>
            <p className="text-sm text-gray-600">
              Direct hourly and monthly rates set fairly by teachers. Zero surprise fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Standard 1-on-1 Classes
                </span>
                <span className="text-2xl font-black text-emerald-950 font-serif">$14 - $25 / hr</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  30 to 45-minute live 1-on-1 personalized sessions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Monthly fee starting from Rs 4,500 PKR ($95 USD)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Free 30-minute introductory placement trial
                </li>
              </ul>
            </div>

              <div className="bg-linear-to-br from-emerald-950 to-teal-950 text-white rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-1 rounded-md">
                  QariConnect Platform Fee
                </span>
                <span className="text-2xl font-black text-amber-300 font-serif">15% Platform / 85% Teacher</span>
              </div>
              <p className="text-xs text-emerald-200 leading-relaxed">
                We believe Quran teachers must be fairly compensated. Teachers receive 85% of all tuition fees. The 15% platform commission funds credential verification, platform hosting, and 24/7 WhatsApp customer mediation.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TAB CONTENT: BECOME A QARI */}
      {activeTab === 'become_qari' && (
        <section className="max-w-3xl mx-auto px-4 py-12 space-y-6 flex-1">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-950">
              Apply to Teach on QariConnect
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Join a global network of vetted Quran teachers. Retain 85% of your earnings with direct student connections.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-4 text-xs sm:text-sm">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-1.5 text-xs text-emerald-950">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Award className="w-4 h-4" />
                <span>Verification Requirements:</span>
              </div>
              <div>&bull; Hafiz-ul-Quran certification or formal Madaris graduation (Wifaqul Madaris, Al-Azhar, Islamic Univ of Madinah).</div>
              <div>&bull; Clear recitation sample and Tajweed knowledge (Makharij &amp; Sifat).</div>
              <div>&bull; Reliable internet connection and punctual availability.</div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('register_teacher')}
                className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-emerald-950" />
                <span>Open Teacher Registration Form</span>
              </button>

              <a
                href="https://wa.me/923006856772?text=Assalamu%20Alaikum%2C%20I%20want%20to%20register%20as%20a%20Quran%20Teacher%20on%20QariConnect."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition"
              >
                <MessageCircle className="w-4 h-4 text-amber-300" />
                <span>WhatsApp (03006856772)</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* TAB CONTENT: TEACHER REGISTRATION FORM */}
      {activeTab === 'register_teacher' && (
        <TeacherRegistrationForm
          onSuccess={() => setActiveTab('home')}
          onCancel={() => setActiveTab('home')}
        />
      )}

      {/* TAB CONTENT: STUDENT REGISTRATION FORM */}
      {activeTab === 'register_student' && (
        <StudentRegistrationForm
          onSuccess={() => setActiveTab('home')}
          onBookTrial={() => setSelectedQariForModal(MOCK_QARIS[0])}
          onCancel={() => setActiveTab('home')}
        />
      )}

      {/* TAB CONTENT: FAQS */}
      {activeTab === 'faqs' && (
        <FAQSection
          onRegisterTeacher={() => setActiveTab('register_teacher')}
          onRegisterStudent={() => setActiveTab('register_student')}
        />
      )}

      {/* Trial Booking Multi-Step Modal */}
      <BookingModal
        isOpen={Boolean(selectedQariForModal)}
        onClose={() => setSelectedQariForModal(null)}
        qari={selectedQariForModal}
        defaultCurrency={filters.currency}
        onBookingConfirmed={handleBookingConfirmed}
      />

      {/* Qari Detail Modal */}
      {selectedQariForDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedQariForDetail(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-emerald-100 overflow-hidden relative my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-linear-to-r from-emerald-950 to-teal-950 p-6 text-white relative">
              <button
                onClick={() => setSelectedQariForDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <img
                  src={selectedQariForDetail.avatarUrl}
                  alt={selectedQariForDetail.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300"
                />
                <div>
                  <h3 className="text-xl font-bold font-serif">{selectedQariForDetail.name}</h3>
                  <p className="text-xs text-emerald-200">{selectedQariForDetail.title}</p>
                  <p className="text-[11px] text-amber-300 font-semibold mt-1">
                    ★ {selectedQariForDetail.rating} ({selectedQariForDetail.totalReviews} reviews) &bull; {selectedQariForDetail.experienceYears}y exp
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm text-gray-700 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider mb-1">About Tutor</h4>
                <p className="leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedQariForDetail.bio}</p>
              </div>

              {selectedQariForDetail.hasSanad && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950">
                  <strong>Verified Sanad Muttasil:</strong> {selectedQariForDetail.sanadDetails}
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="font-semibold text-emerald-900">Starting Tuition Rate:</span>
                <span className="text-base font-extrabold text-emerald-950 font-serif">
                  {filters.currency === 'PKR'
                    ? `Rs ${selectedQariForDetail.hourlyRatePKR.toLocaleString()} / hr`
                    : `$${selectedQariForDetail.hourlyRateUSD} / hr`}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedQariForDetail(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const q = selectedQariForDetail;
                  setSelectedQariForDetail(null);
                  setSelectedQariForModal(q);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Book Free Trial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global 24/7 QariConnect AI Chatbot Assistant */}
      <QariConnectAIChat />

      {/* Global Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
