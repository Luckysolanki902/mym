import React from 'react';
import { motion } from 'framer-motion';
import { InfiniteMovingCards } from '../ui/InfiniteMovingCards';
import styles from './styles/Testimonials.module.css';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Found my study group through Spyll. We matched anonymously and now we're best friends. The anonymous start made it so much easier to be myself.",
      name: "Anonymous",
      title: "IIT Delhi"
    },
    {
      quote: "Finally, a platform where I can express myself without judgment. The confessions here are so relatable. College life makes so much more sense now.",
      name: "Anonymous", 
      title: "BITS Pilani"
    },
    {
      quote: "Matched with someone from the same department. We talked for hours about random stuff. This is what college should feel like.",
      name: "Anonymous",
      title: "NIT Trichy"
    },
    {
      quote: "The verification system actually makes me feel safe. I know I'm talking to real students, not random people. That matters a lot.",
      name: "Anonymous",
      title: "IIT Bombay"
    },
    {
      quote: "Posted my first confession yesterday and got so many supportive comments. This community is genuinely wholesome.",
      name: "Anonymous",
      title: "VIT Vellore"
    },
  ];

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
          <span className={styles.badge}>Real Stories</span>
          <h2 className={styles.title}>What students are saying</h2>
          <p className={styles.subtitle}>
            Real experiences from verified students across India. No actors, no scripts — just genuine connections.
          </p>
        </motion.div>

        <motion.div 
          className={styles.carouselContainer}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
            pauseOnHover={true}
            className={styles.carousel}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
