import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home as HomeIcon, User, Mail, Lock, Briefcase } from 'lucide-react';
import api from '../api/axios';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/signup', { name, email, password, role });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#F3F4F5] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#00236F] text-white flex items-center justify-center shadow-sm mb-3">
            <HomeIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#191C1D]">Create your account</h1>
          <p className="text-[#444651] text-sm mt-1">Join HomeEase AI in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E1E3E4] shadow-sm p-7">
          {error && (
            <p className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg mb-4 text-sm">
              {error}
            </p>
          )}

          <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
            <User className="w-4 h-4 text-[#00236F]" /> Full Name
          </label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
          />

          <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
            <Mail className="w-4 h-4 text-[#00236F]" /> Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
          />

          <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
            <Lock className="w-4 h-4 text-[#00236F]" /> Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
          />

          <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
            <Briefcase className="w-4 h-4 text-[#00236F]" /> I am a...
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
          >
            <option value="customer">Customer — looking for services</option>
            <option value="provider">Provider — painter, plumber, electrician</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00236F] hover:bg-[#001a54] disabled:bg-slate-300 text-white rounded-lg font-bold text-sm transition"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="text-center text-sm text-[#444651] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00236F] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
