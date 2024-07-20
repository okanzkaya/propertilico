// src/pages/ToS.js
import React from 'react';
import styled from 'styled-components';

const ToSContainer = styled.div`
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

const ToS = () => {
  return (
    <ToSContainer>
      <Header>Terms of Service</Header>
      <Section>
        <SectionHeader>1. Introduction</SectionHeader>
        <Paragraph>
          Welcome to Propertilico! These Terms of Service govern your use of our website located at www.propertilico.com (the "Website") operated by Propertilico Inc.
        </Paragraph>
        <Paragraph>
          Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard, and disclose information that results from your use of our web pages.
        </Paragraph>
        <Paragraph>
          Your agreement with us includes these Terms and our Privacy Policy ("Agreements"). You acknowledge that you have read and understood Agreements, and agree to be bound by them.
        </Paragraph>
      </Section>
      <Section>
        <SectionHeader>2. Communications</SectionHeader>
        <Paragraph>
          By using our Service, you agree to subscribe to newsletters, marketing or promotional materials, and other information we may send. However, you may opt-out of receiving any, or all, of these communications from us by following the unsubscribe link or by emailing at support@propertilico.com.
        </Paragraph>
      </Section>
      <Section>
        <SectionHeader>3. Purchases</SectionHeader>
        <Paragraph>
          If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
        </Paragraph>
        <Paragraph>
          You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct, and complete.
        </Paragraph>
      </Section>
      <Section>
        <SectionHeader>4. Contests, Sweepstakes and Promotions</SectionHeader>
        <Paragraph>
          Any contests, sweepstakes, or other promotions (collectively, "Promotions") made available through the Service may be governed by rules that are separate from these Terms of Service. If you participate in any Promotions, please review the applicable rules as well as our Privacy Policy. If the rules for a Promotion conflict with these Terms of Service, Promotion rules will apply.
        </Paragraph>
      </Section>
      <Section>
        <SectionHeader>5. Changes to This Agreement</SectionHeader>
        <Paragraph>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </Paragraph>
        <Paragraph>
          By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
        </Paragraph>
      </Section>
    </ToSContainer>
  );
}

export default ToS;
