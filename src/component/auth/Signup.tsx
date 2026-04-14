import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState } from "react";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check for referral code in URL
  const refCode = new URLSearchParams(location.search).get('ref') || '';

  // --- Form states ---
  const [role, setRole] = useState<"Tenant" | "Landlord">("Tenant");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // --- Handle form submission ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload

    // Reset messages
    setError("");
    setSuccess("");

    // Password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Simple email validation
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          ref: refCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user role in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', role);
          // NEW: Store coins and referral code from backend if available
          if (data.user?.coins !== undefined) localStorage.setItem('userCoins', String(data.user.coins));
          if (data.user?.referralCode) localStorage.setItem('referralCode', data.user.referralCode);
        }

        setSuccess(data.message || "Account created successfully!");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError(data.message || "Signup failed. Please check your information.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Network error. Please ensure the backend is running.");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col relative overflow-y-auto">

      {/* Clean light background */}
      <div className="absolute inset-0 fixed bg-gray-50"></div>

      {/* Signup Form Card */}
      <div className="relative z-10 flex items-center justify-center flex-1 min-h-screen py-8 px-4">
        <form
          onSubmit={handleSignup}
          className="w-full max-w-lg bg-white rounded-3xl shadow-lg px-10 py-12 border border-gray-200"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Join Suite Dreams
            </h2>
            <p className="text-gray-600">
              Create your account and start your journey with us
            </p>
          </div>

          {/* Role selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4">I am a:</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("Tenant")}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${role === "Tenant"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg transform scale-[1.02] border border-teal-400/30"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  Tenant
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("Landlord")}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${role === "Landlord"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg transform scale-[1.02] border border-teal-400/30"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Landlord
                </span>
              </button>
            </div>
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                placeholder="John"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 hover:bg-gray-100"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 hover:bg-gray-100"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 hover:bg-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 hover:bg-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 hover:bg-gray-100"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 mb-8">
            <input
              type="checkbox"
              required
              className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-400 mt-1 bg-white border-gray-300"
            />
            <p className="text-sm text-gray-700">
              I agree to the <a href="#" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">Terms of Service</a> and <a href="#" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">Privacy Policy</a>
            </p>
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-teal-400/30"
          >
            Create Account
          </button>


          {/* Login Link */}
          <p className="text-gray-700 text-center">
            Already have an account?{" "}
            <Link to="/" className="font-bold text-teal-600 hover:text-teal-700 transition-colors">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
