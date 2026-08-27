import { useState, useEffect } from 'react';
import {
  DollarSign,
  CheckCircle2,
  Radio,
  Calendar,
  MapPin,
  User,
  Power,
  Loader2,
  Briefcase,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  accepted: 'bg-[#DBEAFE] text-[#1E40AF]',
  in_progress: 'bg-[#E0E7FF] text-[#4338CA]',
  completed: 'bg-[#DCFCE7] text-[#166534]',
};

function ProviderDashboard() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const profileRes = await api.get('/providers/me');
      const providerProfile = profileRes.data.provider;

      setProfile(providerProfile);

      const [bookingsRes, earningsRes] = await Promise.all([
        api.get(`/bookings/provider/${providerProfile.id}`),
        api.get('/providers/me/earnings'),
      ]);

      setBookings(bookingsRes.data.bookings);
      setEarnings(earningsRes.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Could not load your dashboard. Make sure you are logged in as a provider.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (isAvailable) => {
    setAvailabilityLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.patch('/providers/me', {
        is_available: isAvailable,
      });

      setProfile(response.data.provider);

      setSuccessMessage(
        isAvailable
          ? 'You are now available for new job requests.'
          : 'You are now unavailable for new job requests.'
      );

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Could not update your availability. Please try again.'
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    setActionLoading(bookingId);
    setError('');

    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.error || 'Could not update that booking.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <p className="px-6 py-10 text-[#444651]">
        Loading your dashboard...
      </p>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold text-[#191C1D]">
          Provider Dashboard
        </h1>

        <p className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg mt-4 text-sm">
          {error}
        </p>
      </div>
    );
  }

  const newRequests = bookings.filter(
    (b) => b.status === 'requested'
  );

  const otherBookings = bookings.filter(
    (b) => b.status !== 'requested'
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

      {/* Header */}
      <h1 className="text-3xl font-extrabold text-[#191C1D]">
        Welcome back, {user?.name || 'Provider'}
      </h1>

      <p className="text-[#444651] mt-1 mb-8">
        Here's an overview of your current performance and incoming requests.
      </p>

      {/* Error */}
      {error && (
        <p className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </p>
      )}

      {/* Success */}
      {successMessage && (
        <p className="bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          {successMessage}
        </p>
      )}

      {/* Stat cards */}
      {earnings && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          {/* Earnings */}
          <div className="bg-white border border-[#E1E3E4] rounded-2xl p-5">
            <div className="w-10 h-10 rounded-full bg-[#DCE1FF]/50 flex items-center justify-center text-[#00236F] mb-3">
              <DollarSign className="w-5 h-5" />
            </div>

            <p className="text-xs font-bold text-[#757682] mb-1">
              Total Earnings
            </p>

            <p className="text-3xl font-extrabold text-[#191C1D]">
              ${earnings.total_earnings}
            </p>
          </div>

          {/* Completed jobs */}
          <div className="bg-white border border-[#E1E3E4] rounded-2xl p-5">
            <div className="w-10 h-10 rounded-full bg-[#A4F1B2]/40 flex items-center justify-center text-[#1F6C3A] mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <p className="text-xs font-bold text-[#757682] mb-1">
              Completed Jobs
            </p>

            <p className="text-3xl font-extrabold text-[#191C1D]">
              {earnings.completed_jobs}
            </p>
          </div>

          {/* Current availability */}
          <div className="bg-white border border-[#E1E3E4] rounded-2xl p-5">

            <div className="w-10 h-10 rounded-full bg-[#F3F4F5] flex items-center justify-center text-[#00236F] mb-3">
              <Radio className="w-5 h-5" />
            </div>

            <p className="text-xs font-bold text-[#757682] mb-1">
              Current Availability
            </p>

            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  profile?.is_available
                    ? 'bg-[#16A34A] animate-pulse'
                    : 'bg-[#757682]'
                }`}
              />

              <span className="text-sm font-bold text-[#191C1D]">
                {profile?.is_available
                  ? 'Available'
                  : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Availability Management */}
      <div className="bg-white border border-[#E1E3E4] rounded-2xl p-6 mb-10 shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

          {/* Information */}
          <div className="flex items-start gap-4">

            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                profile?.is_available
                  ? 'bg-[#DCFCE7] text-[#166534]'
                  : 'bg-[#F3F4F5] text-[#757682]'
              }`}
            >
              <Power className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#191C1D]">
                Availability Management
              </h2>

              <p className="text-sm text-[#444651] mt-1">
                Control whether customers can send you new job requests.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    profile?.is_available
                      ? 'bg-[#16A34A] animate-pulse'
                      : 'bg-[#757682]'
                  }`}
                />

                <span
                  className={`text-sm font-bold ${
                    profile?.is_available
                      ? 'text-[#166534]'
                      : 'text-[#444651]'
                  }`}
                >
                  {profile?.is_available
                    ? 'You are currently accepting jobs'
                    : 'You are currently not accepting jobs'}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 shrink-0">

            <button
              type="button"
              disabled={
                availabilityLoading || profile?.is_available === true
              }
              onClick={() => updateAvailability(true)}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
                profile?.is_available === true
                  ? 'bg-[#DCFCE7] text-[#166534] cursor-default'
                  : 'bg-[#1F6C3A] hover:bg-[#165A2E] text-white'
              } disabled:opacity-70`}
            >
              {availabilityLoading && profile?.is_available !== true ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}

              Available
            </button>

            <button
              type="button"
              disabled={
                availabilityLoading || profile?.is_available === false
              }
              onClick={() => updateAvailability(false)}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${
                profile?.is_available === false
                  ? 'bg-[#EDEEEF] text-[#444651] cursor-default'
                  : 'bg-white border border-[#C5C5D3] hover:bg-[#F3F4F5] text-[#444651]'
              } disabled:opacity-70`}
            >
              {availabilityLoading && profile?.is_available !== false ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}

              Unavailable
            </button>

          </div>
        </div>
      </div>

      {/* New job requests */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-extrabold text-[#191C1D]">
          Job Requests
        </h2>

        {newRequests.length > 0 && (
          <span className="text-xs font-bold text-[#00236F] bg-[#DCE1FF] px-3 py-1 rounded-full">
            {newRequests.length} New
          </span>
        )}
      </div>

      {newRequests.length === 0 && (
        <p className="text-[#444651] mb-8">
          No new job requests right now.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">

        {newRequests.map((b) => (
          <div
            key={b.id}
            className="bg-white border border-[#E1E3E4] rounded-2xl p-5 shadow-sm"
          >

            <div className="flex justify-between items-start mb-3">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-full bg-[#EDEEEF] border border-[#E1E3E4] flex items-center justify-center text-[#757682]">
                  <User className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-bold text-[#191C1D]">
                    {b.customer_name || 'Customer'}
                  </h3>

                  <p className="text-[#444651] text-xs flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {b.scheduled_date}
                  </p>

                  {b.address && (
                    <p className="text-[#444651] text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {b.address}
                    </p>
                  )}
                </div>

              </div>

              {(b.final_price || b.estimated_price_min) && (
                <p className="font-bold text-[#00236F]">
                  Est. ${b.final_price || b.estimated_price_min}
                </p>
              )}

            </div>

            <div className="flex gap-2">

              <button
                disabled={actionLoading === b.id}
                onClick={() => updateStatus(b.id, 'accepted')}
                className="flex-1 py-2.5 bg-[#1F6C3A] hover:bg-[#165A2E] text-white rounded-lg text-xs font-bold transition"
              >
                Accept
              </button>

              <button
                disabled={actionLoading === b.id}
                onClick={() => updateStatus(b.id, 'cancelled')}
                className="flex-1 py-2.5 bg-white border border-[#C5C5D3] hover:bg-[#F3F4F5] text-[#444651] rounded-lg text-xs font-semibold transition"
              >
                Decline
              </button>

            </div>
          </div>
        ))}

      </div>

      {/* Earnings History */}
<div className="bg-white border border-[#E1E3E4] rounded-2xl p-6 mb-10 shadow-sm">

  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-xl font-extrabold text-[#191C1D]">
        Earnings History
      </h2>

      <p className="text-sm text-[#757682] mt-1">
        Your earnings from completed services.
      </p>
    </div>

    <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#166534]">
      <DollarSign className="w-5 h-5" />
    </div>
  </div>

  {earnings?.history?.length > 0 ? (
    <div className="space-y-3">

      {earnings.history.map((item) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-[#F8F9FA] border border-[#E1E3E4] rounded-xl"
        >

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-white border border-[#E1E3E4] flex items-center justify-center text-[#00236F]">
              <Briefcase className="w-4 h-4" />
            </div>

            <div>
              <p className="font-bold text-[#191C1D]">
                {item.customer_name || 'Customer'}
              </p>

              <p className="text-xs text-[#757682]">
                {item.category || 'Home Service'}
              </p>

              <p className="text-xs text-[#757682] flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                {item.scheduled_date}
              </p>
            </div>

          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold text-[#757682]">
              Earned
            </p>

            <p className="text-lg font-extrabold text-[#166534]">
              ${item.amount}
            </p>
          </div>

        </div>
      ))}

    </div>
  ) : (
    <div className="text-center py-8 bg-[#F3F4F5] rounded-xl">
      <DollarSign className="w-8 h-8 text-[#757682] mx-auto mb-2" />

      <p className="text-sm text-[#444651]">
        No completed jobs yet.
      </p>
    </div>
  )}

</div>

      {/* Other bookings */}
      {otherBookings.length > 0 && (
        <>
          <h2 className="text-xl font-extrabold text-[#191C1D] mb-4">
            Your Bookings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {otherBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-[#E1E3E4] rounded-2xl p-5"
              >

                <div className="flex justify-between items-start mb-3">

                  <div>
                    <h3 className="font-bold text-[#191C1D]">
                      {b.customer_name || 'Customer'}
                    </h3>

                    <p className="text-[#444651] text-xs flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {b.scheduled_date}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                      STATUS_BADGE[b.status] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {b.status.replace('_', ' ')}
                  </span>

                </div>

                {b.status === 'accepted' && (
                  <button
                    disabled={actionLoading === b.id}
                    onClick={() =>
                      updateStatus(b.id, 'in_progress')
                    }
                    className="w-full py-2.5 bg-[#4338CA] hover:bg-[#3730A3] text-white rounded-lg text-xs font-bold transition"
                  >
                    Start Job
                  </button>
                )}

                {b.status === 'in_progress' && (
                  <button
                    disabled={actionLoading === b.id}
                    onClick={() =>
                      updateStatus(b.id, 'completed')
                    }
                    className="w-full py-2.5 bg-[#00236F] hover:bg-[#001a54] text-white rounded-lg text-xs font-bold transition"
                  >
                    Mark Completed
                  </button>
                )}

              </div>
            ))}

          </div>
        </>
      )}

    </div>
  );
}

export default ProviderDashboard;