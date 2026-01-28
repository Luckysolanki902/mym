// components/confessionComps/SignInPromptCard.js
import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import styles from './SignInPromptCard.module.css';
import LoginIcon from '@mui/icons-material/Login';

const SignInPromptCard = () => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.card}>
        {/* Icon */}
        <motion.div
          className={styles.iconWrapper}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <LoginIcon className={styles.icon} />
        </motion.div>

        {/* Title */}
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Want to see more?
        </motion.h2>

        {/* Description */}
        <motion.p
          className={styles.description}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Sign in with your college email to unlock unlimited confessions, post your own stories, and connect with your campus community.
        </motion.p>

        {/* Benefits */}
        <motion.div
          className={styles.benefits}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            'Read unlimited confessions',
            'Post anonymous stories',
            'Reply privately to confessions',
            'Access Chat & Call features'
          ].map((benefit, idx) => (
            <div key={idx} className={styles.benefit}>
              <span className={styles.checkmark}>✓</span>
              <span>{benefit}</span>
            </div>
          ))}
        </motion.div>

        {/* Button */}
        <motion.button
          className={styles.signInButton}
          onClick={handleSignIn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <LoginIcon className={styles.buttonIcon} />
          Sign In with College Email
        </motion.button>

        {/* Footer text */}
        <motion.p
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Takes less than 10 seconds
        </motion.p>
      </div>
    </motion.div>
  );
};

export default SignInPromptCard;
