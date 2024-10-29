// App.js
import React, { useState, useMemo, lazy, Suspense, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress, GlobalStyles } from '@mui/material';
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

// Global styles to ensure consistent component sizing
const globalStyles = {
  '.MuiButton-root': {
    minHeight: '40px',
    minWidth: '120px',
    fontSize: '0.875rem',
    padding: '8px 16px',
  },
  '.action-button': {
    minHeight: '40px !important',
    minWidth: '120px !important',
    padding: '8px 16px !important',
    fontSize: '0.875rem !important',
    display: 'inline-flex !important',
    alignItems: 'center !important',
    justifyContent: 'center !important',
  },
  '.plan-card': {
    height: 'auto !important',
    minHeight: '600px !important',
    maxHeight: '800px !important',
    display: 'flex !important',
    flexDirection: 'column !important',
  },
  '.feature-list': {
    margin: '0 !important',
    padding: '0 !important',
    listStyle: 'none !important',
  },
  '.feature': {
    margin: '8px 0 !important',
    padding: '8px !important',
    display: 'flex !important',
    alignItems: 'center !important',
    gap: '8px !important',
  }
};

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

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  marginLeft: 0,
  marginTop: 60,
  padding: theme.spacing(3),
  position: 'relative',
  transition: 'all 0.3s ease',
  overflow: 'visible',
  width: 'calc(100% - 250px)',
  maxWidth: '100%',

  // Base styles for critical components
  '& .MuiButton-root': {
    minHeight: '40px',
    minWidth: '120px',
    fontSize: '0.875rem',
    padding: '8px 16px',
  },

  '& .action-button': {
    minHeight: '40px',
    padding: '8px 16px',
    fontSize: '0.875rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Plan card styles
  '& .plan-card': {
    height: 'auto',
    minHeight: '600px',
    maxHeight: '800px',
    display: 'flex',
    flexDirection: 'column',
  },

  // Feature list styles
  '& .feature-list': {
    margin: 0,
    padding: 0,
    '& .feature': {
      margin: '8px 0',
      padding: '8px',
      gap: '8px',
    }
  },

  // Subscription action styles
  '& .subscription-actions': {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px',
    
    '& .action-button': {
      margin: '4px',
      flex: 1,
    }
  },

  // Responsive styles
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
    padding: theme.spacing(2),
    marginTop: 65,
  },

  [theme.breakpoints.down('sm')]: {
    marginTop: 60,
    padding: theme.spacing(1),
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

// Route configurations (unchanged)
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
    // Remove any server-side generated styles
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }

    fetchUser();
    const timer = setTimeout(() => {
      setLayoutReady(true);
    }, 50);
    return () => clearTimeout(timer);
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
            <GlobalStyles styles={globalStyles} />
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