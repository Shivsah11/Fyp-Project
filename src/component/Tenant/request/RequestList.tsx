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

const RequestList = ({ refreshKey }: { refreshKey?: number }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');

  const loadRequests = () => {
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
  };

  useEffect(() => {
    loadRequests();
  }, [refreshKey]);

  const handleDelete = (id: string) => {
    const updated = requests.filter(r => r.id !== id);
    setRequests(updated);
    localStorage.setItem('tenantRequests', JSON.stringify(updated));
  };

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
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRequests = requests.filter(request => 
    filter === 'all' || request.status === filter
  );

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">My Requests</h3>
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
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
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
            <p className="text-gray-500">No requests found</p>
            <p className="text-gray-400 text-sm">Click "+ New Request" to create one</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-all duration-300 group">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getRequestIcon(request.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-gray-800 font-semibold">{request.subject}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 {request.date}</span>
                    <span>🕐 {request.time}</span>
                  </div>
                </div>
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(request.id)}
                  title="Delete request"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {requests.length > 0 && (
        <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
          View All Requests ({requests.length}) →
        </button>
      )}
    </div>
  );
};

export default RequestList;
