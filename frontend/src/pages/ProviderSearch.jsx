import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Wrench, Zap, Paintbrush, Star, CheckCircle, Search, SlidersHorizontal } from 'lucide-react';
import aiApi from '../api/aiApi';
import BookingModal from './BookingModal';

const CATEGORIES = [
  { key: 'all', label: 'All Services', icon: Layers },
  { key: 'Painter', label: 'Painter', icon: Paintbrush },
  { key: 'Plumber', label: 'Plumber', icon: Wrench },
  { key: 'Electrician', label: 'Electrician', icon: Zap },
];

const CATEGORY_PHOTOS = {
  Painter: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&q=80',
  Plumber: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
  Electrician: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80',
};

const catIcon = (category) => {
  if (category === 'Painter') return Paintbrush;
  if (category === 'Plumber') return Wrench;
  if (category === 'Electrician') return Zap;
  return Layers;
};

const guessCategoryFromQuery = (query) => {
  const q = query.toLowerCase();
  if (q.includes('paint')) return 'Painter';
  if (q.includes('plumb') || q.includes('leak') || q.includes('pipe')) return 'Plumber';
  if (q.includes('electric') || q.includes('wiring') || q.includes('light')) return 'Electrician';
  return 'all';
};

function ProviderSearch() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const categoryFromUrl = searchParams.get('category');

  const [providers, setProviders] = useState([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [searchText, setSearchText] = useState(initialQuery);
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [category, setCategory] = useState(() => {
  if (categoryFromUrl) {
    return (
      categoryFromUrl.charAt(0).toUpperCase() +
      categoryFromUrl.slice(1).toLowerCase()
    );
  }

  return guessCategoryFromQuery(initialQuery);
});

  useEffect(() => {
  fetchProviders();
}, [category]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (maxPrice) params.max_price = maxPrice;
      if (minRating) params.min_rating = minRating;
      const res = await aiApi.get('/providers', { params });
      setProviders(res.data.providers);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Could not load providers right now. Please try again.');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setCategory('all');
    setMaxPrice('');
    setMinRating('');
    setSearchText('');
    setAvailability('all');
    setSortBy('recommended');
  };


  const visibleProviders = useMemo(() => {
    let list = [...providers];

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    if (availability === 'available') {
      list = list.filter((p) => p.is_available);
    }

    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price_low') list.sort((a, b) => a.hourly_rate - b.hourly_rate);
    else if (sortBy === 'price_high') list.sort((a, b) => b.hourly_rate - a.hourly_rate);

    return list;
  }, [providers, searchText, availability, sortBy]);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 bg-[#F3F4F5] rounded-xl p-5 flex flex-col gap-5 border border-[#E1E3E4] shadow-xs h-fit">
        <div>
          <h2 className="text-xl font-bold text-[#00236F]">Filters</h2>
          <p className="text-xs text-[#444651] mt-0.5 font-medium">Narrow your search</p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[#191C1D] uppercase tracking-wider mb-2">Search</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Name or category..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#C5C5D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-[#E1E3E4] pt-4">
          <h3 className="text-xs font-bold text-[#191C1D] uppercase tracking-wider mb-1">Categories</h3>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-all ${
                  isSelected
                    ? 'bg-[#00236F] text-white shadow-sm'
                    : 'text-[#444651] hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {cat.label}
              </button>
            );
          })}
        </div>

        <div className="border-t border-[#E1E3E4] pt-4">
          <h3 className="text-xs font-bold text-[#191C1D] uppercase tracking-wider mb-2">Availability</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setAvailability('all')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                availability === 'all' ? 'bg-[#00236F] text-white' : 'bg-white border border-[#C5C5D3] text-[#444651]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAvailability('available')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                availability === 'available' ? 'bg-[#00236F] text-white' : 'bg-white border border-[#C5C5D3] text-[#444651]'
              }`}
            >
              Available Now
            </button>
          </div>
        </div>

        <div className="border-t border-[#E1E3E4] pt-4">
          <h3 className="text-xs font-bold text-[#191C1D] uppercase tracking-wider mb-2">Max Price / Hr</h3>
          <input
            type="number"
            placeholder="$ Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-[#C5C5D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
          />
        </div>

        <div className="border-t border-[#E1E3E4] pt-4">
          <h3 className="text-xs font-bold text-[#191C1D] uppercase tracking-wider mb-2">Minimum Rating</h3>
          <input
            type="number"
            step="0.1"
            max="5"
            placeholder="e.g. 4.0"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-[#C5C5D3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
          />
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={fetchProviders}
            className="w-full py-2.5 bg-[#00236F] hover:bg-[#001a54] text-white rounded-lg text-sm font-bold transition"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="w-full py-2.5 bg-white border border-[#C5C5D3] hover:bg-slate-50 text-[#444651] rounded-lg text-sm font-semibold transition"
          >
            Clear Filters
          </button>
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1">
        <div className="flex justify-between items-end flex-wrap gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191C1D]">
            {loading ? 'Searching...' : (
              <>Found <span className="text-[#00236F]">{visibleProviders.length} Pros</span> for your search</>
            )}
          </h1>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#757682]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-[#C5C5D3] rounded-lg text-sm text-[#191C1D] bg-white focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {successMessage && (
          <p className="bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-lg mt-4 text-sm font-medium">
            {successMessage}
          </p>
        )}
        {errorMsg && (
          <p className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg mt-4 text-sm font-medium">
            {errorMsg}
          </p>
        )}

        {loading ? (
          <p className="text-[#444651] mt-6">Loading providers...</p>
        ) : visibleProviders.length === 0 ? (
          <p className="text-[#444651] mt-6">No providers match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {visibleProviders.map((p) => {
              const Icon = catIcon(p.category);
              return (
                <div
                  key={p.provider_id}
                  className="bg-white border border-[#E1E3E4] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div
                    className="h-32 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${CATEGORY_PHOTOS[p.category] || CATEGORY_PHOTOS.Painter})` }}
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                    <span
                      className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        p.is_available ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {p.is_available && <CheckCircle className="w-3 h-3" />}
                      {p.is_available ? 'Available Today' : 'Not Available'}
                    </span>
                    <Icon className="absolute bottom-3 right-3 w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-[#191C1D]">{p.name}</h3>
                      <span className="font-extrabold text-[#00236F]">${p.hourly_rate}/hr</span>
                    </div>
                    <p className="text-[#444651] text-sm capitalize mt-0.5">{p.category}</p>
                    <p className="text-amber-500 text-sm mt-2 font-semibold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {p.rating} rating
                    </p>

                    <button
                      disabled={!p.is_available}
                      onClick={() => setSelectedProvider(p)}
                      className="w-full mt-4 py-2.5 bg-[#F3F4F5] hover:bg-[#00236F] hover:text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-[#191C1D] rounded-lg text-sm font-bold transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedProvider && (
        <BookingModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onSuccess={() => {
            setSelectedProvider(null);
            setSuccessMessage(`Booking request sent to ${selectedProvider.name}! Check "My Bookings" for status.`);
          }}
        />
      )}
    </div>
  );
}

export default ProviderSearch;
