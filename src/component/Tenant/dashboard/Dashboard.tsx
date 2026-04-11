import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PaymentModal from '../payment/PaymentModal';
import PaymentHistory from '../payment/PaymentHistory';
import RequestModal from '../request/RequestModal';
import RequestList from '../request/RequestList';
import ExploreRooms from '../rooms/ExploreRooms';
import BookingsManagement from '../bookings/BookingsManagement';
import MessagesManagement from '../messages/MessagesManagement';
import SettingsManagement from '../settings/SettingsManagement';

interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

const Dashboard = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchLocation, setSearchLocation] = useState('');
  const [roomStructure, setRoomStructure] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [recommendedRooms, setRecommendedRooms] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ daysUntilRent: 0, activeRequests: 0, currentRoom: 'None' });
  const [userName, setUserName] = useState('Alex');
  const [loading, setLoading] = useState(true);
  const [requestRefreshKey, setRequestRefreshKey] = useState(0);
  const [coins, setCoins] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Load any locally stored payments (from PaymentSuccess page)
        const localPayments: Payment[] = JSON.parse(localStorage.getItem('pendingPayments') || '[]');

        const response = await fetch('http://localhost:5000/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          const { user, stats, recentBookings, recommendedRooms, payments } = result.data;
          setUserName(user?.firstName || 'User');
          setStats(stats || { daysUntilRent: 0, activeRequests: 0, currentRoom: 'None' });
          setRecentBookings(recentBookings || []);
          setRecommendedRooms(recommendedRooms || []);

          // Merge local payments with backend payments, backend takes priority (no duplicates by id)
          const backendIds = new Set((payments || []).map((p: Payment) => p.id));
          const uniqueLocalPayments = localPayments.filter(p => !backendIds.has(p.id));
          setPayments([...uniqueLocalPayments, ...(payments || [])]);
        } else {
          // Backend failed — at least show local payments
          if (localPayments.length > 0) {
            setPayments(localPayments);
          }
        }
      } catch (error) {
        console.error('Fetch dashboard data error:', error);
        // Even if backend is down, show locally stored payments
        const localPayments: Payment[] = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
        if (localPayments.length > 0) {
          setPayments(localPayments);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Initialize referral code and coins from localStorage
  useEffect(() => {
    let code = localStorage.getItem('referralCode');
    if (!code) {
      code = 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase();
      localStorage.setItem('referralCode', code);
    }
    setReferralCode(code);

    // Sync any referral-earned coins into the main userCoins balance
    const referralEarned = parseInt(localStorage.getItem(`coins_for_${code}`) || '0', 10);
    if (referralEarned > 0) {
      const existing = parseInt(localStorage.getItem('userCoins') || '0', 10);
      const total = existing + referralEarned;
      localStorage.setItem('userCoins', String(total));
      localStorage.removeItem(`coins_for_${code}`); // Consume the earned coins
      setCoins(total);
    } else {
      const storedCoins = parseInt(localStorage.getItem('userCoins') || '0', 10);
      setCoins(storedCoins);
    }
  }, []);

  // Check if we should navigate to messages from bookings
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location.state]);

  // Check for tab query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveSection(tab);
    }
  }, [location.search]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'rooms', label: 'Explore Rooms' },
    { id: 'bookings', label: 'My Bookings' },
    { id: 'payments', label: 'Payments' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Settings' },
  ];



  const handleInviteFriend = (e: React.FormEvent) => {
    e.preventDefault();
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    const subject = encodeURIComponent('You are invited to Suite Dreams!');
    const body = encodeURIComponent(
      `Hey!\n\nI'm inviting you to join Suite Dreams — a great platform for finding rental accommodation.\n\nUse my referral link to sign up and we both get rewards!\n\n${referralLink}\n\nSee you there!`
    );
    // Open Gmail compose window directly
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(friendEmail)}&su=${subject}&body=${body}`,
      '_blank'
    );
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
    setFriendEmail('');
  };

  const handleAddPayment = (amount: string, esewaNumber: string) => {
    const newPayment: Payment = {
      id: (payments.length + 1).toString(),
      amount: parseFloat(amount),
      method: 'eSewa',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      description: `Payment via eSewa (${esewaNumber})`
    };
    setPayments([newPayment, ...payments]);
  };

  const handleDeletePayment = (id: string) => {
    setPayments(payments.filter(payment => payment.id !== id));
  };

  const handleRequestAdded = () => {
    setRequestRefreshKey(prev => prev + 1);
  };

  const handleViewAllBookings = () => {
    setActiveSection('bookings');
  };

  const handleViewAllPayments = () => {
    setActiveSection('payments');
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex relative overflow-hidden">

      {/* Sidebar */}
      <div className="relative z-10 w-64 bg-white border-r border-gray-200 min-h-screen shadow-sm">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-wide drop-shadow-lg">
            SUITE DREAMS
          </h1>
          <p className="text-gray-700 text-sm mt-1">Tenant Portal</p>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeSection === item.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-[1.02] border border-emerald-400/30'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-20 left-6 right-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-semibold">{userName}</p>
              </div>
              {/* Coins Badge */}
              <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-full px-2 py-1">
                <span className="text-yellow-500 text-sm">🪙</span>
                <span className="text-yellow-700 text-xs font-bold">{coins}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <Link
            to="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-300 flex items-center justify-center gap-2"
          >
            <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 overflow-y-auto bg-white">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-wide drop-shadow-lg">
                {activeSection === 'dashboard' ? `Welcome Back, ${userName}` :
                  activeSection === 'rooms' ? 'Explore Rooms' :
                    activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </h2>
            </div>
            {activeSection === 'dashboard' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
                >
                  Make Payment
                </button>
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
                >
                  + New Request
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content based on active section */}
        {activeSection === 'dashboard' ? (
          <div className="p-6">
            {/* Square Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 h-40 shadow-sm">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">Days until Rent</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.daysUntilRent || 0}</p>
                  </div>
                  <div className="bg-emerald-500/20 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 h-40 shadow-sm">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">Active Request</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeRequests || 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-400/30">request</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 shadow-sm">
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Location where Do You Want"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-sm hover:bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="Room structure"
                  value={roomStructure}
                  onChange={(e) => setRoomStructure(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-sm hover:bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="Price Range"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-sm hover:bg-gray-50"
                />
              </div>
              <div className="flex justify-center mt-3">
                <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30">
                  Search
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Recommended Rooms */}
              <div className="col-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Rooms for you</h3>
                <div className="grid grid-cols-2 gap-4">
                  {recommendedRooms && recommendedRooms.length > 0 ? recommendedRooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
                      <div className="h-24 bg-gray-100 relative overflow-hidden">
                        {room.image ? (
                          <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">🏢</div>
                        )}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 shadow-sm">
                          ★ {room.rating || '4.5'}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{room.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-gray-500 text-xs truncate">{room.location}</p>
                          <p className="text-emerald-600 font-bold text-xs">{room.price}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center text-gray-500 py-8">
                      No recommended rooms available.
                    </div>
                  )}
                </div>
              </div>

              {/* Invite Friend Section */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Invite a Friend</h3>
                <p className="text-emerald-600 text-sm font-medium mb-4">Get 50 bonus coins for each successful referral!</p>

                {/* Coins Display */}
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4">
                  <span className="text-gray-700 text-sm font-medium">Your Total Coins</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-lg">🪙</span>
                    <span className="text-yellow-700 font-bold text-lg">{coins}</span>
                  </div>
                </div>

                {/* Referral Link Box */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Referral Link</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : 'Loading...'}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const link = `${window.location.origin}/signup?ref=${referralCode}`;
                        navigator.clipboard.writeText(link);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2000);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                        linkCopied
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-900 text-white hover:bg-gray-700'
                      }`}
                    >
                      {linkCopied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleInviteFriend}>
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Send to Friend's Email</label>
                    <input
                      type="email"
                      placeholder="friend@example.com"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500 hover:bg-gray-50"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                      inviteSent
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                    }`}
                  >
                    {inviteSent ? '✓ Invitation Sent!' : 'Send Invitation'}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
                {recentBookings && recentBookings.length > 3 && (
                  <button
                    onClick={handleViewAllBookings}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                  >
                    View All Recent Bookings
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {recentBookings && recentBookings.length > 0 ? recentBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:bg-gray-100 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-gray-900 font-semibold">{booking.room || booking.propertyName || 'Property Booking'}</h4>
                        <p className="text-gray-600 text-sm">Booked on {booking.checkIn || 'Not specified'}</p>
                        <p className="text-gray-900 font-bold">{booking.price || 'NPR 0'}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-400/30">
                          {booking.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg border border-gray-100">
                    No recent bookings found.
                  </div>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className="mt-6">
              <PaymentHistory payments={payments} onDeletePayment={handleDeletePayment} onViewAllPayments={handleViewAllPayments} limit={3} />
            </div>

            {/* Request List */}
            <div className="mt-6">
              <RequestList refreshKey={requestRefreshKey} />
            </div>
          </div>
        ) : activeSection === 'rooms' ? (
          <ExploreRooms />
        ) : activeSection === 'bookings' ? (
          <BookingsManagement />
        ) : activeSection === 'payments' ? (
          <div className="p-6">
            <PaymentHistory payments={payments} onDeletePayment={handleDeletePayment} />
          </div>
        ) : activeSection === 'messages' ? (
          <MessagesManagement />
        ) : activeSection === 'settings' ? (
          <SettingsManagement />
        ) : (
          <div className="p-6">
            <div className="text-center py-16">
              <div className="text-6xl mb-4">Coming Soon</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-700">The {activeSection} section is under development</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handleAddPayment}
      />

      {/* Request Modal */}
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onRequestAdded={handleRequestAdded}
      />
    </div>
  );
};

export default Dashboard;
