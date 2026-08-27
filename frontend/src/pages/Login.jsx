import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home as HomeIcon, Mail, Lock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user); 

      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'provider') navigate('/provider-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
          <h1 className="text-2xl font-extrabold text-[#191C1D]">Welcome back</h1>
          <p className="text-[#444651] text-sm mt-1">Log in to your HomeEase AI account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E1E3E4] shadow-sm p-7">
          {error && (
            <p className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg mb-4 text-sm">
              {error}
            </p>
          )}

          <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
            <Mail className="w-4 h-4 text-[#00236F]" /> Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
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
            className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00236F] hover:bg-[#001a54] disabled:bg-slate-300 text-white rounded-lg font-bold text-sm transition"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p className="text-center text-sm text-[#444651] mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#00236F] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
