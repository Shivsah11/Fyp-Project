import { useState } from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestAdded?: () => void;
}

const RequestModal = ({ isOpen, onClose, onRequestAdded }: RequestModalProps) => {
  const { isDarkMode } = useDarkMode();
  const [requestType, setRequestType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestTypes = [
    { id: 'maintenance', label: 'Maintenance Request', icon: '🔧' },
    { id: 'repair', label: 'Repair Request', icon: '🛠️' },
    { id: 'cleaning', label: 'Cleaning Service', icon: '🧹' },
    { id: 'utility', label: 'Utility Issue', icon: '💡' },
    { id: 'security', label: 'Security Concern', icon: '🔒' },
    { id: 'noise', label: 'Noise Complaint', icon: '🔊' },
    { id: 'parking', label: 'Parking Issue', icon: '🚗' },
    { id: 'other', label: 'Other', icon: '📝' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call to submit request
    setTimeout(() => {
      const newRequest = {
        id: Date.now().toString(),
        type: requestType,
        subject,
        description,
        priority,
        status: 'pending',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };

      const token = localStorage.getItem('token');
      if (token) {
        const userId = JSON.parse(atob(token.split('.')[1])).userId;
        const tenantRequestsKey = `tenantRequests_${userId}`;
        
        const existingRequests = JSON.parse(localStorage.getItem(tenantRequestsKey) || '[]');
        existingRequests.unshift(newRequest);
        localStorage.setItem(tenantRequestsKey, JSON.stringify(existingRequests));
      }

      alert(`Request "${subject}" submitted successfully! We'll respond within 24 hours.`);
      setIsSubmitting(false);
      onClose();
      if (onRequestAdded) onRequestAdded();
      
      setRequestType('');
      setSubject('');
      setDescription('');
      setPriority('normal');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-500">
      <div className={`rounded-[40px] p-8 md:p-10 border w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gray-900/90 border-gray-700/50 backdrop-blur-xl text-white' 
          : 'bg-white border-gray-100 text-gray-900'
      }`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className={`text-3xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Submit New Request
            </h2>
            <p className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400 font-medium italic'}`}>
              Establish a new communication thread
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-2xl transition-all duration-300 ${
              isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-400 hover:text-gray-900'
            }`}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Request Type */}
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Select Intention
            </label>
            <div className="grid grid-cols-2 gap-4">
              {requestTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setRequestType(type.id)}
                  className={`p-4 rounded-2xl border transition-all duration-500 flex items-center gap-3 group transform hover:scale-[1.02] ${
                    requestType === type.id
                      ? (isDarkMode ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                      : (isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-emerald-500/30' : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-100')
                  }`}
                >
                  <span className={`text-2xl transition-transform duration-500 group-hover:scale-125 ${requestType === type.id ? 'rotate-12' : ''}`}>
                    {type.icon}
                  </span>
                  <span className="text-sm font-black italic">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Brief Objective
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full px-6 py-4 rounded-2xl font-bold transition-all duration-300 border focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none ${
                isDarkMode 
                  ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-600' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 shadow-sm'
              }`}
              placeholder="e.g., Leaking faucet in master bath"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Detailed Context
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-6 py-4 rounded-2xl font-bold transition-all duration-300 border focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none ${
                isDarkMode 
                  ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-600' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 shadow-sm'
              }`}
              placeholder="Please provide specifics regarding the situation..."
              rows={4}
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Criticality Scale
            </label>
            <div className="flex gap-4">
              {[
                { value: 'low', label: 'Low', color: 'bg-emerald-500' },
                { value: 'normal', label: 'Normal', color: 'bg-blue-500' },
                { value: 'high', label: 'High', color: 'bg-orange-500' },
                { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
              ].map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setPriority(level.value)}
                  className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all duration-500 hover:-translate-y-1 ${
                    priority === level.value
                      ? `${level.color}/20 ${level.color.replace('bg-', 'text-')} border-${level.color.split('-')[1]}-500/50 ring-1 ring-${level.color.split('-')[1]}-500/20`
                      : (isDarkMode ? 'bg-gray-800/30 border-gray-700 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400')
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !requestType || !subject || !description}
            className={`w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed ${
              !isSubmitting && requestType && subject && description ? 'shadow-emerald-500/30 hover:shadow-emerald-500/50' : ''
            }`}
          >
            {isSubmitting ? 'Transmitting Data...' : 'Dispatch Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
