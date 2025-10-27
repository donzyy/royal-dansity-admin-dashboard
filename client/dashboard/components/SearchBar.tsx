import React from 'react';

interface SearchBarProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onSearch,
}) => {
  return (
    <div>
      <label htmlFor="search-input" className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id="search-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-gold focus:border-royal-gold"
        />
        {onSearch && (
          <button
            onClick={onSearch}
            className="px-6 py-3 bg-royal-gold text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Search
          </button>
        )}
      </div>
    </div>
  );
};


