// src/pages/FAQ.js
import React, { useState } from 'react';
import styled from 'styled-components';

const FAQContainer = styled.div`
  padding: 60px 20px;
  background-color: #f8f8f8;
  color: #333;
  text-align: center;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.h1`
  font-size: 2.5em;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 2em;
  }
`;

const Description = styled.p`
  font-size: 1.2em;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    font-size: 1em;
    margin-bottom: 20px;
  }
`;

const FAQList = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
`;

const FAQItem = styled.div`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  margin-bottom: 10px;
  padding: 20px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    transform: scale(1.02);
  }
`;

const Question = styled.h3`
  font-size: 1.2em;
  margin: 0;
`;

const Answer = styled.p`
  font-size: 1em;
  margin-top: 10px;
  color: #666;
  display: ${props => (props.isOpen ? 'block' : 'none')};
  transition: all 0.3s;
`;

const faqData = [
  {
    question: 'What is Propertilico?',
    answer: 'Propertilico is a cutting-edge property management solution designed to streamline and optimize property management tasks, making them effortless and efficient.'
  },
  {
    question: 'How can I start using Propertilico?',
    answer: 'You can start using Propertilico by signing up for a free trial on our website. Just click the "Get Started" button and follow the instructions.'
  },
  {
    question: 'Is there customer support available?',
    answer: 'Yes, we offer 24/7 customer support to assist you with any questions or issues you may have while using Propertilico.'
  },
  {
    question: 'Can I integrate Propertilico with other tools?',
    answer: 'Absolutely! Propertilico offers seamless integration with various tools to ensure a smooth workflow.'
  },
  {
    question: 'Is my data secure with Propertilico?',
    answer: 'Yes, data security is our top priority. Propertilico uses advanced security measures to ensure your data is always protected.'
  }
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = index => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <FAQContainer>
      <Header>Frequently Asked Questions</Header>
      <Description>Find answers to the most common questions about Propertilico.</Description>
      <FAQList>
        {faqData.map((item, index) => (
          <FAQItem key={index} onClick={() => toggleFAQ(index)}>
            <Question>{item.question}</Question>
            <Answer isOpen={openIndex === index}>{item.answer}</Answer>
          </FAQItem>
        ))}
      </FAQList>
    </FAQContainer>
  );
}

export default FAQ;
