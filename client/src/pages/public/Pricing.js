import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTimes, FaCrown, FaRegLightbulb, FaRocket } from 'react-icons/fa';
import './Pricing.css';

const Pricing = () => {
  const navigate = useNavigate();
  const [showMonthly, setShowMonthly] = useState(true);

  useEffect(() => {
    document.title = "Propertilico Pricing - Revolutionary Property Management Plans";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Discover Propertilico's innovative pricing plans. Choose between Standard and Plus to revolutionize your property management experience.");
    }
  }, []);

  const handleStartFreeTrial = useCallback((plan) => {
    navigate(`/payment?plan=${plan}`);
  }, [navigate]);

  const plans = useMemo(() => [
    {
      name: "Standard",
      monthlyPrice: 19.5,
      yearlyPrice: 17.5,
      originalMonthlyPrice: 30,
      originalYearlyPrice: 25,
      features: [
        { name: 'Up to 50 Property Listings', included: true },
        { name: 'Basic Analytics Dashboard', included: true },
        { name: 'Email Customer Support', included: true },
        { name: 'Secure Cloud Data Storage', included: true },
        { name: 'Standard Reporting', included: true },
        { name: 'Basic Tenant Screening', included: true },
        { name: 'Manual Rent Collection', included: true },
        { name: 'Basic Maintenance Tracking', included: true },
        { name: 'AI-Powered Market Insights', included: false },
        { name: 'Multi-Property Portfolio Management', included: false },
      ],
      featured: true,
    },
    {
      name: "Plus",
      monthlyPrice: 39.9,
      yearlyPrice: 35.9,
      originalMonthlyPrice: 60,
      originalYearlyPrice: 50,
      features: [
        { name: 'Unlimited Property Listings', included: true },
        { name: 'Advanced Analytics Dashboard', included: true },
        { name: '24/7 Priority Customer Support', included: true },
        { name: 'Enhanced Cloud Storage & Backup', included: true },
        { name: 'Customizable Reporting', included: true },
        { name: 'Advanced Tenant Screening Tools', included: true },
        { name: 'Automated Rent Collection', included: true },
        { name: 'Advanced Maintenance Request Tracking', included: true },
        { name: 'AI-Powered Market Insights', included: true },
        { name: 'Multi-Property Portfolio Management', included: true },
      ],
    },
  ], []);

  return (
    <div className="pricing-container">
      <div className="glass-panes" />
      <div className="floating-icon icon-1"><FaRegLightbulb /></div>
      <div className="floating-icon icon-2"><FaRocket /></div>
      <div className="floating-icon icon-3"><FaCrown /></div>
      <div className="content-wrapper">
        <h1 className="header">Revolutionary Property Management</h1>
        <p className="description">
          Experience the future of property management with our innovative plans.
          Start your 30-day free trial and transform your property portfolio today.
        </p>
        <div className="comparison-toggle">
          <button 
            className={`toggle-button ${showMonthly ? 'active' : ''}`}
            onClick={() => setShowMonthly(true)}
          >
            Monthly
          </button>
          <button 
            className={`toggle-button ${!showMonthly ? 'active' : ''}`}
            onClick={() => setShowMonthly(false)}
          >
            Yearly
          </button>
        </div>
        <div className="plans-wrapper">
          {plans.map((plan, index) => (
            <div key={index} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && (
                <span className="popular-label">
                  <FaCrown /> Most Popular
                </span>
              )}
              <span className="discount-label">35% OFF</span>
              <div>
                <h2 className="plan-header">{plan.name}</h2>
                <div className="price-container">
                  <span className="original-price">
                    ${showMonthly ? plan.originalMonthlyPrice : plan.originalYearlyPrice}/month
                  </span>
                  <span className="discounted-price">
                    ${showMonthly ? plan.monthlyPrice.toFixed(2) : plan.yearlyPrice.toFixed(2)}/month
                  </span>
                </div>
                <ul className="feature-list">
                  {plan.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex} 
                      className={`feature ${feature.included ? 'included' : ''}`}
                    >
                      <span className={`feature-icon ${feature.included ? 'included' : ''}`}>
                        {feature.included ? <FaCheck /> : <FaTimes />}
                      </span>
                      {feature.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <button 
                  className="cta-button"
                  onClick={() => handleStartFreeTrial(plan.name.toLowerCase())}
                >
                  Start Free Trial
                </button>
                <p className="trial-text">No credit card required for trial</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;