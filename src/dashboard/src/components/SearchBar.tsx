import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search...', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div 
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${className}`}
        style={{
          background: isFocused 
            ? 'oklch(0.98 0.008 195 / 0.8)' 
            : 'oklch(0.97 0.008 195 / 0.5)',
          border: `1px solid ${isFocused 
            ? 'var(--color-accent-base)' 
            : 'var(--color-border-subtle)'}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Search 
          className="w-5 h-5 flex-shrink-0" 
          style={{ color: isFocused ? 'var(--color-accent-base)' : 'var(--color-text-tertiary)' }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--color-text-primary)' }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
          </button>
        )}
      </div>
    </form>
  );
}
