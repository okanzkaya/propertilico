import React, { useState, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from 'react-query';
import PublicHeader from './components/public/Header';
import PublicFooter from './components/public/Footer';
import Sidebar from './components/app/Sidebar';
import ProtectedRoute from './components/public/ProtectedRoute';
import AuthenticatedRoute from './components/public/AuthenticatedRoute';
import { lightTheme, darkTheme } from './theme';
import { UserProvider, useUser } from './context/UserContext';

const queryClient = new QueryClient();

// Lazy load components
const Home = lazy(() => import('./pages/public/Home'));
const Features = lazy(() => import('./pages/public/Features'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const ToS = lazy(() => import('./pages/public/ToS'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const Pricing = lazy(() => import('./pages/public/Pricing'));
const BlogList = lazy(() => import('./pages/public/BlogList'));
const BlogPost = lazy(() => import('./pages/public/BlogPost'));
const SignIn = lazy(() => import('./pages/public/SignIn'));
const SignUp = lazy(() => import('./pages/public/SignUp'));
const MyPlan = lazy(() => import('./pages/public/MyPlan'));
const Dashboard = lazy(() => import('./pages/app/Overview'));
const Finances = lazy(() => import('./pages/app/Finances'));
const Properties = lazy(() => import('./pages/app/Properties'));
const Tickets = lazy(() => import('./pages/app/Tickets'));
const Contacts = lazy(() => import('./pages/app/Contacts'));
const Taxes = lazy(() => import('./pages/app/Taxes'));
const Documents = lazy(() => import('./pages/app/Documents'));
const Reports = lazy(() => import('./pages/app/Reports'));
const Settings = lazy(() => import('./pages/app/Settings'));
const Feedback = lazy(() => import('./pages/app/Feedback'));
const AdminFeedbackDashboard = lazy(() => import('./pages/app/AdminFeedbackDashboard'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const App = () => {
  const [themeMode, setThemeMode] = useState(() => ({
    app: localStorage.getItem('appTheme') || 'light',
    public: localStorage.getItem('publicTheme') || 'light'
  }));

  const toggleTheme = (key) => {
    setThemeMode(prev => {
      const newTheme = prev[key] === 'light' ? 'dark' : 'light';
      localStorage.setItem(`${key}Theme`, newTheme);
      return { ...prev, [key]: newTheme };
    });
  };

  const appTheme = useMemo(() => themeMode.app === 'light' ? lightTheme : darkTheme, [themeMode.app]);
  const publicTheme = useMemo(() => themeMode.public === 'light' ? lightTheme : darkTheme, [themeMode.public]);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <AppContent
            appTheme={appTheme}
            publicTheme={publicTheme}
            toggleTheme={toggleTheme}
            themeMode={themeMode}
          />
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
};

const AppContent = ({ appTheme, publicTheme, toggleTheme, themeMode }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><Home /></PublicLayout>} />
        <Route path="/features" element={<PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><Features /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><FAQ /></PublicLayout>} />
        <Route path="/tos" element={<PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><ToS /></PublicLayout>} />
        <Route path="/privacy-policy" element={<PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><PrivacyPolicy /></PublicLayout>} />
        <Route path="/pricing" element={<PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><Pricing /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><BlogList /></PublicLayout>} />
        <Route path="/blog/:id" element={<PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><BlogPost /></PublicLayout>} />
        <Route path="/signin" element={
          <AuthenticatedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><SignIn /></PublicLayout>
          </AuthenticatedRoute>
        } />
        <Route path="/get-started" element={
          <AuthenticatedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><SignUp /></PublicLayout>
          </AuthenticatedRoute>
        } />
        <Route path="/my-plan" element={
          <ProtectedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}><MyPlan /></PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/app/*" element={
          <ProtectedRoute>
            <AppLayout theme={appTheme} toggleTheme={() => toggleTheme('app')} themeMode={themeMode.app}>
              <Routes>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="finances" element={<Finances />} />
                <Route path="properties" element={<Properties />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="taxes" element={<Taxes />} />
                <Route path="documents" element={<Documents />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="feedback" element={<Feedback />} />
                <Route path="admin-feedback" element={user?.isAdmin ? <AdminFeedbackDashboard /> : <Navigate to="/app/dashboard" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const PublicLayout = React.memo(({ children, toggleTheme, theme }) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <PublicHeader toggleTheme={toggleTheme} />
    <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {children}
    </Box>
    <PublicFooter />
  </MuiThemeProvider>
));

const AppLayout = React.memo(({ children, toggleTheme, theme, themeMode }) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar themeMode={themeMode} toggleTheme={toggleTheme} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, mt: '64px', overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  </MuiThemeProvider>
));

export default App;