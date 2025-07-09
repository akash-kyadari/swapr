import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Avatar from '../../components/Avatar';
import SwapStatus from '../../components/SwapStatus';
import ReviewModal from '../../components/ReviewModal';
import useUserStore from '../../store/useUserStore';
import useToastStore from '../../store/useToastStore';
import Loader from '../../components/Loader';
import { apiFetch } from '../../utils/api';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import Navigation from '../../components/Navigation';

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
  const [approving, setApproving] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const messagesEndRef = useRef(null);
  const { addToast } = useToastStore();

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
        addToast({ message: 'Failed to load swap', type: 'error' });
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
      addToast({ message: 'Failed to send message', type: 'error' });
    }
  };

  const handleCompleteTask = async () => {
    setCompleting(true);
    try {
      await apiFetch(`/api/swaps/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'task_completed' }),
      });
      const swapData = await apiFetch(`/api/swaps/${id}`);
      setSwap(swapData);
      addToast({ message: 'Task marked as complete!', type: 'success' });
    } catch (err) {
      setError('Failed to mark task as complete.');
      addToast({ message: 'Failed to mark task as complete', type: 'error' });
    } finally {
      setCompleting(false);
    }
  };

  const handleApproveTask = async () => {
    setApproving(true);
    try {
      await apiFetch(`/api/swaps/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ approval: 'approve' }),
      });
      const swapData = await apiFetch(`/api/swaps/${id}`);
      setSwap(swapData);
      addToast({ message: 'Task approved!', type: 'success' });
    } catch (err) {
      setError('Failed to approve task.');
      addToast({ message: 'Failed to approve task', type: 'error' });
    } finally {
      setApproving(false);
    }
  };

  const handleReportIssue = async (reason) => {
    setReporting(true);
    try {
      await apiFetch(`/api/swaps/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'incomplete', reason }),
      });
      const swapData = await apiFetch(`/api/swaps/${id}`);
      setSwap(swapData);
      addToast({ message: 'Issue reported successfully', type: 'success' });
    } catch (err) {
      setError('Failed to report issue.');
      addToast({ message: 'Failed to report issue', type: 'error' });
    } finally {
      setReporting(false);
    }
  };

  const handleReviewSubmitted = () => {
    setReviewed(true);
    setShowReviewModal(false);
    addToast({ message: 'Review submitted successfully!', type: 'success' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-700">
      <div className="text-center">
        <Loader />
        <p className="text-secondary-600 dark:text-secondary-300 mt-4">Loading swap...</p>
      </div>
    </div>
  );
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!swap) return null;

  const otherUser = swap.sender._id === user._id ? swap.receiver : swap.sender;
  const canChat = swap.status === 'in_progress' || swap.status === 'sender_completed' || swap.status === 'receiver_completed';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <Navigation />
      <div className="flex-1 flex flex-col justify-start max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
          {/* Sidebar: Task Info */}
          <div className="col-span-1 space-y-6">
            <Card className="p-6">
              <SwapStatus
                swap={swap}
                currentUser={user}
                onComplete={handleCompleteTask}
                onApprove={handleApproveTask}
                onReport={handleReportIssue}
              />
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-2">
                <Avatar src={otherUser?.avatar} name={otherUser?.name} size={48} />
                <div>
                  <div className="font-semibold text-xl text-primaryDark">{otherUser?.name || 'Anonymous'}</div>
                  <div className="text-xs text-slate-500">You offered: <span className="font-medium text-primary">{swap.offeredSkill}</span></div>
                  <div className="text-xs text-slate-500">Needs: <span className="font-medium text-accent">{swap.requestedSkill}</span></div>
                </div>
              </div>
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
              <div className="text-slate-700 text-base mt-2 whitespace-pre-line">{swap.message}</div>
              <div className="mt-4 text-xs text-slate-500">
                <div>Proposer Deadline: <span className="font-medium">{swap.proposerDeadline ? new Date(swap.proposerDeadline).toLocaleString() : 'N/A'}</span></div>
                <div>Acceptor Deadline: <span className="font-medium">{swap.acceptorDeadline ? new Date(swap.acceptorDeadline).toLocaleString() : 'N/A'}</span></div>
                <div>Status: <span className="font-medium capitalize">{swap.status}</span></div>
              </div>
            </Card>
          </div>
          {/* Main: New Chat Section */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-8">
            {canChat && (
              <div className="flex flex-col h-[32rem] bg-white rounded-2xl shadow border border-secondary-200 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={msg._id || idx} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl shadow text-sm ${msg.sender === user._id ? 'bg-primary-100 text-primary-900' : 'bg-secondary-100 text-secondary-900'}`}>
                        {msg.content}
                        <div className="text-xs text-secondary-400 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center border-t border-secondary-100 p-4 bg-white">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 rounded-xl border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    disabled={swap.status === 'completed' || swap.status === 'incomplete'}
                  />
                  <Button type="submit" className="ml-2" disabled={!message.trim() || swap.status === 'completed' || swap.status === 'incomplete'}>
                    Send
                  </Button>
                </form>
              </div>
            )}
            {/* Review Section */}
            {swap.status === 'completed' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-primaryDark">Swap Completed!</h3>
                  <Button
                    onClick={() => setShowReviewModal(true)}
                    variant="primary"
                    disabled={reviewed}
                  >
                    {reviewed ? 'Review Submitted' : 'Leave Review'}
                  </Button>
                </div>
                <p className="text-slate-600">
                  Congratulations! Both parties have completed and approved their tasks. 
                  You can now leave a review for your swap partner.
                </p>
              </Card>
            )}
            {/* Review Modal */}
            {showReviewModal && (
              <ReviewModal
                swap={swap}
                otherUser={otherUser}
                onClose={() => setShowReviewModal(false)}
                onReviewSubmitted={handleReviewSubmitted}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 