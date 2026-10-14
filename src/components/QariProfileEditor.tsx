import React, { useState, useEffect } from 'react';
import {
  Award,
  Globe2,
  DollarSign,
  Clock,
  User,
  BookOpen,
  CheckCircle2,
  Save,
  Image as ImageIcon,
  Phone,
  GraduationCap,
  Layers,
  Edit3,
  Sparkles,
  AlertCircle,
  Check,
  Eye,
  Plus,
  X,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QariProfile } from '../types';
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_LIST,
  formatCurrency,
  getCurrencyInfo,
  getCurrencySymbol,
  COMMON_COUNTRIES,
  COMMISSION_RATE,
  COMMISSION_PERCENTAGE,
  TEACHER_PAYOUT_PERCENTAGE,
  maskContactNumber,
} from '../data/currencies';

const POPULAR_SUBJECTS = [
  'Noorani Qaida',
  'Nazra Quran',
  'Tajweed Rules & Makharij',
  'Hifz-ul-Quran (Memorization)',
  'Qira\'at \'Asharah (Ten Recitations)',
  'Tarteel & Maqamat',
  'Islamic Studies & Daily Duas',
  'Quranic Arabic Language',
];

const GRADE_LEVELS = [
  'Early Childhood (Ages 4-7)',
  'Primary / Grade 1-5 (Ages 6-10)',
  'Middle School / Grade 6-8 (Ages 11-14)',
  'High School / Grade 9-12 (Teens 14-18)',
  'Adults & Sisters Circles (18+)',
  'Hifz Candidates (All Ages)',
];

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
];

