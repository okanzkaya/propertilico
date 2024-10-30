import styles from './SignUp.module.css';
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { 
  Typography, TextField, Button, CircularProgress, Snackbar,
  IconButton, Paper, InputAdornment, LinearProgress, Box, Alert,
  Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Email, Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import './SignUp.css';

const PasswordStrengthBar = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
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
  const initialFormState = { name: '', email: '', password: '', confirmPassword: '' };
  const [formData, setFormData] = useState(initialFormState);
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
    const emailRegex = /\S+@\S+\.\S+/;

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
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
        ...formData,
        captcha: reCaptchaToken
      });

      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Registration successful! Redirecting to dashboard...',
          severity: 'success'
        });
        setTimeout(() => navigate('/app/dashboard'), 3000);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred during registration',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const renderTextField = (name, label, type = 'text', icon) => (
    <TextField
      name={name}
      label={label}
      type={type === 'password' ? (showPassword[name] ? 'text' : 'password') : type}
      value={formData[name]}
      onChange={handleChange}
      error={!!errors[name]}
      helperText={errors[name]}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {React.createElement(icon, { className: 'icon-color' })}
          </InputAdornment>
        ),
        endAdornment: type === 'password' && (
          <InputAdornment position="end">
            <IconButton onClick={() => togglePasswordVisibility(name)} edge="end">
              {showPassword[name] ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <div className={styles.signupContainer}>
      <Paper className={styles.signupBox} elevation={3}>
        <Typography variant="h4" gutterBottom className={styles.signupTitle}>
          Sign Up
        </Typography>
        <Typography variant="body1" gutterBottom className={styles.signupSubtitle}>
          Join Propertilico and start managing your properties efficiently
        </Typography>
        
        <form onSubmit={handleSubmit} className={styles.signupForm}>
          {renderTextField('name', 'Full Name', 'text', Person)}
          {renderTextField('email', 'Email', 'email', Email)}
          {renderTextField('password', 'Password', 'password', Lock)}
          <PasswordStrengthBar password={formData.password} />
          {renderTextField('confirmPassword', 'Confirm Password', 'password', Lock)}
          
          <FormControlLabel
            control={
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" className={styles.termsText}>
                I agree to the{' '}
                <Link href="#" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>
                  Terms and Conditions
                </Link>
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
            className={styles.signupButton}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </form>

        <Typography variant="body2" className={styles.signupLink}>
          Already have an account?{' '}
          <Link to="/signin">Sign in</Link>
        </Typography>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={showTerms} onClose={() => setShowTerms(false)}>
        <DialogTitle>Terms and Conditions</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {/* Terms and conditions content */}
            Welcome to Propertilico. By using our services, you agree to comply with and be bound by the following terms and conditions...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTerms(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SignUp;