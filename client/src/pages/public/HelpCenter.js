// src/pages/HelpCenter.js
import React from 'react';
import styled from 'styled-components';

const HelpContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const HelpTitle = styled.h1`
  margin-bottom: 20px;
  color: #007BFF;
`;

const HelpText = styled.p`
  font-size: 1.2em;
  color: #666;
  margin-bottom: 30px;
`;

const ContactMethod = styled.div`
  margin-bottom: 20px;
`;

const ContactLink = styled.a`
  color: #007BFF;
  text-decoration: none;
  font-size: 1.1em;
  transition: color 0.3s;

  &:hover {
    color: #0056b3;
  }
`;

const HelpCenter = () => {
  return (
    <HelpContainer>
      <HelpTitle>Help Center</HelpTitle>
      <HelpText>
        If you need assistance, please feel free to reach out to us through any of the following methods:
      </HelpText>
      <ContactMethod>
        <ContactLink href="https://discord.gg/pseudodiscordlink" target="_blank" rel="noopener noreferrer">
          Join our Discord
        </ContactLink>
      </ContactMethod>
      <ContactMethod>
        <ContactLink href="mailto:support@propertilico.com">
          Email us at support@propertilico.com
        </ContactLink>
      </ContactMethod>
    </HelpContainer>
  );
};

export default HelpCenter;
