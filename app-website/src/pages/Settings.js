import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  Button,
  Switch,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Avatar,
  Tooltip,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/system';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EmailIcon from '@mui/icons-material/Email';

const PageWrapper = styled(Box)({
  padding: '2rem',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
});

const SettingsCard = styled(Card)({
  padding: '2rem',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
});

const SectionTitle = styled(Typography)({
  marginBottom: '1.5rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

const CustomFormControl = styled(FormControl)({
  marginBottom: '1.5rem',
});

const InputLabelStyled = styled(InputLabel)({
  marginBottom: '0.5rem',
});

const CustomButton = styled(Button)({
  marginTop: '1rem',
});

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

const SettingsPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
  });
  const [accountSettings, setAccountSettings] = useState({
    username: '',
    email: '',
    password: '',
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
  });
  const [integrationSettings, setIntegrationSettings] = useState({
    googleSync: false,
    dropboxSync: false,
  });
  const [inviteTenantEmail, setInviteTenantEmail] = useState('');

  const handleChange = (setter) => (event) => {
    setter((prev) => ({ ...prev, [event.target.name]: event.target.value || event.target.checked }));
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setAccountSettings((prev) => ({ ...prev, profilePicture: reader.result }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleInviteTenant = () => {
    alert(`Invite sent to ${inviteTenantEmail}`);
    setInviteTenantEmail('');
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
        <Tab label="User Preferences" id="tab-0" aria-controls="tabpanel-0" />
        <Tab label="Notifications" id="tab-1" aria-controls="tabpanel-1" />
        <Tab label="Appearance" id="tab-2" aria-controls="tabpanel-2" />
        <Tab label="Security" id="tab-3" aria-controls="tabpanel-3" />
        <Tab label="Integrations" id="tab-4" aria-controls="tabpanel-4" />
        <Tab label="Language" id="tab-5" aria-controls="tabpanel-5" />
        <Tab label="Time Zone" id="tab-6" aria-controls="tabpanel-6" />
        <Tab label="Currency" id="tab-7" aria-controls="tabpanel-7" />
        <Tab label="Invite Tenant" id="tab-8" aria-controls="tabpanel-8" />
        <Tab label="Account Deletion" id="tab-9" aria-controls="tabpanel-9" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <SettingsCard>
          <SectionTitle variant="h6">
            <Tooltip title="User Preferences">
              <Avatar>
                <PersonIcon />
              </Avatar>
            </Tooltip>
            User Preferences
          </SectionTitle>
          <Divider />
          <CustomFormControl fullWidth>
            <InputLabelStyled shrink>Username</InputLabelStyled>
            <TextField
              variant="outlined"
              name="username"
              value={accountSettings.username}
              onChange={handleChange(setAccountSettings)}
            />
          </CustomFormControl>
          <CustomFormControl fullWidth>
            <InputLabelStyled shrink>Email</InputLabelStyled>
            <TextField
              variant="outlined"
              name="email"
              value={accountSettings.email}
              onChange={handleChange(setAccountSettings)}
            />
          </CustomFormControl>
          <CustomFormControl fullWidth>
            <InputLabelStyled shrink>Password</InputLabelStyled>
            <TextField
              type="password"
              variant="outlined"
              name="password"
              value={accountSettings.password}
              onChange={handleChange(setAccountSettings)}
            />
          </CustomFormControl>
          <CustomFormControl fullWidth>
            <Button variant="contained" component="label">
              Upload Profile Picture
              <input
                type="file"
                hidden
                onChange={handleProfilePictureChange}
              />
            </Button>
            {accountSettings.profilePicture && (
              <Avatar
                src={accountSettings.profilePicture}
                alt="Profile Picture"
                sx={{ width: 56, height: 56, mt: 2 }}
              />
            )}
          </CustomFormControl>
        </SettingsCard>
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <SettingsCard>
          <SectionTitle variant="h6">
            <Tooltip title="Notification Settings">
              <Avatar>
                <NotificationsIcon />
              </Avatar>
            </Tooltip>
            Notification Settings
          </SectionTitle>
          <Divider />
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
        </SettingsCard>
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        <SettingsCard>
          <SectionTitle variant="h6">
            <Tooltip title="Appearance Settings">
              <Avatar>
                <PersonIcon />
              </Avatar>
            </Tooltip>
            Appearance Settings
          </SectionTitle>
          <Divider />
          <CustomFormControl fullWidth>
            <InputLabelStyled shrink>Theme</InputLabelStyled>
            <Select
              name="theme"
              value={appearanceSettings.theme}
              onChange={handleChange(setAppearanceSettings)}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </CustomFormControl>
          <CustomFormControl fullWidth>
            <InputLabelStyled shrink>Font Size</InputLabelStyled>
            <Select
              name="fontSize"
              value={appearanceSettings.fontSize}
              onChange={handleChange(setAppearanceSettings)}
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </CustomFormControl>
        </SettingsCard>
      </TabPanel>

      <TabPanel value={tabIndex} index={3}>
        <SettingsCard>
          <SectionTitle variant="h6">
            <Tooltip title="Security Settings">
              <Avatar>
                <SecurityIcon />
              </Avatar>
            </Tooltip>
            Security Settings
          </SectionTitle>
          <Divider />
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
        </SettingsCard>
      </TabPanel>

      <TabPanel value={tabIndex} index={4}>
        <SettingsCard>
          <SectionTitle variant="h6">
            <Tooltip title="Integration Settings">
              <Avatar>
                <IntegrationInstructionsIcon />
              </Avatar>
            </Tooltip>
            Integration Settings
          </SectionTitle>
          <Divider />
          <FormControlLabel
            control={
              <Switch
                checked={integrationSettings.googleSync}
                onChange={handleChange(setIntegrationSettings)}
                name="googleSync"
              />
            }
            label="Sync with Google"
          />
          <FormControlLabel
            control={
              <Switch
                checked={integrationSettings.dropboxSync}
                onChange={handleChange(setIntegrationSettings)}
                name="dropboxSync"
              />
            }
            label="Sync with Dropbox"
          />
        </SettingsCard>
      </TabPanel>

      <TabPanel value={tabIndex} index={5}>
        <SettingsCard>
          <SectionTitle variant="h6">
            <Tooltip title="Language Settings">
              <Avatar>
                <LanguageIcon />
              </Avatar>
            </Tooltip>
            Language Settings
          </SectionTitle>
          <Divider />
          <CustomFormControl fullWidth>
            <InputLabelStyled shrink>Language</InputLabelStyled>
            <Select
              name="language"
              value={accountSettings.language}
              onChange={handleChange(setAccountSettings)}
            >
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="spanish">Spanish</MenuItem>
              <MenuItem value="french">French</MenuItem>
              <MenuItem value="german">German</MenuItem>
              <MenuItem value="chinese">Chinese</MenuItem>
            </Select>
          </CustomFormControl>
        </SettingsCard>
      </TabPanel>

      <TabPanel value={tabIndex} index={6}>
        <SettingsCard>
          <SectionTitle variant="h6">
            <Tooltip title="Time Zone Settings">
              <Avatar>
                <AccessTimeIcon />
              </Avatar>
            </Tooltip>
            Time Zone Settings
          </SectionTitle>
          <Divider />
          <CustomFormControl fullWidth>
            <InputLabelStyled shrink>Time Zone</InputLabelStyled>
            <Select
              name="timeZone"
              value={accountSettings.timeZone}
              onChange={handleChange(setAccountSettings)}
            >
              <MenuItem value="PST">PST (Pacific Standard Time)</MenuItem>
              <MenuItem value="MST">MST (Mountain Standard Time)</MenuItem>
              <MenuItem value="CST">CST (Central Standard Time)</MenuItem>
              <MenuItem value="EST">EST (Eastern Standard Time)</MenuItem>
              <MenuItem value="GMT">GMT (Greenwich Mean Time)</MenuItem>
            </Select>
          </CustomFormControl>
        </SettingsCard>
      </TabPanel>

      <TabPanel value={tabIndex} index={7}>
        <SettingsCard>
          <SectionTitle variant="h6">
            <Tooltip title="Currency Settings">
              <Avatar>
                <AttachMoneyIcon />
              </Avatar>
            </Tooltip>
            Currency Settings
          </SectionTitle>
          <Divider />
          <CustomFormControl fullWidth>
            <InputLabelStyled shrink>Currency</InputLabelStyled>
            <Select
              name="currency"
              value={accountSettings.currency}
              onChange={handleChange(setAccountSettings)}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              <MenuItem value="JPY">JPY</MenuItem>
              <MenuItem value="CNY">CNY</MenuItem>
            </Select>
          </CustomFormControl>
        </SettingsCard>
      </TabPanel>

      <TabPanel value={tabIndex} index={8}>
        <SettingsCard>
          <SectionTitle variant="h6">
            <Tooltip title="Invite Tenant">
              <Avatar>
                <GroupAddIcon />
              </Avatar>
            </Tooltip>
            Invite Tenant
          </SectionTitle>
          <Divider />
          <CustomFormControl fullWidth>
            <InputLabelStyled shrink>Tenant Email</InputLabelStyled>
            <TextField
              variant="outlined"
              name="inviteTenantEmail"
              value={inviteTenantEmail}
              onChange={(e) => setInviteTenantEmail(e.target.value)}
            />
          </CustomFormControl>
          <CustomButton
            variant="contained"
            color="primary"
            onClick={handleInviteTenant}
            startIcon={<EmailIcon />}
          >
            Send Invite
          </CustomButton>
        </SettingsCard>
      </TabPanel>

      <TabPanel value={tabIndex} index={9}>
        <SettingsCard>
          <SectionTitle variant="h6">
            <Tooltip title="Account Deletion">
              <Avatar>
                <PersonIcon />
              </Avatar>
            </Tooltip>
            Account Deletion
          </SectionTitle>
          <Divider />
          <CustomFormControl fullWidth>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => alert('Your account has been deleted.')}
            >
              Delete Account
            </Button>
          </CustomFormControl>
        </SettingsCard>
      </TabPanel>
    </PageWrapper>
  );
};

export default SettingsPage;
