import { XMarkIcon } from '@heroicons/react/24/solid';
import { useState, useRef } from 'react';

export default function TagInput({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = 'Add tags...', 
  label,
  allowCustom = true 
}) {
  const [input, setInput] = useState('');
  const [dropdown, setDropdown] = useState(false);
  const inputRef = useRef();

  // Ensure value is always an array
  const tags = Array.isArray(value) ? value : [];

  const filteredOptions = options.filter(
    (opt) => !tags.includes(opt) && opt.toLowerCase().includes(input.toLowerCase())
  );

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
      setInput('');
      setDropdown(false);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="w-full relative">
      {label && <label className="block text-sm font-medium text-secondary-700 mb-2">{label}</label>}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl border border-secondary-300/60 dark:border-secondary-600 bg-white/80 dark:bg-secondary-700/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 min-h-[48px] cursor-text transition-all duration-200 input-focus"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 bg-primary-100 text-primary-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border border-primary-200">
            {tag}
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }} 
              className="ml-1 text-primary-600 hover:text-error-600 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 py-1 px-2"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setDropdown(true)}
          onBlur={() => setTimeout(() => setDropdown(false), 100)}
          placeholder={tags.length === 0 ? placeholder : 'Add more...'}
          autoComplete="off"
        />
      </div>
      
      {/* Dropdown for predefined options */}
      {dropdown && options.length > 0 && filteredOptions.length > 0 && (
        <div className="absolute z-20 mt-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-600 rounded-xl shadow-xl w-full max-h-56 overflow-auto animate-fade-in">
          {filteredOptions.map((opt) => (
            <div
              key={opt}
              className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-secondary-900 transition-all"
              onMouseDown={() => addTag(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
      
      {/* Helper text */}
      {allowCustom && (
        <p className="text-xs text-secondary-500 mt-1">
          Press Enter or comma to add tags
        </p>
      )}
    </div>
  );
} 