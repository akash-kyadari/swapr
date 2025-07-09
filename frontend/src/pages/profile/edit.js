import { useEffect, useState, useRef } from 'react';
import useUserStore from '../../store/useUserStore';
import useToastStore from '../../store/useToastStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Avatar from '../../components/Avatar';
import Loader from '../../components/Loader';
import { apiFetch } from '../../utils/api';

export default function ProfilePage() {
  const { user, setUser } = useUserStore();
  const { addToast } = useToastStore();
  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    timeZone: '',
    skillsOffered: [],
    skillsNeeded: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const skillInputRef = useRef(null);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        timeZone: user.timeZone || '',
        skillsOffered: user.skillsOffered || [],
        skillsNeeded: (user.skillsNeeded || []).join(', '),
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSkillInputKeyDown = e => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !form.skillsOffered.includes(val)) {
        setForm(f => ({ ...f, skillsOffered: [...f.skillsOffered, val] }));
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = skill => {
    setForm(f => ({ ...f, skillsOffered: f.skillsOffered.filter(s => s !== skill) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const body = {
        name: form.name,
        bio: form.bio,
        location: form.location,
        timeZone: form.timeZone,
        skillsOffered: form.skillsOffered,
        skillsNeeded: form.skillsNeeded,
      };
      const updatedUser = await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      setUser(updatedUser);
      setSuccess('Profile updated!');
      addToast({ message: 'Profile updated!', type: 'success' });
      setEditMode(false);
    } catch (err) {
      setError(err.message);
      addToast({ message: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-700">
      <div className="text-center">
        <Loader />
        <p className="text-secondary-600 dark:text-secondary-300 mt-4">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background dark:bg-secondary-900 flex flex-col items-center py-12 px-2 sm:px-6">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">My Profile</h2>
      <Card className="w-full max-w-2xl shadow-card rounded-3xl p-6 sm:p-10 animate-fade-in">
        <div className="flex flex-col items-center gap-6 mb-6">
          <Avatar src={form.avatar} name={form.name} size={80} />
        </div>
        {!editMode ? (
          <div className="space-y-4 text-base text-secondary-800">
            <div>
              <span className="font-semibold text-secondary-700">Name:</span> {user.name}
            </div>
            <div>
              <span className="font-semibold text-secondary-700">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-semibold text-secondary-700">Bio:</span> {user.bio || <span className="text-textgray">(none)</span>}
            </div>
            <div>
              <span className="font-semibold text-secondary-700">Location:</span> {user.location || <span className="text-textgray">(none)</span>}
            </div>
            <div>
              <span className="font-semibold text-secondary-700">Time Zone:</span> {user.timeZone || <span className="text-textgray">(none)</span>}
            </div>
            <div>
              <span className="font-semibold text-secondary-700">Skills Offered:</span> {(user.skillsOffered && user.skillsOffered.length) ? user.skillsOffered.join(', ') : <span className="text-textgray">(none)</span>}
            </div>
            
            <button
  type="button"
  onClick={() => setEditMode(true)}
  className="mt-4 w-full text-lg px-6 py-3 rounded-2xl font-semibold shadow-md bg-blue-600 hover:bg-blue-700 text-white transition"
>
  Edit Profile
</button>

          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
              size="lg"
            />
            <Input
              label="Bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              fullWidth
              size="lg"
            />
            <Input
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="City, Country"
              fullWidth
              size="lg"
            />
            <Input
              label="Time Zone"
              name="timeZone"
              value={form.timeZone}
              onChange={handleChange}
              placeholder="e.g. GMT+5:30"
              fullWidth
              size="lg"
            />
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Skills You Offer</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.skillsOffered.map(skill => (
                  <span key={skill} className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20 shadow-sm animate-fadeIn">
                    {skill}
                    <button
                      type="button"
                      className="ml-2 text-primary hover:text-error-500 focus:outline-none rounded-full p-1 transition-colors duration-150"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Remove ${skill}`}
                    >
                      <span className="text-lg leading-none">&times;</span>
                    </button>
                  </span>
                ))}
                <input
                  ref={skillInputRef}
                  type="text"
                  className="px-3 py-2 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm min-w-[120px] bg-white shadow-sm"
                  placeholder="Add skill... (e.g. JavaScript, Design)"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillInputKeyDown}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
  <button
    type="submit"
    disabled={loading}
    className={`w-full sm:w-auto text-lg px-6 py-3 rounded-2xl font-semibold shadow-md transition 
      ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
  >
    {loading ? 'Saving...' : 'Save Changes'}
  </button>

  <button
    type="button"
    disabled={loading}
    onClick={() => setEditMode(false)}
    className={`w-full sm:w-auto text-lg px-6 py-3 rounded-2xl font-semibold shadow-md transition 
      ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
  >
    Cancel
  </button>
</div>

            <div className="flex flex-col gap-2">
              {success && <span className="text-success-600 font-medium">{success}</span>}
              {error && <span className="text-error-600 font-medium">{error}</span>}
            </div>
          </form>
        )}
      </Card>
    </div>
  );
} 