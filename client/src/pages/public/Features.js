import React from 'react';
import { Box, Typography, Grid, useTheme, useMediaQuery, Container } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Analytics, Security, BuildCircle, People, LightbulbOutlined, Headset,
  CloudQueue, Settings, PhoneAndroid, Autorenew, LocationOn, Receipt,
  NotificationsActive, PieChart, Storage
} from '@mui/icons-material';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StyledPaper = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, 
    ${theme.palette.background.paper} 0%, 
    ${theme.palette.grey[100]} 100%)`,
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    fontSize: '4rem',
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
  },
}));

const features = [
  { icon: <Analytics />, title: 'Advanced Analytics', description: 'Gain deep insights with our cutting-edge analytics tools.' },
  { icon: <Security />, title: 'Fort Knox Security', description: 'Bank-grade security ensures your data remains impenetrable.' },
  { icon: <BuildCircle />, title: 'Intuitive Management', description: 'Streamline operations with our smart management suite.' },
  { icon: <People />, title: 'User-Centric Design', description: 'An interface so intuitive, it feels like an extension of you.' },
  { icon: <LightbulbOutlined />, title: 'Seamless Ecosystem', description: 'Integrate effortlessly with your favorite tools and services.' },
  { icon: <Headset />, title: 'Round-the-Clock Support', description: 'Expert assistance available 24/7, because we never sleep.' },
  { icon: <CloudQueue />, title: 'Infinite Cloud Storage', description: 'Limitless secure storage for all your crucial documents.' },
  { icon: <Settings />, title: 'Tailored Experience', description: 'Customize every aspect to fit your unique workflow.' },
  { icon: <PhoneAndroid />, title: 'Mobile Mastery', description: 'Full-featured mobile app for management on the move.' },
  { icon: <Autorenew />, title: 'AI-Powered Automation', description: 'Let our AI handle repetitive tasks while you focus on growth.' },
  { icon: <LocationOn />, title: 'Geo-Intelligence', description: 'Location-based insights for strategic property management.' },
  { icon: <Receipt />, title: 'Financial Wizardry', description: 'Simplified billing and invoicing with smart financial tools.' },
  { icon: <NotificationsActive />, title: 'Intelligent Alerts', description: 'Stay ahead with predictive and actionable notifications.' },
  { icon: <PieChart />, title: 'Visual Insights', description: 'Transform complex data into clear, actionable visualizations.' },
  { icon: <Storage />, title: 'Bulletproof Infrastructure', description: 'Rely on our ultra-resilient systems for 99.99% uptime.' },
];

const FeatureItem = ({ feature, index }) => (
  <Grid item xs={12} sm={6} md={4} component={motion.div}>
    <StyledPaper
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(31, 38, 135, 0.25)' }}
    >
      <IconWrapper>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1 + index * 0.05
          }}
        >
          {feature.icon}
        </motion.div>
      </IconWrapper>
      <Typography
        variant="h6"
        component="h3"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {feature.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {feature.description}
      </Typography>
    </StyledPaper>
  </Grid>
);

const Features = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="section"
      sx={{
        flexGrow: 1,
        py: { xs: 8, md: 12 },
        background: `linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)`,
        backgroundSize: '400% 400%',
        animation: `${gradientShift} 15s ease infinite`,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 900,
            fontSize: { xs: '2.5rem', md: '3.75rem' },
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            color: 'white',
            mb: 4,
          }}
        >
          Revolutionize Your Property Management
        </Typography>
        <Typography
          variant="h5"
          align="center"
          paragraph
          sx={{
            maxWidth: '800px',
            margin: '0 auto',
            mb: 8,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 300,
          }}
        >
          Unlock the full potential of your properties with our state-of-the-art features designed to streamline, optimize, and elevate your management experience.
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <FeatureItem key={index} feature={feature} index={index} />
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;