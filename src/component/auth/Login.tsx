import { Link, useNavigate } from "react-router-dom";
import React, { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset messages
    setError('');
    setSuccess('');

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
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
        setSuccess(data.message || 'Login successful!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please ensure the backend is running.');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col relative overflow-y-auto">

      {/* Clean light background */}
      <div className="absolute inset-0 fixed bg-gray-50"></div>

      {/* Login Card wrapper */}
      <div className="relative z-10 flex items-center justify-center flex-1 min-h-screen py-8 px-4">
        <form onSubmit={handleLogin} className="w-full max-w-lg bg-white rounded-3xl shadow-lg px-10 py-12 border border-gray-200">

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome Back!
            </h3>
            <p className="text-gray-600">
              Enter your email and password to access your Suite Dreams account
            </p>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 hover:bg-gray-100"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 hover:bg-gray-100"
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-sm mb-8">
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-400 bg-white border-gray-300" />
              Remember me
            </label>
            <Link to="/forgot-password" data-id="forgot-password-link" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                {success}
              </div>
            </div>
          )}

          {/* Login Button */}
          <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-teal-400/30">
            Log In
          </button>



          {/* Sign up link */}
          <p className="text-gray-700 text-center">
            New to Suite Dreams?{" "}
            <Link to="/signup" className="font-bold text-teal-600 hover:text-teal-700 transition-colors">
              Create an account
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Login;
