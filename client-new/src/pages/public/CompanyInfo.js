// src/pages/CompanyInfo.js
import React from 'react';
import styled from 'styled-components';

const CompanyContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const CompanyTitle = styled.h1`
  text-align: center;
  margin-bottom: 20px;
  color: #007BFF;
`;

const SectionTitle = styled.h2`
  margin-top: 20px;
  margin-bottom: 10px;
  color: #007BFF;
`;

const SectionText = styled.p`
  font-size: 1.2em;
  color: #666;
  margin-bottom: 20px;
`;

const TeamMember = styled.div`
  margin-bottom: 20px;
`;

const MemberName = styled.h3`
  font-size: 1.5em;
  color: #007BFF;
  margin-bottom: 5px;
`;

const MemberRole = styled.p`
  font-size: 1.2em;
  color: #666;
`;

const CompanyInfo = () => {
  return (
    <CompanyContainer>
      <CompanyTitle>About Us</CompanyTitle>

      <SectionTitle>Company Overview</SectionTitle>
      <SectionText>
        Our company, Propertilico, is dedicated to providing top-notch property management solutions. [Fill in detailed overview here.]
      </SectionText>

      <SectionTitle>Mission</SectionTitle>
      <SectionText>
        Our mission is to [Fill in mission statement here.]
      </SectionText>

      <SectionTitle>Vision</SectionTitle>
      <SectionText>
        Our vision is to [Fill in vision statement here.]
      </SectionText>

      <SectionTitle>Our Team</SectionTitle>
      <TeamMember>
        <MemberName>John Doe</MemberName>
        <MemberRole>CEO</MemberRole>
        <SectionText>[Fill in bio or description here.]</SectionText>
      </TeamMember>
      <TeamMember>
        <MemberName>Jane Smith</MemberName>
        <MemberRole>CTO</MemberRole>
        <SectionText>[Fill in bio or description here.]</SectionText>
      </TeamMember>
      {/* Add more team members as needed */}

      <SectionTitle>Contact Information</SectionTitle>
      <SectionText>
        You can reach us at:
      </SectionText>
      <SectionText>
        Email: support@propertilico.com
      </SectionText>
      <SectionText>
        Phone: (123) 456-7890
      </SectionText>
      <SectionText>
        Address: [Fill in address here.]
      </SectionText>
    </CompanyContainer>
  );
};

export default CompanyInfo;
