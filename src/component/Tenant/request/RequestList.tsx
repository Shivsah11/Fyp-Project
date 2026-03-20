import { useState, useEffect } from 'react';

interface Request {
  id: string;
  type: string;
  subject: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  date: string;
  time: string;
}

const RequestList = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');

  useEffect(() => {
    // Load requests from localStorage
    const storedRequests = JSON.parse(localStorage.getItem('tenantRequests') || '[]');
    
    // Add some mock requests if none exist
    if (storedRequests.length === 0) {
      const mockRequests: Request[] = [
        {
          id: '1',
          type: 'maintenance',
          subject: 'Leaky Kitchen Faucet',
          description: 'The kitchen faucet has been dripping continuously for the past 2 days.',
          priority: 'normal',
          status: 'pending',
          date: '2025-02-28',
          time: '10:30 AM'
        },
        {
          id: '2',
          type: 'cleaning',
          subject: 'Hallway Cleaning Request',
          description: 'The hallway near my apartment needs cleaning.',
          priority: 'low',
          status: 'in-progress',
          date: '2025-02-27',
          time: '2:15 PM'
        },
        {
          id: '3',
          type: 'repair',
          subject: 'Broken Window Lock',
          description: 'The window lock in the bedroom is broken and won\'t secure properly.',
          priority: 'high',
          status: 'resolved',
          date: '2025-02-25',
          time: '9:00 AM'
        }
      ];
      localStorage.setItem('tenantRequests', JSON.stringify(mockRequests));
      setRequests(mockRequests);
    } else {
      setRequests(storedRequests);
    }
  }, []);

  const getRequestIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      maintenance: '🔧',
      repair: '🛠️',
      cleaning: '🧹',
      utility: '💡',
      security: '🔒',
      noise: '🔊',
      parking: '🚗',
      other: '📝'
    };
    return icons[type] || '📝';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'normal': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'resolved': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const filteredRequests = requests.filter(request => 
    filter === 'all' || request.status === filter
  );

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">My Requests</h3>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' }
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value as any)}
              className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                filter === filterOption.value
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/50'
                  : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-400">No requests found</p>
            <p className="text-gray-500 text-sm">Click "+ New Request" to create one</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getRequestIcon(request.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-semibold">{request.subject}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{request.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>📅 {request.date}</span>
                    <span>🕐 {request.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {requests.length > 0 && (
        <button className="w-full mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
          View All Requests ({requests.length}) →
        </button>
      )}
    </div>
  );
};

export default RequestList;
