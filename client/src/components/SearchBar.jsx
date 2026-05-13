import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search foods..."
        className="w-full pl-9 pr-3 py-2 bg-neutral-100 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500/15 focus:border-primary-400 outline-none text-sm text-charcoal-800 placeholder:text-charcoal-400 transition-all"
      />
    </div>
  );
}
