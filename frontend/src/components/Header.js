import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-5 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo and branding */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-white rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50"></div>
              <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300 p-2">
                <img
                  src="/logo.svg"
                  alt="MediFly Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg tracking-tight">
                Medi<span className="text-pink-200">Fly</span>
              </h1>
              <p className="text-sm md:text-base text-indigo-100 font-medium drop-shadow">
                🚁 Medical Drone Delivery Service
              </p>
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-3 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl px-4 py-2 border border-white border-opacity-30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-indigo-100 capitalize flex items-center gap-1">
                    {user.role === "admin" && "👑"}
                    {user.role === "operator" && "🎮"}
                    {user.role === "user" && "👤"}
                    {user.role}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
