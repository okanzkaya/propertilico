import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { 
  FaBuilding,
  FaChartBar, 
  FaShieldAlt, 
  FaCheck, 
  FaStar, 
  FaArrowLeft, 
  FaArrowRight, 
  FaChevronDown, 
  FaChevronUp,
  FaUser,
  FaChartLine,
  FaUsers,
  FaFileInvoiceDollar,
  FaRegBuilding,
  FaSmile,
  FaPiggyBank,
  FaClock
} from 'react-icons/fa';
import './Home.css';

const features = [
  { 
    icon: FaBuilding, 
    title: "Smart Property Management", 
    description: "Streamline operations with AI-powered tools and automation.",
    ariaLabel: "Learn about our smart property management features"
  },
  { 
    icon: FaChartLine, 
    title: "Advanced Analytics", 
    description: "Make data-driven decisions with real-time insights and reporting.",
    ariaLabel: "Explore our advanced analytics capabilities"
  },
  { 
    icon: FaShieldAlt, 
    title: "Bank-Level Security", 
    description: "Enterprise-grade encryption and security for your sensitive data.",
    ariaLabel: "Read about our security measures"
  },
  { 
    icon: FaUsers, 
    title: "24/7 Tenant Support", 
    description: "Automated support system with live chat and ticket management.",
    ariaLabel: "Learn about our tenant support system"
  }
];

const testimonials = [
  { 
    name: "John Doe", 
    title: "Property Manager", 
    company: "Real Estate Solutions Inc.",
    rating: 5, 
    text: "Propertilico has revolutionized how we manage our 500+ unit portfolio. The automation features alone save us 20+ hours per week.",
    location: "New York, NY"
  },
  { 
    name: "Sarah Johnson", 
    title: "Real Estate Investor", 
    company: "Johnson Properties",
    rating: 5, 
    text: "The analytics and reporting features have transformed our decision-making process. We've seen a 15% increase in ROI since implementing Propertilico.",
    location: "Los Angeles, CA"
  },
  { 
    name: "Michael Chen", 
    title: "Property Owner", 
    company: "Chen Real Estate Group",
    rating: 5, 
    text: "As someone managing multiple properties, Propertilico's unified dashboard and tenant portal have made my life significantly easier.",
    location: "Chicago, IL"
  }
];

const benefits = [
  "Reduce operational costs by up to 30%",
  "Increase property value through better management",
  "Improve tenant satisfaction and retention",
  "Automate 80% of routine tasks"
];

const faqs = [
  { 
    question: "How does Propertilico help with property management?", 
    answer: "Propertilico offers a comprehensive suite of tools including automated rent collection, maintenance tracking, tenant screening, financial reporting, and AI-powered analytics. Our platform streamlines daily operations, reduces manual work, and provides real-time insights for better decision-making."
  },
  { 
    question: "Is Propertilico suitable for small property owners?", 
    answer: "Yes! Propertilico is designed to scale with your needs. Whether you manage 5 units or 5,000, our flexible pricing and feature set adapt to your requirements. Small property owners particularly benefit from our automation tools and simplified workflows."
  },
  { 
    question: "How secure is my data with Propertilico?", 
    answer: "We implement bank-level security measures including 256-bit encryption, two-factor authentication, and regular security audits. Our platform is SOC 2 Type II certified and compliant with all major data protection regulations."
  },
  { 
    question: "Can I try Propertilico before committing?", 
    answer: "Absolutely! We offer a 14-day free trial with full access to all features. No credit card required. You'll also get a personalized onboarding session with our customer success team to ensure you get the most out of our platform."
  }
];

