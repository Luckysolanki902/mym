// components/FilterOptions.js

import React, { useState } from 'react';

const FilterOptions = ({ applyFilters }) => {
  const [filters, setFilters] = useState({
    college: 'Any',
    gender: 'Any',
  });

  const handleApplyFilters = () => {
    applyFilters(filters);
  };

  return (
    <div>
      <label>
        Select College:
        <select
          value={filters.college}
          onChange={(e) => setFilters({ ...filters, college: e.target.value })}
        >
          {/* Options for colleges */}
        </select>
      </label>

      <label>
        Select Gender:
        <select
          value={filters.gender}
          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
        >
          <option value="Any">Any</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </label>

      <button onClick={handleApplyFilters}>Apply Filters</button>
    </div>
  );
};

export default FilterOptions;
