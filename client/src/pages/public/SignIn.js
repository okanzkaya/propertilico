import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaGoogle } from 'react-icons/fa';
import { loginUser } from '../../api';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
`;

const Box = styled.div`
  background-color: white;
  padding: 30px;
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
  font-size: 2em;
  margin-bottom: 10px;
  color: #007BFF;
`;

const Description = styled.p`
  font-size: 1em;
  margin-bottom: 20px;
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

const RememberMeContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9em;
  color: #666;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const Link = styled.a`
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

const Prompt = styled.div`
  margin-top: 20px;
  font-size: 0.9em;
  color: #666;
`;

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) navigate('/');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Sign In button clicked'); // Debug log
    try {
      const response = await loginUser({ email, password });
      console.log('API response:', response); // Debug log
      if (rememberMe) localStorage.setItem('token', response.token);
      else sessionStorage.setItem('token', response.token);

      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <Container>
      <Box>
        <Header>Sign In</Header>
        <Description>Sign in to your Propertilico account.</Description>
        <form onSubmit={handleSubmit}>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <RememberMeContainer>
            <Label>
              <Checkbox type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember Me
            </Label>
            <Link href="/forgot-password">Forgot Password?</Link>
          </RememberMeContainer>
          <Button type="submit">Sign In</Button>
        </form>
        <Divider>or</Divider>
        <GoogleButton>
          <FaGoogle /> Sign in with Google
        </GoogleButton>
        <Prompt>
          Don't have an account? <Link href="/get-started">Sign up</Link>
        </Prompt>
      </Box>
    </Container>
  );
};

export default SignIn;
