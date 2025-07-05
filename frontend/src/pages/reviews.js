import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Avatar from '../components/Avatar';
import { apiFetch } from '../utils/api';
import useUserStore from '../store/useUserStore';

export default function Reviews() {
  const { user } = useUserStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ rating: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  // Fetch reviews for the logged-in user
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError('');
      try {
        if (!user?._id) return;
        const data = await apiFetch(`/api/reviews/${user._id}`);
        setReviews(data.reviews || data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchReviews();
  }, [user]);

  // Handle form input
  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Submit review
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          rating: form.rating,
          comment: form.comment,
          user: user._id,
        }),
      });
      setSuccess('Review submitted!');
      setForm({ rating: '', comment: '' });
      // Refresh reviews
      const data = await apiFetch(`/api/reviews/${user._id}`);
      setReviews(data.reviews || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-2 sm:px-6">
      <h2 className="text-3xl font-bold text-primary mb-6">Reviews</h2>
      <Card variant="gradient">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
              <select
                name="rating"
                value={form.rating}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-textgray focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">Select rating</option>
                {[5,4,3,2,1].map(r => (
                  <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <Input
                label="Comment"
                name="comment"
                value={form.comment}
                onChange={handleChange}
                placeholder="Write your review..."
                required
              />
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>Submit Review</Button>
            {success && <span className="text-success font-medium">{success}</span>}
            {error && <span className="text-error font-medium">{error}</span>}
          </div>
        </form>
      </Card>
      <Card>
        <h3 className="font-semibold mb-4 text-lg text-primaryDark">Your Reviews</h3>
        {loading ? (
          <div className="text-primary py-8">Loading reviews...</div>
        ) : error ? (
          <div className="text-error py-8">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="text-textgray py-8">No reviews yet.</div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="border border-muted rounded-xl p-4 flex items-center gap-4 bg-muted/50">
                <Avatar src={review.reviewer?.avatar} name={review.reviewer?.name} size={40} />
                <div className="flex-1">
                  <div className="font-semibold text-primaryDark">{review.reviewer?.name || 'Anonymous'}</div>
                  <div className="flex items-center gap-1 text-accent text-sm">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                    {Array.from({ length: 5 - review.rating }).map((_, i) => (
                      <span key={i} className="text-muted">★</span>
                    ))}
                  </div>
                  <div className="text-textgray mt-1">{review.comment}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
} 