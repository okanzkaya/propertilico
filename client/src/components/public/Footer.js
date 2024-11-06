import React from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import styles from './Footer.module.css';

const FOOTER_SECTIONS = [
  {
    header: "About Us",
    links: [
      { text: "Company Info", href: "/about", ariaLabel: "Learn more about Propertilico" },
      { text: "Contact Us", href: "/contact", ariaLabel: "Contact Propertilico support" }
    ]
  },
  {
    header: "Resources",
    links: [
      { text: "Blog", href: "/blog", ariaLabel: "Read our property management blog" },
      { text: "Help Center", href: "/help-center", ariaLabel: "Visit our help center" },
      { text: "Privacy Policy", href: "/privacy-policy", ariaLabel: "Read our privacy policy" }
    ]
  },
  {
    header: "Quick Links",
    links: [
      { text: "Features", href: "/features", ariaLabel: "Explore our features" },
      { text: "Pricing", href: "/pricing", ariaLabel: "View our pricing plans" },
      { text: "Sign In", href: "/signin", ariaLabel: "Sign in to your account" }
    ]
  }
];

const SOCIAL_LINKS = [
  { href: "https://facebook.com/propertilico", icon: <FaFacebookF />, label: "Follow us on Facebook" },
  { href: "https://twitter.com/propertilico", icon: <FaTwitter />, label: "Follow us on Twitter" },
  { href: "https://linkedin.com/company/propertilico", icon: <FaLinkedinIn />, label: "Connect with us on LinkedIn" },
  { href: "https://instagram.com/propertilico", icon: <FaInstagram />, label: "Follow us on Instagram" }
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footerContent}>
        {FOOTER_SECTIONS.map(({ header, links }) => (
          <div key={header} className={styles.column}>
            <h2 className={styles.footerHeader}>{header}</h2>
            <nav aria-label={`${header} navigation`}>
              <ul className={styles.linkList}>
                {links.map(({ text, href, ariaLabel }) => (
                  <li key={href}>
                    <a 
                      href={href}
                      className={styles.footerLink}
                      aria-label={ariaLabel}
                    >
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ))}
      </div>

      <div className={styles.socialIcons}>
        {SOCIAL_LINKS.map(({ href, icon, label }) => (
          <a
            key={href}
            href={href}
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
          >
            {icon}
          </a>
        ))}
      </div>

      <div className={styles.footerBottom}>
        <p>
          &copy; {currentYear} Propertilico. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;