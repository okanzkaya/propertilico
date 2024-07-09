import React, { useState } from 'react';
import styled from 'styled-components';
import { FaGoogle } from 'react-icons/fa';

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

const PasswordInfo = styled.p`
  font-size: 0.9em;
  color: #666;
  text-align: left;
  margin-bottom: 10px;
`;

const PasswordStrength = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: ${({ strength }) => {
    switch (strength) {
      case 'weak':
        return 'red';
      case 'medium':
        return 'orange';
      case 'strong':
        return 'green';
      default:
        return '#ccc';
    }
  }};
`;

const PasswordStrengthMessage = styled.p`
  font-size: 0.9em;
  color: ${({ strength }) => {
    switch (strength) {
      case 'weak':
        return 'red';
      case 'medium':
        return 'orange';
      case 'strong':
        return 'green';
      default:
        return '#666';
    }
  }};
  text-align: left;
  margin-bottom: 20px;
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

const PolicyText = styled.p`
  font-size: 0.8em;
  color: #666;
  margin-top: 20px;
  text-align: center;
`;

function SignUp() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const evaluatePasswordStrength = (password) => {
    let strength = '';
    if (password.length < 8) {
      strength = 'weak';
    } else {
      const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])");
      if (regex.test(password)) {
        strength = 'strong';
      } else {
        strength = 'medium';
      }
    }
    setStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    evaluatePasswordStrength(newPassword);
  };

  return (
    <SignUpContainer>
      <SignUpBox>
        <Header>Sign Up</Header>
        <Description>Join Propertilico and start managing your properties efficiently.</Description>
        <Input type="text" placeholder="Full Name" />
        <Input type="email" placeholder="Email" />
        <Input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={handlePasswordChange} 
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
        />
        {isPasswordFocused && (
          <>
            <PasswordInfo>Password must be at least 8 characters long.</PasswordInfo>
            <PasswordStrength strength={strength} />
            <PasswordStrengthMessage strength={strength}>
              {strength === 'weak' && 'Your password is weak'}
              {strength === 'medium' && 'Your password is okay, consider adding uppercase, numbers, and special characters for a stronger password.'}
              {strength === 'strong' && 'Your password is strong'}
              {!strength && 'Enter your password'}
            </PasswordStrengthMessage>
          </>
        )}
        <Input type="password" placeholder="Confirm Password" />
        <Button>Sign Up</Button>
        <Divider>or</Divider>
        <GoogleButton>
          <FaGoogle /> Sign up with Google
        </GoogleButton>
        <SignInPrompt>
          Already have an account?
          <SignInLink href="/signin">Sign in</SignInLink>
        </SignInPrompt>
        <PolicyText>By signing up, you agree to our Terms of Service and Privacy Policy.</PolicyText>
      </SignUpBox>
    </SignUpContainer>
  );
}

export default SignUp;
