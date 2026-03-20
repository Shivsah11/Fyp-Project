import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./component/auth/Login";
import Signup from "./component/auth/SignUp";
import AdminLogin from "./component/admin/AdminLogin";
import AdminDashboard from "./component/admin/AdminDashboard";
import TenantDashboard from "./component/Tenant/dashboard/Dashboard";
import LandlordDashboard from "./component/Landlord/dashboard/LandlordDashboard";

// Route Guard Component
const PrivateRoute = ({ children, requiredRole }: { children: React.ReactElement, requiredRole: string }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and get their role
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    
    if (token && storedRole) {
      setUserRole(storedRole);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={
      userRole === 'Tenant' ? '/tenant/dashboard' : 
      userRole === 'Admin' ? '/admin/dashboard' : 
      '/landlord/dashboard'
    } replace />;
  }

  return children;
};

function App() {
  const getDashboardRoute = () => {
    const role = localStorage.getItem('userRole');
    return role === 'Tenant' ? '/tenant/dashboard' : 
           role === 'Admin' ? '/admin/dashboard' : 
           '/landlord/dashboard';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Tenant Routes */}
        <Route 
          path="/tenant/dashboard" 
          element={
            <PrivateRoute requiredRole="Tenant">
              <TenantDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Landlord Routes */}
        <Route 
          path="/landlord/dashboard" 
          element={
            <PrivateRoute requiredRole="Landlord">
              <LandlordDashboard />
            </PrivateRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute requiredRole="Admin">
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Default dashboard route - redirect based on stored role */}
        <Route 
          path="/dashboard" 
          element={<Navigate to={getDashboardRoute()} replace />} 
        />
        
        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
