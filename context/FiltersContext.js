// context/filtersContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';

const FiltersContext = createContext();

export const FiltersProvider = ({ children }) => {
    // Initialize from localStorage if available
    const [preferredCollege, setPreferredCollegeState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('preferredCollege');
            return saved || 'any';
        }
        return 'any';
    });

    const [preferredGender, setPreferredGenderState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('preferredGender');
            return saved || 'any';
        }
        return 'any';
    });

    // Wrapper functions to persist to localStorage
    const setPreferredCollege = (value) => {
        setPreferredCollegeState(value);
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferredCollege', value);
        }
    };

    const setPreferredGender = (value) => {
        setPreferredGenderState(value);
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferredGender', value);
        }
    };

    return (
        <FiltersContext.Provider
            value={{
                preferredCollege,
                setPreferredCollege,
                preferredGender,
                setPreferredGender
            }}
        >
            {children}
        </FiltersContext.Provider>
    );
};

export const useFilters = () => useContext(FiltersContext);