export const QariProfileEditor: React.FC = () => {
  const { qariProfile, saveQariProfile, userProfile, setUserRole, isSuperAdmin } = useAuth();

  // Mode: if teacher already has a saved profile, start in card view, else form mode
  const [isEditing, setIsEditing] = useState<boolean>(!qariProfile?.fullName);

  // Form Fields
  const [fullName, setFullName] = useState(
    qariProfile?.fullName || userProfile?.displayName || ''
  );
  const [avatarUrl, setAvatarUrl] = useState(
    qariProfile?.avatarUrl || SAMPLE_AVATARS[0]
  );
  const [subjects, setSubjects] = useState<string[]>(
    qariProfile?.subjects && qariProfile.subjects.length > 0
      ? qariProfile.subjects
      : ['Noorani Qaida', 'Nazra Quran', 'Tajweed Rules & Makharij']
  );
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [qualifications, setQualifications] = useState(
    qariProfile?.qualifications ||
      'Degree in Quranic Sciences from Al-Azhar University. Ijazah in Riwayah Hafs \'an Asim.'
  );
  const [experienceYears, setExperienceYears] = useState<number>(
    qariProfile?.experienceYears ?? 8
  );
  const [classesGrades, setClassesGrades] = useState<string[]>(
    qariProfile?.classesGrades && qariProfile.classesGrades.length > 0
      ? qariProfile.classesGrades
      : ['Primary / Grade 1-5 (Ages 6-10)', 'Middle School / Grade 6-8 (Ages 11-14)']
  );
  const [customGradeInput, setCustomGradeInput] = useState('');
  const [city, setCity] = useState(qariProfile?.city || 'Cairo');
  const [country, setCountry] = useState(qariProfile?.country || 'Egypt');
  const [contactNumber, setContactNumber] = useState(
    qariProfile?.contactNumber || '+20 102 345 6789'
  );
  const [bio, setBio] = useState(
    qariProfile?.bio ||
      'Assalamu Alaikum. Dedicated Quran instructor with authentic Sanad Muttasil. I guide young students and adults through foundational phonetics, Noorani Qaida, and advanced Tajweed with patience and precision.'
  );
  const [monthlyFee, setMonthlyFee] = useState<number>(qariProfile?.monthlyFee || 110);
  const [hourlyFee, setHourlyFee] = useState<number>(qariProfile?.hourlyFee || 18);
  const [currency, setCurrency] = useState<string>(qariProfile?.currency || 'USD');

  // Existing additional attributes preserved
  const [title, setTitle] = useState(
    qariProfile?.title || 'Certified Hafiz & Tajweed Instructor (Shatibiyyah Sanad)'
  );
  const [hasSanad, setHasSanad] = useState<boolean>(qariProfile?.hasSanad ?? true);
  const [sanadDetails, setSanadDetails] = useState(
    qariProfile?.sanadDetails ||
      'Sanad Muttasil in Riwayah Hafs \'an Asim via Shatibiyyah with direct chain of recitation back to Prophet Muhammad ﷺ.'
  );
  const [languagesStr, setLanguagesStr] = useState(
    qariProfile?.languages?.join(', ') || 'Arabic (Native), English (Fluent)'
  );
  const [availability, setAvailability] = useState(
    qariProfile?.availability || 'Monday - Saturday: 14:00 - 21:00 GMT'
  );

  // Validation errors map
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState(false);

  // Re-hydrate when qariProfile loads from Firestore
  useEffect(() => {
    if (qariProfile) {
      setFullName(qariProfile.fullName || '');
      if (qariProfile.avatarUrl) setAvatarUrl(qariProfile.avatarUrl);
      if (qariProfile.subjects && qariProfile.subjects.length > 0) {
        setSubjects(qariProfile.subjects);
      }
      setQualifications(qariProfile.qualifications || '');
      setExperienceYears(qariProfile.experienceYears ?? 8);
      if (qariProfile.classesGrades && qariProfile.classesGrades.length > 0) {
        setClassesGrades(qariProfile.classesGrades);
      }
      setCity(qariProfile.city || '');
      setCountry(qariProfile.country || 'Egypt');
      setContactNumber(qariProfile.contactNumber || '');
      setBio(qariProfile.bio || '');
      setMonthlyFee(qariProfile.monthlyFee || 110);
      setHourlyFee(qariProfile.hourlyFee || 18);
      setCurrency(qariProfile.currency || 'USD');
      setTitle(qariProfile.title || '');
      setHasSanad(qariProfile.hasSanad ?? true);
      setSanadDetails(qariProfile.sanadDetails || '');
      if (qariProfile.languages) setLanguagesStr(qariProfile.languages.join(', '));
      setAvailability(qariProfile.availability || '');
    }
  }, [qariProfile]);

  // Subject toggling
  const toggleSubject = (subj: string) => {
    if (subjects.includes(subj)) {
      setSubjects(subjects.filter((s) => s !== subj));
    } else {
      setSubjects([...subjects, subj]);
    }
    if (errors.subjects) {
      setErrors((prev) => ({ ...prev, subjects: '' }));
    }
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    if (!subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
    }
    setCustomSubjectInput('');
    if (errors.subjects) {
      setErrors((prev) => ({ ...prev, subjects: '' }));
    }
  };

  // Grade level toggling
  const toggleGrade = (grade: string) => {
    if (classesGrades.includes(grade)) {
      setClassesGrades(classesGrades.filter((g) => g !== grade));
    } else {
      setClassesGrades([...classesGrades, grade]);
    }
    if (errors.classesGrades) {
      setErrors((prev) => ({ ...prev, classesGrades: '' }));
    }
  };

  const handleAddCustomGrade = () => {
    const trimmed = customGradeInput.trim();
    if (!trimmed) return;
    if (!classesGrades.includes(trimmed)) {
      setClassesGrades([...classesGrades, trimmed]);
    }
    setCustomGradeInput('');
    if (errors.classesGrades) {
      setErrors((prev) => ({ ...prev, classesGrades: '' }));
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name is required (minimum 2 characters).';
    }

    if (!avatarUrl.trim()) {
      newErrors.avatarUrl = 'Profile photo URL is required.';
    }

    if (subjects.length === 0) {
      newErrors.subjects = 'Please select at least one subject that you teach.';
    }

    if (!qualifications.trim() || qualifications.trim().length < 5) {
      newErrors.qualifications = 'Qualification details are required (e.g. Al-Azhar, Ijazah, University degree).';
    }

    if (experienceYears < 0 || experienceYears > 60 || isNaN(experienceYears)) {
      newErrors.experienceYears = 'Please enter valid teaching experience years (0 - 60).';
    }

    if (classesGrades.length === 0) {
      newErrors.classesGrades = 'Please select at least one class / student grade level.';
    }

    if (!city.trim()) {
      newErrors.city = 'City / Location is required.';
    }

    if (!contactNumber.trim() || contactNumber.trim().length < 6) {
      newErrors.contactNumber = 'Valid contact number is required (e.g. +1 234 567 8900 or WhatsApp).';
    }

    if (!bio.trim() || bio.trim().length < 15) {
      newErrors.bio = 'Short introduction / bio is required (minimum 15 characters).';
    }

    if (monthlyFee <= 0 || isNaN(monthlyFee)) {
      newErrors.monthlyFee = `Please enter a valid monthly teaching fee greater than 0 ${currency}.`;
    }

    if (hourlyFee <= 0 || isNaN(hourlyFee)) {
      newErrors.hourlyFee = `Please enter a valid hourly fee greater than 0 ${currency}.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to top of form or alert
      return;
    }

    setSaving(true);
    try {
      const languages = languagesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedData: Partial<QariProfile> = {
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim(),
        title: title.trim() || 'Certified Quran & Tajweed Teacher',
        subjects,
        qualifications: qualifications.trim(),
        experienceYears: Number(experienceYears),
        classesGrades,
        city: city.trim(),
        country: country.trim() || 'Global',
        contactNumber: contactNumber.trim(),
        bio: bio.trim(),
        currency,
        monthlyFee: Number(monthlyFee),
        hourlyFee: Number(hourlyFee),
        hasSanad,
        sanadDetails: hasSanad ? sanadDetails.trim() : '',
        tajweedSpecialization: subjects.join(', '),
        languages: languages.length > 0 ? languages : ['Arabic', 'English'],
        preferredAgeGroups: classesGrades,
        availability: availability.trim() || 'Flexible timings agreed upon request',
        isVerified: true,
      };

      if (userProfile?.role !== 'qari') {
        try {
          await setUserRole('qari');
        } catch (roleErr) {
          console.warn('Could not update role in user doc:', roleErr);
        }
      }

      await saveQariProfile(updatedData);

      setSaving(false);
      setSavedSuccessMessage(true);
      // Switch to Profile Card layout as requested!
      setIsEditing(false);

      setTimeout(() => setSavedSuccessMessage(false), 4000);
    } catch (err) {
      console.error('Error saving teacher profile:', err);
      setSaving(false);
    }
  };

  // 15% one-time commission breakdown preview (85% teacher payout on month 1, 100% recurring)
  const platformCut = (monthlyFee * COMMISSION_RATE).toFixed(2);
  const teacherPayout = (monthlyFee * (1 - COMMISSION_RATE)).toFixed(2);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Success Notification Banner */}
      {savedSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-950 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Teacher Profile Saved to Firebase!</p>
              <p className="text-emerald-800 text-[11px]">
                Your profile is live in the directory and parents can now view your credentials and book trial lessons.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSavedSuccessMessage(false)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------
          VIEW 1: CLEAN PROFILE-CARD LAYOUT (Shown after saving / review)
         ------------------------------------------------------------- */}
      {!isEditing ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Actions Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-800">Your Teacher Profile Card is Live</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              Edit Profile
            </button>
          </div>

          {/* Main Clean Profile Card Layout */}
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-md overflow-hidden">
            {/* Header Banner */}
            <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 sm:p-8 text-white relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-28 h-28 rounded-2xl object-cover border-3 border-amber-300 shadow-lg shrink-0"
                />
                <div className="text-center sm:text-left space-y-2 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">{fullName}</h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      Verified Qari
                    </span>
                    {hasSanad && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-emerald-950 shadow-xs">
                        <Award className="w-3.5 h-3.5" />
                        Sanad Muttasil
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-200 font-medium">{title}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-emerald-300">
                    <span className="flex items-center gap-1">
                      <Globe2 className="w-3.5 h-3.5 text-amber-300" />
                      {city}, {country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      {experienceYears} Years Teaching Exp
                    </span>
                    {contactNumber && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-100 bg-emerald-800/60 px-2.5 py-0.5 rounded-lg border border-emerald-700/50">
                        <Lock className="w-3 h-3 text-amber-300" />
                        <span>
                          {isSuperAdmin
                            ? contactNumber
                            : maskContactNumber(contactNumber, false)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Short Introduction */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Short Introduction & Teaching Philosophy
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                  {bio}
                </p>
              </div>

              {/* Subjects They Teach */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  Subjects Taught
                </h4>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-950 border border-emerald-200"
                    >
                      ✓ {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Classes & Grades They Teach */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  Classes & Grades Taught
                </h4>
                <div className="flex flex-wrap gap-2">
                  {classesGrades.map((grade, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      {grade}
                    </span>
                  ))}
                </div>
              </div>

              {/* Qualifications & Sanad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    Formal Qualifications
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {qualifications}
                  </p>
                </div>

                {hasSanad && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-1">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wide">
                      <Award className="w-4 h-4 text-amber-700" />
                      Sanad Muttasil Lineage
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      {sanadDetails}
                    </p>
                  </div>
                )}
              </div>

              {/* Service & Teaching Fee Card */}
              <div className="bg-linear-to-r from-emerald-50 to-teal-50/60 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
                  <div>
                    <div className="text-xs text-gray-600 font-medium">Monthly Tuition Fee</div>
                    <div className="text-2xl font-black text-emerald-950 font-serif">
                      {formatCurrency(monthlyFee, currency)}
                      <span className="text-xs font-normal text-gray-500"> / month</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600 font-medium">Approx. Hourly Rate</div>
                    <div className="text-lg font-bold text-gray-800">{formatCurrency(hourlyFee, currency)} / hr</div>
                  </div>
                </div>

                <div className="mt-3 pt-1 text-xs space-y-1 text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>Teacher Net Share ({TEACHER_PAYOUT_PERCENTAGE}%):</span>
                    <span className="font-bold text-emerald-800">{formatCurrency(Number(teacherPayout), currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>QariConnect Commission ({COMMISSION_PERCENTAGE}% Month 1 only):</span>
                    <span className="font-bold text-amber-800">{formatCurrency(Number(platformCut), currency)}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20"
                >
                  <Edit3 className="w-4 h-4 text-amber-300" />
                  Edit This Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* -------------------------------------------------------------
            VIEW 2: TEACHER REGISTRATION & PROFILE FORM
           ------------------------------------------------------------- */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in">
          {/* Header */}
          <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 sm:p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif">
                    Teacher Registration & Profile
                  </h2>
                  <p className="text-xs text-emerald-200">
                    Complete your Quran teacher credentials. Saves permanently to Firebase.
                  </p>
                </div>
              </div>

              {qariProfile?.fullName && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-emerald-400/50 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Profile Card
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6">
            {/* Global Errors Alert */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Please complete the required fields below:
                </div>
                <ul className="list-disc list-inside text-red-700 pl-2 space-y-0.5">
                  {Object.values(errors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 1. Full Name & Professional Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="e.g. Sheikh Ahmad Al-Masri"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-emerald-600 font-bold ${
                      errors.fullName ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Professional Title / Designation
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Certified Hafiz & Senior Tajweed Instructor"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600 font-medium"
                />
              </div>
            </div>

            {/* 2. Profile Photo with Presets */}
            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                Profile Photo *
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={avatarUrl}
                  alt="Preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-300 shadow-sm shrink-0"
                />
                <div className="flex-1 w-full space-y-2">
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      required
                      value={avatarUrl}
                      onChange={(e) => {
                        setAvatarUrl(e.target.value);
                        if (errors.avatarUrl) setErrors((prev) => ({ ...prev, avatarUrl: '' }));
                      }}
                      placeholder="Paste image URL..."
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-white focus:outline-emerald-600 ${
                        errors.avatarUrl ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.avatarUrl && (
                    <p className="text-[11px] text-red-600 mt-0.5">{errors.avatarUrl}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">Or pick sample:</span>
                    <div className="flex gap-1.5">
                      {SAMPLE_AVATARS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(preset)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition ${
                            avatarUrl === preset ? 'border-emerald-600 scale-105' : 'border-transparent opacity-70'
                          }`}
                        >
                          <img src={preset} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Subjects They Teach */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Subjects You Teach *
                </label>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  {subjects.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {POPULAR_SUBJECTS.map((subj) => {
                  const isSelected = subjects.includes(subj);
                  return (
                    <button
                      type="button"
                      key={subj}
                      onClick={() => toggleSubject(subj)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                      {subj}
                    </button>
                  );
                })}
              </div>

              {/* Add custom subject */}
              <div className="flex items-center gap-2 pt-1 max-w-md">
                <input
                  type="text"
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  placeholder="Add other subject (e.g. Tafseer, Hadith)..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {errors.subjects && (
                <p className="text-[11px] text-red-600">{errors.subjects}</p>
              )}
            </div>

            {/* 4. Classes / Grades They Teach */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Classes & Grades You Teach *
                </label>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  {classesGrades.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GRADE_LEVELS.map((grade) => {
                  const isSelected = classesGrades.includes(grade);
                  return (
                    <button
                      type="button"
                      key={grade}
                      onClick={() => toggleGrade(grade)}
                      className={`p-2.5 rounded-xl text-xs text-left transition cursor-pointer flex items-center justify-between border ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{grade}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                    </button>
                  );
                })}
              </div>

              {/* Add custom grade level */}
              <div className="flex items-center gap-2 pt-1 max-w-md">
                <input
                  type="text"
                  value={customGradeInput}
                  onChange={(e) => setCustomGradeInput(e.target.value)}
                  placeholder="Add custom grade (e.g. IGCSE Islamiyat, University)..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomGrade}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {errors.classesGrades && (
                <p className="text-[11px] text-red-600">{errors.classesGrades}</p>
              )}
            </div>

            {/* 5. Qualification & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Qualification & Degrees *
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={qualifications}
                    onChange={(e) => {
                      setQualifications(e.target.value);
                      if (errors.qualifications) setErrors((prev) => ({ ...prev, qualifications: '' }));
                    }}
                    placeholder="e.g. Al-Azhar University, Ijazah in Ten Qira'at, Alimiyyah"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-emerald-600 ${
                      errors.qualifications ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.qualifications && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.qualifications}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Teaching Experience (Years) *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min={0}
                    max={60}
                    required
                    value={experienceYears}
                    onChange={(e) => {
                      setExperienceYears(Number(e.target.value));
                      if (errors.experienceYears) setErrors((prev) => ({ ...prev, experienceYears: '' }));
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-emerald-600 font-bold ${
                      errors.experienceYears ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.experienceYears && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.experienceYears}</p>
                )}
              </div>
            </div>

            {/* 6. Location (City, Country) & Contact Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  City *
                </label>
                <div className="relative">
                  <Globe2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                    }}
                    placeholder="e.g. Cairo, London, Lahore"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-emerald-600 ${
                      errors.city ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.city && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Country *
                </label>
                <div className="relative">
                  <Globe2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    list="common-countries-list"
                    value={country}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setCountry(selected);
                      const matched = COMMON_COUNTRIES.find(
                        (c) => c.name.toLowerCase() === selected.trim().toLowerCase()
                      );
                      if (matched) {
                        setCurrency(matched.defaultCurrency);
                      }
                    }}
                    placeholder="e.g. Pakistan, United Kingdom, Egypt, United States"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600 font-medium"
                  />
                  <datalist id="common-countries-list">
                    {COMMON_COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} (Default currency: {c.defaultCurrency})
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Contact Number (WhatsApp/Phone) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => {
                      setContactNumber(e.target.value);
                      if (errors.contactNumber) setErrors((prev) => ({ ...prev, contactNumber: '' }));
                    }}
                    placeholder="e.g. +20 102 345 6789"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-emerald-600 font-medium ${
                      errors.contactNumber ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.contactNumber && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.contactNumber}</p>
                )}
              </div>
            </div>

            {/* 7. Short Introduction */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Short Introduction & Bio *
              </label>
              <textarea
                rows={4}
                required
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  if (errors.bio) setErrors((prev) => ({ ...prev, bio: '' }));
                }}
                placeholder="Introduce yourself to parents, describing your teaching methodology, patience with kids, and Quranic background..."
                className={`w-full p-3 text-xs rounded-xl border focus:outline-emerald-600 ${
                  errors.bio ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                }`}
              />
              {errors.bio && (
                <p className="text-[11px] text-red-600 mt-1">{errors.bio}</p>
              )}
            </div>

            {/* 8. Service / Teaching Fee */}
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Service / Teaching Fee Expectation *
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  {COMMISSION_PERCENTAGE}% Platform Commission Model ({TEACHER_PAYOUT_PERCENTAGE}% Teacher Direct Payout)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Fee Currency *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      const newCurr = e.target.value;
                      setCurrency(newCurr);
                      const info = getCurrencyInfo(newCurr);
                      if (monthlyFee <= 0 || monthlyFee === 110 || monthlyFee === 5000) {
                        setMonthlyFee(info.defaultMonthlyFee);
                        setHourlyFee(info.defaultHourlyFee);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-emerald-600 font-bold"
                  >
                    {CURRENCY_LIST.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">Select the currency you charge in</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Monthly Tuition ({getCurrencySymbol(currency)} {currency}) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-gray-400 text-xs select-none pointer-events-none">
                      {getCurrencySymbol(currency)}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={500000}
                      required
                      value={monthlyFee}
                      onChange={(e) => {
                        setMonthlyFee(Number(e.target.value));
                        if (errors.monthlyFee) setErrors((prev) => ({ ...prev, monthlyFee: '' }));
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-emerald-600 font-bold"
                    />
                  </div>
                  {errors.monthlyFee && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.monthlyFee}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Approx. Hourly Fee ({getCurrencySymbol(currency)} {currency}) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-gray-400 text-xs select-none pointer-events-none">
                      {getCurrencySymbol(currency)}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={50000}
                      required
                      value={hourlyFee}
                      onChange={(e) => {
                        setHourlyFee(Number(e.target.value));
                        if (errors.hourlyFee) setErrors((prev) => ({ ...prev, hourlyFee: '' }));
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-emerald-600 font-bold"
                    />
                  </div>
                  {errors.hourlyFee && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.hourlyFee}</p>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-gray-600 flex flex-wrap justify-between gap-2 pt-1 border-t border-emerald-200/40">
                <span>Teacher Direct Payout ({TEACHER_PAYOUT_PERCENTAGE}% M1 / 100% recurring): <strong className="text-emerald-800">{formatCurrency(Number(teacherPayout), currency)}</strong></span>
                <span>Platform Commission ({COMMISSION_PERCENTAGE}% Month 1 only): <strong className="text-amber-800">{formatCurrency(Number(platformCut), currency)}</strong></span>
              </div>
            </div>

            {/* 9. Authentic Sanad Lineage Option (Preserved) */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-700" />
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                    Sanad Muttasil / Ijazah Certification
                  </h4>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSanad}
                    onChange={(e) => setHasSanad(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span>I hold an authentic Sanad</span>
                </label>
              </div>

              {hasSanad && (
                <div>
                  <textarea
                    rows={2}
                    value={sanadDetails}
                    onChange={(e) => setSanadDetails(e.target.value)}
                    placeholder="e.g. Sanad Muttasil in Hafs 'an Asim from Sheikh X through Imam Shatibi back to the Prophet ﷺ"
                    className="w-full p-2.5 text-xs rounded-xl border border-amber-300 bg-white focus:outline-amber-600 text-gray-800"
                  />
                </div>
              )}
            </div>

            {/* Clear Save Profile Button */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              {qariProfile?.fullName && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-extrabold tracking-wide uppercase transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-amber-300" />
                {saving ? 'Saving to Firebase...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
