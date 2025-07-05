'use client';
import { useEffect, useState } from 'react';
import { ArrowRightIcon, SparklesIcon, XMarkIcon, UserCircleIcon, FunnelIcon, FireIcon, CalendarIcon, ClockIcon, CheckCircleIcon, UserIcon, ChatBubbleLeftRightIcon, StarIcon, MapPinIcon, GlobeAltIcon, ClockIcon as ClockIconOutline, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import useUserStore from '@/store/useUserStore';
import { apiFetch } from '@/utils/api';

function SwapModal({ swap, user, onClose, handleAcceptSwap, acceptingId }) {
  if (!swap) return null;

  const isProposer = user && swap.sender?._id === user._id;
  const isAcceptor = user && swap.receiver?._id === user._id;
  const canChat = swap.status === 'accepted' || isProposer;

  const handleChat = () => {
    // TODO: Implement chat functionality
    alert('Chat feature coming soon!');
  };

  const handleContact = () => {
    // TODO: Implement contact functionality
    alert('Contact feature coming soon!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-xl shadow-xl relative">
        {/* Header */}
        <div className="bg-gray-900 p-4 text-white rounded-t-xl">
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold">Swap Details</h2>
        </div>

        <div className="p-4 space-y-4">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {swap.sender?.avatar ? (
              <img src={swap.sender.avatar} alt={swap.sender.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <UserCircleIcon className="w-12 h-12 text-gray-400" />
            )}
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{isProposer ? 'You (Proposer)' : swap.sender?.name}</div>
              <div className="text-sm text-gray-600">Skill Provider</div>
              {/* User Rating - would come from user data */}
              <div className="flex items-center gap-1 mt-1">
                <StarIcon className="w-3 h-3 text-yellow-500" />
                <span className="text-xs text-gray-600">4.8 (12 reviews)</span>
              </div>
            </div>
          </div>

          {/* Skills Exchange */}
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Offering
              </div>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(swap.offeredSkill) ? swap.offeredSkill : [swap.offeredSkill]).map((skill) => (
                  <span key={skill} className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <FireIcon className="w-3 h-3 text-orange-500" />
                Looking for
              </div>
              <div className="bg-blue-50 px-3 py-2 rounded border border-blue-200">
                <span className="text-blue-800 font-medium">{swap.requestedSkill}</span>
              </div>
            </div>
          </div>

          {/* Message */}
          {swap.message && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Message</div>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="text-gray-700 italic text-sm">"{swap.message}"</p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-gray-900 capitalize">{swap.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Difficulty</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                swap.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-800' :
                swap.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                swap.difficultyLevel === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {swap.difficultyLevel || 'Intermediate'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Created</span>
              <span className="font-medium text-gray-900">{new Date(swap.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Urgent Indicator */}
          {swap.isUrgent && (
            <div className="flex items-center gap-2 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-red-800">Is Urgent</span>
            </div>
          )}

          {/* Acceptance Info */}
          {swap.receiver && (
            <div className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded border border-green-200">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-green-800">
                Accepted by: {isAcceptor ? 'You' : swap.receiver?.name}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {!isProposer && swap.status === 'pending' && (
              <Button
                onClick={handleAcceptSwap}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                loading={acceptingId === swap._id}
                disabled={acceptingId === swap._id}
              >
                Accept Swap
              </Button>
            )}
            {canChat && (
              <Button
                onClick={handleChat}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                Open Chat
              </Button>
            )}
            {!isProposer && swap.status === 'pending' && (
              <Button
                onClick={handleContact}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
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

export default function SkillsPage() {
  const { user } = useUserStore();
  const [openSwaps, setOpenSwaps] = useState([]);
  const [swapLoading, setSwapLoading] = useState(true);
  const [swapError, setSwapError] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);
  const [modalSwap, setModalSwap] = useState(null);
  const [swapSearch, setSwapSearch] = useState('');
  const [swapOffered, setSwapOffered] = useState('');
  const [swapRequested, setSwapRequested] = useState('');

  // Fetch open swaps
  useEffect(() => {
    async function fetchOpenSwaps() {
      setSwapLoading(true);
      setSwapError('');
      try {
        const data = await apiFetch('/api/swaps/marketplace');
        setOpenSwaps(data);
      } catch {
        setSwapError('Failed to load open swaps.');
      } finally {
        setSwapLoading(false);
      }
    }
    fetchOpenSwaps();
  }, []);

  // Accept a swap
  const handleAcceptSwap = async () => {
    if (!modalSwap) return;
    setAcceptingId(modalSwap._id);
    try {
      await apiFetch(`/api/swaps/${modalSwap._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'accepted' }),
      });
      setOpenSwaps(openSwaps.filter(s => s._id !== modalSwap._id));
      setModalSwap(null); // Close modal after successful acceptance
    } catch {
      alert('Failed to accept swap.');
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredSwaps = openSwaps.filter(swap => {
    const offered = (Array.isArray(swap.offeredSkill) ? swap.offeredSkill.join(' ') : swap.offeredSkill || '').toLowerCase();
    const requested = (swap.requestedSkill || '').toLowerCase();
    const sender = (swap.sender?.name || '').toLowerCase();
    return (
      (!swapSearch || sender.includes(swapSearch.toLowerCase())) &&
      (!swapOffered || offered.includes(swapOffered.toLowerCase())) &&
      (!swapRequested || requested.includes(swapRequested.toLowerCase()))
    );
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Marketplace</h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Find and exchange skills with talented individuals in our community
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Filter Swaps</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input 
              placeholder="Search by sender..." 
              value={swapSearch} 
              onChange={(e) => setSwapSearch(e.target.value)} 
              className="w-full" 
            />
            <Input 
              placeholder="Filter by offered skill..." 
              value={swapOffered} 
              onChange={(e) => setSwapOffered(e.target.value)} 
              className="w-full" 
            />
            <Input 
              placeholder="Filter by requested skill..." 
              value={swapRequested} 
              onChange={(e) => setSwapRequested(e.target.value)} 
              className="w-full" 
            />
            <Button 
              onClick={() => { setSwapSearch(''); setSwapOffered(''); setSwapRequested(''); }}
              variant="secondary"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Available Swaps</h2>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {filteredSwaps.length} {filteredSwaps.length === 1 ? 'offer' : 'offers'}
            </span>
          </div>

          {/* Loading */}
          {swapLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center gap-3 text-gray-600">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading swap offers...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {swapError && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center gap-3 text-red-600">
                <XMarkIcon className="w-5 h-5" />
                <span>{swapError}</span>
              </div>
            </div>
          )}

          {/* Empty */}
          {!swapLoading && !swapError && filteredSwaps.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="space-y-4">
                <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No swap offers found</h3>
                  <p className="text-gray-600">Try adjusting your filters or check back later.</p>
                </div>
              </div>
            </div>
          )}

          {/* Swap Cards */}
          {!swapLoading && !swapError && filteredSwaps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSwaps.map((swap) => {
                const isProposer = user && swap.sender?._id === user._id;
                return (
                  <div
                    key={swap._id}
                    onClick={() => setModalSwap(swap)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Avatar src={swap.sender?.avatar} name={swap.sender?.name} size={48} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{swap.sender?.name}</div>
                          {isProposer && (
                            <span className="text-xs text-blue-600 font-medium">Your offer</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Offered Skills */}
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Offering</div>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(swap.offeredSkill) ? swap.offeredSkill : [swap.offeredSkill]).map((skill) => (
                            <span key={skill} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Requested Skill */}
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Looking for</div>
                        <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                          <span className="text-blue-800 font-medium">{swap.requestedSkill}</span>
                        </div>
                      </div>

                      {/* Message */}
                      {swap.message && (
                        <div className="text-sm text-gray-600 italic line-clamp-2">
                          "{swap.message}"
                        </div>
                      )}

                      {/* Status & Date */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            {swap.status}
                          </span>
                          {swap.isUrgent && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              Urgent
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(swap.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalSwap && <SwapModal swap={modalSwap} user={user} onClose={() => setModalSwap(null)} handleAcceptSwap={handleAcceptSwap} acceptingId={acceptingId} />}
    </div>
  );
}

