import styles from './CompanyInfo.module.css';
import React from 'react';

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
    <div className={styles.companyContainer}>
      <h1 className={styles.companyTitle}>About Us</h1>
      
      <section className={styles.companySection}>
        <h2 className={styles.sectionTitle}>Company Overview</h2>
        <p className={styles.sectionText}>
          Our company, Propertilico, is dedicated to providing top-notch property management solutions. [Fill in detailed overview here.]
        </p>
      </section>

      <section className={styles.companySection}>
        <h2 className={styles.sectionTitle}>Mission</h2>
        <p className={styles.sectionText}>
          Our mission is to [Fill in mission statement here.]
        </p>
      </section>

      <section className={styles.companySection}>
        <h2 className={styles.sectionTitle}>Vision</h2>
        <p className={styles.sectionText}>
          Our vision is to [Fill in vision statement here.]
        </p>
      </section>

      <section className={styles.companySection}>
        <h2 className={styles.sectionTitle}>Our Team</h2>
        {teamMembers.map((member, index) => (
          <div className={styles.teamMember} key={index}>
            <h3 className={styles.memberName}>{member.name}</h3>
            <p className={styles.memberRole}>{member.role}</p>
            <p className={styles.sectionText}>{member.bio}</p>
          </div>
        ))}
      </section>

      <section className={styles.companySection}>
        <h2 className={styles.sectionTitle}>Contact Information</h2>
        <div className={styles.contactInfo}>
          <p className={styles.sectionText}>You can reach us at:</p>
          <p className={styles.sectionText}>Email: {contactInfo.email}</p>
          <p className={styles.sectionText}>Phone: {contactInfo.phone}</p>
          <p className={styles.sectionText}>Address: {contactInfo.address}</p>
        </div>
      </section>
    </div>
  );
};

export default CompanyInfo;