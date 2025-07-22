// src/pages/public/NotFound.js
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { FaRegSadCry } from 'react-icons/fa';

// Keyframes for animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInFromTop = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideInFromBottom = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Container with a responsive design
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  background-color: #f0f8ff; /* Light blue background */
  color: #333333;
  padding: 20px;
  animation: ${fadeIn} 1s ease-in-out;
`;

const Icon = styled(FaRegSadCry)`
  font-size: 8em;
  color: #3498db; /* Blue icon */
  margin-bottom: 20px;
  animation: ${slideInFromTop} 1s ease-in-out;
`;

const Title = styled.h1`
  font-size: 6em;
  margin-bottom: 10px;
  color: #2c3e50; /* Dark blue text */
  animation: ${slideInFromTop} 1.2s ease-in-out;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const Message = styled.p`
  font-size: 1.5em;
  margin-bottom: 30px;
  color: #555555;
  animation: ${slideInFromBottom} 1.4s ease-in-out;
  max-width: 600px;
`;

const HomeButton = styled(Link)`
  background-color: #3498db; /* Blue button */
  color: #ffffff;
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1.2em;
  transition: background-color 0.3s, transform 0.3s;
  animation: ${slideInFromBottom} 1.6s ease-in-out;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #2980b9; /* Darker blue on hover */
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    font-size: 1em;
    padding: 12px 24px;
  }
`;

const NotFound = () => {
  return (
    <Container>
      <Icon />
      <Title>404</Title>
      <Message>
        Sorry, the page you're looking for cannot be found. It might have been
        moved or deleted. Let's get you back on track!
      </Message>
      <HomeButton to="/">Return to Homepage</HomeButton>
    </Container>
  );
};

export default NotFound;
