// Features.js
import React from 'react';
import styles from './Features.module.css';
import { Box, Typography, Grid, Container, useTheme, useMediaQuery } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import {
  Analytics, Security, BuildCircle, People, LightbulbOutlined, Headset,
  CloudQueue, Settings, PhoneAndroid, Autorenew, LocationOn, Receipt
} from '@mui/icons-material';

const features = [
  {
    icon: <Analytics />,
    title: 'Smart Analytics',
    description: 'Real-time insights and predictive analytics to optimize your property portfolio performance.',
    category: 'analytics'
  },
  {
    icon: <Security />,
    title: 'Enterprise Security',
    description: 'Military-grade encryption and multi-factor authentication to protect your valuable data.',
    category: 'security'
  },
  {
    icon: <BuildCircle />,
    title: 'Property Management Suite',
    description: 'Comprehensive tools for maintenance, tenant screening, and property optimization.',
    category: 'management'
  },
  {
    icon: <People />,
    title: 'Tenant Portal',
    description: 'Self-service platform for tenants to submit requests, pay rent, and communicate efficiently.',
    category: 'tenants'
  },
  {
    icon: <LightbulbOutlined />,
    title: 'Smart Integration',
    description: 'Seamless connection with popular property management tools and accounting software.',
    category: 'integration'
  },
  {
    icon: <Headset />,
    title: 'Priority Support',
    description: 'Dedicated account managers and 24/7 technical support for peace of mind.',
    category: 'support'
  },
  {
    icon: <CloudQueue />,
    title: 'Cloud Infrastructure',
    description: 'Scalable cloud storage with automatic backups and disaster recovery.',
    category: 'infrastructure'
  },
  {
    icon: <Settings />,
    title: 'Workflow Automation',
    description: 'Custom automation rules to streamline your property management processes.',
    category: 'automation'
  },
  {
    icon: <PhoneAndroid />,
    title: 'Mobile First',
    description: 'Powerful mobile app for managing properties on the go with offline capabilities.',
    category: 'mobile'
  },
  {
    icon: <Autorenew />,
    title: 'AI Assistant',
    description: 'AI-powered recommendations for pricing, maintenance, and tenant relations.',
    category: 'ai'
  },
  {
    icon: <LocationOn />,
    title: 'Market Intelligence',
    description: 'Local market insights and competitor analysis for strategic decision making.',
    category: 'market'
  },
  {
    icon: <Receipt />,
    title: 'Financial Suite',
    description: 'Comprehensive financial tools for rent collection, expense tracking, and reporting.',
    category: 'financial'
  }
];

const FeatureItem = ({ feature, index, inView }) => {
  const { ref, inView: itemInView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
    delay: 100
  });

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <div
        ref={ref}
        className={`${styles.featureCard} ${itemInView ? styles.visible : ''} ${styles[feature.category]}`}
        style={{
          animationDelay: `${index * 0.1}s`
        }}
        role="article"
        aria-label={feature.title}
      >
        <div className={styles.iconWrapper} aria-hidden="true">
          {feature.icon}
        </div>
        <Typography 
          variant="h6" 
          component="h3" 
          className={styles.featureTitle}
          gutterBottom
        >
          {feature.title}
        </Typography>
        <Typography 
          variant="body2" 
          className={styles.featureDescription}
        >
          {feature.description}
        </Typography>
        <div className={styles.featureOverlay} aria-hidden="true" />
      </div>
    </Grid>
  );
};

const Features = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <Box
      component="section"
      className={styles.featuresSection}
      ref={ref}
    >
      <Container maxWidth="xl">
        <div className={`${styles.headerContainer} ${inView ? styles.visible : ''}`}>
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            className={styles.featuresTitle}
          >
            Transform Your Property Management
          </Typography>
          <Typography
            variant="h5"
            className={styles.featuresSubtitle}
          >
            Powerful tools to streamline operations and maximize property value
          </Typography>
        </div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <FeatureItem
              key={feature.title}
              feature={feature}
              index={index}
              inView={inView}
            />
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;