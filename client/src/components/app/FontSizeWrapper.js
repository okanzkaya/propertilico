import React from 'react';

const FontSizeWrapper = ({ fontSize, children }) => {
  const getFontSizeMultiplier = () => {
    switch (fontSize) {
      case 'small':
        return '0.875rem';
      case 'large':
        return '1.125rem';
      default:
        return '1rem';
    }
  };

  return (
    <div style={{ 
      fontSize: getFontSizeMultiplier(),
      transition: 'font-size 0.3s ease'
    }}>
      {children}
    </div>
  );
};

export default FontSizeWrapper;