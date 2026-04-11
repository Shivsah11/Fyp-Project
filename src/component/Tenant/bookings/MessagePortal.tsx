import { useState } from 'react';

interface MessagePortalProps {
  isOpen: boolean;
  onClose: () => void;
  landlordName: string;
  propertyName: string;
  propertyType: string;
  onSendMessage: (message: string) => void;
}

const MessagePortal = ({ 
  isOpen, 
  onClose, 
  landlordName, 
  propertyName, 
  propertyType, 
  onSendMessage 
}: MessagePortalProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message before sending.');
      return;
    }

    setIsSending(true);
    
    try {
      // Simulate message sending (in real app, this would be an API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSendMessage(message);
      setMessage('');
      onClose();
      
      alert(`Message sent successfully to ${landlordName}!`);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg border border-gray-200 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Send Message</h3>
            <p className="text-sm text-gray-600 mt-1">
              To: <span className="font-medium">{landlordName}</span>
            </p>
            <p className="text-xs text-gray-500">
              Regarding: {propertyName} - {propertyType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Message Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 hover:bg-gray-100 resize-none"
            placeholder="Type your message here..."
            rows={6}
            disabled={isSending}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {message.length}/500 characters
            </span>
            {message.length > 500 && (
              <span className="text-xs text-red-500">
                Message too long
              </span>
            )}
          </div>
        </div>

        {/* Quick Message Templates */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">Quick Messages:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMessage('Is this property still available?')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
              disabled={isSending}
            >
              Available?
            </button>
            <button
              onClick={() => setMessage('Can I schedule a visit to see the property?')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
              disabled={isSending}
            >
              Schedule Visit
            </button>
            <button
              onClick={() => setMessage('What are the payment terms and conditions?')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
              disabled={isSending}
            >
              Payment Terms
            </button>
            <button
              onClick={() => setMessage('Are utilities included in the rent?')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
              disabled={isSending}
            >
              Utilities?
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim() || message.length > 500}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:cursor-not-allowed"
          >
            {isSending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePortal;
