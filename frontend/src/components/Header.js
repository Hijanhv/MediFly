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
    <header
      className="relative overflow-hidden shadow-lg"
      style={{
        background:
          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
        borderBottom: "4px solid rgba(255, 255, 255, 0.3)",
      }}
    >
      {/* Hand-drawn doodle pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 30 Q 20 20, 30 30 T 50 30' stroke='white' stroke-width='2' fill='none'/%3E%3Ccircle cx='15' cy='15' r='3' fill='white'/%3E%3Ccircle cx='45' cy='45' r='3' fill='white'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="container mx-auto px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo and branding */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-white rounded-3xl blur-md group-hover:blur-lg transition-all duration-300 opacity-40"></div>
              <div
                className="relative bg-white flex items-center justify-center shadow-lg transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 p-3"
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "20px",
                  border: "3px solid rgba(255, 255, 255, 0.8)",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
                }}
              >
                <img
                  src="/logo.svg"
                  alt="MediFly Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <h1
                className="text-white tracking-tight"
                style={{
                  fontSize: "36px",
                  fontFamily: '"Quicksand", sans-serif',
                  fontWeight: "700",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                Medi<span style={{ color: "rgba(252, 231, 243, 1)" }}>Fly</span>
              </h1>
              <p
                className="text-white/95"
                style={{
                  fontSize: "15px",
                  fontFamily: '"Comfortaa", sans-serif',
                  fontWeight: "500",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.15)",
                }}
              >
                🚁 Medical Drone Delivery Service
              </p>
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex items-center" style={{ gap: "16px" }}>
            {user && (
              <div
                className="hidden md:flex items-center backdrop-blur-lg px-4 py-2"
                style={{
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.25)",
                  borderRadius: "20px",
                  border: "3px solid rgba(255, 255, 255, 0.4)",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div
                  className="flex items-center justify-center text-white shadow-lg"
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #f472b6 0%, #8b5cf6 100%)",
                    fontFamily: '"Quicksand", sans-serif',
                    fontWeight: "700",
                    fontSize: "20px",
                    border: "3px solid rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <p
                    className="text-white"
                    style={{
                      fontSize: "15px",
                      fontFamily: '"Quicksand", sans-serif',
                      fontWeight: "700",
                      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    {user.name}
                  </p>
                  <p
                    className="text-white/95 capitalize flex items-center"
                    style={{
                      gap: "4px",
                      fontSize: "13px",
                      fontFamily: '"Comfortaa", sans-serif',
                      fontWeight: "600",
                      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.15)",
                    }}
                  >
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
              className="flex items-center transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-200"
              style={{
                gap: "8px",
                background: "white",
                color: "#6366f1",
                padding: "12px 28px",
                borderRadius: "20px",
                border: "3px solid rgba(255, 255, 255, 0.9)",
                boxShadow:
                  "0 6px 12px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
                fontFamily: '"Quicksand", sans-serif',
                fontWeight: "700",
                fontSize: "16px",
                cursor: "pointer",
              }}
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
