import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { FaHeart, FaComment } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import styles from './styles/TrendingConfessions.module.css';
import { getTimeAgo } from '@/utils/generalUtilities';

const truncateText = (text, maxLength) => {
  if (!text) return '';
  text = text.replace(/\n\n+/g, '\n').replace(/\s{2,}/g, ' ').trim();
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength).trim();
  return `${truncated.substr(0, Math.min(truncated.length, truncated.lastIndexOf(' ')))}...`;
};

const TrendingConfessionsSection = ({ confessions = [], totalConfessions = 50 }) => {
  const router = useRouter();

  // Use real confessions if available, otherwise show placeholder
  const displayConfessions = confessions.length > 0 ? confessions : [];

  if (displayConfessions.length === 0) {
    return null; // Don't render section if no confessions
  }

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
          <div className={styles.headerTop}>
            <h2 className={styles.title}>Trending Confessions</h2>
            <div className={styles.filterChips}>
              <button className={`${styles.chip} ${styles.activeChip}`}>Trending</button>
              <button className={styles.chip}>New</button>
              <button className={styles.chip}>My College</button>
            </div>
          </div>
          <p className={styles.subtitle}>Real confessions from real students. Anonymously shared, genuinely felt.</p>
        </motion.div>

        <motion.div 
          className={styles.carouselWrapper}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Swiper
            modules={[Autoplay, FreeMode]}
            spaceBetween={24}
            slidesPerView="auto"
            freeMode={true}
            loop={true}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            className={styles.swiper}
          >
            {displayConfessions.map((confession, index) => (
              <SwiperSlide key={confession._id} className={styles.slide}>
                <motion.div 
                  className={`${styles.card} ${confession.gender === 'female' ? styles.femaleCard : confession.gender === 'male' ? styles.maleCard : ''}`}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => router.push(`/confession/${confession._id}`)}
                >
                  <div className={styles.cardGlow} />
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={`${styles.collegeBadge} ${confession.gender === 'female' ? styles.femaleBadge : confession.gender === 'male' ? styles.maleBadge : ''}`}>
                        <svg className={styles.collegeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                        {confession.college || 'Anonymous College'}
                      </span>
                      <span className={styles.timeAgo}>{getTimeAgo(confession.createdAt)}</span>
                    </div>
                    <p className={styles.confessionText}>
                      {truncateText(confession.confessionContent, 150)}
                      <span className={styles.readMore}> Read more</span>
                    </p>
                    <div className={styles.cardFooter}>
                      <div className={styles.stat}>
                        <FaHeart className={styles.heartIcon} />
                        <span>{confession.likes?.length || 0}</span>
                      </div>
                      <div className={styles.stat}>
                        <FaComment className={styles.commentIcon} />
                        <span>{confession.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        <motion.div 
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button 
            className={styles.primaryAction}
            onClick={() => router.push('/all-confessions')}
          >
            <span className={styles.ctaIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </span>
            <span className={styles.ctaContent}>
              <span className={styles.actionText}>Read Confessions</span>
              <span className={styles.actionSubtext}>No login required</span>
            </span>
          </button>
          <button 
            className={styles.secondaryAction}
            onClick={() => router.push('/create-confession')}
          >
            <span className={styles.ctaIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            <span className={styles.ctaContent}>
              <span className={styles.actionText}>Post Confession</span>
              <span className={styles.actionSubtext}>Stay anonymous</span>
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingConfessionsSection;
