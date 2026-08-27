import { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Wrench,
  Zap,
  Paintbrush,
  Sparkles,
  Star,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import api from '../api/axios';

const catIcon = (category) => {
  if (category === 'Painter') return Paintbrush;
  if (category === 'Plumber') return Wrench;
  if (category === 'Electrician') return Zap;
  return Sparkles;
};

function BookingModal({ provider, onClose, onSuccess }) {
  const [step, setStep] = useState(1);

  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const Icon = catIcon(provider.category);

  const totalSteps = 3;

  const handleStepOne = (e) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('Please select a service date.');
      return;
    }

    setStep(2);
  };

  const handleStepTwo = (e) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Please enter your service address.');
      return;
    }

    setStep(3);
  };

  const handleConfirm = async () => {
    setError('');

    const token = localStorage.getItem('token');

    if (!token) {
      setError('Please log in first to book a provider.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/bookings', {
        provider_id: provider.provider_id,
        category_name: provider.category,
        scheduled_date: date,
        address: address.trim(),
        price: provider.hourly_rate,
      });

      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Booking failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setError('');

    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#191C1D]/50 backdrop-blur-sm z-50 flex justify-end"
      onClick={onClose}
    >
      {/* Drawer */}
      <div
        className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="bg-[#00236F] text-white px-6 py-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-[#C9D7FF] font-semibold uppercase tracking-wide">
                Book a Service
              </p>

              <h2 className="text-xl font-extrabold mt-1">
                {provider.name}
              </h2>

              <p className="text-sm text-[#DCE5FF] mt-1">
                {provider.category}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

          <div className="flex items-center mt-6">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center flex-1 last:flex-none"
              >

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= item
                      ? 'bg-white text-[#00236F]'
                      : 'bg-[#31508F] text-white'
                  }`}
                >
                  {step > item ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    item
                  )}
                </div>

                {item < totalSteps && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      step > item
                        ? 'bg-white'
                        : 'bg-[#31508F]'
                    }`}
                  />
                )}

              </div>
            ))}

          </div>

          <div className="flex justify-between text-xs text-[#DCE5FF] mt-2">
            <span>Schedule</span>
            <span>Location</span>
            <span>Confirm</span>
          </div>

        </div>

        <div className="px-6 pt-5">

          <div className="flex items-center gap-3 bg-[#F3F4F5] border border-[#E1E3E4] rounded-xl p-4">

            <div className="w-12 h-12 rounded-full bg-[#E0E7FF] flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-[#00236F]" />
            </div>

            <div className="flex-1 min-w-0">

              <p className="font-bold text-[#191C1D]">
                {provider.name}
              </p>

              <p className="text-sm text-[#757682]">
                {provider.category}
              </p>

            </div>

            <div className="text-right">

              <div className="flex items-center gap-1 text-[#F59E0B]">
                <Star className="w-4 h-4 fill-[#F59E0B]" />
                <span className="font-bold text-sm">
                  {provider.rating || 'N/A'}
                </span>
              </div>

              <p className="text-xs text-[#757682] mt-1">
                ${provider.hourly_rate}/hr
              </p>

            </div>

          </div>

        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStepOne}>

              <div className="mb-7">

                <div className="w-12 h-12 rounded-xl bg-[#EFF4FF] flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-[#00236F]" />
                </div>

                <h3 className="text-xl font-bold text-[#191C1D]">
                  When do you need the service?
                </h3>

                <p className="text-sm text-[#757682] mt-1">
                  Choose a convenient date for your home service.
                </p>

              </div>

              <label className="block text-sm font-bold text-[#191C1D] mb-2">
                Service Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-[#C5C5D3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00236F]/15 focus:border-[#00236F]"
              />

              <div className="mt-5 p-4 rounded-xl bg-[#F8F9FA] border border-[#E1E3E4]">
                <p className="text-xs text-[#757682]">
                  Selected date
                </p>

                <p className="font-semibold text-[#191C1D] mt-1">
                  {date
                    ? new Date(`${date}T00:00:00`).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )
                    : 'No date selected'}
                </p>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-[#00236F] hover:bg-[#001A54] text-white rounded-xl font-bold text-sm transition"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStepTwo}>

              <div className="mb-7">

                <div className="w-12 h-12 rounded-xl bg-[#EFF4FF] flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-[#00236F]" />
                </div>

                <h3 className="text-xl font-bold text-[#191C1D]">
                  Where should we come?
                </h3>

                <p className="text-sm text-[#757682] mt-1">
                  Enter the address where you need the service.
                </p>

              </div>

              <label className="block text-sm font-bold text-[#191C1D] mb-2">
                Service Address
              </label>

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full address"
                rows={5}
                required
                className="w-full px-4 py-3 border border-[#C5C5D3] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00236F]/15 focus:border-[#00236F]"
              />

              <p className="text-xs text-[#757682] mt-2">
                Please provide enough detail for the professional to find your location.
              </p>

              <div className="mt-8 flex items-center justify-between">

                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-2 px-5 py-3 border border-[#C5C5D3] text-[#444651] hover:bg-[#F3F4F5] rounded-xl font-bold text-sm transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-[#00236F] hover:bg-[#001A54] text-white rounded-xl font-bold text-sm transition"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>

            </form>
          )}

          {step === 3 && (
            <div>

              <div className="mb-7">

                <div className="w-12 h-12 rounded-xl bg-[#ECFDF3] flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-[#16A34A]" />
                </div>

                <h3 className="text-xl font-bold text-[#191C1D]">
                  Review your booking
                </h3>

                <p className="text-sm text-[#757682] mt-1">
                  Please check your details before confirming.
                </p>

              </div>


              {/* Booking Summary */}
              <div className="border border-[#E1E3E4] rounded-2xl overflow-hidden">

                <div className="px-5 py-4 bg-[#F8F9FA] border-b border-[#E1E3E4]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#757682]">
                    Booking Summary
                  </p>
                </div>

                <div className="p-5 space-y-5">

                  {/* Provider */}
                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#00236F]" />
                    </div>

                    <div>
                      <p className="text-xs text-[#757682]">
                        Professional
                      </p>

                      <p className="font-semibold text-[#191C1D]">
                        {provider.name}
                      </p>

                      <p className="text-sm text-[#757682]">
                        {provider.category}
                      </p>
                    </div>

                  </div>


                  {/* Date */}
                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-[#00236F]" />
                    </div>

                    <div>
                      <p className="text-xs text-[#757682]">
                        Service Date
                      </p>

                      <p className="font-semibold text-[#191C1D]">
                        {date
                          ? new Date(`${date}T00:00:00`).toLocaleDateString(
                              'en-US',
                              {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )
                          : '-'}
                      </p>
                    </div>

                  </div>


                  {/* Address */}
                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#00236F]" />
                    </div>

                    <div className="min-w-0">

                      <p className="text-xs text-[#757682]">
                        Service Address
                      </p>

                      <p className="font-semibold text-[#191C1D] wrap-break-words">
                        {address}
                      </p>

                    </div>

                  </div>

                </div>


                {/* Price */}
                <div className="px-5 py-4 bg-[#F8F9FA] border-t border-[#E1E3E4] flex items-center justify-between">

                  <div>
                    <p className="text-xs text-[#757682] uppercase font-bold">
                      Estimated Cost
                    </p>

                    <p className="text-xs text-[#757682] mt-1">
                      Hourly rate
                    </p>
                  </div>

                  <p className="text-2xl font-extrabold text-[#191C1D]">
                    ${provider.hourly_rate}
                    <span className="text-sm font-normal text-[#757682]">
                      {' '}
                      /hr
                    </span>
                  </p>

                </div>

              </div>


              <div className="mt-6 flex items-center justify-between">

                <button
                  type="button"
                  onClick={goBack}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 border border-[#C5C5D3] text-[#444651] hover:bg-[#F3F4F5] rounded-xl font-bold text-sm transition disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-[#16A34A] hover:bg-[#128A3E] disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition"
                >
                  {loading ? (
                    'Booking...'
                  ) : (
                    <>
                      Confirm Booking
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>

              </div>

            </div>
          )}

        </div>

        <div className="px-6 py-4 border-t border-[#E1E3E4] bg-white">

          <div className="flex items-center justify-center gap-2 text-xs text-[#757682]">
            <CheckCircle className="w-4 h-4 text-[#16A34A]" />
            Your booking details are securely submitted
          </div>

        </div>

      </div>
    </div>
  );
}

export default BookingModal;