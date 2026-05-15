import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch: (value: string) => void;
  debounceMs?: number;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, debounceMs = 300, className, ...props }, ref) => {
    const [value, setValue] = useState('');
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);

        if (timeoutId) clearTimeout(timeoutId);

        const id = setTimeout(() => {
          onSearch(newValue);
        }, debounceMs);

        setTimeoutId(id);
      },
      [onSearch, debounceMs, timeoutId]
    );

    const handleClear = () => {
      setValue('');
      onSearch('');
    };

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          className={cn(
            'w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-10 text-slate-100 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
            className
          )}
          {...props}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
