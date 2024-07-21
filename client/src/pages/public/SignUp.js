// src/pages/public/SignUp.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaGoogle } from 'react-icons/fa';
import { registerUser } from '../../api';
import { useNavigate } from 'react-router-dom';

const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
`;

const SignUpBox = styled.div`
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

const SignInPrompt = styled.div`
  margin-top: 20px;
  font-size: 0.9em;
  color: #666;
`;

const SignInLink = styled.a`
  color: #007BFF;
  text-decoration: none;
  font-weight: bold;
  margin-left: 5px;
  transition: color 0.3s;
  &:hover {
    color: #0056b3;
  }
`;

const Divider = styled.div`
  margin: 20px 0;
  text-align: center;
  font-size: 1em;
  color: #999;
  @media (max-width: 768px) {
    margin: 15px 0;
  }
`;

const GoogleButton = styled(Button)`
  background-color: white;
  color: #333;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  &:hover {
    background-color: #f1f1f1;
  }
  svg {
    margin-right: 10px;
  }
`;

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return alert('Passwords do not match');
    }
    try {
      await registerUser({ name, email, password });
      navigate('/signin'); // Redirect to sign in page after successful registration
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const handleGoogleSignIn = () => {
    alert('Google sign-in (this is a placeholder)');
  };

  return (
    <SignUpContainer>
      <SignUpBox>
        <Header>Sign Up</Header>
        <Description>Join Propertilico and start managing your properties efficiently.</Description>
        <form onSubmit={handleSubmit}>
          <Input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <Button type="submit">Sign Up</Button>
        </form>
        <Divider>or</Divider>
        <GoogleButton onClick={handleGoogleSignIn}>
          <FaGoogle /> Sign up with Google
        </GoogleButton>
        <SignInPrompt>
          Already have an account? <SignInLink href="/signin">Sign in</SignInLink>
        </SignInPrompt>
      </SignUpBox>
    </SignUpContainer>
  );
};

export default SignUp;
