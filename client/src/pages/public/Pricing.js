import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { FaCheck, FaTimes, FaCrown } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PricingContainer = styled.div`
  padding: 60px 20px;
  background: linear-gradient(135deg, #f6f9fc 0%, #e9ecef 100%);
  color: #2d3748;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.h1`
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 20px;
  color: #2b6cb0;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Description = styled.p`
  font-size: clamp(1rem, 3vw, 1.3rem);
  margin-bottom: 40px;
  color: #4a5568;
  max-width: 800px;
  margin: 0 auto 40px;
  line-height: 1.7;
`;

const PlansWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
`;

const PlanCard = styled.div`
  background-color: white;
  padding: 40px 30px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${props => props.featured && css`
    border: 3px solid #4299e1;
    transform: scale(1.05);
  `}

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
  }
`;

const PlanHeader = styled.h2`
  font-size: 2rem;
  margin-bottom: 20px;
  color: #2b6cb0;
  font-weight: 700;
`;

const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const OriginalPrice = styled.span`
  font-size: 1.2rem;
  color: #a0aec0;
  text-decoration: line-through;
  margin-bottom: 5px;
`;

const DiscountedPrice = styled.span`
  font-size: 2.5rem;
  color: #38a169;
  font-weight: 800;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
  text-align: left;
`;

const Feature = styled.li`
  font-size: 1rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  color: ${props => props.included ? '#4a5568' : '#a0aec0'};
`;

const FeatureIcon = styled.span`
  margin-right: 10px;
  color: ${props => props.included ? '#38a169' : '#e53e3e'};
`;

const PopularLabel = styled.span`
  background-color: #4299e1;
  color: white;
  padding: 5px 10px;
  border-radius: 0 0 20px 0;
  font-size: 0.9rem;
  font-weight: 700;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const DiscountLabel = styled.span`
  background-color: #ed8936;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  position: absolute;
  top: 10px;
  right: 10px;
`;

const CTAButton = styled.button`
  background-color: #4299e1;
  color: white;
  padding: 15px 30px;
  border-radius: 50px;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  cursor: pointer;
  outline: none;
  box-shadow: 0 10px 20px rgba(66, 153, 225, 0.3);
  width: 100%;

  &:hover {
    background-color: #3182ce;
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(66, 153, 225, 0.4);
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

const TrialText = styled.p`
  font-size: 0.9rem;
  color: #718096;
  margin-top: 20px;
  font-weight: 600;
`;

const ComparisonToggle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
`;

const ToggleButton = styled.button`
  background-color: ${props => props.active ? '#4299e1' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: 2px solid #4299e1;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:first-child {
    border-radius: 20px 0 0 20px;
  }

  &:last-child {
    border-radius: 0 20px 20px 0;
  }

  &:hover {
    background-color: ${props => props.active ? '#3182ce' : '#ebf8ff'};
  }
`;

const Pricing = () => {
  const navigate = useNavigate();
  const [showMonthly, setShowMonthly] = useState(true);

  useEffect(() => {
    document.title = "Propertilico Pricing - Choose Your Perfect Plan";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Explore Propertilico's flexible pricing plans. Choose between Standard and Plus to find the perfect fit for your property management needs.");
  }, []);

  const handleStartFreeTrial = (plan) => {
    navigate(`/payment?plan=${plan}`);
  };

  const plans = [
    {
      name: "Standard",
      monthlyPrice: 19.5,
      yearlyPrice: 17.5,
      originalMonthlyPrice: 30,
      originalYearlyPrice: 25,
      features: [
        { name: 'Up to 50 Property Listings', included: true },
        { name: 'Basic Analytics Dashboard', included: true },
        { name: 'Email Customer Support', included: true },
        { name: 'Secure Cloud Data Storage', included: true },
        { name: 'Standard Reporting', included: true },
        { name: 'Basic Tenant Screening', included: true },
        { name: 'Manual Rent Collection', included: true },
        { name: 'Basic Maintenance Tracking', included: true },
        { name: 'AI-Powered Market Insights', included: false },
        { name: 'Multi-Property Portfolio Management', included: false },
      ],
    },
    {
      name: "Plus",
      monthlyPrice: 39.9,
      yearlyPrice: 35.9,
      originalMonthlyPrice: 60,
      originalYearlyPrice: 50,
      features: [
        { name: 'Unlimited Property Listings', included: true },
        { name: 'Advanced Analytics Dashboard', included: true },
        { name: '24/7 Priority Customer Support', included: true },
        { name: 'Enhanced Cloud Storage & Backup', included: true },
        { name: 'Customizable Reporting', included: true },
        { name: 'Advanced Tenant Screening Tools', included: true },
        { name: 'Automated Rent Collection', included: true },
        { name: 'Advanced Maintenance Request Tracking', included: true },
        { name: 'AI-Powered Market Insights', included: true },
        { name: 'Multi-Property Portfolio Management', included: true },
      ],
      featured: true,
    },
  ];

  return (
    <PricingContainer>
      <Header>Choose Your Perfect Plan</Header>
      <Description>
        Unlock the full potential of your property portfolio with our flexible plans. 
        Start your 30-day free trial today and experience the Propertilico advantage.
      </Description>
      <ComparisonToggle>
        <ToggleButton active={showMonthly} onClick={() => setShowMonthly(true)}>Monthly</ToggleButton>
        <ToggleButton active={!showMonthly} onClick={() => setShowMonthly(false)}>Yearly</ToggleButton>
      </ComparisonToggle>
      <PlansWrapper>
        {plans.map((plan, index) => (
          <PlanCard key={index} featured={plan.featured}>
            {plan.featured && <PopularLabel><FaCrown /> Most Popular</PopularLabel>}
            <DiscountLabel>35% OFF</DiscountLabel>
            <PlanHeader>{plan.name}</PlanHeader>
            <PriceContainer>
              <OriginalPrice>${showMonthly ? plan.originalMonthlyPrice : plan.originalYearlyPrice}/month</OriginalPrice>
              <DiscountedPrice>${showMonthly ? plan.monthlyPrice.toFixed(2) : plan.yearlyPrice.toFixed(2)}/month</DiscountedPrice>
            </PriceContainer>
            <FeatureList>
              {plan.features.map((feature, featureIndex) => (
                <Feature key={featureIndex} included={feature.included}>
                  <FeatureIcon included={feature.included}>
                    {feature.included ? <FaCheck /> : <FaTimes />}
                  </FeatureIcon>
                  {feature.name}
                </Feature>
              ))}
            </FeatureList>
            <CTAButton onClick={() => handleStartFreeTrial(plan.name.toLowerCase())}>
              Start {plan.featured ? 'Premium' : 'Free'} Trial
            </CTAButton>
            <TrialText>No credit card required for trial</TrialText>
          </PlanCard>
        ))}
      </PlansWrapper>
    </PricingContainer>
  );
};

export default Pricing;