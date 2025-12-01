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
                x="16"
                y="13"
                textAnchor="middle"
                fontFamily="'Times New Roman', serif"
                fontSize="14"
                fontStyle="italic"
                fontWeight="400"
                fill={color}
            >
                d
            </text>
            {/* fraction bar */}
            <motion.line
                x1="6"
                y1="16"
                x2="26"
                y2="16"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* dx */}
            <text
                x="16"
                y="27"
                textAnchor="middle"
                fontFamily="'Times New Roman', serif"
                fontSize="14"
                fontStyle="italic"
                fontWeight="400"
                fill={color}
            >
                dx
            </text>
        </motion.svg>
    );
};

export default DerivativeIcon;
