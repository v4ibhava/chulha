import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/axios';
import FoodCard from '../components/FoodCard';
import SearchBar from '../components/SearchBar';
import { FoodCardSkeleton } from '../components/LoadingSkeleton';
import { FaceFrownIcon } from '@heroicons/react/24/solid';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;
    api.get('/foods', { params }).then(({ data }) => {
      setFoods(data.foods);
      setTotalPages(data.pages);
    }).finally(() => setLoading(false));
  }, [page, activeCategory, search]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    setSearchParams(val ? { search: val } : {});
  };

  const handleCategory = (catId) => {
    setActiveCategory(catId === activeCategory ? '' : catId);
    setPage(1);
    setSearchParams(catId ? { category: catId } : {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-charcoal-900 mb-6">Our Menu</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar value={search} onChange={handleSearch} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => handleCategory('')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!activeCategory ? 'bg-charcoal-900 text-white shadow-md' : 'bg-neutral-100 text-charcoal-600 hover:bg-neutral-200 border border-neutral-200'}`}>All</button>
        {categories.map(cat => (
          <button key={cat._id} onClick={() => handleCategory(cat._id)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat._id ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-neutral-100 text-charcoal-600 hover:bg-neutral-200 border border-neutral-200'}`}>{cat.name}</button>
        ))}
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <FoodCardSkeleton key={i} />)}
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-16"><div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><FaceFrownIcon className="w-7 h-7 text-charcoal-400" /></div><p className="text-lg font-bold text-charcoal-700">No foods found</p></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {foods.map(food => <FoodCard key={food._id} food={food} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === i + 1 ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-neutral-100 text-charcoal-600 hover:bg-neutral-200 border border-neutral-200'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
