import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import HeroSection from '../components/HeroSection';
import FoodCard from '../components/FoodCard';
import { FoodCardSkeleton } from '../components/LoadingSkeleton';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/foods?limit=8'),
      api.get('/categories'),
    ]).then(([foods, cats]) => {
      setFeatured(foods.data.foods);
      setCategories(cats.data.categories);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <HeroSection />
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <Link key={cat._id} to={`/menu?category=${cat._id}`} className="bg-white border border-gray-200 px-5 py-3 rounded-full hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 transition-all font-medium text-sm">
              {cat.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Popular Items</h2>
          <Link to="/menu" className="text-primary-500 hover:text-primary-600 font-medium text-sm">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <FoodCardSkeleton key={i} />)
            : featured.map(food => <FoodCard key={food._id} food={food} />)}
        </div>
      </section>
    </div>
  );
}
