import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/system';

const HeaderWrapper = styled(AppBar)({
  zIndex: 1201, // Ensure the header is above the sidebar
});

const Header = () => {
  return (
    <HeaderWrapper position="fixed">
      <Toolbar>
        <Typography variant="h6" noWrap>
          Propertilico Dashboard
        </Typography>
      </Toolbar>
    </HeaderWrapper>
  );
};

export default Header;
