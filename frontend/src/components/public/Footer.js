import React from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

// Schema.org structured data
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Propertilico",
  "description": "Professional property management software solution",
  "url": "https://propertilico.com",
  "sameAs": [
    "https://facebook.com/propertilico",
    "https://twitter.com/propertilico",
    "https://linkedin.com/company/propertilico",
    "https://instagram.com/propertilico"
  ]
};

const FOOTER_SECTIONS = [
  {
    header: "About Us",
    ariaLabel: "About Propertilico",
    links: [
      { 
        text: "Company Info", 
        href: "/about", 
        ariaLabel: "Learn more about Propertilico",
        description: "Discover Propertilico's mission and values" 
      },
      { 
        text: "Contact Us", 
        href: "/contact", 
        ariaLabel: "Contact Propertilico support",
        description: "Get in touch with our support team" 
      }
    ]
  },
  {
    header: "Resources",
    ariaLabel: "Property Management Resources",
    links: [
      { 
        text: "Blog", 
        href: "/blog", 
        ariaLabel: "Read our property management blog",
        description: "Latest insights on property management" 
      },
      { 
        text: "Help Center", 
        href: "/help-center", 
        ariaLabel: "Visit our help center",
        description: "Find answers to common questions" 
      },
      { 
        text: "Privacy Policy", 
        href: "/privacy-policy", 
        ariaLabel: "Read our privacy policy",
        description: "Learn about our data protection practices" 
      }
    ]
  },
  {
    header: "Quick Links",
    ariaLabel: "Quick Access Links",
    links: [
      { 
        text: "Features", 
        href: "/features", 
        ariaLabel: "Explore our features",
        description: "Discover our powerful property management tools" 
      },
      { 
        text: "Pricing", 
        href: "/pricing", 
        ariaLabel: "View our pricing plans",
        description: "Find the perfect plan for your needs" 
      },
      { 
        text: "Sign In", 
        href: "/signin", 
        ariaLabel: "Sign in to your account",
        description: "Access your property management dashboard" 
      }
    ]
  }
];

const SOCIAL_LINKS = [
  { 
    href: "https://facebook.com/propertilico", 
    icon: <FaFacebookF />, 
    label: "Follow us on Facebook",
    name: "Facebook"
  },
  { 
    href: "https://twitter.com/propertilico", 
    icon: <FaTwitter />, 
    label: "Follow us on Twitter",
    name: "Twitter"
  },
  { 
    href: "https://linkedin.com/company/propertilico", 
    icon: <FaLinkedinIn />, 
    label: "Connect with us on LinkedIn",
    name: "LinkedIn"
  },
  { 
    href: "https://instagram.com/propertilico", 
    icon: <FaInstagram />, 
    label: "Follow us on Instagram",
    name: "Instagram"
  }
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo" itemScope itemType="https://schema.org/WPFooter">
      {/* Add structured data */}
      <script type="application/ld+json">
        {JSON.stringify(ORGANIZATION_SCHEMA)}
      </script>

      <div className={styles.footerContent}>
        {FOOTER_SECTIONS.map(({ header, links, ariaLabel }) => (
          <div key={header} className={styles.column}>
            <h2 className={styles.footerHeader}>{header}</h2>
            <nav aria-label={ariaLabel} itemScope itemType="https://schema.org/SiteNavigationElement">
              <ul className={styles.linkList}>
                {links.map(({ text, href, ariaLabel, description }) => (
                  <li key={href}>
                    <Link 
                      to={href}
                      className={styles.footerLink}
                      aria-label={ariaLabel}
                      itemProp="url"
                      title={description}
                    >
                      <span itemProp="name">{text}</span>
                      <meta itemProp="description" content={description} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ))}
      </div>

      <div className={styles.socialIcons} itemScope itemType="https://schema.org/Organization">
        <meta itemProp="name" content="Propertilico" />
        {SOCIAL_LINKS.map(({ href, icon, label, name }) => (
          <a
            key={href}
            href={href}
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            itemProp="sameAs"
            title={`Follow Propertilico on ${name}`}
          >
            {icon}
          </a>
        ))}
      </div>

      <div className={styles.footerBottom}>
        <p>
          <span itemProp="copyrightYear">{currentYear}</span> © 
          <span itemProp="copyrightHolder" itemScope itemType="https://schema.org/Organization">
            <span itemProp="name"> Propertilico</span>
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default React.memo(Footer);