import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Search,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Phone,
  Lock,
} from 'lucide-react';
import { QARICONNECT_SUPPORT, COMMISSION_PERCENTAGE } from '../data/currencies';

interface FAQItem {
  id: string;
  category: 'general' | 'fees' | 'classes' | 'teachers' | 'privacy';
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'What is QariConnect?',
    answer:
      'QariConnect is a specialized, verified online Quran education platform connecting certified Quran tutors (Qaris and Qarias) with students worldwide for live 1-on-1 Nazra, Hifz, Tajweed, and Islamic Studies classes.',
  },
  {
    id: 'faq-2',
    category: 'fees',
    question: 'How does the platform commission work?',
    answer:
      'QariConnect charges a transparent 15% platform commission ONLY ONCE on the first month’s tuition fee. For all subsequent months, the teacher retains 100% of the tuition fee with zero recurring commission deductions.',
  },
  {
    id: 'faq-3',
    category: 'fees',
    question: 'Is student registration free?',
    answer:
      'Yes, student and parent registration is 100% free with no upfront cost or hidden fees. You can explore verified teachers and request free introductory trial sessions.',
  },
  {
    id: 'faq-4',
    category: 'classes',
    question: 'Where are online classes conducted?',
    answer:
      'Classes are conducted live 1-on-1 via Google Meet, Zoom, or WhatsApp Video Calling, agreed upon flexibly between the student/parent and the teacher based on your convenience.',
  },
  {
    id: 'faq-5',
    category: 'classes',
    question: 'Do tutors offer free trial sessions?',
    answer:
      'Yes! Teachers provide a complimentary 30-minute placement and trial session. This allows parents and students to evaluate pronunciation, Makharij assessment, and teaching style before establishing a formal agreement.',
  },
  {
    id: 'faq-6',
    category: 'fees',
    question: 'How are monthly tuition fees paid?',
    answer:
      'Students pay monthly tuition fees directly to the Teacher/Qari using EasyPaisa, JazzCash, or Bank Transfer. Teachers transfer the one-time 15% platform fee for the first month to QariConnect and send receipt confirmation to WhatsApp (+92 300 6856772). Subsequent months have 0% platform commission.',
  },
  {
    id: 'faq-7',
    category: 'privacy',
    question: 'Why are direct contact details protected on public profiles?',
    answer:
      'To prevent spam, ensure student safety, and avoid bypassing verified contracts, direct phone numbers and email addresses are masked on public profiles. All communications, trial bookings, and contracts are mediated inside QariConnect. Only platform Super Admins can access unmasked records for verification and dispute resolution.',
  },
  {
    id: 'faq-8',
    category: 'teachers',
    question: 'Are female Quran teachers (Qarias) available for sisters and children?',
    answer:
      'Yes! We have certified female Quran teachers (Alimahs, Hafizahs, and Tajweed Ijazah holders) available for sisters, daughters, and young children in a comfortable, modest setting.',
  },
  {
    id: 'faq-9',
    category: 'general',
    question: 'How do I contact official customer support?',
    answer:
      'For any questions, credential checks, or payment receipts, contact our official 24/7 WhatsApp Helpline directly at 03006856772 (International: +92 300 6856772).',
  },
];

interface FAQSectionProps {
  onRegisterTeacher?: () => void;
  onRegisterStudent?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onRegisterTeacher,
  onRegisterStudent,
}) => {
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-2', 'faq-6', 'faq-7']);
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'fees' | 'classes' | 'teachers' | 'privacy'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = FAQ_DATA.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match =
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-emerald-950">
          Everything You Need to Know
        </h2>
        <p className="text-xs sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Clear answers regarding online Quran classes, tuition rates, our one-time {COMMISSION_PERCENTAGE}% commission on the first month only, and contact privacy protection.
        </p>
      </div>

      {/* Controls & Search: 100% visible on ALL screens */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search questions (e.g. commission, free trial, privacy, female qaria)..."
            className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-emerald-600 bg-gray-50/50"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'general', label: 'General & Overview' },
            { id: 'fees', label: '15% One-Time Commission & Fees' },
            { id: 'classes', label: 'Classes & Free Trials' },
            { id: 'privacy', label: 'Contact Privacy & Protection' },
            { id: 'teachers', label: 'Female Qarias & Tutors' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-800 text-white font-bold shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion FAQ List: 100% visible and mobile-friendly */}
      <div className="space-y-3">
        {filteredFAQs.map((faq) => {
          const isOpen = openIds.includes(faq.id);
          return (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 hover:bg-emerald-50/40 transition cursor-pointer"
              >
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    {faq.category === 'privacy' && <Lock className="w-4 h-4 text-emerald-700 shrink-0" />}
                    {faq.category === 'fees' && <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />}
                    <span>{faq.question}</span>
                  </h3>
                </div>
                <div className="p-1 rounded-lg bg-gray-100 text-gray-600 shrink-0 mt-0.5">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-gray-100 text-xs sm:text-sm text-gray-700 leading-relaxed bg-slate-50/50 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA for WhatsApp Support */}
      <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Need Personal Assistance?
          </div>
          <h4 className="text-lg sm:text-xl font-bold font-serif">
            Chat with 24/7 Official Support on WhatsApp
          </h4>
          <p className="text-xs text-emerald-200">
            Helpline: <strong>{QARICONNECT_SUPPORT.whatsappDisplay}</strong> &bull; EasyPaisa, JazzCash, Bank Transfer confirmations
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href={QARICONNECT_SUPPORT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-emerald-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-emerald-950" />
            <span>WhatsApp Support</span>
          </a>

          {onRegisterTeacher && (
            <button
              type="button"
              onClick={onRegisterTeacher}
              className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer shrink-0"
            >
              Teacher Signup
            </button>
          )}

          {onRegisterStudent && (
            <button
              type="button"
              onClick={onRegisterStudent}
              className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer shrink-0"
            >
              Student Signup
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
