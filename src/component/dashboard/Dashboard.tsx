import { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [location, setLocation] = useState('');
  const [roomStructure, setRoomStructure] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [friendEmail, setFriendEmail] = useState('');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'rooms', label: 'Explore Rooms', icon: '🏠' },
    { id: 'bookings', label: 'My Bookings', icon: '📅' },
    { id: 'messages', label: 'Messages', icon: '�' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const recommendedRooms = [
    { id: 1, title: '', price: '', location: '', image: '', rating: 0, beds: 0, baths: 0 },
    { id: 2, title: '', price: '', location: '', image: '', rating: 0, beds: 0, baths: 0 },
  ];

  const recentBookings = [
    { id: 1, room: '2 BHK', checkIn: '23 Jun 2025', status: 'Confirmed', price: 'NPR 30000' },
  ];

  const handleInviteFriend = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Invitation sent to ${friendEmail}`);
    setFriendEmail('');
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">

      {/* Animated background elements - matching signup theme */}
      <div className="absolute inset-0 fixed">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <div className="relative z-10 w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 min-h-screen">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/20">
          <h1 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">
            SUITE DREAMS
          </h1>
          <p className="text-gray-300 text-sm mt-1">Tenant Portal</p>
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
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-[1.02] border border-purple-400/50'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white border border-white/20'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-20 left-6 right-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                A
              </div>
              <div>
                <p className="text-white font-semibold">Alex</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <Link
            to="/"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-purple-500/30 flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-1 tracking-wide drop-shadow-lg">Welcome Back, Alex</h2>
            </div>
            <div className="flex gap-3">
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-purple-500/30">
                Make Payment
              </button>
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-purple-500/30">
                + New Request
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Square Info Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 h-40">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <p className="text-gray-300 text-sm font-semibold">Days until Rent</p>
                  <p className="text-3xl font-bold text-white mt-2">24</p>
                </div>
                <div className="bg-purple-500/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full" style={{width: '80%'}}></div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 h-40">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <p className="text-gray-300 text-sm font-semibold">Active Request</p>
                  <p className="text-3xl font-bold text-white mt-2">1</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-400/30">request</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 mb-6">
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Location where Do You Want"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm hover:bg-white/15"
              />
              <input
                type="text"
                placeholder="Room structure"
                value={roomStructure}
                onChange={(e) => setRoomStructure(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm hover:bg-white/15"
              />
              <input
                type="text"
                placeholder="Price Range"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm hover:bg-white/15"
              />
            </div>
            <div className="flex justify-center mt-3">
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-purple-500/30">
                🔍
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Recommended Rooms */}
            <div className="col-span-2">
              <h3 className="text-lg font-bold text-white mb-4">Recommended Rooms for you</h3>
              <div className="grid grid-cols-2 gap-4">
                {recommendedRooms.map((room) => (
                  <div key={room.id} className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 h-48 flex items-center justify-center hover:bg-white/15 transition-all duration-300">
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
              <h3 className="text-lg font-bold text-white mb-4">Invite a Friend</h3>
              <form onSubmit={handleInviteFriend} className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                <div className="text-center mb-6">
                  <p className="text-white/80 text-sm mb-2">Get 50 bonus points for each successful referral!</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-white/80 mb-2">Friend's Email</label>
                  <input
                    type="email"
                    placeholder="friend@example.com"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/60 hover:bg-white/15"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-purple-500/30 mb-4"
                >
                  Send Invitation 🎁
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <span className="px-3 text-xs text-white/60 font-medium">Or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                <button
                  type="button"
                  className="w-full bg-white/10 border border-white/20 py-2 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 text-white/80 hover:text-white text-sm"
                >
                  Copy Referral Link
                </button>
              </form>
            </div>
          </div>

          {/* Recent Booking */}
          <div className="mt-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent booking</h3>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">{recentBookings[0].room}</h4>
                  <p className="text-gray-400 text-sm">Booked on {recentBookings[0].checkIn}</p>
                  <p className="text-white font-bold">{recentBookings[0].price}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-400/30">
                    {recentBookings[0].status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
