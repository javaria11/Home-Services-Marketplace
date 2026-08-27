import { useState } from 'react';
import { Calculator, Wrench, Zap, Paintbrush, Ruler, DoorOpen } from 'lucide-react';
import aiApi from '../api/aiApi';

function PriceEstimator() {
  const [serviceType, setServiceType] = useState('painter');
  const [roomSqft, setRoomSqft] = useState('');
  const [wallCondition, setWallCondition] = useState('average');
  const [numRooms, setNumRooms] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await aiApi.post('/price-estimate', {
        service_type: serviceType,
        room_sqft: Number(roomSqft),
        wall_condition: wallCondition,
        num_rooms: Number(numRooms),
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not get an estimate right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-[#00236F] text-white flex items-center justify-center">
          <Calculator className="w-5 h-5" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191C1D]">Get an Instant Price Estimate</h1>
      </div>
      <p className="text-[#444651] mb-8 ml-13 pl-0.5">Tell us about your project and we'll estimate the cost.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-[#E1E3E4] rounded-2xl p-7 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
          <Wrench className="w-4 h-4 text-[#00236F]" /> Service Type
        </label>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
        >
          <option value="painter">Painter</option>
          <option value="plumber">Plumber</option>
          <option value="electrician">Electrician</option>
        </select>

        <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
          <Ruler className="w-4 h-4 text-[#00236F]" /> Room Size (sq ft)
        </label>
        <input
          type="number"
          placeholder="e.g. 250"
          value={roomSqft}
          onChange={(e) => setRoomSqft(e.target.value)}
          required
          className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
        />

        <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
          <DoorOpen className="w-4 h-4 text-[#00236F]" /> Number of Rooms
        </label>
        <input
          type="number"
          placeholder="e.g. 3"
          value={numRooms}
          onChange={(e) => setNumRooms(e.target.value)}
          required
          className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
        />

        <label className="flex items-center gap-2 text-sm font-bold text-[#191C1D] mb-2">
          <Zap className="w-4 h-4 text-[#00236F]" /> Wall / Surface Condition
        </label>
        <select
          value={wallCondition}
          onChange={(e) => setWallCondition(e.target.value)}
          className="w-full px-3 py-2.5 border border-[#C5C5D3] rounded-lg text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-[#00236F]/15"
        >
          <option value="good">Good</option>
          <option value="average">Average</option>
          <option value="poor">Poor</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#16A34A] hover:bg-[#128A3E] disabled:bg-slate-300 text-white rounded-lg font-bold text-sm transition"
        >
          {loading ? 'Calculating...' : 'Get Estimate'}
        </button>
      </form>

      {error && (
        <p className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg mt-5 text-sm">{error}</p>
      )}

      {result && (
        <div className="mt-6 bg-[#DCFCE7]/40 border border-[#16A34A]/30 rounded-2xl p-6">
          <p className="text-xs font-bold text-[#166534] uppercase tracking-wide mb-1">Estimated Cost</p>
          <p className="text-4xl font-extrabold text-[#166534]">
            {result.currency} {result.price_min} – {result.price_max}
          </p>
          <p className="text-[#444651] text-sm mt-2">Estimated time: {result.estimated_hours} hours</p>
        </div>
      )}
    </div>
  );
}

export default PriceEstimator;
