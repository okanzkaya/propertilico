import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Switch,
  InputLabel,
  Avatar,
  Tooltip,
  Divider,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
  Lock as LockIcon,
  Camera as CameraIcon,
} from '@mui/icons-material';

const SettingsPage = ({ toggleTheme }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState('preferences');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
  });
  const [accountSettings, setAccountSettings] = useState({
    username: '',
    email: '',
    profilePicture: '',
    language: 'english',
    timeZone: 'GMT',
    currency: 'USD',
  });
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    setter((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAccountSettings((prev) => ({ ...prev, profilePicture: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    toggleTheme(appearanceSettings.theme);
    // Implement actual save logic here
    console.log('Settings saved');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preferences':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UserPreferences
              accountSettings={accountSettings}
              notificationSettings={notificationSettings}
              handleChange={handleChange}
              setAccountSettings={setAccountSettings}
              setNotificationSettings={setNotificationSettings}
              handleProfilePictureChange={handleProfilePictureChange}
            />
          </motion.div>
        );
      case 'appearance':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AppearanceSettings
              appearanceSettings={appearanceSettings}
              handleChange={handleChange}
              setAppearanceSettings={setAppearanceSettings}
            />
          </motion.div>
        );
      case 'security':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SecuritySettings
              securitySettings={securitySettings}
              handleChange={handleChange}
              setSecuritySettings={setSecuritySettings}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        padding: { xs: '1rem', sm: '2rem' },
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        color: theme.palette.text.primary,
      }}
    >
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              padding: '1rem',
              boxShadow: theme.shadows[1],
              borderRadius: '12px',
              backgroundColor: theme.palette.background.paper,
              height: '100%',
            }}
          >
            <TabButton
              icon={<PersonIcon />}
              label="User Preferences"
              active={activeTab === 'preferences'}
              onClick={() => setActiveTab('preferences')}
            />
            <TabButton
              icon={<PaletteIcon />}
              label="Appearance"
              active={activeTab === 'appearance'}
              onClick={() => setActiveTab('appearance')}
            />
            <TabButton
              icon={<SecurityIcon />}
              label="Security"
              active={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          <Card
            sx={{
              padding: '1.5rem',
              boxShadow: theme.shadows[1],
              borderRadius: '12px',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {renderTabContent()}
          </Card>
        </Grid>
      </Grid>
      <Box mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 'bold',
            padding: '0.5rem 2rem',
          }}
        >
          Save Changes
        </Button>
      </Box>
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

const UserPreferences = ({
  accountSettings,
  notificationSettings,
  handleChange,
  setAccountSettings,
  setNotificationSettings,
  handleProfilePictureChange,
}) => (
  <>
    <SectionTitle
      icon={<PersonIcon />}
      title="User Preferences"
      tooltipText="Manage your personal preferences"
    />
    <Box display="flex" justifyContent="center" mb={3}>
      <Box position="relative">
        <Avatar
          src={accountSettings.profilePicture}
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
          value={accountSettings.username}
          onChange={handleChange(setAccountSettings)}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Email"
          variant="outlined"
          name="email"
          value={accountSettings.email}
          onChange={handleChange(setAccountSettings)}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select
            name="language"
            value={accountSettings.language}
            onChange={handleChange(setAccountSettings)}
          >
            {['English', 'Spanish', 'French', 'German', 'Chinese'].map((lang) => (
              <MenuItem key={lang} value={lang.toLowerCase()}>{lang}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Time Zone</InputLabel>
          <Select
            name="timeZone"
            value={accountSettings.timeZone}
            onChange={handleChange(setAccountSettings)}
          >
            {['PST', 'MST', 'CST', 'EST', 'GMT'].map((tz) => (
              <MenuItem key={tz} value={tz}>{tz}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Currency</InputLabel>
          <Select
            name="currency"
            value={accountSettings.currency}
            onChange={handleChange(setAccountSettings)}
          >
            {['USD', 'EUR', 'GBP', 'JPY', 'CNY'].map((curr) => (
              <MenuItem key={curr} value={curr}>{curr}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
    <Box mt={3}>
      <SectionTitle
        icon={<NotificationsIcon />}
        title="Notification Settings"
        tooltipText="Configure your notification preferences"
      />
      <FormControlLabel
        control={
          <Switch
            checked={notificationSettings.emailNotifications}
            onChange={handleChange(setNotificationSettings)}
            name="emailNotifications"
          />
        }
        label="Email Notifications"
      />
      <FormControlLabel
        control={
          <Switch
            checked={notificationSettings.pushNotifications}
            onChange={handleChange(setNotificationSettings)}
            name="pushNotifications"
          />
        }
        label="Push Notifications"
      />
    </Box>
  </>
);

const AppearanceSettings = ({ appearanceSettings, handleChange, setAppearanceSettings }) => (
  <>
    <SectionTitle
      icon={<PaletteIcon />}
      title="Theme"
      tooltipText="Select your preferred theme"
    />
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>Theme</InputLabel>
      <Select
        name="theme"
        value={appearanceSettings.theme}
        onChange={handleChange(setAppearanceSettings)}
      >
        <MenuItem value="light">Light</MenuItem>
        <MenuItem value="dark">Dark</MenuItem>
      </Select>
    </FormControl>
    <SectionTitle
      icon={<TextFieldsIcon />}
      title="Font Size"
      tooltipText="Select your preferred font size"
    />
    <FormControl fullWidth>
      <InputLabel>Font Size</InputLabel>
      <Select
        name="fontSize"
        value={appearanceSettings.fontSize}
        onChange={handleChange(setAppearanceSettings)}
      >
        <MenuItem value="small">Small</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="large">Large</MenuItem>
      </Select>
    </FormControl>
  </>
);

const SecuritySettings = ({ securitySettings, handleChange, setSecuritySettings }) => (
  <>
    <SectionTitle
      icon={<SecurityIcon />}
      title="Security Settings"
      tooltipText="Manage your security settings"
    />
    <FormControlLabel
      control={
        <Switch
          checked={securitySettings.twoFactorAuth}
          onChange={handleChange(setSecuritySettings)}
          name="twoFactorAuth"
        />
      }
      label="Two-Factor Authentication"
    />
    <FormControlLabel
      control={
        <Switch
          checked={securitySettings.loginAlerts}
          onChange={handleChange(setSecuritySettings)}
          name="loginAlerts"
        />
      }
      label="Login Alerts"
    />
    <Box mt={3}>
      <SectionTitle
        icon={<LockIcon />}
        title="Change Password"
        tooltipText="Update your password"
      />
      <Grid container spacing={2}>
        {['oldPassword', 'newPassword', 'confirmPassword'].map((field) => (
          <Grid item xs={12} key={field}>
            <TextField
              label={field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              type="password"
              variant="outlined"
              name={field}
              value={securitySettings[field]}
              onChange={handleChange(setSecuritySettings)}
              fullWidth
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  </>
);

export default SettingsPage;