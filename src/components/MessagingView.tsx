import React, { useEffect, useState, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Conversation, Message, QariProfile } from '../types';
import {
  fetchUserConversations,
  getOrCreateConversation,
  sendMessage,
  subscribeToMessages,
  subscribeToConversations,
} from '../services/marketplaceService';
import { CreateAgreementModal } from './CreateAgreementModal';
import { BookTrialModal } from './BookTrialModal';

export interface ChatTarget {
  id: string;
  name: string;
  role: 'parent' | 'qari';
  qariProfile?: QariProfile;
}

interface MessagingViewProps {
  initialQariForChat?: QariProfile | null;
  chatTarget?: ChatTarget | null;
  onAgreementCreated: () => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  initialQariForChat,
  chatTarget,
  onAgreementCreated,
}) => {
  const { userProfile } = useAuth();
  const currentUserId = userProfile?.uid || 'demo_parent_user';
  const currentUserName = userProfile?.displayName || 'User';
  const currentRole = userProfile?.role || 'parent';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Contract and trial modals from chat
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [trialModalOpen, setTrialModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to resolve the OTHER participant's details in a conversation
  const getOtherPartyInfo = (conv: Conversation) => {
    // Determine which side current user is on
    const isCurrentParent = conv.parentId === currentUserId;
    const name = isCurrentParent ? conv.qariName : conv.parentName;
    const otherId = isCurrentParent ? conv.qariId : conv.parentId;
    const isTeacher =
      otherId.startsWith('seed_qari') ||
      (!isCurrentParent && conv.parentId.startsWith('seed_qari'));
    const roleLabel = isTeacher
      ? 'Verified Qari'
      : 'Parent / Quran Student';
    return { name: name || 'User', otherId, isTeacher, roleLabel };
  };

  // Load and subscribe to conversations from Firestore
  useEffect(() => {
    let isMounted = true;

    const initConversations = async () => {
      setLoading(true);
      try {
        let activeConv: Conversation | null = null;

        // Resolve target user from either chatTarget or initialQariForChat
        const targetId = chatTarget ? chatTarget.id : initialQariForChat?.qariId;
        const targetName = chatTarget ? chatTarget.name : initialQariForChat?.fullName;
        const targetRole = chatTarget ? chatTarget.role : 'qari';

        if (targetId && targetName && targetId !== currentUserId) {
          let parentId = currentUserId;
          let parentName = currentUserName;
          let qariId = targetId;
          let qariName = targetName;

          if (currentRole === 'qari' && targetRole === 'parent') {
            parentId = targetId;
            parentName = targetName;
            qariId = currentUserId;
            qariName = currentUserName;
          } else if (currentRole === 'qari' && targetRole === 'qari') {
            // Teacher to teacher (e.g. Maryam to Ahmad)
            parentId = targetId;
            parentName = targetName;
            qariId = currentUserId;
            qariName = currentUserName;
          }

          activeConv = await getOrCreateConversation(
            parentId,
            parentName,
            qariId,
            qariName
          );
        }

        const convs = await fetchUserConversations(currentUserId);
        if (isMounted) {
          setConversations(convs);

          if (activeConv) {
            setSelectedConversation(activeConv);
          } else if (convs.length > 0) {
            setSelectedConversation((prev) => {
              if (prev) {
                const found = convs.find((c) => c.id === prev.id);
                return found || convs[0];
              }
              return convs[0];
            });
          }
        }
      } catch (err) {
        console.error('Error loading conversations from Firestore:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initConversations();

    // Real-time subscription to user's conversations
    const unsubConversations = subscribeToConversations(currentUserId, (updatedConvs) => {
      if (isMounted) {
        setConversations(updatedConvs);
        setSelectedConversation((prev) => {
          if (!prev && updatedConvs.length > 0) {
            return updatedConvs[0];
          }
          if (prev) {
            const found = updatedConvs.find((c) => c.id === prev.id);
            return found || prev;
          }
          return null;
        });
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubConversations();
    };
  }, [currentUserId, initialQariForChat, chatTarget, currentRole, currentUserName]);

  // Real-time listener for messages in the selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    // Subscribe to Firestore onSnapshot
    const unsubscribe = subscribeToMessages(selectedConversation.id, (realtimeMsgs) => {
      setMessages(realtimeMsgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedConversation?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversation) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      // 1. Save directly to Firestore subcollection
      const newMsg = await sendMessage(
        selectedConversation.id,
        currentUserId,
        currentUserName,
        content
      );

      // 2. Update local conversation list header
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: content, lastMessageAt: newMsg.createdAt }
            : c
        )
      );

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      console.error('Error sending message to Firestore:', err);
    } finally {
      setSending(false);
    }
  };

  // Convert other party to QariProfile object for contract modal
  const selectedOther = selectedConversation ? getOtherPartyInfo(selectedConversation) : null;
  const targetQariForContract: QariProfile | null = selectedConversation
    ? {
        qariId: selectedOther?.otherId || selectedConversation.qariId,
        fullName: selectedOther?.name || selectedConversation.qariName,
        title: 'Certified Quran Teacher',
        bio: '',
        country: 'Global',
        languages: ['English', 'Arabic'],
        experienceYears: 6,
        hasSanad: true,
        qualifications: 'Certified Qari',
        tajweedSpecialization: 'Makharij & Tajweed',
        hourlyFee: 18,
        monthlyFee: 110,
        preferredAgeGroups: ['All'],
        availability: 'Flexible',
        createdAt: '',
        updatedAt: '',
      }
    : null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-[750px] flex flex-col md:flex-row">
        {/* Left Conversations Sidebar */}
        <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-100 bg-white">
            <h3 className="font-bold text-base text-gray-900 font-serif flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              Direct Messages
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Persistent conversations stored in Firestore
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 text-xs text-gray-400">Loading messages from Firestore...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No active conversations found in Firestore. Start a chat with any Qari in the directory!
              </div>
            ) : (
              conversations.map((conv) => {
                const otherParty = getOtherPartyInfo(conv);
                const isSelected = selectedConversation?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-4 transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/90 border-l-4 border-emerald-700'
                        : 'hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0 border border-emerald-200">
                      {otherParty.name.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900 truncate">
                          {otherParty.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(conv.lastMessageAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Pane */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-800 to-teal-950 text-amber-300 font-bold flex items-center justify-center shadow-xs">
                  {selectedOther?.name.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 font-serif">
                    {selectedOther?.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {selectedOther?.roleLabel}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Firebase ID: {selectedConversation.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions: Book Trial & Create Contract */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTrialModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden sm:inline">Book</span> Trial
                </button>

                <button
                  onClick={() => setContractModalOpen(true)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  Agree & Contract
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40">
              {/* Trust Notice */}
              <div className="max-w-md mx-auto text-center bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-3 text-[11px] text-emerald-900 space-y-1">
                <span className="font-bold">Real-Time Firestore Chat Sync</span>
                <p className="text-emerald-800/80">
                  All messages are permanently saved to Firebase. Refreshing the browser or switching
                  devices will preserve this conversation.
                </p>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">
                  No messages yet. Send a greeting or propose class timings below!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUserId;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-medium">
                        {msg.senderName}
                      </span>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-emerald-800 text-white rounded-br-xs'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3.5 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message, proposed class times, or questions..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-emerald-600 bg-gray-50/50"
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>{sending ? 'Saving...' : 'Send'}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-400 text-xs">
            Select a conversation on the left to start messaging
          </div>
        )}
      </div>

      {/* Contract Modal */}
      {contractModalOpen && targetQariForContract && (
        <CreateAgreementModal
          isOpen={contractModalOpen}
          onClose={() => setContractModalOpen(false)}
          targetQari={targetQariForContract}
          onSuccess={() => {
            setContractModalOpen(false);
            onAgreementCreated();
          }}
        />
      )}

      {/* Book Trial Modal */}
      {trialModalOpen && targetQariForContract && (
        <BookTrialModal
          isOpen={trialModalOpen}
          onClose={() => setTrialModalOpen(false)}
          qari={targetQariForContract}
        />
      )}
    </section>
  );
};
