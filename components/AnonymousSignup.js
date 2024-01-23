import React, { useState } from 'react';
import Link from 'next/link';

const AnonymousSignup = () => {
  const colleges = ['HBTU Kanpur', 'IIT Kanpur', /* Add other colleges here */];

  const [selectedGender, setSelectedGender] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };

  const handleCollegeChange = (event) => {
    setSelectedCollege(event.target.value);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2980b9' }}>Try Anonymously</h1>
      <form onSubmit={'set it to set the  in the index.js page from this component to set the userdata state for no session case otherwise fetch userdetails'}>

      <p style={{ fontSize: '18px', marginBottom: '10px' }}>Enter your gender:</p>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <label style={{ marginRight: '20px', fontSize: '16px' }}>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={selectedGender === 'male'}
            onChange={handleGenderChange}
          />
          <span style={{ marginLeft: '5px' }}>Male</span>
        </label>
        <label style={{ fontSize: '16px' }}>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={selectedGender === 'female'}
            onChange={handleGenderChange}
          />
          <span style={{ marginLeft: '5px' }}>Female</span>
        </label>
      </div>

      <p style={{ fontSize: '18px', marginBottom: '10px' }}>College:</p>
      <select
        onChange={handleCollegeChange}
        value={selectedCollege}
        style={{ padding: '8px', fontSize: '16px' }}
      >
        <option value="">Don't want college preference</option>
        {colleges.map((college, index) => (
          <option key={index} value={college}>
            {college}
          </option>
        ))}
      </select>
      </form>

      <p style={{ fontSize: '16px', marginTop: '20px', fontStyle: 'italic', color:'green', fontWeight:'600' }}>
        To avoid spam, we encourage users to log in to ensure authenticity.
      </p>

      <div style={{ marginTop: '30px' }}>
        <Link href="/signup" style={{ color: 'white', marginRight: '20px', fontSize: '18px', textDecoration:'none', background:'black', padding:'0.5rem 1rem', borderRadius:'0.6rem' }}>
          Sign Up
        </Link>
        <Link href="/signup" style={{ color: 'white', fontSize: '18px', textDecoration:'none', background:'black', padding:'0.5rem 1rem', borderRadius:'0.6rem' }}>
          Sign Up with Email
        </Link>
      </div>
    </div>
  );
};

export default AnonymousSignup;
