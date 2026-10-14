import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  MessageSquare,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  ArrowRightLeft,
  Sparkles,
  Award,
  Users,
  LayoutDashboard,
  Calendar,
  Menu,
  X,
  GraduationCap,
  UserPlus,
  HelpCircle,
  DollarSign,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { QARICONNECT_SUPPORT, COMMISSION_PERCENTAGE } from '../data/currencies';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openPostRequirementModal?: () => void;
  onBookFreeTrial?: () => void;
  onOpenTeacherSignup?: () => void;
  onOpenStudentSignup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openPostRequirementModal,
  onBookFreeTrial,
  onOpenTeacherSignup,
  onOpenStudentSignup,
}) => {
  const {
    currentUser,
    userProfile,
    qariProfile,
    isDemoUser,
    signInWithGoogle,
    logout,
    setUserRole,
    activateDemoPersona,
  } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentRole: UserRole = userProfile?.role || 'parent';

  const handleRoleToggle = async () => {
    const nextRole: UserRole = currentRole === 'parent' ? 'qari' : 'parent';
    if (isDemoUser) {
      await activateDemoPersona(nextRole);
    } else if (currentUser) {
      await setUserRole(nextRole);
    } else {
      await activateDemoPersona(nextRole);
    }
    if (nextRole === 'qari') {
      setActiveTab('qari_dashboard');
    } else {
      setActiveTab('directory');
    }
    setMobileMenuOpen(false);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleTeacherSignupClick = () => {
    if (onOpenTeacherSignup) {
      onOpenTeacherSignup();
    } else {
      setActiveTab('register_teacher');
    }
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleStudentSignupClick = () => {
    if (onOpenStudentSignup) {
      onOpenStudentSignup();
    } else {
      setActiveTab('register_student');
    }
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand Display (Mobile and Desktop Friendly) */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0"
            onClick={() => handleNavigate(currentRole === 'qari' ? 'qari_dashboard' : 'directory')}
          >
            {/* Logo Image with Absolute / Relative Public Path + SVG/Icon Fallback */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-br from-emerald-800 to-teal-950 flex items-center justify-center text-amber-300 shadow-md shadow-emerald-950/15 border border-emerald-700/30 overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="QariConnect"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load in strict environment, hide img so SVG icon below is shown
                  e.currentTarget.style.display = 'none';
                }}
              />
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2] absolute pointer-events-none" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-emerald-950 tracking-tight font-serif">
                  Qari<span className="text-emerald-700">Connect</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide uppercase bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                  Verified
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium hidden xs:block truncate max-w-44 sm:max-w-none">
                Online Quran &amp; Tajweed Marketplace
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links based on User Role */}
          <nav className="hidden lg:flex items-center space-x-1">
            {currentRole === 'qari' ? (
              <>
                <button
                  onClick={() => handleNavigate('qari_dashboard')}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'qari_dashboard'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                  Teacher Dashboard
                </button>

                <button
                  onClick={() => handleNavigate('requirements')}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'requirements'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Parent Requests
                </button>

                <button
                  onClick={() => handleNavigate('sessions')}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'sessions'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  Classes &amp; Progress
                </button>

                <button
                  onClick={() => handleNavigate('agreements')}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'agreements'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Contracts &amp; Invoices
                </button>

                <button
                  onClick={() => handleNavigate('messages')}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'messages'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </button>

                <button
                  onClick={() => handleNavigate('faqs')}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'faqs'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-emerald-700" />
                  FAQs
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('directory')}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'directory' || activeTab === 'home' || activeTab === 'find_qari'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <Search className="w-4 h-4 text-emerald-700" />
                  Find Qaris
                </button>

                <button
                  onClick={() => handleNavigate('how_it_works')}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'how_it_works'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  How It Works
                </button>

                <button
                  onClick={() => handleNavigate('pricing')}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'pricing'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  Pricing
                </button>

                <button
                  onClick={() => handleNavigate('faqs')}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'faqs'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  FAQs
                </button>

                <button
                  onClick={() => handleNavigate('requirements')}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'requirements'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Requests
                </button>

                <button
                  onClick={() => handleNavigate('agreements')}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'agreements'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Contracts
                </button>

                <button
                  onClick={() => handleNavigate('messages')}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'messages'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </button>
              </>
            )}
          </nav>

          {/* Desktop Right Actions: Clear Signup Buttons & Profile */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Teacher Signup (Prominent Button) */}
            <button
              onClick={handleTeacherSignupClick}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                activeTab === 'register_teacher'
                  ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-sm'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:text-emerald-950'
              }`}
              title="Register as a Quran Teacher / Qari"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
              <span>Teacher Signup</span>
            </button>

            {/* Student Signup / Free Trial */}
            <button
              onClick={handleStudentSignupClick}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                activeTab === 'register_student'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
              title="Register as Student for Free Trial"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Student Signup</span>
            </button>

            {/* Quick Trial Booking Button */}
            <button
              onClick={() => (onBookFreeTrial ? onBookFreeTrial() : handleNavigate('directory'))}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">Book Trial</span>
            </button>

            {/* Role Switcher */}
            <button
              onClick={handleRoleToggle}
              title={`Switch role to ${currentRole === 'parent' ? 'Teacher / Qari' : 'Parent / Student'}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-medium transition cursor-pointer shadow-2xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[11px] font-semibold">
                {currentRole === 'parent' ? 'Student Mode' : 'Qari Mode'}
              </span>
            </button>

            {/* User Profile / Auth Dropdown */}
            {currentUser || isDemoUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                >
                  <img
                    src={
                      userProfile?.avatarUrl ||
                      qariProfile?.avatarUrl ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
                    }
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover border border-emerald-300"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {userProfile?.displayName || currentUser?.displayName || 'Active User'}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {currentRole === 'parent' ? 'Parent / Student' : 'Teacher / Qari'}
                        </span>
                      </div>
                    </div>

                    <div className="px-2 py-1 space-y-0.5">
                      {/* Real Registration Links in Dropdown */}
                      <button
                        onClick={handleTeacherSignupClick}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                          Teacher Registration Form
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 uppercase">Apply</span>
                      </button>

                      <button
                        onClick={handleStudentSignupClick}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                          Student Signup Form
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase">Free</span>
                      </button>

                      <button
                        onClick={handleRoleToggle}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                      >
                        <span>Switch to {currentRole === 'parent' ? 'Qari (Teacher)' : 'Parent'} Mode</span>
                        <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                      </button>

                      {currentRole === 'qari' ? (
                        <>
                          <button
                            onClick={() => handleNavigate('qari_dashboard')}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                          >
                            <span>Teacher Dashboard</span>
                            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handleNavigate('qari_profile')}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                          >
                            <span>Manage Teacher Profile</span>
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleNavigate('parent_profile')}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                        >
                          <span>Family Learning Profile</span>
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      )}

                      <button
                        onClick={() => handleNavigate('agreements')}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                      >
                        <span>Contracts &amp; Invoices ({COMMISSION_PERCENTAGE}%)</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    </div>

                    <div className="border-t border-gray-100 mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>

          {/* Mobile Right Controls: Signup Shortcut + Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-1.5">
            {/* Quick Mobile Teacher Signup Link */}
            <button
              onClick={handleTeacherSignupClick}
              className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-emerald-950 font-bold text-[11px] flex items-center gap-1 shadow-2xs active:bg-amber-500"
              title="Teacher Signup"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Teacher</span>
            </button>

            {/* Quick Mobile Student Signup Link */}
            <button
              onClick={handleStudentSignupClick}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs active:bg-emerald-900"
              title="Student Signup"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-300" />
              <span>Student</span>
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition cursor-pointer border border-gray-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-900" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER / SHEET */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          {/* Prominent High-Contrast Mobile Signup Buttons */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-gray-200">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Quick Registration &amp; Onboarding:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTeacherSignupClick}
                className="p-3 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-emerald-950 rounded-xl text-xs font-extrabold shadow-sm transition flex flex-col items-center justify-center gap-1 text-center cursor-pointer border border-amber-500"
              >
                <GraduationCap className="w-5 h-5 text-emerald-950" />
                <span>Teacher Signup</span>
                <span className="text-[10px] font-normal text-emerald-900">Earn 85%</span>
              </button>

              <button
                onClick={handleStudentSignupClick}
                className="p-3 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex flex-col items-center justify-center gap-1 text-center cursor-pointer border border-emerald-900"
              >
                <UserPlus className="w-5 h-5 text-amber-300" />
                <span>Student Signup</span>
                <span className="text-[10px] font-normal text-emerald-200">Free Trial</span>
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onBookFreeTrial) onBookFreeTrial();
                else setActiveTab('directory');
              }}
              className="w-full py-2.5 px-3 bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Book 30-Min Free Trial Class</span>
            </button>
          </div>

          {/* Navigation Links for Mobile */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block px-1">
              Main Menu:
            </span>

            <button
              onClick={() => handleNavigate('directory')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'directory' || activeTab === 'home' || activeTab === 'find_qari'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Find Quran Tutors (Qaris)
              </span>
              <span className="text-[10px] opacity-75">Directory</span>
            </button>

            <button
              onClick={() => handleNavigate('how_it_works')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'how_it_works'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                How It Works
              </span>
              <span className="text-[10px] opacity-75">Guide</span>
            </button>

            <button
              onClick={() => handleNavigate('pricing')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing &amp; {COMMISSION_PERCENTAGE}% Commission
              </span>
              <span className="text-[10px] opacity-75">Halal Rates</span>
            </button>

            <button
              onClick={() => handleNavigate('faqs')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                Frequently Asked Questions (FAQs)
              </span>
              <span className="text-[10px] opacity-75">Ibtidai</span>
            </button>

            <button
              onClick={() => handleNavigate('requirements')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'requirements'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Parent Learning Requests
              </span>
              <span className="text-[10px] opacity-75">Browse</span>
            </button>

            <button
              onClick={() => handleNavigate('agreements')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'agreements'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Contracts &amp; Invoices
              </span>
              <span className="text-[10px] opacity-75">Agreements</span>
            </button>

            <button
              onClick={() => handleNavigate('messages')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Direct Teacher &amp; Parent Chat
              </span>
              <span className="text-[10px] opacity-75">Live</span>
            </button>
          </div>

          {/* Role Switcher in Mobile Drawer */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleRoleToggle}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-700" />
                Switch to {currentRole === 'parent' ? 'Qari (Teacher)' : 'Parent/Student'} Mode
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                Current: {currentRole === 'parent' ? 'Parent' : 'Teacher'}
              </span>
            </button>
          </div>

          {/* Official WhatsApp Support Banner */}
          <div className="p-3 rounded-2xl bg-emerald-950 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                WhatsApp Helpline
              </span>
              <span className="text-[10px] text-emerald-300 font-mono">24/7 Available</span>
            </div>
            <p className="text-[11px] text-emerald-100 leading-tight">
              Official QariConnect Support &amp; payment confirmation:
            </p>
            <a
              href={QARICONNECT_SUPPORT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-2 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition"
            >
              WhatsApp: {QARICONNECT_SUPPORT.whatsappDisplay}
            </a>
          </div>

          {/* Auth in Mobile Drawer */}
          <div className="pt-1 border-t border-gray-100 flex items-center justify-between">
            {currentUser || isDemoUser ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-gray-700 truncate max-w-44">
                  {userProfile?.displayName || 'User'}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-red-600 font-semibold hover:bg-red-50 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  signInWithGoogle();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <User className="w-4 h-4" />
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
