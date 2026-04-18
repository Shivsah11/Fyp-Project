import { useState, useEffect, useRef } from 'react';
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

const Messages = () => {
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
        // Mark as read logic could be here
        const unreadIds = result.data.filter((m: Message) => !m.isSent && !m.isRead).map((m: Message) => m.id);
        if (unreadIds.length > 0) {
          unreadIds.forEach(async (id: string) => {
            await fetch(`http://localhost:5000/api/messages/${id}/read`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          });
          // refresh conversations softly
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
        type: 'landlord'
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
        alert(`Error: ${result.message}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading messaging...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Direct Messages</h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-700'}>Communicate actively with your tenants</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 flex flex-col min-h-0">
          <div className={`rounded-xl border shadow-sm flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <div className="p-4 border-b dark:border-gray-700 font-bold dark:text-white">Recent Conversations</div>
            <div className="overflow-y-auto flex-1">
              {error ? (
                <div className={`p-8 text-center ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</div>
              ) : conversations.length === 0 ? (
                <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No messages found</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.otherPartyId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b cursor-pointer transition-all ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
                      } ${selectedConversation?.otherPartyId === conv.otherPartyId
                        ? isDarkMode
                          ? 'bg-emerald-900/30 border-l-4 border-l-emerald-500 border-b-transparent'
                          : 'bg-emerald-50 border-l-4 border-l-emerald-500 border-b-transparent'
                        : isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${isDarkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        }`}>{conv.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-bold truncate ${conv.unreadCount > 0
                              ? isDarkMode ? 'text-white' : 'text-gray-900'
                              : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>{conv.name}</h4>
                          <span className={`text-[10px] whitespace-nowrap ${conv.unreadCount > 0 ? 'text-emerald-500 font-bold' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>{formatDate(conv.lastMessage.timestamp)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className={`text-sm truncate ${conv.unreadCount > 0
                              ? isDarkMode ? 'text-gray-200 font-medium' : 'text-gray-800 font-medium'
                              : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>{conv.lastMessage.isSent ? 'You: ' : ''}{conv.lastMessage.content}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">
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

        <div className="md:col-span-2 flex flex-col min-h-0">
          {selectedConversation ? (
            <div className={`rounded-2xl border shadow-sm flex flex-col flex-1 overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <div className={`p-4 border-b flex items-center gap-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isDarkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                  }`}>{selectedConversation.avatar}</div>
                <div>
                  <h3 className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedConversation.name}</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{selectedConversation.otherPartyRole}</p>
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDarkMode ? 'bg-gray-900/30' : 'bg-gray-50/50'
                }`}>
                {messagesLoading ? (
                  <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={msg.id} className={`flex flex-col ${msg.isSent ? 'items-end' : 'items-start'} ${idx === messages.length - 1 ? 'mb-4' : ''}`}>
                      <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${msg.isSent
                          ? 'bg-emerald-500 text-white rounded-br-none'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-100 rounded-bl-none'
                            : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-none'
                        }`}>
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      </div>
                      <span className={`text-[10px] mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-end gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                    placeholder="Type a message..."
                    className={`flex-1 p-3 border rounded-xl outline-none max-h-32 resize-none focus:ring-2 focus:ring-emerald-500/50 ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    rows={1}
                    style={{ minHeight: '46px' }}
                  ></textarea>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="p-3 shadow-md bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-all mb-0.5"
                  >
                    <svg className="w-5 h-5 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl border shadow-sm h-full flex flex-col items-center justify-center text-center p-12 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 ${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'
                }`}>💬</div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Your Messages</h3>
              <p className={`max-w-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select a conversation from the sidebar to view chat history and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;