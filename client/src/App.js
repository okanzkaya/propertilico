import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import PublicHeader from './components/public/Header';
import PublicFooter from './components/public/Footer';
import Sidebar from './components/app/Sidebar';
import Home from './pages/public/Home';
import Features from './pages/public/Features';
import FAQ from './pages/public/FAQ';
import ToS from './pages/public/ToS';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import Pricing from './pages/public/Pricing';
import BlogList from './pages/public/BlogList';
import BlogPost from './pages/public/BlogPost';
import SignIn from './pages/public/SignIn';
import SignUp from './pages/public/SignUp';
import MyPlan from './pages/public/MyPlan';
import ProtectedRoute from './components/public/ProtectedRoute';
import AuthenticatedRoute from './components/public/AuthenticatedRoute';
import Dashboard from './pages/app/Overview';
import Finances from './pages/app/Finances';
import Properties from './pages/app/Properties';
import Tickets from './pages/app/Tickets';
import Contacts from './pages/app/Contacts';
import Taxes from './pages/app/Taxes';
import Documents from './pages/app/Documents';
import Reports from './pages/app/Reports';
import Settings from './pages/app/Settings';
import Feedback from './pages/app/Feedback';
import { lightTheme, darkTheme } from './pages/app/theme';

const App = () => {
  const [appThemeMode, setAppThemeMode] = useState('light');
  const [publicThemeMode, setPublicThemeMode] = useState('light');

  useEffect(() => {
    const savedAppTheme = localStorage.getItem('appTheme');
    const savedPublicTheme = localStorage.getItem('publicTheme');
    if (savedAppTheme) {
      setAppThemeMode(savedAppTheme);
    }
    if (savedPublicTheme) {
      setPublicThemeMode(savedPublicTheme);
    }
  }, []);

  const toggleAppTheme = () => {
    const newTheme = appThemeMode === 'light' ? 'dark' : 'light';
    setAppThemeMode(newTheme);
    localStorage.setItem('appTheme', newTheme);
  };

  const togglePublicTheme = () => {
    const newTheme = publicThemeMode === 'light' ? 'dark' : 'light';
    setPublicThemeMode(newTheme);
    localStorage.setItem('publicTheme', newTheme);
  };

  const appTheme = appThemeMode === 'light' ? lightTheme : darkTheme;
  const publicTheme = publicThemeMode === 'light' ? lightTheme : darkTheme;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicLayout toggleTheme={togglePublicTheme} theme={publicTheme} />}>
          <Route index element={<Home />} />
          <Route path="features" element={<Features />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="tos" element={<ToS />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="blog/:id" element={<BlogPost />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="signin" element={<AuthenticatedRoute><SignIn /></AuthenticatedRoute>} />
          <Route path="get-started" element={<AuthenticatedRoute><SignUp /></AuthenticatedRoute>} />
          <Route path="my-plan" element={<MyPlan />} />
        </Route>

        <Route path="/app" element={<ProtectedRoute><AppLayout toggleTheme={toggleAppTheme} theme={appTheme} themeMode={appThemeMode} /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="finances" element={<Finances />} />
          <Route path="properties" element={<Properties />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="taxes" element={<Taxes />} />
          <Route path="documents" element={<Documents />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings toggleTheme={toggleAppTheme} />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </Router>
  );
};

const PublicLayout = ({ toggleTheme, theme }) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <PublicHeader toggleTheme={toggleTheme} />
    <div className="content">
      <Outlet />
    </div>
    <PublicFooter />
  </MuiThemeProvider>
);

const AppLayout = ({ toggleTheme, theme, themeMode }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', padding: { xs: '0px', sm: '4px' } }}>
        <Sidebar themeMode={themeMode} toggleTheme={toggleTheme} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 0, sm: 1 },
            mt: '64px',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </MuiThemeProvider>
  );
};

export default App;
