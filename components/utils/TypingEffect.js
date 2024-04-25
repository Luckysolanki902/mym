import React, { useState, useEffect } from 'react';

const TypingEffect = ({ textArray, speed }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const type = () => {
      const fullText = textArray[currentIndex];

      if (isTyping) {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      } else {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      }

      if (isTyping && currentText === fullText) {
        setTimeout(() => setIsTyping(false), 500); // Wait before starting backspace
      } else if (!isTyping && currentText === '') {
        setCurrentIndex((prevIndex) => (prevIndex === textArray.length - 1 ? 0 : prevIndex + 1)); // Move to next text
        setIsTyping(true); // Start typing again
      }

      const typingSpeed = isTyping ? speed : speed / 2; // Adjust speed for typing and backspace
      setTimeout(type, typingSpeed);
    };

    setTimeout(type, speed);
  }, [currentIndex, currentText, isTyping, speed, textArray]);

  return <span>{currentText}</span>;
};

export default TypingEffect;
