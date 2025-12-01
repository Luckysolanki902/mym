"use client";

import { cn } from "../utils/cn";
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import styles from './styles/InfiniteMovingCards.module.css';

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}) => {
  const scrollerRef = useRef(null);
  const hasAnimated = useRef(false);

  const animationDuration = useMemo(() => {
    if (speed === "fast") return "20s";
    if (speed === "normal") return "40s";
    return "80s";
  }, [speed]);

  useEffect(() => {
    if (scrollerRef.current && !hasAnimated.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      
      // Duplicate items for infinite scroll
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        scrollerRef.current?.appendChild(duplicatedItem);
      });
      
      hasAnimated.current = true;
    }
  }, []);

  return (
    <div className={cn(styles.scrollerContainer, className)}>
      <ul
        ref={scrollerRef}
        className={cn(
          styles.scroller,
          styles.animateScroll,
          pauseOnHover && styles.pauseOnHover
        )}
        style={{
          '--animation-duration': animationDuration,
          '--animation-direction': direction === 'left' ? 'forwards' : 'reverse',
        }}
      >
        {items.map((item, idx) => (
          <li className={styles.card} key={item.name + idx}>
            <blockquote className={styles.blockquote}>
              <p className={styles.quote}>
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className={styles.author}>
                <span className={styles.authorName}>{item.name}</span>
                <span className={styles.authorTitle}>{item.title}</span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfiniteMovingCards;
