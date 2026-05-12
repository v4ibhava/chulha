import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search foods..."
        className="input-field pl-10"
      />
    </div>
  );
}
