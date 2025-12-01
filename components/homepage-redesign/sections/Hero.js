import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import styles from './styles/Hero.module.css';
import PhoneMockup from '@/components/commonComps/PhoneMockup';

const Hero = () => {
  const router = useRouter();
  const [mockupMode, setMockupMode] = useState('chat');

  const handleMockupModeChange = useCallback((newMode) => {
    setMockupMode(newMode);
  }, []);

  return (
    <section className={styles.heroSection}>
      {/* Background Gradient Orbs */}
      <div className={styles.gradientOrb1} />
      <div className={styles.gradientOrb2} />

      <div className={styles.heroContent}>
        {/* Left Column - Text Content */}
        <div className={styles.heroLeft}>
          {/* Live Badge */}
          <motion.div 
            className={styles.liveBadge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={styles.liveDot} />
            <span>Now live in 10+ colleges</span>
          </motion.div>

          {/* Main Headline with FlipWords */}
          <motion.h1 
            className={styles.headline}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            India&apos;s{" "}
            <span className={styles.flipWordContainer}>
              <span className={styles.spotlightWord}>
                <span className={styles.spotlightText}>anonymous</span>
              </span>
            </span>
            <br />
            college network.
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className={styles.subheadline}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Connect with verified students across India. Chat anonymously, voice call, or browse confessions — no names, no pressure.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className={styles.ctaContainer}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button 
              className={styles.primaryCta}
              onClick={() => router.push('/random-chat')}
            >
              <span className={styles.ctaIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className={styles.ctaContent}>
                <span className={styles.ctaText}>Start Chatting</span>
                <span className={styles.ctaSubtext}>No signup required</span>
              </span>
            </button>
            <button 
              className={styles.secondaryCta}
              onClick={() => router.push('/random-call')}
            >
              <span className={styles.ctaIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
              </span>
              <span className={styles.ctaContent}>
                <span className={styles.ctaText}>Voice Call</span>
                <span className={styles.ctaSubtext}>Talk anonymously</span>
              </span>
            </button>
          </motion.div>

          {/* Microtrust Row */}
          <motion.div 
            className={styles.microtrustRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className={styles.trustItem}>
              <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>College-verified</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Chats not saved</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>End-to-end encrypted</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Device Mockup */}
        <motion.div 
          className={styles.heroRight}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <PhoneMockup
            mode={mockupMode}
            variant="hero"
            showToggle={true}
            autoRotate={true}
            rotateInterval={5000}
            tilt="right"
            onModeChange={handleMockupModeChange}
          />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div 
          className={styles.scrollMouse}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className={styles.scrollWheel} />
        </motion.div>
        <span>Scroll to explore</span>
      </motion.div>
    </section>
  );
};

export default Hero;
