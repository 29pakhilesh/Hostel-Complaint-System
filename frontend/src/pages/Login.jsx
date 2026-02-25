import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { setAuth } from '../utils/auth';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';

const Login = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const data = isRegistering 
        ? { email, password, full_name: fullName }
        : { email, password };
      
      const response = await api.post(endpoint, data);
      const { token, user } = response.data;

      setAuth(token, user);

      // Redirect based on role
      if (user.role === 'student') {
        navigate('/dashboard/student');
      } else {
        navigate('/dashboard/admin');
      }
    } catch (err) {
      setError(err.response?.data?.error || (isRegistering ? 'Registration failed. Please try again.' : 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const bgClass = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-slate-900/90' : 'bg-white';
  const textMainClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const textMutedClass = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className={`relative min-h-screen flex items-center justify-center ${bgClass} px-4`}>
      <SnowfallOverlay />
      <div className="w-full max-w-md relative">
        <div className={`${cardBgClass} rounded-xl p-8 shadow-2xl border border-slate-700/70`}>
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${textMainClass}`}>
              Hostel Complaint System
            </h1>
            <p className={textMutedClass}>
              {isRegistering ? 'Create a student account' : 'Sign in to your account'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-700 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div>
                <label htmlFor="fullName" className={`block text-sm font-medium mb-2 ${textMainClass}`}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800 dark:bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${textMainClass}`}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800 dark:bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${textMainClass}`}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isRegistering ? 6 : undefined}
                className="w-full px-4 py-3 bg-slate-800 dark:bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={isRegistering ? "Password (min 6 characters)" : "Enter your password"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading 
                ? (isRegistering ? 'Creating account...' : 'Signing in...') 
                : (isRegistering ? 'Create Account' : 'Sign In')
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setFullName('');
                setEmail('');
                setPassword('');
              }}
              className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
            >
              {isRegistering 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Register as student"
              }
            </button>
          </div>

          <div className={`mt-6 text-center text-sm ${textMutedClass}`}>
            <p>Default Admin: admin@hostel.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