const GridBox = ({ icon: Icon, title, description }) => (
  <div className="grid-box" role="article">
    <div className="grid-icon-wrapper">
      <Icon className="grid-icon" aria-hidden="true" />
    </div>
    <h3 className="grid-title">{title}</h3>
    <p className="grid-description">{description}</p>
  </div>
);

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);
  const navigate = useNavigate();
  
  const { ref: trustRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const nextTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, [nextTestimonial]);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const structuredData = {
    "@context": "http://schema.org",
    "@type": "SoftwareApplication",
    "name": "Propertilico",
    "applicationCategory": "Property Management Software",
    "operatingSystem": "Web-based",
    "description": "Advanced property management software with AI-powered analytics and automation tools",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "100",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "Smart Property Management",
      "Advanced Analytics",
      "Bank-Level Security",
      "24/7 Tenant Support"
    ]
  };

  return (
    <>
      <Helmet>
        <title>Propertilico | Smart Property Management Software for Modern Landlords</title>
        <meta name="description" content="Transform your property management with Propertilico's AI-powered platform. Automate tasks, get real-time insights, and boost ROI. Start free trial today!" />
        <meta name="keywords" content="property management software, real estate management, landlord software, tenant management, property analytics, automation tools" />
        <link rel="canonical" href="https://www.propertilico.com" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.propertilico.com/" />
        <meta property="og:title" content="Propertilico - Smart Property Management Software" />
        <meta property="og:description" content="Transform your property management with AI-powered automation and analytics. Designed for modern landlords and property managers." />
        <meta property="og:image" content="https://www.propertilico.com/og-image.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.propertilico.com/" />
        <meta name="twitter:title" content="Propertilico - Smart Property Management Software" />
        <meta name="twitter:description" content="Transform your property management with AI-powered automation and analytics. Designed for modern landlords and property managers." />
        <meta name="twitter:image" content="https://www.propertilico.com/twitter-card.jpg" />

        <meta name="robots" content="index, follow" />
        <meta name="author" content="Propertilico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-container">
            <div className="hero-content">
              <motion.h1 
                id="hero-title"
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
                className="heading"
              >
                Transform Your Property Management
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                className="sub-heading"
              >
                Streamline operations, boost efficiency, and maximize returns with our AI-powered platform.
              </motion.p>
              <motion.button 
                className="cta-button-new"
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => navigate('/get-started')}
                aria-label="Start your free trial"
              >
                Start Free Trial
              </motion.button>
              <ul className="benefit-list">
                {benefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <FaCheck aria-hidden="true" /> 
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <motion.div
              className="hero-grid"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <GridBox 
                icon={FaBuilding} 
                title="Property Dashboard" 
                description="Centralized property management"
              />
              <GridBox 
                icon={FaChartBar} 
                title="Real-time Analytics" 
                description="Data-driven insights"
              />
              <GridBox 
                icon={FaUsers} 
                title="Tenant Portal" 
                description="Simplified tenant communication"
              />
              <GridBox 
                icon={FaFileInvoiceDollar} 
                title="Financial Reports" 
                description="Comprehensive financial tracking"
              />
            </motion.div>
          </div>
        </section>

        <section className="features-section" aria-labelledby="features-title">
          <div className="container">
            <h2 id="features-title" className="section-title text-center">Powerful Features</h2>
            <div className="feature-grid-new">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="feature-card"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  role="article"
                  aria-labelledby={`feature-title-${index}`}
                >
                  <div className="feature-icon" aria-hidden="true">
                    <feature.icon />
                  </div>
                  <h3 id={`feature-title-${index}`}>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="testimonial-section" aria-labelledby="testimonials-title">
          <div className="container">
            <h2 id="testimonials-title" className="section-title text-center">What Our Clients Say</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                className="testimonial-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <div className="testimonial-content">
                  <div className="testimonial-icon">
                    <FaUser aria-hidden="true" />
                  </div>
                  <div className="testimonial-text">
                    <h3>{testimonials[activeTestimonial].name}</h3>
                    <p className="testimonial-title">
                      {testimonials[activeTestimonial].title} at {testimonials[activeTestimonial].company}
                    </p>
                    <div className="testimonial-rating" aria-label={`Rated ${testimonials[activeTestimonial].rating} out of 5 stars`}>
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <FaStar key={i} className="star-icon" aria-hidden="true" />
                      ))}
                    </div>
                    <blockquote>
                      <p>{testimonials[activeTestimonial].text}</p>
                      <footer className="testimonial-location">
                        <cite>{testimonials[activeTestimonial].location}</cite>
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="testimonial-navigation">
              <button 
                className="nav-button prev"
                onClick={prevTestimonial}
                disabled={activeTestimonial === 0}
                aria-label="Previous testimonial"
              >
                <FaArrowLeft aria-hidden="true" />
              </button>
              <button 
                className="nav-button next"
                onClick={nextTestimonial}
                disabled={activeTestimonial === testimonials.length - 1}
                aria-label="Next testimonial"
              >
                <FaArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <section className="faq-section" aria-labelledby="faq-title">
          <div className="container">
            <h2 id="faq-title" className="section-title text-center">Frequently Asked Questions</h2>
            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="faq-item"
                >
                  <button 
                    className="faq-question"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={openFAQ === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="question-text">{faq.question}</span>
                    {openFAQ === index ? (
                      <FaChevronUp aria-hidden="true" className="faq-icon" />
                    ) : (
                      <FaChevronDown aria-hidden="true" className="faq-icon" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openFAQ === index && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        className="faq-answer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section-new" aria-labelledby="cta-title">
          <div className="container">
            <motion.div 
              className="cta-wrapper"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 id="cta-title" className="cta-heading">Ready to Transform Your Property Management?</h2>
              <p className="cta-description">
                Join thousands of property managers who have already streamlined their operations.
              </p>
              <div className="cta-button-container">
                <motion.button
                  className="cta-button-new"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/get-started')}
                >
                  Start Free Trial
                </motion.button>
                <p className="cta-note">No credit card required • 14-day free trial • Full featured</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="trust-section" aria-labelledby="trust-title" ref={trustRef}>
          <div className="container">
            <h2 id="trust-title" className="section-title text-center">Trusted by Industry Leaders</h2>
            <div className="trust-metrics">
              <div className="metric-item">
                <FaRegBuilding className="metric-icon" />
                {inView && (
                  <CountUp
                    start={0}
                    end={10}
                    duration={2.5}
                    separator=""
                    suffix="k+"
                    className="metric-number"
                  />
                )}
                <span className="metric-label">Properties Managed</span>
              </div>
              <div className="metric-item">
                <FaSmile className="metric-icon" />
                {inView && (
                  <CountUp
                    start={0}
                    end={98}
                    duration={2.5}
                    suffix="%"
                    className="metric-number"
                  />
                )}
                <span className="metric-label">Customer Satisfaction</span>
              </div>
              <div className="metric-item">
                <FaPiggyBank className="metric-icon" />
                {inView && (
                  <CountUp
                    start={0}
                    end={30}
                    duration={2.5}
                    suffix="%"
                    className="metric-number"
                  />
                )}
                <span className="metric-label">Average Cost Reduction</span>
              </div>
              <div className="metric-item">
                <FaClock className="metric-icon" />
                <span className="metric-number">24/7</span>
                <span className="metric-label">Customer Support</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;