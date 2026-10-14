import React, { useState } from 'react';
import {
  Star,
  Award,
  Globe2,
  Clock,
  CheckCircle2,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { QariProfile } from '../types/qari';

interface QariCardProps {
  qari: QariProfile;
  currency?: 'USD' | 'PKR';
  onViewProfile: (qari: QariProfile) => void;
  onBookTrial: (qari: QariProfile) => void;
}

export const QariCard: React.FC<QariCardProps> = ({
  qari,
  currency = 'USD',
  onViewProfile,
  onBookTrial,
}) => {
  const [imgError, setImgError] = useState(false);

  const displayRate =
    currency === 'PKR'
      ? `Rs ${qari.hourlyRatePKR.toLocaleString()}/hr`
      : `$${qari.hourlyRateUSD}/hr`;

  const initials = qari.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-500/70 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-4">
          {/* Avatar with fallback placeholder */}
          <div className="relative shrink-0">
            {qari.avatarUrl && !imgError ? (
              <img
                src={qari.avatarUrl}
                alt={qari.name}
                onError={() => setImgError(true)}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-600/30 group-hover:border-emerald-600 transition shadow-sm"
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-emerald-800 to-teal-950 text-amber-300 flex items-center justify-center font-bold text-lg font-serif border-2 border-emerald-600/30 shadow-sm">
                {initials || <User className="w-8 h-8 text-amber-300" />}
              </div>
            )}

            {qari.hasSanad && (
              <div
                className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-emerald-950 p-1 rounded-full shadow-md border border-white"
                title="Verified Sanad Muttasil Holder"
              >
                <Award className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            )}
          </div>

          {/* Name & Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-gray-950 truncate font-serif">
                {qari.name}
              </h3>
              {qari.gender === 'female' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800">
                  Female Tutor
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Qari
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 font-medium line-clamp-1 mt-0.5">
              {qari.title}
            </p>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <div className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{qari.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500 font-medium">
                ({qari.totalReviews} reviews)
              </span>
              <span className="text-gray-300">&bull;</span>
              <span className="text-gray-600 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-emerald-700" />
                {qari.experienceYears}y exp
              </span>
            </div>
          </div>
        </div>

        {/* Badges Ribbon */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
          {qari.badges.map((badge, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight ${
                badge.toLowerCase().includes('female')
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : badge.toLowerCase().includes('sanad')
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200/80'
              }`}
            >
              {badge}
            </span>
          ))}
          {qari.hasSanad && !qari.badges.some((b) => b.includes('Sanad')) && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
              Sanad Muttasil
            </span>
          )}
        </div>

        {/* Qualification & Location info */}
        <div className="mt-3 bg-gray-50/80 rounded-xl p-2.5 text-xs text-gray-700 space-y-1">
          <div className="flex items-start gap-1.5 font-medium text-gray-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{qari.qualification}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
            <Globe2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>
              {qari.city ? `${qari.city}, ${qari.country}` : qari.country} &bull; Languages:{' '}
              {qari.languages.join(', ')}
            </span>
          </div>
        </div>

        {/* Subjects taught */}
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Subjects Taught:
          </div>
          <div className="flex flex-wrap gap-1">
            {qari.subjects.map((sub, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-800 text-[11px] font-medium"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Pricing & Action Buttons */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Starting from
          </div>
          <div className="text-base sm:text-lg font-extrabold text-emerald-950 font-serif">
            {displayRate}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewProfile(qari)}
            className="px-3 py-2 rounded-xl border border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:text-gray-900 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => onBookTrial(qari)}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/15"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>Book Trial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
