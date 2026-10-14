import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CommissionNoticeBar } from './components/CommissionBadge';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { QariDirectory } from './components/QariDirectory';
import { ParentRequirementsView } from './components/ParentRequirementsView';
import { AgreementsView } from './components/AgreementsView';
import { MessagingView, ChatTarget } from './components/MessagingView';
import { QariProfileEditor } from './components/QariProfileEditor';
import { ParentProfileEditor } from './components/ParentProfileEditor';
import { QariDashboard } from './components/QariDashboard';
import { LessonSessionsView } from './components/LessonSessionsView';
import { PostRequirementModal } from './components/PostRequirementModal';
import { BookingModal } from './components/BookingModal';
import { QariConnectAIChat } from './components/QariConnectAIChat';
import { Footer } from './components/Footer';
import { TeacherRegistrationForm } from './components/TeacherRegistrationForm';
import { StudentRegistrationForm } from './components/StudentRegistrationForm';
import { FAQSection } from './components/FAQSection';
import { QariProfile } from './types';
import { MOCK_QARIS } from './data/mockQaris';
import { QariProfile as QariProfileNew, BookingDetails } from './types/qari';
import {
  CheckCircle2,
  Award,
  Video,
  Clock,
  ShieldCheck,
  Calendar,
  MessageCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  DollarSign,
  Phone,
} from 'lucide-react';
import {
  COMMISSION_PERCENTAGE,
  TEACHER_PAYOUT_PERCENTAGE,
  QARICONNECT_SUPPORT,
} from './data/currencies';

