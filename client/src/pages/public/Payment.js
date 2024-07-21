// src/pages/public/Payment.js
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const PaymentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
`;

const PaymentBox = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
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
  font-size: 1.1em;
  margin-bottom: 20px;
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.2em;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

function Payment() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Placeholder for payment logic
    // Make an API call to process the payment
    // If successful, mark the user's subscription as active in the backend
    alert('Payment successful (this is a placeholder)');
    navigate('/app/dashboard'); // Redirect to the app after successful payment
  };

  return (
    <PaymentContainer>
      <PaymentBox>
        <Header>Payment</Header>
        <Description>Enter your payment details to start your subscription.</Description>
        <form onSubmit={handleSubmit}>
          <Input type="text" placeholder="Card Number" />
          <Input type="text" placeholder="Expiry Date" />
          <Input type="text" placeholder="CVC" />
          <Button type="submit">Pay Now</Button>
        </form>
      </PaymentBox>
    </PaymentContainer>
  );
}

export default Payment;
