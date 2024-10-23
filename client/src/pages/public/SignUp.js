import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { 
  Typography, TextField, Button, CircularProgress, Snackbar,
  IconButton, Paper, InputAdornment, LinearProgress, Box, Alert,
  Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Email as EmailIcon, Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import styled from 'styled-components';

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

const PasswordStrengthBar = ({ password }) => {
  const getStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 8) return 25;
    if (password.length >= 8 && password.length < 12) return 50;
    if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) return 75;
    if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 100;
    return 75;
  };

  const strength = getStrength();
  const color = strength <= 25 ? 'error' : strength <= 50 ? 'warning' : strength <= 75 ? 'info' : 'success';
  const label = strength <= 25 ? 'Weak' : strength <= 50 ? 'OK' : strength <= 75 ? 'Good' : 'Strong';

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress variant="determinate" value={strength} color={color} />
      <Typography variant="caption" align="right" display="block" sx={{ mt: 0.5 }}>
        Password Strength: {label}
      </Typography>
    </Box>
  );
};

const SignUp = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { register } = useUser();

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters long';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreedToTerms) newErrors.terms = 'You must agree to the terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, agreedToTerms]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsLoading(true);
    try {
      const reCaptchaToken = executeRecaptcha ? await executeRecaptcha('signup') : null;
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        captcha: reCaptchaToken
      });
      
      if (response.success) {
        setSnackbar({ open: true, message: 'Registration successful! Redirecting to dashboard...', severity: 'success' });
        setTimeout(() => navigate('/app/dashboard'), 3000);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSnackbar({ open: true, message: error.message || 'An error occurred during registration', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    setShowTerms(true);
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
                  <Person sx={{ color: '#6e8efb' }} />
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
            type={showPassword.password ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#6e8efb' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePasswordVisibility('password')} edge="end">
                    {showPassword.password ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <PasswordStrengthBar password={formData.password} />
          <TextField
            name="confirmPassword"
            label="Confirm Password"
            type={showPassword.confirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#6e8efb' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePasswordVisibility('confirmPassword')} edge="end">
                    {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I agree to the <Link href="#" onClick={handleTermsClick}>Terms and Conditions</Link>
              </Typography>
            }
          />
          {errors.terms && (
            <Typography variant="caption" color="error">
              {errors.terms}
            </Typography>
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
            {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </Form>
        <Typography variant="body2" sx={{ marginTop: '20px', color: '#666' }}>
          Already have an account? <Link to="/signin" style={{ color: '#6e8efb', textDecoration: 'none' }}>Sign in</Link>
        </Typography>
      </SignUpBox>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog open={showTerms} onClose={() => setShowTerms(false)}>
        <DialogTitle>Terms and Conditions</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Welcome to Propertilico. By using our services, you agree to comply with and be bound by the following terms and conditions:

            1. Acceptance of Terms: By accessing or using Propertilico, you agree to be bound by these Terms and Conditions.

            2. User Responsibilities: You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.

            3. Privacy Policy: Your use of Propertilico is also governed by our Privacy Policy.

            4. Intellectual Property: All content, features, and functionality of Propertilico are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

            5. Limitation of Liability: Propertilico and its affiliates will not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.

            6. Termination: We reserve the right to terminate or suspend your account and access to Propertilico at our sole discretion, without notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users, us, or third parties, or for any other reason.

            7. Changes to Terms: We reserve the right to change these Terms and Conditions at any time. Your continued use of Propertilico after such changes constitutes your acceptance of the new Terms and Conditions.

            8. Governing Law: These Terms and Conditions are governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles.

            By clicking "I agree" or by using Propertilico, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTerms(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </SignUpContainer>
  );
};

export default SignUp;