import styles from './Home.module.css';
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
  <div className={styles.gridBox} role="article">
    <div className={styles.gridIconWrapper}>
      <Icon className={styles.gridIcon} aria-hidden="true" />
    </div>
    <h3 className={styles.gridTitle}>{title}</h3>
    <p className={styles.gridDescription}>{description}</p>
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
        <section className={styles.heroSection} aria-labelledby="hero-title">
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <motion.h1 
                id="hero-title"
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
                className={styles.heading}
              >
                Transform Your Property Management
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                className={styles.subHeading}
              >
                Streamline operations, boost efficiency, and maximize returns with our AI-powered platform.
              </motion.p>
              <motion.button 
                className={styles.ctaButtonNew}
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => navigate('/get-started')}
                aria-label="Start your free trial"
              >
                Start Free Trial
              </motion.button>
              <ul className={styles.benefitList}>
                {benefits.map((benefit, index) => (
                  <li key={index} className={styles.benefitItem}>
                    <FaCheck aria-hidden="true" /> 
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <motion.div
              className={styles.heroGrid}
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

        <section className={styles.featuresSection} aria-labelledby="features-title">
          <div className={styles.container}>
            <h2 id="features-title" className="section-title text-center">Powerful Features</h2>
            <div className={styles.featureGridNew}>
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className={styles.featureCard}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  role="article"
                  aria-labelledby={`feature-title-${index}`}
                >
                  <div className={styles.featureIcon} aria-hidden="true">
                    <feature.icon />
                  </div>
                  <h3 id={`feature-title-${index}`}>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.testimonialSection} aria-labelledby="testimonials-title">
          <div className={styles.container}>
            <h2 id="testimonials-title" className="section-title text-center">What Our Clients Say</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                className={styles.testimonialCard}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.testimonialContent}>
                  <div className={styles.testimonialIcon}>
                    <FaUser aria-hidden="true" />
                  </div>
                  <div className="testimonial-text">
                    <h3>{testimonials[activeTestimonial].name}</h3>
                    <p className={styles.testimonialTitle}>
                      {testimonials[activeTestimonial].title} at {testimonials[activeTestimonial].company}
                    </p>
                    <div className={styles.testimonialRating} aria-label={`Rated ${testimonials[activeTestimonial].rating} out of 5 stars`}>
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <FaStar key={i} className={styles.starIcon} aria-hidden="true" />
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
            <div className={styles.testimonialNavigation}>
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

        <section className={styles.faqSection} aria-labelledby="faq-title">
          <div className={styles.container}>
            <h2 id="faq-title" className="section-title text-center">Frequently Asked Questions</h2>
            <div className={styles.faqGrid}>
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={styles.faqItem}
                >
                  <button 
                    className={styles.faqQuestion}
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
                        className={styles.faqAnswer}
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

        <section className={styles.ctaSectionNew} aria-labelledby="cta-title">
          <div className={styles.container}>
            <motion.div 
              className={styles.ctaWrapper}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 id="cta-title" className={styles.ctaHeading}>Ready to Transform Your Property Management?</h2>
              <p className={styles.ctaDescription}>
                Join thousands of property managers who have already streamlined their operations.
              </p>
              <div className={styles.ctaButtonContainer}>
                <motion.button
                  className={styles.ctaButtonNew}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/get-started')}
                >
                  Start Free Trial
                </motion.button>
                <p className={styles.ctaNote}>No credit card required • 14-day free trial • Full featured</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className={styles.trustSection} aria-labelledby="trust-title" ref={trustRef}>
          <div className={styles.container}>
            <h2 id="trust-title" className="section-title text-center">Trusted by Industry Leaders</h2>
            <div className={styles.trustMetrics}>
              <div className={styles.metricItem}>
                <FaRegBuilding className={styles.metricIcon} />
                {inView && (
                  <CountUp
                    start={0}
                    end={10}
                    duration={2.5}
                    separator=""
                    suffix="k+"
                    className={styles.metricNumber}
                  />
                )}
                <span className={styles.metricLabel}>Properties Managed</span>
              </div>
              <div className={styles.metricItem}>
                <FaSmile className={styles.metricIcon} />
                {inView && (
                  <CountUp
                    start={0}
                    end={98}
                    duration={2.5}
                    suffix="%"
                    className={styles.metricNumber}
                  />
                )}
                <span className={styles.metricLabel}>Customer Satisfaction</span>
              </div>
              <div className={styles.metricItem}>
                <FaPiggyBank className={styles.metricIcon} />
                {inView && (
                  <CountUp
                    start={0}
                    end={30}
                    duration={2.5}
                    suffix="%"
                    className={styles.metricNumber}
                  />
                )}
                <span className={styles.metricLabel}>Average Cost Reduction</span>
              </div>
              <div className={styles.metricItem}>
                <FaClock className={styles.metricIcon} />
                <span className={styles.metricNumber}>24/7</span>
                <span className={styles.metricLabel}>Customer Support</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;