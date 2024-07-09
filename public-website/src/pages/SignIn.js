// src/pages/SignIn.js
import React from 'react';
import styled from 'styled-components';
import { FaGoogle } from 'react-icons/fa';

const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
`;

const SignInBox = styled.div`
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
  margin-bottom: 20px;
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

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const RememberMeLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9em;
  color: #666;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const ForgotPasswordLink = styled.a`
  font-size: 0.9em;
  color: #007BFF;
  text-decoration: none;
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

const SignUpPrompt = styled.div`
  margin-top: 20px;
  font-size: 0.9em;
  color: #666;
`;

const SignUpLink = styled.a`
  color: #007BFF;
  text-decoration: none;
  font-weight: bold;
  margin-left: 5px;
  transition: color 0.3s;

  &:hover {
    color: #0056b3;
  }
`;

function SignIn() {
  return (
    <SignInContainer>
      <SignInBox>
        <Header>Sign In</Header>
        <Description>Sign in to your Propertilico account.</Description>
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <RememberMeContainer>
          <RememberMeLabel>
            <Checkbox type="checkbox" />
            Remember Me
          </RememberMeLabel>
          <ForgotPasswordLink href="/forgot-password">Forgot Password?</ForgotPasswordLink>
        </RememberMeContainer>
        <Button>Sign In</Button>
        <Divider>or</Divider>
        <GoogleButton>
          <FaGoogle /> Sign in with Google
        </GoogleButton>
        <SignUpPrompt>
          Don't have an account?
          <SignUpLink href="/get-started">Sign up</SignUpLink>
        </SignUpPrompt>
      </SignInBox>
    </SignInContainer>
  );
}

export default SignIn;
