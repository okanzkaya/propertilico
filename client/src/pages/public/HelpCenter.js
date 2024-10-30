import styles from './HelpCenter.module.css';
import React from 'react';
import './HelpCenter.css';

const HelpCenter = () => {
  const contactMethods = [
    {
      href: "https://discord.gg/pseudodiscordlink",
      text: "Join our Discord",
      isExternal: true
    },
    {
      href: "mailto:support@propertilico.com",
      text: "Email us at support@propertilico.com",
      isExternal: false
    }
  ];

  return (
    <div className={styles.helpContainer}>
      <h1 className={styles.helpTitle}>Help Center</h1>
      <p className={styles.helpText}>
        If you need assistance, please feel free to reach out to us through any of the following methods:
      </p>
      <div className={styles.contactMethods}>
        {contactMethods.map((method, index) => (
          <div key={index} className={styles.contactMethod}>
            <a
              href={method.href}
              className={styles.contactLink}
              {...(method.isExternal && {
                target: "_blank",
                rel: "noopener noreferrer"
              })}
            >
              {method.text}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpCenter;