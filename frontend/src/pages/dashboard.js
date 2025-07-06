import { useEffect, useState } from 'react';
import useUserStore from '../store/useUserStore';
import useToastStore from '../store/useToastStore';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { apiFetch } from '../utils/api';
import { XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function SwapModal({ swap, user, onClose }) {
  if (!swap) return null;
  const isProposer = user && swap.sender?._id === user._id;
  const isAcceptor = user && swap.receiver?._id === user._id;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-primary" aria-label="Close modal">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4 mb-4">
          {swap.sender?.avatar ? (
            <img src={swap.sender.avatar} alt={swap.sender.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
          ) : (
            <UserCircleIcon className="w-10 h-10 text-blue-600" />
          )}
          <div>
            <div className="font-bold text-lg text-primaryDark flex items-center gap-1">
              {isProposer ? 'You (Proposer)' : swap.sender?.name || 'Unknown'}
            </div>
            <div className="text-xs text-textgray mt-1">Offering: <span className="font-medium text-primary">{swap.offeredSkill}</span></div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold">Needs: {swap.requestedSkill}</span>
        </div>
        {swap.message && (
          <div className="text-slate-600 text-sm italic border-l-4 border-accent/30 pl-4 mb-4">"{swap.message}"</div>
        )}
        <div className="mt-4 space-y-2">
          <div>Status: <span className="font-semibold text-primaryDark">{swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}</span></div>
          <div>Difficulty: <span className="font-semibold text-primaryDark">{swap.difficultyLevel || 'Intermediate'}</span></div>
          {swap.isUrgent && (
            <div className="flex items-center gap-1 text-red-600">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span className="font-semibold">Urgent</span>
            </div>
          )}
          <div>
            Proposer: <span className="font-semibold text-blue-700">{isProposer ? 'You' : swap.sender?.name || 'Unknown'}</span>
          </div>
          {swap.receiver && (
            <div className="flex items-center gap-2 mt-2">
              {swap.receiver.avatar ? (
                <img src={swap.receiver.avatar} alt={swap.receiver.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-green-600" />
              )}
              <span>Accepted by: <span className="font-semibold text-green-700">{isAcceptor ? 'You' : swap.receiver?.name || 'Unknown'}</span></span>
            </div>
          )}
          <div className="text-xs text-slate-500 mt-2">Created: {swap.createdAt ? new Date(swap.createdAt).toLocaleString() : 'N/A'}</div>
          <div className="text-xs text-slate-500">Last updated: {swap.updatedAt ? new Date(swap.updatedAt).toLocaleString() : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUserStore();
  const [openSwaps, setOpenSwaps] = useState([]);
  const [acceptedSwaps, setAcceptedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalSwap, setModalSwap] = useState(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    async function fetchUserSwaps() {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetch('/api/swaps/user-swaps');
        setOpenSwaps(data.openSwaps || []);
        setAcceptedSwaps(data.acceptedSwaps || []);
      } catch (err) {
        setError('Failed to load your swaps.');
        addToast({ message: 'Failed to load your swaps', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchUserSwaps();
  }, [user]);

  const renderSwapCard = swap => {
    const isProposer = user && swap.sender?._id === user._id;
    const isAcceptor = user && swap.receiver?._id === user._id;
    return (
      <Card key={swap._id} className="mb-4 p-4 border border-slate-200 shadow-md cursor-pointer hover:shadow-lg transition" onClick={() => setModalSwap(swap)}>
        <div className="flex items-center gap-3 mb-2">
          <UserCircleIcon className="w-7 h-7 text-blue-600" />
          <div>
            <div className="font-semibold text-primaryDark">{swap.sender?.name || 'Anonymous'}</div>
            <div className="text-xs text-slate-500">Offering: <span className="font-medium text-primary">{swap.offeredSkill}</span></div>
          </div>
        </div>
        <div className="text-slate-700 text-base mb-1">
          <span className="font-semibold text-accent">Needs:</span> {swap.requestedSkill}
        </div>
        <div className="text-slate-600 text-sm mb-2">{swap.message}</div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {isProposer && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Proposed by you</span>}
          {isAcceptor && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Accepted by you</span>}
          {!isProposer && swap.sender && <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">Proposed by {swap.sender.name}</span>}
          {swap.receiver && !isAcceptor && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Accepted by {swap.receiver.name}</span>}
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            swap.difficultyLevel === 'Beginner' ? 'bg-green-100 text-green-700' :
            swap.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
            swap.difficultyLevel === 'Advanced' ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
            {swap.difficultyLevel || 'Intermediate'}
          </span>
          {swap.isUrgent && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1">
              <ExclamationTriangleIcon className="w-3 h-3" />
              Urgent
            </span>
          )}
        </div>
        <Button as="a" href={`/swap/${swap._id}`} variant="primary" className="w-full mt-3">
          View Swap
        </Button>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background dark:bg-secondary-900 flex flex-col items-center py-12 px-2 sm:px-6">
      <h2 className="text-3xl font-bold text-primary mb-6">Dashboard</h2>
      {loading ? (
        <div className="text-center py-12">
          <Loader />
          <p className="text-secondary-600 dark:text-secondary-400 mt-4">Loading your swaps...</p>
        </div>
      ) : error ? (
        <div className="text-center text-error-600">{error}</div>
      ) : (
        <>
          <Card className="max-w-3xl">
            <h3 className="font-semibold mb-2">Your Open Swaps</h3>
            {openSwaps.length === 0 ? (
              <div className="text-textgray">No open swaps yet.</div>
            ) : (
              openSwaps.map(renderSwapCard)
            )}
          </Card>
          <Card className="max-w-3xl">
            <h3 className="font-semibold mb-2">Accepted Swaps</h3>
            {acceptedSwaps.length === 0 ? (
              <div className="text-textgray">No accepted swaps yet.</div>
            ) : (
              acceptedSwaps.map(renderSwapCard)
            )}
          </Card>
          {modalSwap && <SwapModal swap={modalSwap} user={user} onClose={() => setModalSwap(null)} />}
        </>
      )}
    </div>
  );
} 