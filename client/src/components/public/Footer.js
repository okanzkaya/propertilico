import React from 'react';
import styled from 'styled-components';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color: #f8f8f8;
  color: black;
  padding: 40px 20px;
  text-align: center;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Column = styled.div`
  flex: 1;
  padding: 20px;
  min-width: 200px;

  @media (max-width: 768px) {
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
    color: #007BFF;
  }
`;

const SocialIcons = styled.div`
  margin: 20px 0;

  a {
    color: black;
    margin: 0 15px;
    font-size: 1.5em;
    transition: color 0.3s;

    &:hover {
      color: #007BFF;
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #ccc;
  padding-top: 10px;
`;

const Footer = () => (
  <FooterContainer>
    <FooterContent>
      {[
        { header: "About Us", links: [{ text: "Company Info", href: "/about" }, { text: "Contact Us", href: "/contact" }] },
        { header: "Resources", links: [{ text: "Blog", href: "/blog" }, { text: "Help Center", href: "/help-center" }, { text: "Privacy Policy", href: "/privacy-policy" }] },
        { header: "Quick Links", links: [{ text: "Features", href: "/features" }, { text: "Pricing", href: "/pricing" }, { text: "Sign In", href: "/signin" }] }
      ].map(({ header, links }, idx) => (
        <Column key={idx}>
          <FooterHeader>{header}</FooterHeader>
          {links.map(({ text, href }, i) => (
            <FooterLink key={i} href={href}>{text}</FooterLink>
          ))}
        </Column>
      ))}
    </FooterContent>
    <SocialIcons>
      {[
        { href: "https://facebook.com", icon: <FaFacebookF /> },
        { href: "https://twitter.com", icon: <FaTwitter /> },
        { href: "https://linkedin.com", icon: <FaLinkedinIn /> },
        { href: "https://instagram.com", icon: <FaInstagram /> }
      ].map(({ href, icon }, idx) => (
        <a key={idx} href={href} target="_blank" rel="noopener noreferrer">{icon}</a>
      ))}
    </SocialIcons>
    <FooterBottom>&copy; 2024 Propertilico. All rights reserved.</FooterBottom>
  </FooterContainer>
);

export default Footer;
