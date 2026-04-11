import { useState, useEffect } from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

interface Message {
  id: string;
  sender: string;
  subject: string;
  message: string;
  time: string;
  unread: boolean;
  property?: string;
  avatar?: string;
  timestamp?: string;
  type?: string;
  senderRole?: string;
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
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'tenants' | 'maintenance'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    try {
      // Load messages from localStorage
      const landlordMessages = JSON.parse(localStorage.getItem('landlordMessages') || '[]');
      
      // Group messages by booking/property to create conversations
      const conversationMap = new Map<string, Conversation>();
      
      landlordMessages.forEach((msg: any) => {
        const bookingId = msg.bookingId || 'general';
        const property = msg.subject ? msg.subject.split(' - ')[1] || 'Property' : 'Property';
        
        if (!conversationMap.has(bookingId)) {
          conversationMap.set(bookingId, {
            id: bookingId,
            participant: msg.sender || 'Tenant',
            property: property,
            lastMessage: msg.content || msg.message || 'No message',
            time: formatTime(msg.timestamp),
            unread: msg.isRead ? 0 : 1,
            avatar: msg.avatar || 'T',
            messages: []
          });
        }
        
        const conversation = conversationMap.get(bookingId)!;
        conversation.messages.push({
          id: msg.id,
          sender: msg.sender || 'Tenant',
          subject: msg.subject,
          message: msg.content || msg.message,
          time: formatTime(msg.timestamp),
          unread: !msg.isRead,
          property: property,
          avatar: msg.avatar || 'T',
          timestamp: msg.timestamp,
          type: msg.type,
          senderRole: msg.senderRole
        });
      });
      
      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Failed to load landlord messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

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
    <div className={`h-[calc(100vh-8rem)] flex gap-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Conversations List */}
      <div className={`w-96 rounded-xl border flex flex-col shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Messages</h3>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-4xl mb-2">📭</div>
              <p>No messages from tenants yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedConversation === conv.id 
                    ? isDarkMode ? 'bg-emerald-900/30 border-r-4 border-r-emerald-500' : 'bg-emerald-50 border-r-4 border-r-emerald-500'
                    : isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                    isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {conv.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-semibold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{conv.participant}</h4>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conv.time}</span>
                    </div>
                    <p className={`text-sm truncate mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{conv.property}</p>
                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Conversation Detail */}
      <div className={`flex-1 rounded-xl border flex flex-col shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {selectedConv ? (
          <>
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedConv.avatar}
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedConv.participant}</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedConv.property}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConv.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      msg.sender === 'You'
                        ? 'bg-emerald-500 text-white'
                        : isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">{msg.sender}</div>
                    <div className="text-sm">{msg.message}</div>
                    <div className="text-xs opacity-75 mt-1">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="text-6xl mb-4">💬</div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Select a conversation</h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Choose a conversation from the list to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;