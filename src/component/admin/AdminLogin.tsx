import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'Admin') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userName', `${data.user.firstName} ${data.user.lastName}`);
        navigate('/admin/dashboard');
      } else {
        alert(data.message || 'Admin login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      alert('Server error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
      
      {/* Enhanced animated background with professional lighting */}
      <div className="absolute inset-0 fixed">
        {/* Primary light source - top left */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-transparent rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        {/* Secondary light source - bottom right */}
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-purple-600/20 via-pink-500/15 to-transparent rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-2000"></div>
        {/* Ambient light - center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-4000"></div>
        {/* Moving light beam */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-amber-400/5 to-transparent rounded-full mix-blend-screen filter blur-2xl animate-bounce"></div>
      </div>

      {/* Enhanced Top Bar with glassmorphism */}
      <div className="relative z-10 w-full px-6 py-6 bg-gradient-to-r from-white/8 via-white/5 to-white/8 backdrop-blur-xl rounded-b-3xl shadow-2xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wide drop-shadow-lg">
              SUITE DREAMS - ADMIN
            </h2>
            <p className="text-cyan-200/70 text-sm mt-1 font-medium">Enterprise Management Portal</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="text-green-400 text-sm font-medium">System Online</span>
          </div>
        </div>
      </div>

      {/* Admin Login Card */}
      <div className="relative z-10 flex items-center justify-center flex-1 min-h-[calc(100vh-120px)] py-8 px-4">
        <form onSubmit={handleAdminLogin} className="w-full max-w-md bg-gradient-to-br from-white/10 via-white/8 to-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl px-8 py-10 border border-white/20 relative overflow-hidden animate-fade-in-scale">
          
          {/* Subtle border glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-sm"></div>
          
          {/* Content */}
          <div className="relative z-10">

          {/* Enhanced Admin Login Header */}
          <div className="text-center mb-8 animate-slide-in-top">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/20 border border-white/10 animate-glow">
              <span className="text-5xl filter drop-shadow-lg">👑</span>
            </div>
            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-3">
              Admin Portal
            </h3>
            <p className="text-cyan-200/80 font-medium">
              Secure access to system controls
            </p>
          </div>

          {/* Enhanced Email */}
          <div className="mb-6 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            <label className="block text-sm font-semibold text-cyan-100 mb-2">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@suitedreams.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-white placeholder-cyan-200/50 hover:bg-white/15 focus:from-white/15 focus:to-white/10 shadow-lg smooth-transition"
                required
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl blur-sm pointer-events-none"></div>
            </div>
          </div>

          {/* Enhanced Password */}
          <div className="mb-6 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            <label className="block text-sm font-semibold text-cyan-100 mb-2">Admin Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 text-white placeholder-cyan-200/50 hover:bg-white/15 focus:from-white/15 focus:to-white/10 shadow-lg smooth-transition"
                required
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl blur-sm pointer-events-none"></div>
            </div>
          </div>

          {/* Enhanced Login Button */}
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-[1.02] shadow-2xl border border-white/20 relative overflow-hidden group animate-slide-in-left hover-lift"
            style={{animationDelay: '0.3s'}}
          >
            <span className="relative z-10">Access Admin Panel</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Enhanced Security Notice */}
          <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-cyan-400/20 backdrop-blur-sm">
            <p className="text-cyan-200/90 text-sm text-center font-medium">
              <span className="font-bold text-cyan-300">🔒 Secure Access:</span> Authorized personnel only. All activities are monitored and logged.
            </p>
          </div>

          {/* Enhanced Back to User Login */}
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors duration-300 inline-flex items-center gap-2 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
              Back to User Login
            </a>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
