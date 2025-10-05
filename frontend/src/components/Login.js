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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-32 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="max-w-md w-full relative z-10 slide-in-up">
        {/* Card */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white border-opacity-50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative p-4 bg-white rounded-3xl shadow-xl">
                  <img
                    src="/logo.svg"
                    alt="MediFly Logo"
                    className="w-20 h-20 object-contain"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Medi<span className="text-pink-500">Fly</span>
            </h1>
            <p className="text-gray-600 font-medium">
              {isLogin ? "👋 Welcome back!" : "✨ Create your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="fade-in">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-modern"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="fade-in">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-start gap-2 fade-in">
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
              className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors duration-200 hover:underline"
            >
              {isLogin
                ? "✨ Don't have an account? Sign up"
                : "🔐 Already have an account? Sign in"}
            </button>
          </div>

          {/* Demo credentials hint */}
          {isLogin && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-800 font-semibold mb-2">
                🔑 Demo Credentials:
              </p>
              <div className="text-xs text-indigo-600 space-y-1">
                <p>👤 User: user@medifly.com</p>
                <p>🎮 Operator: operator@medifly.com</p>
                <p>👑 Admin: admin@medifly.com</p>
                <p className="text-indigo-500 mt-2">Password: 123456</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center mt-6 text-gray-600 text-sm">
          🚁 Medical supplies delivered by drone
        </p>
      </div>
    </div>
  );
};

export default Login;
