// src/pages/Home.js
import React from 'react';
import styled from 'styled-components';
import { FaHome, FaChartBar, FaShieldAlt } from 'react-icons/fa'; // Import icons from react-icons
import exampleImage from '../assets/homepage.jpg'; // Ensure you have an example image in the same folder

const HomeContainer = styled.div`
  text-align: center;
  padding: 50px;
  margin-bottom: 100px; /* Add margin-bottom for spacing */

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 50px; /* Adjust for smaller screens */
  }
`;

const Section = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TextContent = styled.div`
  flex: 1;
  padding: 20px;
  text-align: left;
  min-width: 300px;

  @media (max-width: 768px) {
    text-align: center;
    padding: 10px;
  }
`;

const ImageContent = styled.div`
  flex: 1;
  padding: 20px;
  text-align: center;
  min-width: 300px;
  transition: transform 0.3s;

  @media (max-width: 768px) {
    padding: 10px;
  }

  img {
    width: 90%;
    border-radius: 10px;
    transition: transform 0.3s;

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const Header = styled.h2`
  font-size: 3.5em;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 2em;
  }
`;

const SubText = styled.p`
  font-size: 1.2em;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    font-size: 1em;
  }
`;

const GetStartedButton = styled.button`
  background-color: blue;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  margin-bottom: 5px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: darkblue;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9em;
  }
`;

const TrialText = styled.p`
  font-size: 0.9em;
  color: #888;
  text-align: center;
  margin-top: 5px;

  @media (max-width: 768px) {
    font-size: 0.8em;
  }
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: 40px 0;

  @media (max-width: 768px) {
    margin: 20px 0;
  }
`;

const FeaturesSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #e0e0e0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    padding-top: 20px;
    margin-top: 20px;
  }
`;

const Feature = styled.div`
  flex: 1;
  max-width: 30%;
  padding: 20px;
  text-align: center;
  border-left: 1px solid #e0e0e0;

  &:first-child {
    border-left: none;
  }
  &:last-child {
    border-right: none;
  }

  &:hover {
    background-color: #f9f9f9;
    transform: scale(1.02);
    transition: background-color 0.3s, transform 0.3s;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    border-left: none;
    border-top: 1px solid #e0e0e0;

    &:first-child {
      border-top: none;
    }

    &:hover {
      transform: none;
    }
  }
`;

const FeatureIcon = styled.div`
  font-size: 4.5em; /* Increased size */
  margin-bottom: 10px;
  color: #007BFF;
  transition: transform 0.3s, color 0.3s;

  &:hover {
    transform: scale(1.2);
    color: darkblue;
  }

  @media (max-width: 768px) {
    font-size: 3em;
  }
`;

const FeatureHeader = styled.h3`
  font-size: 1.8em;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 1.5em;
  }
`;

const FeatureText = styled.p`
  font-size: 1em;
  color: #666;

  @media (max-width: 768px) {
    font-size: 0.9em;
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      <Section>
        <TextContent>
          <Header>Your Ultimate Property Management Solution</Header>
          <SubText>Managing properties has never been easier! Propertilico is a cutting-edge property management designed to streamline and optimize your property management tasks, making your job effortless and efficient.</SubText>
          <GetStartedButton>Start your free trial</GetStartedButton>
          <TrialText>Cancel anytime during 30 days trial.</TrialText>
        </TextContent>
        <ImageContent>
          <img src={exampleImage} alt="Property Management" />
        </ImageContent>
      </Section>

      <Divider />

      <FeaturesSection>
        <Feature>
          <FeatureIcon><FaHome /></FeatureIcon>
          <FeatureHeader>Property Management</FeatureHeader>
          <FeatureText>
            Manage all your properties effortlessly with our all-in-one solution that simplifies property tracking and tenant management. With Propertilico, you can easily keep track of property details, tenant information, lease agreements, and maintenance requests. Our user-friendly interface allows you to manage multiple properties with ease, ensuring that you have all the information you need at your fingertips.
          </FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon><FaChartBar /></FeatureIcon>
          <FeatureHeader>Advanced Analytics</FeatureHeader>
          <FeatureText>
            Get insights into your property performance with our advanced analytics and reporting tools, helping you make data-driven decisions. Our analytics dashboard provides you with real-time data on occupancy rates, rental income, expenses, and more. With Propertilico, you can easily identify trends and opportunities to maximize your property's profitability and efficiency.
          </FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon><FaShieldAlt /></FeatureIcon>
          <FeatureHeader>Secure & Reliable</FeatureHeader>
          <FeatureText>
            Experience peace of mind with our secure and reliable platform that ensures your data is protected and your operations run smoothly. Propertilico employs the latest security measures to safeguard your information, including data encryption, secure login protocols, and regular system updates. Our robust infrastructure guarantees 99.9% uptime, so you can rely on Propertilico to manage your properties without any interruptions.
          </FeatureText>
        </Feature>
      </FeaturesSection>
    </HomeContainer>
  );
}

export default Home;
