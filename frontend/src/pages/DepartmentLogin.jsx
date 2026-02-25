import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';
import api from '../utils/api';
import { setAuth } from '../utils/auth';
const JUIT_LOGO_SRC = '/juit-logo.png';

const DepartmentLogin = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Check if user is a department user
      if (user.role !== 'department') {
        setError('Access denied. This login is for department users only.');
        setLoading(false);
        return;
      }

      setAuth(token, user);
      navigate('/dashboard/department');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bgClass = isDark ? 'bg-dark-black-900' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-dark-black-800' : 'bg-white';
  const borderClass = isDark ? 'border-dark-black-700' : 'border-slate-200';
  const headingClass = isDark ? 'text-sky-400' : 'text-slate-900';
  const textClass = isDark ? 'text-zinc-100' : 'text-slate-900';
  const textMutedClass = isDark ? 'text-zinc-400' : 'text-slate-600';
  const inputBgClass = isDark ? 'bg-dark-black-900' : 'bg-slate-50';
  const inputBorderClass = isDark ? 'border-dark-black-700' : 'border-slate-300';
  const inputTextClass = isDark ? 'text-zinc-100' : 'text-slate-900';
  const placeholderClass = isDark ? 'placeholder-zinc-500' : 'placeholder-slate-400';
  const shadowStyle = isDark
    ? { boxShadow: '0 24px 70px rgba(0,0,0,0.75)' }
    : { boxShadow: '0 22px 60px rgba(15,23,42,0.18)' };
  const textShadowStyle = {};

  return (
    <div className={`relative min-h-screen flex items-center justify-center ${bgClass} px-4 transition-colors duration-500`}>
      <SnowfallOverlay />
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className={`${cardBgClass} rounded-2xl p-8 shadow-2xl border border-zinc-700/60 ${borderClass} backdrop-blur-xl transition-colors duration-500`} style={shadowStyle}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img
                src={JUIT_LOGO_SRC}
                alt="JUIT logo"
                className="h-10 w-10 object-contain"
              />
              <div className="text-left">
                <h1
                  className={`text-2xl font-semibold ${headingClass} transition-colors duration-300`}
                >
                  Department Login
                </h1>
                <p className={`${textMutedClass} text-xs sm:text-sm`}>Jaypee University of Information Technology</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-500 rounded-lg text-red-600 dark:text-red-400 transition-colors duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${textClass} mb-2 transition-colors duration-300`}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 ${inputBgClass} border ${inputBorderClass} rounded-lg ${inputTextClass} ${placeholderClass} focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all`}
                placeholder="department@hostel.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${textClass} mb-2 transition-colors duration-300`}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 ${inputBgClass} border ${inputBorderClass} rounded-lg ${inputTextClass} ${placeholderClass} focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all`}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                isDark
                  ? 'bg-sky-500 text-white hover:bg-sky-400'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className={`text-sm ${isDark ? 'text-sky-400 hover:text-sky-300' : 'text-slate-700 hover:text-slate-900'} transition-colors`}
            >
              ← Submit a Complaint
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentLogin;
