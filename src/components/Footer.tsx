import React from 'react';
import { BookOpen, ShieldCheck, Award, Heart, MessageCircle, Phone } from 'lucide-react';
import { QARICONNECT_SUPPORT, COMMISSION_PERCENTAGE, TEACHER_PAYOUT_PERCENTAGE } from '../data/currencies';

export const Footer: React.FC<{ setActiveTab: (t: string) => void }> = ({ setActiveTab }) => {
  return (
    <footer className="bg-emerald-950 text-white border-t border-emerald-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-amber-300 border border-emerald-600/40">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white font-serif">
                Qari<span className="text-emerald-400">Connect</span>
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Global marketplace connecting students and families with verified Quran teachers holding authentic Sanad Muttasil chains.
            </p>
            <div className="text-[11px] text-amber-300 font-medium">
              «ورتل القرآن ترتيلا» • "And recite the Quran with measured recitation"
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5 text-xs text-emerald-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Find Quran Teachers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('register_teacher')}
                  className="hover:text-white transition cursor-pointer text-amber-300 font-semibold"
                >
                  Teacher Signup / Join Network
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('register_student')}
                  className="hover:text-white transition cursor-pointer text-amber-300 font-semibold"
                >
                  Student Signup / Free Trial
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('faqs')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Frequently Asked Questions (FAQs)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('requirements')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Parent Learning Requests
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('agreements')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Contracts &amp; One-Time {COMMISSION_PERCENTAGE}% Fee
                </button>
              </li>
            </ul>
          </div>

          {/* Official Contact & Payment */}
          <div className="space-y-2.5 text-xs text-emerald-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Official Support &amp; Payment</h4>
            <div className="space-y-2">
              <a
                href={QARICONNECT_SUPPORT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-amber-300 hover:text-white font-semibold transition"
              >
                <MessageCircle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>WhatsApp: {QARICONNECT_SUPPORT.whatsappDisplay}</span>
              </a>
              <div className="text-[11px] leading-relaxed">
                <span className="font-semibold text-white">Payment Methods:</span> JazzCash, EasyPaisa, Bank Transfer.
              </div>
              <div className="text-[11px] leading-relaxed bg-emerald-900/60 p-2 rounded-lg border border-emerald-800">
                Send manual fee receipts to WhatsApp: <strong className="text-white">{QARICONNECT_SUPPORT.whatsappDisplay}</strong>
              </div>
            </div>
          </div>

          {/* Business Model disclosure */}
          <div className="space-y-2.5 text-xs text-emerald-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Fair {COMMISSION_PERCENTAGE}% One-Time Model</h4>
            <ul className="space-y-1.5 text-[11px] mb-2">
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Sanad &amp; Ijazah Chain Verification</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>One-Time {COMMISSION_PERCENTAGE}% Platform Commission</span>
              </li>
            </ul>
            <p className="text-[11px] leading-relaxed">
              QariConnect does not deduct hidden charges. We retain a one-time {COMMISSION_PERCENTAGE}% platform commission ONLY on the first month's tuition. Teachers receive {TEACHER_PAYOUT_PERCENTAGE}% on month 1, and keep 100% of all subsequent recurring monthly fees.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/70 gap-3">
          <div>© {new Date().getFullYear()} QariConnect. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span>Official Helpline: <strong>{QARICONNECT_SUPPORT.whatsappDisplay}</strong></span>
            <span>&bull;</span>
            <span>Built with dedication for Quranic excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
