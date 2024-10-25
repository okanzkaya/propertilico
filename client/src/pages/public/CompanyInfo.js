import React from 'react';
import './CompanyInfo.css';

const CompanyInfo = () => {
  const teamMembers = [
    {
      name: 'John Doe',
      role: 'CEO',
      bio: '[Fill in bio or description here.]'
    },
    {
      name: 'Jane Smith',
      role: 'CTO',
      bio: '[Fill in bio or description here.]'
    }
  ];

  const contactInfo = {
    email: 'support@propertilico.com',
    phone: '(123) 456-7890',
    address: '[Fill in address here.]'
  };

  return (
    <div className="company-container">
      <h1 className="company-title">About Us</h1>
      
      <section className="company-section">
        <h2 className="section-title">Company Overview</h2>
        <p className="section-text">
          Our company, Propertilico, is dedicated to providing top-notch property management solutions. [Fill in detailed overview here.]
        </p>
      </section>

      <section className="company-section">
        <h2 className="section-title">Mission</h2>
        <p className="section-text">
          Our mission is to [Fill in mission statement here.]
        </p>
      </section>

      <section className="company-section">
        <h2 className="section-title">Vision</h2>
        <p className="section-text">
          Our vision is to [Fill in vision statement here.]
        </p>
      </section>

      <section className="company-section">
        <h2 className="section-title">Our Team</h2>
        {teamMembers.map((member, index) => (
          <div className="team-member" key={index}>
            <h3 className="member-name">{member.name}</h3>
            <p className="member-role">{member.role}</p>
            <p className="section-text">{member.bio}</p>
          </div>
        ))}
      </section>

      <section className="company-section">
        <h2 className="section-title">Contact Information</h2>
        <div className="contact-info">
          <p className="section-text">You can reach us at:</p>
          <p className="section-text">Email: {contactInfo.email}</p>
          <p className="section-text">Phone: {contactInfo.phone}</p>
          <p className="section-text">Address: {contactInfo.address}</p>
        </div>
      </section>
    </div>
  );
};

export default CompanyInfo;