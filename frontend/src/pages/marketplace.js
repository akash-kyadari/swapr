import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { apiFetch } from '../utils/api';

export default function Marketplace() {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ needed: '', offered: '' });

  useEffect(() => {
    async function fetchSwaps() {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetch('/api/swaps/marketplace');
        setSwaps(data);
      } catch (err) {
        setError('Failed to load swaps.');
      } finally {
        setLoading(false);
      }
    }
    fetchSwaps();
  }, []);

  // Filtering logic
  const filteredSwaps = swaps.filter(swap => {
    const neededMatch = filter.needed
      ? swap.requestedSkill?.toLowerCase().includes(filter.needed.toLowerCase())
      : true;
    const offeredMatch = filter.offered
      ? swap.offeredSkill?.toLowerCase().includes(filter.offered.toLowerCase())
      : true;
    return neededMatch && offeredMatch;
  });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-4xl font-bold text-center text-primary mb-8">SkillSwap Marketplace</h1>
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        <Input
          placeholder="Filter by needed skill (e.g. Web Development)"
          value={filter.needed}
          onChange={e => setFilter({ ...filter, needed: e.target.value })}
          className="w-full md:w-72"
        />
        <Input
          placeholder="Filter by offered skill (e.g. UI/UX Design)"
          value={filter.offered}
          onChange={e => setFilter({ ...filter, offered: e.target.value })}
          className="w-full md:w-72"
        />
      </div>
      {loading ? (
        <div className="text-center text-lg text-slate-500">Loading swaps...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : filteredSwaps.length === 0 ? (
        <div className="text-center text-slate-500">No open swaps found. Try adjusting your filters.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSwaps.map(swap => (
            <Card key={swap._id} className="space-y-4 p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={swap.sender?.avatar || '/public/avatar.png'}
                  alt={swap.sender?.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="font-semibold text-lg text-primaryDark">{swap.sender?.name || 'Anonymous'}</div>
                  <div className="text-xs text-slate-500">Offering: <span className="font-medium text-primary">{swap.offeredSkill}</span></div>
                </div>
              </div>
              <div className="text-slate-700 text-base mb-2">
                <span className="font-semibold text-accent">Needs:</span> {swap.requestedSkill}
              </div>
              <div className="text-slate-600 text-sm mb-4">
                {swap.message}
              </div>
              <Button as="a" href={`/swap/${swap._id}`} variant="primary" className="w-full">
                View & Accept Swap
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 