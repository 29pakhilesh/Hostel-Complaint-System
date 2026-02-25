import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';
import api from '../utils/api';
// JUIT logo served from public folder
const JUIT_LOGO_SRC = '/juit-logo.png';

const PublicComplaint = () => {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [hostel, setHostel] = useState('');
  const [block, setBlock] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [images, setImages] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const HOSTELS = [
    'Azad Bhawan',
    'Parmar Bhawan',
    'Geeta Bhawan',
    'Malviya Bhawan',
    'Shashtri Bhawan',
  ];

  const BLOCK_HOSTELS = new Set(['Azad Bhawan', 'Parmar Bhawan']);
  const BLOCKS = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Try public endpoint first (no auth header)
      const response = await fetch('/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        // Fallback: try with API client (might have token)
        const apiResponse = await api.get('/categories');
        setCategories(apiResponse.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set default categories if API fails
      setCategories([
        { id: '1', name: 'Electrical' },
        { id: '2', name: 'Plumbing' },
        { id: '3', name: 'Carpentry' },
        { id: '4', name: 'Cleaning' },
        { id: '5', name: 'Security' },
        { id: '6', name: 'Internet' },
        { id: '7', name: 'Other' },
      ]);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!formData.category_id) {
      errors.category_id = 'Category is required';
    }
    if (!hostel) {
      errors.hostel = 'Hostel is required';
    }
    if (hostel && BLOCK_HOSTELS.has(hostel) && !block) {
      errors.block = 'Block is required for this hostel';
    }
    if (!roomNumber.trim()) {
      errors.roomNumber = 'Room number is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSuccess(false);
    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('category_id', formData.category_id);
      form.append('hostel_name', hostel);
      if (block) form.append('block', block);
      if (roomNumber) form.append('room_number', roomNumber);
      images.forEach((file) => {
        form.append('images', file);
      });

      await api.post('/complaints', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({ title: '', description: '', category_id: '' });
      setHostel('');
      setBlock('');
      setRoomNumber('');
      setImages([]);
      setFormErrors({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setFormErrors({ submit: error.response?.data?.error || 'Failed to submit complaint' });
    } finally {
      setSubmitting(false);
    }
  };

  const bgClass = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-slate-900/90' : 'bg-white';
  const borderClass = isDark ? 'border-slate-800' : 'border-slate-200';
  const headingClass = isDark ? 'text-sky-400' : 'text-slate-900';
  const textClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const textMutedClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const inputBgClass = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const inputBorderClass = isDark ? 'border-slate-700' : 'border-slate-300';
  const inputTextClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const placeholderClass = isDark ? 'placeholder-slate-500' : 'placeholder-slate-400';
  const shadowStyle = isDark
    ? { boxShadow: '0 24px 70px rgba(0,0,0,0.75)' }
    : { boxShadow: '0 22px 60px rgba(15,23,42,0.18)' };
  const textShadowStyle = {};
  const selectedCategory = categories.find((cat) => cat.id === formData.category_id) || null;
  const requiresBlock = hostel && BLOCK_HOSTELS.has(hostel);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files.slice(0, 3)); // limit to 3 images
  };

  return (
    <div className={`relative min-h-screen ${bgClass} py-10 px-4 transition-colors duration-500`}>
      <SnowfallOverlay />
      <div className="relative max-w-2xl mx-auto animate-fade-in-up-slow">
        <div
          className={`${cardBgClass} rounded-2xl p-8 shadow-2xl border border-zinc-700/60 ${borderClass} backdrop-blur-xl transition-colors duration-500`}
          style={shadowStyle}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img
                src={JUIT_LOGO_SRC}
                alt="JUIT logo"
                className="h-12 w-12 object-contain"
              />
              <div className="text-left">
                <h1
                  className={`text-2xl sm:text-3xl font-semibold ${headingClass} transition-colors duration-300`}
                >
                  Hostel Complaint System
                </h1>
                <p className={`${textMutedClass} text-sm`}>Jaypee University of Information Technology</p>
              </div>
            </div>
          </div>

          {success && (
            <div
              className={`mb-6 p-4 border rounded-lg transition-colors duration-300 ${
                isDark
                  ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-500 text-emerald-800'
              }`}
            >
              Complaint submitted successfully. We will address it soon.
            </div>
          )}

          {formErrors.submit && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-500 rounded-lg text-red-600 dark:text-red-400 transition-colors duration-300">
              {formErrors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className={`block text-sm font-medium ${textClass} mb-2 transition-colors duration-300`}>
                Title <span className={isDark ? 'text-sky-400' : 'text-rose-500'}>*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 ${inputBgClass} border ${inputBorderClass} rounded-lg ${inputTextClass} ${placeholderClass} focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all`}
                placeholder="Brief description of the issue"
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.title}</p>
              )}
            </div>

            <div>
                <label className={`block text-sm font-medium ${textClass} mb-2 transition-colors duration-300`}>
                Department <span className={isDark ? 'text-sky-400' : 'text-rose-500'}>*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((open) => !open)}
                  className={`w-full px-4 py-3 text-left ${inputBgClass} border ${inputBorderClass} rounded-lg ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all flex items-center justify-between`}
                >
                  <span>
                    {selectedCategory ? selectedCategory.name : 'Select department'}
                  </span>
                  <span className={textMutedClass}>
                    {categoryOpen ? '▲' : '▼'}
                  </span>
                </button>
                {categoryOpen && (
                  <div
                    className={`absolute z-20 mt-1 w-full rounded-lg border ${inputBorderClass} ${
                      isDark ? 'bg-slate-900' : 'bg-white'
                    } shadow-lg max-h-56 overflow-auto`}
                  >
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, category_id: cat.id }));
                          setCategoryOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm ${
                          formData.category_id === cat.id
                            ? isDark
                              ? 'bg-sky-500/10 text-sky-300'
                              : 'bg-sky-50 text-sky-800'
                            : isDark
                            ? 'text-slate-100 hover:bg-slate-800/70'
                            : 'text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                    {categories.length === 0 && (
                      <div className="px-4 py-2 text-sm text-zinc-500">
                        No departments configured.
                      </div>
                    )}
                  </div>
                )}
              </div>
              {formErrors.category_id && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.category_id}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2 transition-colors duration-300`}>
                  Hostel <span className={isDark ? 'text-sky-400' : 'text-rose-500'}>*</span>
                </label>
                <select
                  value={hostel}
                  onChange={(e) => {
                    setHostel(e.target.value);
                    setBlock('');
                  }}
                  className={`w-full px-4 py-3 ${inputBgClass} border ${inputBorderClass} rounded-lg ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all`}
                >
                  <option value="">Select hostel</option>
                  {HOSTELS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                {formErrors.hostel && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.hostel}</p>
                )}
              </div>

              {requiresBlock && (
                <div>
                  <label className={`block text-sm font-medium ${textClass} mb-2 transition-colors duration-300`}>
                    Block <span className={isDark ? 'text-sky-400' : 'text-rose-500'}>*</span>
                  </label>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className={`w-full px-4 py-3 ${inputBgClass} border ${inputBorderClass} rounded-lg ${inputTextClass} focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all`}
                  >
                    <option value="">Select block</option>
                    {BLOCKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {formErrors.block && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.block}</p>
                  )}
                </div>
              )}
            </div>

            <div>
                <label className={`block text-sm font-medium ${textClass} mb-2 transition-colors duration-300`}>
                Room number <span className={isDark ? 'text-sky-400' : 'text-rose-500'}>*</span>
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className={`w-full px-4 py-3 ${inputBgClass} border ${inputBorderClass} rounded-lg ${inputTextClass} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all`}
                placeholder="e.g., 203"
              />
              {formErrors.roomNumber && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.roomNumber}</p>
              )}
            </div>

            <div>
                <label className={`block text-sm font-medium ${textClass} mb-2 transition-colors duration-300`}>
                Attach images (optional, up to 3)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
              />
              {images.length > 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
                  {images.length} file{images.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <div>
                <label className={`block text-sm font-medium ${textClass} mb-2 transition-colors duration-300`}>
                Description <span className={isDark ? 'text-sky-400' : 'text-rose-500'}>*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className={`w-full px-4 py-3 ${inputBgClass} border ${inputBorderClass} rounded-lg ${inputTextClass} ${placeholderClass} focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all`}
                placeholder="Provide detailed information about the issue"
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.description}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                isDark
                  ? 'bg-sky-500 text-white hover:bg-sky-400'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>

          <div className="mt-6 text-center">
              <Link
              to="/login/department"
              className={`text-sm ${isDark ? 'text-sky-400 hover:text-sky-300' : 'text-slate-700 hover:text-slate-900'} transition-colors`}
            >
              Department Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicComplaint;
