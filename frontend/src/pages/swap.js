import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import useUserStore from '../store/useUserStore';
import { apiFetch } from '../utils/api';
import TagInput from '../components/TagInput';
import ReactDOM from 'react-dom';

import {
  UserCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

function SwapModal({ swap, user, onClose }) {
  if (!swap) return null;

  const isProposer = user && swap.sender?._id === user._id;
  const isAcceptor = user && swap.receiver?._id === user._id;
  const isAccepted = swap.status === 'accepted';

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-8 border border-slate-200 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-primary text-2xl"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Sender Info */}
        <div className="flex items-center gap-6 mb-6">
          {swap.sender?.avatar ? (
            <img
              src={swap.sender.avatar}
              alt={swap.sender.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 shadow"
            />
          ) : (
            <UserCircleIcon className="w-16 h-16 text-blue-500 bg-blue-50 rounded-full p-1 shadow" />
          )}
          <div>
            <div className="font-bold text-2xl text-primaryDark">
              {isProposer ? 'You (Proposer)' : swap.sender?.name || 'Unknown'}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(Array.isArray(swap.offeredSkill) ? swap.offeredSkill : [swap.offeredSkill]).map((skill) => (
                <span
                  key={skill}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Requested Skill */}
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-block bg-accent/10 text-accent px-4 py-1.5 rounded-full text-base font-semibold">
            Needs: {swap.requestedSkill}
          </span>
        </div>

        {/* Optional Message */}
        {swap.message && (
          <div className="text-slate-600 text-lg italic border-l-4 border-accent/30 pl-6 mb-6">
            "{swap.message}"
          </div>
        )}

        {/* Details */}
        <div className="space-y-3 w-full text-base text-slate-700">
          <div>
            Status:{' '}
            <span className="font-semibold text-primaryDark capitalize">
              {swap.status}
            </span>
          </div>

          <div>
            Difficulty:{' '}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              swap.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-800' :
              swap.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
              swap.difficultyLevel === 'Advanced' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {swap.difficultyLevel || 'Intermediate'}
            </span>
          </div>

          <div>
            Proposer:{' '}
            <span className="font-semibold text-blue-700">
              {isProposer ? 'You' : swap.sender?.name || 'Unknown'}
            </span>
          </div>

          {swap.receiver && (
            <div className="flex items-center gap-3 mt-3">
              {swap.receiver.avatar ? (
                <img
                  src={swap.receiver.avatar}
                  alt={swap.receiver.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-green-200 shadow"
                />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-green-600 bg-green-50 rounded-full p-1 shadow" />
              )}
              <span>
                Accepted by:{' '}
                <span className="font-semibold text-green-700">
                  {isAcceptor ? 'You' : swap.receiver?.name || 'Unknown'}
                </span>
              </span>
            </div>
          )}

          <div className="text-sm text-slate-500 mt-3">
            Created: {swap.createdAt ? new Date(swap.createdAt).toLocaleString() : 'N/A'}
          </div>
          <div className="text-sm text-slate-500">
            Last updated: {swap.updatedAt ? new Date(swap.updatedAt).toLocaleString() : 'N/A'}
          </div>
        </div>

        {/* Urgent Indicator */}
        {swap.isUrgent && (
          <div className="flex items-center gap-2 text-sm mt-4">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-red-800">Is Urgent</span>
          </div>
        )}

        {/* Chat Button */}
        {isAccepted && (
          <div className="mt-8">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow transition"
              onClick={() => alert('Chat feature coming soon!')} // Replace this with actual chat logic
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              Chat
            </button>
          </div>
        )}
      </div>
    </div>,
    typeof window !== 'undefined' ? document.body : null
  );
}

export default function Swap() {
  const { user } = useUserStore();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [offeredSkill, setOfferedSkill] = useState([]);
  const [requestedSkill, setRequestedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('Intermediate');
  const [isUrgent, setIsUrgent] = useState(false);
  const [modalSwap, setModalSwap] = useState(null);

  useEffect(() => {
    async function fetchSwaps() {
      setLoading(true);
      setError('');
      try {
        const swapsData = await apiFetch('/api/swaps');
        setSwaps(swapsData.swaps || swapsData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchSwaps();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiFetch('/api/swaps', {
        method: 'POST',
        body: JSON.stringify({ offeredSkill, requestedSkill, message, difficultyLevel, isUrgent }),
      });
      setSuccess('Swap proposal sent!');
      setOfferedSkill([]);
      setRequestedSkill('');
      setMessage('');
      setDifficultyLevel('Intermediate');
      setIsUrgent(false);
      const swapsData = await apiFetch('/api/swaps');
      setSwaps(swapsData.swaps || swapsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-2 sm:px-6">
      <div className="w-full max-w-5xl space-y-12">
        {/* Propose a New Swap */}
        <Card variant="elevated" className="w-full max-w-3xl mx-auto shadow-card border-none">
          <h2 className="text-3xl font-extrabold text-primaryDark mb-8 tracking-tight">Propose a New Swap</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div>
              <label className="block text-base font-semibold text-slate-700 mb-2">Skills you offer</label>
              <div className="flex flex-wrap gap-2">
                {(user?.skillsOffered || []).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    className={`px-4 py-2 rounded-full border text-base font-medium transition-all shadow-sm select-none
                      ${offeredSkill.includes(skill)
                        ? 'bg-primary text-green-500 border-primary shadow-lg ring-2 ring-primary/20'
                        : 'bg-white text-primary border-border hover:bg-primary/10 hover:border-primary/40'}
                    `}
                    style={{ minWidth: 110 }}
                    onClick={() => setOfferedSkill(offeredSkill.includes(skill) ? offeredSkill.filter(s => s !== skill) : [...offeredSkill, skill])}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-700 mb-2">Skill you need</label>
              <input
                type="text"
                className="w-full px-5 py-3 rounded-xl border border-border bg-white text-primary text-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                name="requestedSkill"
                value={requestedSkill}
                onChange={(e) => setRequestedSkill(e.target.value)}
                placeholder="e.g. Web Development"
                required
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-700 mb-2">Message (optional)</label>
              <textarea
                className="w-full px-5 py-3 rounded-xl border border-border bg-white text-primary text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px]"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message to your swap proposal"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-2">Difficulty Level</label>
                <select
                  className="w-full px-5 py-3 rounded-xl border border-border bg-white text-primary text-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary/20"
                />
                <label htmlFor="isUrgent" className="text-base font-semibold text-slate-700">
                  Mark as Urgent
                </label>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-2">
              <Button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl text-lg font-bold shadow-card bg-primary hover:bg-primaryDark transition">
                {submitting ? 'Submitting...' : 'Propose Swap'}
              </Button>
              {success && <span className="text-success text-base font-semibold">{success}</span>}
              {error && <span className="text-error text-base font-semibold">{error}</span>}
            </div>
          </form>
        </Card>

        {/* Active & Pending Swaps */}
        <Card variant="elevated" className="w-full max-w-5xl mx-auto shadow-card border-none">
          <h3 className="text-3xl font-extrabold mb-8 text-primaryDark tracking-tight">Active & Pending Swaps</h3>
          {loading ? (
            <div className="text-primary py-12 text-lg font-semibold">Loading swaps...</div>
          ) : error ? (
            <div className="text-error py-12 text-lg font-semibold">{error}</div>
          ) : swaps.length === 0 ? (
            <div className="text-textgray py-12 text-lg">No swaps yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {swaps.map((swap) => {
                const isProposer = user && swap.sender?._id === user._id;
                const isAcceptor = user && swap.receiver?._id === user._id;
                const isAccepted = swap.status === 'accepted';
                return (
                  <div
                    key={swap._id}
                    className={`flex flex-col justify-between h-full rounded-2xl border p-8 transition-all duration-200 cursor-pointer group
                      ${isAccepted ? 'bg-success/5 border-success/30 shadow-lg ring-2 ring-success/10' : 'bg-card border-slate-200/80 shadow-card hover:shadow-xl hover:scale-[1.01]'}
                    `}
                    style={{ minHeight: 260 }}
                    onClick={() => setModalSwap(swap)}
                    tabIndex={0}
                    role="button"
                    aria-label="View swap details"
                  >
                    <div className="flex items-center gap-6 mb-4">
                      {swap.sender?.avatar ? (
                        <img
                          src={swap.sender.avatar}
                          alt={swap.sender.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-blue-200 shadow"
                        />
                      ) : (
                        <UserCircleIcon className="w-14 h-14 text-blue-500 bg-blue-50 rounded-full p-1 shadow" />
                      )}
                      <div>
                        <div className="font-bold text-lg text-primaryDark">{swap.sender?.name || 'Anonymous'}</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(Array.isArray(swap.offeredSkill) ? swap.offeredSkill : [swap.offeredSkill]).map((skill) => (
                            <span key={skill} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-base font-semibold items-center mb-4">
                      <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-full">Needs: {swap.requestedSkill}</span>
                      <span
                        className={`px-4 py-1.5 rounded-full flex items-center gap-1 ${swap.status === 'pending'
                            ? 'bg-accent/20 text-accent'
                            : swap.status === 'accepted'
                              ? 'bg-success/20 text-success'
                              : 'bg-error/20 text-error'
                          }`}
                      >
                        {swap.status === 'accepted' && <span className="inline-block w-2 h-2 bg-success rounded-full mr-2"></span>}
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                      {isProposer && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Proposed by you</span>}
                      {isAcceptor && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">Accepted by you</span>}
                      {!isProposer && swap.sender && (
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                          Proposed by {swap.sender.name}
                        </span>
                      )}
                      {swap.receiver && (
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          Accepted by: <span className="font-semibold text-green-700">{isAcceptor ? 'You' : swap.receiver?.name || 'Unknown'}</span>
                        </span>
                      )}
                    </div>
                    {swap.message && (
                      <div className="text-slate-600 text-sm italic border-l-4 border-accent/30 pl-4 mb-2">"{swap.message}"</div>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-auto">
                      <span>Created: {swap.createdAt ? new Date(swap.createdAt).toLocaleString() : 'N/A'}</span>
                      <span>Last updated: {swap.updatedAt ? new Date(swap.updatedAt).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                );
              })}
              {modalSwap && <SwapModal swap={modalSwap} user={user} onClose={() => setModalSwap(null)} />}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}