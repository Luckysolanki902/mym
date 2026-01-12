import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles/ModeSwitcher.module.css';

const ModeSwitcher = () => {
  const [collegeFilter, setCollegeFilter] = useState('any');
  const [genderFilter, setGenderFilter] = useState('female');

  return (
    <section className={styles.modeSection}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.title}>Choose your vibe</h2>
          <p className={styles.subtitle}>
            Filter by college and choose who you want to chat or call with. Your choice, your connections.
          </p>
        </motion.div>

        <motion.div 
          className={styles.filtersContainer}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* College Filter */}
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>College Preference</div>
            <div className={styles.chipsContainer}>
              <button
                className={`${styles.chip} ${collegeFilter === 'any' ? styles.chipActive : ''}`}
                onClick={() => setCollegeFilter('any')}
              >
                Any College
              </button>
              <button
                className={`${styles.chip} ${collegeFilter === 'same' ? styles.chipActive : ''}`}
                onClick={() => setCollegeFilter('same')}
              >
                Same College
              </button>
            </div>
          </div>

          {/* Gender Filter */}
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Meet With</div>
            <div className={styles.chipsContainer}>
              <button
                className={`${styles.chip} ${genderFilter === 'male' ? styles.chipMale : ''}`}
                onClick={() => setGenderFilter('male')}
              >
                Boys
              </button>
              <button
                className={`${styles.chip} ${genderFilter === 'female' ? styles.chipFemale : ''}`}
                onClick={() => setGenderFilter('female')}
              >
                Girls
              </button>
              <button
                className={`${styles.chip} ${genderFilter === 'any' ? styles.chipActive : ''}`}
                onClick={() => setGenderFilter('any')}
              >
                Anyone
              </button>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className={styles.featureCards}>
          <motion.div 
            className={styles.featureCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <h3>Same Campus</h3>
            <p>Connect with students from your own college. Faster matches, familiar faces.</p>
          </motion.div>

          <motion.div 
            className={styles.featureCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3>Any College</h3>
            <p>Expand your network. Meet students from IITs, NITs, and 10+ colleges across India.</p>
          </motion.div>

          <motion.div 
            className={styles.featureCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3>Gender Filter</h3>
            <p>Choose who you want to meet - boys, girls, or anyone. Your preferences, your choice.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ModeSwitcher;
