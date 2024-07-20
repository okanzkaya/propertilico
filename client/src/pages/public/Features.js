// src/pages/Features.js
import React from 'react';
import styled from 'styled-components';
import { FaChartLine, FaShieldAlt, FaTools, FaUsers, FaRegLightbulb, FaHeadset, FaCloud, FaCogs, FaMobileAlt, FaSyncAlt, FaMapMarkedAlt, FaFileInvoiceDollar, FaBell, FaChartPie, FaServer } from 'react-icons/fa';

const FeaturesContainer = styled.div`
  padding: 60px 20px;
  background-color: #f8f8f8;
  color: #333;
  text-align: center;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.h1`
  font-size: 2.5em;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 2em;
  }
`;

const Description = styled.p`
  font-size: 1.2em;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    font-size: 1em;
    margin-bottom: 20px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background-color: white;
  padding: 30px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: scale(1.05);
  }

  .icon {
    font-size: 3.125em; /* Increased size */
    margin-bottom: 15px;
    color: #007BFF; /* Primary color for icons */
  }

  h3 {
    margin: 15px 0;
    font-size: 1.5em;
  }

  p {
    font-size: 1em;
    color: #666;
  }
`;

function Features() {
  return (
    <FeaturesContainer>
      <Header>Features</Header>
      <Description>Explore the amazing features of Propertilico that make property management easier than ever.</Description>
      <FeaturesGrid>
        <FeatureCard>
          <FaChartLine className="icon" />
          <h3>Advanced Analytics</h3>
          <p>Get insights into your property performance with our advanced analytics and reporting tools.</p>
        </FeatureCard>
        <FeatureCard>
          <FaShieldAlt className="icon" />
          <h3>Secure & Reliable</h3>
          <p>Experience peace of mind with our secure and reliable platform that ensures your data is protected.</p>
        </FeatureCard>
        <FeatureCard>
          <FaTools className="icon" />
          <h3>Management Tools</h3>
          <p>Manage your properties effortlessly with our comprehensive management tools.</p>
        </FeatureCard>
        <FeatureCard>
          <FaUsers className="icon" />
          <h3>User-Friendly Interface</h3>
          <p>Enjoy a user-friendly interface that simplifies property management tasks.</p>
        </FeatureCard>
        <FeatureCard>
          <FaRegLightbulb className="icon" />
          <h3>Seamless Integration</h3>
          <p>Seamlessly integrate with other tools for a smooth workflow.</p>
        </FeatureCard>
        <FeatureCard>
          <FaHeadset className="icon" />
          <h3>24/7 Support</h3>
          <p>24/7 customer support to assist you whenever you need help.</p>
        </FeatureCard>
        <FeatureCard>
          <FaCloud className="icon" />
          <h3>Cloud Storage</h3>
          <p>Store all your important documents securely in the cloud.</p>
        </FeatureCard>
        <FeatureCard>
          <FaCogs className="icon" />
          <h3>Customizable</h3>
          <p>Customize your dashboard and features to suit your specific needs.</p>
        </FeatureCard>
        <FeatureCard>
          <FaMobileAlt className="icon" />
          <h3>Mobile Friendly</h3>
          <p>Access and manage your properties on the go with our mobile-friendly platform.</p>
        </FeatureCard>
        <FeatureCard>
          <FaSyncAlt className="icon" />
          <h3>Automated Workflows</h3>
          <p>Automate repetitive tasks to save time and increase efficiency.</p>
        </FeatureCard>
        <FeatureCard>
          <FaMapMarkedAlt className="icon" />
          <h3>Location-Based Services</h3>
          <p>Utilize location-based services for better property management.</p>
        </FeatureCard>
        <FeatureCard>
          <FaFileInvoiceDollar className="icon" />
          <h3>Billing & Invoicing</h3>
          <p>Handle all your billing and invoicing needs seamlessly.</p>
        </FeatureCard>
        <FeatureCard>
          <FaBell className="icon" />
          <h3>Notifications</h3>
          <p>Stay informed with real-time notifications for all important events.</p>
        </FeatureCard>
        <FeatureCard>
          <FaChartPie className="icon" />
          <h3>Comprehensive Reports</h3>
          <p>Generate comprehensive reports to understand your property's performance.</p>
        </FeatureCard>
        <FeatureCard>
          <FaServer className="icon" />
          <h3>Robust Infrastructure</h3>
          <p>Rely on our robust infrastructure to ensure uninterrupted service.</p>
        </FeatureCard>
      </FeaturesGrid>
    </FeaturesContainer>
  );
}

export default Features;
