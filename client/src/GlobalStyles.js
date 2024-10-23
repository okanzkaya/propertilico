// src/GlobalStyles.js

import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --global-border-radius: 8px;
  }

  body {
    background: ${({ theme }) => theme.palette.background.default};
    color: ${({ theme }) => theme.palette.text.primary};
    font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 0;
    transition: background 3s ease, color 3s ease; /* Even slower transition */
  }

  .content {
    padding: 20px;
    transition: all 3s ease; /* Even slower transition */
  }

  .box {
    border-radius: var(--global-border-radius);
    transition: background-color 3s ease, color 3s ease; /* Even slower transition */
  }
`;

export default GlobalStyle;
