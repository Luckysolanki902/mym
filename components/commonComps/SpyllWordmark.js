import React from 'react';

const baseStyle = {
  fontFamily: "'Liquids', sans-serif",
  fontWeight: 400,
  userSelect: 'none',
  display: 'inline-block',
  letterSpacing: '0.05rem', 
};

const SpyllWordmark = ({ as: Tag = 'div', className = '', style = {}, children = 'spyll', ...rest }) => {
  return (
    <Tag className={className} style={{ ...baseStyle, ...style }} {...rest}>
      {children}
    </Tag>
  );
};

export default SpyllWordmark;
