import React, { useState, lazy, Suspense, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, useMediaQuery } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import PropTypes from 'prop-types';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ErrorBoundary } from 'react-error-boundary';
import PublicHeader from './components/public/Header';
import PublicFooter from './components/public/Footer';
import Sidebar from './components/app/Sidebar';
import TopBar from './components/app/TopBar';
import ProtectedRoute from './components/public/ProtectedRoute';
import AuthenticatedRoute from './components/public/AuthenticatedRoute';
import { useTheme } from './theme';
import { useUser } from './context/UserContext';
import FontSizeWrapper from './components/app/FontSizeWrapper';
import styles from './Layout.module.css';

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnMount: true,
      suspense: false,
    },
    mutations: {
      retry: 1,
      useErrorBoundary: true,
    },
  },
});

// Optimized lazy loading with prefetch
const lazyLoad = (path, prefetch = false) => {
  const Component = lazy(() => {
    const promise = import(`./pages/${path}`).catch(error => {
      console.error(`Error loading component: ${path}`, error);
      return { default: () => <div>Error loading component</div> };
    });
    
    if (prefetch) {
      // Prefetch related chunks in the background
      Promise.resolve().then(() => {
        import(`./pages/${path}`).catch(() => {});
      });
    }
    
    return promise;
  });
  
  return Component;
};

// Memoized route configurations
const publicRoutes = [
  { path: "/", element: lazyLoad('public/Home', true), prefetch: true },
  { path: "/features", element: lazyLoad('public/Features') },
  { path: "/faq", element: lazyLoad('public/FAQ') },
  { path: "/tos", element: lazyLoad('public/ToS') },
  { path: "/privacy-policy", element: lazyLoad('public/PrivacyPolicy') },
  { path: "/pricing", element: lazyLoad('public/Pricing', true), prefetch: true },
  { path: "/blog", element: lazyLoad('public/BlogList') },
  { path: "/blog/:id", element: lazyLoad('public/BlogPost') },
];

const appRoutes = [
  { 
    path: "dashboard", 
    element: lazyLoad('app/Overview', true),
    prefetch: true,
    requiresSubscription: true 
  },
  { 
    path: "finances", 
    element: lazyLoad('app/Finances'),
    requiresSubscription: true 
  },
  { 
    path: "properties", 
    element: lazyLoad('app/Properties'),
    requiresSubscription: true 
  },
  { 
    path: "tickets", 
    element: lazyLoad('app/Tickets'),
    requiresSubscription: true 
  },
  { 
    path: "contacts", 
    element: lazyLoad('app/Contacts'),
    requiresSubscription: true 
  },
  { 
    path: "taxes", 
    element: lazyLoad('app/Taxes'),
    requiresSubscription: true 
  },
  { 
    path: "documents", 
    element: lazyLoad('app/Documents'),
    requiresSubscription: true 
  },
  { 
    path: "reports", 
    element: lazyLoad('app/Reports'),
    requiresSubscription: true 
  },
  { 
    path: "settings", 
    element: lazyLoad('app/Settings') 
  },
  { 
    path: "feedback", 
    element: lazyLoad('app/Feedback') 
  },
];

// Pre-loaded authentication routes
const SignIn = lazyLoad('public/SignIn', true);
const SignUp = lazyLoad('public/SignUp', true);
const MyPlan = lazyLoad('public/MyPlan');
const AdminFeedbackDashboard = lazyLoad('app/AdminFeedbackDashboard');
const BlogEditor = lazyLoad('public/BlogEditor');

// Optimized loading component
const LoadingFallback = React.memo(() => (
  <Box className={styles.loadingFallback}>
    <CircularProgress size={40} thickness={4} />
  </Box>
));

