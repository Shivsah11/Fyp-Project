import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

interface Message {
  id: string;
  sender: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'landlord' | 'system' | 'support' | 'sent';
  avatar: string;
  otherPartyId?: string;
  otherPartyRole?: string;
}

const MessagesManagement: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'archived'>('inbox');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newMessage, setNewMessage] = useState<{ recipient: string; recipientId: string; recipientRole: string; subject: string; type: string } | null>(null);

  // Check for new message data from user-specific localStorage (e.g. from "Contact Landlord" button)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Create user-specific storage keys
    const userId = JSON.parse(atob(token.split('.')[1])).userId;
    
    const recipient = localStorage.getItem(`newMessageRecipient_${userId}`);
    const recipientId = localStorage.getItem(`newMessageRecipientId_${userId}`);
    const recipientRole = localStorage.getItem(`newMessageRecipientRole_${userId}`);
    const subject = localStorage.getItem(`newMessageSubject_${userId}`);
    const type = localStorage.getItem(`newMessageType_${userId}`);
    
    if (recipient && subject && type) {
      setNewMessage({ 
        recipient, 
        recipientId: recipientId || '', 
        recipientRole: recipientRole || 'Landlord', 
        subject, 
        type 
      });
      // Clear the stored data
      localStorage.removeItem(`newMessageRecipient_${userId}`);
      localStorage.removeItem(`newMessageRecipientId_${userId}`);
      localStorage.removeItem(`newMessageRecipientRole_${userId}`);
      localStorage.removeItem(`newMessageSubject_${userId}`);
      localStorage.removeItem(`newMessageType_${userId}`);
    }
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log("Fetching messages with token:", token ? "Token present" : "Token missing");
      
      const response = await fetch('http://localhost:5000/api/messages', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP Error ${response.status}: ${response.statusText}` };
        }
        setError(errorData.message || `Server returned ${response.status}`);
        return;
      }

      const result = await response.json();
      if (result.success) {
        setMessages(result.data);
      } else {
        setError(result.message || "Failed to fetch messages");
      }
    } catch (err: any) {
      console.error("Detailed Fetch Error:", err);
      setError(`Connection Error: ${err.message || "No response from server"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'landlord': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'system': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'support': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'sent': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'landlord': return '👤';
      case 'system': return '🔔';
      case 'support': return '💬';
      case 'sent': return '📤';
      default: return '📧';
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

  const handleReply = async () => {
    if (replyText.trim() && selectedMessage) {
      try {
        const token = localStorage.getItem('token');
        
        // Prepare the reply payload for backend
        const replyPayload = {
          recipientId: (selectedMessage as any).otherPartyId,
          subject: `Re: ${selectedMessage.subject}`,
          content: replyText,
          type: selectedMessage.type === 'sent' ? 'landlord' : selectedMessage.type
        };
        
        console.log('Sending reply with payload:', replyPayload);
        
        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(replyPayload)
        });
        
        const result = await response.json();
        if (result.success) {
          alert("Reply sent successfully!");
          setReplyText('');
          fetchMessages();
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (err) {
        console.error("Reply error:", err);
        
        // Fallback: Create a local reply when backend is not available
        const token = localStorage.getItem('token');
        if (token) {
          const userId = JSON.parse(atob(token.split('.')[1])).userId;
          const tenantMessagesKey = `tenantMessages_${userId}`;
          
          const localReply: Message = {
            id: Date.now().toString(),
            sender: 'You',
            subject: `Re: ${selectedMessage.subject}`,
            content: replyText,
            timestamp: new Date().toISOString(),
            isRead: true,
            type: 'sent',
            avatar: 'ME',
            otherPartyId: (selectedMessage as any).otherPartyId,
            otherPartyRole: (selectedMessage as any).otherPartyRole
          };
          
          // Store in user-specific localStorage
          const existingMessages = JSON.parse(localStorage.getItem(tenantMessagesKey) || '[]');
          existingMessages.unshift(localReply);
          localStorage.setItem(tenantMessagesKey, JSON.stringify(existingMessages));
          
          // Add to messages list
          setMessages(prev => [localReply, ...prev]);
          alert("✅ Reply sent successfully! (Stored locally - Backend unavailable)");
          setReplyText('');
        }
      }
    } else {
      alert('Please enter a reply message before sending.');
    }
  };

  const handleSendMessage = async () => {
    if (replyText.trim() && newMessage) {
      try {
        const token = localStorage.getItem('token');
        
        // Prepare the message payload for backend
        const messagePayload = {
          recipientId: newMessage.recipientId,
          subject: newMessage.subject,
          content: replyText,
          type: newMessage.type as any
        };
        
        console.log('Sending message with payload:', messagePayload);
        
        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messagePayload)
        });
        
        const result = await response.json();
        if (result.success) {
          alert("Message sent successfully!");
          setReplyText('');
          setNewMessage(null);
          fetchMessages();
          setActiveTab('sent');
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (err) {
        console.error("Send error:", err);
        
        // Fallback: Create a local message when backend is not available
        const token = localStorage.getItem('token');
        if (token) {
          const userId = JSON.parse(atob(token.split('.')[1])).userId;
          const tenantMessagesKey = `tenantMessages_${userId}`;
          
          const localMessage: Message = {
            id: Date.now().toString(),
            sender: 'You',
            subject: newMessage.subject,
            content: replyText,
            timestamp: new Date().toISOString(),
            isRead: true,
            type: 'sent',
            avatar: 'ME',
            otherPartyId: newMessage.recipientId,
            otherPartyRole: newMessage.recipientRole
          };
          
          // Store in user-specific localStorage
          const existingMessages = JSON.parse(localStorage.getItem(tenantMessagesKey) || '[]');
          existingMessages.unshift(localMessage);
          localStorage.setItem(tenantMessagesKey, JSON.stringify(existingMessages));
          
          // Add to messages list
          setMessages(prev => [localMessage, ...prev]);
          alert("✅ Message sent successfully! (Stored locally - Backend unavailable)");
          setReplyText('');
          setNewMessage(null);
          setActiveTab('sent');
        }
      }
    } else {
      alert('Please enter a message before sending.');
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

  const handleDelete = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          alert("Message deleted");
          setSelectedMessage(null);
          fetchMessages();
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h2 className={`text-3xl font-black italic mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Conversations</h2>
        <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>Communicate with Hosts & Support</p>
      </div>

      <div className={`flex flex-wrap p-1.5 mb-10 rounded-2xl border transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        {(['inbox', 'sent', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : isDarkMode
                  ? 'text-gray-400 hover:text-emerald-400 hover:bg-gray-700/50'
                  : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50'
            }`}
          >
            {tab}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab 
                  ? 'bg-white/20 text-white' 
                  : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}>
              {tab === 'inbox' ? messages.filter(m => m.type !== 'sent').length : messages.filter(m => m.type === 'sent').length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-12 gap-8 min-h-[600px]">
        {/* Sidebar / List */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className={`rounded-3xl border overflow-hidden transition-all duration-500 h-full ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Syncing...</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-red-400/50' : 'text-red-500/50'}`}>{error}</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-12 text-center">
                   <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>No Mail</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead) handleMarkAsRead(message.id);
                    }}
                    className={`p-6 border-b cursor-pointer transition-all duration-500 group ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-100'
                    } ${
                      selectedMessage?.id === message.id 
                        ? isDarkMode
                          ? 'bg-emerald-500/10 border-r-4 border-r-emerald-500'
                          : 'bg-emerald-50 border-r-4 border-r-emerald-500'
                        : isDarkMode
                          ? 'hover:bg-gray-700/50'
                          : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500 ${
                        selectedMessage?.id === message.id
                          ? 'bg-emerald-500 text-white rotate-6 scale-110'
                          : isDarkMode ? 'bg-gray-700 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      }`}>{message.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm truncate uppercase tracking-tighter ${
                            !message.isRead 
                              ? `font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`
                              : `font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`
                          }`}>{message.sender}</h4>
                          <span className={`text-[10px] font-black italic shrink-0 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{formatDate(message.timestamp)}</span>
                        </div>
                        <p className={`text-xs truncate italic ${
                          !message.isRead 
                            ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>{message.subject}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Content View */}
        <div className="md:col-span-8 lg:col-span-9 h-full">
          {selectedMessage ? (
            <div className={`rounded-[2.5rem] border transition-all duration-500 h-full flex flex-col ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-xl shadow-emerald-500/5'
            }`}>
              <div className="p-8 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl italic border shadow-lg ${
                      isDarkMode ? 'bg-gray-900 border-gray-700 text-emerald-500' : 'bg-white border-emerald-100 text-emerald-600'
                    }`}>{selectedMessage.avatar}</div>
                    <div>
                      <h3 className={`text-xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMessage.sender}</h3>
                      <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>
                        {getTypeIcon(selectedMessage.type)} {selectedMessage.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleDelete(selectedMessage.id)} 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                        isDarkMode
                          ? 'border-gray-700 text-gray-500 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30'
                          : 'border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >✕</button>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-pattern">
                <div className="mb-10 text-center">
                   <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full border ${isDarkMode ? 'bg-gray-900/50 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                      {formatDate(selectedMessage.timestamp)}
                   </span>
                </div>
                
                <div className="max-w-2xl mx-auto">
                    <h2 className={`text-2xl font-black italic mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMessage.subject}</h2>
                    <div className={`p-8 rounded-[2rem] leading-relaxed relative ${
                      isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-700 shadow-inner'
                    }`}>
                      <p className="whitespace-pre-wrap font-bold italic">{selectedMessage.content}</p>
                    </div>
                </div>
              </div>

              <div className={`p-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="max-w-3xl mx-auto">
                   <div className="relative group">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Your message..."
                      className={`w-full p-6 rounded-3xl font-bold border transition-all duration-500 min-h-[140px] resize-none focus:outline-none focus:ring-4 ${
                        isDarkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-600 focus:ring-emerald-500/10'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-300 focus:ring-emerald-500/5 shadow-inner'
                      }`}
                    ></textarea>
                    <div className="absolute right-4 bottom-4">
                       <button 
                        onClick={handleReply} 
                        disabled={!replyText.trim()} 
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-500 disabled:grayscale disabled:scale-100 disabled:translate-y-0"
                      >Send Reply</button>
                    </div>
                   </div>
                </div>
              </div>
            </div>
          ) : newMessage ? (
            <div className={`rounded-[3rem] border transition-all duration-500 h-full flex flex-col p-10 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-2xl'
            }`}>
               <h3 className={`text-3xl font-black italic mb-10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>New Dispatch</h3>
               <div className="space-y-8 flex-1">
                  <div className="flex items-center gap-6 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black">TO</div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>Recipient</p>
                      <p className={`text-xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{newMessage.recipient}</p>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Subject</label>
                    <input 
                      type="text" 
                      value={newMessage.subject} 
                      readOnly 
                      className={`w-full p-6 rounded-3xl font-black italic border transition-all duration-500 outline-none ${
                        isDarkMode ? 'bg-gray-900/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="group flex-1 flex flex-col">
                    <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Inquiry</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Start typing your inquiry..."
                      className={`flex-1 w-full p-8 rounded-[2.5rem] font-bold border transition-all duration-500 outline-none resize-none min-h-[200px] ${
                        isDarkMode
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600 focus:border-emerald-500'
                          : 'bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-300 focus:border-emerald-500'
                      }`}
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-6 pt-6">
                    <button 
                      onClick={() => {setNewMessage(null); setReplyText('');}} 
                      className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
                    >Drafts</button>
                    <button 
                      onClick={handleSendMessage} 
                      disabled={!replyText.trim()} 
                      className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.05] transition-all duration-500"
                    >Dispatch</button>
                  </div>
               </div>
            </div>
          ) : (
            <div className={`rounded-[3rem] border h-full flex flex-col items-center justify-center text-center p-20 min-h-[500px] transition-all duration-500 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="w-24 h-24 mb-10 transform -rotate-12 transition-transform duration-700 hover:rotate-12">
                 <div className={`w-full h-full rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl ${
                   isDarkMode ? 'bg-gray-700 text-emerald-400 border border-emerald-500/10' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                 }`}>📧</div>
              </div>
              <h3 className={`text-3xl font-black italic mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Postbox</h3>
              <p className={`max-w-xs font-bold leading-relaxed ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select a conversation from your archive to read the full discourse.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesManagement;
