// components/commonComps/SearchableCollegeSelect.js
import React, { useState, useEffect, useRef } from 'react';
import { TextField, Autocomplete, Paper } from '@mui/material';
import styled from '@emotion/styled';
import SchoolIcon from '@mui/icons-material/School';

const StyledAutocomplete = styled(Autocomplete)(({ gender }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '1rem',
    fontFamily: 'Quicksand, sans-serif',
    background: 'rgba(255,255,255,0.5)',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: '#dfe6e9',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#b2bec3',
    },
    '&.Mui-focused fieldset': {
      borderColor: gender === 'male' 
        ? 'rgba(79, 195, 247, 0.6)' 
        : gender === 'female' 
          ? 'rgba(236, 64, 122, 0.6)' 
          : '#4F83CC',
      borderWidth: '2px',
    },
  },
  '& .MuiInputBase-input': {
    fontFamily: 'Quicksand, sans-serif',
    fontSize: '1rem',
    color: '#2d3436',
  },
  '& .MuiAutocomplete-endAdornment': {
    right: '12px !important',
  },
}));

const StyledPaper = styled(Paper)(({ gender }) => ({
  borderRadius: '1rem',
  marginTop: '0.5rem',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px) saturate(150%)',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  boxShadow: '0 8px 32px -8px rgba(31, 38, 135, 0.2)',
  maxHeight: '300px',
  overflow: 'auto',
  fontFamily: 'Quicksand, sans-serif',
  '& .MuiAutocomplete-listbox': {
    fontFamily: 'Quicksand, sans-serif',
    '& .MuiAutocomplete-option': {
      fontFamily: 'Quicksand, sans-serif',
      padding: '10px 16px',
      transition: 'all 0.2s ease',
      '&[aria-selected="true"]': {
        backgroundColor: gender === 'male'
          ? 'rgba(79, 195, 247, 0.15) !important'
          : gender === 'female'
            ? 'rgba(236, 64, 122, 0.15) !important'
            : 'rgba(100, 100, 100, 0.15) !important',
      },
      '&.Mui-focused': {
        backgroundColor: gender === 'male'
          ? 'rgba(79, 195, 247, 0.1) !important'
          : gender === 'female'
            ? 'rgba(236, 64, 122, 0.1) !important'
            : 'rgba(100, 100, 100, 0.1) !important',
      },
    },
  },
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: gender === 'male'
      ? 'rgba(79, 195, 247, 0.4)'
      : gender === 'female'
        ? 'rgba(236, 64, 122, 0.4)'
        : 'rgba(100, 100, 100, 0.4)',
    borderRadius: '10px',
    '&:hover': {
      background: gender === 'male'
        ? 'rgba(79, 195, 247, 0.6)'
        : gender === 'female'
          ? 'rgba(236, 64, 122, 0.6)'
          : 'rgba(100, 100, 100, 0.6)',
    },
  },
}));

const SearchableCollegeSelect = ({ 
  value, 
  onChange, 
  colleges = [],
  gender = null,
  placeholder = "Search and select your college...",
  style = {}
}) => {
  const [sortedColleges, setSortedColleges] = useState([]);

  useEffect(() => {
    // Sort colleges alphabetically
    const sorted = [...colleges].sort((a, b) => {
      const nameA = a.college || '';
      const nameB = b.college || '';
      return nameA.localeCompare(nameB);
    });
    setSortedColleges(sorted);
  }, [colleges]);

  const selectedCollege = sortedColleges.find(col => col.college === value) || null;

  return (
    <StyledAutocomplete
      value={selectedCollege}
      onChange={(event, newValue) => {
        onChange(newValue ? newValue.college : '');
      }}
      options={sortedColleges}
      getOptionLabel={(option) => option.college || ''}
      isOptionEqualToValue={(option, value) => option.college === value?.college}
      gender={gender}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <SchoolIcon 
                sx={{ 
                  mr: 1, 
                  ml: 0.5,
                  color: gender === 'male' 
                    ? 'rgba(79, 195, 247, 0.7)' 
                    : gender === 'female' 
                      ? 'rgba(236, 64, 122, 0.7)' 
                      : '#636e72',
                  fontSize: '1.3rem'
                }} 
              />
            ),
          }}
        />
      )}
      PaperComponent={(props) => <StyledPaper {...props} gender={gender} />}
      noOptionsText="No colleges found"
      style={{ marginBottom: '1.5rem', ...style }}
      ListboxProps={{
        style: {
          maxHeight: '250px',
        }
      }}
    />
  );
};

export default SearchableCollegeSelect;
