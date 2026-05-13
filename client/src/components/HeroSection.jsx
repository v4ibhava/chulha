import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';

export default function HeroSection() {
  return (
    <section className="relative min-h-[55vh] flex items-center pt-10 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
          <div className="lg:col-span-3 animate-slide-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-primary-600 rounded-full text-xs font-bold mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Now serving all across the city
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-extrabold text-charcoal-900 leading-[1.15] mb-3">
              From the Heart <br />
              <span className="text-primary-500">to your Hearth.</span>
            </h1>

            <p className="text-base md:text-lg text-charcoal-500 leading-relaxed mb-5 max-w-md">
              Experience the authentic taste of artisanal cooking, prepared with passion and delivered with precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/menu" className="btn-primary flex items-center justify-center gap-2 text-sm py-3 px-6">
                <ShoppingBagIcon className="w-4 h-4" />
                Explore Menu
              </Link>
              <Link to="/menu" className="btn-outline flex items-center justify-center gap-2 text-sm py-3 px-6">
                How it works
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 relative animate-fade-in hidden lg:block">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl shadow-primary-500/15 transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src="/images/hero-home.png"
                alt="Delicious Artisanal Food"
                className="w-full h-56 object-cover"
              />
            </div>
            <div className="absolute -top-6 -right-6 w-36 h-36 bg-primary-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-charcoal-900/5 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
