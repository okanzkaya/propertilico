import styles from './SignIn.module.css';
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { 
  Typography, TextField, Button, Checkbox, FormControlLabel, Snackbar, 
  IconButton, Box, Paper, InputAdornment, Alert, CircularProgress,
  Divider
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ErrorIcon from '@mui/icons-material/Error';
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';
import './SignIn.css';

const SignIn = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    rememberMe: false 
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useUser();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'rememberMe' ? checked : value 
    }));
    setErrors(prev => ({ 
      ...prev, 
      [name]: '', 
      general: '' 
    }));
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
        setSnackbar({ 
          open: true, 
          message: 'Successfully signed in!', 
          severity: 'success' 
        });
        handlePostLogin(loginResult.user.hasActiveSubscription);
      } else {
        throw new Error(loginResult.error || 'Login failed');
      }
    } catch (error) {
      console.error('SignIn - Login error:', error);
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error) => {
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'An error occurred. Please try again.';
    
    if (errorMessage.includes('email')) {
      setErrors(prev => ({ ...prev, email: errorMessage }));
    } else if (errorMessage.includes('password')) {
      setErrors(prev => ({ ...prev, password: errorMessage }));
    } else {
      setErrors(prev => ({ ...prev, general: errorMessage }));
    }

    setSnackbar({ open: true, message: errorMessage, severity: 'error' });
  };

  const handlePostLogin = (hasSubscription) => {
    navigate('/');
  };

  const handleGoogleSignIn = () => {
    setSnackbar({ 
      open: true, 
      message: 'Google Sign In is not available yet', 
      severity: 'info' 
    });
  };

  return (
    <div className={styles.signinContainer}>
      <Paper className={styles.signinBox} elevation={3}>
        <Typography variant="h4" gutterBottom className={styles.signinTitle}>
          Sign In
        </Typography>
        <form onSubmit={handleSubmit} noValidate className={styles.signinForm}>
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
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon className={styles.inputIcon} />
                </InputAdornment>
              ),
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
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon className={styles.inputIcon} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setShowPassword(!showPassword)} 
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box className={styles.formControls}>
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
            <Link to="/forgot-password" className={styles.forgotPassword}>
              Forgot Password?
            </Link>
          </Box>
          {errors.general && (
            <Typography variant="body2" className={styles.errorMessage}>
              <ErrorIcon fontSize="small" />
              {errors.general}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </form>
        <Divider sx={{ my: 2 }}>OR</Divider>
        <Button
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled
          className={styles.googleButton}
        >
          Sign in with Google (Coming Soon)
        </Button>
        <Typography variant="body2" className={styles.signupLink}>
          Don't have an account?{' '}
          <Link to="/get-started">Sign up</Link>
        </Typography>
      </Paper>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          className={styles.alert}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SignIn;