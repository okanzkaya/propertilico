// App.js
import React, { useState, useMemo, lazy, Suspense, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ErrorBoundary } from 'react-error-boundary';
import PublicHeader from './components/public/Header';
import PublicFooter from './components/public/Footer';
import Sidebar from './components/app/Sidebar';
import ProtectedRoute from './components/public/ProtectedRoute';
import AuthenticatedRoute from './components/public/AuthenticatedRoute';
import { createAppTheme } from './theme';
import { useUser } from './context/UserContext';
import FontSizeWrapper from './components/app/FontSizeWrapper';
import './App.css';

const LayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  '&.ready': {
    opacity: 1
  },
  backgroundColor: theme.palette.background.default
}));

// Update the MainContent styled component in App.js:
// Update the MainContent styled component in App.js:
const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  marginLeft: 0, // Left gap from sidebar
  marginTop: 60, // Top gap
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(3),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  position: 'relative',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  width: 'calc(100% - 250px)', // Take full width minus sidebar
  maxWidth: '100%', // Allow full width

  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginTop: 65,
  },

  [theme.breakpoints.down('sm')]: {
    marginTop: 60,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  }
}));
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const lazyLoad = (path) => lazy(() => import(`./pages/${path}`));

// Your existing route configurations remain the same
const publicRoutes = [
  { path: "/", element: lazyLoad('public/Home') },
  { path: "/features", element: lazyLoad('public/Features') },
  { path: "/faq", element: lazyLoad('public/FAQ') },
  { path: "/tos", element: lazyLoad('public/ToS') },
  { path: "/privacy-policy", element: lazyLoad('public/PrivacyPolicy') },
  { path: "/pricing", element: lazyLoad('public/Pricing') },
  { path: "/blog", element: lazyLoad('public/BlogList') },
  { path: "/blog/:id", element: lazyLoad('public/BlogPost') },
];

const appRoutes = [
  { path: "dashboard", element: lazyLoad('app/Overview') },
  { path: "finances", element: lazyLoad('app/Finances') },
  { path: "properties", element: lazyLoad('app/Properties') },
  { path: "tickets", element: lazyLoad('app/Tickets') },
  { path: "contacts", element: lazyLoad('app/Contacts') },
  { path: "taxes", element: lazyLoad('app/Taxes') },
  { path: "documents", element: lazyLoad('app/Documents') },
  { path: "reports", element: lazyLoad('app/Reports') },
  { path: "settings", element: lazyLoad('app/Settings') },
  { path: "feedback", element: lazyLoad('app/Feedback') },
];

const SignIn = lazyLoad('public/SignIn');
const SignUp = lazyLoad('public/SignUp');
const MyPlan = lazyLoad('public/MyPlan');
const AdminFeedbackDashboard = lazyLoad('app/AdminFeedbackDashboard');
const BlogEditor = lazyLoad('public/BlogEditor');

const LoadingFallback = () => (
  <Box className="loading-fallback">
    <CircularProgress />
  </Box>
);

const ErrorFallback = ({ error }) => (
  <Box className="error-fallback">
    <h1>Oops! Something went wrong.</h1>
    <pre>{error.message}</pre>
  </Box>
);

