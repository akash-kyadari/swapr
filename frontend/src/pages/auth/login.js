import { useState } from 'react';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useUserStore from '../../store/useUserStore';

export default function Login() {
  const { login, loading, error } = useUserStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const success = await login(form);
    if (success) window.location.href = '/';
  };

  const handleGoogle = () => {
    window.location.href = (process.env.NEXT_PUBLIC_API_URL || '') + '/api/auth/google';
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-primary">Login to SkillSwap</h2>
        <form onSubmit={handleSubmit}>
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <Button type="submit" loading={loading} className="w-full mb-2">Login</Button>
        </form>
        <Button onClick={handleGoogle} className="w-full bg-white text-primary border border-primary mt-2 hover:bg-blue-50" type="button">
          Continue with Google
        </Button>
        <div className="text-xs text-textgray mt-4 text-center">
          Don&apos;t have an account? <a href="/auth/register" className="text-primary underline">Register</a>
        </div>
      </Card>
    </div>
  );
} 