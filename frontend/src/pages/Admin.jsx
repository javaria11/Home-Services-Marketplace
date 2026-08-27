import { useState, useEffect } from 'react';
import {
  Users,
  Wrench,
  Star,
  AlertTriangle,
  Mail,
  Percent,
  Save,
  Loader2,
} from 'lucide-react';
import api from '../api/axios';

function Admin() {
  const [activity, setActivity] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);

  const [categories, setCategories] = useState([]);
  const [commissionValues, setCommissionValues] = useState({});
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [commissionSaving, setCommissionSaving] = useState(null);
  const [commissionSuccess, setCommissionSuccess] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
  loadAdminData();
  loadCategories();
}, []);

  const loadCategories = async () => {
  setCommissionLoading(true);

  try {
    const res = await api.get('/providers/categories');

    const categoryList = res.data.categories || [];

    setCategories(categoryList);

    const initialValues = {};

    categoryList.forEach((category) => {
      initialValues[category.id] =
        category.base_commission_percent ?? 0;
    });

    setCommissionValues(initialValues);
  } catch (err) {
    setError(
      err.response?.data?.error ||
        'Could not load category commissions.'
    );
  } finally {
    setCommissionLoading(false);
  }
};

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [activityRes, pendingRes] = await Promise.all([
        api.get('/admin/activity'),
        api.get('/admin/providers/pending'),
      ]);
      setActivity(activityRes.data);
      setPendingProviders(pendingRes.data.providers);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Could not load admin data. Make sure you are logged in as an admin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyProvider = async (providerId, approve) => {
    setActionLoading(providerId);
    try {
      await api.patch(`/providers/${providerId}/verify`, { is_verified: approve });
      await loadAdminData();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update verification.');
    } finally {
      setActionLoading(null);
    }
  };

  const updateCommission = async (categoryId) => {
  const value = Number(commissionValues[categoryId]);

  if (Number.isNaN(value) || value < 0 || value > 100) {
    setError('Commission must be between 0% and 100%.');
    return;
  }

  setCommissionSaving(categoryId);
  setError('');
  setCommissionSuccess('');

  try {
    const response = await api.patch(
      `/providers/categories/${categoryId}/commission`,
      {
        base_commission_percent: value,
      }
    );

    const updatedCategory = response.data.category;

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? updatedCategory
          : category
      )
    );

    setCommissionValues((current) => ({
      ...current,
      [categoryId]:
        updatedCategory.base_commission_percent,
    }));

    setCommissionSuccess(
      `${updatedCategory.name} commission updated successfully.`
    );

    setTimeout(() => {
      setCommissionSuccess('');
    }, 4000);
  } catch (err) {
    setError(
      err.response?.data?.error ||
        'Could not update commission.'
    );
  } finally {
    setCommissionSaving(null);
  }
};

  if (loading) return <p className="px-6 py-10 text-[#444651]">Loading admin panel...</p>;

  if (error && !activity) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold text-[#191C1D]">Verification Queue</h1>
        <p className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg mt-4 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <h1 className="text-3xl font-extrabold text-[#191C1D]">Verification Queue</h1>
      <p className="text-[#444651] mt-1 mb-8">Manage pending provider applications and platform health.</p>

      {error && <p className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg mb-4 text-sm">{error}</p>}

      {/* Stat cards */}
      {activity && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-[#E1E3E4] shadow-xs">
            <div className="flex items-center gap-2 text-[#00236F] mb-1"><Users className="w-4 h-4" /></div>
            <p className="text-xs font-semibold text-[#757682]">Total Users</p>
            <p className="text-2xl font-black text-[#191C1D] mt-1">{activity.total_users}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E1E3E4] shadow-xs">
            <div className="flex items-center gap-2 text-[#00236F] mb-1"><Wrench className="w-4 h-4" /></div>
            <p className="text-xs font-semibold text-[#757682]">Active Providers</p>
            <p className="text-2xl font-black text-[#191C1D] mt-1">{activity.total_providers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E1E3E4] shadow-xs">
            <div className="flex items-center gap-2 text-[#00236F] mb-1"><Star className="w-4 h-4" /></div>
            <p className="text-xs font-semibold text-[#757682]">Total Reviews</p>
            <p className="text-2xl font-black text-[#191C1D] mt-1">{activity.total_reviews}</p>
          </div>
          <div className="p-4 rounded-xl border border-[#BA1A1A]/30 bg-[#FFDAD6]/20 shadow-xs">
            <div className="flex items-center gap-2 text-[#BA1A1A] mb-1"><AlertTriangle className="w-4 h-4" /></div>
            <p className="text-xs font-bold text-[#BA1A1A]">Pending Verification</p>
            <p className="text-2xl font-black text-[#BA1A1A] mt-1">{activity.pending_verifications} Urgent</p>
          </div>
        </div>
      )}

      {/* Bookings by status */}
      {activity?.bookings_by_status && (
        <div className="mb-8">
          <h2 className="text-lg font-extrabold text-[#191C1D] mb-3">Bookings by Status</h2>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(activity.bookings_by_status).map(([status, count]) => (
              <div key={status} className="bg-[#F3F4F5] px-4 py-2 rounded-full text-sm text-[#444651] border border-[#E1E3E4]">
                <span className="capitalize font-semibold">{status.replace('_', ' ')}</span>: {count}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Commission Management */}
<div className="bg-white rounded-2xl border border-[#E1E3E4] shadow-sm mb-8 overflow-hidden">

  <div className="p-5 border-b border-[#E1E3E4] bg-[#F8F9FA]">
    <div className="flex items-center gap-3">

      <div className="w-10 h-10 rounded-xl bg-[#DCE1FF] flex items-center justify-center text-[#00236F]">
        <Percent className="w-5 h-5" />
      </div>

      <div>
        <h2 className="font-extrabold text-[#191C1D]">
          Category Commissions
        </h2>

        <p className="text-xs text-[#757682] mt-0.5">
          Manage the platform commission percentage for each service category.
        </p>
      </div>

    </div>
  </div>

  {commissionSuccess && (
    <div className="mx-5 mt-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
      {commissionSuccess}
    </div>
  )}

  {commissionLoading ? (
    <div className="p-8 flex items-center justify-center gap-2 text-[#757682]">
      <Loader2 className="w-5 h-5 animate-spin" />
      Loading category commissions...
    </div>
  ) : categories.length === 0 ? (
    <div className="p-8 text-center text-[#444651]">
      No service categories found.
    </div>
  ) : (
    <div className="divide-y divide-[#E1E3E4]">

      {categories.map((category) => (
        <div
          key={category.id}
          className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[#F8F9FA] transition"
        >

          {/* Category information */}
          <div>
            <p className="font-bold text-[#191C1D] capitalize">
              {category.name}
            </p>

            <p className="text-xs text-[#757682] mt-1">
              Platform commission for {category.name} services
            </p>
          </div>

          {/* Commission control */}
          <div className="flex items-center gap-3">

            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={commissionValues[category.id] ?? ''}
                onChange={(e) =>
                  setCommissionValues((current) => ({
                    ...current,
                    [category.id]: e.target.value,
                  }))
                }
                className="w-28 pr-8 pl-3 py-2.5 bg-white border border-[#C5C5D3] rounded-lg text-sm font-bold text-[#191C1D] focus:outline-none focus:ring-2 focus:ring-[#00236F]/20"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#757682]">
                %
              </span>
            </div>

            <button
              type="button"
              disabled={commissionSaving === category.id}
              onClick={() => updateCommission(category.id)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00236F] hover:bg-[#001A54] text-white rounded-lg text-xs font-bold transition disabled:opacity-60"
            >
              {commissionSaving === category.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}

              {commissionSaving === category.id
                ? 'Saving...'
                : 'Save'}
            </button>

          </div>
        </div>
      ))}

    </div>
  )}
</div>

      {/* Verification queue table */}
      <div className="bg-white rounded-xl border border-[#E1E3E4] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#E1E3E4] bg-[#F8F9FA]">
          <h2 className="font-extrabold text-[#191C1D]">Provider Verification Queue</h2>
        </div>

        {pendingProviders.length === 0 ? (
          <p className="text-[#444651] p-6">No providers waiting for verification.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F3F4F5] text-[#757682] font-bold uppercase tracking-wider text-xs border-b border-[#E1E3E4]">
              <tr>
                <th className="text-left p-4">Provider</th>
                <th className="text-left p-4 hidden sm:table-cell">Category</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingProviders.map((p) => (
                <tr key={p.provider_id} className="hover:bg-[#F8F9FA] transition-colors border-b border-[#E1E3E4] last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#F3F4F5] border border-[#E1E3E4] flex items-center justify-center text-[#757682] font-bold text-xs">
                        {p.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-[#191C1D]">{p.full_name}</p>
                        <p className="text-[#757682] text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-[#444651] capitalize">
                    {p.category || 'No category set'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        disabled={actionLoading === p.provider_id}
                        onClick={() => verifyProvider(p.provider_id, true)}
                        className="bg-[#00236F] hover:bg-[#1E3A8A] text-white px-3 py-1.5 rounded-md font-bold text-[11px] transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        disabled={actionLoading === p.provider_id}
                        onClick={() => verifyProvider(p.provider_id, false)}
                        className="border border-[#BA1A1A] text-[#BA1A1A] hover:bg-[#FFDAD6]/40 px-2.5 py-1.5 rounded-md font-semibold text-[11px] transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Admin;
