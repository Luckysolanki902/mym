import React, { useEffect, useRef, useState } from 'react';
import Confession from '@/components/fullPageComps/Confession';
import CircularProgress from '@mui/material/CircularProgress';
import { Drawer, Select, MenuItem, Button } from '@mui/material'; // Import Drawer, Select, MenuItem, and Button from Material-UI
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './allconfessions.module.css';

const Index = ({ userDetails, initialConfessions }) => {
  const [confessions, setConfessions] = useState(initialConfessions);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [collegeOptions, setCollegeOptions] = useState([]); // State for college options
  const [selectedOption, setSelectedOption] = useState(''); // State for selected option
  const [selectedCollege, setSelectedCollege] = useState(''); // State for selected college
  const [drawerOpen, setDrawerOpen] = useState(false); // State for drawer open/close
  const sentinelRef = useRef(null);
  const router = useRouter();

  // Function to fetch college options
  const fetchCollegeOptions = async () => {
    try {
      const response = await fetch('/api/admin/college/getcolleges');
      if (response.ok) {
        const data = await response.json();
        setCollegeOptions(data.colleges);
      } else {
        console.error('Error fetching college options');
      }
    } catch (error) {
      console.error('Error fetching college options:', error);
    }
  };

  useEffect(() => {
    fetchCollegeOptions(); // Fetch college options when component mounts
  }, []);

  const fetchMoreConfessions = async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/confessions/getconfessions?page=${page + 1}`);
    if (response.ok) {
      const newConfessionsData = await response.json();
      const newConfessions = newConfessionsData.confessions;
      if (newConfessions.length === 0) {
        setHasMore(false);
      } else {
        setConfessions(prevConfessions => [...prevConfessions, ...newConfessions]);
        setPage(prevPage => prevPage + 1);
      }
    } else {
      console.error('Error fetching more confessions');
    }
    setLoading(false);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleCollegeChange = (event) => {
    setSelectedCollege(event.target.value);
  };

  const handleSubmit = () => {
    // Handle submit based on selected option (college or email)
    if (selectedOption === 'college') {
      // Fetch confessions by college
      // Example: fetch(`/api/admin/confessions/getconfessions?college=${selectedCollege}`);
    } else if (selectedOption === 'email') {
      // Fetch confessions by email
      // Example: fetch(`/api/admin/confessions/getconfessions?email=${selectedEmail}`);
    }
    // You need to implement the logic to fetch confessions based on selected option
  };

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchMoreConfessions();
      }
    }, { threshold: 0.5 });

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div style={{ width: '100%', paddingTop: '2rem' }}>
      <Button onClick={handleDrawerOpen} variant="contained" color="primary">Filter Options</Button>
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={handleDrawerClose}
      >
        <div style={{ padding: '1rem' }}>
          <Select
            value={selectedOption}
            onChange={handleOptionChange}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>Select Option</MenuItem>
            <MenuItem value="college">Find by College</MenuItem>
            <MenuItem value="email">Find by Email</MenuItem>
          </Select>
          {selectedOption === 'college' && (
            <Select
              value={selectedCollege}
              onChange={handleCollegeChange}
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>Select College</MenuItem>
              {collegeOptions?.map(college => (
                <MenuItem key={college.id} value={college.id}>{college.name}</MenuItem>
              ))}
            </Select>
          )}
          {selectedOption === 'email' && (
            <input
              type="email"
              placeholder="Enter Email"
              value={selectedEmail}
              onChange={handleEmailChange}
              style={{ marginTop: '1rem', width: '100%', padding: '0.5rem' }}
            />
          )}
          <Button onClick={handleSubmit} variant="contained" color="primary" style={{ marginTop: '1rem' }}>Submit</Button>
        </div>
      </Drawer>

      {confessions.map((confession, index) => (
        <Confession key={confession._id} confession={confession} applyGenderBasedGrandients={true} />
      ))}
      {(loading) &&
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem', marginTop: '0' }} className={styles.isLoading}>
          <p >Loading confessions</p>
          <span>
            <Image src={'/gifs/istyping4.gif'} width={800 / 2} height={600 / 2} alt='' />
          </span>
        </div>
      }
      <div ref={sentinelRef} style={{ height: '10px', background: 'transparent' }}></div>
      {!hasMore &&
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '3rem', marginTop: '0' }} className={styles.isLoading}>
          <p style={{ padding: '1rem', textAlign: 'center', opacity: '0.7', scale: '0.8' }}>You have seen all available confessions of your college</p>
        </div>
      }
    </div>
  );
};

export async function getServerSideProps(context) {
  const pageurl = 'https://www.meetyourmate.in';
  let initialConfessions = [];
  try {
    const response = await fetch(`${pageurl}/api/admin/confessions/getconfessions?&page=1`);
    if (response.ok) {
      const data = await response.json();
      initialConfessions = data.confessions;
    } else {
      console.error('Error fetching initial confessions');
    }
  } catch (error) {
    console.error('Error fetching initial confessions:', error);
  }

  try {
    const response = await fetch(`${pageurl}/api/admin/college/getcolleges?`);
    if (response.ok) {
      const data = await response.json();
      initialConfessions = data;
    } else {
      console.error('Error fetching initial confessions');
    }
  } catch (error) {
    console.error('Error fetching colleges:', error);
  }

  return {
    props: {
      userDetails: {},
      initialConfessions,
    },
  };
}

export default Index;