const App = () => {
  const { user, loading: userLoading, updateUserSettings, fetchUser, setShowReCaptcha } = useUser();
  const [layoutReady, setLayoutReady] = useState(false);
  const [themeMode, setThemeMode] = useState(() => ({
    app: user?.theme || localStorage.getItem('appTheme') || 'light',
    public: localStorage.getItem('publicTheme') || 'light'
  }));
  const [fontSize, setFontSize] = useState(() => user?.fontSize || localStorage.getItem('fontSize') || 'medium');

  useEffect(() => {
    fetchUser();
    const timer = requestAnimationFrame(() => {
      setLayoutReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, [fetchUser]);

  useEffect(() => {
    if (user?.theme) setThemeMode(prev => ({ ...prev, app: user.theme }));
    if (user?.fontSize) setFontSize(user.fontSize);
  }, [user?.theme, user?.fontSize]);

  const toggleTheme = useCallback((key) => {
    setThemeMode(prev => {
      const newTheme = prev[key] === 'light' ? 'dark' : 'light';
      localStorage.setItem(`${key}Theme`, newTheme);
      if (key === 'app') updateUserSettings({ theme: newTheme });
      return { ...prev, [key]: newTheme };
    });
  }, [updateUserSettings]);

  const changeFontSize = useCallback((newSize) => {
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize);
    updateUserSettings({ fontSize: newSize });
  }, [updateUserSettings]);

  const appTheme = useMemo(() =>
    createAppTheme(themeMode.app, fontSize),
    [themeMode.app, fontSize]
  );
  const publicTheme = useMemo(() =>
    createAppTheme(themeMode.public, 'medium'),
    [themeMode.public]
  );

  if (userLoading || !layoutReady) return <LoadingFallback />;

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          useEnterprise={false}
          scriptProps={{
            async: true,
            defer: true,
            appendTo: 'head',
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
              user={user}
              setShowReCaptcha={setShowReCaptcha}
            />
          </BrowserRouter>
        </GoogleReCaptchaProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

const AppContent = React.memo(({ appTheme, publicTheme, toggleTheme, themeMode, fontSize, changeFontSize, user, setShowReCaptcha }) => {
  const hasActiveSubscription = useMemo(() => user?.hasActiveSubscription || false, [user]);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setContentReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!contentReady) return null;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {publicRoutes.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')} showReCaptcha={false}>
              <Element />
            </PublicLayout>
          } />
        ))}
        <Route path="/signin" element={
          <AuthenticatedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')} showReCaptcha={true}>
              <SignIn />
            </PublicLayout>
          </AuthenticatedRoute>
        } />
        <Route path="/get-started" element={
          <AuthenticatedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')} showReCaptcha={true}>
              <SignUp />
            </PublicLayout>
          </AuthenticatedRoute>
        } />
        <Route path="/my-plan" element={
          <ProtectedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')} showReCaptcha={false}>
              <MyPlan />
            </PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/create-blog" element={
          <ProtectedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')} showReCaptcha={false}>
              <BlogEditor />
            </PublicLayout>
          </ProtectedRoute>
        } />
        <Route path="/edit-blog/:id" element={
          <ProtectedRoute>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')} showReCaptcha={false}>
              <BlogEditor />
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
                showReCaptcha={false}
              >
                <Routes>
                  <Route index element={<Navigate to="/app/dashboard" replace />} />
                  {appRoutes.map(({ path, element: Element }) => (
                    <Route key={path} path={path} element={
                      hasActiveSubscription ? (
                        <Element
                          toggleTheme={() => toggleTheme('app')}
                          fontSize={fontSize}
                          changeFontSize={changeFontSize}
                          themeMode={themeMode.app}
                        />
                      ) : (
                        <Navigate to="/my-plan" replace />
                      )
                    } />
                  ))}
                  <Route path="admin-feedback" element={user?.isAdmin ? <AdminFeedbackDashboard /> : <Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </FontSizeWrapper>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
});

const PublicLayout = React.memo(({ children, toggleTheme, theme, showReCaptcha }) => {
  const { setShowReCaptcha } = useUser();
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setLayoutReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    setShowReCaptcha(showReCaptcha);
  }, [showReCaptcha, setShowReCaptcha]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={`public-layout ${layoutReady ? 'ready' : ''}`}>
        <PublicHeader toggleTheme={toggleTheme} />
        <Box component="main" className="public-main">
          {children}
        </Box>
        <PublicFooter />
      </Box>
      {!showReCaptcha && (
        <style>{`
          .grecaptcha-badge { visibility: hidden !important; }
        `}</style>
      )}
    </ThemeProvider>
  );
});

const AppLayout = React.memo(({ children, toggleTheme, theme, themeMode, fontSize, showReCaptcha }) => {
  const { setShowReCaptcha } = useUser();
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setLayoutReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    setShowReCaptcha(showReCaptcha);
  }, [showReCaptcha, setShowReCaptcha]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LayoutRoot className={layoutReady ? 'ready' : ''}>
        <Sidebar themeMode={themeMode} toggleTheme={toggleTheme} />
        <MainContent component="main">
          <FontSizeWrapper fontSize={fontSize}>
            {children}
          </FontSizeWrapper>
        </MainContent>
      </LayoutRoot>
      {!showReCaptcha && (
        <style>{`
          .grecaptcha-badge { visibility: hidden !important; }
        `}</style>
      )}
    </ThemeProvider>
  );
});

export default App;