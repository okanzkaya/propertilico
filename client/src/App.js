import React, { useState, useMemo, lazy, Suspense, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ErrorBoundary } from 'react-error-boundary';
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
      staleTime: 5 * 60 * 1000,
    },
  },
});

const lazyLoad = (path) => lazy(() => import(`./pages/${path}`));

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
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const ErrorFallback = ({ error }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <h1>Oops! Something went wrong.</h1>
    <pre>{error.message}</pre>
  </Box>
);

const App = () => {
  const { user, loading: userLoading, updateUserSettings, fetchUser, hasActiveSubscription } = useUser();
  const [themeMode, setThemeMode] = useState(() => ({
    app: user?.theme || localStorage.getItem('appTheme') || 'light',
    public: localStorage.getItem('publicTheme') || 'light'
  }));
  const [fontSize, setFontSize] = useState(() => user?.fontSize || localStorage.getItem('fontSize') || 'medium');

  useEffect(() => {
    fetchUser();
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

  const appTheme = useMemo(() => themeMode.app === 'light' ? lightTheme : darkTheme, [themeMode.app]);
  const publicTheme = useMemo(() => themeMode.public === 'light' ? lightTheme : darkTheme, [themeMode.public]);

  if (userLoading) return <LoadingFallback />;

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <BrowserRouter>
          <AppContent
            appTheme={appTheme}
            publicTheme={publicTheme}
            toggleTheme={toggleTheme}
            themeMode={themeMode}
            fontSize={fontSize}
            changeFontSize={changeFontSize}
            user={user}
            hasActiveSubscription={hasActiveSubscription}
          />
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

const AppContent = React.memo(({ appTheme, publicTheme, toggleTheme, themeMode, fontSize, changeFontSize, user, hasActiveSubscription }) => (
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
          <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} scriptProps={{ async: true, defer: true, appendTo: 'head' }}>
            <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}>
              <SignIn />
            </PublicLayout>
          </GoogleReCaptchaProvider>
        </AuthenticatedRoute>
      } />
      <Route path="/get-started" element={
        <AuthenticatedRoute>
          <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} scriptProps={{ async: true, defer: true, appendTo: 'head' }}>
          <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}>
            <SignUp />
          </PublicLayout>
          </GoogleReCaptchaProvider>
        </AuthenticatedRoute>
      } />
      <Route path="/my-plan" element={
        <ProtectedRoute>
          <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}>
            <MyPlan />
          </PublicLayout>
        </ProtectedRoute>
      } />
      <Route path="/create-blog" element={
        <ProtectedRoute>
          <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}>
            <BlogEditor />
          </PublicLayout>
        </ProtectedRoute>
      } />
      <Route path="/edit-blog/:id" element={
        <ProtectedRoute>
          <PublicLayout theme={publicTheme} toggleTheme={() => toggleTheme('public')}>
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
            >
              <Routes>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                {appRoutes.map(({ path, element: Element }) => (
                  <Route key={path} path={path} element={
                    hasActiveSubscription() ? (
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
));

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

export default App;