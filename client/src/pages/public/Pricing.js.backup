import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaCrown } from 'react-icons/fa';
import './Pricing.css';

const Pricing = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Standard',
      monthlyPrice: 19.99,
      yearlyPrice: 167.91, // 19.99 * 12 * 0.7 (30% discount)
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
      yearlyPrice: 419.91, // 49.99 * 12 * 0.7 (30% discount)
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

  return (
    <div className="pricing-wrapper">
      <div className="pricing-container">
        <motion.h1 
          className="pricing-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Simple, Transparent Pricing
        </motion.h1>
        
        <motion.p 
          className="pricing-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Choose the perfect plan for your property management needs
        </motion.p>

        <div className="pricing-toggle">
          <button 
            className={isMonthly ? 'active' : ''}
            onClick={() => setIsMonthly(true)}
          >
            Monthly
          </button>
          <button 
            className={!isMonthly ? 'active' : ''}
            onClick={() => setIsMonthly(false)}
          >
            Yearly <span className="discount-badge">30% off</span>
          </button>
        </div>

        <div className="pricing-cards">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name}
              className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              {plan.isPopular && (
                <div className="popular-tag">
                  <FaCrown />
                  Most Popular
                </div>
              )}
              {!isMonthly && (
                <div className="discount-tag">
                  Save {plan.discount}%
                </div>
              )}
              
              <h2 className="plan-name">{plan.name}</h2>
              
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">
                  {isMonthly 
                    ? plan.monthlyPrice.toFixed(2) 
                    : (plan.yearlyPrice / 12).toFixed(2)}
                </span>
                <span className="period">
                  /month
                </span>
              </div>
              {!isMonthly && (
                <div className="yearly-price">
                  <span className="original-price">${(plan.monthlyPrice * 12).toFixed(2)}</span>
                  <span className="discounted-price">${plan.yearlyPrice.toFixed(2)} billed yearly</span>
                </div>
              )}

              <ul className="features-list">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="feature-item">
                    {feature.included ? (
                      <FaCheck className="check" />
                    ) : (
                      <FaTimes className="times" />
                    )}
                    {feature.text}
                  </li>
                ))}
              </ul>

              <button 
                className="start-trial-btn"
                onClick={() => navigate('/signup')}
              >
                {plan.name === 'Standard' ? 'Start Free Trial' : 'Get Started'}
              </button>
              
              {plan.name === 'Standard' ? (
                <p className="trial-note">
                  14-day free trial, no credit card required
                </p>
              ) : (
                <p className="trial-note">
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