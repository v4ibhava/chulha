import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="relative mb-8 group">
        {/* The generated image of the empty plate */}
        <div className="w-64 h-64 md:w-80 md:h-80 relative animate-fade-in">
          <img 
            src="/images/empty-plate.png" 
            alt="Empty Plate" 
            className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700"
          />
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-primary-500/5 rounded-full blur-3xl -z-10 animate-pulse" />
        </div>
        
        {/* Floating badge for 404 */}
        <div className="absolute -top-4 -right-4 bg-primary-500 text-white font-black text-xl px-4 py-2 rounded-2xl shadow-lg shadow-primary-500/30 rotate-12 animate-pop-in">
          404
        </div>
      </div>

      <div className="text-center max-w-md animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-display font-black text-charcoal-900 mb-4">
          Plate's Empty!
        </h1>
        <p className="text-charcoal-500 text-lg mb-10 leading-relaxed">
          It looks like the page you're searching for has been devoured or never existed in our kitchen.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/" 
            className="btn-primary flex items-center gap-2 group"
          >
            <HomeIcon className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
            Back to Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-charcoal-700 font-bold hover:text-primary-500 transition-colors px-6 py-3"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
