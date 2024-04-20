// context/filtersContext.js

import React, { createContext, useState, useContext } from 'react';

const FiltersContext = createContext();
export const FiltersProvider = ({ children }) => {
    const [preferredCollege, setPreferredCollege] = useState('any');
    const [preferredGender, setPreferredGender] = useState('any');
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
