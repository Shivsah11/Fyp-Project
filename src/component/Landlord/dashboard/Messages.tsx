import { useState } from 'react';

interface Message {
  id: number;
  sender: string;
  subject: string;
  message: string;
  time: string;
  unread: boolean;
  property?: string;
  avatar?: string;
}

interface Conversation {
  id: number;
  participant: string;
  property: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  messages: Message[];
}

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'tenants' | 'maintenance'>('all');

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      participant: 'John Doe',
      property: '2 BHK Apartment',
      lastMessage: 'The air conditioning is not working properly...',
      time: '2 hours ago',
      unread: 2,
      avatar: 'JD',
      messages: [
        {
          id: 1,
          sender: 'John Doe',
          subject: 'Maintenance Request',
          message: 'Hi, I\'m having an issue with the air conditioning in the master bedroom. It\'s not cooling properly and making strange noises.',
          time: '2 hours ago',
          unread: false,
          property: '2 BHK Apartment'
        },
        {
          id: 2,
          sender: 'You',
          subject: 'Re: Maintenance Request',
          message: 'I understand the issue. I\'ll contact the AC technician tomorrow morning to get this fixed for you.',
          time: '1 hour ago',
          unread: false,
          property: '2 BHK Apartment'
        },
        {
          id: 3,
          sender: 'John Doe',
          subject: 'Re: Maintenance Request',
          message: 'The air conditioning is not working properly and it\'s getting quite hot. Could you please expedite this?',
          time: '30 minutes ago',
          unread: true,
          property: '2 BHK Apartment'
        }
      ]
    },
    {
      id: 2,
      participant: 'Jane Smith',
      property: 'Studio Room',
      lastMessage: 'Thank you for the quick response!',
      time: '5 hours ago',
      unread: 0,
      avatar: 'JS',
      messages: [
        {
          id: 1,
          sender: 'Jane Smith',
          subject: 'Payment Confirmation',
          message: 'I just transferred the rent for this month. Please confirm receipt.',
          time: '5 hours ago',
          unread: false,
          property: 'Studio Room'
        },
        {
          id: 2,
          sender: 'You',
          subject: 'Re: Payment Confirmation',
          message: 'Thank you! I\'ve received your payment and it\'s been recorded. Appreciate your prompt payment.',
          time: '4 hours ago',
          unread: false,
          property: 'Studio Room'
        },
        {
          id: 3,
          sender: 'Jane Smith',
          subject: 'Re: Payment Confirmation',
          message: 'Thank you for the quick response!',
          time: '3 hours ago',
          unread: false,
          property: 'Studio Room'
        }
      ]
    },
    {
      id: 3,
      participant: 'Mike Johnson',
      property: '3 BHK House',
      lastMessage: 'Is it okay if I paint the living room wall?',
      time: '1 day ago',
      unread: 1,
      avatar: 'MJ',
      messages: [
        {
          id: 1,
          sender: 'Mike Johnson',
          subject: 'Renovation Request',
          message: 'Hi! I\'d like to paint the living room wall a different color. Is this okay with you?',
          time: '1 day ago',
          unread: true,
          property: '3 BHK House'
        }
      ]
    },
    {
      id: 4,
      participant: 'Sarah Wilson',
      property: '1 BHK Apartment',
      lastMessage: 'The water pressure seems low in the bathroom',
      time: '2 days ago',
      unread: 0,
      avatar: 'SW',
      messages: [
        {
          id: 1,
          sender: 'Sarah Wilson',
          subject: 'Water Pressure Issue',
          message: 'I\'ve noticed the water pressure in the bathroom has been quite low for the past few days.',
          time: '2 days ago',
          unread: false,
          property: '1 BHK Apartment'
        },
        {
          id: 2,
          sender: 'You',
          subject: 'Re: Water Pressure Issue',
          message: 'Thanks for letting me know. I\'ll check with the building maintenance about this issue.',
          time: '2 days ago',
          unread: false,
          property: '1 BHK Apartment'
        },
        {
          id: 3,
          sender: 'Sarah Wilson',
          subject: 'Re: Water Pressure Issue',
          message: 'The water pressure seems low in the bathroom',
          time: '2 days ago',
          unread: false,
          property: '1 BHK Apartment'
        }
      ]
    }
  ]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            messages: [
              ...conv.messages,
              {
                id: conv.messages.length + 1,
                sender: 'You',
                subject: 'Re: ' + conv.messages[conv.messages.length - 1].subject,
                message: newMessage,
                time: 'Just now',
                unread: false,
                property: conv.property
              }
            ],
            lastMessage: newMessage,
            time: 'Just now'
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      setNewMessage('');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'unread') return matchesSearch && conv.unread > 0;
    if (filter === 'tenants') return matchesSearch && conv.messages.some(m => m.subject.includes('Payment') || m.subject.includes('Rent'));
    if (filter === 'maintenance') return matchesSearch && conv.messages.some(m => m.subject.includes('Maintenance') || m.subject.includes('Issue'));
    
    return matchesSearch;
  });

  const markAsRead = (conversationId: number) => {
    setConversations(conversations.map(conv => 
      conv.id === conversationId ? { ...conv, unread: 0 } : conv
    ));
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversations List */}
      <div className="w-96 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <h3 className="text-xl font-bold text-white mb-3">Messages</h3>
          
          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
            />
            <span className="absolute left-3 top-2.5 text-emerald-300">🔍</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: conversations.length },
              { key: 'unread', label: 'Unread', count: conversations.reduce((acc, c) => acc + c.unread, 0) },
              { key: 'tenants', label: 'Tenants', count: conversations.filter(c => c.messages.some(m => m.subject.includes('Payment'))).length },
              { key: 'maintenance', label: 'Maintenance', count: conversations.filter(c => c.messages.some(m => m.subject.includes('Maintenance'))).length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                  filter === key
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border border-emerald-400/30 shadow-lg'
                    : 'bg-white/10 text-emerald-200 hover:bg-white/20 border border-white/20 hover:border-white/30'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation.id);
                markAsRead(conversation.id);
              }}
              className={`p-4 border-b border-white/10 cursor-pointer transition-all duration-300 ${
                selectedConversation === conversation.id
                  ? 'bg-white/20 border-l-4 border-l-emerald-400'
                  : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                  {conversation.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-semibold truncate">{conversation.participant}</h4>
                    <span className="text-emerald-200/60 text-xs flex-shrink-0">{conversation.time}</span>
                  </div>
                  <p className="text-emerald-200 text-xs mb-1">{conversation.property}</p>
                  <p className="text-emerald-100/80 text-sm truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 && (
                  <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {conversation.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation View */}
      <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 flex flex-col">
        {selectedConv ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {selectedConv.avatar}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{selectedConv.participant}</h4>
                  <p className="text-emerald-200 text-sm">{selectedConv.property}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConv.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                      message.sender === 'You'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : 'bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">{message.subject}</p>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'You' ? 'text-emerald-100' : 'text-emerald-200/60'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
              <p className="text-emerald-200">Choose a conversation from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;