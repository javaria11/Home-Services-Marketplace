import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Home as HomeIcon, ShieldCheck, Calendar, Wrench, Search, Sparkles, Bell, UserCog } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './api/axios';
import Footer from './pages/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProviderSearch from './pages/ProviderSearch';
import PriceEstimator from './pages/PriceEstimator';
import MyBookings from './pages/MyBookings';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderProfile from './pages/ProviderProfile';
import Admin from './pages/Admin';
import ChatWidget from './pages/ChatWidget';
import ProtectedRoute from './pages/ProtectedRoute';

function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      if (user.role === 'customer') {
        const res = await api.get(`/bookings/${user.id}`);
        const items = (res.data.bookings || [])
          .filter((b) => b.status !== 'requested')
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 5)
          .map((b) => ({
            id: b.id,
            text: `${b.provider_name || 'Your provider'} — booking ${b.status.replace('_', ' ')}`,
            time: b.updated_at,
          }));
        setNotifications(items);
      } else if (user.role === 'provider') {
        const profileRes = await api.get('/providers/me');
        const res = await api.get(`/bookings/provider/${profileRes.data.provider.id}`);
        const items = (res.data.bookings || [])
          .filter((b) => b.status === 'requested') 
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .map((b) => ({
            id: b.id,
            text: `New job request from ${b.customer_name || 'a customer'}`,
            time: b.created_at,
          }));
        setNotifications(items);
      }
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) loadNotifications(); 
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="p-2 text-[#444651] hover:text-[#00236F] hover:bg-[#F3F4F5] rounded-lg transition-colors relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#16A34A] rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E1E3E4] rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E1E3E4] bg-[#F8F9FA] font-bold text-sm text-[#191C1D]">
            Notifications
          </div>
          {loading ? (
            <p className="p-4 text-sm text-[#757682]">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-sm text-[#757682]">Nothing new right now.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b border-[#E1E3E4] last:border-0 hover:bg-[#F8F9FA]">
                  <p className="text-sm text-[#191C1D] capitalize">{n.text}</p>
                  <p className="text-xs text-[#757682] mt-0.5">
                    {new Date(n.time).toLocaleDateString()} {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `h-20 flex items-center px-4 font-medium text-sm transition-all border-b-2 cursor-pointer ${
      isActive(path)
        ? 'text-[#00236F] border-[#00236F] font-bold'
        : 'text-[#444651] border-transparent hover:text-[#00236F]'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E1E3E4] bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#00236F] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <HomeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-[#00236F] tracking-tight">HomeEase</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E0E7FF] text-[#1E3A8A] flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-[#16A34A]" /> AI
                </span>
              </div>
              <p className="text-[11px] text-[#444651] font-medium tracking-wide -mt-0.5">
                Home Services Marketplace
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/search" className={navLinkClass('/search')}>
              <Search className="w-4 h-4 mr-1.5" /> Find Pros
            </Link>
            <Link to="/estimate" className={navLinkClass('/estimate')}>
              Price Estimate
            </Link>
            {user?.role === 'customer' && (
              <Link to="/my-bookings" className={navLinkClass('/my-bookings')}>
                <Calendar className="w-4 h-4 mr-1.5" /> My Bookings
              </Link>
            )}
            {user?.role === 'provider' && (
              <>
                <Link to="/provider-dashboard" className={navLinkClass('/provider-dashboard')}>
                  <Wrench className="w-4 h-4 mr-1.5" /> Provider Portal
                </Link>
                <Link to="/provider-profile" className={navLinkClass('/provider-profile')}>
                  <UserCog className="w-4 h-4 mr-1.5" /> My Profile
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className={navLinkClass('/admin')}>
                <ShieldCheck className="w-4 h-4 mr-1.5" /> Admin Queue
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <div className="flex items-center gap-2 pl-2 border-l border-[#E1E3E4]">
                <div className="w-9 h-9 rounded-full bg-[#DCE1FF] text-[#00236F] flex items-center justify-center font-bold text-sm">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-[#191C1D] leading-tight">{user.name}</p>
                  <p className="text-xs text-[#757682] capitalize leading-tight">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="ml-2 text-xs font-semibold px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold px-3 py-2 text-[#00236F] hover:bg-[#F3F4F5] rounded-lg transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="text-sm font-semibold px-4 py-2.5 bg-[#00236F] text-white rounded-lg hover:bg-[#001a54] transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="md:hidden flex items-center justify-around border-t border-[#E1E3E4] bg-[#F8F9FA] px-2 py-2 text-xs overflow-x-auto">
        <Link to="/search" className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${isActive('/search') ? 'bg-[#00236F] text-white' : 'text-[#444651]'}`}>Find Pros</Link>
        <Link to="/estimate" className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${isActive('/estimate') ? 'bg-[#00236F] text-white' : 'text-[#444651]'}`}>Estimate</Link>
        {user?.role === 'customer' && <Link to="/my-bookings" className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${isActive('/my-bookings') ? 'bg-[#00236F] text-white' : 'text-[#444651]'}`}>Bookings</Link>}
        {user?.role === 'provider' && <Link to="/provider-dashboard" className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${isActive('/provider-dashboard') ? 'bg-[#00236F] text-white' : 'text-[#444651]'}`}>Provider</Link>}
        {user?.role === 'provider' && <Link to="/provider-profile" className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${isActive('/provider-profile') ? 'bg-[#00236F] text-white' : 'text-[#444651]'}`}>Profile</Link>}
        {user?.role === 'admin' && <Link to="/admin" className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap ${isActive('/admin') ? 'bg-[#00236F] text-white' : 'text-[#444651]'}`}>Admin</Link>}
      </div>
    </header>
  );
}

function AppRoutes() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<ProviderSearch />} />
        <Route path="/estimate" element={<PriceEstimator />} />
        <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['customer']}><MyBookings /></ProtectedRoute>} />
        <Route path="/provider-dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
        <Route path="/provider-profile" element={<ProtectedRoute allowedRoles={['provider']}><ProviderProfile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
      </Routes>
      <ChatWidget />
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;