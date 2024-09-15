import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaHome, FaChartBar, FaShieldAlt, FaClock, FaCheck, FaStar, FaArrowLeft, FaArrowRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const LazyImage = lazy(() => import('./LazyImage'));

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Poppins', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: #f8f9fa;
    color: #333;
  }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Section = styled(motion.section)`
  padding: 80px 5%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 60px 5%;
  }
`;

const HeroSection = styled(Section)`
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  min-height: 100vh;
  color: white;
  padding: 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const HeroContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5%;

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  max-width: 600px;
`;

const HeroImageGrid = styled(motion.div)`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-left: 40px;

  @media (max-width: 1024px) {
    margin-left: 0;
    margin-top: 40px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Heading = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SubHeading = styled(motion.p)`
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CTAButton = styled(motion.button)`
  background: white;
  color: #e73c7e;
  border: none;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e73c7e;
    color: white;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 12px 30px;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled(motion.div)`
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: #e73c7e;
  margin-bottom: 20px;
`;

const TestimonialSection = styled(Section)`
  background: linear-gradient(135deg, #f6f9fc, #e9f2f9);
  position: relative;
`;

const TestimonialCard = styled(motion.div)`
  background: #fff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  width: 80%;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const TestimonialImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 15px;
  border: 4px solid #e73c7e;
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #e73c7e;
  cursor: pointer;
  transition: color 0.3s;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  &:hover {
    color: #23a6d5;
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }

  &.left {
    left: 20px;
  }

  &.right {
    right: 20px;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const BenefitList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 1.1rem;

  svg {
    color: #23d5ab;
    margin-right: 10px;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FAQSection = styled(Section)`
  background: #fff;
`;

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FAQItem = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
`;

const FAQQuestion = styled.button`
  font-size: 1.2rem;
  color: #e73c7e;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  &:hover {
    color: #23a6d5;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FAQAnswer = styled(motion.div)`
  font-size: 1rem;
  color: #333;
  margin-top: 10px;
`;

const features = [
  { icon: FaHome, title: "Smart Property Management", description: "Streamline operations with AI-powered tools." },
  { icon: FaChartBar, title: "Advanced Analytics", description: "Make data-driven decisions to maximize ROI." },
  { icon: FaShieldAlt, title: "Bank-Level Security", description: "Protect your data with top-tier security measures." },
  { icon: FaClock, title: "24/7 Automated Support", description: "Provide instant assistance to tenants around the clock." }
];

const testimonials = [
  { image: "https://via.placeholder.com/100", name: "John Doe", title: "Property Investor", rating: 5, text: "Propertilico has revolutionized how I manage my properties. It's an absolute game-changer." },
  { image: "https://via.placeholder.com/100", name: "Jane Smith", title: "Real Estate Mogul", rating: 5, text: "The analytics feature in Propertilico is truly a game-changer. It's become indispensable." },
  { image: "https://via.placeholder.com/100", name: "Mike Johnson", title: "Property Manager", rating: 5, text: "Propertilico has streamlined my workflow beyond belief. I highly recommend it." }
];

const benefits = [
  "Increase property value",
  "Reduce operational costs",
  "Improve tenant satisfaction",
  "Streamline maintenance processes"
];

const faqs = [
  { question: "How does Propertilico help with property management?", answer: "Propertilico offers AI-powered tools to streamline operations, automate tasks, and provide real-time insights into your property portfolio." },
  { question: "Is Propertilico suitable for small property owners?", answer: "Yes, Propertilico is designed to scale with your needs, making it perfect for both small property owners and large real estate companies." },
  { question: "How secure is my data with Propertilico?", answer: "We use bank-level encryption and security measures to ensure your data is always protected and compliant with industry standards." },
  { question: "Can I try Propertilico before committing?", answer: "Absolutely! We offer a free trial so you can experience the full power of Propertilico before making a decision." }
];

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);
  const navigate = useNavigate();

  const nextTestimonial = useCallback(() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length), []);
  const prevTestimonial = useCallback(() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length), []);

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, [nextTestimonial]);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <>
      <GlobalStyle />
      <Helmet>
        <title>Propertilico - Revolutionary Property Management Software</title>
        <meta name="description" content="Transform your property management with Propertilico. Our AI-powered platform offers smart tools for efficient property tracking, advanced analytics, and secure tenant management." />
        <meta name="keywords" content="property management, real estate software, AI analytics, tenant management" />
        <meta name="author" content="Propertilico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.propertilico.com" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap" rel="stylesheet" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "http://schema.org",
            "@type": "SoftwareApplication",
            "name": "Propertilico",
            "applicationCategory": "Property Management Software",
            "operatingSystem": "Web-based",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "ratingCount": "100"
            }
          })}
        </script>
      </Helmet>

      <HeroSection>
        <HeroContainer>
          <HeroContent>
            <Heading initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              Transform Your Property Management
            </Heading>
            <SubHeading initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              Streamline operations, boost efficiency, and maximize returns with our AI-powered platform.
            </SubHeading>
            <CTAButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/get-started')}>
              Start Your Free Trial
            </CTAButton>
            <BenefitList>
              {benefits.map((benefit, index) => (
                <BenefitItem key={index}>
                  <FaCheck /> {benefit}
                </BenefitItem>
              ))}
            </BenefitList>
          </HeroContent>
          <HeroImageGrid
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <LazyImage src="https://via.placeholder.com/300x200" alt="Property Management" />
              <LazyImage src="https://via.placeholder.com/300x200" alt="Data Analytics" />
              <LazyImage src="https://via.placeholder.com/300x200" alt="Tenant Portal" />
              <LazyImage src="https://via.placeholder.com/300x200" alt="Financial Reports" />
            </Suspense>
          </HeroImageGrid>
        </HeroContainer>
      </HeroSection>

      <Section>
        <Container>
          <FeatureGrid>
            {features.map((feature, index) => (
              <FeatureCard key={index} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <FeatureIcon>{<feature.icon />}</FeatureIcon>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      <TestimonialSection>
        <Container>
          <AnimatePresence mode="wait">
            <TestimonialCard
              key={activeTestimonial}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <TestimonialImage src={testimonials[activeTestimonial].image} alt={testimonials[activeTestimonial].name} loading="lazy" />
              <h4>{testimonials[activeTestimonial].name}</h4>
              <p>{testimonials[activeTestimonial].title}</p>
              <div>{[...Array(testimonials[activeTestimonial].rating)].map((_, i) => <FaStar key={i} color="#FFD700" />)}</div>
              <p>"{testimonials[activeTestimonial].text}"</p>
            </TestimonialCard>
          </AnimatePresence>
          <ArrowButton className="left" onClick={prevTestimonial} disabled={activeTestimonial === 0}><FaArrowLeft /></ArrowButton>
          <ArrowButton className="right" onClick={nextTestimonial} disabled={activeTestimonial === testimonials.length - 1}><FaArrowRight /></ArrowButton>
        </Container>
      </TestimonialSection>

      <FAQSection>
        <Container>
          <FAQContainer>
            <Heading as="h2" style={{ textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</Heading>
            {faqs.map((faq, index) => (
              <FAQItem key={index}>
                <FAQQuestion onClick={() => toggleFAQ(index)}>
                  {faq.question}
                  {openFAQ === index ? <FaChevronUp /> : <FaChevronDown />}
                </FAQQuestion>
                <AnimatePresence>
                  {openFAQ === index && (
                    <FAQAnswer
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {faq.answer}
                    </FAQAnswer>
                  )}
                </AnimatePresence>
              </FAQItem>
            ))}
          </FAQContainer>
        </Container>
      </FAQSection>
    </>
  );
};

export default Home;