import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Home, Package, DollarSign } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white p-2 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-xl font-bold">Provider Portal</span>
          </Link>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 hover:text-purple-200">
                  <Home size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link to="/drones" className="flex items-center space-x-1 hover:text-purple-200">
                  <Package size={18} />
                  <span>My Drones</span>
                </Link>
                <Link to="/bookings" className="flex items-center space-x-1 hover:text-purple-200">
                  <DollarSign size={18} />
                  <span>Bookings</span>
                </Link>
                <div className="flex items-center space-x-1">
                  <User size={18} />
                  <span>{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-purple-200">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50">
                  Register as Provider
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
