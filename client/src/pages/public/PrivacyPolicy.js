// src/pages/PrivacyPolicy.js
import React from 'react';
import styled from 'styled-components';

const PrivacyPolicyContainer = styled.div`
  padding: 60px 20px;
  background-color: #f8f8f8;
  color: #333;
  text-align: left;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.h1`
  text-align: center;
  font-size: 2.5em;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 2em;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const SectionHeader = styled.h2`
  font-size: 1.8em;
  margin-bottom: 10px;
`;

const Paragraph = styled.p`
  font-size: 1.1em;
  line-height: 1.6;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    font-size: 1em;
  }
`;

const PrivacyPolicy = () => {
  return (
    <PrivacyPolicyContainer>
      <Header>Privacy Policy</Header>
      <Section>
        <SectionHeader>Introduction</SectionHeader>
        <Paragraph>
          This is where you will introduce your privacy policy. Explain the purpose of the privacy policy and provide a brief overview of the key points.
        </Paragraph>
      </Section>
      <Section>
        <SectionHeader>Information Collection</SectionHeader>
        <Paragraph>
          Describe the types of information you collect from users, including personal information and non-personal information.
        </Paragraph>
      </Section>
      <Section>
        <SectionHeader>Information Use</SectionHeader>
        <Paragraph>
          Explain how you use the collected information, such as to provide and improve your services, communicate with users, and comply with legal obligations.
        </Paragraph>
      </Section>
      <Section>
        <SectionHeader>Information Sharing</SectionHeader>
        <Paragraph>
          Detail the circumstances under which you share user information with third parties, including service providers, business partners, and legal requirements.
        </Paragraph>
      </Section>
      <Section>
        <SectionHeader>Data Security</SectionHeader>
        <Paragraph>
          Describe the measures you take to protect user information from unauthorized access, disclosure, or destruction.
        </Paragraph>
      </Section>
      <Section>
        <SectionHeader>Changes to This Policy</SectionHeader>
        <Paragraph>
          Inform users about how you will notify them of any changes to your privacy policy.
        </Paragraph>
      </Section>
    </PrivacyPolicyContainer>
  );
}

export default PrivacyPolicy;
