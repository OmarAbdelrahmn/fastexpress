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
    name
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value || '');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // If external value changes, update internal search term, 
        // but only if we're not currently typing (document.activeElement check could be added if needed,
        // but simplicity usually works: if value prop updates, sync it).
        // However, during typing, we don't want to overwrite unless selection happened.
        // For now, let's sync if value exists.
        if (value) {
            setSearchTerm(value);
        }
    }, [value]);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredOptions(options);
        } else {
            setFilteredOptions(
                options.filter(option =>
                    option.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                // On close, if the text doesn't match a value, should we reset?
                // If strictly selecting from list:
                if (!options.includes(searchTerm) && value) {
                    setSearchTerm(value); // Revert to last valid value
                } else if (!options.includes(searchTerm) && !value) {
                    setSearchTerm(''); // Clear if invalid
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchTerm, options, value]);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
        // Optional: if allowing free text, call onChange here.
        // But for "Select", we usually want a valid option.
        // Use case: Country selection (Strict).
    };

    const handleSelect = (option) => {
        onChange({ target: { name, value: option } });
        setSearchTerm(option);
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
        <div className="relative w-full" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    className={`
            w-full pl-4 pr-10 py-3 border rounded-lg bg-white
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
            ${error ? 'border-red-500' : 'border-gray-300'}
            text-gray-900 placeholder-gray-400
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
                    <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`
                    px-4 py-2.5 text-sm cursor-pointer transition-colors
                    ${option === value ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                                    onMouseDown={() => handleSelect(option)} // onMouseDown fires before onBlur
                                >
                                    {option}
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