function MainApp() {
  const { userProfile } = useAuth();
  const currentRole = userProfile?.role || 'parent';

  const [activeTab, setActiveTab] = useState<string>('directory');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sanadOnlyFilter, setSanadOnlyFilter] = useState(false);

  // Modals & Navigation intents
  const [postRequirementModalOpen, setPostRequirementModalOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);

  // Booking Modal
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [selectedTrialQari, setSelectedTrialQari] = useState<QariProfileNew | null>(null);

  const handleStartChat = (qari: QariProfile) => {
    setChatTarget({
      id: qari.qariId,
      name: qari.fullName,
      role: 'qari',
      qariProfile: qari,
    });
    setActiveTab('messages');
  };

  const handleSelectQariForContract = (qari: QariProfile) => {
    setActiveTab('agreements');
  };

  const handleAgreementCreated = () => {
    setActiveTab('agreements');
  };

  const handleStartChatWithParent = (parentId: string, parentName: string) => {
    setChatTarget({
      id: parentId,
      name: parentName,
      role: 'parent',
    });
    setActiveTab('messages');
  };

  const handleOpenTrialBooking = (qari?: QariProfileNew) => {
    setSelectedTrialQari(qari || MOCK_QARIS[0]);
    setTrialModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-emerald-200 selection:text-emerald-950">
      {/* Commission Transparency Notification Ribbon */}
      <CommissionNoticeBar />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openPostRequirementModal={() => setPostRequirementModalOpen(true)}
        onBookFreeTrial={() => handleOpenTrialBooking()}
        onOpenTeacherSignup={() => setActiveTab('register_teacher')}
        onOpenStudentSignup={() => setActiveTab('register_student')}
      />

      {/* Hero Section displayed on Directory Tab for Parents & Visitors */}
      {(activeTab === 'directory' || activeTab === 'home' || activeTab === 'find_qari') && (
        <HeroSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sanadOnlyFilter={sanadOnlyFilter}
          setSanadOnlyFilter={setSanadOnlyFilter}
          openPostRequirementModal={() => setPostRequirementModalOpen(true)}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Tab Panels */}
      <main className="flex-1">
        {(activeTab === 'directory' || activeTab === 'home' || activeTab === 'find_qari') && (
          <>
            <QariDirectory
              searchQuery={searchQuery}
              sanadOnlyFilter={sanadOnlyFilter}
              onStartChat={handleStartChat}
              onSelectQariForContract={handleSelectQariForContract}
              onBookTrialSession={(qari) => {
                const matchedNew = MOCK_QARIS.find((m) => m.name.toLowerCase().includes(qari.fullName.toLowerCase())) || MOCK_QARIS[0];
                handleOpenTrialBooking(matchedNew);
              }}
            />
            {/* Responsively Rendered FAQ Section on Directory/Home */}
            <FAQSection
              onRegisterTeacher={() => setActiveTab('register_teacher')}
              onRegisterStudent={() => setActiveTab('register_student')}
            />
          </>
        )}

        {/* HOW IT WORKS VIEW */}
        {activeTab === 'how_it_works' && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Step-by-Step Guidance
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-emerald-950">
                How QariConnect Works
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                We make finding and studying under certified Quran teachers seamless, transparent, and spiritually enriching for your entire family.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-lg font-serif">
                  1
                </div>
                <h3 className="font-bold text-lg text-gray-900">Explore &amp; Filter Tutors</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Browse certified male and female Qaris worldwide. Filter by Tajweed specialization, verified Sanad Muttasil, spoken languages, and preferred timings.
                </p>
                <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5 pt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  100% Manual Credential Vetting
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg font-serif">
                  2
                </div>
                <h3 className="font-bold text-lg text-gray-900">Book Free 30-Min Trial</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Schedule a private 1-on-1 trial session via Google Meet. The teacher assesses the student’s pronunciation, Makharij, and current reading fluency.
                </p>
                <div className="text-xs text-amber-800 font-semibold flex items-center gap-1.5 pt-2">
                  <Video className="w-4 h-4 text-amber-600" />
                  Live Classroom Screen Sharing
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center font-bold text-lg font-serif">
                  3
                </div>
                <h3 className="font-bold text-lg text-gray-900">Formal Learning Contract</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Once satisfied, establish a monthly learning contract. Teachers receive {TEACHER_PAYOUT_PERCENTAGE}% directly, while {COMMISSION_PERCENTAGE}% platform fee funds ongoing student safety.
                </p>
                <div className="text-xs text-teal-800 font-semibold flex items-center gap-1.5 pt-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Secure Parent &amp; Teacher Agreements
                </div>
              </div>
            </div>

            <div className="bg-linear-to-r from-emerald-950 to-teal-950 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif">Ready to start your Quran journey?</h3>
                <p className="text-xs sm:text-sm text-emerald-200">
                  Book a free 30-minute evaluation session with one of our top-rated Qaris today.
                </p>
              </div>
              <button
                onClick={() => handleOpenTrialBooking()}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Free Trial Now</span>
              </button>
            </div>
          </section>
        )}

        {/* PRICING VIEW */}
        {activeTab === 'pricing' && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                {COMMISSION_PERCENTAGE}% Platform Fee &bull; {TEACHER_PAYOUT_PERCENTAGE}% Direct Teacher Payout
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-emerald-950">
                Transparent &amp; Halal Pricing
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                We believe in ethical marketplace pricing where teachers keep the overwhelming majority of student fees, with zero hidden markups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fee Breakdown Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                    Tuition Rates Overview
                  </span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-950 font-serif">$14 - $25</span>
                    <span className="text-xs text-gray-500 font-medium">per hour / Rs 3,800 - 7,000 PKR</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Monthly tuition typically ranges from Rs 5,000 PKR ($100 USD) depending on weekly lesson frequency.
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-gray-700 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Free 30-minute introductory placement trial</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>1-on-1 personalized live video lesson format</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Flexible weekly frequency (2, 3, or 5 days/week)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Monthly progress report and recitation milestones</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Browse Tutors by Fee</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Platform Commission Transparency Card */}
              <div className="bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-1 rounded-md">
                    Our {COMMISSION_PERCENTAGE}% Commission Model
                  </span>
                  <div className="mt-3">
                    <div className="text-2xl font-bold font-serif text-white">
                      Teachers Keep {TEACHER_PAYOUT_PERCENTAGE}%
                    </div>
                    <div className="text-xs text-emerald-200 mt-1">
                      Platform fee is exactly {COMMISSION_PERCENTAGE}% of agreed monthly student fees.
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 space-y-2 text-xs border border-white/10">
                  <div className="font-bold text-amber-300 uppercase tracking-wide">
                    Official Payment Channels:
                  </div>
                  <div className="text-emerald-100">
                    {QARICONNECT_SUPPORT.paymentMethods.join(' • ')}
                  </div>
                  <div className="pt-2 border-t border-white/10 text-emerald-200">
                    For manual fee receipts or platform commission submission, contact WhatsApp:{' '}
                    <strong className="text-white">{QARICONNECT_SUPPORT.whatsappDisplay}</strong>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-emerald-200">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>Funds rigorous verification of Ijazah authenticity.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>Guarantees child protection and agreement mediation.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>Real-time technical assistance for all classes.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BECOME A QARI VIEW */}
        {activeTab === 'become_qari' && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                Teacher Onboarding &amp; Registration
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-emerald-950">
                Become a Verified Quran Tutor
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Connect directly with international Quran students. Set your own schedule, teach from home, and keep {TEACHER_PAYOUT_PERCENTAGE}% of your tuition.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1.5">
                  <div className="font-bold text-xs uppercase tracking-wide text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Sanad &amp; Ijazah Holder
                  </div>
                  <p className="text-xs text-gray-600">
                    Graduates of Al-Azhar, Islamic University of Madinah, Wifaqul Madaris, or holders of continuous Sanad Muttasil in Hafs or other Qira'at.
                  </p>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1.5">
                  <div className="font-bold text-xs uppercase tracking-wide text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Patience with Children
                  </div>
                  <p className="text-xs text-gray-600">
                    Experience teaching Noorani Qaida, Nazra, and basic Tajweed rules with positive encouragement.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="font-bold flex items-center gap-2 text-amber-900">
                  <Phone className="w-4 h-4 text-amber-700" />
                  <span>How to Register:</span>
                </div>
                <p>
                  To ensure child safety and recitation authenticity, all teachers undergo a brief oral Tajweed recitation check. Please submit your Ijazah / Sanad document and audio recitation sample directly to our official WhatsApp.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('register_teacher')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Award className="w-4 h-4 text-emerald-950" />
                  <span>Open Teacher Registration Form</span>
                </button>

                <a
                  href={QARICONNECT_SUPPORT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-amber-300" />
                  <span>Register via WhatsApp ({QARICONNECT_SUPPORT.whatsappDisplay})</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* TEACHER REGISTRATION VIEW */}
        {activeTab === 'register_teacher' && (
          <TeacherRegistrationForm
            onSuccess={() => setActiveTab('qari_dashboard')}
            onCancel={() => setActiveTab('directory')}
          />
        )}

        {/* STUDENT REGISTRATION VIEW */}
        {activeTab === 'register_student' && (
          <StudentRegistrationForm
            onSuccess={() => setActiveTab('directory')}
            onBookTrial={() => handleOpenTrialBooking()}
            onCancel={() => setActiveTab('directory')}
          />
        )}

        {/* FAQS DEDICATED VIEW */}
        {activeTab === 'faqs' && (
          <FAQSection
            onRegisterTeacher={() => setActiveTab('register_teacher')}
            onRegisterStudent={() => setActiveTab('register_student')}
          />
        )}

        {activeTab === 'qari_dashboard' && (
          <QariDashboard
            onNavigateToTab={(t) => setActiveTab(t)}
            onStartChatWithParent={handleStartChatWithParent}
          />
        )}

        {activeTab === 'requirements' && (
          <ParentRequirementsView
            openPostRequirementModal={() => setPostRequirementModalOpen(true)}
            onStartChat={handleStartChat}
            onAgreementCreated={handleAgreementCreated}
          />
        )}

        {activeTab === 'agreements' && <AgreementsView />}

        {activeTab === 'sessions' && (
          <LessonSessionsView onOpenChat={() => setActiveTab('messages')} />
        )}

        {activeTab === 'messages' && (
          <MessagingView
            chatTarget={chatTarget}
            onAgreementCreated={handleAgreementCreated}
          />
        )}

        {activeTab === 'qari_profile' && <QariProfileEditor />}

        {activeTab === 'parent_profile' && <ParentProfileEditor />}
      </main>

      {/* Trial Booking Multi-Step Modal */}
      <BookingModal
        isOpen={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        qari={selectedTrialQari}
        defaultCurrency="USD"
      />

      {/* Post Child Learning Requirement Modal */}
      {postRequirementModalOpen && (
        <PostRequirementModal
          isOpen={postRequirementModalOpen}
          onClose={() => setPostRequirementModalOpen(false)}
          onCreated={(newReq) => {
            setActiveTab('requirements');
          }}
        />
      )}

      {/* Global 24/7 QariConnect AI Chatbot Assistant */}
      <QariConnectAIChat />

      {/* Global Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
