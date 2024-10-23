import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { FaCheck, FaTimes, FaCrown, FaRegLightbulb, FaRocket } from 'react-icons/fa';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const PricingContainer = styled.div`
  padding: 60px 20px;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  color: #ffffff;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const GlassPanes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  z-index: 1;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 50%;
  }

  &::before {
    top: -75px;
    left: -75px;
  }

  &::after {
    bottom: -75px;
    right: -75px;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1000px;
`;

const Header = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 20px;
  color: #ffffff;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
`;

const Description = styled.p`
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  margin-bottom: 30px;
  color: #ffffff;
  max-width: 700px;
  margin: 0 auto 30px;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
`;

const PlansWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
`;

const PlanCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 30px 20px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 700px;

  ${props => props.$featured && css`
    transform: scale(1.03);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.5);
  `}

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 48px rgba(31, 38, 135, 0.6);
  }

  @media (max-width: 768px) {
    max-width: 100%;
    height: auto;
    margin-bottom: 30px;
  }
`;

const PlanHeader = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #ffffff;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
`;

const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: line-through;
  margin-bottom: 3px;
`;

const DiscountedPrice = styled.span`
  font-size: 2.5rem;
  color: #ffffff;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
  text-align: left;
`;

const Feature = styled.li`
  font-size: 0.9rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  color: ${props => props.$included ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'};
`;

const FeatureIcon = styled.span`
  margin-right: 8px;
  color: ${props => props.$included ? '#4ded30' : '#ff6b6b'};
  font-size: 1rem;
`;

const PopularLabel = styled.span`
  background-color: #4ded30;
  color: #1a1a1a;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 700;
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DiscountLabel = styled.span`
  background-color: #ff6b6b;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  position: absolute;
  top: 12px;
  right: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CTAButton = styled.button`
  background-color: #4ded30;
  color: #1a1a1a;
  padding: 12px 24px;
  border-radius: 25px;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  cursor: pointer;
  outline: none;
  box-shadow: 0 10px 20px rgba(77, 237, 48, 0.3);
  width: 100%;

  &:hover {
    background-color: #3aba20;
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(77, 237, 48, 0.4);
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(77, 237, 48, 0.5);
  }
`;

const TrialText = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10px;
  font-weight: 600;
`;

const ComparisonToggle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 25px;
  padding: 4px;
  width: fit-content;
`;

const ToggleButton = styled.button`
  background-color: ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 20px;

  &:hover {
    background-color: ${props => props.$active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const FloatingIcon = styled.div`
  position: absolute;
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.3);
  animation: ${float} 6s ease-in-out infinite;
  z-index: 1;

  &:nth-child(1) { top: 10%; left: 5%; animation-delay: 0s; }
  &:nth-child(2) { top: 60%; right: 10%; animation-delay: 2s; }
  &:nth-child(3) { bottom: 10%; left: 20%; animation-delay: 4s; }
`;

const Pricing = () => {
  const navigate = useNavigate();
  const [showMonthly, setShowMonthly] = useState(true);

  useEffect(() => {
    document.title = "Propertilico Pricing - Revolutionary Property Management Plans";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Discover Propertilico's innovative pricing plans. Choose between Standard and Plus to revolutionize your property management experience.");
    }
  }, []);

  const handleStartFreeTrial = useCallback((plan) => {
    navigate(`/payment?plan=${plan}`);
  }, [navigate]);

  const plans = useMemo(() => [
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
      featured: true,
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
    },
  ], []);

  return (
    <PricingContainer>
      <GlassPanes />
      <FloatingIcon><FaRegLightbulb /></FloatingIcon>
      <FloatingIcon><FaRocket /></FloatingIcon>
      <FloatingIcon><FaCrown /></FloatingIcon>
      <ContentWrapper>
        <Header>Revolutionary Property Management</Header>
        <Description>
          Experience the future of property management with our innovative plans.
          Start your 30-day free trial and transform your property portfolio today.
        </Description>
        <ComparisonToggle>
          <ToggleButton $active={showMonthly} onClick={() => setShowMonthly(true)}>Monthly</ToggleButton>
          <ToggleButton $active={!showMonthly} onClick={() => setShowMonthly(false)}>Yearly</ToggleButton>
        </ComparisonToggle>
        <PlansWrapper>
          {plans.map((plan, index) => (
            <PlanCard key={index} $featured={plan.featured}>
              {plan.featured && <PopularLabel><FaCrown /> Most Popular</PopularLabel>}
              <DiscountLabel>35% OFF</DiscountLabel>
              <div>
                <PlanHeader>{plan.name}</PlanHeader>
                <PriceContainer>
                  <OriginalPrice>${showMonthly ? plan.originalMonthlyPrice : plan.originalYearlyPrice}/month</OriginalPrice>
                  <DiscountedPrice>${showMonthly ? plan.monthlyPrice.toFixed(2) : plan.yearlyPrice.toFixed(2)}/month</DiscountedPrice>
                </PriceContainer>
                <FeatureList>
                  {plan.features.map((feature, featureIndex) => (
                    <Feature key={featureIndex} $included={feature.included}>
                      <FeatureIcon $included={feature.included}>
                        {feature.included ? <FaCheck /> : <FaTimes />}
                      </FeatureIcon>
                      {feature.name}
                    </Feature>
                  ))}
                </FeatureList>
              </div>
              <div>
                <CTAButton onClick={() => handleStartFreeTrial(plan.name.toLowerCase())}>
                  Start Free Trial
                </CTAButton>
                <TrialText>No credit card required for trial</TrialText>
              </div>
            </PlanCard>
          ))}
        </PlansWrapper>
      </ContentWrapper>
    </PricingContainer>
  );
};

export default Pricing;