// Optimized error component
const ErrorFallback = React.memo(({ error, resetErrorBoundary }) => (
  <Box className={styles.errorFallback}>
    <h1>Something went wrong</h1>
    <pre>{error.message}</pre>
    <button
      onClick={resetErrorBoundary}
      className={styles.retryButton}
      style={{
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        backgroundColor: 'var(--primary-main)',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Try again
    </button>
  </Box>
));

ErrorFallback.propTypes = {
  error: PropTypes.object.isRequired,
  resetErrorBoundary: PropTypes.func.isRequired,
};

// Optimized PublicLayout component
const PublicLayout = React.memo(({ children, theme, showReCaptcha }) => {
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setLayoutReady(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={`${styles.publicLayout} ${layoutReady ? styles.ready : ''}`}>
        <PublicHeader />
        <Box component="main" className={styles.publicMain}>
          {children}
        </Box>
        <PublicFooter />
      </Box>
      {!showReCaptcha && (
        <style>{`
          .grecaptcha-badge { visibility: hidden !important; }
        `}</style>
      )}
    </MuiThemeProvider>
  );
});

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
  theme: PropTypes.object.isRequired,
  showReCaptcha: PropTypes.bool,
};

// Optimized AppLayout component
const AppLayout = React.memo(({ children, toggleTheme, theme, muiTheme, fontSize, isMobile }) => {
  const [layoutReady, setLayoutReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const notifications = useMemo(() => [
    { id: 1, type: 'success', message: 'Payment received for Property A', date: new Date() },
    { id: 2, type: 'warning', message: 'Maintenance request for Property B', date: new Date(Date.now() - 86400000) },
    { id: 3, type: 'error', message: 'Failed to process rent for Tenant C', date: new Date(Date.now() - 172800000) },
  ], []);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setLayoutReady(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleDropdownChange = useCallback((isOpen) => {
    setDropdownOpen(isOpen);
  }, []);

  const handleOverlayClick = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <div className={`${styles.layoutRoot} ${layoutReady ? styles.ready : ''}`}>
        <div className={styles.topBarContainer}>
          <TopBar
            themeMode={theme}
            toggleTheme={toggleTheme}
            toggleDrawer={toggleSidebar}
            isMobile={isMobile}
            notifications={notifications}
            onDropdownChange={handleDropdownChange}
          />
        </div>
        
        <div className={styles.mainWrapper}>
          <div className={styles.sidebarContainer}>
            <Sidebar 
              isOpen={sidebarOpen}
              isMobile={isMobile}
              onClose={handleSidebarClose}
            />
          </div>
          
          <main className={styles.mainContent}>
            <FontSizeWrapper fontSize={fontSize}>
              {children}
            </FontSizeWrapper>
          </main>
        </div>

        {dropdownOpen && (
          <div 
            className={styles.overlay}
            onClick={handleOverlayClick}
          />
        )}
      </div>
    </MuiThemeProvider>
  );
});

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  muiTheme: PropTypes.object.isRequired,
  fontSize: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

// Main App component
const App = () => {
  const { publicTheme, muiTheme, theme, toggleTheme } = useTheme();
  const { user, loading: userLoading, isInitialized, fetchUser } = useUser();
  const [layoutReady, setLayoutReady] = useState(false);
  const isMobile = useMediaQuery('(max-width:960px)');
  
  const [fontSize, setFontSize] = useState(() => 
    user?.fontSize || localStorage.getItem('fontSize') || 'medium'
  );

  // Cleanup and initialization
  useEffect(() => {
    const cleanupStyles = () => {
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles?.parentElement) {
        jssStyles.parentElement.removeChild(jssStyles);
      }
    };

    cleanupStyles();
    if (!isInitialized) {
      fetchUser();
    }
    
    const timer = setTimeout(() => setLayoutReady(true), 50);
    return () => clearTimeout(timer);
  }, [fetchUser, isInitialized]);

  // Font size synchronization
  useEffect(() => {
    if (user?.fontSize) {
      setFontSize(user.fontSize);
      localStorage.setItem('fontSize', user.fontSize);
    }
  }, [user?.fontSize]);

  const changeFontSize = useCallback((newSize) => {
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize);
  }, []);

  if (userLoading || !layoutReady) {
    return <LoadingFallback />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
        resetKeys={[user]}
      >
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          useEnterprise={false}
          scriptProps={{
            async: true,
            defer: true,
            appendTo: 'head',
            nonce: process.env.REACT_APP_CSP_NONCE,
          }}
        >
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                {publicRoutes.map(({ path, element: Element }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <PublicLayout theme={publicTheme}>
                        <Element />
                      </PublicLayout>
                    }
                  />
                ))}

                {/* Auth Routes */}
                <Route
                  path="/signin"
                  element={
                    <AuthenticatedRoute>
                      <PublicLayout theme={publicTheme} showReCaptcha>
                        <SignIn />
                      </PublicLayout>
                    </AuthenticatedRoute>
                  }
                />
                <Route
                  path="/get-started"
                  element={
                    <AuthenticatedRoute>
                      <PublicLayout theme={publicTheme} showReCaptcha>
                        <SignUp />
                      </PublicLayout>
                    </AuthenticatedRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/my-plan"
                  element={
                    <ProtectedRoute>
                      <PublicLayout theme={publicTheme}>
                        <MyPlan />
                      </PublicLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Blog Management Routes */}
                <Route
                  path="/create-blog"
                  element={
                    <ProtectedRoute adminOnly>
                      <PublicLayout theme={publicTheme}>
                        <BlogEditor />
                      </PublicLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-blog/:id"
                  element={
                    <ProtectedRoute adminOnly>
                      <PublicLayout theme={publicTheme}>
                        <BlogEditor />
                      </PublicLayout>
                    </ProtectedRoute>
                  }
                />

                {/* App Routes */}
                <Route
                  path="/app/*"
                  element={
                    <ProtectedRoute>
                      <FontSizeWrapper fontSize={fontSize}>
                        <AppLayout
                          theme={theme}
                          muiTheme={muiTheme}
                          toggleTheme={toggleTheme}
                          fontSize={fontSize}
                          changeFontSize={changeFontSize}
                          isMobile={isMobile}
                        >
                          <Routes>
                            <Route 
                              index 
                              element={<Navigate to="/app/dashboard" replace />} 
                            />
                            {appRoutes.map(({ path, element: Element, requiresSubscription }) => (
                              <Route
                                key={path}
                                path={path}
                                element={
                                  requiresSubscription && !user?.hasActiveSubscription ? (
                                    <Navigate to="/my-plan" replace />
                                  ) : (
                                    <Element
                                      toggleTheme={toggleTheme}
                                      fontSize={fontSize}
                                      changeFontSize={changeFontSize}
                                      theme={theme}
                                    />
                                  )
                                }
                              />
                            ))}
                            <Route
                              path="admin-feedback"
                              element={
                                user?.isAdmin ? (
                                  <AdminFeedbackDashboard />
                                ) : (
                                  <Navigate to="/" replace />
                                )
                              }
                            />
                          </Routes>
                        </AppLayout>
                      </FontSizeWrapper>
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </GoogleReCaptchaProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

// Performance optimization for production
if (process.env.NODE_ENV === 'production') {
  React.memo(App);
}

export default App;