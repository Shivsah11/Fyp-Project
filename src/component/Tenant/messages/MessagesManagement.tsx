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
  otherPartyId?: string;
  otherPartyRole?: string;
}

const MessagesManagement: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'archived'>('inbox');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newMessage, setNewMessage] = useState<{ recipient: string; recipientId: string; recipientRole: string; subject: string; type: string } | null>(null);

  // Check for new message data from localStorage (e.g. from "Contact Landlord" button)
  useEffect(() => {
    const recipient = localStorage.getItem('newMessageRecipient');
    const recipientId = localStorage.getItem('newMessageRecipientId');
    const recipientRole = localStorage.getItem('newMessageRecipientRole');
    const subject = localStorage.getItem('newMessageSubject');
    const type = localStorage.getItem('newMessageType');
    
    if (recipient && subject && type) {
      setNewMessage({ 
        recipient, 
        recipientId: recipientId || '', 
        recipientRole: recipientRole || 'Landlord', 
        subject, 
        type 
      });
      // Clear the stored data
      localStorage.removeItem('newMessageRecipient');
      localStorage.removeItem('newMessageRecipientId');
      localStorage.removeItem('newMessageRecipientRole');
      localStorage.removeItem('newMessageSubject');
      localStorage.removeItem('newMessageType');
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
        
        // Add to messages list
        setMessages(prev => [localReply, ...prev]);
        alert("✅ Reply sent successfully! (Stored locally - Backend unavailable)");
        setReplyText('');
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
        
        // Add to messages list
        setMessages(prev => [localMessage, ...prev]);
        alert("✅ Message sent successfully! (Stored locally - Backend unavailable)");
        setReplyText('');
        setNewMessage(null);
        setActiveTab('sent');
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
        <p className="text-gray-700">Communicate with landlords and support</p>
      </div>

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
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'inbox' ? messages.filter(m => m.type !== 'sent').length : messages.filter(m => m.type === 'sent').length})
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div><p className="text-gray-500">Loading...</p></div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No messages found</div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead) handleMarkAsRead(message.id);
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                      selectedMessage?.id === message.id ? 'bg-emerald-50 border-r-4 border-r-emerald-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold shrink-0">{message.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm truncate ${!message.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{message.sender}</h4>
                          <span className="text-[10px] text-gray-400">{formatDate(message.timestamp)}</span>
                        </div>
                        <p className={`text-xs truncate ${!message.isRead ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{message.subject}</p>
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg">{selectedMessage.avatar}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedMessage.sender}</h3>
                    <p className="text-sm text-gray-500">{formatDate(selectedMessage.timestamp)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(selectedMessage.type)}`}>
                    {getTypeIcon(selectedMessage.type)} {selectedMessage.type}
                  </span>
                  <button onClick={() => handleDelete(selectedMessage.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">🗑️</button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedMessage.subject}</h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-6"><p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p></div>

              <div className="border-t pt-6">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-4 border rounded-xl mb-3 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px]"
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button onClick={handleReply} disabled={!replyText.trim()} className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all">Send reply</button>
                </div>
              </div>
            </div>
          ) : newMessage ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
               <h3 className="text-xl font-bold text-gray-900 mb-4">Compose Message</h3>
               <div className="space-y-4">
                  <div><label className="text-sm text-gray-500">To: </label><span className="font-bold text-gray-900">{newMessage.recipient}</span></div>
                  <div><label className="text-sm text-gray-500">Subject: </label><input type="text" value={newMessage.subject} readOnly className="w-full bg-gray-50 p-2 rounded-lg outline-none" /></div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your initial message..."
                    className="w-full p-4 border rounded-xl min-h-[150px] outline-none focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => {setNewMessage(null); setReplyText('');}} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={handleSendMessage} disabled={!replyText.trim()} className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 shadow-lg">Send Message</button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
              <div className="text-6xl mb-6">📬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select a message</h3>
              <p className="text-gray-500 max-w-sm">Choose a conversation from the list to view the full details or reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesManagement;
