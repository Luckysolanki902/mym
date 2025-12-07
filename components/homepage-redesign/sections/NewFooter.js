import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './styles/NewFooter.module.css';
import SpyllWordmark from '@/components/commonComps/SpyllWordmark';

const NewFooter = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/_spyll_',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
  ];

  const footerLinks = [
    { name: 'About Us', href: '/about-us' },
    { name: 'Safety Center', href: '/how-we-protect-anonymity' },
    { name: 'Privacy Policy', href: '/about-us' },
    { name: 'Terms of Service', href: '/about-us' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section - CTA */}
        <motion.div 
          className={styles.ctaSection}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.ctaTitle}>Ready to connect?</h2>
          <p className={styles.ctaSubtitle}>
            Join 500+ students already on Spyll. Start chatting anonymously or post your first confession.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/random-chat" className={styles.primaryButton}>
              Start Chatting
            </Link>
            <Link href="/all-confessions" className={styles.secondaryButton}>
              Browse Confessions
            </Link>
          </div>
        </motion.div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          {/* Left - Logo & Tagline */}
          <div className={styles.brandSection}>
            <Link href="/" className={styles.logo}>
              <SpyllWordmark style={{color: '#FF6BA0', fontSize: '2rem'}} />
            </Link>
            <p className={styles.tagline}>
              India&apos;s anonymous college network. 
            </p>
          </div>

          {/* Center - Links */}
          <nav className={styles.linksSection}>
            {footerLinks.map((link) => (
              <Link key={link.name} href={link.href} className={styles.footerLink}>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right - Social & Contact */}
          <div className={styles.socialSection}>
            <div className={styles.socialLinks}>
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <div className={styles.contactEmails}>
              <a href="mailto:contact@spyll.in" className={styles.emailLink}>
                contact@spyll.in
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>&copy; {currentYear} Spyll. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
