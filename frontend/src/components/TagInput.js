import { XMarkIcon } from '@heroicons/react/24/solid';
import { useState, useRef } from 'react';

export default function TagInput({ options, value, onChange, placeholder = 'Select skills...', label }) {
  const [input, setInput] = useState('');
  const [dropdown, setDropdown] = useState(false);
  const inputRef = useRef();

  const filteredOptions = options.filter(
    (opt) => !value.includes(opt) && opt.toLowerCase().includes(input.toLowerCase())
  );

  const addTag = (tag) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
      setInput('');
      setDropdown(false);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="w-full relative">
      {label && <label className="block text-base font-semibold text-slate-700 mb-2">{label}</label>}
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border border-border bg-white focus-within:ring-2 focus-within:ring-primary/20 min-h-[48px] cursor-text transition-all"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-primary/20">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-primary hover:text-red-500">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-base py-1 px-2"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setDropdown(true);
          }}
          onFocus={() => setDropdown(true)}
          onBlur={() => setTimeout(() => setDropdown(false), 100)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
      {dropdown && filteredOptions.length > 0 && (
        <div className="absolute z-20 mt-2 bg-white border border-border rounded-xl shadow-xl w-full max-h-56 overflow-auto animate-fadeIn">
          {filteredOptions.map((opt) => (
            <div
              key={opt}
              className="px-4 py-2 hover:bg-primary/10 cursor-pointer text-base transition-all"
              onMouseDown={() => addTag(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 