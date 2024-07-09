import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Features from './pages/Features';
import FAQ from './pages/FAQ';
import ToS from './pages/ToS';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Pricing from './pages/Pricing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import HelpCenter from './pages/HelpCenter';  // Import HelpCenter
import ContactUs from './pages/ContactUs';  // Import ContactUs
import CompanyInfo from './pages/CompanyInfo';  // Import CompanyInfo
import Header from './components/Header';
import Footer from './components/Footer';

import './App.css';  // General styles for the app

function App() {
  return (
    <Router>
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/tos" element={<ToS />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/get-started" element={<SignUp />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/help-center" element={<HelpCenter />} />  {/* Add HelpCenter route */}
          <Route path="/contact" element={<ContactUs />} />  {/* Add ContactUs route */}
          <Route path="/about" element={<CompanyInfo />} />  {/* Add CompanyInfo route */}
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
