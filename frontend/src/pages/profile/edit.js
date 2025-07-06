import { useEffect, useState, useRef } from 'react';
import useUserStore from '../../store/useUserStore';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Avatar from '../../components/Avatar';
import { apiFetch } from '../../utils/api';

export default function ProfilePage() {
  const { user, setUser } = useUserStore();
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
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center py-12 text-lg text-primary">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-2 sm:px-6">
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
            <div>
              <span className="font-semibold text-secondary-700">Skills Needed:</span> {(user.skillsNeeded && user.skillsNeeded.length) ? user.skillsNeeded.join(', ') : <span className="text-textgray">(none)</span>}
            </div>
            <Button variant="primary" fullWidth size="lg" onClick={() => setEditMode(true)} className="mt-4">Edit Profile</Button>
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
            <Input
              label="Skills You Need (comma separated)"
              name="skillsNeeded"
              value={form.skillsNeeded}
              onChange={handleChange}
              placeholder="e.g. Web Development, Copywriting"
              fullWidth
              size="lg"
            />
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button type="submit" variant="primary" loading={loading} disabled={loading} fullWidth size="lg">Save Changes</Button>
              <Button type="button" variant="secondary" onClick={() => setEditMode(false)} disabled={loading} fullWidth size="lg">Cancel</Button>
            </div>
            <div className="flex flex-col gap-2">
              {success && <span className="text-success font-medium">{success}</span>}
              {error && <span className="text-error font-medium">{error}</span>}
            </div>
          </form>
        )}
      </Card>
    </div>
  );
} 