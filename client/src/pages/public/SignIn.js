import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { 
  Typography, TextField, Button, Checkbox, FormControlLabel, Snackbar, 
  IconButton, Box, Paper, InputAdornment, Alert, CircularProgress,
  LinearProgress
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ErrorIcon from '@mui/icons-material/Error';
import LockIcon from '@mui/icons-material/Lock';

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

const ErrorMessage = styled(Typography)`
  color: #f44336;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
`;

const PasswordStrengthIndicator = styled(LinearProgress)`
  margin-top: 8px;
`;

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, hasActiveSubscription } = useUser();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rememberMe' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '', general: '' }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const reCaptchaToken = await executeRecaptcha('signin');
      
      const loginData = { 
        email: formData.email, 
        password: formData.password, 
        reCaptchaToken, 
        rememberMe: formData.rememberMe 
      };
      
      const loginResult = await login(loginData);
      
      if (loginResult.success) {
        setSnackbar({ open: true, message: 'Successfully signed in!', severity: 'success' });
        
        const hasSubscription = await hasActiveSubscription();
        console.log('Subscription status:', hasSubscription ? 'Active' : 'Inactive');
        
        if (hasSubscription) {
          console.log('Redirecting to dashboard');
          navigate('/app/dashboard');
        } else {
          console.log('Redirecting to my plan');
          navigate('/my-plan');
        }
      } else {
        throw new Error(loginResult.error || 'Login failed');
      }
    } catch (error) {
      console.error('SignIn - Login error:', error);
      setErrors(prev => ({ ...prev, general: error.message || 'An error occurred. Please try again.' }));
      setSnackbar({ open: true, message: error.message || 'An error occurred. Please try again.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length > 6) strength += 20;
    if (password.length > 10) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return strength;
  }, [formData.password]);

  return (
    <SignInContainer>
      <SignInBox elevation={3}>
        <Typography variant="h4" gutterBottom sx={{ color: '#6e8efb', fontWeight: 'bold' }}>Sign In</Typography>
        <Form onSubmit={handleSubmit} noValidate>
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#6e8efb' }} /></InputAdornment>,
            }}
          />
          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
            required
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#6e8efb' }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <PasswordStrengthIndicator
            variant="determinate"
            value={passwordStrength}
            color={passwordStrength > 60 ? "success" : passwordStrength > 30 ? "warning" : "error"}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={<Checkbox name="rememberMe" checked={formData.rememberMe} onChange={handleChange} color="primary" />}
              label="Remember Me"
            />
            <Link to="/forgot-password" style={{ color: '#6e8efb', textDecoration: 'none' }}>Forgot Password?</Link>
          </Box>
          {errors.general && (
            <ErrorMessage variant="body2">
              <ErrorIcon fontSize="small" />
              {errors.general}
            </ErrorMessage>
          )}
          <Button
            type="submit"
            variant="contained"
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
        <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
          Don't have an account? <Link to="/get-started" style={{ color: '#6e8efb', textDecoration: 'none' }}>Sign up</Link>
        </Typography>
      </SignInBox>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SignInContainer>
  );
};

export default SignIn;