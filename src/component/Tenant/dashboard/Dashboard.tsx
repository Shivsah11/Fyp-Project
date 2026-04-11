import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../../context/DarkModeContext';
import PaymentModal from '../payment/PaymentModal';
import PaymentHistory from '../payment/PaymentHistory';
import RequestModal from '../request/RequestModal';
import RequestList from '../request/RequestList';
import ExploreRooms from '../rooms/ExploreRooms';
import BookingsManagement from '../bookings/BookingsManagement';
import MessagesManagement from '../messages/MessagesManagement';
import SettingsManagement from '../settings/SettingsManagement';
import { NotificationProvider } from '../../../context/NotificationContext';
import type { Notification } from '../../../context/NotificationContext';
import NotificationDropdown from '../../Shared/NotificationDropdown';

interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

const Dashboard = () => {
  const { isDarkMode } = useDarkMode();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [friendEmail, setFriendEmail] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [recommendedRooms, setRecommendedRooms] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ daysUntilRent: 0, activeRequests: 0, currentRoom: 'None' });
  const [userName, setUserName] = useState('Alex');
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
          setUserName('Guest');
          return;
        }

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
          setPayments(payments || []);
        } else {
          console.error('Failed to fetch dashboard data:', response.statusText);
          // Clear data if authentication fails
          setUserName('User');
          setStats({ daysUntilRent: 0, activeRequests: 0, currentRoom: 'None' });
          setRecentBookings([]);
          setRecommendedRooms([]);
          setPayments([]);
        }
      } catch (error) {
        console.error('Fetch dashboard data error:', error);
        // Clear all data on error to prevent data leakage
        setUserName('User');
        setStats({ daysUntilRent: 0, activeRequests: 0, currentRoom: 'None' });
        setRecentBookings([]);
        setRecommendedRooms([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Initialize referral code and coins from user-specific localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create user-specific storage keys
    const userId = JSON.parse(atob(token.split('.')[1])).userId; // Extract userId from JWT token
    const userReferralKey = `referralCode_${userId}`;
    const userCoinsKey = `userCoins_${userId}`;
    const referralEarnedKey = `coins_for_${userId}`;

    let code = localStorage.getItem(userReferralKey);
    if (!code) {
      code = 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase();
      localStorage.setItem(userReferralKey, code);
    }
    setReferralCode(code);

    // Sync any referral-earned coins into the main userCoins balance
    const referralEarned = parseInt(localStorage.getItem(referralEarnedKey) || '0', 10);
    if (referralEarned > 0) {
      const existing = parseInt(localStorage.getItem(userCoinsKey) || '0', 10);
      const total = existing + referralEarned;
      localStorage.setItem(userCoinsKey, String(total));
      localStorage.removeItem(referralEarnedKey); // Consume the earned coins
      setCoins(total);
    } else {
      const storedCoins = parseInt(localStorage.getItem(userCoinsKey) || '0', 10);
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
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create user-specific payment storage
    const userId = JSON.parse(atob(token.split('.')[1])).userId;
    const userPaymentsKey = `userPayments_${userId}`;

    const newPayment: Payment = {
      id: (payments.length + 1).toString(),
      amount: parseFloat(amount),
      method: 'eSewa',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      description: `Payment via eSewa (${esewaNumber})`
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);

    // Store in user-specific localStorage
    localStorage.setItem(userPaymentsKey, JSON.stringify(updatedPayments));
  };

  const handleDeletePayment = (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Create user-specific payment storage
    const userId = JSON.parse(atob(token.split('.')[1])).userId;
    const userPaymentsKey = `userPayments_${userId}`;

    const updatedPayments = payments.filter(payment => payment.id !== id);
    setPayments(updatedPayments);

    // Update user-specific localStorage
    localStorage.setItem(userPaymentsKey, JSON.stringify(updatedPayments));
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
    <NotificationProvider userType="tenant">
      <div className={`min-h-screen w-screen flex flex-col relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

      {/* Animated background elements - Tenant Theme (Emerald/Teal) */}
      <div className="absolute inset-0 fixed pointer-events-none">
        <div className={`absolute top-20 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse ${isDarkMode ? 'bg-emerald-900/10' : 'bg-emerald-100/30'}`}></div>
        <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000 ${isDarkMode ? 'bg-teal-900/10' : 'bg-teal-100/30'}`}></div>
      </div>

      {/* Top Navbar - Fixed & Opaque */}
      <nav className={`relative z-20 w-full backdrop-blur-xl border-b ${isDarkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'} px-6 py-4 flex items-center justify-between shadow-sm sticky top-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600'}`}>
            SUITE DREAMS
          </h1>
          <span className={`text-xs px-2 py-1 rounded-full font-bold ml-2 ${isDarkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>Tenant</span>
        </div>

        {/* Navigation Items - Centered Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto mx-4 no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeSection === item.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md transform scale-[1.05] border border-emerald-400/30'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-800 border border-transparent'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Coins Badge */}
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200 shadow-sm'}`}>
              <span className="text-yellow-500 text-sm">🪙</span>
              <span className={`text-xs font-black ${isDarkMode ? 'text-yellow-500' : 'text-yellow-700'}`}>{coins}</span>
            </div>

            <div className={`text-right hidden md:block`}>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{userName}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white/20">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          
          {/* Notification Button Group - Right Side */}
          <div className="flex items-center gap-2">
            <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <NotificationDropdown />
            <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>

          <Link
            to="/"
            className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-red-400' : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'}`}
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className={`flex-1 relative z-10 overflow-x-hidden overflow-y-auto ${isDarkMode ? 'bg-transparent' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto w-full pb-12">

          {/* Header Section for Active Tab */}
          {activeSection === 'dashboard' && (
            <div className="px-6 pt-12 mb-10 flex items-center justify-between">
              <div>
                <h2 className={`text-5xl font-black italic tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome back, {userName}
                </h2>
                <p className={`text-sm mt-3 font-bold uppercase tracking-widest ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>
                  Here's what's happening with your accommodation.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1"
                >
                  Make Payment
                </button>
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 border ${isDarkMode
                      ? 'bg-gray-800 text-emerald-400 border-gray-700 hover:bg-gray-700'
                      : 'bg-white text-emerald-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  + New Request
                </button>
              </div>
            </div>
          )}

          {/* Content based on active section */}
          {activeSection === 'dashboard' ? (
            <div className="px-6">
              {/* Square Info Cards - Forced single row */}
              <div className="flex flex-row gap-6 mb-8 w-full">
                <div className={`flex-1 rounded-2xl p-6 h-40 shadow-sm border transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Days until Rent</p>
                      <p className={`text-4xl font-black mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{stats.daysUntilRent || 0}</p>
                    </div>
                    <div className="bg-emerald-500/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>

                <div className={`flex-1 rounded-2xl p-6 h-40 shadow-sm border transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Request</p>
                      <p className={`text-4xl font-black mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{stats.activeRequests || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-400/20">Pending Action</span>
                    </div>
                  </div>
                </div>

                <div className={`flex-1 rounded-2xl p-6 h-40 shadow-sm border transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Room</p>
                      <p className={`text-2xl font-black mt-2 truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{stats.currentRoom || 'None'}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-400/20">Active Lease</span>
                    </div>
                  </div>
                </div>
              </div>


              <div className="grid grid-cols-2 gap-8 mb-8 items-start">
                {/* Recommended Rooms Section */}
                <div className={`rounded-3xl p-8 shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recommended Rooms</h3>
                    <button onClick={() => setActiveSection('rooms')} className={`text-sm font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>See All</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {recommendedRooms && recommendedRooms.length > 0 ? recommendedRooms.slice(0, 4).map((room) => (
                      <div key={room.id} className={`rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-500 group ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-100'}`}>
                        <div className="h-32 relative overflow-hidden">
                          {room.image ? (
                            <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-4xl">🏠</div>
                          )}
                          <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-black shadow-lg ${isDarkMode ? 'bg-gray-900/90 text-yellow-400' : 'bg-white/90 text-yellow-600'}`}>
                            ★ {room.rating || '4.5'}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className={`font-bold text-sm truncate mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{room.title}</h4>
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{room.location}</p>
                            <p className="text-emerald-500 font-black text-sm">{room.price}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-gray-500 font-medium italic">No listings to show right now.</div>
                    )}
                  </div>
                </div>

                {/* Invite Friend Section */}
                <div className={`rounded-3xl p-8 shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Invite a Friend</h3>
                  <p className="text-emerald-500 text-sm font-bold mb-6">Earn 50 coins for every friend!</p>

                  {/* Referral Link Box */}
                  <div className="mb-6 space-y-2">
                    <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>REFERRAL LINK</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : 'Loading...'}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-mono font-medium focus:outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${referralCode}`);
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${linkCopied ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}
                      >
                        {linkCopied ? 'COPIED' : 'COPY'}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleInviteFriend} className="space-y-4">
                    <div className="space-y-2">
                      <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>SEND INVITATION</label>
                      <input
                        type="email"
                        placeholder="friend@email.com"
                        value={friendEmail}
                        onChange={(e) => setFriendEmail(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className={`w-full py-3 rounded-xl font-black text-sm tracking-wide transition-all duration-300 transform hover:scale-[1.02] ${inviteSent ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'}`}
                    >
                      {inviteSent ? 'SENT SUCCESS!' : 'SEND EMAIL INVITE'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Recent Bookings */}
                <div className={`rounded-3xl border p-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recent Activity</h3>
                    <button onClick={handleViewAllBookings} className={`text-sm font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>View All</button>
                  </div>
                  <div className="space-y-4">
                    {recentBookings && recentBookings.length > 0 ? recentBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className={`rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50/80 border-gray-100 hover:bg-white hover:shadow-md'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 text-xl font-bold">BK</div>
                            <div>
                              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{booking.room || booking.propertyName || 'Property Booking'}</h4>
                              <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Booked: {booking.checkIn || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-600 mb-1">{booking.price || 'NPR 0'}</p>
                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700' : 'bg-emerald-500/10 text-emerald-600 border-emerald-200'}`}>
                              {booking.status || 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 opacity-50 font-bold italic">No bookings found.</div>
                    )}
                  </div>
                </div>

                {/* Simplified Payment History */}
                <div className="flex flex-col h-full">
                  <PaymentHistory payments={payments} onDeletePayment={handleDeletePayment} onViewAllPayments={handleViewAllPayments} limit={3} />
                </div>
              </div>

              {/* Request List */}
              <div className="mb-12">
                <RequestList refreshKey={requestRefreshKey} />
              </div>
            </div>
          ) : activeSection === 'rooms' ? (
            <ExploreRooms />
          ) : activeSection === 'bookings' ? (
            <BookingsManagement />
          ) : activeSection === 'payments' ? (
            <div className="px-6">
              <PaymentHistory payments={payments} onDeletePayment={handleDeletePayment} />
            </div>
          ) : activeSection === 'messages' ? (
            <MessagesManagement />
          ) : activeSection === 'settings' ? (
            <SettingsManagement />
          ) : (
            <div className="px-6">
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed dark:border-gray-700">
                <div className="text-6xl mb-6">🛠️</div>
                <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Section Under Construction</h3>
                <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>The {activeSection} experience will be ready soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals - Standardized */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handleAddPayment}
      />
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onRequestAdded={handleRequestAdded}
      />

      {/* Label Map for UI headers */}
      {(() => {
        (window as any).itemLabelMap = {
          'dashboard': 'Dashboard',
          'rooms': 'Explore Rooms',
          'bookings': 'My Bookings',
          'payments': 'Payments',
          'messages': 'Messages',
          'settings': 'Settings'
        };
        return null;
      })()}
    </div>
    </NotificationProvider>
  );
};

export default Dashboard;
