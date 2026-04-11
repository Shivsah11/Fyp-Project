import { useState, useEffect } from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

interface Message {
  id: string;
  sender: string;
  subject: string;
  content: string;
  time: string;
  unread: boolean;
  property?: string;
  avatar?: string;
  timestamp?: string;
  type?: string;
  senderRole?: string;
  isRead?: boolean;
}

interface Conversation {
  id: string;
  participant: string;
  property: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  messages: Message[];
}

const Messages = () => {
  const { isDarkMode } = useDarkMode();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'archived'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('http://localhost:5000/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMessages(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch messages');
      
      // Fallback to sample data if API fails
      console.log('Using fallback sample data due to API error');
      setMessages([
        {
          id: '1',
          sender: 'John Doe',
          subject: 'Maintenance Request',
          content: 'The air conditioning is not working properly in my apartment.',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          isRead: false,
          type: 'tenant',
          avatar: 'J'
        },
        {
          id: '2',
          sender: 'Jane Smith',
          subject: 'Rent Payment Confirmation',
          content: 'Thank you for confirming my rent payment for this month.',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          isRead: true,
          type: 'tenant',
          avatar: 'J'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredMessages = messages.filter(message => {
    switch (activeTab) {
      case 'inbox':
        return message.type !== 'sent';
      case 'sent':
        return message.type === 'sent';
      case 'archived':
        return false;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className={`text-gray-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Messages</h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-700'}>Communicate with tenants and manage property inquiries</p>
      </div>

      <div className={`flex gap-2 mb-6 rounded-xl p-1 shadow-sm border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {(['inbox', 'sent', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'inbox' ? messages.filter(m => m.type !== 'sent').length : messages.filter(m => m.type === 'sent').length})
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className={`rounded-xl border overflow-hidden shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading...</p>
                </div>
              ) : error ? (
                <div className={`p-8 text-center ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</div>
              ) : filteredMessages.length === 0 ? (
                <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No messages found</div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead) handleMarkAsRead(message.id);
                    }}
                    className={`p-4 border-b cursor-pointer transition-all ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-100'
                    } ${
                      selectedMessage?.id === message.id 
                        ? isDarkMode
                          ? 'bg-emerald-900/30 border-r-4 border-r-emerald-500'
                          : 'bg-emerald-50 border-r-4 border-r-emerald-500'
                        : isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                        isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      }`}>{message.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm truncate ${
                            !message.isRead 
                              ? `font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`
                              : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>{message.sender}</h4>
                          <span className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{formatDate(message.timestamp)}</span>
                        </div>
                        <p className={`text-xs truncate ${
                          !message.isRead 
                            ? isDarkMode ? 'text-gray-200 font-medium' : 'text-gray-800 font-medium'
                            : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>{message.subject}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedMessage ? (
            <div className={`rounded-2xl border shadow-sm p-6 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                  }`}>{selectedMessage.avatar}</div>
                  <div>
                    <h3 className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedMessage.sender}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatDate(selectedMessage.timestamp)}</p>
                  </div>
                </div>
              </div>

              <div className={`space-y-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedMessage.content}</p>
              </div>

              <div className={`border-t pt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className={`w-full p-4 border rounded-xl outline-none min-h-[120px] focus:ring-2 focus:ring-emerald-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={handleReply} 
                    disabled={!replyText.trim()} 
                    className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all"
                  >Send Reply</button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl border shadow-sm h-full flex flex-col items-center justify-center text-center p-12 min-h-[400px] ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="text-6xl mb-6"></div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Select a message</h3>
              <p className={`max-w-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Choose a message from the list to view full details or reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;