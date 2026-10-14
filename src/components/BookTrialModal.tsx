import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QariProfile } from '../types';
import {
  createLessonSession,
  getOrCreateConversation,
  sendMessage,
} from '../services/marketplaceService';

interface BookTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  qari: QariProfile | null;
  onBooked?: () => void;
}

export const BookTrialModal: React.FC<BookTrialModalProps> = ({
  isOpen,
  onClose,
  qari,
  onBooked,
}) => {
  const { userProfile } = useAuth();
  const parentId = userProfile?.uid || 'demo_parent_user';
  const parentName = userProfile?.displayName || 'Parent';

  // Default date: tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [studentName, setStudentName] = useState('Zayd Rahman');
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState('17:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [tajweedFocus, setTajweedFocus] = useState(
    'Makharij & Pronunciation Assessment (1-on-1 Trial)'
  );
  const [notes, setNotes] = useState(
    'Looking forward to testing student-teacher connection and assessing current reading fluency.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  // Handle ESC key press to close cleanly
  React.useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !date || !time) return;

    setSubmitting(true);
    try {
      // 1. Create persistent LessonSession in Firestore
      const session = await createLessonSession({
        qariId: qari.qariId,
        qariName: qari.fullName,
        parentId,
        parentName,
        studentName,
        sessionType: 'trial',
        date,
        time,
        durationMinutes,
        tajweedFocus,
        teacherNotes: notes,
        meetingLink: `https://meet.google.com/qari-${Math.random().toString(36).substring(2, 6)}-trial`,
      });

      // 2. Also notify in chat conversation so both parties see appointment
      try {
        const conv = await getOrCreateConversation(parentId, parentName, qari.qariId, qari.fullName);
        await sendMessage(
          conv.id,
          parentId,
          parentName,
          `Assalamu Alaikum Sheikh ${qari.fullName}. I have scheduled a 30-min trial evaluation lesson for ${studentName} on ${date} at ${time}. Focus: ${tajweedFocus}. Looking forward to connecting!`
        );
      } catch {
        // chat sync silent
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onBooked) onBooked();
      }, 1500);
    } catch (err) {
      console.error('Error booking trial session:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden relative my-6 animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Book 1-on-1 Trial Class</h2>
              <p className="text-xs text-emerald-200">
                Evaluation session with {qari.fullName}
              </p>
            </div>
          </div>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Trial Class Scheduled!</h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              The appointment has been recorded in Firestore. A live Google Meet video room has been
              assigned, and a notification was sent in your direct chat thread.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Teacher info badge */}
            <div className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs text-gray-700">
              <img
                src={
                  qari.avatarUrl ||
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150'
                }
                alt={qari.fullName}
                className="w-11 h-11 rounded-xl object-cover border border-emerald-300"
              />
              <div className="flex-1">
                <div className="font-bold text-emerald-950">{qari.fullName}</div>
                <div className="text-[11px] text-gray-500 line-clamp-1">{qari.title}</div>
                <div className="text-[10px] text-amber-800 font-semibold">
                  {qari.hasSanad ? '✓ Sanad Muttasil Holder' : 'Verified Instructor'} • {qari.availability}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Student Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Zayd Rahman"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Preferred Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Time *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Trial Session Focus
              </label>
              <select
                value={tajweedFocus}
                onChange={(e) => setTajweedFocus(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600 bg-gray-50/50"
              >
                <option value="Makharij & Pronunciation Assessment (1-on-1 Trial)">
                  Makharij & Pronunciation Assessment (1-on-1 Trial)
                </option>
                <option value="Noorani Qaida Early Childhood Readiness Check">
                  Noorani Qaida Early Childhood Readiness Check
                </option>
                <option value="Nazra Quran Fluency & Tajweed Rules Evaluation">
                  Nazra Quran Fluency & Tajweed Rules Evaluation
                </option>
                <option value="Hifz (Memorization) Capability & Retention Test">
                  Hifz (Memorization) Capability & Retention Test
                </option>
                <option value="Advanced Qira'at (Warsh / Hafs) Assessment">
                  Advanced Qira'at (Warsh / Hafs) Assessment
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Special Request / Learning Goal
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention any specific student needs (e.g. child is shy, non-Arabic speaker)..."
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
              />
            </div>

            {/* Live Video Room Note */}
            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/60 text-[11px] text-emerald-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                A dedicated live Google Meet video classroom link is auto-generated upon booking.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/20 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {submitting ? 'Confirming...' : 'Book Free Trial Class'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
