import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaGoogle, FaLock } from 'react-icons/fa';
import { loginUser } from '../../api';
import { useUser } from '../../context/UserContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Checkbox, 
  FormControlLabel,
  Snackbar,
  IconButton,
  Box,
  Paper,
  InputAdornment
} from '@mui/material';
import { Close as CloseIcon, Email as EmailIcon } from '@mui/icons-material';

const SignInContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  padding: 20px;
`;

const SignInBox = styled(Paper)`
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GoogleButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #4285F4;
  color: white;
  &:hover {
    background-color: #357ae8;
  }
`;

const ForgotPasswordLink = styled(Link)`
  color: #6e8efb;
  text-decoration: none;
  font-size: 0.875rem;
  &:hover {
    text-decoration: underline;
  }
`;

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const { login } = useUser();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rememberMe' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA not available');
      }

      const reCaptchaToken = await executeRecaptcha('signin');
      const response = await loginUser({ ...formData, reCaptchaToken });
      login({ ...response, rememberMe: formData.rememberMe });
      setSnackbar({ open: true, message: 'Sign in successful!', severity: 'success' });
      setTimeout(() => navigate('/app/dashboard'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'An error occurred during sign in', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setSnackbar({ open: true, message: 'Google Sign In is not implemented yet', severity: 'info' });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <SignInContainer>
      <SignInBox elevation={3}>
        <Typography variant="h4" gutterBottom sx={{ color: '#6e8efb', fontWeight: 'bold' }}>Sign In</Typography>
        <Typography variant="body1" gutterBottom sx={{ color: '#666', marginBottom: '20px' }}>
          Welcome back to Propertilico
        </Typography>
        <Form onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#6e8efb' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaLock style={{ color: '#6e8efb' }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Remember Me"
            />
            <ForgotPasswordLink to="/forgot-password">Forgot Password?</ForgotPasswordLink>
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            sx={{ 
              backgroundColor: '#6e8efb', 
              '&:hover': { backgroundColor: '#5c7cfa' },
              height: '48px'
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Form>
        <Typography variant="body2" sx={{ margin: '20px 0', color: '#666' }}>or</Typography>
        <GoogleButton
          variant="contained"
          onClick={handleGoogleSignIn}
          fullWidth
          sx={{ height: '48px' }}
        >
          <FaGoogle /> Sign in with Google
        </GoogleButton>
        <Typography variant="body2" sx={{ marginTop: '20px', color: '#666' }}>
          Don't have an account? <Link to="/get-started" style={{ color: '#6e8efb', textDecoration: 'none' }}>Sign up</Link>
        </Typography>
      </SignInBox>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </SignInContainer>
  );
};

export default SignIn;