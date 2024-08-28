// src/pages/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaChartBar, FaShieldAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import exampleImage from '../../assets/public/homepage.jpg';

const placeholderImage = 'https://via.placeholder.com/150';

const HomeContainer = styled.div`
  text-align: center;
  padding: 50px;
  margin-bottom: 100px;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 50px;
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
  font-size: 2.5em;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 2em;
  }
`;

const SubText = styled.p`
  font-size: 1em;
  margin-bottom: 25px;
  color: #555;

  @media (max-width: 768px) {
    font-size: 0.9em;
  }
`;

const GetStartedButton = styled.button`
  background-color: #007BFF;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  margin-top: 10px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9em;
  }
`;

const TrialText = styled.p`
  font-size: 0.8em;
  color: #888;
  text-align: center;
  margin-top: 10px;

  @media (max-width: 768px) {
    font-size: 0.7em;
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
  font-size: 3em;
  margin-bottom: 10px;
  color: #007BFF;
  transition: transform 0.3s, color 0.3s;

  &:hover {
    transform: scale(1.2);
    color: #0056b3;
  }

  @media (max-width: 768px) {
    font-size: 2.5em;
  }
`;

const FeatureHeader = styled.h3`
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #333;

  @media (max-width: 768px) {
    font-size: 1.2em;
  }
`;

const FeatureText = styled.p`
  font-size: 0.9em;
  color: #666;

  @media (max-width: 768px) {
    font-size: 0.8em;
  }
`;

const CardSectionWrapper = styled.div`
  margin-top: 50px;
  padding: 30px 0;
  background-color: #f0f4f8;
  overflow: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
  border-radius: 15px;

  @media (max-width: 768px) {
    margin-top: 30px;
    padding: 20px 0;
  }
`;

const CardSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: 1000px;
  height: 400px; /* Increased height to accommodate all text */

  @media (max-width: 768px) {
    height: 350px;
  }
`;

const Card = styled.div`
  width: 250px;
  height: 100%; /* Ensure full height utilization */
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 15px;
  transition: transform 0.3s, opacity 0.3s;
  position: absolute;
  opacity: ${props => (props.visible ? 1 : 0)};
  transform: ${props => (props.active ? 'scale(1.1)' : 'scale(0.9)')};
  left: ${props => {
    if (props.position === 'center') return '50%';
    if (props.position === 'left') return 'calc(50% - 280px)';
    if (props.position === 'right') return 'calc(50% + 280px)';
    return '0';
  }};
  transform: translateX(-50%) ${props => (props.active ? 'scale(1.1)' : 'scale(0.9)')};
  z-index: ${props => (props.active ? 2 : 1)};
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};

  img {
    border-radius: 10px;
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
  }

  h4 {
    font-size: 1.1em;
    margin-bottom: 5px;
    color: #333;
  }

  h5 {
    font-size: 0.9em;
    color: #555;
    margin-bottom: 10px;
  }

  p {
    font-size: 0.9em;
    color: #666;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 5; /* Limits to 5 lines */
    -webkit-box-orient: vertical;
  }

  @media (max-width: 768px) {
    width: 200px;
    height: 90%; /* Adjust height for smaller screens */
    left: ${props => {
      if (props.position === 'center') return '50%';
      if (props.position === 'left') return 'calc(50% - 220px)';
      if (props.position === 'right') return 'calc(50% + 220px)';
      return '0';
    }};
    transform: translateX(-50%) ${props => (props.active ? 'scale(1.1)' : 'scale(0.9)')};

    img {
      width: 80px;
      height: 80px;
    }
  }
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  color: #007BFF;
  font-size: 2em;
  cursor: pointer;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: color 0.3s;
  z-index: 3;

  &:hover {
    color: #0056b3;
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }

  &.left {
    left: 20px;
  }

  &.right {
    right: 20px;
  }

  @media (max-width: 768px) {
    &.left {
      left: 10px;
    }

    &.right {
      right: 10px;
    }
  }
`;

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const cards = [
    {
      img: placeholderImage,
      name: 'John Doe',
      title: 'CEO of Something',
      comment: 'Propertilico made property management so much easier for me. I can now manage all my properties effortlessly!'
    },
    {
      img: placeholderImage,
      name: 'Jane Smith',
      title: 'CTO of Another Corp',
      comment: 'The analytics feature is fantastic! It helps me make data-driven decisions and increase my revenue.'
    },
    {
      img: placeholderImage,
      name: 'Michael Johnson',
      title: 'Real Estate Expert',
      comment: 'The secure and reliable platform gives me peace of mind knowing my data is safe and secure.'
    },
    {
      img: placeholderImage,
      name: 'Emily Davis',
      title: 'Property Manager',
      comment: 'The user-friendly interface allows me to manage multiple properties with ease.'
    },
    {
      img: placeholderImage,
      name: 'Robert Wilson',
      title: 'Investor',
      comment: 'Propertilico is the ultimate property management solution. Highly recommended!'
    }
  ];

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  };

  const getPosition = (index) => {
    const relativeIndex = (index - activeIndex + cards.length) % cards.length;
    if (relativeIndex === 0) return 'left';
    if (relativeIndex === 1) return 'center';
    if (relativeIndex === 2) return 'right';
    return 'hidden';
  };

  const isVisible = (index) => {
    const relativeIndex = (index - activeIndex + cards.length) % cards.length;
    return relativeIndex >= 0 && relativeIndex <= 2;
  };

  return (
    <HomeContainer>
      <Section>
        <TextContent>
          <Header>Your Ultimate Property Management Solution</Header>
          <SubText>
            Managing properties has never been easier! Propertilico is a cutting-edge property management designed to streamline and optimize your property management tasks, making your job effortless and efficient.
          </SubText>
          <GetStartedButton onClick={() => navigate('/get-started')}>
            Start your free trial
          </GetStartedButton>
          <TrialText>Cancel anytime during 30 days trial.</TrialText>
        </TextContent>
        <ImageContent>
          <img src={exampleImage} alt="Property Management" />
        </ImageContent>
      </Section>

      <FeaturesSection>
        <Feature>
          <FeatureIcon><FaHome /></FeatureIcon>
          <FeatureHeader>Property Management</FeatureHeader>
          <FeatureText>
            Manage all your properties effortlessly with our all-in-one solution that simplifies property tracking and tenant management.
          </FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon><FaChartBar /></FeatureIcon>
          <FeatureHeader>Advanced Analytics</FeatureHeader>
          <FeatureText>
            Get insights into your property performance with our advanced analytics and reporting tools.
          </FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon><FaShieldAlt /></FeatureIcon>
          <FeatureHeader>Secure & Reliable</FeatureHeader>
          <FeatureText>
            Experience peace of mind with our secure and reliable platform that ensures your data is protected.
          </FeatureText>
        </Feature>
      </FeaturesSection>

      <CardSectionWrapper>
        <CardSection>
          <ArrowButton className="left" onClick={handlePrev} disabled={activeIndex === 0}>
            <FaArrowLeft />
          </ArrowButton>
          {cards.map((card, index) => (
            <Card key={index} active={getPosition(index) === 'center'} position={getPosition(index)} visible={isVisible(index)}>
              <img src={card.img} alt={card.name} />
              <h4>{card.name}</h4>
              <h5>{card.title}</h5>
              <p>{card.comment}</p>
            </Card>
          ))}
          <ArrowButton className="right" onClick={handleNext} disabled={activeIndex === cards.length - 1}>
            <FaArrowRight />
          </ArrowButton>
        </CardSection>
      </CardSectionWrapper>
    </HomeContainer>
  );
};

export default Home;
