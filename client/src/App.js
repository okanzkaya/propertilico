import React, { useState, useMemo, lazy, Suspense, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import PublicHeader from './components/public/Header';
import PublicFooter from './components/public/Footer';
import Sidebar from './components/app/Sidebar';
import ProtectedRoute from './components/public/ProtectedRoute';
import AuthenticatedRoute from './components/public/AuthenticatedRoute';
import { lightTheme, darkTheme } from './theme';
import { useUser } from './context/UserContext';
import FontSizeWrapper from './components/app/FontSizeWrapper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Lazy load components
const lazyLoad = (path) => lazy(() => import(`./pages/${path}`));

const Home = lazyLoad('public/Home');
const Features = lazyLoad('public/Features');
const FAQ = lazyLoad('public/FAQ');
const ToS = lazyLoad('public/ToS');
const PrivacyPolicy = lazyLoad('public/PrivacyPolicy');
const Pricing = lazyLoad('public/Pricing');
const BlogList = lazyLoad('public/BlogList');
const BlogPost = lazyLoad('public/BlogPost');
const SignIn = lazyLoad('public/SignIn');
const SignUp = lazyLoad('public/SignUp');
const MyPlan = lazyLoad('public/MyPlan');
const Dashboard = lazyLoad('app/Overview');
const Finances = lazyLoad('app/Finances');
const Properties = lazyLoad('app/Properties');
const Tickets = lazyLoad('app/Tickets');
const Contacts = lazyLoad('app/Contacts');
const Taxes = lazyLoad('app/Taxes');
const Documents = lazyLoad('app/Documents');
const Reports = lazyLoad('app/Reports');
const Settings = lazyLoad('app/Settings');
const Feedback = lazyLoad('app/Feedback');
const AdminFeedbackDashboard = lazyLoad('app/AdminFeedbackDashboard');

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const App = () => {
  const { user, updateUserSettings, fetchUser } = useUser();
  const [themeMode, setThemeMode] = useState(() => ({
    app: user?.theme || localStorage.getItem('appTheme') || 'light',
    public: localStorage.getItem('publicTheme') || 'light'
  }));
  const [fontSize, setFontSize] = useState(() => user?.fontSize || localStorage.getItem('fontSize') || 'medium');

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.theme) {
      setThemeMode(prev => ({ ...prev, app: user.theme }));
    }
    if (user?.fontSize) {
      setFontSize(user.fontSize);
    }
  }, [user?.theme, user?.fontSize]);

  const toggleTheme = useCallback((key) => {
    setThemeMode(prev => {
      const newTheme = prev[key] === 'light' ? 'dark' : 'light';
      localStorage.setItem(`${key}Theme`, newTheme);
      if (key === 'app') {
        updateUserSettings({ theme: newTheme });
      }
      return { ...prev, [key]: newTheme };
    });
  }, [updateUserSettings]);

  const changeFontSize = useCallback((newSize) => {
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize);
    updateUserSettings({ fontSize: newSize });
  }, [updateUserSettings]);

  const appTheme = useMemo(() => themeMode.app === 'light' ? lightTheme : darkTheme, [themeMode.app]);
  const publicTheme = useMemo(() => themeMode.public === 'light' ? lightTheme : darkTheme, [themeMode.public]);

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleReCaptchaProvider
        reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
        scriptProps={{
          async: false,
          defer: false,
          appendTo: 'head',
          nonce: undefined,
        }}
      >
        <BrowserRouter>
          <AppContent
            appTheme={appTheme}
            publicTheme={publicTheme}
            toggleTheme={toggleTheme}
            themeMode={themeMode}
            fontSize={fontSize}
            changeFontSize={changeFontSize}
          />
        </BrowserRouter>
      </GoogleReCaptchaProvider>
    </QueryClientProvider>
  );
};

const AppContent = ({ appTheme, publicTheme, toggleTheme, themeMode, fontSize, changeFontSize }) => {
  const { user, loading } = useUser();

  if (loading) return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {publicRoutes.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}>
              <Element />
            </PublicLayout>
          } />
        ))}
        <Route path="/signin" element={
          <AuthenticatedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}>
              <SignIn />
            </PublicLayout>
          </AuthenticatedRoute>
        } />
        <Route path="/get-started" element={
          <AuthenticatedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}>
              <SignUp />
            </PublicLayout>
          </AuthenticatedRoute>
        } />
        <Route path="/my-plan" element={
          <ProtectedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}>
              <MyPlan />
            </PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/app/*" element={
          <ProtectedRoute>
            <FontSizeWrapper fontSize={fontSize}>
              <AppLayout
                theme={appTheme}
                toggleTheme={() => toggleTheme('app')}
                themeMode={themeMode.app}
                fontSize={fontSize}
                changeFontSize={changeFontSize}
              >
                <Routes>
                  <Route index element={<Navigate to="/app/dashboard" replace />} />
                  {appRoutes.map(({ path, element: Element }) => (
                    <Route key={path} path={path} element={
                      <Element
                        toggleTheme={() => toggleTheme('app')}
                        fontSize={fontSize}
                        changeFontSize={changeFontSize}
                        themeMode={themeMode.app}
                      />
                    } />
                  ))}
                  <Route path="admin-feedback" element={user?.isAdmin ? <AdminFeedbackDashboard /> : <Navigate to="/app/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </FontSizeWrapper>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const PublicLayout = React.memo(({ children, toggleTheme, theme }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <PublicHeader toggleTheme={toggleTheme} />
    <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {children}
    </Box>
    <PublicFooter />
  </ThemeProvider>
));

const AppLayout = React.memo(({ children, toggleTheme, theme, themeMode, fontSize, changeFontSize }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar themeMode={themeMode} toggleTheme={toggleTheme} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, mt: '64px', overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  </ThemeProvider>
));

const publicRoutes = [
  { path: "/", element: Home },
  { path: "/features", element: Features },
  { path: "/faq", element: FAQ },
  { path: "/tos", element: ToS },
  { path: "/privacy-policy", element: PrivacyPolicy },
  { path: "/pricing", element: Pricing },
  { path: "/blog", element: BlogList },
  { path: "/blog/:id", element: BlogPost },
];

const appRoutes = [
  { path: "dashboard", element: Dashboard },
  { path: "finances", element: Finances },
  { path: "properties", element: Properties },
  { path: "tickets", element: Tickets },
  { path: "contacts", element: Contacts },
  { path: "taxes", element: Taxes },
  { path: "documents", element: Documents },
  { path: "reports", element: Reports },
  { path: "settings", element: Settings },
  { path: "feedback", element: Feedback },
];

export default App;