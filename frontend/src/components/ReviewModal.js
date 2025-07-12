import { useState, useEffect } from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Avatar from './Avatar';
import { apiFetch } from '../utils/api';

export default function ReviewModal({ swap, otherUser, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    // Check if user has already reviewed this swap
    const checkExistingReview = async () => {
      try {
        const reviews = await apiFetch(`/api/reviews/swap/${swap._id}`);
        // Find review where current user is the reviewer
        // We need to determine if current user is sender or receiver
        const isCurrentUserSender = swap.sender._id === otherUser._id ? false : true;
        const currentUserId = isCurrentUserSender ? swap.sender._id : swap.receiver._id;
        
        const userReview = reviews.find(review => review.reviewer._id === currentUserId);
        if (userReview) {
          setExistingReview(userReview);
        }
      } catch (err) {
        console.error('Error checking existing review:', err);
      }
    };

    if (swap.status === 'completed' && otherUser) {
      checkExistingReview();
    }
  }, [swap._id, swap.status, otherUser]);

  // Check if current user can rate the other user
  const canRate = () => {
    if (!swap || swap.status !== 'completed') return false;
    
    // Check if user has already reviewed
    if (existingReview) return false;
    
    // Check if user has permission to rate
    // We need to determine if current user is sender or receiver in this swap
    // If otherUser is the sender, then current user must be the receiver
    // If otherUser is the receiver, then current user must be the sender
    const isCurrentUserSender = swap.sender._id !== otherUser._id;
    
    // If current user is sender, they can rate receiver if senderCanRateReceiver is true
    // If current user is receiver, they can rate sender if receiverCanRateSender is true
    const canRateResult = isCurrentUserSender ? swap.senderCanRateReceiver : swap.receiverCanRateSender;
    
   
    
    return canRateResult;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Please provide feedback');
      return;
    }

    if (swap.status !== 'completed') {
      setError('Can only review completed swaps');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          revieweeId: otherUser._id,
          swapId: swap._id,
          rating,
          feedback: feedback.trim(),
        }),
      });
      
      onReviewSubmitted();
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If swap is not completed, show message
  if (swap.status !== 'completed') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Review Not Available</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              Reviews are only available after both parties have completed and approved their tasks.
            </div>
            <div className="text-sm text-gray-400">
              Current status: <span className="font-medium capitalize">{swap.status.replace('_', ' ')}</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user cannot rate, show message
  if (!canRate()) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Rating Not Available</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              You can only rate after you have approved the other person's work.
            </div>
            <div className="text-sm text-gray-400">
              Approve their completed work to enable rating.
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user has already reviewed, show their review
  if (existingReview) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Review</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <Avatar
              src={otherUser?.avatar}
              name={otherUser?.name}
              size={40}
            />
            <div>
              <p className="font-medium text-gray-900">{otherUser?.name || 'Anonymous User'}</p>
              <p className="text-sm text-gray-600">Swap completed successfully</p>
            </div>
          </div>

          {/* Existing Review */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIconSolid 
                    key={star} 
                    className={`w-8 h-8 ${existingReview.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <div className="bg-gray-50 rounded-lg p-3 text-gray-700">
                {existingReview.feedback || 'No feedback provided'}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Reviewed on {new Date(existingReview.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Rate Your Experience</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <Avatar
            src={otherUser?.avatar}
            name={otherUser?.name}
            size={40}
          />
          <div>
            <p className="font-medium text-gray-900">{otherUser?.name || 'Anonymous User'}</p>
            <p className="text-sm text-gray-600">Swap completed successfully</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate this experience?
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl transition-colors hover:scale-110"
                >
                  {rating >= star ? (
                    <StarIconSolid className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience with this swap..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {feedback.length}/500 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={submitting}
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting || !feedback.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 