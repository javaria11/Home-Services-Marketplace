import { useState, useEffect } from 'react';
import { User, DollarSign, Tag, FileText, Layers, Save, Loader2 } from 'lucide-react';
import api from '../api/axios';

function ProviderProfile() {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [skillTags, setSkillTags] = useState(''); 
  const [pricingTier, setPricingTier] = useState('standard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, categoriesRes] = await Promise.all([
        api.get('/providers/me'),
        api.get('/providers/categories-list'),
      ]);
      const p = profileRes.data.provider;
      setProfile(p);
      setBio(p.bio || '');
      setHourlyRate(p.hourly_rate ?? '');
      setCategoryId(p.category_id || '');
      setSkillTags(Array.isArray(p.skill_tags) ? p.skill_tags.join(', ') : '');
      setPricingTier(p.pricing_tier || 'standard');
      setCategories(categoriesRes.data.categories || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.patch('/providers/me', {
        bio,
        hourly_rate: hourlyRate === '' ? undefined : Number(hourlyRate),
        category_id: categoryId || undefined,
        skill_tags: skillTags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        pricing_tier: pricingTier,
      });
      setSuccess('Your profile has been updated — customers will see these changes right away.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="px-6 py-10 text-[#444651]">Loading your profile...</p>;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-[#00236F] text-white flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191C1D]">My Provider Profile</h1>
      </div>
      <p className="text-[#444651] mb-8">
        This is what customers see when they search for providers on "Find a Provider."
      </p>

      {error && (
        <p className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg mb-4 text-sm">{error}</p>
      )}
      {success && (
        <p className="bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-lg mb-4 text-sm">{success}</p>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-[#E1E3E4] rounded-2xl p-7 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
          <Layers className="w-4 h-4 text-[#00236F]" /> Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
          <DollarSign className="w-4 h-4 text-[#00236F]" /> Hourly Rate ($)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 45"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
        />

        <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
          <FileText className="w-4 h-4 text-[#00236F]" /> Bio
        </label>
        <textarea
          rows={4}
          placeholder="Tell customers about your experience..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15 resize-none"
        />

        <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
          <Tag className="w-4 h-4 text-[#00236F]" /> Skills (comma-separated)
        </label>
        <input
          type="text"
          placeholder="e.g. interior painting, wall repair"
          value={skillTags}
          onChange={(e) => setSkillTags(e.target.value)}
          className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
        />

        <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
          Pricing Tier
        </label>
        <select
          value={pricingTier}
          onChange={(e) => setPricingTier(e.target.value)}
          className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
        >
          <option value="budget">Budget</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#00236F] hover:bg-[#001a54] disabled:bg-slate-300 text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

export default ProviderProfile;