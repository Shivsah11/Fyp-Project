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
    <div className="min-h-screen w-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex flex-col relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 fixed">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 w-full px-6 py-6 bg-white/5 backdrop-blur-xl rounded-b-3xl shadow-2xl border-b border-white/10">
        <h2 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">
          SUITE DREAMS - ADMIN
        </h2>
      </div>

      {/* Admin Login Card */}
      <div className="relative z-10 flex items-center justify-center flex-1 min-h-[calc(100vh-120px)] py-8 px-4">
        <form onSubmit={handleAdminLogin} className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl px-8 py-10 border border-white/20">

          {/* Admin Login Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👑</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">
              Admin Login
            </h3>
            <p className="text-purple-200">
              Enter administrator credentials to access system controls
            </p>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-purple-100 mb-2">Admin Email</label>
            <input
              type="email"
              placeholder="admin@suitedreams.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-white placeholder-purple-200/60 hover:bg-white/15"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-purple-100 mb-2">Admin Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-white placeholder-purple-200/60 hover:bg-white/15"
              required
            />
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-purple-400/30"
          >
            Access Admin Panel
          </button>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-400/20">
            <p className="text-purple-200 text-sm text-center">
              <span className="font-semibold">🔒 Secure Access:</span> This login is for authorized administrators only. All access attempts are logged.
            </p>
          </div>

          {/* Back to User Login */}
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
            >
              ← Back to User Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
