// src/pages/ContactUs.js
import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Handle form submission
      console.log('Form data submitted:', formData);
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title">Contact Us</h1>
      <p className="contact-text">
        If you have any questions or need assistance, please fill out the form below, 
        and we'll get back to you as soon as possible.
      </p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          className="form-input"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          className="form-input"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          rows="5"
          className="form-textarea"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit" className="submit-button">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactUs;