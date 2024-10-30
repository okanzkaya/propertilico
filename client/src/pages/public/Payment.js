import styles from './Payment.module.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

function Payment() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Placeholder for payment logic
    // Make an API call to process the payment
    // If successful, mark the user's subscription as active in the backend
    alert('Payment successful (this is a placeholder)');
    navigate('/app/dashboard'); // Redirect to the app after successful payment
  };

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentBox}>
        <h1 className={styles.header}>Payment</h1>
        <p className={styles.description}>Enter your payment details to start your subscription.</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Card Number" 
            className={styles.paymentInput}
          />
          <input 
            type="text" 
            placeholder="Expiry Date" 
            className={styles.paymentInput}
          />
          <input 
            type="text" 
            placeholder="CVC" 
            className={styles.paymentInput}
          />
          <button type="submit" className={styles.paymentButton}>
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;