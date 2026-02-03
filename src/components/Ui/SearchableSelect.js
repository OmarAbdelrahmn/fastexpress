import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

const SearchableSelect = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Search...',
    required = false,
    error = '',
    name,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Normalize options to handle both strings and objects
    const normalizedOptions = options.map(opt =>
        typeof opt === 'object' ? { id: opt.id, name: opt.name } : { id: opt, name: opt }
    );

    // Sync search term with value when value changes or options load
    useEffect(() => {
        if (value !== undefined && value !== null && value !== '') {
            const selectedOption = normalizedOptions.find(opt => String(opt.id) === String(value));
            if (selectedOption) {
                setSearchTerm(selectedOption.name);
            } else if (typeof value === 'string') {
                setSearchTerm(value);
            }
        } else {
            setSearchTerm('');
        }
    }, [value, options]);

    const filteredOptions = searchTerm === '' || normalizedOptions.some(opt => opt.name === searchTerm)
        ? normalizedOptions
        : normalizedOptions.filter(option =>
            option.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                // On close, if the text doesn't match a value, revert to last valid name
                const selectedOption = normalizedOptions.find(opt => String(opt.id) === String(value));
                if (selectedOption) {
                    setSearchTerm(selectedOption.name);
                } else if (!value) {
                    setSearchTerm('');
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchTerm, normalizedOptions, value]);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
    };

    const handleSelect = (option) => {
        onChange({ target: { name, value: option.id } });
        setSearchTerm(option.name);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange({ target: { name, value: '' } });
        setSearchTerm('');
        setIsOpen(false);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    return (
        <div className={`relative ${className || 'w-full'}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 ">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    className={`
            w-full pl-4 pr-10 py-1.5 border rounded-lg bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-500' : 'border-gray-300'}
            text-sm text-gray-900 placeholder-gray-400
          `}
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    autoComplete="off"
                />

                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    )}
                    {!value && (
                        <ChevronDown
                            size={20}
                            className={`text-gray-400 transition-transform cursor-pointer ${isOpen ? 'rotate-180' : ''}`}
                            onClick={() => {
                                setIsOpen(!isOpen);
                                if (!isOpen) inputRef.current?.focus();
                            }}
                        />
                    )}
                </div>

                {isOpen && (
                    <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`
                    px-4 py-2.5 text-sm cursor-pointer transition-colors
                    ${String(option.id) === String(value) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                                    onMouseDown={() => handleSelect(option)}
                                >
                                    {option.name}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                {'لا توجد نتائج'}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default SearchableSelect;
