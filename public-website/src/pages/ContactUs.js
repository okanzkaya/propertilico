// src/pages/ContactUs.js
import React, { useState } from 'react';
import styled from 'styled-components';

const ContactContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const ContactTitle = styled.h1`
  margin-bottom: 20px;
  color: #007BFF;
`;

const ContactText = styled.p`
  font-size: 1.2em;
  color: #666;
  margin-bottom: 30px;
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  resize: none;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.2em;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form data submitted:', formData);
  };

  return (
    <ContactContainer>
      <ContactTitle>Contact Us</ContactTitle>
      <ContactText>
        If you have any questions or need assistance, please fill out the form below, and we'll get back to you as soon as possible.
      </ContactText>
      <ContactForm onSubmit={handleSubmit}>
        <Input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextArea
          name="message"
          rows="5"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <Button type="submit">Send Message</Button>
      </ContactForm>
    </ContactContainer>
  );
};

export default ContactUs;
