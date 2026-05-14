import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import HeroSection from '../components/HeroSection';
import FoodCard from '../components/FoodCard';
import { FoodCardSkeleton } from '../components/LoadingSkeleton';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { FaceFrownIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/foods?limit=12'),
      api.get('/categories'),
    ]).then(([foodsRes, catsRes]) => {
      setFoods(foodsRes.data.foods);
      setCategories(catsRes.data.categories);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 12 };
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;
    api.get('/foods', { params }).then(({ data }) => {
      setFoods(data.foods);
    }).finally(() => setLoading(false));
  }, [search, activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search) return;
    navigate(`/menu?search=${encodeURIComponent(search)}`);
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId === activeCategory ? '' : catId);
  };

  return (
    <div className="bg-white min-h-screen">
      <HeroSection />

      {/* Search + Categories row */}
      <div className="max-w-7xl mx-auto px-4 mt-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
            <button
              onClick={() => setActiveCategory('')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${!activeCategory ? 'bg-charcoal-900 text-white shadow-md' : 'bg-neutral-100 border border-neutral-200 text-charcoal-600 hover:bg-neutral-200'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat._id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === cat._id ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-neutral-100 border border-neutral-200 text-charcoal-600 hover:bg-neutral-200'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2 shrink-0">
            <div className="relative w-72">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes..."
                className="w-full pl-9 pr-3 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500/15 focus:border-primary-400 outline-none text-sm text-charcoal-800 placeholder:text-charcoal-400 transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-black text-charcoal-900">
            {search ? `Results for "${search}"` : activeCategory
              ? categories.find(c => c._id === activeCategory)?.name || 'Selected'
              : "Today's Specials"}
          </h2>
          {(search || activeCategory) && (
            <button
              onClick={() => { setSearch(''); setActiveCategory(''); }}
              className="text-xs text-charcoal-500 hover:text-primary-500 font-bold transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <FoodCardSkeleton key={i} />)}
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <FaceFrownIcon className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-base font-bold text-charcoal-700 mb-1">No dishes found</p>
            <p className="text-sm text-charcoal-500 mb-4">Try a different search or category</p>
            <button onClick={() => { setSearch(''); setActiveCategory(''); }} className="btn-primary text-xs py-2.5 px-5">View All</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {foods.map(food => <FoodCard key={food._id} food={food} />)}
          </div>
        )}
      </div>
    </div>
  );
}
