import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";

const Signup = () => {
  const navigate = useNavigate();

  // --- Form states ---
  const [role, setRole] = useState<"Tenant" | "Landlord">("Tenant");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // --- Handle form submission ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload

    // Password validation
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Simple email validation (optional)
    if (!email.includes("@")) {
      alert("Enter a valid email");
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user role in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', role);
        }
        alert(data.message); // Show success message
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Network error. Please check your connection.");
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
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  role === "Tenant" 
                    ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg transform scale-[1.02] border border-teal-400/30" 
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                  Tenant
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole("Landlord")}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  role === "Landlord" 
                    ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg transform scale-[1.02] border border-teal-400/30" 
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-teal-400/30"
          >
            Create Account
          </button>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 font-medium">Or continue with</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full bg-gray-50 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-3 text-gray-700 hover:border-gray-400 mb-8"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
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
