import { Link, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Star, CheckCircle2, ChevronLeft, ChevronRight, CalendarDays, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const services = [
  {
    name: 'Painter',
    category: 'painter',
    emoji: '🎨',
    photo: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&q=80',
    desc: 'Interior and exterior painting, staining, and finishing by verified professionals.',
    rating: '4.9',
  },
  {
    name: 'Plumber',
    category: 'plumber',
    emoji: '🔧',
    photo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
    desc: 'Emergency repairs, pipe installation, leak fixing, and plumbing maintenance.',
    rating: '4.8',
  },
  {
    name: 'Electrician',
    category: 'electrician',
    emoji: '⚡',
    photo: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80',
    desc: 'Electrical wiring, lighting installation, repairs, and safety inspections.',
    rating: '4.9',
  },
];

function Home() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const { user } = useAuth();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchInput)}`);
  };

const [reviews, setReviews] = useState([]);
const [reviewsLoading, setReviewsLoading] = useState(true);
const [reviewSlide, setReviewSlide] = useState(0);

useEffect(() => {
  fetchReviews();
}, []);

const fetchReviews = async () => {
  try {
    const res = await api.get('/reviews');
    setReviews(res.data);
  } catch (err) {
    console.error('Failed to fetch reviews:', err);
  } finally {
    setReviewsLoading(false);
  }
};

  return (
    <div className="w-full flex flex-col flex-1">
      {/* Hero */}
      <section className="relative bg-[#F3F4F5] py-16 sm:py-24 px-4 sm:px-6 lg:px-10 border-b border-[#E1E3E4] overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#DCE1FF]/30 via-transparent to-[#A4F1B2]/20 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#C5C5D3] text-[#00236F] text-xs font-bold mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" /> HomeEase Verified Guarantee
          </div>

          {user && (
            <p className="text-[#16A34A] font-semibold mb-3">Welcome back, {user.name} 👋</p>
          )}

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#191C1D] tracking-tight max-w-3xl leading-tight">
            Book Trusted Home Service Professionals with AI Assistance
          </h1>

          <p className="text-base sm:text-lg text-[#444651] mt-4 mb-8 max-w-2xl font-normal">
            Connecting you with the best local professionals for your home needs. Vetted, reliable,
            and ready to help — with AI-powered matching and instant pricing.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-2.5 flex flex-col sm:flex-row gap-2.5 border border-[#C5C5D3]/80 focus-within:border-[#00236F] focus-within:ring-2 focus-within:ring-[#00236F]/10 transition-all"
          >
            <div className="flex-1 relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-[#757682]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search services (e.g., plumbing)"
                className="w-full pl-11 pr-4 py-3 rounded-lg text-sm text-[#191C1D] placeholder:text-[#757682] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#16A34A] hover:bg-[#128A3E] text-white rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-6 mt-8 text-[#444651] text-sm">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" /> Background Checked Pros
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#16A34A]" /> Verified Reviews
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Satisfaction Guarantee
            </span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-16">
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191C1D]">Our Services</h2>
            <p className="text-[#444651] mt-1">Top requested categories in your area</p>
          </div>
          <Link to="/search" className="text-[#00236F] font-semibold text-sm hover:underline flex items-center gap-1">
            View All Services →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link
              to={`/search?category=${s.category}`}
              key={s.name}
              className="group block bg-white border border-[#E1E3E4] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div
                className="h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${s.photo})` }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-3 left-3 text-3xl drop-shadow-lg">{s.emoji}</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-[#191C1D]">{s.name}</h3>
                <p className="text-[#444651] text-sm mt-1.5 mb-3 leading-relaxed">{s.desc}</p>
                <p className="text-[#16A34A] text-sm font-semibold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#16A34A]" /> {s.rating} Avg. Rating
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#F8F9FA] border-y border-[#E1E3E4] py-16 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-bold mb-3">
            SIMPLE & TRANSPARENT
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191C1D]">How HomeEase AI Works</h2>
          <p className="text-[#444651] mt-2 mb-10">Get your home repair or improvement completed in 4 simple steps</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { num: '1', color: 'bg-[#DCE1FF] text-[#1E3A8A]', title: 'Describe Your Project', desc: 'Tell our AI or search bar what you need fixed, installed, or cleaned.' },
              { num: '2', color: 'bg-[#DCFCE7] text-[#166534]', title: 'Get Matched with Pros', desc: 'Browse background-checked specialists with transparent hourly pricing.' },
              { num: '3', color: 'bg-[#DBEAFE] text-[#1E40AF]', title: 'Book & Track Live', desc: 'Choose your convenient date and time slot. Receive live arrival updates.' },
              { num: '4', color: 'bg-[#166534] text-white', title: 'Pay with Guarantee', desc: 'Release payment only when the job is done to your 100% satisfaction.' },
            ].map((step) => (
              <div key={step.num} className="bg-white border border-[#E1E3E4] rounded-2xl p-6">
                <div className={`w-9 h-9 rounded-lg ${step.color} flex items-center justify-center font-extrabold mb-4`}>
                  {step.num}
                </div>
                <h3 className="font-bold text-[#191C1D] mb-1.5">{step.title}</h3>
                <p className="text-[#444651] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
<section className="bg-[#F8F9FA] border-y border-[#E1E3E4] py-20 px-4 sm:px-6 lg:px-10">
  <div className="max-w-7xl mx-auto">

    {/* Section Header */}
    <div className="text-center mb-12">

      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF4FF] border border-[#B8C7F5] text-[#1455D9] text-xs font-bold uppercase tracking-wide">
        <BadgeCheck className="w-4 h-4" />
        Trusted by HomeEase Customers
      </span>

      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191C1D] mt-5">
        Verified Customer Reviews
      </h2>

      <p className="text-[#444651] mt-3 max-w-2xl mx-auto text-base sm:text-lg">
        Real feedback from customers who booked services through HomeEase AI
      </p>

      {/* Decorative Star */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="w-10 h-px bg-[#F59E0B]" />
        <Star className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
        <div className="w-10 h-px bg-[#F59E0B]" />
      </div>
    </div>

    {reviewsLoading ? (
      <div className="flex justify-center py-16">
        <p className="text-[#444651]">Loading reviews...</p>
      </div>

    ) : reviews.length === 0 ? (

      <div className="text-center py-16">
        <p className="text-[#444651]">
          No reviews available yet.
        </p>
      </div>

    ) : (

      <div className="relative">

        {/* Previous Button */}
        {reviews.length > 3 && (
          <button
            onClick={() =>
              setReviewSlide((prev) =>
                prev === 0 ? reviews.length - 1 : prev - 1
              )
            }
            className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10
                       w-12 h-12 rounded-full bg-white border border-[#E1E3E4]
                       shadow-md items-center justify-center
                       text-[#444651] hover:text-[#00236F]
                       hover:shadow-lg hover:scale-105 transition-all"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Reviews Container */}
        <div className="overflow-hidden">

          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${reviewSlide * 100}%)`,
            }}
          >

            {Array.from({
              length: Math.ceil(reviews.length / 3),
            }).map((_, slideIndex) => {

              const slideReviews = reviews.slice(
                slideIndex * 3,
                slideIndex * 3 + 3
              );

              return (
                <div
                  key={slideIndex}
                  className="min-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >

                  {slideReviews.map((review) => {

                    const customerName =
                      review.customer_name || 'HomeEase Customer';

                    const initial =
                      customerName.charAt(0).toUpperCase();

                    const formattedDate = review.created_at
                      ? new Date(review.created_at).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )
                      : '';

                    return (
                      <div
                        key={review.id}
                        className="group bg-white border border-[#E1E3E4]
                                   rounded-2xl p-6 sm:p-7
                                   shadow-sm hover:shadow-xl
                                   hover:-translate-y-1
                                   transition-all duration-300
                                   min-h-80 flex flex-col"
                      >

                        {/* Top Row */}
                        <div className="flex items-start justify-between gap-3">

                          {/* Stars */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((starNumber) => (
                              <Star
                                key={starNumber}
                                className={`w-5 h-5 ${
                                  starNumber <= Number(review.rating)
                                    ? 'text-[#F59E0B] fill-[#F59E0B]'
                                    : 'text-[#D1D5DB]'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Category */}
                          {review.category && (
                            <span className="px-3 py-1 rounded-full bg-[#EFF4FF]
                                             text-[#1455D9] text-xs font-bold
                                             capitalize whitespace-nowrap">
                              {review.category}
                            </span>
                          )}

                        </div>

                        {/* Review Text */}
                        <div className="flex-1 mt-7">

                          <div className="text-4xl text-[#DCE1FF] font-serif leading-none mb-2">
                            "
                          </div>

                          <p className="text-[#191C1D] text-base leading-7 font-medium">
                            {review.comment ||
                              'Excellent service experience.'}
                          </p>

                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#E1E3E4] pt-5 mt-5">

                          <div className="flex items-center justify-between">

                            {/* Customer */}
                            <div className="flex items-center gap-3">

                              <div className="w-11 h-11 rounded-full bg-[#E8EDFF]
                                              text-[#00236F] flex items-center
                                              justify-center font-bold text-lg">
                                {initial}
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5">

                                  <p className="font-bold text-[#191C1D] text-sm">
                                    {customerName}
                                  </p>

                                  <BadgeCheck
                                    className="w-4 h-4 text-[#2563EB] fill-[#DBEAFE]"
                                  />

                                </div>

                                <p className="text-xs text-[#757682] mt-0.5">
                                  Verified Customer
                                </p>
                              </div>

                            </div>

                            {/* Date */}
                            {formattedDate && (
                              <div className="flex items-center gap-1.5 text-xs text-[#757682]">
                                <CalendarDays className="w-4 h-4" />
                                {formattedDate}
                              </div>
                            )}

                          </div>

                        </div>

                      </div>
                    );
                  })}

                  {/* Empty cards to maintain 3-card layout */}
                  {slideReviews.length < 3 &&
                    Array.from({
                      length: 3 - slideReviews.length,
                    }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="hidden lg:block"
                      />
                    ))}

                </div>
              );
            })}

          </div>
        </div>

        {/* Next Button */}
        {reviews.length > 3 && (
          <button
            onClick={() =>
              setReviewSlide((prev) =>
                prev === Math.ceil(reviews.length / 3) - 1
                  ? 0
                  : prev + 1
              )
            }
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10
                       w-12 h-12 rounded-full bg-white border border-[#E1E3E4]
                       shadow-md items-center justify-center
                       text-[#444651] hover:text-[#00236F]
                       hover:shadow-lg hover:scale-105 transition-all"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

      </div>
    )}

    {/* Slider Dots */}
    {!reviewsLoading && reviews.length > 3 && (
      <div className="flex justify-center items-center gap-2 mt-8">

        {Array.from({
          length: Math.ceil(reviews.length / 3),
        }).map((_, index) => (

          <button
            key={index}
            onClick={() => setReviewSlide(index)}
            aria-label={`Go to review slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              reviewSlide === index
                ? 'w-8 bg-[#00236F]'
                : 'w-2.5 bg-[#C5C5D3] hover:bg-[#757682]'
            }`}
          />

        ))}

      </div>
    )}

    {/* Trust Features */}
    <div className="mt-14 bg-white border border-[#E1E3E4]
                    rounded-2xl p-6 sm:p-8">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#EFF4FF]
                          flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#1455D9]" />
          </div>

          <div>
            <h4 className="font-bold text-[#191C1D] text-sm">
              Verified Professionals
            </h4>

            <p className="text-xs text-[#757682] mt-1">
              Trusted service providers
            </p>
          </div>
        </div>


        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FFF7E6]
                          flex items-center justify-center">
            <Star className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
          </div>

          <div>
            <h4 className="font-bold text-[#191C1D] text-sm">
              Quality Service
            </h4>

            <p className="text-xs text-[#757682] mt-1">
              Customer-rated professionals
            </p>
          </div>
        </div>


        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#ECFDF3]
                          flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
          </div>

          <div>
            <h4 className="font-bold text-[#191C1D] text-sm">
              Reliable Service
            </h4>

            <p className="text-xs text-[#757682] mt-1">
              Book with confidence
            </p>
          </div>
        </div>


        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F3E8FF]
                          flex items-center justify-center">
            <BadgeCheck className="w-6 h-6 text-[#7C3AED]" />
          </div>

          <div>
            <h4 className="font-bold text-[#191C1D] text-sm">
              Verified Reviews
            </h4>

            <p className="text-xs text-[#757682] mt-1">
              Real customer experiences
            </p>
          </div>
        </div>

      </div>
    </div>

  </div>
</section>
    </div>
  );
}

export default Home;
