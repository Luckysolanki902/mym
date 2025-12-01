import React from 'react';
import { motion } from 'framer-motion';

/**
 * Custom d/dx derivative icon for the filter trigger.
 * Styled to match the algebra equation theme.
 */
const DerivativeIcon = ({ size = 24, color = 'currentColor', isOpen = false }) => {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: isOpen ? 8 : 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ display: 'block' }}
        >
            {/* d */}
            <text
                x="3"
                y="22"
                fontFamily="'Times New Roman', serif"
                fontSize="16"
                fontStyle="italic"
                fontWeight="400"
                fill={color}
            >
                d
            </text>
            {/* fraction bar */}
            <motion.line
                x1="2"
                y1="16"
                x2="15"
                y2="16"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* dx */}
            <text
                x="2"
                y="30"
                fontFamily="'Times New Roman', serif"
                fontSize="12"
                fontStyle="italic"
                fontWeight="400"
                fill={color}
            >
                dx
            </text>
            {/* decorative funnel dots (filter hint) */}
            <motion.circle
                cx="24"
                cy="10"
                r="2.5"
                fill={color}
                animate={{ scale: isOpen ? 1.15 : 1 }}
                transition={{ duration: 0.2 }}
            />
            <motion.circle
                cx="24"
                cy="18"
                r="2"
                fill={color}
                animate={{ scale: isOpen ? 1.1 : 1 }}
                transition={{ duration: 0.2, delay: 0.05 }}
            />
            <motion.circle
                cx="24"
                cy="25"
                r="1.5"
                fill={color}
                animate={{ scale: isOpen ? 1.05 : 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
            />
        </motion.svg>
    );
};

export default DerivativeIcon;
