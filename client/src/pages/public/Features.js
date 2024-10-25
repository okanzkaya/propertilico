import React from 'react';
import { Box, Typography, Grid, Container, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Analytics, Security, BuildCircle, People, LightbulbOutlined, Headset,
  CloudQueue, Settings, PhoneAndroid, Autorenew, LocationOn, Receipt
} from '@mui/icons-material';
import './Features.css';

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
  { icon: <Receipt />, title: 'Financial Tools', description: 'Simplified billing and invoicing with smart financial wizardry.' }
];

const FeatureItem = ({ feature, index }) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <motion.div
      className="feature-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="icon-wrapper">{feature.icon}</div>
      <Typography variant="h6" component="h3" gutterBottom fontWeight="bold" color="primary">
        {feature.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {feature.description}
      </Typography>
    </motion.div>
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
          className="features-title"
          sx={{ color: theme.palette.primary.main }}
        >
          Revolutionize Your Property Management
        </Typography>
        <Typography
          variant="h5"
          align="center"
          paragraph
          className="features-subtitle"
          sx={{ color: theme.palette.text.secondary }}
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