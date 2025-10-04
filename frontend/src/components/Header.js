import React from "react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-cloud-sky text-white shadow-lg relative overflow-hidden">
      {/* Animated clouds background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-10 w-20 h-10 bg-white rounded-full animate-float"></div>
        <div
          className="absolute top-12 right-20 w-24 h-12 bg-white rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-4 left-1/4 w-32 h-16 bg-white rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-28 h-14 bg-white rounded-full animate-float"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-1 shadow-lg">
                <img
                  src="/images/medify-logo.png"
                  alt="MediFly Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900 drop-shadow-lg">
                MediFly
              </h1>
              <p className="text-sm md:text-base text-blue-800 italic drop-shadow">
                "When every second counts, life-saving care takes flight."
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-blue-900">{user?.name}</p>
              <p className="text-xs text-blue-700 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
