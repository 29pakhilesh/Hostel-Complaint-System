import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { setAuth } from '../utils/auth';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';

const JUIT_LOGO_SRC = '/juit-logo.png';

const Login = () => {
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

      if (user.role !== 'super_admin') {
        setError('Access denied. This login is for the super admin only.');
        setLoading(false);
        return;
      }

      setAuth(token, user);
      navigate('/dashboard/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bgClass = isDark ? 'bg-[#0a0a0f]' : 'bg-gradient-to-br from-slate-50 via-white to-sky-50/40';
  const cardBgClass = isDark ? 'bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/60' : 'bg-white/75 backdrop-blur-sm border border-slate-200/80 shadow-xl shadow-slate-200/30';
  const textMainClass = isDark ? 'text-zinc-100' : 'text-slate-900';
  const textMutedClass = isDark ? 'text-zinc-400' : 'text-slate-600';
  const inputBgClass = isDark ? 'bg-zinc-900 border-zinc-600 text-zinc-100 placeholder-zinc-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';
  const inputFocusClass = 'focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500 transition-all';

  return (
    <div className={`relative min-h-screen flex items-center justify-center ${bgClass} px-4 py-10 transition-colors duration-300`}>
      <SnowfallOverlay />
      <div className="w-full max-w-md relative">
        <div className={`${cardBgClass} rounded-2xl p-8 sm:p-10`}>
          <div className="text-center mb-8">
            <img src={JUIT_LOGO_SRC} alt="JUIT" className="h-12 w-12 mx-auto mb-4 object-contain" />
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${textMainClass}`}>
              <span className="text-sky-500">Admin</span> Login
            </h1>
            <p className={`mt-2 text-sm ${textMutedClass}`}>
              Hostel Complaint System · Super admin only
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-xl border ${
              isDark ? 'bg-red-900/20 border-red-500/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${textMainClass}`}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-xl border ${inputBgClass} ${inputFocusClass}`}
                placeholder="admin@hostel.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${textMainClass}`}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-xl border ${inputBgClass} ${inputFocusClass}`}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
