import React, { useRef, useEffect, useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import styles from '@/components/componentStyles/confession.module.css';
import { useMediaQuery } from '@mui/material';

const guessYearAndBranch = (email) => {
  // Extract the starting year from the email (first two digits)
  const startingYear = parseInt(email.substr(0, 2), 10);

  // Determine the current year and month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString().slice(-2);

  const currentMonth = currentDate.getMonth() + 1; // Month is zero-indexed

  // Calculate the student's current year of study
  let guessedYear = currentYear - startingYear + 1;
  if (currentMonth < 7) {
      // If the current month is before July, the student is still in the previous academic year
      guessedYear--;
  }

  // Map the guessed year to the appropriate string
  let yearString = '';
  if (guessedYear === 1) {
      yearString = 'First Year';
  } else if (guessedYear === 2) {
      yearString = 'Second Year';
  } else if (guessedYear === 3) {
      yearString = 'Third Year';
  } else if (guessedYear === 4) {
      yearString = 'Final Year';
  } else if (guessedYear > 4) {
      yearString = 'Passed Out';
  }else{
      yearString = "Can't Decide";
  }


  // Extract the branch code from the email (next four digits)
  const branchCode = parseInt(email.substr(2, 4), 10);

  // Map branch codes to branch names
  const branchMap = {
      101: 'Bio Chemical Engineering',
      103: 'Chemical Engineering',
      102: 'Civil Engineering',
      104: 'Computer Science Engineering',
      105: 'Electrical Engineering',
      106: 'Electronics Engineering',
      107: 'Food Technology',
      108: 'Information Technology',
      110: 'Mechanical Engineering',
      113: 'Plastic Technology',
  };

  // Determine the guessed branch
  let guessedBranch = branchMap[branchCode];
  if (!guessedBranch) {
      guessedBranch = "Can't Decide"; // If the branch code is not recognized
  }

  return { guessedYear: yearString, guessedBranch };
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const currentDate = new Date();
  const secondsAgo = Math.floor((currentDate - date) / 1000);
  const minutesAgo = Math.floor(secondsAgo / 60);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);
  const weeksAgo = Math.floor(daysAgo / 7);
  const monthsAgo = Math.floor(daysAgo / 30);
  const yearsAgo = Math.floor(daysAgo / 365);

  if (secondsAgo < 60) {
      return 'Just now';
  } else if (minutesAgo === 1) {
      return 'A minute ago';
  } else if (minutesAgo < 60) {
      return `${minutesAgo} minutes ago`;
  } else if (hoursAgo === 1) {
      return 'An hour ago';
  } else if (hoursAgo < 24) {
      return `${hoursAgo} hours ago`;
  } else if (daysAgo === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  } else if (daysAgo < 7) {
      return `${daysAgo} days ago`;
  } else if (weeksAgo === 1) {
      return 'A week ago';
  } else if (weeksAgo < 4) {
      return `${weeksAgo} weeks ago`;
  } else if (monthsAgo === 1) {
      return 'A month ago';
  } else if (monthsAgo < 12) {
      return `${monthsAgo} months ago`;
  } else if (yearsAgo === 1) {
      return 'A year ago';
  } else {
      return `${yearsAgo} years ago`;
  }
};



const CommentsDrawer = ({
  isOpen,
  onClose,
  comments,
}) => {
  const bottomRef = useRef(null);
  const inputRef = useRef(null); // Reference to the input element
  const isSmallScreen = useMediaQuery('(max-width:800px)');
  const drawerContainerRef = useRef(null);
  // const reversedComments = useMemo(() => [...comments].reverse(), [comments]);
console.log(comments)
  useEffect(() => {
    // Scroll to the bottom when the comments change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    // Focus the input when the drawer is open
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [comments, isOpen]);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpen}
      onClose={onClose}
      onOpen={() => { }}
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      <div className={styles.drawerMainContainer}>
        <div className={styles.drawerHeader}>

          <div className={styles.reply2}>
            <div className={styles.puller}></div>
            <div>

              <h2>Comments</h2>
  
            </div>
          </div>
        </div>
        <div 
          className={`${styles.drawerContainer} ${isSmallScreen ? styles.smallScreen : ''}`}
        >
          <div ref={drawerContainerRef}></div>
          <div className={styles.comments} style={{ flex: '1', overflowY: 'auto', marginBottom: '1rem' }}>
            <div className={styles.comments}>
              <div ref={bottomRef}></div>
              {comments.map((comment, index) => (
                <div key={comment._id} className={styles.comment}>
                  <div className={comment.gender === 'male' ? styles.maleAvatar : styles.femaleAvatar}>
                    {comment.gender === 'male' ? 'Some Boy:' : 'Some Girl:'}
                  </div>
                  <div className={styles.commentContent} style={{display:'flex', justifyContent:'space-between',}}>
                    <div>

                    {comment.commentContent} 
                    </div>
                    <div style={{opacity:'0.8', fontWeight:'100', fontFamily:'Roboto', fontStyle:'italic'}}>(from {comment.userEmail}, {guessYearAndBranch(comment.userEmail).guessedYear} {guessYearAndBranch(comment.userEmail).guessedBranch}, {formatTimestamp(comment.timestamps)} )</div>
                  </div>
                </div>
              ))}
              {comments.length < 1 && <>No comments Yet</>}
            </div>
          </div>
        </div>
      </div>
    </SwipeableDrawer>
  );
};

export default CommentsDrawer;
