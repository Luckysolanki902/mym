import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './styles/HowItWorks.module.css';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Verify fast',
      description: 'Confirm your college email and unlock all features. Takes just 10 seconds.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Choose who to meet',
      description: 'My College, Any College, or Random. Filter by your preference and start connecting.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Chat or read',
      description: 'Match instantly and start chatting. Or browse confessions. Chats are never stored.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.badge}>Simple & Quick</span>
          <h2 className={styles.title}>How it works</h2>
          <p className={styles.subtitle}>
            Get connected in under 30 seconds. No complicated setup, no barriers.
          </p>
        </motion.div>

        <motion.div 
          className={styles.stepsGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={step.number}
              className={styles.stepCard}
              variants={cardVariants}
              whileHover={{ y: -8 }}
            >
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={styles.connector}>
                  <svg viewBox="0 0 100 24" fill="none" preserveAspectRatio="none">
                    <path d="M0 12 H100" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="6 4" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF6BA0" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className={styles.cta}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/random-chat" className={styles.ctaLink}>
            See full onboarding
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
