// Create a new file: src/components/FontSizeWrapper.js

import React from 'react';
import { Box } from '@mui/material';

const FontSizeWrapper = ({ fontSize, children }) => {
  const getFontSizeMultiplier = () => {
    switch (fontSize) {
      case 'small':
        return 0.875;
      case 'large':
        return 1.125;
      default:
        return 1;
    }
  };

  return (
    <Box sx={{ fontSize: getFontSizeMultiplier() }}>
      {children}
    </Box>
  );
};

export default FontSizeWrapper;