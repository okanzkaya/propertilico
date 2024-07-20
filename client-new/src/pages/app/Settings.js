import React, { useState } from 'react';
import {
  Typography, Box, Card, Button, Switch, TextField, Select, MenuItem, FormControl, FormControlLabel, InputLabel, Avatar, Tooltip, Divider, Tabs, Tab, IconButton, Grid,
} from '@mui/material';
import { styled } from '@mui/system';
import {
  Notifications as NotificationsIcon, Security as SecurityIcon, IntegrationInstructions as IntegrationIcon, Person as PersonIcon, GroupAdd as GroupAddIcon, Info as InfoIcon, Email as EmailIcon, Title as TitleIcon,
} from '@mui/icons-material';

const PageWrapper = styled(Box)({
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'flex-start', // Align items to the left
});

const ContentWrapper = styled(Box)({
  width: '100%',
  maxWidth: '800px', // Set a max width for the content
});

const SettingsCard = styled(Card)({
  padding: '1.5rem',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  marginBottom: '1.5rem',
});

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
  fontSize: '1rem',
});

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
    {value === index && <Box p={3}>{children}</Box>}
  </div>
);

const UploadAvatar = styled(Box)({
  position: 'relative',
  display: 'inline-block',
  cursor: 'pointer',
  '& input': {
    display: 'none',
  },
  '&:hover .overlay': {
    opacity: 1,
  },
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

const SettingsPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({ emailNotifications: true, pushNotifications: true });
  const [accountSettings, setAccountSettings] = useState({ username: '', email: '', profilePicture: '', language: 'english', timeZone: 'GMT', currency: 'USD' });
  const [appearanceSettings, setAppearanceSettings] = useState({ theme: 'light', fontSize: 'medium' });
  const [securitySettings, setSecuritySettings] = useState({ twoFactorAuth: false, loginAlerts: true, oldPassword: '', newPassword: '', confirmPassword: '' });
  const [integrationSettings, setIntegrationSettings] = useState({ googleSync: false, dropboxSync: false });
  const [inviteTenantEmail, setInviteTenantEmail] = useState('');
  const [topBarTitle, setTopBarTitle] = useState('');

  const handleChange = (setter) => (event) => {
    setter((prev) => ({ ...prev, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setAccountSettings((prev) => ({ ...prev, profilePicture: reader.result }));
    if (file) reader.readAsDataURL(file);
  };

  const handleInviteTenant = () => {
    alert(`Invite sent to ${inviteTenantEmail}`);
    setInviteTenantEmail('');
  };

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  const handleSave = () => {
    // Implement save functionality here
    alert('Settings saved');
  };

  return (
    <PageWrapper>
      <ContentWrapper>
        <Typography variant="h4" gutterBottom>Settings</Typography>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tab label="User Preferences" icon={<PersonIcon />} />
          <Tab label="Appearance" icon={<PersonIcon />} />
          <Tab label="Security" icon={<SecurityIcon />} />
          <Tab label="Integrations" icon={<IntegrationIcon />} />
          <Tab label="Invite Tenant" icon={<GroupAddIcon />} />
        </Tabs>

        <TabPanel value={tabIndex} index={0}>
          <SettingsCard>
            <SectionTitle>
              <Tooltip title="User Preferences"><PersonIcon /></Tooltip>
              User Preferences
              <Tooltip title="Manage your personal preferences including username, email, and profile picture settings">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <Box display="flex" justifyContent="center" marginTop="1rem" marginBottom="1rem">
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
              <Tooltip title="Top Bar Title"><TitleIcon /></Tooltip>
              Top Bar Title
              <Tooltip title="Change the top bar title of the application">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <CustomFormControl fullWidth>
              <TextField
                label="Top Bar Title"
                variant="outlined"
                name="topBarTitle"
                value={topBarTitle}
                onChange={(e) => setTopBarTitle(e.target.value)}
                size="small"
                fullWidth
              />
            </CustomFormControl>
            <Button variant="contained" color="primary" onClick={handleSave} size="small">Save</Button>
          </SettingsCard>

          <SettingsCard>
            <SectionTitle>
              <Tooltip title="Notification Settings"><NotificationsIcon /></Tooltip>
              Notification Settings
              <Tooltip title="Configure your notification preferences for email and push notifications">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <FormControlLabel
              control={<Switch checked={notificationSettings.emailNotifications} onChange={handleChange(setNotificationSettings)} name="emailNotifications" size="small" />}
              label="Email Notifications"
            />
            <FormControlLabel
              control={<Switch checked={notificationSettings.pushNotifications} onChange={handleChange(setNotificationSettings)} name="pushNotifications" size="small" />}
              label="Push Notifications"
            />
          </SettingsCard>

          <SettingsCard>
            <SectionTitle>
              <Tooltip title="Language, Time & Currency Settings"><PersonIcon /></Tooltip>
              Language, Time & Currency Settings
              <Tooltip title="Manage your language, time zone, and currency settings">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <CustomFormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select name="language" value={accountSettings.language} onChange={handleChange(setAccountSettings)} size="small">
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="spanish">Spanish</MenuItem>
                <MenuItem value="french">French</MenuItem>
                <MenuItem value="german">German</MenuItem>
                <MenuItem value="chinese">Chinese</MenuItem>
              </Select>
            </CustomFormControl>
            <CustomFormControl fullWidth>
              <InputLabel>Time Zone</InputLabel>
              <Select name="timeZone" value={accountSettings.timeZone} onChange={handleChange(setAccountSettings)} size="small">
                <MenuItem value="PST">PST (Pacific Standard Time)</MenuItem>
                <MenuItem value="MST">MST (Mountain Standard Time)</MenuItem>
                <MenuItem value="CST">CST (Central Standard Time)</MenuItem>
                <MenuItem value="EST">EST (Eastern Standard Time)</MenuItem>
                <MenuItem value="GMT">GMT (Greenwich Mean Time)</MenuItem>
              </Select>
            </CustomFormControl>
            <CustomFormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select name="currency" value={accountSettings.currency} onChange={handleChange(setAccountSettings)} size="small">
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="JPY">JPY</MenuItem>
                <MenuItem value="CNY">CNY</MenuItem>
              </Select>
            </CustomFormControl>
            <Button variant="contained" color="primary" onClick={handleSave} size="small">Save</Button>
          </SettingsCard>
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <SettingsCard>
            <SectionTitle>
              <Tooltip title="Appearance Settings"><PersonIcon /></Tooltip>
              Appearance Settings
              <Tooltip title="Customize the appearance of the application, including theme and font size">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <CustomFormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select name="theme" value={appearanceSettings.theme} onChange={handleChange(setAppearanceSettings)} size="small">
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </CustomFormControl>
            <CustomFormControl fullWidth>
              <InputLabel>Font Size</InputLabel>
              <Select name="fontSize" value={appearanceSettings.fontSize} onChange={handleChange(setAppearanceSettings)} size="small">
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
              <Tooltip title="Security Settings"><SecurityIcon /></Tooltip>
              Security Settings
              <Tooltip title="Manage your security settings including two-factor authentication and login alerts">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <FormControlLabel
              control={<Switch checked={securitySettings.twoFactorAuth} onChange={handleChange(setSecuritySettings)} name="twoFactorAuth" size="small" />}
              label="Two-Factor Authentication"
            />
            <FormControlLabel
              control={<Switch checked={securitySettings.loginAlerts} onChange={handleChange(setSecuritySettings)} name="loginAlerts" size="small" />}
              label="Login Alerts"
            />
          </SettingsCard>
        </TabPanel>

        <TabPanel value={tabIndex} index={3}>
          <SettingsCard>
            <SectionTitle>
              <Tooltip title="Integration Settings"><IntegrationIcon /></Tooltip>
              Integration Settings
              <Tooltip title="Manage integration settings with external services such as Google and Dropbox">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <FormControlLabel
              control={<Switch checked={integrationSettings.googleSync} onChange={handleChange(setIntegrationSettings)} name="googleSync" size="small" />}
              label="Sync with Google"
            />
            <FormControlLabel
              control={<Switch checked={integrationSettings.dropboxSync} onChange={handleChange(setIntegrationSettings)} name="dropboxSync" size="small" />}
              label="Sync with Dropbox"
            />
          </SettingsCard>
        </TabPanel>

        <TabPanel value={tabIndex} index={4}>
          <SettingsCard>
            <SectionTitle>
              <Tooltip title="Invite Tenant"><GroupAddIcon /></Tooltip>
              Invite Tenant
              <Tooltip title="Invite a new tenant to your property management system via email">
                <IconButton><InfoIcon /></IconButton>
              </Tooltip>
            </SectionTitle>
            <Divider />
            <CustomFormControl fullWidth>
              <TextField
                label="Tenant Email"
                variant="outlined"
                name="inviteTenantEmail"
                value={inviteTenantEmail}
                onChange={(e) => setInviteTenantEmail(e.target.value)}
                size="small"
                fullWidth
              />
            </CustomFormControl>
            <Button variant="contained" color="primary" onClick={handleInviteTenant} size="small" startIcon={<EmailIcon />}>Send Invite</Button>
          </SettingsCard>
        </TabPanel>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default SettingsPage;
