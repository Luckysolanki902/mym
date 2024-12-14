import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { register } from 'swiper/element/bundle';
import Image from 'next/image';
import styles from './styles/trendingconfession.module.css'
import { FaHeart, FaComment } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useMediaQuery } from '@mui/material';

const truncateText = (text, maxLength) => {
    // Remove double newlines
    text = text.replace(/\n\n+/g, '\n');

    // Replace two or more simultaneous whitespaces with a single space
    text = text.replace(/\s{2,}/g, ' ');

    // Trim the text
    text = text.trim();

    if (text.length <= maxLength) {
        return text;
    }

    const truncatedText = text.substring(0, maxLength).trim();
    return `${truncatedText.substr(0, Math.min(truncatedText.length, truncatedText.lastIndexOf(' ')))}...`;
};

const templateConfession = {
    confessionContent: "loading",
    comments: [],
    likes: [],
    // gender: "",
};

// Function to alternate gender between "male" and "female"
const alternateGender = (index) => (index % 2 === 0 ? "male" : "female");

// Create an array of 5 elements, filling with the template object and alternating gender
const loadingConfessions = Array.from({ length: 5 }, (_, index) => ({
    ...templateConfession,
    gender: alternateGender(index)
}));

register();
const TrendingConfessions = ({ trendingConfessions, totalConfessions }) => {

    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const islessthan600px = useMediaQuery('(max-width:600px)');
    useEffect(() => {
        if (trendingConfessions.length > 0)
            setLoading(false)
    }, [trendingConfessions])

    return (
        <Swiper className={styles.main} loop={true} speed={500} simulateTouch={true} autoplay={{ delay: 3000, pauseOnMouseEnter: true, disableOnInteraction: false }}
        >
            {!loading && trendingConfessions.map((confession, index) => (
                <React.Fragment key={index}>
                    <SwiperSlide className={styles.mainCard} key={`confession-${index}`}>
                        <div className={styles.blurCard} onClick={() => router.push(`/confession/${confession._id}`)} style={{ zIndex: "-1" }}>
                            <div className={styles.card}>
                                <div className={styles.heading}>
                                    <div>
                                        <h3>Trending Confession <span className={styles.Trendingnumber}>#{index + 1}</span></h3>
                                        <p style={{ whiteSpace: 'pre-line' }}>
                                            {truncateText(confession.confessionContent, islessthan600px ? 100 : 200)} <span>Read more</span>
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.footer}>
                                    <div className={styles.footerDiv}>
                                        <FaHeart />
                                        <div className={styles.length}>
                                            {confession.likes.length}
                                        </div>
                                    </div>
                                    <div className={styles.footerDiv}>
                                        <FaComment style={{ color: '#545454' }} />
                                        <div className={styles.length}>
                                            {confession.comments.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                    {(index + 1) % 3 === 0 && (
                        <SwiperSlide key={`explore-${index}`} className={styles.mainCard}>
                            <div className={styles.blurCard} onClick={() => router.push(`/all-confessions`)} style={{ zIndex: "-1" }}>
                                <div className={styles.card}>
                                    <div>

                                        <div className={styles.heading}>
                                            <h3>See All Confessions</h3>
                                        </div>
                                        <p style={{ whiteSpace: 'pre-line' }}>
                                            <span style={{ fontWeight: 400, color: 'black' }}>Tap here </span> to uncover {totalConfessions < 50 ? 50 : Math.round(totalConfessions / 10) * 10}+ confessions that might just surprise you.
                                            <br />
                                            Peek into the stories that stayed behind closed doors
                                        </p>

                                    </div>
                                    <div className={styles.footer}>
                                        <div className={styles.footerDiv}>
                                            <FaHeart />
                                            <div className={styles.length}>
                                                199+
                                            </div>
                                        </div>
                                        <div className={styles.footerDiv}>
                                            <FaComment style={{ color: '#545454' }} />
                                            <div className={styles.length}>
                                                99+
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    )}
                </React.Fragment>
            ))}
            {loading && loadingConfessions.map((confession, index) => (
                <SwiperSlide key={`loading-${index}`} className={styles.mainCard}>
                    <div className={styles.blurCard} onClick={() => router.push(`/confession/${confession._id}`)} style={{ zIndex: "-1" }}>
                        <div className={styles.card}>
                            <div>
                                <div className={styles.heading}>
                                    <h3>Trending Confession #{index + 1}</h3>
                                </div>
                                <p>
                                    {truncateText(confession.confessionContent, 200)}
                                </p>
                            </div>
                            <div className={styles.footer}>
                                <div className={styles.footerDiv}>
                                    <FaHeart />
                                    <div className={styles.length}>
                                        {confession.likes.length}
                                    </div>
                                </div>
                                <div className={styles.footerDiv}>
                                    <FaComment style={{ color: '#545454' }} />
                                    <div className={styles.length}>
                                        {confession.comments.length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}

export default TrendingConfessions;
