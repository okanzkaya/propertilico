// src/components/Footer.js
import React from 'react';
import styled from 'styled-components';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa'; // Import social media icons

const FooterContainer = styled.footer`
  background-color: #f8f8f8; /* Light background color */
  color: black;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  flex-wrap: wrap;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Column = styled.div`
  flex: 1;
  padding: 20px;
  min-width: 200px;
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
    padding: 10px;
  }
`;

const FooterHeader = styled.h3`
  font-size: 1.2em;
  margin-bottom: 15px;
`;

const FooterLink = styled.a`
  display: block;
  color: black;
  text-decoration: none;
  margin-bottom: 10px;
  font-size: 1em;
  transition: color 0.3s;

  &:hover {
    color: #007BFF; /* Bootstrap primary color */
  }
`;

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;

  a {
    color: black;
    margin: 0 15px;
    font-size: 1.5em;
    transition: color 0.3s;

    &:hover {
      color: #007BFF; /* Bootstrap primary color */
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #ccc;
  padding-top: 10px;
  width: 100%;
  text-align: center;
  margin-top: auto;
`;

const Copyright = styled.p`
  font-size: 0.9em;
  color: #666;
  margin-bottom: 10px;
`;

function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <Column>
          <FooterHeader>About Us</FooterHeader>
          <FooterLink href="/about">Company Info</FooterLink>
          <FooterLink href="/contact">Contact Us</FooterLink>
        </Column>
        <Column>
          <FooterHeader>Resources</FooterHeader>
          <FooterLink href="/blog">Blog</FooterLink>
          <FooterLink href="/help-center">Help Center</FooterLink>
          <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
        </Column>
        <Column>
          <FooterHeader>Quick Links</FooterHeader>
          <FooterLink href="/features">Features</FooterLink>
          <FooterLink href="/pricing">Pricing</FooterLink>
          <FooterLink href="/signin">Sign In</FooterLink>
        </Column>
      </FooterContent>
      <SocialIcons>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
      </SocialIcons>
      <FooterBottom>
        <Copyright>&copy; 2024 Propertilico. All rights reserved.</Copyright>
      </FooterBottom>
    </FooterContainer>
  );
}

export default Footer;
