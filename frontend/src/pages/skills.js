'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  FireIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  UserIcon, 
  ChatBubbleLeftRightIcon, 
  StarIcon, 
  MapPinIcon, 
  GlobeAltIcon, 
  ExclamationTriangleIcon,
  XMarkIcon,
  PlusIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import { 
  MagnifyingGlassIcon as MagnifyingGlassOutline,
  FunnelIcon as FunnelOutline
} from '@heroicons/react/24/outline';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Avatar from '@/components/Avatar';
import Loader from '@/components/Loader';
import useUserStore from '@/store/useUserStore';
import useToastStore from '@/store/useToastStore';
import { apiFetch } from '@/utils/api';

// Swap Modal Component
function SwapModal({ swap, user, onClose, handleAcceptSwap, acceptingId }) {
  if (!swap) return null;

  const isProposer = user && swap.sender?._id === user._id;
  const isAcceptor = user && swap.receiver?._id === user._id;
  const canChat = swap.status === 'accepted' || isProposer;

  const handleChat = () => {
    window.location.href = `/swap/${swap._id}`;
  };

  const handleContact = () => {
    // TODO: Implement contact functionality
    alert('Contact feature coming soon!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl relative animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white rounded-t-2xl">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">Swap Details</h2>
          <p className="text-primary-100 mt-1">Review the skill exchange offer</p>
        </div>

        <div className="p-6 space-y-6">
          {/* User Profile */}
          <div className="flex items-center gap-4 p-4 bg-secondary-50 rounded-xl">
            {swap.sender?.avatar ? (
              <img src={swap.sender.avatar} alt={swap.sender.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-primary-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="font-semibold text-secondary-900 text-lg">
                {isProposer ? 'You (Proposer)' : swap.sender?.name}
              </div>
              <div className="text-secondary-600">Skill Provider</div>
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
                  <span key={skill} className="bg-success-100 text-success-800 text-sm px-3 py-1.5 rounded-full font-medium border border-success-200">
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

          {/* Message */}
          {swap.message && (
            <div>
              <div className="text-sm font-semibold text-secondary-700 mb-2">Message</div>
              <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-200">
                <p className="text-secondary-700 italic">"{swap.message}"</p>
              </div>
            </div>
          )}

          {/* Additional Info */}
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

          {/* Urgent Indicator */}
          {swap.isUrgent && (
            <div className="flex items-center gap-3 text-sm p-3 bg-error-50 rounded-xl border border-error-200">
              <ExclamationTriangleIcon className="w-5 h-5 text-error-600" />
              <span className="font-semibold text-error-800">This is an urgent request</span>
            </div>
          )}

          {/* Acceptance Info */}
          {swap.receiver && (
            <div className="flex items-center gap-3 text-sm p-3 bg-success-50 rounded-xl border border-success-200">
              <CheckCircleIcon className="w-5 h-5 text-success-600" />
              <span className="text-success-800 font-medium">
                Accepted by: {isAcceptor ? 'You' : swap.receiver?.name}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isProposer && swap.status === 'pending' && (
              <Button
                onClick={handleAcceptSwap}
                className="w-full"
                size="lg"
                loading={acceptingId === swap._id}
                disabled={acceptingId === swap._id}
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Accept Swap
              </Button>
            )}
            {canChat && (
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
            {!isProposer && swap.status === 'pending' && (
              <Button
                onClick={handleContact}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                Contact User
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Skills Page Component
export default function SkillsPage() {
  const { user } = useUserStore();
  const { addToast } = useToastStore();
  const [openSwaps, setOpenSwaps] = useState([]);
  const [swapLoading, setSwapLoading] = useState(true);
  const [swapError, setSwapError] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);
  const [modalSwap, setModalSwap] = useState(null);
  const [swapSearch, setSwapSearch] = useState('');
  const [swapOffered, setSwapOffered] = useState('');
  const [swapRequested, setSwapRequested] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch open swaps
  useEffect(() => {
    async function fetchOpenSwaps() {
      setSwapLoading(true);
      setSwapError('');
      try {
        const data = await apiFetch('/api/swaps/marketplace');
        setOpenSwaps(data);
      } catch (err) {
        setSwapError('Failed to load open swaps. Please try again.');
        console.error('Error fetching swaps:', err);
        addToast({ message: 'Failed to load skill exchanges', type: 'error' });
      } finally {
        setSwapLoading(false);
      }
    }
    fetchOpenSwaps();
  }, []);

  const handleAcceptSwap = async () => {
    if (!modalSwap) return;
    
    setAcceptingId(modalSwap._id);
    try {
      await apiFetch(`/api/swaps/${modalSwap._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'accepted' })
      });
      
      // Update local state
      setOpenSwaps(prev => prev.filter(swap => swap._id !== modalSwap._id));
      setModalSwap(null);
      
      // Show success toast
      addToast({ message: 'Swap accepted! You can now chat with the user.', type: 'success' });
    } catch (err) {
      console.error('Error accepting swap:', err);
      addToast({ message: 'Failed to accept swap. Please try again.', type: 'error' });
    } finally {
      setAcceptingId(null);
    }
   };

  // Filter swaps based on search and filters
  const filteredSwaps = openSwaps.filter(swap => {
    const matchesSearch = swapSearch === '' || 
      swap.requestedSkill.toLowerCase().includes(swapSearch.toLowerCase()) ||
      swap.message?.toLowerCase().includes(swapSearch.toLowerCase()) ||
      swap.sender?.name?.toLowerCase().includes(swapSearch.toLowerCase());
    
    const matchesOffered = swapOffered === '' || 
      (Array.isArray(swap.offeredSkill) ? swap.offeredSkill : [swap.offeredSkill])
        .some(skill => skill.toLowerCase().includes(swapOffered.toLowerCase()));
    
    const matchesRequested = swapRequested === '' || 
      swap.requestedSkill.toLowerCase().includes(swapRequested.toLowerCase());
    
    return matchesSearch && matchesOffered && matchesRequested;
  });

  const clearFilters = () => {
    setSwapSearch('');
    setSwapOffered('');
    setSwapRequested('');
  };

  const hasActiveFilters = swapSearch || swapOffered || swapRequested;

  return (
    <>
      <Head>
        <title>Skills Marketplace - SkillSwap</title>
        <meta name="description" content="Browse and exchange skills with professionals" />
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
              <h1 className="text-4xl font-bold text-secondary-900">Skills Marketplace</h1>
              <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
                Discover skill exchange opportunities and connect with talented professionals
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassOutline className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Search for skills, users, or messages..."
                value={swapSearch}
                onChange={(e) => setSwapSearch(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 text-secondary-900 placeholder-secondary-500 bg-white/80 backdrop-blur-sm border border-secondary-300/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 input-focus shadow-sm"
              />
            </div>

            {/* Filters Toggle */}
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <FunnelOutline className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-secondary-600 hover:text-secondary-800"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card variant="primary" className="animate-slide-down">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Filter by Offered Skills"
                    placeholder="e.g., React, Design, Writing"
                    value={swapOffered}
                    onChange={(e) => setSwapOffered(e.target.value)}
                  />
                  <Input
                    label="Filter by Requested Skills"
                    placeholder="e.g., Python, Marketing, Photography"
                    value={swapRequested}
                    onChange={(e) => setSwapRequested(e.target.value)}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Loading State */}
          {swapLoading && (
            <div className="text-center py-12">
              <Loader />
              <p className="text-secondary-600 dark:text-secondary-400 text-lg mt-4">Loading skill exchanges...</p>
            </div>
          )}

          {/* Error State */}
          {swapError && !swapLoading && (
            <Card variant="error" className="text-center py-8">
              <ExclamationTriangleIcon className="w-12 h-12 text-error-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-error-800 mb-2">Failed to Load Swaps</h3>
              <p className="text-error-600 mb-4">{swapError}</p>
              <Button onClick={() => window.location.reload()} variant="error">
                Try Again
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {!swapLoading && !swapError && filteredSwaps.length === 0 && (
            <Card variant="secondary" className="text-center py-12">
              <SparklesIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                {hasActiveFilters ? 'No matches found' : 'No skill exchanges available'}
              </h3>
              <p className="text-secondary-600 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your search or filters to find more results.'
                  : 'Be the first to create a skill exchange opportunity!'
                }
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearFilters} variant="primary">
                  Clear Filters
                </Button>
              ) : (
                <Button as="a" href="/swap" variant="primary">
                  Create Skill Exchange
                </Button>
              )}
            </Card>
          )}

          {/* Results Grid */}
          {!swapLoading && !swapError && filteredSwaps.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-secondary-900">
                  {filteredSwaps.length} Skill Exchange{filteredSwaps.length !== 1 ? 's' : ''} Available
                </h2>
                {hasActiveFilters && (
                  <span className="text-sm text-secondary-600">
                    Filtered results
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSwaps.map((swap) => (
                  <Card 
                    key={swap._id} 
                    hover 
                    fullWidth
                    className="cursor-pointer animate-fade-in"
                    onClick={() => setModalSwap(swap)}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar src={swap.sender?.avatar} name={swap.sender?.name} size={48} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-secondary-900 truncate">
                          {swap.sender?.name || 'Anonymous'}
                        </h3>
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4 text-accent-500 fill-current" />
                          <span className="text-sm text-secondary-600">4.8 (12)</span>
                        </div>
                      </div>
                    </div>

                    {/* Skills Exchange */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="text-xs font-medium text-secondary-600 uppercase tracking-wide mb-2">
                          Offering
                        </div>
                        <div className="flex flex-wrap gap-1">
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
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium text-secondary-600 uppercase tracking-wide mb-2">
                          Looking for
                        </div>
                        <div className="bg-primary-50 px-3 py-2 rounded-lg border border-primary-200">
                          <span className="text-primary-800 font-medium text-sm">{swap.requestedSkill}</span>
                        </div>
                      </div>
                    </div>

                    {/* Message Preview */}
                    {swap.message && (
                      <div className="mb-4">
                        <p className="text-secondary-600 text-sm line-clamp-2 italic">
                          "{swap.message}"
                        </p>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-xs text-secondary-500 mb-4">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(swap.createdAt).toLocaleDateString()}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        swap.difficultyLevel === 'Beginner' ? 'bg-success-100 text-success-800' :
                        swap.difficultyLevel === 'Intermediate' ? 'bg-warning-100 text-warning-800' :
                        swap.difficultyLevel === 'Advanced' ? 'bg-error-100 text-error-800' :
                        'bg-secondary-100 text-secondary-800'
                      }`}>
                        {swap.difficultyLevel || 'Intermediate'}
                      </div>
                    </div>

                    {/* Urgent Indicator */}
                    {swap.isUrgent && (
                      <div className="flex items-center gap-2 text-xs text-error-600 mb-4">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        <span className="font-medium">Urgent Request</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      variant="primary" 
                      fullWidth
                      className="mt-2"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Swap Modal */}
        {modalSwap && (
          <SwapModal
            swap={modalSwap}
            user={user}
            onClose={() => setModalSwap(null)}
            handleAcceptSwap={handleAcceptSwap}
            acceptingId={acceptingId}
          />
        )}
      </div>
    </>
  );
}

