import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Users,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Video,
} from 'lucide-react';
import { QARICONNECT_SUPPORT } from '../data/currencies';
import { useAuth } from '../context/AuthContext';

interface StudentRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onBookTrial?: () => void;
}

export const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({
  onSuccess,
  onCancel,
  onBookTrial,
}) => {
  const { userProfile, activateDemoPersona } = useAuth();

  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState<number | ''>(9);
  const [guardianName, setGuardianName] = useState(userProfile?.displayName || '');
  const [contactNumber, setContactNumber] = useState(userProfile?.phoneNumber || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [selectedCourse, setSelectedCourse] = useState('Nazra Quran');
  const [preferredTeacherGender, setPreferredTeacherGender] = useState<'any' | 'male' | 'female'>('any');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Evening (5:00 PM - 8:00 PM)');
  const [daysPerWeek, setDaysPerWeek] = useState('5 days / week (Mon - Fri)');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const coursesList = [
    { id: 'Noorani Qaida', label: 'Noorani Qaida (Beginners / Alphabet)', icon: '📖' },
    { id: 'Nazra Quran', label: 'Nazra Quran (Fluency with Tajweed)', icon: '✨' },
    { id: 'Hifz', label: 'Hifz-ul-Quran (Full / Partial Memorization)', icon: '⭐' },
    { id: 'Tajweed', label: 'Tajweed Rules & Makharij Correction', icon: '🎙️' },
    { id: 'Islamic Studies', label: 'Islamic Studies & Daily Masnoon Duas', icon: '🌙' },
    { id: 'Arabic Language', label: 'Quranic Arabic Language', icon: '🌐' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName.trim()) {
      setErrorMsg('Please enter student name (Talib-e-Ilm ka naam darj karein).');
      return;
    }
    if (!contactNumber.trim()) {
      setErrorMsg('Please enter parent/student WhatsApp contact number.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setSubmittedData({
        studentName: studentName.trim(),
        studentAge,
        guardianName: guardianName.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim(),
        city: city.trim() || 'Lahore',
        country: country.trim() || 'Pakistan',
        course: selectedCourse,
        teacherGender: preferredTeacherGender,
        timeSlot: preferredTimeSlot,
        days: daysPerWeek,
        notes: notes.trim(),
        regId: `STD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      });
      setIsSubmitting(false);
    }, 400);
  };

  if (submittedData) {
    const waText = encodeURIComponent(
      `Assalam-o-Alaikum QariConnect Support!\n\n` +
      `I want to register a new student for online Quran classes:\n` +
      `Registration ID: ${submittedData.regId}\n` +
      `Student Name: ${submittedData.studentName} (Age: ${submittedData.studentAge || 'N/A'})\n` +
      `Guardian: ${submittedData.guardianName || 'Self'}\n` +
      `Course: ${submittedData.course}\n` +
      `Preferred Qari Gender: ${
        submittedData.teacherGender === 'female'
          ? 'Female (Qaria)'
          : submittedData.teacherGender === 'male'
          ? 'Male (Qari)'
          : 'Any Qualified Tutor'
      }\n` +
      `Schedule: ${submittedData.timeSlot} (${submittedData.days})\n` +
      `Location: ${submittedData.city}, ${submittedData.country}\n` +
      `WhatsApp Contact: ${submittedData.contactNumber}\n\n` +
      `Please arrange a free 30-min trial class.`
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
              Student Registration Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-950">
              Welcome to QariConnect!
            </h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              Your student application has been successfully saved under Registration ID:
              <strong className="text-emerald-900 ml-1 font-mono font-bold">
                {submittedData.regId}
              </strong>
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-gray-200 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Student:</span>
              <span className="font-bold text-gray-900">
                {submittedData.studentName} {submittedData.studentAge ? `(Age ${submittedData.studentAge})` : ''}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Selected Course:</span>
              <span className="font-bold text-emerald-800">{submittedData.course}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Teacher Preference:</span>
              <span className="font-semibold text-gray-800">
                {submittedData.teacherGender === 'female'
                  ? 'Female Qaria / Ustadha'
                  : submittedData.teacherGender === 'male'
                  ? 'Male Qari / Ustadh'
                  : 'Any Certified Qari'}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Preferred Timings:</span>
              <span className="font-semibold text-gray-800">{submittedData.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Contact / WhatsApp:</span>
              <span className="font-mono font-bold text-gray-900">{submittedData.contactNumber}</span>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left text-xs text-emerald-950 space-y-2">
            <div className="font-bold flex items-center gap-2 text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Next Step: Free 30-Minute Trial Session</span>
            </div>
            <p className="leading-relaxed">
              Our team will pair you with a top certified Qari. You can also send your registration details directly to WhatsApp Support (<strong>03006856772</strong>) to get an immediate demo class slot arranged within hours.
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

            {onBookTrial && (
              <button
                type="button"
                onClick={onBookTrial}
                className="w-full sm:w-auto px-5 py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>Select Specific Qari &amp; Book Trial</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Student / Parent Registration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-emerald-950">
          Student Signup &amp; Free Trial
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          Sign up to learn Quran with verified Qaris. Free 1-on-1 trial class with no commitment. Students pay tuition directly to the teacher via EasyPaisa, JazzCash, or Bank Transfer.
        </p>
      </div>

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

        {/* 1. Student & Guardian Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <span>1. Student &amp; Guardian Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Ibrahim Khan / Fatima Noor"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Student Age
              </label>
              <input
                type="number"
                min="4"
                max="80"
                value={studentAge}
                onChange={(e) => setStudentAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 8 (or adult)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Parent / Guardian Name (if student is child)
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Muhammad Aslam (Father)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
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
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. parent@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                City / Country
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (e.g. Lahore)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country (e.g. Pakistan)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Course Selection */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>2. Select Learning Course</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coursesList.map((c) => {
              const isSelected = selectedCourse === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCourse(c.id)}
                  className={`p-3.5 rounded-2xl text-left border transition cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-600 shadow-xs font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl shrink-0">{c.icon}</span>
                  <span className="text-xs sm:text-sm">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Teacher Preference & Timings */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>3. Teacher Preference &amp; Schedule</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Preferred Teacher Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPreferredTeacherGender('any')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                    preferredTeacherGender === 'any'
                      ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  Any
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredTeacherGender('male')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                    preferredTeacherGender === 'male'
                      ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  Male Qari
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredTeacherGender('female')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                    preferredTeacherGender === 'female'
                      ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  Female Qaria
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Preferred Daily Time Slot
              </label>
              <select
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                <option value="Morning (7:00 AM - 11:00 AM)">Morning (7:00 AM - 11:00 AM)</option>
                <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                <option value="Night (8:00 PM - 11:00 PM)">Night (8:00 PM - 11:00 PM)</option>
                <option value="Flexible Timings">Flexible / To be agreed with Qari</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Days Per Week
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['3 days / week', '5 days / week (Mon - Fri)', 'Weekend only (Sat - Sun)'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDaysPerWeek(opt)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                      daysPerWeek === opt
                        ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Special Learning Goals or Notes for Teacher
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Needs extra patience with Arabic Makharij, or student has already completed Qaida..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 4. Payment Clarity Notice */}
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-xs text-emerald-950 space-y-2">
          <div className="font-bold flex items-center gap-2 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Direct Payment &amp; Free Trial Guarantee</span>
          </div>
          <p className="leading-relaxed">
            Student registration is <strong>100% Free</strong>. You will receive a <strong>free trial lesson</strong>. After your trial, monthly tuition is paid directly to your chosen teacher via EasyPaisa, JazzCash, or Bank Transfer.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer ml-auto"
          >
            {isSubmitting ? (
              <span>Submitting Registration...</span>
            ) : (
              <>
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Submit Student Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
