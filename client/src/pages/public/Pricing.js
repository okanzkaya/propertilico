import styles from './Pricing.module.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaCrown } from 'react-icons/fa';

const Pricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Standard',
      monthlyPrice: 19.99,
      yearlyPrice: 167.91,
      features: [
        { text: 'Up to 50 Property Listings', included: true },
        { text: 'Basic Analytics', included: true },
        { text: 'Email Support', included: true },
        { text: 'Basic Reporting', included: true },
        { text: 'Single User', included: true },
        { text: 'API Access', included: false },
        { text: 'Advanced Analytics', included: false },
        { text: 'Custom Reporting', included: false },
      ],
      isPopular: true,
      discount: 30
    },
    {
      name: 'Premium',
      monthlyPrice: 49.99,
      yearlyPrice: 419.91,
      features: [
        { text: 'Unlimited Property Listings', included: true },
        { text: 'Advanced Analytics', included: true },
        { text: 'Priority Support', included: true },
        { text: 'Advanced Reporting', included: true },
        { text: 'Multiple Users', included: true },
        { text: 'API Access', included: true },
        { text: 'Custom Integrations', included: true },
        { text: 'White Label Option', included: true },
      ],
      isPopular: false,
      discount: 30
    },
  ];

  const PriceDisplay = ({ plan }) => {
    const price = isMonthly ? plan.monthlyPrice : plan.yearlyPrice / 12;
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={isMonthly ? 'monthly' : 'yearly'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={styles.planPrice}
        >
          <span className={styles.currency}>$</span>
          <motion.span
            key={price}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.amount}
          >
            {price.toFixed(2)}
          </motion.span>
          <span className={styles.period}>/month</span>
        </motion.div>
      </AnimatePresence>
    );
  };

  const YearlyPriceDisplay = ({ plan }) => (
    <AnimatePresence>
      {!isMonthly && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={styles.yearlyPrice}
        >
          <span className={styles.originalPrice}>
            ${(plan.monthlyPrice * 12).toFixed(2)}
          </span>
          <span className={styles.discountedPrice}>
            ${plan.yearlyPrice.toFixed(2)} billed yearly
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={styles.pricingWrapper}>
      <div className={styles.pricingContainer}>
        <motion.h1 
          className={styles.pricingTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Simple, Transparent Pricing
        </motion.h1>
        
        <motion.p 
          className={styles.pricingSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Choose the perfect plan for your property management needs
        </motion.p>

        <div className={styles.pricingToggle}>
          <button 
            className={`${isMonthly ? styles.active : ''}`}
            onClick={() => setIsMonthly(true)}
          >
            Monthly
          </button>
          <button 
            className={`${!isMonthly ? styles.active : ''}`}
            onClick={() => setIsMonthly(false)}
          >
            Yearly <span className={styles.discountBadge}>30% off</span>
          </button>
        </div>

        <div className={styles.pricingCards}>
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name}
              className={`${styles.pricingCard} ${plan.isPopular ? styles.popular : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              {plan.isPopular && (
                <div className={styles.popularTag}>
                  <FaCrown />
                  Most Popular
                </div>
              )}
              <AnimatePresence>
                {!isMonthly && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className={styles.discountTag}
                  >
                    Save {plan.discount}%
                  </motion.div>
                )}
              </AnimatePresence>
              
              <h2 className={styles.planName}>{plan.name}</h2>
              
              <PriceDisplay plan={plan} />
              <YearlyPriceDisplay plan={plan} />

              <ul className={styles.featuresList}>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className={styles.featureItem}>
                    {feature.included ? (
                      <FaCheck className={styles.check} />
                    ) : (
                      <FaTimes className={styles.times} />
                    )}
                    {feature.text}
                  </li>
                ))}
              </ul>

              <button 
                className={styles.startTrialBtn}
                onClick={() => navigate('/signup')}
              >
                {plan.name === 'Standard' ? 'Start Free Trial' : 'Get Started'}
              </button>
              
              {plan.name === 'Standard' ? (
                <p className={styles.trialNote}>
                  14-day free trial, no credit card required
                </p>
              ) : (
                <p className={styles.trialNote}>
                  Instant access to all features
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;