import { useEffect, useState } from 'react';
import Head from 'next/head';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import useUserStore from '../store/useUserStore';
import useToastStore from '../store/useToastStore';
import { apiFetch } from '../utils/api';
import TagInput from '../components/TagInput';
import ReactDOM from 'react-dom';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';

import {
  UserCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  FireIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  PlusIcon
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

  const handleChat = () => {
    window.location.href = `/swap/${swap._id}`;
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-secondary-200 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">Swap Details</h2>
          <p className="text-primary-100 mt-1">Review your skill exchange</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Sender Info */}
          <div className="flex items-center gap-4 p-4 bg-secondary-50 rounded-xl">
            <Avatar src={swap.sender?.avatar} name={swap.sender?.name} size={40} />
            <div className="flex-1">
              <div className="font-bold text-xl text-secondary-900">
                {isProposer ? 'You (Proposer)' : swap.sender?.name || 'Unknown'}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <StarIcon className="w-4 h-4 text-accent-500 fill-current" />
                <span className="text-sm text-secondary-600">4.8 (12 reviews)</span>
              </div>
            </div>
          </div>

          {/* Skills Exchange */}
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-secondary-700 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                Offering Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(swap.offeredSkill) ? swap.offeredSkill : [swap.offeredSkill]).map((skill) => (
                  <span
                    key={skill}
                    className="bg-success-100 text-success-800 px-3 py-1.5 rounded-full text-sm font-medium border border-success-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-secondary-700 mb-3 flex items-center gap-2">
                <FireIcon className="w-4 h-4 text-warning-500" />
                Looking for
              </div>
              <div className="bg-primary-50 px-4 py-3 rounded-xl border border-primary-200">
                <span className="text-primary-800 font-semibold text-lg">{swap.requestedSkill}</span>
              </div>
            </div>
          </div>

          {/* Optional Message */}
          {swap.message && (
            <div>
              <div className="text-sm font-semibold text-secondary-700 mb-2">Message</div>
              <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                <p className="text-secondary-700 italic">"{swap.message}"</p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-secondary-50 p-3 rounded-lg">
              <div className="text-secondary-600 text-xs uppercase font-medium">Status</div>
              <div className="font-semibold text-secondary-900 capitalize mt-1">{swap.status}</div>
            </div>
            <div className="bg-secondary-50 p-3 rounded-lg">
              <div className="text-secondary-600 text-xs uppercase font-medium">Difficulty</div>
              <div className={`px-2 py-1 rounded-full text-xs font-semibold mt-1 inline-block ${
                swap.difficultyLevel === 'Beginner' ? 'bg-success-100 text-success-800' :
                swap.difficultyLevel === 'Intermediate' ? 'bg-warning-100 text-warning-800' :
                swap.difficultyLevel === 'Advanced' ? 'bg-error-100 text-error-800' :
                'bg-secondary-100 text-secondary-800'
              }`}>
                {swap.difficultyLevel || 'Intermediate'}
              </div>
            </div>
          </div>

          {/* Acceptance Info */}
          {swap.receiver && (
            <div className="flex items-center gap-3 p-3 bg-success-50 rounded-xl border border-success-200">
              <Avatar src={swap.receiver.avatar} name={swap.receiver.name} size={40} />
              <div>
                <div className="text-sm font-medium text-success-800">
                  Accepted by: {isAcceptor ? 'You' : swap.receiver?.name || 'Unknown'}
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-2 text-sm text-secondary-500">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Created: {swap.createdAt ? new Date(swap.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Updated: {swap.updatedAt ? new Date(swap.updatedAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          {/* Urgent Indicator */}
          {swap.isUrgent && (
            <div className="flex items-center gap-3 p-3 bg-error-50 rounded-xl border border-error-200">
              <ExclamationTriangleIcon className="w-5 h-5 text-error-600" />
              <span className="font-semibold text-error-800">This is an urgent request</span>
            </div>
          )}

          {/* Chat Button */}
          {isAccepted && (
            <Button
              onClick={handleChat}
              variant="success"
              className="w-full"
              size="lg"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Open Chat
            </Button>
          )}
        </div>
      </div>
    </div>,
    typeof window !== 'undefined' ? document.body : null
  );
}

export default function Swap() {
  const { user, loading: userLoading } = useUserStore();
  const { addToast } = useToastStore();
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

  // Show loading while user state is being determined
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-700">
        <div className="text-center">
          <Loader />
          <p className="text-secondary-600 dark:text-secondary-300 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Fetch user's swaps
  useEffect(() => {
    async function fetchSwaps() {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetch('/api/swaps/user-swaps');
        setSwaps(data);
      } catch (err) {
        setError('Failed to load your swaps.');
        addToast({ message: 'Failed to load your swaps', type: 'error' });
        console.error('Error fetching swaps:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSwaps();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offeredSkill.length || !requestedSkill.trim()) {
      setError('Please fill in all required fields.');
      addToast({ message: 'Fill all required fields', type: 'warning' });
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const newSwap = await apiFetch('/api/swaps', {
        method: 'POST',
        body: JSON.stringify({
          offeredSkill,
          requestedSkill: requestedSkill.trim(),
          message: message.trim(),
          difficultyLevel,
          isUrgent,
        }),
      });

      setSwaps(prev => [newSwap, ...prev]);
      setOfferedSkill([]);
      setRequestedSkill('');
      setMessage('');
      setDifficultyLevel('Intermediate');
      setIsUrgent(false);
      setSuccess('Swap created successfully!');
      addToast({ message: 'Swap created successfully!', type: 'success' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create swap. Please try again.');
      addToast({ message: 'Failed to create swap', type: 'error' });
      console.error('Error creating swap:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>My Skill Exchanges - SkillSwap</title>
        <meta name="description" content="Manage your skill exchanges and create new ones" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        {/* Header Section */}
        <div className="bg-white border-b border-secondary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-secondary-900">My Skill Exchanges</h1>
              <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                Create new skill exchanges and manage your existing ones
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create New Swap Form */}
            <div className="space-y-6">
              <Card variant="elevated" className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <PlusIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Create New Exchange</h2>
                    <p className="text-secondary-600">Propose a skill exchange with other members</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <TagInput
                    label="Skills You're Offering"
                    placeholder="Add skills you can teach (e.g., React, Design, Writing)"
                    value={offeredSkill}
                    onChange={setOfferedSkill}
                    required
                  />

                  <Input
                    label="Skill You're Looking For"
                    placeholder="What skill do you want to learn?"
                    value={requestedSkill}
                    onChange={(e) => setRequestedSkill(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      placeholder="Add a personal message about your exchange..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="block w-full text-secondary-900 placeholder-secondary-500 bg-white/80 backdrop-blur-sm border border-secondary-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 input-focus resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={difficultyLevel}
                        onChange={(e) => setDifficultyLevel(e.target.value)}
                        className="block w-full text-secondary-900 bg-white/80 backdrop-blur-sm border border-secondary-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 input-focus px-4 py-3"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isUrgent}
                          onChange={(e) => setIsUrgent(e.target.checked)}
                          className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-secondary-700">Mark as urgent</span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-error-600 bg-error-50 border border-error-200 rounded-lg p-3 animate-slide-up">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-error-500 rounded-full mr-2"></div>
                        {error}
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="text-sm text-success-600 bg-success-50 border border-success-200 rounded-lg p-3 animate-slide-up">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        {success}
                      </div>
                    </div>
                  )}

                  <Button type="submit" loading={submitting} className="w-full" size="lg">
                    {submitting ? 'Creating Exchange...' : 'Create Skill Exchange'}
                  </Button>
                </form>
              </Card>
            </div>

            {/* User's Swaps List */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <SparklesIcon className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900">Your Exchanges</h2>
                  <p className="text-secondary-600">Manage your skill exchanges</p>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <Loader />
                  <p className="text-secondary-600">Loading your exchanges...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <Card variant="error" className="text-center py-8">
                  <ExclamationTriangleIcon className="w-12 h-12 text-error-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-error-800 mb-2">Failed to Load Exchanges</h3>
                  <p className="text-error-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()} variant="error">
                    Try Again
                  </Button>
                </Card>
              )}

              {/* Empty State */}
              {!loading && !error && swaps.length === 0 && (
                <Card variant="secondary" className="text-center py-12">
                  <SparklesIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2">No exchanges yet</h3>
                  <p className="text-secondary-600 mb-6">
                    Create your first skill exchange to start connecting with other professionals!
                  </p>
                </Card>
              )}

              {/* Swaps List */}
              {!loading && !error && swaps.length > 0 && (
                <div className="space-y-4">
                  {swaps.map((swap) => (
                    <Card 
                      key={swap._id} 
                      hover 
                      fullWidth
                      className="cursor-pointer animate-fade-in"
                      onClick={() => setModalSwap(swap)}
                    >
                      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-secondary-900">
                              Looking for: {swap.requestedSkill}
                            </h3>
                            {swap.isUrgent && (
                              <span className="px-2 py-1 bg-error-100 text-error-800 text-xs rounded-full font-medium">
                                Urgent
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            <span className="text-xs text-secondary-600">Offering:</span>
                            {(Array.isArray(swap.offeredSkill) ? swap.offeredSkill : [swap.offeredSkill])
                              .slice(0, 3)
                              .map((skill) => (
                                <span key={skill} className="bg-success-100 text-success-800 text-xs px-2 py-1 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            {(Array.isArray(swap.offeredSkill) ? swap.offeredSkill : [swap.offeredSkill]).length > 3 && (
                              <span className="text-xs text-secondary-500">+{(Array.isArray(swap.offeredSkill) ? swap.offeredSkill : [swap.offeredSkill]).length - 3} more</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-secondary-500 flex-wrap">
                            <span className="capitalize">{swap.status}</span>
                            <span>•</span>
                            <span>{swap.difficultyLevel || 'Intermediate'}</span>
                            <span>•</span>
                            <span>{new Date(swap.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[48px]">
                          <Avatar src={swap.sender?.avatar} name={swap.sender?.name} size={40} />
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            swap.status === 'pending' ? 'bg-warning-500' :
                            swap.status === 'accepted' ? 'bg-success-500' :
                            swap.status === 'rejected' ? 'bg-error-500' :
                            'bg-secondary-500'
                          }`}></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Swap Modal */}
        {modalSwap && (
          <SwapModal
            swap={modalSwap}
            user={user}
            onClose={() => setModalSwap(null)}
          />
        )}
      </div>
    </>
  );
}