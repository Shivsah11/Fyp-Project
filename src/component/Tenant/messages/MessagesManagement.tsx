import React, { useState, useEffect, useRef } from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

interface Conversation {
  otherPartyId: string;
  otherPartyRole: string;
  name: string;
  avatar: string;
  lastMessage: {
    id: string;
    content: string;
    subject: string;
    timestamp: string;
    isRead: boolean;
    isSent: boolean;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isSent: boolean;
}

const MessagesManagement: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessagesForConversation(selectedConversation.otherPartyId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setConversations(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Fetch conversations error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesForConversation = async (userId: string) => {
    try {
      setMessagesLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/conversation/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setMessages(result.data);
        // Mark as read logic
        const unreadIds = result.data.filter((m: Message) => !m.isSent && !m.isRead).map((m: Message) => m.id);
        if (unreadIds.length > 0) {
          unreadIds.forEach(async (id: string) => {
            await fetch(`http://localhost:5000/api/messages/${id}/read`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          });
          setConversations(prev => prev.map(c => c.otherPartyId === userId ? { ...c, unreadCount: 0 } : c));
        }
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        recipientId: selectedConversation.otherPartyId,
        subject: `Message`,
        content: replyText,
        type: 'sent'
      };

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        setReplyText('');
        fetchMessagesForConversation(selectedConversation.otherPartyId);
        fetchConversations();
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (err) {
      console.error("Reply error:", err);
      alert('Failed to send message. Please try again.');
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1 && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1 || (diffDays <= 2 && now.getDate() !== date.getDate())) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-12">
        <h2 className={`text-3xl font-black italic mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Conversations</h2>
        <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>Communicate directly with Hosts & Support</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 min-h-[600px] h-[70vh]">
        {/* Sidebar / Conversations List */}
        <div className="md:col-span-4 lg:col-span-4 flex flex-col min-h-0">
          <div className={`rounded-3xl border flex flex-col overflow-hidden transition-all duration-500 h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className={`font-black uppercase tracking-widest text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recent Chats</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Syncing...</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-red-400/50' : 'text-red-500/50'}`}>{error}</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-12 text-center">
                  <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>No Mail</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.otherPartyId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-6 border-b cursor-pointer transition-all duration-500 group ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
                      } ${selectedConversation?.otherPartyId === conv.otherPartyId
                        ? isDarkMode
                          ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500 border-b-transparent'
                          : 'bg-emerald-50 border-l-4 border-l-emerald-500 border-b-transparent'
                        : isDarkMode
                          ? 'hover:bg-gray-700/50'
                          : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 ${selectedConversation?.otherPartyId === conv.otherPartyId
                          ? 'bg-emerald-500 text-white rotate-6 scale-110'
                          : isDarkMode ? 'bg-gray-700 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        }`}>{conv.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm truncate uppercase tracking-tighter ${conv.unreadCount > 0
                              ? `font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`
                              : `font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`
                            }`}>{conv.name}</h4>
                          <span className={`text-[10px] font-black italic shrink-0 ${conv.unreadCount > 0 ? 'text-emerald-500' : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                            }`}>{formatDate(conv.lastMessage.timestamp)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate italic ${conv.unreadCount > 0
                              ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                              : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>{conv.lastMessage.isSent ? 'You: ' : ''}{conv.lastMessage.content}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-2 shadow-lg shadow-emerald-500/30">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Content View / Chat Window */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col min-h-0">
          {selectedConversation ? (
            <div className={`rounded-[2.5rem] border transition-all duration-500 h-full flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-xl shadow-emerald-500/5'
              }`}>
              <div className="p-6 border-b dark:border-gray-700 bg-black/5 dark:bg-white/5 backdrop-blur-md z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl italic border shadow-lg ${isDarkMode ? 'bg-gray-900 border-gray-700 text-emerald-500' : 'bg-white border-emerald-100 text-emerald-600'
                      }`}>{selectedConversation.avatar}</div>
                    <div>
                      <h3 className={`text-xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedConversation.name}</h3>
                      <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>
                        {selectedConversation.otherPartyRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-pattern relative">
                <div className="space-y-6 flex flex-col justify-end">
                  {messagesLoading ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={msg.id} className={`flex flex-col ${msg.isSent ? 'items-end' : 'items-start'} ${idx === Math.max(0, messages.length - 1) ? 'mb-4' : ''}`}>
                        <div className={`max-w-[75%] rounded-[1.5rem] px-6 py-4 relative shadow-sm ${msg.isSent
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-none shadow-emerald-500/20'
                            : isDarkMode
                              ? 'bg-gray-700/80 text-gray-100 rounded-bl-none border border-gray-600'
                              : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-bl-none shadow-inner'
                          }`}>
                          <p className="whitespace-pre-wrap font-bold text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <span className={`text-[10px] font-black italic mt-2 px-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="relative group max-w-4xl mx-auto flex items-end gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                    placeholder="Message..."
                    className={`flex-1 p-4 rounded-2xl font-bold border transition-all duration-300 resize-none max-h-32 focus:outline-none focus:ring-2 ${isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:ring-emerald-500/50'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-500/50 shadow-inner'
                      }`}
                    rows={1}
                    style={{ minHeight: '52px' }}
                  ></textarea>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="w-[52px] h-[52px] shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:grayscale disabled:opacity-50 disabled:translate-y-0 mb-0.5"
                  >
                    <svg className="w-5 h-5 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-[3rem] border h-full flex flex-col items-center justify-center text-center p-20 transition-all duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <div className="w-24 h-24 mb-10 transform transition-transform duration-700 hover:scale-110">
                <div className={`w-full h-full rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl ${isDarkMode ? 'bg-gray-700 text-emerald-400 border border-emerald-500/10' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>💬</div>
              </div>
              <h3 className={`text-3xl font-black italic mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Direct Messages</h3>
              <p className={`max-w-xs font-bold leading-relaxed ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesManagement;
