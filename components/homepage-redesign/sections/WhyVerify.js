import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import styles from './styles/WhyVerify.module.css';

const WhyVerify = () => {
  const router = useRouter();

  // ACTUAL benefits from codebase - verified users get:
  // 1. Access to inbox (pages/inbox/index.js checks isVerified)
  // 2. Post confessions (pages/create-confession requires session)
  // 3. Show college badge in chats (shows your college to partners)
  // 4. Partner sees verified badge in text/audio chat
  const benefits = [
    { icon: 'inbox', text: 'Access your inbox & private replies' },
    { icon: 'post', text: 'Post anonymous confessions' },
    { icon: 'college', text: 'Get rid of unverified badge on your profile' },
    { icon: 'badge', text: 'Partners see you\'re verified & trusted' },
  ];

  const stats = [
    { number: '500+', label: 'Verified Students' },
    { number: '10+', label: 'Colleges' },
    { number: '30+', label: 'Confessions' },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Left Side - Benefits */}
          <motion.div 
            className={styles.leftContent}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.badge}>Trust & Safety</span>
            <h2 className={styles.title}>
              Verified badge = better connections
            </h2>
            <p className={styles.description}>
              College verification unlocks the full Spyll experience. 
              More features, more trust, more meaningful connections.
            </p>

            <ul className={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <motion.li 
                  key={index}
                  className={styles.benefitItem}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className={styles.benefitIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{benefit.text}</span>
                </motion.li>
              ))}
            </ul>

            <motion.button 
              className={styles.verifyButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/auth/signup')}
            >
              <span className={styles.buttonIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              Verify Now — 10 seconds
            </motion.button>
          </motion.div>

          {/* Right Side - Stats & Visual */}
          <motion.div 
            className={styles.rightContent}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.statsCard}>
              <div className={styles.statsHeader}>
                <div className={styles.liveIndicator}>
                  <span className={styles.liveDot} />
                  <span>Live now</span>
                </div>
              </div>
              
              <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    className={styles.statItem}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <span className={styles.statNumber}>{stat.number}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* College Logos */}
              <div className={styles.collegeLogos}>
                <div className={styles.logoRow}>
                  {['IIT', 'NIT', 'BITS', 'VIT', 'IIIT', 'DTU'].map((college, index) => (
                    <div key={index} className={styles.collegeLogo}>
                      <span>{college}</span>
                    </div>
                  ))}
                </div>
                <p className={styles.logoText}>& more colleges joining</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyVerify;
