import React, { useEffect } from 'react';

const FilterOptions = ({ filters, setFilters, userCollege, userGender }) => {
  useEffect(() => {
    if (userCollege && userGender) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        college: userCollege || 'any',
        strangerGender: userGender === 'male' ? 'female' : 'male', // Set the default as the opposite gender
      }));
    }
  }, [userCollege, userGender, setFilters]);

  const handleCollegeChange = (event) => {
    const { value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      college: value,
    }));
  };

  const handleGenderChange = (event) => {
    const { value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      strangerGender: value,
    }));
  };

  if (!userCollege || !userGender) {
    return <p>Loading college and gender options...</p>; // Display loading message while data is being fetched
  }

  return (
    <div>
      <label>
        College Preference:
        <select value={userCollege} onChange={handleCollegeChange}>
          <option value="any">Any</option>
          <option value={userCollege}>Same College</option>
          {/* Add other college options if needed */}
        </select>
      </label>

      <label>
        Meet With:
        <select value={filters.strangerGender} onChange={handleGenderChange}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="any">Any</option>
        </select>
      </label>
    </div>
  );
};

export default FilterOptions;
