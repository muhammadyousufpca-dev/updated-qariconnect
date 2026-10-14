import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  User,
  BookOpen,
  CheckCircle2,
  Star,
  ExternalLink,
  Edit3,
  Award,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LessonSession } from '../types';
import {
  fetchLessonSessionsForUser,
  subscribeToLessonSessions,
  updateLessonSession,
} from '../services/marketplaceService';

export const LessonSessionsView: React.FC<{ onOpenChat?: (qariId: string) => void }> = ({
  onOpenChat,
}) => {
  const { userProfile } = useAuth();
  const currentUserId = userProfile?.uid || 'demo_parent_user';
  const currentRole = userProfile?.role || 'parent';

  const [sessions, setSessions] = useState<LessonSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'trial' | 'scheduled' | 'completed'>('all');

  // Modals
  const [editingSession, setEditingSession] = useState<LessonSession | null>(null);
  const [teacherNotesInput, setTeacherNotesInput] = useState('');
  const [homeworkInput, setHomeworkInput] = useState('');
  const [markCompletedCheck, setMarkCompletedCheck] = useState(false);

  // Review modal for parent
  const [reviewingSession, setReviewingSession] = useState<LessonSession | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [parentFeedbackText, setParentFeedbackText] = useState('');

  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Subscribe to real-time Firestore updates
    const unsubscribe = subscribeToLessonSessions(currentUserId, (data) => {
      setSessions(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);

  const handleSaveTeacherNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    setSavingAction(true);
    try {
      await updateLessonSession(editingSession.sessionId, {
        teacherNotes: teacherNotesInput,
        studentHomework: homeworkInput,
        status: markCompletedCheck ? 'completed' : editingSession.status,
      });

      setEditingSession(null);
    } catch (err) {
      console.error('Error saving teacher progress notes:', err);
    } finally {
      setSavingAction(false);
    }
  };

  const handleSaveParentReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSession) return;

    setSavingAction(true);
    try {
      await updateLessonSession(reviewingSession.sessionId, {
        parentRating: selectedRating,
        parentFeedback: parentFeedbackText,
      });

      setReviewingSession(null);
    } catch (err) {
      console.error('Error saving parent feedback:', err);
    } finally {
      setSavingAction(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterType === 'trial') return s.sessionType === 'trial';
    if (filterType === 'scheduled') return s.status === 'scheduled';
    if (filterType === 'completed') return s.status === 'completed';
    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 text-white border border-emerald-800/50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-emerald-950">
                Live Classroom & Logs
              </span>
              <span className="text-xs text-emerald-300 font-medium">Synced in Firebase</span>
            </div>
            <h2 className="text-2xl font-bold font-serif mt-1">Class Schedule & Tajweed Progress</h2>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-xl">
              Track 1-on-1 trial evaluations, join Google Meet classroom rooms, and inspect weekly Tajweed
              homework and teacher progress notes.
            </p>
          </div>

          <div className="flex bg-emerald-900/80 p-1.5 rounded-2xl border border-emerald-700/50 text-xs font-semibold gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              All ({sessions.length})
            </button>
            <button
              onClick={() => setFilterType('trial')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filterType === 'trial'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Trials
            </button>
            <button
              onClick={() => setFilterType('scheduled')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filterType === 'scheduled'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilterType('completed')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filterType === 'completed'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No scheduled sessions found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {currentRole === 'parent'
              ? 'Visit the teacher directory or open a teacher profile to book your child\'s free trial class!'
              : 'When parents schedule a trial lesson or book classes, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSessions.map((session) => (
            <div
              key={session.sessionId}
              className="bg-white rounded-3xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-950 font-serif">
                        Student: {session.studentName}
                      </span>
                      {session.sessionType === 'trial' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                          Free Trial Lesson
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          Regular Class
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Teacher: <strong className="text-gray-800">{session.qariName}</strong> • Parent: {session.parentName}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      session.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-700 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    {session.date}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-gray-800">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    {session.time} ({session.durationMinutes} mins)
                  </span>
                </div>

                {/* Tajweed Focus */}
                {session.tajweedFocus && (
                  <div className="text-xs">
                    <span className="text-gray-400 font-semibold block mb-0.5 uppercase tracking-wide text-[10px]">
                      Lesson Focus
                    </span>
                    <span className="font-medium text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-block">
                      {session.tajweedFocus}
                    </span>
                  </div>
                )}

                {/* Teacher Progress Log Notes */}
                {session.teacherNotes && (
                  <div className="text-xs space-y-1 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-semibold block text-[10px] uppercase">
                      Teacher Feedback & Progress Log
                    </span>
                    <p className="text-gray-700 italic">"{session.teacherNotes}"</p>
                    {session.studentHomework && (
                      <p className="text-emerald-900 font-medium pt-1">
                        <strong>Homework:</strong> {session.studentHomework}
                      </p>
                    )}
                  </div>
                )}

                {/* Parent Review / Rating */}
                {session.parentRating && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(session.parentRating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-semibold">{session.parentFeedback || 'Parent review recorded'}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                {/* Join Classroom Link */}
                <a
                  href={session.meetingLink || 'https://meet.google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Video className="w-3.5 h-3.5 text-amber-300" />
                  Join Google Meet Classroom
                </a>

                <div className="flex items-center gap-2">
                  {/* Teacher: Log Progress */}
                  {currentRole === 'qari' && (
                    <button
                      onClick={() => {
                        setEditingSession(session);
                        setTeacherNotesInput(session.teacherNotes || '');
                        setHomeworkInput(session.studentHomework || '');
                        setMarkCompletedCheck(session.status === 'completed');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Log Progress
                    </button>
                  )}

                  {/* Parent: Rate / Review */}
                  {currentRole === 'parent' && !session.parentRating && (
                    <button
                      onClick={() => {
                        setReviewingSession(session);
                        setSelectedRating(5);
                        setParentFeedbackText('');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-600" />
                      Rate Lesson
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teacher Log Notes Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 font-serif">
                  Log Tajweed Progress & Homework
                </h3>
                <p className="text-xs text-emerald-800">
                  Student: {editingSession.studentName} • {editingSession.date}
                </p>
              </div>
              <button
                onClick={() => setEditingSession(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacherNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Lesson Feedback / Recitation Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={teacherNotesInput}
                  onChange={(e) => setTeacherNotesInput(e.target.value)}
                  placeholder="e.g. MashaAllah student read Surah Al-Mulk ayat 1-10 with proper Ghunnah. Needs revision on Qalqalah letters."
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Assigned Student Homework / Practice
                </label>
                <input
                  type="text"
                  value={homeworkInput}
                  onChange={(e) => setHomeworkInput(e.target.value)}
                  placeholder="e.g. Practice Noorani Qaida lesson 5 with tartil 3 times"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-emerald-950 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={markCompletedCheck}
                  onChange={(e) => setMarkCompletedCheck(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 rounded"
                />
                <span>Mark this lesson session as Completed</span>
              </label>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {savingAction ? 'Saving...' : 'Save Progress to Firebase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parent Review Modal */}
      {reviewingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 font-serif">
                  Rate Lesson Session
                </h3>
                <p className="text-xs text-gray-500">
                  Teacher: {reviewingSession.qariName} • Student: {reviewingSession.studentName}
                </p>
              </div>
              <button
                onClick={() => setReviewingSession(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveParentReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 text-center">
                  Your Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      className="p-1 cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= selectedRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Comments & Feedback for Teacher
                </label>
                <textarea
                  rows={3}
                  value={parentFeedbackText}
                  onChange={(e) => setParentFeedbackText(e.target.value)}
                  placeholder="e.g. Sheikh was very patient and encouraging with my child. Great Makharij lesson!"
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReviewingSession(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {savingAction ? 'Saving...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

// Helper component for closing modals cleanly
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
