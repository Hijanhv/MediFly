import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(
          formData.email,
          formData.password,
          formData.name,
          formData.role
        );
      }

      if (result.success) {
        navigate("/");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #fce7f3 100%)",
      }}
    >
      {/* Hand-drawn doodle elements - softer, more organic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div
          className="absolute rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{
            top: "80px",
            left: "40px",
            width: "280px",
            height: "280px",
            background: "#c4b5fd",
            opacity: 0.3,
          }}
        ></div>
        <div
          className="absolute rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{
            top: "160px",
            right: "40px",
            width: "280px",
            height: "280px",
            background: "#a5b4fc",
            opacity: 0.3,
            animationDelay: "2s",
          }}
        ></div>
        <div
          className="absolute rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{
            bottom: "-128px",
            left: "33%",
            width: "280px",
            height: "280px",
            background: "#fbcfe8",
            opacity: 0.3,
            animationDelay: "4s",
          }}
        ></div>
      </div>

      <div className="max-w-md w-full relative z-10 slide-in-up">
        {/* Card with organic styling */}
        <div
          className="backdrop-blur-xl p-8"
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "32px",
            border: "3px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-40 animate-pulse"
                  style={{
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  }}
                ></div>
                <div
                  className="relative p-4 bg-white shadow-xl"
                  style={{
                    borderRadius: "28px",
                    border: "3px solid rgba(99, 102, 241, 0.3)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <img
                    src="/logo.svg"
                    alt="MediFly Logo"
                    className="object-contain"
                    style={{ width: "80px", height: "80px" }}
                  />
                </div>
              </div>
            </div>
            <h1
              className="mb-2"
              style={{
                fontSize: "42px",
                fontFamily: '"Quicksand", sans-serif',
                fontWeight: "700",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
              }}
            >
              Medi<span style={{ color: "#ec4899" }}>Fly</span>
            </h1>
            <p
              className="text-gray-600"
              style={{
                fontFamily: '"Comfortaa", sans-serif',
                fontWeight: "600",
                fontSize: "16px",
              }}
            >
              {isLogin ? "👋 Welcome back!" : "✨ Create your account"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {!isLogin && (
              <div className="fade-in">
                <label
                  className="block text-gray-700 mb-2"
                  style={{
                    fontSize: "14px",
                    fontFamily: '"Quicksand", sans-serif',
                    fontWeight: "700",
                  }}
                >
                  📝 Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="input-modern"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label
                className="block text-gray-700 mb-2"
                style={{
                  fontSize: "14px",
                  fontFamily: '"Quicksand", sans-serif',
                  fontWeight: "700",
                }}
              >
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-modern"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                className="block text-gray-700 mb-2"
                style={{
                  fontSize: "14px",
                  fontFamily: '"Quicksand", sans-serif',
                  fontWeight: "700",
                }}
              >
                🔒 Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-modern pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="fade-in">
                <label
                  className="block text-gray-700 mb-2"
                  style={{
                    fontSize: "14px",
                    fontFamily: '"Quicksand", sans-serif',
                    fontWeight: "700",
                  }}
                >
                  👤 Select Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-modern"
                >
                  <option value="user">🙋 User - Request Deliveries</option>
                  <option value="operator">🎮 Operator - Manage Drones</option>
                  <option value="admin">👑 Admin - System Management</option>
                </select>
              </div>
            )}

            {error && (
              <div
                className="p-4 text-sm flex items-start fade-in"
                style={{
                  background: "#fef2f2",
                  border: "3px solid #fecaca",
                  color: "#991b1b",
                  borderRadius: "20px",
                  fontFamily: '"Comfortaa", sans-serif',
                  fontWeight: "600",
                  gap: "8px",
                }}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>{isLogin ? "🚀 Sign In" : "✨ Create Account"}</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="transition-colors duration-200 hover:underline"
              style={{
                color: "#6366f1",
                fontFamily: '"Quicksand", sans-serif',
                fontWeight: "700",
                fontSize: "14px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.target.style.color = "#4f46e5")}
              onMouseOut={(e) => (e.target.style.color = "#6366f1")}
            >
              {isLogin
                ? "✨ Don't have an account? Sign up"
                : "🔐 Already have an account? Sign in"}
            </button>
          </div>

          {/* Demo credentials hint */}
          {isLogin && (
            <div
              className="mt-6 p-4"
              style={{
                background: "#eef2ff",
                borderRadius: "20px",
                border: "3px solid #c7d2fe",
              }}
            >
              <p
                className="text-indigo-800 mb-2"
                style={{
                  fontSize: "13px",
                  fontFamily: '"Quicksand", sans-serif',
                  fontWeight: "700",
                }}
              >
                🔑 Demo Credentials:
              </p>
              <div
                className="text-indigo-600"
                style={{
                  fontSize: "13px",
                  fontFamily: '"Comfortaa", sans-serif',
                  fontWeight: "600",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <p>👤 User: user@medifly.com</p>
                <p>🎮 Operator: operator@medifly.com</p>
                <p>👑 Admin: admin@medifly.com</p>
                <p className="text-indigo-500" style={{ marginTop: "8px" }}>
                  Password: 123456
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer text */}
        <p
          className="text-center mt-6 text-gray-600"
          style={{
            fontSize: "14px",
            fontFamily: '"Comfortaa", sans-serif',
            fontWeight: "600",
          }}
        >
          🚁 Medical supplies delivered by drone
        </p>
      </div>
    </div>
  );
};

export default Login;
