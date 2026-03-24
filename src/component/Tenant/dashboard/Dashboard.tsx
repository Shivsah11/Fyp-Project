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

const Dashboard = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchLocation, setSearchLocation] = useState('');
  const [roomStructure, setRoomStructure] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Check if we should navigate to messages from bookings
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location.state]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'rooms', label: 'Explore Rooms' },
    { id: 'bookings', label: 'My Bookings' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Settings' },
  ];

  const recommendedRooms = [
    { id: 1, title: '', price: '', location: '', image: '', rating: 0, beds: 0, baths: 0 },
    { id: 2, title: '', price: '', location: '', image: '', rating: 0, beds: 0, baths: 0 },
  ];

  const recentBookings = [
    { id: 1, room: 'Sunset Apartment - 2 BHK', checkIn: '15 Jan 2024', status: 'Confirmed', price: 'NPR 25,000' },
    { id: 2, room: 'Mountain View Studio', checkIn: '01 Feb 2024', status: 'Confirmed', price: 'NPR 15,000' },
  ];

  const handleInviteFriend = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Invitation sent to ${friendEmail}`);
    setFriendEmail('');
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeSection === item.id
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
                A
              </div>
              <div>
                <p className="text-gray-900 font-semibold">Alex</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <Link
            to="/"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30 flex items-center justify-center gap-2"
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
                {activeSection === 'dashboard' ? 'Welcome Back, Alex' : 
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
                    <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
                  </div>
                  <div className="bg-emerald-500/20 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 h-40 shadow-sm">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">Active Request</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">1</p>
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
              <div className="col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Rooms for you</h3>
                <div className="grid grid-cols-2 gap-4">
                  {recommendedRooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-xl border border-gray-200 h-48 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 shadow-sm">
                      <div className="text-gray-400 text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-xl mx-auto mb-2"></div>
                        <p className="text-sm">Room Preview</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite Friend Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Invite a Friend</h3>
                <form onSubmit={handleInviteFriend} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-center mb-6">
                    <p className="text-gray-600 text-sm mb-2">Get 50 bonus points for each successful referral!</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Friend's Email</label>
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
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30 mb-4"
                  >
                    Send Invitation
                  </button>

                  <div className="flex items-center my-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <span className="px-3 text-xs text-gray-600 font-medium">Or</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>

                  <button
                    type="button"
                    className="w-full bg-white border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:text-gray-900 text-sm"
                  >
                    Copy Referral Link
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-gray-900 font-semibold">{booking.room}</h4>
                        <p className="text-gray-600 text-sm">Booked on {booking.checkIn}</p>
                        <p className="text-gray-900 font-bold">{booking.price}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-400/30">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div className="mt-6">
              <PaymentHistory />
            </div>

            {/* Request List */}
            <div className="mt-6">
              <RequestList />
            </div>
          </div>
        ) : activeSection === 'rooms' ? (
          <ExploreRooms />
        ) : activeSection === 'bookings' ? (
          <BookingsManagement />
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
      />

      {/* Request Modal */}
      <RequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
