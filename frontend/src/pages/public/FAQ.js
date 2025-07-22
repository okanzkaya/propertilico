import styles from './FAQ.module.css';
import React, { useState } from 'react';

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

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      <h1 className={styles.faqHeader}>Frequently Asked Questions</h1>
      <p className={styles.faqDescription}>
        Find answers to the most common questions about Propertilico.
      </p>
      <div className={styles.faqList}>
        {faqData.map((item, index) => (
          <div
            key={index}
            className={styles.faqItem}
            onClick={() => toggleFAQ(index)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') toggleFAQ(index);
            }}
          >
            <h3 className={styles.faqQuestion}>{item.question}</h3>
            <p className={`faq-answer ${openIndex === index ? styles.open : ''}`}>
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;