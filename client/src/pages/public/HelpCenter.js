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
    <div className="help-container">
      <h1 className="help-title">Help Center</h1>
      <p className="help-text">
        If you need assistance, please feel free to reach out to us through any of the following methods:
      </p>
      <div className="contact-methods">
        {contactMethods.map((method, index) => (
          <div key={index} className="contact-method">
            <a
              href={method.href}
              className="contact-link"
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