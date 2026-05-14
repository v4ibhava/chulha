import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';

export default function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 overflow-hidden">
      <div className="flex items-center justify-between">

        {/* Left — Text */}
        <div className="flex-1 max-w-lg">
          <h1
            className="text-3xl md:text-[3.4rem] font-display text-charcoal-700 leading-[1.15] mb-6 opacity-0 animate-hero-text"
          >
            <span className="font-black text-primary-500">Food</span> you love,<br />
            delivered <span className="font-black text-primary-500">to you</span>
          </h1>

          <div className="opacity-0 animate-hero-text" style={{ animationDelay: '0.15s' }}>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-charcoal-900 text-white font-bold text-sm py-3 px-7 rounded-full hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-charcoal-900/15"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              Order Now
            </Link>
          </div>
        </div>

        {/* Right — Stepper + Bowl */}
        <div className="hidden md:flex items-center flex-shrink-0 gap-0">

          {/* Stepper: labels + arc + dots */}
          <div className="relative flex items-center mr-[-8px]">
            {/* Labels column */}
            <div className="flex flex-col items-end gap-[56px] mr-2">
              <span className="text-xs font-bold text-charcoal-500 leading-tight text-right opacity-0 animate-hero-text" style={{ animationDelay: '0.3s' }}>
                Choose your favourite<br />meal
              </span>
              <span className="text-xs font-bold text-charcoal-500 leading-tight text-right opacity-0 animate-hero-text" style={{ animationDelay: '0.45s' }}>
                place and order
              </span>
              <span className="text-xs font-bold text-charcoal-500 leading-tight text-right opacity-0 animate-hero-text" style={{ animationDelay: '0.6s' }}>
                Enjoy your Favourite<br />meal
              </span>
            </div>

            {/* Arc + dots */}
            <svg className="w-10 h-[200px] flex-shrink-0" viewBox="0 0 32 160" fill="none">
              <path
                d="M 28 16 Q 2 80 28 144"
                stroke="#c0c0c0"
                strokeWidth="1"
                strokeDasharray="4 3"
                className="animate-draw"
              />
              <circle cx="28" cy="16" r="3" fill="#222" className="opacity-0 animate-pop-in" style={{ animationDelay: '0.35s' }} />
              <circle cx="15" cy="80" r="3" fill="#222" className="opacity-0 animate-pop-in" style={{ animationDelay: '0.5s' }} />
              <circle cx="28" cy="144" r="3" fill="#222" className="opacity-0 animate-pop-in" style={{ animationDelay: '0.65s' }} />
            </svg>
          </div>

          {/* Bowl — slides in from right */}
          <div className="opacity-0 animate-slide-in-right -ml-4" style={{ animationDelay: '0.1s' }}>
            <img
              src="/images/hero-bowl.png"
              alt="Delicious food bowl"
              className="w-[420px] h-[420px] object-contain transition-transform duration-500"
            />
          </div>
        </div>

        {/* Mobile bowl (no stepper) */}
        <div className="md:hidden flex-shrink-0 opacity-0 animate-slide-in-right">
          <img
            src="/images/hero-bowl.png"
            alt="Delicious food bowl"
            className="w-48 h-48 object-contain drop-shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
