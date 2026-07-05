import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../shared/api/client';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import SnowfallOverlay from '../../../shared/components/SnowfallOverlay';

const JUIT_LOGO_SRC = '/juit-logo.png';

const ResetAdminPassword = () => {
  const { isDark } = useTheme();
  const [resetKey, setResetKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const bgClass = isDark
    ? 'bg-[#0a0a0f]'
    : 'bg-gradient-to-br from-slate-50 via-white to-sky-50/40';
  const cardBgClass = isDark
    ? 'bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/60'
    : 'bg-white/75 backdrop-blur-sm border border-slate-200/80 shadow-xl shadow-slate-200/30';
  const textMainClass = isDark ? 'text-zinc-100' : 'text-slate-900';
  const textMutedClass = isDark ? 'text-zinc-400' : 'text-slate-600';
  const inputBgClass = isDark
    ? 'bg-zinc-900 border-zinc-600 text-zinc-100 placeholder-zinc-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';
  const inputFocusClass =
    'focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500 transition-all';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetKey.trim()) {
      setError('Please enter the reset key from the backend .env.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/admin/reset-super', {
        reset_key: resetKey.trim(),
        new_password: newPassword,
      });
      setSuccess('Super admin password reset. You can now log in with the new password.');
      setError('');
      setNewPassword('');
      setConfirmPassword('');
      setResetKey('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please check the reset key.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center ${bgClass} px-4 py-10 transition-colors duration-300`}
    >
      <SnowfallOverlay />
      <div className="w-full max-w-md relative">
        <div className={`${cardBgClass} rounded-2xl p-8 sm:p-10`}>
          <div className="text-center mb-8">
            <img
              src={JUIT_LOGO_SRC}
              alt="JUIT"
              className="h-12 w-12 mx-auto mb-4 object-contain"
            />
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${textMainClass}`}>
              Reset Admin Password
            </h1>
            <p className={`mt-2 text-sm ${textMutedClass}`}>
              Use the secret reset key from your backend&nbsp;<code>.env</code>.
            </p>
          </div>

          {error && (
            <div
              className={`mb-4 p-4 rounded-xl border ${
                isDark
                  ? 'bg-red-900/20 border-red-500/50 text-red-300'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className={`mb-4 p-4 rounded-xl border ${
                isDark
                  ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="resetKey"
                className={`block text-sm font-semibold mb-2 ${textMainClass}`}
              >
                Reset key
              </label>
              <input
                id="resetKey"
                type="password"
                value={resetKey}
                onChange={(e) => setResetKey(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-xl border ${inputBgClass} ${inputFocusClass}`}
                placeholder="SUPER_ADMIN_RESET_KEY"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className={`block text-sm font-semibold mb-2 ${textMainClass}`}
              >
                New admin password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-xl border ${inputBgClass} ${inputFocusClass}`}
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className={`block text-sm font-semibold mb-2 ${textMainClass}`}
              >
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-xl border ${inputBgClass} ${inputFocusClass}`}
                placeholder="Re-enter new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25"
            >
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login/admin"
              className={`text-sm ${
                isDark ? 'text-sky-400 hover:text-sky-300' : 'text-slate-700 hover:text-slate-900'
              } transition-colors`}
            >
              ← Back to admin login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetAdminPassword;

