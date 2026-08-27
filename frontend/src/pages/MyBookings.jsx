import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Wrench,
  Zap,
  Paintbrush,
  Sparkles,
  Star,
  X,
  Send,
  CheckCircle,
} from 'lucide-react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const catIcon = (category) => {
  if (category === 'Painter') return Paintbrush;
  if (category === 'Plumber') return Wrench;
  if (category === 'Electrician') return Zap;
  return Sparkles;
};

const STATUS_BADGE = {
  requested: 'bg-[#FEF3C7] text-[#92400E]',
  accepted: 'bg-[#DBEAFE] text-[#1E40AF]',
  in_progress: 'bg-[#E0E7FF] text-[#4338CA] animate-pulse',
  completed: 'bg-[#DCFCE7] text-[#166534]',
  cancelled: 'bg-[#FFDAD6] text-[#BA1A1A]',
};

const STATUS_LABEL = {
  requested: 'Requested',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const [submittedReviews, setSubmittedReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('submittedReviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setError('Please log in to view your bookings.');
      setLoading(false);
      return;
    }

    fetchBookings();
  }, [user]);

  useEffect(() => {
    localStorage.setItem(
      'submittedReviews',
      JSON.stringify(submittedReviews)
    );
  }, [submittedReviews]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get(`/bookings/${user.id}`);

      setBookings(res.data.bookings || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Could not load your bookings.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setRating(0);
    setComment('');
    setReviewError('');
    setReviewSuccess('');
  };

  const closeReviewModal = () => {
    if (reviewLoading) return;

    setReviewBooking(null);
    setRating(0);
    setComment('');
    setReviewError('');
    setReviewSuccess('');
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!reviewBooking) return;

    if (rating === 0) {
      setReviewError('Please select a rating.');
      return;
    }

    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await api.post('/reviews', {
        provider_id: reviewBooking.provider_id,
        booking_id: reviewBooking.id,
        rating: Number(rating),
        comment: comment.trim(),
      });

      setSubmittedReviews((prev) => {
        if (prev.includes(reviewBooking.id)) {
          return prev;
        }

        return [...prev, reviewBooking.id];
      });

      setReviewSuccess(
        'Your review has been submitted successfully!'
      );

    } catch (err) {
      setReviewError(
        err.response?.data?.error ||
          'Could not submit your review. Please try again.'
      );
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="px-6 py-10 text-[#444651]">
        Loading your bookings...
      </p>
    );
  }

  const STATUS_TABS = [
    { key: 'all', label: 'All' },
    { key: 'requested', label: 'Requested' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  const visibleBookings =
    statusFilter === 'all'
      ? bookings
      : bookings.filter(
          (b) => b.status === statusFilter
        );

  return (
    <>
      <div className="max-w-275 mx-auto px-4 sm:px-6 lg:px-10 py-10">

        <h1 className="text-3xl font-extrabold text-[#191C1D]">
          My Bookings
        </h1>

        <p className="text-[#444651] mt-1 mb-6">
          Manage your upcoming and past home service appointments.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">

          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                statusFilter === tab.key
                  ? 'bg-[#00236F] text-white'
                  : 'bg-white border border-[#C5C5D3] text-[#444651] hover:bg-[#F3F4F5]'
              }`}
            >
              {tab.label}
            </button>
          ))}

        </div>

        {error && (
          <p className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </p>
        )}

        {!error && visibleBookings.length === 0 && (
          <div className="text-center py-16 bg-[#F3F4F5] rounded-2xl border border-[#E1E3E4]">

            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#757682] mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>

            <p className="text-[#444651]">
              {statusFilter === 'all'
                ? "You haven't booked any services yet."
                : `No ${statusFilter.replace(
                    '_',
                    ' '
                  )} bookings.`}
            </p>

          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {visibleBookings.map((b) => {

            const Icon = catIcon(b.category);

            const isInProgress =
              b.status === 'in_progress';

            const hasReviewed =
              submittedReviews.includes(b.id);

            return (
              <div
                key={b.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm ${
                  isInProgress
                    ? 'border-[#4338CA]/40 ring-1 ring-[#4338CA]/10'
                    : 'border-[#E1E3E4]'
                }`}
              >

                <div className="flex justify-between items-start mb-4">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-[#F3F4F5] border border-[#E1E3E4] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#00236F]" />
                    </div>

                    <div>

                      <h3 className="font-bold text-[#191C1D]">
                        {b.provider_name || 'Provider'}
                      </h3>

                      <p className="text-[#444651] text-sm capitalize">
                        {b.category}
                      </p>

                    </div>

                  </div>


                  {/* STATUS */}
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      STATUS_BADGE[b.status]
                    }`}
                  >
                    {STATUS_LABEL[b.status] ||
                      b.status}
                  </span>

                </div>

                <div className="bg-[#F3F4F5] rounded-lg p-3 grid grid-cols-2 gap-2 border border-[#E1E3E4]">

                  <div>

                    <p className="text-[#757682] text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date
                    </p>

                    <p className="font-semibold text-[#191C1D] text-sm mt-0.5">
                      {b.scheduled_date}
                    </p>

                  </div>


                  {b.address && (
                    <div>

                      <p className="text-[#757682] text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Address
                      </p>

                      <p className="font-semibold text-[#191C1D] text-sm mt-0.5 truncate">
                        {b.address}
                      </p>

                    </div>
                  )}

                </div>

                {b.status === 'completed' && (
                  <div className="mt-4">

                    {hasReviewed ? (

                      <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#DCFCE7] text-[#166534] text-sm font-semibold">

                        <CheckCircle className="w-4 h-4" />

                        Review Submitted

                      </div>

                    ) : (

                      <button
                        onClick={() =>
                          openReviewModal(b)
                        }
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#00236F] text-white text-sm font-semibold hover:bg-[#001A54] transition-colors"
                      >

                        <Star className="w-4 h-4" />

                        Leave a Review

                      </button>

                    )}

                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>

      {reviewBooking && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeReviewModal}
        >

          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E1E3E4]">

              <div>

                <h2 className="text-lg font-bold text-[#191C1D]">
                  Leave a Review
                </h2>

                <p className="text-sm text-[#757682] mt-0.5">
                  {reviewBooking.provider_name ||
                    'Your provider'}
                </p>

              </div>

              <button
                onClick={closeReviewModal}
                disabled={reviewLoading}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F3F4F5] text-[#444651]"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {reviewSuccess ? (

              <div className="p-8 text-center">

                <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-4">

                  <CheckCircle className="w-9 h-9 text-[#16A34A]" />

                </div>

                <h3 className="text-xl font-bold text-[#191C1D]">
                  Review Submitted!
                </h3>

                <p className="text-sm text-[#757682] mt-2">
                  Thank you for sharing your experience.
                </p>

                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="mt-6 w-full py-3 rounded-xl bg-[#00236F] text-white font-bold text-sm hover:bg-[#001A54] transition"
                >
                  Done
                </button>

              </div>

            ) : (

              <form
                onSubmit={submitReview}
                className="p-5"
              >

                {/* RATING */}
                <div className="mb-5">

                  <p className="text-sm font-semibold text-[#191C1D] mb-2">
                    How was your experience?
                  </p>

                  <div className="flex items-center gap-2">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() =>
                            setRating(star)
                          }
                          className="p-1 transition-transform hover:scale-110"
                          aria-label={`Rate ${star} out of 5`}
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? 'fill-[#F59E0B] text-[#F59E0B]'
                                : 'text-[#C5C5D3]'
                            }`}
                          />
                        </button>
                      )
                    )}

                  </div>

                  {rating > 0 && (
                    <p className="text-sm text-[#757682] mt-2">

                      {rating === 1 &&
                        'Poor'}

                      {rating === 2 &&
                        'Fair'}

                      {rating === 3 &&
                        'Good'}

                      {rating === 4 &&
                        'Very Good'}

                      {rating === 5 &&
                        'Excellent'}

                    </p>
                  )}

                </div>


                {/* COMMENT */}
                <div className="mb-5">

                  <label
                    htmlFor="review-comment"
                    className="block text-sm font-semibold text-[#191C1D] mb-2"
                  >
                    Your Review
                  </label>

                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    placeholder="Tell us about your experience..."
                    rows={4}
                    maxLength={500}
                    className="w-full border border-[#C5C5D3] rounded-xl px-4 py-3 text-sm text-[#191C1D] outline-none focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 resize-none"
                  />

                  <p className="text-xs text-[#757682] text-right mt-1">
                    {comment.length}/500
                  </p>

                </div>


                {/* ERROR */}
                {reviewError && (
                  <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {reviewError}
                  </div>
                )}


                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={
                    reviewLoading ||
                    rating === 0
                  }
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors ${
                    reviewLoading ||
                    rating === 0
                      ? 'bg-[#E1E3E4] text-[#757682] cursor-not-allowed'
                      : 'bg-[#00236F] text-white hover:bg-[#001A54]'
                  }`}
                >

                  {reviewLoading ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Review
                    </>
                  )}

                </button>

              </form>
            )}

          </div>

        </div>

      )}

    </>
  );
}

export default MyBookings;