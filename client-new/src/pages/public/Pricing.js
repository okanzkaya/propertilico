// src/pages/Pricing.js
import React from 'react';
import styled from 'styled-components';

const PricingContainer = styled.div`
  padding: 40px 20px;
  background-color: #f8f8f8;
  color: #333;
  text-align: center;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.h1`
  font-size: 2.5em;
  margin-bottom: 10px;
  color: #007BFF;

  @media (max-width: 768px) {
    font-size: 2em;
  }
`;

const Description = styled.p`
  font-size: 1.2em;
  margin-bottom: 20px;
  color: #666;

  @media (max-width: 768px) {
    font-size: 1em;
    margin-bottom: 10px;
  }
`;

const PlanWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const PlanCard = styled.div`
  background-color: white;
  padding: 40px 30px;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  width: 350px;
  margin: 20px;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PlanHeader = styled.h2`
  font-size: 2em;
  margin-bottom: 15px;
  color: #007BFF;
`;

const PlanPriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const OriginalPrice = styled.span`
  font-size: 1.5em;
  color: #999;
  text-decoration: line-through;
  margin-bottom: 5px;
`;

const DiscountedPrice = styled.span`
  font-size: 2.5em;
  color: #ff6347;
`;

const PlanFeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
  text-align: left;
`;

const PlanFeature = styled.li`
  font-size: 1.1em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;

  &::before {
    content: '✔';
    color: #007BFF;
    margin-right: 10px;
  }
`;

const DiscountLabel = styled.span`
  background-color: #ff6347;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.9em;
  margin-bottom: 10px;
  display: inline-block;
`;

const CTAButton = styled.a`
  background-color: #007BFF;
  color: white;
  padding: 15px 30px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 1.2em;
  margin-top: 20px;
  display: inline-block;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

function Pricing() {
  return (
    <PricingContainer>
      <Header>Pricing</Header>
      <Description>Start your 30-day free trial and enjoy all the benefits Propertilico has to offer at a discounted price of $19.5/month.</Description>
      <PlanWrapper>
        <PlanCard>
          <DiscountLabel>35% OFF</DiscountLabel>
          <PlanHeader>Monthly Plan</PlanHeader>
          <PlanPriceContainer>
            <OriginalPrice>$30/month</OriginalPrice>
            <DiscountedPrice>$19.5/month</DiscountedPrice>
          </PlanPriceContainer>
          <PlanFeatureList>
            <PlanFeature>Unlimited Property Listings</PlanFeature>
            <PlanFeature>Advanced Analytics</PlanFeature>
            <PlanFeature>24/7 Customer Support</PlanFeature>
            <PlanFeature>Secure Data Protection</PlanFeature>
            <PlanFeature>User-friendly Interface</PlanFeature>
            <PlanFeature>Seamless Integration</PlanFeature>
            <PlanFeature>Regular Updates</PlanFeature>
            <PlanFeature>Customizable Dashboards</PlanFeature>
          </PlanFeatureList>
          <CTAButton href="/get-started">Start Free Trial</CTAButton>
        </PlanCard>
      </PlanWrapper>
    </PricingContainer>
  );
}

export default Pricing;
