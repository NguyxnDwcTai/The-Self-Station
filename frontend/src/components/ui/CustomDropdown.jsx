import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

const CustomDropdown = ({ options, value, onChange, placeholder, icon: Icon = Filter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all outline-none focus:ring-2 focus:ring-green-300"
        style={{ 
          minHeight: '44px', 
          border: '1px solid var(--outline-faint)',
          padding: '0.625rem 1rem',   /* padding cân xứng: trên-dưới 10px, trái-phải 16px */
        }}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-gray-500" style={{ flexShrink: 0 }} />}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ flexShrink: 0, marginLeft: '0.5rem' }}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden" 
             style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="max-h-60 overflow-y-auto py-2">
            <button
               className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-100 ${!value ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700'}`}
               style={{ padding: '0.75rem 1rem'}}
               onClick={() => { onChange(''); setIsOpen(false); }}
            >
               {placeholder}
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                className={`w-full text-left text-sm transition-colors hover:bg-gray-100 ${value === opt.value ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700'}`}
                style={{ padding: '0.75rem 1rem' }}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
