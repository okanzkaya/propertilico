import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaGoogle, FaUser, FaLock } from 'react-icons/fa';
import { registerUser } from '../../api';
import { 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Snackbar,
  IconButton,
  Paper,
  InputAdornment
} from '@mui/material';
import { Close as CloseIcon, Email as EmailIcon } from '@mui/icons-material';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const SignUpContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  padding: 20px;
`;

const SignUpBox = styled(Paper)`
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

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters long';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA not available');
      }

      const reCaptchaToken = await executeRecaptcha('signup');
      await registerUser({ ...formData, reCaptchaToken });
      setSnackbar({ open: true, message: 'Registration successful! Redirecting to sign in...', severity: 'success' });
      setTimeout(() => navigate('/signin'), 3000);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'An error occurred during registration', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setSnackbar({ open: true, message: 'Google Sign Up is not implemented yet', severity: 'info' });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <SignUpContainer>
      <SignUpBox elevation={3}>
        <Typography variant="h4" gutterBottom sx={{ color: '#6e8efb', fontWeight: 'bold' }}>Sign Up</Typography>
        <Typography variant="body1" gutterBottom sx={{ color: '#666', marginBottom: '20px' }}>
          Join Propertilico and start managing your properties efficiently
        </Typography>
        <Form onSubmit={handleSubmit}>
          <TextField
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaUser style={{ color: '#6e8efb' }} />
                </InputAdornment>
              ),
            }}
          />
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
          <TextField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaLock style={{ color: '#6e8efb' }} />
                </InputAdornment>
              ),
            }}
          />
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
            {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </Form>
        <Typography variant="body2" sx={{ margin: '20px 0', color: '#666' }}>or</Typography>
        <GoogleButton
          variant="contained"
          onClick={handleGoogleSignUp}
          fullWidth
          sx={{ height: '48px' }}
        >
          <FaGoogle /> Sign up with Google
        </GoogleButton>
        <Typography variant="body2" sx={{ marginTop: '20px', color: '#666' }}>
          Already have an account? <Link to="/signin" style={{ color: '#6e8efb', textDecoration: 'none' }}>Sign in</Link>
        </Typography>
      </SignUpBox>
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
          <React.Fragment>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleSnackbarClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </SignUpContainer>
  );
};

export default SignUp;