import { Link, useNavigate } from "react-router-dom";
import React, { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user role in localStorage
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userName', `${data.user.firstName} ${data.user.lastName}`);
        }
        alert(data.message);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Server error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex flex-col relative overflow-y-auto">

      {/* Animated background elements */}
      <div className="absolute inset-0 fixed">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 w-full px-6 py-6 bg-white/5 backdrop-blur-xl rounded-b-3xl shadow-2xl border-b border-white/10">
        <h2 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">
          SUITE DREAMS
        </h2>
      </div>

      {/* Login Card wrapper */}
      <div className="relative z-10 flex items-center justify-center flex-1 min-h-[calc(100vh-120px)] py-8 px-4">
        <form onSubmit={handleLogin} className="w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl px-10 py-12 border border-white/20">

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-3">
              Welcome Back!
            </h3>
            <p className="text-emerald-100">
              Enter your email and password to access your Suite Dreams account
            </p>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-emerald-100 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-white placeholder-emerald-200/60 hover:bg-white/15"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-emerald-100 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-white placeholder-emerald-200/60 hover:bg-white/15"
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-sm mb-8">
            <label className="flex items-center gap-2 text-emerald-100">
              <input type="checkbox" className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-400 bg-white/10 border-white/20" />
              Remember me
            </label>
            <a href="#" className="text-emerald-300 hover:text-emerald-200 font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30">
            Log In
          </button>

          {/* Admin Login Button */}
          <div className="mt-6 text-center">
            <a 
              href="/admin/login" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white rounded-xl font-medium transition-all duration-300 border border-purple-400/20 hover:border-purple-400/40"
            >
              <span>👑</span>
              <span>Admin Login</span>
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent"></div>
            <span className="px-4 text-sm text-emerald-200/70 font-medium">Or continue with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent"></div>
          </div>

          {/* Google Button */}
          <button type="button" className="w-full bg-white/10 border border-white/20 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3 text-emerald-100 hover:border-white/30 mb-8">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Sign up link */}
          <p className="text-emerald-100 text-center">
            New to Suite Dreams?{" "}
            <Link to="/signup" className="font-bold text-emerald-300 hover:text-emerald-200 transition-colors">
              Create an account
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Login;
