import { useState } from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

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
  const { isDarkMode } = useDarkMode();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message before sending.');
      return;
    }

    setIsSending(true);
    
    try {
      // Actually send to the backend via parent component's handler
      await onSendMessage(message);
      
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className={`rounded-[2.5rem] p-10 w-full max-w-xl border shadow-2xl transition-all duration-500 transform ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className={`text-4xl font-black italic mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Message Host</h3>
            <p className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Talking to {landlordName}
            </p>
            <div className={`mt-4 px-4 py-2 rounded-2xl inline-block border ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'
            }`}>
              <p className="text-xs font-black uppercase tracking-tighter">
                Ref: {propertyName} • {propertyType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black transition-all duration-300 ${
              isDarkMode ? 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600' : 'bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Message Input */}
        <div className="mb-8">
          <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Your Inquiry
          </label>
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full px-6 py-6 rounded-3xl font-bold border focus:outline-none focus:ring-4 transition-all duration-500 resize-none ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-600 focus:ring-emerald-500/10 focus:border-emerald-500/50'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-300 focus:ring-emerald-500/5 focus:border-emerald-500/30'
              }`}
              placeholder="What would you like to ask the landlord?"
              rows={5}
              disabled={isSending}
            />
            <div className="absolute right-6 bottom-6">
               <span className={`text-[10px] font-black italic shadow-sm px-2 py-1 rounded-lg ${
                 message.length > 500 ? 'bg-red-500 text-white' : isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-300'
               }`}>
                 {message.length}/500
               </span>
            </div>
          </div>
        </div>

        {/* Quick Message Templates */}
        <div className="mb-10">
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Templates</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'av', text: 'Is this property still available?', label: 'Available?' },
              { id: 'visit', text: 'Can I schedule a visit to see the property?', label: 'Visit' },
              { id: 'pay', text: 'What are the payment terms and conditions?', label: 'Terms' },
              { id: 'util', text: 'Are utilities included in the rent?', label: 'Utilities' }
            ].map(tmp => (
              <button
                key={tmp.id}
                onClick={() => setMessage(tmp.text)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 shadow-sm'
                }`}
                disabled={isSending}
              >
                {tmp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
              isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'
            }`}
            disabled={isSending}
          >
            Go Back
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim() || message.length > 500}
            className={`flex-1 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-500 disabled:grayscale disabled:cursor-not-allowed`}
          >
            {isSending ? (
               <div className="flex items-center justify-center gap-3">
                 <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                 Sending
               </div>
            ) : (
              'Dispatch Message'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePortal;
