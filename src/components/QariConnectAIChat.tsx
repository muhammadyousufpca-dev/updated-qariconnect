import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  User,
  Bot,
  ShieldCheck,
  Phone,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { QARICONNECT_SUPPORT, COMMISSION_PERCENTAGE } from '../data/currencies';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  jsonRecord?: any;
  quickOptions?: { label: string; action: string }[];
}

type OnboardingRole = 'none' | 'teacher' | 'student';

export const QariConnectAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>('none');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'ai',
          text: `Assalam-o-Alaikum! Welcome to QariConnect.\n\nI am QariConnect AI, your 24/7 interactive assistant. I can answer your questions, explain our payment & 15% commission policy, or guide you through instant registration. How may I assist you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickOptions: [
            { label: 'Option 1: Teacher Registration', action: 'role_teacher' },
            { label: 'Option 2: Student Registration', action: 'role_student' },
            { label: 'What is QariConnect?', action: 'faq_what_is' },
            { label: 'Is the platform free?', action: 'faq_is_free' },
            { label: 'Where are classes held?', action: 'faq_classes_where' },
            { label: 'Are free trial classes provided?', action: 'faq_trial' },
            { label: 'How much are tuition fees?', action: 'faq_fee' },
            { label: 'Support WhatsApp (03006856772)', action: 'faq_support' },
          ],
        },
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const addAiMessage = (
    text: string,
    quickOptions?: { label: string; action: string }[],
    jsonRecord?: any
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}-${Math.random()}`,
        sender: 'ai',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickOptions,
        jsonRecord,
      },
    ]);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'role_teacher') {
      setOnboardingRole('teacher');
      setStepIndex(1);
      setFormData({});
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'I want to register as a Teacher / Qari.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => {
        addAiMessage(
          `Masha'Allah, welcome honorable Teacher!\n\nTo complete your registration, please provide your **Full Name**:`
        );
      }, 400);
    } else if (action === 'role_student') {
      setOnboardingRole('student');
      setStepIndex(1);
      setFormData({});
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'I want to register as a Student / Parent.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => {
        addAiMessage(
          `Welcome to QariConnect!\n\nPlease enter the **Student Name and Age** (e.g. Zayd, 8 years):`
        );
      }, 400);
    } else if (action === 'faq_commission') {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'How do payments and commissions work on QariConnect?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => {
        addAiMessage(
          `💳 **Payment & Commission Policy:**\n\n1. **Direct Tuition Payment:** Students pay the monthly tuition fee directly to the Teacher/Qari via **EasyPaisa**, **JazzCash**, or **Bank Transfer**.\n2. **15% Platform Commission:** Teachers/Qaris MUST remit a **15% commission** of their total monthly student earnings to QariConnect at the end of each month.\n3. **Receipt Submission:** Please send your payment transfer receipts/proofs directly to our official WhatsApp Support Number: **03006856772**.\n\n⚠️ *Important Notice:* Timely payment of the 15% platform commission is required to keep teacher accounts active and avoid temporary profile suspension.`,
          [
            { label: 'Register as Teacher', action: 'role_teacher' },
            { label: 'Register as Student', action: 'role_student' },
            { label: 'Open WhatsApp Support', action: 'faq_support' },
          ]
        );
      }, 400);
    } else if (action === 'faq_what_is') {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'What is QariConnect?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => {
        addAiMessage(
          `**What is QariConnect?**\n\nQariConnect is an online platform that connects qualified Quran Tutors (Qaris/Qarias) with students worldwide. Families can learn Nazra, Hifz, and Tajweed from the comfort of their home with certified, Sanad-holding teachers.`,
          [
            { label: 'Register as Student', action: 'role_student' },
            { label: 'Register as Teacher', action: 'role_teacher' },
          ]
        );
      }, 400);
    } else if (action === 'faq_is_free') {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Is the platform free?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => {
        addAiMessage(
          `**Is the platform free?**\n\nRegistration is 100% free for students and parents.\n\nFor Teachers/Qaris, QariConnect charges a **one-time 15% platform commission ONLY on the first month's fee**. On all subsequent recurring months, teachers keep 100% of their earnings (0% recurring commission).`,
          [
            { label: 'Payment & Commission Details', action: 'faq_commission' },
            { label: 'Register as Student', action: 'role_student' },
          ]
        );
      }, 400);
    } else if (action === 'faq_classes_where') {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Where are classes held (Zoom, WhatsApp, Google Meet)?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => {
        addAiMessage(
          `**Where are classes held?**\n\nTeachers and students mutually decide on their preferred online platform—such as **Zoom**, **Google Meet**, or **WhatsApp Video Call**. Classes are conducted live in private 1-on-1 sessions.`,
          [
            { label: 'Free Trial Classes', action: 'faq_trial' },
            { label: 'Register as Student', action: 'role_student' },
          ]
        );
      }, 400);
    } else if (action === 'faq_trial') {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'Are free trial classes provided?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => {
        addAiMessage(
          `**Are free trial classes provided?**\n\nYes! Most verified teachers provide a free 1-to-2 day demo/placement trial class so parents and students can experience the teaching methodology, test Tajweed recitation (Makharij), and ensure a good rapport before enrolling.`,
          [
            { label: 'Register as Student (Free Trial)', action: 'role_student' },
            { label: 'Tuition Fee Rates', action: 'faq_fee' },
          ]
        );
      }, 400);
    } else if (action === 'faq_fee') {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'How much are tuition fees?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => {
        addAiMessage(
          `**How much are tuition fees?**\n\nTuition fees are mutually agreed between teacher and parent based on frequency, days per week, and student level. Typical rates range from **Rs 3,500 to Rs 7,000 PKR** / **$14 - $25 USD per hour**.\n\nStudents pay directly to the teacher via **EasyPaisa**, **JazzCash**, or **Bank Transfer**.`,
          [
            { label: 'Payment & Commission Details', action: 'faq_commission' },
            { label: 'Register as Student', action: 'role_student' },
          ]
        );
      }, 400);
    } else if (action === 'faq_support') {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: 'How can I contact QariConnect support?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => {
        addAiMessage(
          `**Customer Support & Verification:**\n\nFor any inquiries, questions, or payment verification, reach out directly to our official WhatsApp support line:\n\n📱 **03006856772**\n(WhatsApp Direct: https://wa.me/923006856772)\n\nOur customer support team is available 24/7 to assist you.`,
          [
            { label: 'Register as Teacher', action: 'role_teacher' },
            { label: 'Register as Student', action: 'role_student' },
          ]
        );
      }, 400);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Handle Teacher onboarding steps
    if (onboardingRole === 'teacher') {
      if (stepIndex === 1) {
        setFormData((prev) => ({ ...prev, full_name: query }));
        setStepIndex(2);
        setTimeout(() => {
          addAiMessage(`JazakAllah Khair ${query}.\n\nWhat is your **Qualification**? (e.g. Hafiz-ul-Quran, Alim, Tajweed / Sanad Certified, Wifaqul Madaris graduate)`);
        }, 400);
        return;
      } else if (stepIndex === 2) {
        setFormData((prev) => ({ ...prev, qualification: query }));
        setStepIndex(3);
        setTimeout(() => {
          addAiMessage(`How many **years of teaching experience** do you have? (e.g. 5 years)`);
        }, 400);
        return;
      } else if (stepIndex === 3) {
        setFormData((prev) => ({ ...prev, experience_years: query }));
        setStepIndex(4);
        setTimeout(() => {
          addAiMessage(`What are your **Preferred Class Timings & Days**? (e.g. Mon-Fri 5 PM to 9 PM PKT)`);
        }, 400);
        return;
      } else if (stepIndex === 4) {
        setFormData((prev) => ({ ...prev, preferred_timings: query }));
        setStepIndex(5);
        setTimeout(() => {
          addAiMessage(`What is your **Expected Monthly / Hourly Fee Rate** per student? (e.g. Rs 5,000/month or $15/hr)`);
        }, 400);
        return;
      } else if (stepIndex === 5) {
        setFormData((prev) => ({ ...prev, fee_rate: query }));
        setStepIndex(6);
        setTimeout(() => {
          addAiMessage(`Finally, please provide your **Contact Number / WhatsApp** for student coordination:`);
        }, 400);
        return;
      } else if (stepIndex === 6) {
        const finalData = {
          full_name: formData.full_name || 'Teacher',
          qualification: formData.qualification || 'Certified Qari',
          experience_years: formData.experience_years || '5',
          preferred_timings: formData.preferred_timings || 'Flexible',
          fee_rate: formData.fee_rate || 'Market Rate',
          contact_number: query,
        };

        const jsonRecord = {
          type: 'teacher_registration',
          status: 'complete',
          data: finalData,
        };

        setOnboardingRole('none');
        setStepIndex(0);
        setFormData({});

        setTimeout(() => {
          addAiMessage(
            `Alhamdulillah! Your teacher registration with QariConnect has been successfully recorded.\n\n` +
            `Our verification team will review your credentials and reach out on WhatsApp (${query}) for Tajweed recitation verification.\n\n` +
            `*Reminder: QariConnect applies a strict 15% platform commission on total monthly earnings, remitted at the end of each month via EasyPaisa, JazzCash, or Bank Transfer to WhatsApp 03006856772.*`,
            [
              { label: 'Register Another Student', action: 'role_student' },
              { label: 'WhatsApp Support', action: 'faq_support' },
            ],
            jsonRecord
          );
        }, 400);
        return;
      }
    }

    // Handle Student onboarding steps
    if (onboardingRole === 'student') {
      if (stepIndex === 1) {
        // Parse name and age if possible
        setFormData((prev) => ({ ...prev, student_name_age: query }));
        setStepIndex(2);
        setTimeout(() => {
          addAiMessage(`Which **Course** are you looking for?\n(e.g. Noorani Qaida, Nazra Quran, Hifz, Tajweed Rules, Islamic Studies)`);
        }, 400);
        return;
      } else if (stepIndex === 2) {
        setFormData((prev) => ({ ...prev, course_required: query }));
        setStepIndex(3);
        setTimeout(() => {
          addAiMessage(`What is your **Preferred Class Time Slot & Days**? (e.g. 6:00 PM, 3 days a week)`);
        }, 400);
        return;
      } else if (stepIndex === 3) {
        setFormData((prev) => ({ ...prev, preferred_time_slot: query }));
        setStepIndex(4);
        setTimeout(() => {
          addAiMessage(`Please share your **Contact / Guardian WhatsApp Number & Name**:`);
        }, 400);
        return;
      } else if (stepIndex === 4) {
        const studentInfoParts = (formData.student_name_age || query).split(',');
        const sName = studentInfoParts[0]?.trim() || 'Student';
        const sAge = studentInfoParts[1]?.trim() || 'Age not specified';

        const finalData = {
          student_name: sName,
          age: sAge,
          course_required: formData.course_required || 'Nazra Quran & Tajweed',
          preferred_time_slot: formData.preferred_time_slot || 'Evenings',
          contact_info: query,
        };

        const jsonRecord = {
          type: 'student_registration',
          status: 'complete',
          data: finalData,
        };

        setOnboardingRole('none');
        setStepIndex(0);
        setFormData({});

        setTimeout(() => {
          addAiMessage(
            `Alhamdulillah! Your student admission request has been submitted successfully.\n\n` +
            `We will match you with a certified Qari/Qaria for a **Free 30-Minute Trial Session**.\n\n` +
            `*Reminder: Monthly fees are paid directly to your teacher via EasyPaisa, JazzCash, or Bank Transfer. Our official WhatsApp support is 03006856772.*`,
            [
              { label: 'Register as Teacher', action: 'role_teacher' },
              { label: 'Fee & Commission Info', action: 'faq_commission' },
            ],
            jsonRecord
          );
        }, 400);
        return;
      }
    }

    // General FAQ keyword matching
    const lower = query.toLowerCase();
    if (
      lower.includes('commission') ||
      lower.includes('fee') ||
      lower.includes('payment') ||
      lower.includes('pay') ||
      lower.includes('jazzcash') ||
      lower.includes('easypaisa') ||
      lower.includes('paisa') ||
      lower.includes('paise') ||
      lower.includes('hisaab')
    ) {
      setTimeout(() => {
        addAiMessage(
          `💳 **QariConnect Payment & Commission Policy:**\n\n` +
          `• **Student Payments:** Students pay monthly tuition fees directly to the Teacher/Qari via **EasyPaisa**, **JazzCash**, or **Bank Transfer**.\n` +
          `• **15% One-Time Commission:** Teachers pay a **one-time 15% platform commission ONLY on the first month's fee**. All subsequent recurring monthly fees have **0% commission** (teachers keep 100%).\n` +
          `• **Receipt Submission:** Teachers submit their first-month 15% payment transfer screenshot to WhatsApp Support: **03006856772**.\n` +
          `• **Policy Note:** Timely submission of the first month's 15% commission confirms your active verified status; non-payment may result in temporary profile suspension.`,
          [
            { label: 'Register as Teacher', action: 'role_teacher' },
            { label: 'Register as Student', action: 'role_student' },
            { label: 'Contact WhatsApp (03006856772)', action: 'faq_support' },
          ]
        );
      }, 400);
    } else if (
      lower.includes('teacher') ||
      lower.includes('qari') ||
      lower.includes('ustad') ||
      lower.includes('teach') ||
      lower.includes('parhana')
    ) {
      handleQuickAction('role_teacher');
    } else if (
      lower.includes('student') ||
      lower.includes('admission') ||
      lower.includes('parhna') ||
      lower.includes('seekhna') ||
      lower.includes('child') ||
      lower.includes('learn')
    ) {
      handleQuickAction('role_student');
    } else if (
      lower.includes('whatsapp') ||
      lower.includes('contact') ||
      lower.includes('phone') ||
      lower.includes('number') ||
      lower.includes('rabta')
    ) {
      handleQuickAction('faq_support');
    } else {
      setTimeout(() => {
        addAiMessage(
          `Assalam-o-Alaikum! Thank you for messaging QariConnect.\n\n` +
          `I can help you with:\n` +
          `1. Registering as a **Teacher / Qari**\n` +
          `2. Enrolling as a **Student**\n` +
          `3. Explaining our **Payment Methods (EasyPaisa, JazzCash, Bank Transfer)** and **15% Platform Commission**\n` +
          `4. Reaching our **WhatsApp Support: 03006856772**\n\n` +
          `Please choose an option below or type your query in English, Urdu, or Roman Urdu:`,
          [
            { label: 'Option 1: Teacher Registration', action: 'role_teacher' },
            { label: 'Option 2: Student Registration', action: 'role_student' },
            { label: '15% Commission FAQ', action: 'faq_commission' },
          ]
        );
      }, 400);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-emerald-400/40 group cursor-pointer animate-in fade-in"
            aria-label="Open QariConnect AI Chatbot"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-amber-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-1 -right-1 ring-2 ring-emerald-950 animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>QariConnect AI</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-emerald-950 uppercase font-black">
                  24/7
                </span>
              </div>
              <div className="text-[10px] text-emerald-200 leading-tight">Support &amp; Registration</div>
            </div>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-h-[85vh] h-[600px] bg-white rounded-3xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm font-serif">QariConnect AI</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-emerald-200">
                  24/7 Assistant &bull; WhatsApp: {QARICONNECT_SUPPORT.whatsappDisplay}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Notice Bar */}
          <div className="bg-amber-50 px-3.5 py-1.5 border-b border-amber-200/80 text-[11px] text-amber-900 flex items-center justify-between">
            <span className="font-medium">
              Fair Policy: <strong>{COMMISSION_PERCENTAGE}% Platform Commission</strong>
            </span>
            <span className="text-emerald-800 font-bold">EasyPaisa &bull; JazzCash</span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs text-gray-800">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-gray-800 border border-gray-200/90 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}

                  {/* Render Structured JSON Record if present */}
                  {m.jsonRecord && (
                    <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] font-mono bg-gray-900 text-emerald-300 p-3 rounded-xl overflow-x-auto">
                      <div className="text-[10px] text-gray-400 mb-1 uppercase font-sans font-bold">
                        Registration Output (JSON):
                      </div>
                      <pre>{JSON.stringify(m.jsonRecord, null, 2)}</pre>
                    </div>
                  )}
                </div>

                {/* Quick Selection Buttons */}
                {m.quickOptions && m.quickOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.quickOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(opt.action)}
                        className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-gray-400 px-1 mt-1">{m.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                onboardingRole === 'teacher'
                  ? `Enter details for Step ${stepIndex}/6...`
                  : onboardingRole === 'student'
                  ? `Enter details for Step ${stepIndex}/4...`
                  : 'Ask about registration, payments, or commission...'
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-emerald-600 bg-gray-50 focus:bg-white font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white disabled:opacity-40 transition cursor-pointer shrink-0 shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
