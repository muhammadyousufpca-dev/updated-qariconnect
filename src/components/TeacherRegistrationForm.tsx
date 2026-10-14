import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  DollarSign,
  GraduationCap,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  Globe2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QARICONNECT_SUPPORT, COMMISSION_PERCENTAGE, TEACHER_PAYOUT_PERCENTAGE } from '../data/currencies';

interface TeacherRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TeacherRegistrationForm: React.FC<TeacherRegistrationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { saveQariProfile, setUserRole, activateDemoPersona, userProfile } = useAuth();

  // Form State
  const [fullName, setFullName] = useState(userProfile?.displayName || '');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [contactNumber, setContactNumber] = useState(userProfile?.phoneNumber || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [hasSanad, setHasSanad] = useState(true);
  const [sanadDetails, setSanadDetails] = useState('');
  const [hourlyRateUSD, setHourlyRateUSD] = useState<number>(15);
  const [monthlyFeePKR, setMonthlyFeePKR] = useState<number>(6000);
  const [preferredTimings, setPreferredTimings] = useState('Evening (5 PM - 10 PM PKT)');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Nazra Quran',
    'Tajweed Rules & Makharij',
    'Noorani Qaida',
  ]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    'Urdu',
    'English',
  ]);
  const [bio, setBio] = useState('');
  const [acceptedCommission, setAcceptedCommission] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const subjectsList = [
    'Noorani Qaida',
    'Nazra Quran',
    'Tajweed Rules & Makharij',
    'Hifz-ul-Quran (Memorization)',
    'Qira’at ‘Asharah',
    'Islamic Studies & Daily Duas',
    'Quranic Arabic Language',
    'Tafseer-ul-Quran',
  ];

  const languagesList = ['Urdu', 'English', 'Arabic', 'Pashto', 'Punjabi'];

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((item) => item !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!qualification.trim()) {
      setErrorMsg('Please state your Quranic qualification (e.g. Hafiz, Alim, Tajweed Certified).');
      return;
    }
    if (!contactNumber.trim()) {
      setErrorMsg('Please enter your active WhatsApp / contact number.');
      return;
    }
    if (selectedSubjects.length === 0) {
      setErrorMsg('Please select at least one teaching subject.');
      return;
    }
    if (!acceptedCommission) {
      setErrorMsg('You must agree to the one-time 15% platform commission policy on the first month.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create and save real teacher profile
      const newProfile = {
        fullName: fullName.trim(),
        avatarUrl:
          gender === 'female'
            ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        subjects: selectedSubjects,
        qualifications: qualification.trim(),
        experienceYears: Number(experienceYears),
        classesGrades: ['All Age Groups', 'Children & Beginners', 'Adults'],
        city: city.trim() || 'Lahore',
        country: country.trim() || 'Pakistan',
        contactNumber: contactNumber.trim(),
        email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '')}@qariconnect.org`,
        currency: 'USD',
        hourlyRate: Number(hourlyRateUSD),
        monthlyFee: Number(monthlyFeePKR),
        riwayah: sanadDetails || 'Hafs ‘an ‘Asim via Shatibiyyah',
        isSanadVerified: hasSanad,
        sanadVerificationStatus: hasSanad ? 'verified' as const : 'unverified' as const,
        bio: bio.trim() || `${qualification}. Dedicated to teaching Tajweed and recitation with authentic Makharij and patience.`,
        preferredTimings,
        languagesSpoken: selectedLanguages,
        availableSlots: ['08:00 AM - 12:00 PM', '04:00 PM - 09:00 PM'],
      };

      await setUserRole('qari');
      await saveQariProfile(newProfile);

      setSubmittedData({
        ...newProfile,
        regRef: `QARI-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Error saving profile. Please check details or connect via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedData) {
    const waText = encodeURIComponent(
      `Assalamu Alaikum QariConnect Support!\n\n` +
      `I have registered as a Quran Teacher on QariConnect:\n` +
      `Registration Ref: ${submittedData.regRef}\n` +
      `Name: ${submittedData.fullName}\n` +
      `Gender: ${gender === 'female' ? 'Female (Qaria / Ustadha)' : 'Male (Qari / Ustadh)'}\n` +
      `Qualification: ${submittedData.qualifications}\n` +
      `Experience: ${submittedData.experienceYears} Years\n` +
      `Subjects: ${submittedData.subjects.join(', ')}\n` +
      `Languages: ${submittedData.languagesSpoken.join(', ')}\n` +
      `Timings: ${submittedData.preferredTimings}\n` +
      `Monthly Fee: Rs ${submittedData.monthlyFee} PKR ($${submittedData.hourlyRate}/hr)\n` +
      `Contact: ${submittedData.contactNumber}\n` +
      `I agree to the 15% one-time platform commission on Month 1 only and am sending my recitation sample/Ijazah.`
    );
    const waUrl = `https://wa.me/923006856772?text=${waText}`;

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-9 h-9 text-emerald-600 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold uppercase tracking-wider">
              Registration Successful
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-950">
              Congratulations! Teacher Application Submitted
            </h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              Your teacher profile has been registered in the QariConnect directory under Reference:
              <strong className="text-emerald-900 ml-1 font-mono font-bold">
                {submittedData.regRef}
              </strong>
            </p>
          </div>

          {/* Registration Details Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-gray-200 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Teacher Name:</span>
              <span className="font-bold text-gray-900">{submittedData.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Qualification:</span>
              <span className="font-bold text-gray-900">{submittedData.qualifications}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Experience:</span>
              <span className="font-semibold text-gray-800">{submittedData.experienceYears} Years</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Proposed Tuition:</span>
              <span className="font-bold text-emerald-800">
                Rs {submittedData.monthlyFee} PKR / mo (${submittedData.hourlyRate} USD/hr)
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Platform Commission:</span>
              <span className="font-semibold text-emerald-800">15% ONE-TIME on Month 1 only (0% recurring)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">WhatsApp Contact:</span>
              <span className="font-mono font-bold text-gray-900">{submittedData.contactNumber} (Protected)</span>
            </div>
          </div>

          {/* WhatsApp Verification Notice */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-left text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-2 text-amber-900">
              <Phone className="w-4 h-4 text-amber-700" />
              <span>Next Step: Oral Recitation & Sanad Verification</span>
            </div>
            <p className="leading-relaxed">
              To activate your verified badge in the student directory, please send a 1-minute audio recitation sample or Ijazah photo directly to our official WhatsApp helpline:
              <strong className="text-amber-900 ml-1">03006856772</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-amber-300" />
              <span>Confirm via WhatsApp (03006856772)</span>
            </a>

            {onSuccess && (
              <button
                type="button"
                onClick={onSuccess}
                className="w-full sm:w-auto px-5 py-3.5 border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Go to Teacher Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          <span>Official Teacher Onboarding</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-emerald-950">
          Teacher / Qari Registration
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          Create your verified tutor profile on QariConnect. Connect with serious students, manage classes, and keep 85% of your monthly tuition fees.
        </p>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-xl space-y-8"
      >
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Basic Personal Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <span>1. Personal & Contact Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Name (Pura Naam) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Qari Hafiz Muhammad Bilal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    gender === 'male'
                      ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>Male (Qari)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    gender === 'female'
                      ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>Female (Qaria)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                WhatsApp / Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. 0300 1234567 or +92 300 1234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden font-mono"
              />
              <p className="text-[11px] text-gray-500 mt-1">Official communication & class confirmations will use this number.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. qari.ahmad@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lahore / Karachi / Islamabad"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Pakistan / Egypt / UK"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 2. Quranic Credentials & Experience */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>2. Quranic Qualifications & Experience</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Qualification Title & Sanad Details <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. Hafiz-ul-Quran & Wifaqul Madaris Graduate / Al-Azhar Certified"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Teaching Experience (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="40"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Do you possess an authentic Sanad Muttasil / Ijazah?
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    checked={hasSanad}
                    onChange={() => setHasSanad(true)}
                    className="text-emerald-700"
                  />
                  <span>Yes (Certified Sanad)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    checked={!hasSanad}
                    onChange={() => setHasSanad(false)}
                    className="text-emerald-700"
                  />
                  <span>No (General Madaris / Hafiz)</span>
                </label>
              </div>
            </div>

            {hasSanad && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Sanad Chain / Riwayah Details
                </label>
                <input
                  type="text"
                  value={sanadDetails}
                  onChange={(e) => setSanadDetails(e.target.value)}
                  placeholder="e.g. Riwayah Hafs ‘an ‘Asim with continuous chain back to the Prophet ﷺ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. Subjects & Languages */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>3. Subjects & Spoken Languages</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Subjects You Teach (Select all that apply) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {subjectsList.map((subject) => {
                const isSelected = selectedSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`p-2.5 rounded-xl text-xs font-medium text-left border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-bold'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{subject}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Instruction Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {languagesList.map((lang) => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Globe2 className="w-3 h-3" />
                    <span>{lang}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Fee & Schedule */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>4. Fee Rate & Preferred Schedule</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Monthly Tuition Fee (PKR)
              </label>
              <input
                type="number"
                step="500"
                min="2000"
                value={monthlyFeePKR}
                onChange={(e) => setMonthlyFeePKR(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
              <p className="text-[11px] text-gray-500 mt-1">Directly paid to you by students via EasyPaisa / JazzCash / Bank.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Hourly Rate for Overseas Students (USD)
              </label>
              <input
                type="number"
                step="1"
                min="5"
                value={hourlyRateUSD}
                onChange={(e) => setHourlyRateUSD(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
              <p className="text-[11px] text-gray-500 mt-1">Applies for international students outside Pakistan.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Preferred Teaching Timings & Available Days
              </label>
              <input
                type="text"
                value={preferredTimings}
                onChange={(e) => setPreferredTimings(e.target.value)}
                placeholder="e.g. Monday to Friday, 5:00 PM to 9:00 PM PKT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Short Bio / Introduction (About Your Teaching Style)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your experience teaching kids, your patience, and your focus on proper Tajweed pronunciation..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 5. 15% Platform Commission Terms Agreement */}
        <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200 space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="commission-term"
              checked={acceptedCommission}
              onChange={(e) => setAcceptedCommission(e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-800 rounded-sm border-amber-300 focus:ring-emerald-600"
            />
            <label htmlFor="commission-term" className="text-xs sm:text-sm text-amber-950 font-medium cursor-pointer">
              <strong>I agree to the QariConnect 15% Platform Commission Policy:</strong>
              <span className="block text-xs text-amber-900 mt-1 leading-relaxed">
                Students pay the monthly tuition fee directly to me via EasyPaisa, JazzCash, or Bank Transfer. I agree to pay a 15% platform commission of my monthly earnings to QariConnect at the end of each month and send payment receipts to WhatsApp Helpline <strong>03006856772</strong>.
              </span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Cancel &amp; Go Back
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer ml-auto"
          >
            {isSubmitting ? (
              <span>Registering Teacher...</span>
            ) : (
              <>
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>Submit Teacher Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
