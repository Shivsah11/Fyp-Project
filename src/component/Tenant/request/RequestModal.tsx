import { useState } from 'react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestModal = ({ isOpen, onClose }: RequestModalProps) => {
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

      // Store in localStorage for demo (in real app, this would be an API call)
      const existingRequests = JSON.parse(localStorage.getItem('tenantRequests') || '[]');
      existingRequests.unshift(newRequest);
      localStorage.setItem('tenantRequests', JSON.stringify(existingRequests));

      alert(`Request "${subject}" submitted successfully! We'll respond within 24 hours.`);
      setIsSubmitting(false);
      onClose();
      
      // Reset form
      setRequestType('');
      setSubject('');
      setDescription('');
      setPriority('normal');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Submit New Request</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-3">Request Type</label>
            <div className="grid grid-cols-2 gap-3">
              {requestTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setRequestType(type.id)}
                  className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                    requestType === type.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/50'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400 hover:bg-gray-50"
              placeholder="Brief description of your request"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400 hover:bg-gray-50 resize-none"
              placeholder="Provide detailed information about your request..."
              rows={4}
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Priority Level</label>
            <div className="flex gap-3">
              {[
                { value: 'low', label: 'Low', color: 'green' },
                { value: 'normal', label: 'Normal', color: 'blue' },
                { value: 'high', label: 'High', color: 'orange' },
                { value: 'urgent', label: 'Urgent', color: 'red' }
              ].map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setPriority(level.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all duration-300 ${
                    priority === level.value
                      ? `bg-${level.color}-500/20 text-${level.color}-300 border-${level.color}-400/50`
                      : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
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
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-purple-500/30 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
