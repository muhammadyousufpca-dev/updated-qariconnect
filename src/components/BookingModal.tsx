import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Video,
  Award,
  MessageCircle,
} from 'lucide-react';
import { QariProfile, StudentLevel, Subject, BookingDetails } from '../types/qari';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  qari: QariProfile | null;
  onBookingConfirmed?: (booking: BookingDetails) => void;
  defaultCurrency?: 'USD' | 'PKR';
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  qari,
  onBookingConfirmed,
  defaultCurrency = 'USD',
}) => {
  // Step state (1: Level & Subject, 2: Date & Slot, 3: Contact Info, 4: Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form fields
  const [level, setLevel] = useState<StudentLevel>('Beginner');
  const [subject, setSubject] = useState<Subject>('Tajweed');

  // Next 7 available dates
  const today = new Date();
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return {
      iso: d.toISOString().split('T')[0],
      display: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    };
  });

  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].iso);
  const [selectedSlot, setSelectedSlot] = useState<string>('05:00 PM');

  // Contact details
  const [studentName, setStudentName] = useState('Zayd');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Validation
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Reset or initialize when modal opens or qari changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormErrors({});
      if (qari?.subjects?.length) {
        setSubject(qari.subjects[0]);
      }
      if (qari?.availabilitySchedule?.timeSlots?.length) {
        setSelectedSlot(qari.availabilitySchedule.timeSlots[0]);
      }
    }
  }, [isOpen, qari]);

  // Handle ESC key press to close cleanly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !qari) return null;

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedSlot) {
        setFormErrors({ slot: 'Please select an available time slot.' });
        return;
      }
      setFormErrors({});
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const errors: { [key: string]: string } = {};
      if (!studentName.trim()) errors.studentName = 'Student name is required.';
      if (!parentName.trim()) errors.parentName = 'Parent or Guardian name is required.';
      if (!parentEmail.trim() || !parentEmail.includes('@')) {
        errors.parentEmail = 'Please provide a valid email address.';
      }
      if (!parentPhone.trim() || parentPhone.length < 7) {
        errors.parentPhone = 'WhatsApp or phone number is required.';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setFormErrors({});
      // Create confirmed booking
      const newBooking: BookingDetails = {
        id: `booking-${Date.now()}`,
        qariId: qari.id,
        qariName: qari.name,
        hourlyRate: defaultCurrency === 'PKR' ? qari.hourlyRatePKR : qari.hourlyRateUSD,
        currency: defaultCurrency,
        level,
        subject,
        selectedDate,
        selectedTimeSlot: selectedSlot,
        studentName,
        parentName,
        parentEmail,
        parentPhone,
        notes,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      if (onBookingConfirmed) {
        onBookingConfirmed(newBooking);
      }

      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1 && currentStep < 4) {
      setCurrentStep(currentStep - 1);
    }
  };

  const availableSlots = qari.availabilitySchedule.timeSlots.length
    ? qari.availabilitySchedule.timeSlots
    : ['10:00 AM', '02:00 PM', '05:00 PM', '07:30 PM'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-emerald-100 relative flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5 bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                Book Free Trial Session (30 Mins)
              </h3>
              <p className="text-xs text-emerald-200">
                1-on-1 Lesson with <strong className="text-white">{qari.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close Booking Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Steps 1-3) */}
        {currentStep < 4 && (
          <div className="px-5 pt-3 pb-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 1
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                1
              </span>
              <span className={currentStep === 1 ? 'font-bold text-gray-900' : ''}>Level &amp; Subject</span>
            </div>
            <div className="w-6 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 2
                    ? 'bg-emerald-800 text-white'
                    : currentStep > 2
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </span>
              <span className={currentStep === 2 ? 'font-bold text-gray-900' : ''}>Date &amp; Time</span>
            </div>
            <div className="w-6 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 3
                    ? 'bg-emerald-800 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </span>
              <span className={currentStep === 3 ? 'font-bold text-gray-900' : ''}>Contact</span>
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-gray-800">
          {/* STEP 1: Level & Subject */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Tutor preview mini strip */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                <img
                  src={
                    qari.avatarUrl ||
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150'
                  }
                  alt={qari.name}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-300"
                />
                <div>
                  <div className="text-sm font-bold text-emerald-950">{qari.name}</div>
                  <div className="text-xs text-emerald-800 font-medium">{qari.qualification}</div>
                  <div className="text-[11px] text-gray-500">
                    Spoken: {qari.languages.join(', ')} &bull; Free 30-min trial session
                  </div>
                </div>
              </div>

              {/* Student Level */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Select Student Current Reading Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as StudentLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        level === lvl
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{lvl}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {lvl === 'Beginner'
                          ? 'Noorani Qaida / Alphabet'
                          : lvl === 'Intermediate'
                          ? 'Fluent reading with rules'
                          : 'Hifz / Advanced Ijazah'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Primary Subject Focus for Trial
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    qari.subjects || [
                      'Tajweed',
                      'Nazra',
                      'Hifz',
                      'Noorani Qaida',
                      'Arabic Language',
                    ]
                  ).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubject(sub)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        subject === sub
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <div className="text-xs font-semibold flex items-center justify-between">
                        <span>{sub}</span>
                        {subject === sub && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Available Time Slot */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Choose Class Date (Upcoming 7 Days)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.iso}
                      type="button"
                      onClick={() => setSelectedDate(opt.iso)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        selectedDate === opt.iso
                          ? 'border-emerald-700 bg-emerald-800 text-white font-bold shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.display.split(',')[0]}</div>
                      <div className="text-[11px] opacity-80">{opt.display.split(',')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Available Time Slots (Student Local Time)
                  </label>
                  <span className="text-[11px] text-gray-500 font-medium">30 Minutes 1-on-1</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedSlot === slot
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
                {formErrors.slot && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">{formErrors.slot}</p>
                )}
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  The free trial is conducted via Google Meet with real-time audio and Tajweed Quran screen sharing.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Contact Details */}
          {currentStep === 3 && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Student Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Zayd Rahman"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-emerald-600 bg-white"
                    />
                  </div>
                  {formErrors.studentName && (
                    <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                      {formErrors.studentName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Parent / Guardian Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Tariq Mahmood"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-emerald-600 bg-white"
                    />
                  </div>
                  {formErrors.parentName && (
                    <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                      {formErrors.parentName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-emerald-600 bg-white"
                    />
                  </div>
                  {formErrors.parentEmail && (
                    <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                      {formErrors.parentEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="e.g. +92 300 6856772"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-emerald-600 bg-white"
                    />
                  </div>
                  {formErrors.parentPhone && (
                    <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                      {formErrors.parentPhone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Specific Learning Goals or Teacher Note (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Child knows basic Arabic alphabet, wants to improve pronunciation of letters ع and ح."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-emerald-600 bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Success confirmation screen */}
          {currentStep === 4 && (
            <div className="p-4 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold font-serif text-emerald-950">
                  Free Trial Session Confirmed!
                </h4>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                  Alhamdulillah! Your 30-minute 1-on-1 session with{' '}
                  <strong className="text-emerald-900">{qari.name}</strong> has been scheduled.
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between py-1 border-b border-emerald-200/50">
                  <span className="text-gray-600">Tutor:</span>
                  <span className="font-bold text-emerald-950">{qari.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/50">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-bold text-emerald-950">
                    {subject} ({level})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/50">
                  <span className="text-gray-600">Date &amp; Time:</span>
                  <span className="font-bold text-emerald-950">
                    {selectedDate} &bull; {selectedSlot}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200/50">
                  <span className="text-gray-600">Student:</span>
                  <span className="font-bold text-gray-900">{studentName}</span>
                </div>
                <div className="flex justify-between py-1 text-emerald-900">
                  <span className="text-gray-600">Class Format:</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> 1-on-1 Google Meet Room
                  </span>
                </div>
              </div>

              {/* Direct Support & WhatsApp Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-center justify-between gap-2 text-left">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Class link &amp; reminder has been sent to your WhatsApp and email.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          {currentStep < 4 ? (
            <>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/15"
              >
                <span>{currentStep === 3 ? 'Confirm Free Trial' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                Close / Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
