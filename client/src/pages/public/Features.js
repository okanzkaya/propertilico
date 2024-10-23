import React from 'react';
import { Box, Typography, Grid, Container, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Analytics, Security, BuildCircle, People, LightbulbOutlined, Headset,
  CloudQueue, Settings, PhoneAndroid, Autorenew, LocationOn, Receipt
} from '@mui/icons-material';

const FeatureCard = styled(motion.div)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const features = [
  { icon: <Analytics />, title: 'Advanced Analytics', description: 'Gain deep insights with our cutting-edge analytics tools.' },
  { icon: <Security />, title: 'Fort Knox Security', description: 'Bank-grade security ensures your data remains impenetrable.' },
  { icon: <BuildCircle />, title: 'Intuitive Management', description: 'Streamline operations with our smart management suite.' },
  { icon: <People />, title: 'User-Centric Design', description: 'An interface so intuitive, it feels like an extension of you.' },
  { icon: <LightbulbOutlined />, title: 'Seamless Ecosystem', description: 'Integrate effortlessly with your favorite tools and services.' },
  { icon: <Headset />, title: '24/7 Support', description: 'Expert assistance available round the clock, because we never sleep.' },
  { icon: <CloudQueue />, title: 'Cloud Storage', description: 'Secure and limitless storage for all your crucial documents.' },
  { icon: <Settings />, title: 'Customization', description: 'Tailor every aspect to fit your unique workflow perfectly.' },
  { icon: <PhoneAndroid />, title: 'Mobile Mastery', description: 'Full-featured mobile app for management on the move.' },
  { icon: <Autorenew />, title: 'AI Automation', description: 'Let our AI handle repetitive tasks while you focus on growth.' },
  { icon: <LocationOn />, title: 'Geo-Intelligence', description: 'Location-based insights for strategic property management.' },
  { icon: <Receipt />, title: 'Financial Tools', description: 'Simplified billing and invoicing with smart financial wizardry.' },
];

const FeatureItem = ({ feature, index }) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <FeatureCard
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <IconWrapper>{feature.icon}</IconWrapper>
      <Typography variant="h6" component="h3" gutterBottom fontWeight="bold" color="primary">
        {feature.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {feature.description}
      </Typography>
    </FeatureCard>
  </Grid>
);

const Features = () => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background: theme.palette.background.default,
      }}
    >
      <Container maxWidth="xl">
        <Typography
          variant="h2"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 900,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            color: theme.palette.primary.main,
            mb: 2,
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
            color: theme.palette.text.secondary,
            fontWeight: 300,
          }}
        >
          Unlock the full potential of your properties with our cutting-edge features
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