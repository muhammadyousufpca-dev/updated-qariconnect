import React, { useState, useEffect } from 'react';
import {
  User,
  Globe2,
  Clock,
  BookOpen,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ParentProfile } from '../types';
import {
  fetchParentProfile,
  saveParentProfileDirect,
} from '../services/marketplaceService';

export const ParentProfileEditor: React.FC = () => {
  const { userProfile } = useAuth();
  const parentId = userProfile?.uid || 'demo_parent_user';

  const [parentName, setParentName] = useState(userProfile?.displayName || 'Brother Tariq Rahman');
  const [country, setCountry] = useState('United Kingdom');
  const [city, setCity] = useState('London');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [timezone, setTimezone] = useState('GMT (UTC+0)');
  const [children, setChildren] = useState<string[]>(['Zayd (8 yrs)', 'Maryam (11 yrs)']);
  const [newChildName, setNewChildName] = useState('');
  const [notes, setNotes] = useState(
    'Family seeking authentic Tajweed teachers with patient, interactive methods for young students.'
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const existing = await fetchParentProfile(parentId);
      if (existing) {
        setParentName(existing.parentName);
        setCountry(existing.country);
        setCity(existing.city || '');
        setPreferredLanguage(existing.preferredLanguage);
        setTimezone(existing.timezone || 'GMT (UTC+0)');
        if (existing.childrenNames && existing.childrenNames.length > 0) {
          setChildren(existing.childrenNames);
        }
        if (existing.notes) setNotes(existing.notes);
      } else if (userProfile) {
        setParentName(userProfile.displayName);
      }
      setLoading(false);
    };

    loadProfile();
  }, [parentId, userProfile]);

  const handleAddChild = () => {
    if (!newChildName.trim()) return;
    setChildren([...children, newChildName.trim()]);
    setNewChildName('');
  };

  const handleRemoveChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const profile: ParentProfile = {
      parentId,
      parentName,
      country,
      city,
      preferredLanguage,
      timezone,
      childrenNames: children,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveParentProfileDirect(profile);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Parent & Student Family Profile</h2>
              <p className="text-xs text-emerald-200">
                Manage your family's Quran learning preferences and student information in Firestore
              </p>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-4 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Parent family profile has been saved to Firebase Firestore!
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Parent / Guardian Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Language of Communication *
              </label>
              <input
                type="text"
                required
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                placeholder="e.g. English, Urdu, French, Arabic"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Country *
              </label>
              <div className="relative">
                <Globe2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Time Zone
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="e.g. GMT, EST, PST, CET"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Children / Students List */}
          <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Registered Children / Quran Students
            </label>
            <div className="space-y-2">
              {children.map((child, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-200/60 text-xs font-medium text-gray-800"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    {child}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChild(index)}
                    className="text-red-500 hover:text-red-700 transition p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="Add child name & age (e.g. Yahya, 7 yrs)"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-emerald-600"
              />
              <button
                type="button"
                onClick={handleAddChild}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Student
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Family Quran Goals & Teacher Preferences
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. We are looking for an experienced teacher who can instill love for the Quran in young children."
              className="w-full p-3 text-xs rounded-xl border border-gray-200 focus:outline-emerald-600"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              {saving ? 'Saving...' : 'Save Parent Profile'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
