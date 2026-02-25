import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import SnowfallOverlay from '../components/SnowfallOverlay';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await api.get(`/complaints/${id}`);
        setComplaint(response.data);
        if (Array.isArray(response.data.image_paths) && response.data.image_paths.length > 0) {
          setActiveImage(0);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load complaint');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleStatusChange = async (status) => {
    if (!complaint || complaint.status === status) return;
    setUpdating(true);
    try {
      await api.put(`/complaints/${complaint.id}`, { status });
      setComplaint({ ...complaint, status });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const bgClass = isDark ? 'bg-black' : 'bg-slate-50';
  const cardBgClass = isDark ? 'bg-dark-black-800' : 'bg-white';
  const textClass = isDark ? 'text-zinc-100' : 'text-slate-900';
  const mutedClass = isDark ? 'text-zinc-400' : 'text-slate-600';

  const renderStatusButton = (value, label) => {
    const isActive = complaint?.status === value;
    const base =
      'px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-200 border';
    let classes = '';
    if (isActive) {
      if (value === 'pending') {
        classes = isDark
          ? 'bg-amber-500/10 border-amber-400 text-amber-300'
          : 'bg-amber-100 border-amber-500 text-amber-800';
      } else if (value === 'inprogress') {
        classes = isDark
          ? 'bg-sky-500/10 border-sky-400 text-sky-300'
          : 'bg-sky-100 border-sky-500 text-sky-800';
      } else {
        classes = isDark
          ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300'
          : 'bg-emerald-100 border-emerald-500 text-emerald-800';
      }
    } else {
      classes = isDark
        ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
        : 'border-slate-300 text-slate-600 hover:bg-slate-100';
    }
    return (
      <button
        key={value}
        type="button"
        disabled={updating}
        onClick={() => handleStatusChange(value)}
        className={`${base} ${classes}`}
      >
        {label}
      </button>
    );
  };

  const images = Array.isArray(complaint?.image_paths) ? complaint.image_paths : [];

  return (
    <div className={`relative min-h-screen ${bgClass} py-8 px-4 sm:px-6 lg:px-8`}>
      <SnowfallOverlay />
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <span className="text-lg">←</span>
            <span>Back to dashboard</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className={mutedClass}>Loading complaint details…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : !complaint ? (
          <div className="text-center py-16">
            <p className={mutedClass}>Complaint not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in-up-slow">
            {/* Left: images (desktop) / top (mobile) */}
            <div className="space-y-4">
              <div
                className={`${cardBgClass} rounded-2xl border border-zinc-700/60 shadow-2xl overflow-hidden`}
              >
                {images.length > 0 ? (
                  <div className="aspect-[4/3] bg-black/60 flex items-center justify-center">
                    <img
                      src={images[activeImage]}
                      alt={`Attachment ${activeImage + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center">
                    <p className={`${mutedClass} text-sm`}>No images attached</p>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={`h-16 w-16 rounded-lg overflow-hidden border transition-all ${
                        idx === activeImage
                          ? 'border-sky-400 ring-2 ring-sky-400/60'
                          : 'border-zinc-700 hover:border-sky-400/70'
                      }`}
                    >
                      <img
                        src={src}
                        alt={`Attachment ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: details */}
            <div
              className={`${cardBgClass} rounded-2xl border border-zinc-700/60 shadow-2xl p-6 sm:p-8 flex flex-col gap-6`}
            >
              <div className="flex flex-col gap-3 border-b border-zinc-700/60 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className={`text-xl sm:text-2xl font-semibold ${textClass}`}>
                    {complaint.title}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-200">
                    {complaint.category_name}
                  </span>
                  {complaint.hostel_name && (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-200">
                      {complaint.hostel_name}
                    </span>
                  )}
                  {complaint.block && (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-200">
                      Block {complaint.block}
                    </span>
                  )}
                  {complaint.room_number && (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-200">
                      Room {complaint.room_number}
                    </span>
                  )}
                </div>
                <div className={`text-xs ${mutedClass} flex flex-wrap gap-4`}>
                  <span>
                    Created:{' '}
                    {new Date(complaint.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                  {complaint.updated_at && (
                    <span>
                      Updated:{' '}
                      {new Date(complaint.updated_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className={`text-sm font-semibold ${textClass}`}>Status</h2>
                <div className="flex flex-wrap gap-2">
                  {renderStatusButton('pending', 'Pending')}
                  {renderStatusButton('inprogress', 'In progress')}
                  {renderStatusButton('resolved', 'Resolved')}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className={`text-sm font-semibold ${textClass}`}>Description</h2>
                <p className={`text-sm leading-relaxed ${mutedClass}`}>
                  {complaint.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetail;

