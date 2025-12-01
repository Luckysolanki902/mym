import React from 'react';
import styles from './styles/CollegeStrip.module.css';

const colleges = [
  'HBTU Kanpur',
  'IIT Kanpur',
  'IIT Delhi',
  'RGIPT Amethi',
  'NIT Kurukshetra',
  'NIT Jalandhar',
  'BBDU Lucknow',
  'Amity University',
  'IIT Bombay',
  'NIT Trichy',
  'DTU Delhi',
  'BITS Pilani',
];

const CollegeStrip = () => {
  // Triple for seamless infinite scroll
  const tripleColleges = [...colleges, ...colleges, ...colleges];

  return (
    <section className={styles.section}>
      <div className={styles.stripWrapper}>
        {/* Heavy fog/fade on edges */}
        <div className={styles.fogLeft} />
        <div className={styles.fogRight} />

        {/* Single row infinite scroll */}
        <div className={styles.track}>
          {tripleColleges.map((college, index) => (
            <React.Fragment key={index}>
              <span className={styles.collegeName}>{college}</span>
              <span className={styles.separator}>✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollegeStrip;
