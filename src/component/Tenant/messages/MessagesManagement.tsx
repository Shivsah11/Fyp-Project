import React, { useState, useEffect } from 'react';

interface Message {
  id: string;
  sender: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'landlord' | 'system' | 'support' | 'sent';
  avatar: string;
}

const MessagesManagement: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'archived'>('inbox');
  const [replyText, setReplyText] = useState('');
  const [newMessage, setNewMessage] = useState<{ recipient: string; subject: string; type: string } | null>(null);

  // Check for new message data from localStorage
  useEffect(() => {
    const recipient = localStorage.getItem('newMessageRecipient');
    const subject = localStorage.getItem('newMessageSubject');
    const type = localStorage.getItem('newMessageType');
    
    if (recipient && subject && type) {
      setNewMessage({ recipient, subject, type });
      // Clear the stored data
      localStorage.removeItem('newMessageRecipient');
      localStorage.removeItem('newMessageSubject');
      localStorage.removeItem('newMessageType');
    }
  }, []);

  // Sample messages data
  const messages: Message[] = [
    {
      id: 'MSG001',
      sender: 'Rajesh Sharma',
      subject: 'Rent Payment Reminder',
      content: 'Dear Tenant, This is a friendly reminder that your monthly rent payment for January is due by the 5th. Please ensure timely payment to avoid any late fees. Thank you for your cooperation.',
      timestamp: '2024-01-01 10:30 AM',
      isRead: false,
      type: 'landlord',
      avatar: 'RS'
    },
    {
      id: 'MSG002',
      sender: 'System Notification',
      subject: 'Maintenance Scheduled',
      content: 'We will be conducting routine maintenance in your building on January 10th from 9 AM to 12 PM. Please ensure you are available during this time as we may need access to your apartment.',
      timestamp: '2024-01-02 02:15 PM',
      isRead: true,
      type: 'system',
      avatar: 'SY'
    },
    {
      id: 'MSG003',
      sender: 'Support Team',
      subject: 'Your Request Has Been Resolved',
      content: 'Good news! Your maintenance request for the kitchen faucet has been completed. The issue has been fixed and everything is working properly now.',
      timestamp: '2024-01-03 09:45 AM',
      isRead: true,
      type: 'support',
      avatar: 'SU'
    },
    {
      id: 'MSG004',
      sender: 'Sita Karki',
      subject: 'Welcome to Your New Home',
      content: 'Welcome! We are excited to have you as our tenant. If you need any assistance or have questions, please don\'t hesitate to reach out. We hope you enjoy your stay!',
      timestamp: '2023-12-28 04:20 PM',
      isRead: true,
      type: 'landlord',
      avatar: 'SK'
    }
  ];

  const filteredMessages = messages.filter(message => {
    switch (activeTab) {
      case 'inbox':
        return message.type !== 'sent';
      case 'sent':
        return message.type === 'sent';
      case 'archived':
        return false; // Add archived logic later
      default:
        return true;
    }
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'landlord':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'system':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'support':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'sent':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'landlord':
        return '👤';
      case 'system':
        return '🔔';
      case 'support':
        return '💬';
      case 'sent':
        return '📤';
      default:
        return '📧';
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
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleReply = () => {
    if (replyText.trim() && selectedMessage) {
      alert(`Reply sent to ${selectedMessage.sender}: ${replyText}`);
      setReplyText('');
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    // Mark message as read logic
    console.log(`Marked message ${messageId} as read`);
  };

  const handleDelete = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      alert(`Message ${messageId} deleted`);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
        <p className="text-gray-700">Communicate with landlords and support</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
        {(['inbox', 'sent', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'inbox' ? messages.filter(m => m.type !== 'sent').length : 0})
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="md:col-span-1">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
            <div className="max-h-96 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    handleMarkAsRead(message.id);
                  }}
                  className={`p-4 border-b border-gray-200 cursor-pointer transition-all duration-200 ${
                    selectedMessage?.id === message.id 
                      ? 'bg-emerald-50 border-l-4 border-l-emerald-400' 
                      : 'hover:bg-gray-50'
                  } ${!message.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {message.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(message.type)}`}>
                          {getTypeIcon(message.type)} {message.type}
                        </span>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        )}
                      </div>
                      <h4 className="text-gray-900 font-semibold text-sm truncate">{message.sender}</h4>
                      <p className="text-gray-700 text-sm font-medium truncate">{message.subject}</p>
                      <p className="text-gray-500 text-xs mt-1">{formatDate(message.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="md:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6">
                {/* Message Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedMessage.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{selectedMessage.sender}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(selectedMessage.type)}`}>
                          {getTypeIcon(selectedMessage.type)} {selectedMessage.type}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{selectedMessage.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete message"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Message Subject */}
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{selectedMessage.subject}</h4>

                {/* Message Content */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-gray-800 leading-relaxed">{selectedMessage.content}</p>
                </div>

                {/* Reply Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h5 className="text-gray-900 font-semibold mb-3">
                    {newMessage ? 'Compose new message' : 'Reply to message'}
                    {newMessage && (
                      <span className="ml-2 text-sm text-gray-600">
                        to {newMessage.recipient}
                      </span>
                    )}
                  </h5>
                  {newMessage && (
                    <div className="mb-3">
                      <p className="text-gray-600 text-sm">Subject: {newMessage.subject}</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={newMessage ? "Type your message here..." : "Type your reply here..."}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500 hover:bg-gray-50 resize-none"
                      rows={4}
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setReplyText('');
                          if (newMessage) {
                            setNewMessage(null);
                          }
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (newMessage) {
                            alert(`Message sent to ${newMessage.recipient}: ${replyText}`);
                            setNewMessage(null);
                          } else {
                            handleReply();
                          }
                        }}
                        disabled={!replyText.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                      >
                        {newMessage ? 'Send Message' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {newMessage ? 'Compose New Message' : 'Select a message'}
                </h3>
                <p className="text-gray-700">
                  {newMessage 
                    ? `Send a message to ${newMessage.recipient}` 
                    : 'Choose a message from the list to view its contents'
                  }
                </p>
                {newMessage && (
                  <div className="mt-6 max-w-md mx-auto">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-gray-600 text-sm mb-2">To: {newMessage.recipient}</p>
                      <p className="text-gray-600 text-sm mb-4">Subject: {newMessage.subject}</p>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500 hover:bg-gray-50 resize-none"
                        rows={4}
                      />
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => {
                            setReplyText('');
                            setNewMessage(null);
                          }}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            alert(`Message sent to ${newMessage.recipient}: ${replyText}`);
                            setNewMessage(null);
                            setReplyText('');
                          }}
                          disabled={!replyText.trim()}
                          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                        >
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No messages</h3>
          <p className="text-gray-700">
            {activeTab === 'inbox' ? 'You have no messages in your inbox' :
             activeTab === 'sent' ? 'You have no sent messages' :
             'You have no archived messages'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MessagesManagement;
