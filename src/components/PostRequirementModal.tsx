import React, { useState } from 'react';
import {
  X,
  User,
  BookOpen,
  Calendar,
  DollarSign,
  Globe2,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createLearningRequirement } from '../services/marketplaceService';
import { LearningRequirement } from '../types';
import {
  CURRENCY_LIST,
  COMMON_COUNTRIES,
  getCurrencyInfo,
  getCurrencySymbol,
} from '../data/currencies';

interface PostRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (req: LearningRequirement) => void;
}

export const PostRequirementModal: React.FC<PostRequirementModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { userProfile } = useAuth();

  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState<number>(8);
  const [studentGender, setStudentGender] = useState<'male' | 'female' | 'any'>('any');
  const [currentLevel, setCurrentLevel] = useState('Noorani Qaida (Beginner)');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Proper Makharij & Articulation',
    'Tajweed Rules (Nun/Mim Sakinah)',
  ]);
  const [country, setCountry] = useState('United Kingdom');
  const [currency, setCurrency] = useState('GBP');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [preferredTiming, setPreferredTiming] = useState('Weekdays between 17:00 - 19:00 GMT');
  const [weeklyFrequency, setWeeklyFrequency] = useState<number>(3);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(90);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  if (!isOpen) return null;

  const GOAL_OPTIONS = [
    'Proper Makharij & Articulation',
    'Tajweed Rules (Nun/Mim Sakinah)',
    'Fluent Nazra Recitation',
    'Juz Amma Memorization',
    'Full Hifz-ul-Quran',
    'Islamic Etiquettes & Daily Duas',
    'Qira\'at Riwayah Mastery (Warsh/Hafs)',
  ];

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const matched = COMMON_COUNTRIES.find(
      (c) => c.name.toLowerCase() === newCountry.trim().toLowerCase()
    );
    if (matched) {
      setCurrency(matched.defaultCurrency);
      const info = getCurrencyInfo(matched.defaultCurrency);
      setMonthlyBudget(info.defaultMonthlyFee);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || monthlyBudget <= 0) return;

    setSubmitting(true);
    try {
      const parentId = userProfile?.uid || 'demo_parent_user';
      const parentName = userProfile?.displayName || 'Brother Tariq Rahman';

      const newReq = await createLearningRequirement({
        parentId,
        parentName,
        studentName,
        studentAge: Number(studentAge),
        studentGender,
        currentLevel,
        goals: selectedGoals,
        country,
        currency,
        preferredLanguage,
        preferredTiming,
        weeklyFrequency: Number(weeklyFrequency),
        monthlyBudget: Number(monthlyBudget),
        notes,
        status: 'open',
      });

      onCreated(newReq);
      onClose();
    } catch (err) {
      console.error('Error posting requirement:', err);
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
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-emerald-100 overflow-hidden relative my-6 animate-in fade-in zoom-in-95 duration-150 cursor-default"
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
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Post Child Quran Requirement</h2>
              <p className="text-xs text-emerald-200">
                Qualified Qaris worldwide will review and submit teaching proposals
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Child Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Child / Student Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Zayd Rahman"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Age *
              </label>
              <input
                type="number"
                min={4}
                max={90}
                required
                value={studentAge}
                onChange={(e) => setStudentAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Current Level & Teacher Gender preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Current Level *
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full p-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600 bg-gray-50/50"
              >
                <option value="Complete Beginner (Arabic Alphabet)">Complete Beginner (Arabic Alphabet)</option>
                <option value="Noorani Qaida (Beginner)">Noorani Qaida (Beginner)</option>
                <option value="Basic Nazra Quran (Slow reader)">Basic Nazra Quran (Slow reader)</option>
                <option value="Intermediate Nazra Quran">Intermediate Nazra Quran</option>
                <option value="Memorization / Hifz Candidate">Memorization / Hifz Candidate</option>
                <option value="Advanced Tajweed & Riwayah">Advanced Tajweed & Riwayah</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Teacher Gender Preference
              </label>
              <select
                value={studentGender}
                onChange={(e) => setStudentGender(e.target.value as any)}
                className="w-full p-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600 bg-gray-50/50"
              >
                <option value="any">Any Qualified Teacher (Male or Female)</option>
                <option value="male">Male Qari Preferred</option>
                <option value="female">Female Ustadha Preferred</option>
              </select>
            </div>
          </div>

          {/* Learning Goals Checklist */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Specific Quran & Tajweed Goals
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => {
                const isSelected = selectedGoals.includes(g);
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Preferred Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Student Country / Region *
              </label>
              <div className="relative">
                <Globe2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  list="common-countries-parent"
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  placeholder="e.g. United Kingdom, USA, Pakistan, Saudi Arabia"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
                />
                <datalist id="common-countries-parent">
                  {COMMON_COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} (Currency: {c.defaultCurrency})
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Language of Instruction *
              </label>
              <input
                type="text"
                required
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                placeholder="e.g. English, Urdu, French, Arabic"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Frequency, Timing, Currency, Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Classes / Week
              </label>
              <select
                value={weeklyFrequency}
                onChange={(e) => setWeeklyFrequency(Number(e.target.value))}
                className="w-full p-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600 bg-gray-50/50"
              >
                <option value={2}>2 Classes / Week</option>
                <option value={3}>3 Classes / Week (Recommended)</option>
                <option value={4}>4 Classes / Week</option>
                <option value={5}>5 Classes / Week (Intensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Budget Currency *
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  const newC = e.target.value;
                  setCurrency(newC);
                  const info = getCurrencyInfo(newC);
                  setMonthlyBudget(info.defaultMonthlyFee);
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-emerald-600 font-bold"
              >
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Monthly Budget ({getCurrencySymbol(currency)}) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-bold text-gray-400 text-xs select-none pointer-events-none">
                  {getCurrencySymbol(currency)}
                </span>
                <input
                  type="number"
                  min={1}
                  max={500000}
                  step={currency === 'PKR' ? 100 : 5}
                  required
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Preferred Schedule
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={preferredTiming}
                  onChange={(e) => setPreferredTiming(e.target.value)}
                  placeholder="e.g. Evenings GMT"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Additional Notes for Teachers
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. My child is 8 and responds best to patient encouragement. We would like a quick trial session first."
              className="w-full p-3 text-sm rounded-xl border border-gray-200 focus:outline-emerald-600"
            />
          </div>

          {/* Commission Note */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-center justify-between">
            <span>
              ✓ When you agree with a Qari, a formal contract is generated with QariConnect's one-time 15% platform commission on the first month only (teachers receive 85% on month 1, and 100% on all subsequent recurring months).
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {submitting ? 'Publishing Request...' : 'Publish Learning Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
