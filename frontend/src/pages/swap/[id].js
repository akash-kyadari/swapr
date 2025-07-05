import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ChatContainer from '../../components/ChatContainer';
import useUserStore from '../../store/useUserStore';
import { apiFetch } from '../../utils/api';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export default function SwapDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUserStore();
  const [swap, setSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [review, setReview] = useState({ rating: 5, feedback: '' });
  const [reviewed, setReviewed] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    async function fetchSwap() {
      setLoading(true);
      setError('');
      try {
        const swapData = await apiFetch(`/api/swaps/${id}`);
        setSwap(swapData);
        const msgs = await apiFetch(`/api/messages/${id}`);
        setMessages(msgs);
      } catch (err) {
        setError('Failed to load swap.');
      } finally {
        setLoading(false);
      }
    }
    fetchSwap();
  }, [id]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ swapId: id, content: message }),
      });
      setMessage('');
      const msgs = await apiFetch(`/api/messages/${id}`);
      setMessages(msgs);
    } catch (err) {
      setError('Failed to send message.');
    }
  };

  const handleMarkComplete = async () => {
    setCompleting(true);
    try {
      await apiFetch(`/api/swaps/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' }),
      });
      const swapData = await apiFetch(`/api/swaps/${id}`);
      setSwap(swapData);
    } catch (err) {
      setError('Failed to mark as complete.');
    } finally {
      setCompleting(false);
    }
  };

  const handleReviewSubmit = async e => {
    e.preventDefault();
    try {
      await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          revieweeId: swap.sender._id === user._id ? swap.receiver._id : swap.sender._id,
          swapId: id,
          rating: review.rating,
          feedback: review.feedback,
        }),
      });
      setReviewed(true);
    } catch (err) {
      setError('Failed to submit review.');
    }
  };

  if (loading) return <div className="text-center py-10 text-lg text-slate-500">Loading swap...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!swap) return null;

  const otherUser = swap.sender._id === user._id ? swap.receiver : swap.sender;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img src={otherUser?.avatar || '/public/avatar.png'} alt={otherUser?.name || 'User'} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
          <div>
            <div className="font-semibold text-xl text-primaryDark">{otherUser?.name || 'Anonymous'}</div>
            <div className="text-xs text-slate-500">{swap.sender._id === user._id ? 'You offered' : 'They offered'}: <span className="font-medium text-primary">{swap.offeredSkill}</span></div>
            <div className="text-xs text-slate-500">Needs: <span className="font-medium text-accent">{swap.requestedSkill}</span></div>
            <div className="flex items-center gap-2 mt-1">
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
          </div>
        </div>
        <div className="text-slate-700 text-base mt-2">{swap.message}</div>
        <div className="flex gap-4 mt-4">
          {swap.status !== 'completed' && (
            <Button variant="primary" loading={completing} onClick={handleMarkComplete}>
              Mark as Complete
            </Button>
          )}
        </div>
      </Card>
      {/* Chat Section */}
      <div className="h-96">
        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUserId={user._id}
          disabled={swap.status === 'completed'}
          className="h-full"
          swapId={id}
          otherUserName={otherUser?.name || 'Partner'}
        />
      </div>
      {/* Review Section */}
      {swap.status === 'completed' && !reviewed && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-2 text-primaryDark">Leave a Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-700">Rating:</span>
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`text-2xl ${review.rating >= star ? 'text-yellow-400' : 'text-slate-300'}`}
                  onClick={() => setReview(r => ({ ...r, rating: star }))}
                >★</button>
              ))}
            </div>
            <Input
              value={review.feedback}
              onChange={e => setReview(r => ({ ...r, feedback: e.target.value }))}
              placeholder="Write your feedback..."
            />
            <Button type="submit" variant="primary">Submit Review</Button>
          </form>
        </Card>
      )}
      {reviewed && (
        <Card className="p-6 text-green-600 font-semibold text-center">Thank you for your review!</Card>
      )}
    </div>
  );
} 