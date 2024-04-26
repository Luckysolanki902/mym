import React from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { register } from 'swiper/element/bundle';
import Image from 'next/image';
import styles from './styles/trendingconfession.module.css'
import { FaHeart, FaComment } from 'react-icons/fa';
import { useRouter } from 'next/router';

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }
    const truncatedText = text.substring(0, maxLength).trim();
    return `${truncatedText.substr(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')))}...`;
};
register();
const TrendingConfessions = ({ trendingConfessions }) => {
    const router = useRouter()
    return (
        <Swiper className={styles.main} loop={true} speed={500} simulateTouch={true} autoplay={{ delay: 3000, pauseOnMouseEnter: true, disableOnInteraction: false }}
        >
            {trendingConfessions.map((confession, index )=> (
                <SwiperSlide key={confession._id} className={styles.mainCard}>
                    <div className={styles.blurCard} onClick={()=> router.push(`/confession/${confession._id}`)} style={{ zIndex: "-1" }}>
                        <div className={styles.card}>
                            <div className={styles.heading}>
                                <h3 >Trending Confession #{index+1}</h3>
                            </div>
                            <p>"
                                {truncateText(confession.confessionContent, 200)}
                                "</p>
                            <div className={styles.footer}>
                                <div className={styles.footerDiv}>
                                    <FaHeart />
                                    <div className={styles.length}>
                                        {confession.likes.length}
                                    </div>
                                </div>
                                <div className={styles.footerDiv}>
                                    <FaComment style={{color:'#545454'}}/>
                                    <div className={styles.length}>
                                        {confession.comments.length}
                                    </div>
                                </div>
                            </div>
                            {/* <p>Date: {new Date(confession.timestamps).toLocaleDateString()}</p> */}
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}

export default TrendingConfessions;
