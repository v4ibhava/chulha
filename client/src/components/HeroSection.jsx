import { Link } from 'react-router-dom';
import { FireIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-500 to-primary-700 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Delicious Food, <br />Delivered <span className="text-yellow-300">Fast</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-100 mb-8">
            Order your favorite meals from the best restaurants in town. Fresh, hot, and quick!
          </p>
          <div className="flex gap-4">
            <Link to="/menu" className="bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 hover:text-gray-900 transition-all duration-200">
              Order Now
            </Link>
            <Link to="/menu" className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-200">
              View Menu
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-16 -right-16 opacity-10 hidden md:block"><FireIcon className="inline w-24 h-24 mr-6" /><SparklesIcon className="inline w-24 h-24 mr-6" /><FireIcon className="inline w-24 h-24" /></div>
    </section>
  );
}
