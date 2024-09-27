import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Typography, Grid, Box, Card, Button, TextField, Select, MenuItem, FormControl,
  FormControlLabel, Switch, InputLabel, Avatar, Tooltip, IconButton, useTheme,
  Snackbar, Alert, InputAdornment, Dialog, DialogActions, DialogContent,
  DialogTitle, CircularProgress, Autocomplete
} from '@mui/material';
import {
  Notifications as NotificationsIcon, Security as SecurityIcon,
  Person as PersonIcon, Info as InfoIcon, Palette as PaletteIcon,
  Lock as LockIcon, Camera as CameraIcon, Email as EmailIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useUser } from '../../context/UserContext';
import { userApi, authApi } from '../../api';
import moment from 'moment-timezone';

const usePasswordVisibility = () => {
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);
  return [showPasswords, togglePasswordVisibility];
};

const SettingsPage = ({ toggleTheme, fontSize, changeFontSize, themeMode }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('preferences');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { user, updateUserSettings } = useUser();
  const [dialogState, setDialogState] = useState({
    email: { open: false, newEmail: '', password: '' },
    password: { open: false, oldPassword: '', newPassword: '', confirmPassword: '' },
  });
  const [showPasswords, togglePasswordVisibility] = usePasswordVisibility();
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [settings, setSettings] = useState({
    preferences: {
      username: user?.name || '',
      profilePicture: user?.avatar || '',
      language: user?.language || 'en',
      timeZone: user?.timeZone || 'UTC',
      currency: user?.currency || 'USD',
      dateFormat: user?.dateFormat || 'MM/DD/YYYY',
      measurementUnit: user?.measurementUnit || 'metric',
    },
    notifications: {
      emailNotifications: user?.emailNotifications || false,
      pushNotifications: user?.pushNotifications || false,
      inAppNotifications: user?.inAppNotifications || false,
    },
    appearance: {
      theme: themeMode,
      fontSize: fontSize,
    },
    security: {
      twoFactorAuth: user?.twoFactorAuth || false,
      loginAlerts: user?.loginAlerts || false,
    },
  });

  useEffect(() => {
    setSettings(prevSettings => ({
      ...prevSettings,
      preferences: { ...prevSettings.preferences, ...user },
      notifications: { ...prevSettings.notifications, ...user },
      appearance: { ...prevSettings.appearance, theme: themeMode, fontSize: fontSize },
      security: { ...prevSettings.security, ...user },
    }));
    if (user?.avatar) {
      setAvatarPreview(`${process.env.REACT_APP_API_URL}${user.avatar}`);
    }
  }, [user, themeMode, fontSize]);

  const handleSave = useCallback(async (section) => {
    setLoading(true);
    try {
      await userApi.updateUserProfile(settings[section]);
      setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({ open: true, message: `Failed to save settings: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const handleChange = useCallback((section) => async (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: newValue,
      },
    }));

    try {
      await userApi.updateUserProfile({ [name]: newValue });
      setSnackbar({ open: true, message: 'Setting updated successfully', severity: 'success' });
      
      if (section === 'appearance') {
        if (name === 'theme') {
          toggleTheme('app');
        } else if (name === 'fontSize') {
          changeFontSize(newValue);
        }
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      setSnackbar({ open: true, message: `Failed to update setting: ${error.message}`, severity: 'error' });
      // Revert the change in local state if the API call fails
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: prev[section][name],
        },
      }));
    }
  }, [toggleTheme, changeFontSize]);

  const handleProfilePictureChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await userApi.uploadAvatar(formData);
        setSettings(prev => ({
          ...prev,
          preferences: { ...prev.preferences, profilePicture: response.avatarUrl },
        }));
        setAvatarPreview(`${process.env.REACT_APP_API_URL}${response.avatarUrl}`);
        await updateUserSettings({ avatar: response.avatarUrl });
        setSnackbar({ open: true, message: 'Profile picture updated successfully', severity: 'success' });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        setSnackbar({ open: true, message: 'Failed to upload profile picture', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  }, [updateUserSettings]);

  const handleChangePassword = useCallback(async () => {
    setLoading(true);
    try {
      const { oldPassword, newPassword, confirmPassword } = dialogState.password;
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
      await authApi.changePassword(oldPassword, newPassword);
      setSnackbar({ open: true, message: 'Password changed successfully', severity: 'success' });
      setDialogState(prev => ({ ...prev, password: { open: false, oldPassword: '', newPassword: '', confirmPassword: '' } }));
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({ open: true, message: error.toString(), severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [dialogState.password]);

  const handleEmailChange = useCallback(async () => {
    setLoading(true);
    try {
      const { newEmail, password } = dialogState.email;
      await userApi.changeEmail(newEmail, password);
      await updateUserSettings({ email: newEmail });
      setSnackbar({ open: true, message: 'Email changed successfully', severity: 'success' });
      setDialogState(prev => ({ ...prev, email: { open: false, newEmail: '', password: '' } }));
    } catch (error) {
      console.error('Error changing email:', error);
      setSnackbar({ open: true, message: error.toString(), severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [dialogState.email, updateUserSettings]);

  const tabContent = useMemo(() => ({
    preferences: (
      <UserPreferences
        settings={settings.preferences}
        handleChange={handleChange('preferences')}
        handleProfilePictureChange={handleProfilePictureChange}
        handleSave={() => handleSave('preferences')}
        avatarPreview={avatarPreview}
      />
    ),
    notifications: (
      <NotificationSettings
        settings={settings.notifications}
        handleChange={handleChange('notifications')}
      />
    ),
    appearance: (
      <AppearanceSettings
        settings={settings.appearance}
        handleChange={handleChange('appearance')}
      />
    ),
    security: (
      <SecuritySettings
        settings={settings.security}
        handleChange={handleChange('security')}
        handleChangePassword={() => setDialogState(prev => ({ ...prev, password: { ...prev.password, open: true } }))}
        handleEmailChangeRequest={() => setDialogState(prev => ({ ...prev, email: { ...prev.email, open: true } }))}
        userEmail={user.email}
      />
    ),
  }), [settings, handleChange, handleProfilePictureChange, handleSave, user.email, avatarPreview]);

  return (
    <Box sx={{ padding: { xs: '1rem', sm: '2rem' }, backgroundColor: theme.palette.background.default, minHeight: '100vh', color: theme.palette.text.primary }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ padding: '1rem', boxShadow: theme.shadows[1], borderRadius: '12px', backgroundColor: theme.palette.background.paper, height: '100%' }}>
            {Object.keys(tabContent).map((tab) => (
              <TabButton
                key={tab}
                icon={getTabIcon(tab)}
                label={getTabLabel(tab)}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          <Card sx={{ padding: '1.5rem', boxShadow: theme.shadows[1], borderRadius: '12px', backgroundColor: theme.palette.background.paper }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                <CircularProgress />
              </Box>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            )}
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog open={dialogState.email.open} onClose={() => setDialogState(prev => ({ ...prev, email: { ...prev.email, open: false } }))}>
        <DialogTitle>Change Email Address</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You can only change your email address once every 24 hours. Are you sure you want to proceed?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="New Email Address"
            type="email"
            fullWidth
            value={dialogState.email.newEmail}
            onChange={(e) => setDialogState(prev => ({ ...prev, email: { ...prev.email, newEmail: e.target.value } }))}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={dialogState.email.password}
            onChange={(e) => setDialogState(prev => ({ ...prev, email: { ...prev.email, password: e.target.value } }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState(prev => ({ ...prev, email: { ...prev.email, open: false } }))}>Cancel</Button>
          <Button onClick={handleEmailChange} color="primary">Change Email</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={dialogState.password.open} onClose={() => setDialogState(prev => ({ ...prev, password: { ...prev.password, open: false } }))}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You can only change your password once every 30 minutes. Are you sure you want to proceed?
          </Typography>
          <TextField
            margin="dense"
            label="Old Password"
            type={showPasswords.oldPassword ? 'text' : 'password'}
            fullWidth
            value={dialogState.password.oldPassword}
            onChange={(e) => setDialogState(prev => ({ ...prev, password: { ...prev.password, oldPassword: e.target.value } }))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => togglePasswordVisibility('oldPassword')}
                    edge="end"
                  >
                    {showPasswords.oldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type={showPasswords.newPassword ? 'text' : 'password'}
            fullWidth
            value={dialogState.password.newPassword}
            onChange={(e) => setDialogState(prev => ({ ...prev, password: { ...prev.password, newPassword: e.target.value } }))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    edge="end"
                  >
                    {showPasswords.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type={showPasswords.confirmPassword ? 'text' : 'password'}
            fullWidth
            value={dialogState.password.confirmPassword}
            onChange={(e) => setDialogState(prev => ({ ...prev, password: { ...prev.password, confirmPassword: e.target.value } }))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    edge="end"
                  >
                    {showPasswords.confirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState(prev => ({ ...prev, password: { ...prev.password, open: false } }))}>Cancel</Button>
          <Button onClick={handleChangePassword} color="primary">Change Password</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const TabButton = ({ icon, label, active, onClick }) => {
  const theme = useTheme();
  return (
    <Button
      startIcon={icon}
      onClick={onClick}
      fullWidth
      sx={{
        justifyContent: 'flex-start',
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        borderRadius: '8px',
        color: active ? theme.palette.primary.main : theme.palette.text.primary,
        backgroundColor: active ? theme.palette.action.selected : 'transparent',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      {label}
    </Button>
  );
};

const SectionTitle = ({ icon, title, tooltipText }) => (
  <Box display="flex" alignItems="center" mb={2}>
    {icon}
    <Typography variant="h6" fontWeight="bold" ml={1}>
      {title}
    </Typography>
    <Tooltip title={tooltipText}>
      <IconButton size="small" sx={{ ml: 1 }}>
        <InfoIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

const UserPreferences = ({ settings, handleChange, handleProfilePictureChange, handleSave, avatarPreview }) => {
  const timezones = moment.tz.names().map(tz => ({
    value: tz,
    label: `${tz} (${moment.tz(tz).format('Z')})`
  }));
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'NZD', name: 'New Zealand Dollar' },
  ];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
  ];

  return (
    <>
      <SectionTitle
        icon={<PersonIcon />}
        title="User Preferences"
        tooltipText="Manage your personal preferences"
      />
      <Box display="flex" justifyContent="center" mb={3}>
        <Box position="relative">
          <Avatar
            src={avatarPreview || (settings.profilePicture && `${process.env.REACT_APP_API_URL}${settings.profilePicture}`)}
            sx={{ width: 120, height: 120, cursor: 'pointer' }}
          />
          <label htmlFor="profile-picture-input">
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: (theme) => theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
              }}
              component="span"
            >
              <CameraIcon />
            </IconButton>
          </label>
          <input
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            style={{ display: 'none' }}
          />
        </Box>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Username"
            variant="outlined"
            name="username"
            value={settings.username}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              name="language"
              value={settings.language}
              onChange={handleChange}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={timezones}
            getOptionLabel={(option) => option.label}
            value={timezones.find(tz => tz.value === settings.timeZone) || null}
            onChange={(event, newValue) => {
              handleChange({
                target: { name: 'timeZone', value: newValue ? newValue.value : '' }
              });
            }}
            renderInput={(params) => <TextField {...params} label="Time Zone" />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
            >
              {currencies.map((curr) => (
                <MenuItem key={curr.code} value={curr.code}>{`${curr.code} - ${curr.name}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Date Format</InputLabel>
            <Select
              name="dateFormat"
              value={settings.dateFormat}
              onChange={handleChange}
            >
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Measurement Unit</InputLabel>
            <Select
              name="measurementUnit"
              value={settings.measurementUnit}
              onChange={handleChange}
            >
              <MenuItem value="metric">Metric</MenuItem>
              <MenuItem value="imperial">Imperial</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Box mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          startIcon={<SaveIcon />}
        >
          Save Preferences
        </Button>
      </Box>
    </>
  );
};

const NotificationSettings = ({ settings, handleChange }) => (
  <>
    <SectionTitle
      icon={<NotificationsIcon />}
      title="Notification Settings"
      tooltipText="Configure your notification preferences"
    />
    <FormControlLabel
      control={
        <Switch
          checked={settings.emailNotifications}
          onChange={handleChange}
          name="emailNotifications"
        />
      }
      label="Email Notifications"
    />
    <FormControlLabel
      control={
        <Switch
          checked={settings.pushNotifications}
          onChange={handleChange}
          name="pushNotifications"
        />
      }
      label="Push Notifications"
    />
    <FormControlLabel
      control={
        <Switch
          checked={settings.inAppNotifications}
          onChange={handleChange}
          name="inAppNotifications"
        />
      }
      label="In-App Notifications"
    />
  </>
);

const AppearanceSettings = ({ settings, handleChange }) => (
  <>
    <SectionTitle
      icon={<PaletteIcon />}
      title="Appearance"
      tooltipText="Customize your app appearance"
    />
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>Theme</InputLabel>
      <Select
        name="theme"
        value={settings.theme}
        onChange={handleChange}
      >
        <MenuItem value="light">Light</MenuItem>
        <MenuItem value="dark">Dark</MenuItem>
      </Select>
    </FormControl>
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>Font Size</InputLabel>
      <Select
        name="fontSize"
        value={settings.fontSize}
        onChange={handleChange}
      >
        <MenuItem value="small">Small</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="large">Large</MenuItem>
      </Select>
    </FormControl>
  </>
);

const SecuritySettings = ({ settings, handleChange, handleChangePassword, handleEmailChangeRequest, userEmail }) => (
  <>
    <SectionTitle
      icon={<SecurityIcon />}
      title="Security Settings"
      tooltipText="Manage your security settings"
    />
    <FormControlLabel
      control={
        <Switch
          checked={settings.twoFactorAuth}
          onChange={handleChange}
          name="twoFactorAuth"
        />
      }
      label="Two-Factor Authentication"
    />
    <FormControlLabel
      control={
        <Switch
          checked={settings.loginAlerts}
          onChange={handleChange}
          name="loginAlerts"
        />
      }
      label="Login Alerts"
    />
    <Box mt={3}>
      <SectionTitle
        icon={<EmailIcon />}
        title="Email Address"
        tooltipText="Change your email address"
      />
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="body1" mr={2}>{userEmail}</Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleEmailChangeRequest}
        >
          Change Email
        </Button>
      </Box>
    </Box>
    <Box mt={3}>
      <SectionTitle
        icon={<LockIcon />}
        title="Change Password"
        tooltipText="Update your password"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleChangePassword}
        startIcon={<LockIcon />}
      >
        Change Password
      </Button>
    </Box>
  </>
);

const getTabIcon = (tab) => {
  switch (tab) {
    case 'preferences': return <PersonIcon />;
    case 'notifications': return <NotificationsIcon />;
    case 'appearance': return <PaletteIcon />;
    case 'security': return <SecurityIcon />;
    default: return null;
  }
};

const getTabLabel = (tab) => {
  switch (tab) {
    case 'preferences': return 'User Preferences';
    case 'notifications': return 'Notification Settings';
    case 'appearance': return 'Appearance';
    case 'security': return 'Security';
    default: return '';
  }
};

export default SettingsPage;