import React, { useState } from 'react';
import {
  Typography,
  Box,
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
  Tabs,
  Tab,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { styled } from '@mui/system';

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: '2rem',
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'flex-start',
  color: theme.palette.text.primary,
}));

const ContentWrapper = styled(Box)({
  width: '100%',
  maxWidth: '800px',
});

const SettingsCard = styled(Card)(({ theme }) => ({
  padding: '1.5rem',
  boxShadow: theme.shadows[1],
  borderRadius: '8px',
  backgroundColor: theme.palette.background.paper,
  marginBottom: '1.5rem',
}));

const SectionTitle = styled(Typography)({
  marginBottom: '1rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '1.2rem',
});

const CustomFormControl = styled(FormControl)({
  marginBottom: '1rem',
});

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box p={3}>{children}</Box>}
  </div>
);

const UploadAvatar = styled(Box)({
  position: 'relative',
  display: 'inline-block',
  cursor: 'pointer',
  '& input': { display: 'none' },
  '&:hover .overlay': { opacity: 1 },
  textAlign: 'center',
  marginBottom: '1rem',
});

const AvatarOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.3s',
});

const SettingsPage = ({ toggleTheme }) => {
  const [tabIndex, setTabIndex] = useState(0);
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
    const reader = new FileReader();
    reader.onloadend = () =>
      setAccountSettings((prev) => ({ ...prev, profilePicture: reader.result }));
    if (file) reader.readAsDataURL(file);
  };

  const handleSave = () => {
    toggleTheme(appearanceSettings.theme);
    alert('Settings saved');
  };

  return (
    <PageWrapper>
      <ContentWrapper>
        <Typography variant="h4" gutterBottom>Settings</Typography>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="User Preferences" icon={<PersonIcon />} />
          <Tab label="Appearance" icon={<PaletteIcon />} />
          <Tab label="Security" icon={<SecurityIcon />} />
        </Tabs>

        <TabPanel value={tabIndex} index={0}>
          <SettingsCard>
            <SectionTitle>
              <PersonIcon /> User Preferences
              <Tooltip title="Manage your personal preferences">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <Box display="flex" justifyContent="center" my={2}>
              <UploadAvatar>
                <input type="file" onChange={handleProfilePictureChange} />
                <Avatar src={accountSettings.profilePicture} sx={{ width: 120, height: 120 }} />
                <AvatarOverlay className="overlay">Upload Avatar</AvatarOverlay>
              </UploadAvatar>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CustomFormControl fullWidth>
                  <TextField
                    label="Username"
                    variant="outlined"
                    name="username"
                    value={accountSettings.username}
                    onChange={handleChange(setAccountSettings)}
                    size="small"
                    fullWidth
                  />
                </CustomFormControl>
              </Grid>
              <Grid item xs={12}>
                <CustomFormControl fullWidth>
                  <TextField
                    label="Email"
                    variant="outlined"
                    name="email"
                    value={accountSettings.email}
                    onChange={handleChange(setAccountSettings)}
                    size="small"
                    fullWidth
                  />
                </CustomFormControl>
              </Grid>
            </Grid>
            <Button variant="contained" color="primary" onClick={handleSave} size="small">Save</Button>
          </SettingsCard>

          <SettingsCard>
            <SectionTitle>
              <NotificationsIcon /> Notification Settings
              <Tooltip title="Configure your notification preferences">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onChange={handleChange(setNotificationSettings)}
                  name="emailNotifications"
                  size="small"
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
                  size="small"
                />
              }
              label="Push Notifications"
            />
          </SettingsCard>

          <SettingsCard>
            <SectionTitle>
              <PersonIcon /> Language, Time & Currency Settings
              <Tooltip title="Manage your language, time zone, and currency settings">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            {['language', 'timeZone', 'currency'].map((field, index) => (
              <CustomFormControl fullWidth key={index}>
                <InputLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</InputLabel>
                <Select
                  name={field}
                  value={accountSettings[field]}
                  onChange={handleChange(setAccountSettings)}
                  size="small"
                >
                  {field === 'language' && ['english', 'spanish', 'french', 'german', 'chinese'].map((lang) => (
                    <MenuItem key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</MenuItem>
                  ))}
                  {field === 'timeZone' && ['PST', 'MST', 'CST', 'EST', 'GMT'].map((tz) => (
                    <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                  ))}
                  {field === 'currency' && ['USD', 'EUR', 'GBP', 'JPY', 'CNY'].map((curr) => (
                    <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                  ))}
                </Select>
              </CustomFormControl>
            ))}
            <Button variant="contained" color="primary" onClick={handleSave} size="small">Save</Button>
          </SettingsCard>
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <SettingsCard>
            <SectionTitle>
              <PaletteIcon /> Theme
              <Tooltip title="Select your preferred theme">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <CustomFormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                name="theme"
                value={appearanceSettings.theme}
                onChange={handleChange(setAppearanceSettings)}
                size="small"
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </CustomFormControl>
          </SettingsCard>

          <SettingsCard>
            <SectionTitle>
              <TextFieldsIcon /> Font Size
              <Tooltip title="Select your preferred font size">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <CustomFormControl fullWidth>
              <InputLabel>Font Size</InputLabel>
              <Select
                name="fontSize"
                value={appearanceSettings.fontSize}
                onChange={handleChange(setAppearanceSettings)}
                size="small"
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </CustomFormControl>
            <Button variant="contained" color="primary" onClick={handleSave} size="small">Save</Button>
          </SettingsCard>
        </TabPanel>

        <TabPanel value={tabIndex} index={2}>
          <SettingsCard>
            <SectionTitle>
              <SecurityIcon /> Security Settings
              <Tooltip title="Manage your security settings">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <FormControlLabel
              control={
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onChange={handleChange(setSecuritySettings)}
                  name="twoFactorAuth"
                  size="small"
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
                  size="small"
                />
              }
              label="Login Alerts"
            />
          </SettingsCard>

          <SettingsCard>
            <SectionTitle>
              <LockIcon /> Change Password
              <Tooltip title="Update your password">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <Grid container spacing={2}>
              {['oldPassword', 'newPassword', 'confirmPassword'].map((field, index) => (
                <Grid item xs={12} key={index}>
                  <CustomFormControl fullWidth>
                    <TextField
                      label={field.replace(/([A-Z])/g, ' $1')}
                      type="password"
                      variant="outlined"
                      name={field}
                      value={securitySettings[field]}
                      onChange={handleChange(setSecuritySettings)}
                      size="small"
                      fullWidth
                    />
                  </CustomFormControl>
                </Grid>
              ))}
            </Grid>
            <Button variant="contained" color="primary" onClick={handleSave} size="small">Save</Button>
          </SettingsCard>
        </TabPanel>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default SettingsPage;
