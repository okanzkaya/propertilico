import React, { useEffect, useState, useCallback } from 'react';
import { extendSubscription, reduceSubscription, getProtectedData } from '../../api';
import styled from 'styled-components';
import { ClipLoader } from 'react-spinners';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const Info = styled.div`
  text-align: center;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
`;

const Button = styled.button`
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s, transform 0.3s;
  margin-top: 20px;
  margin-right: 10px;

  &:hover {
    background-color: darkblue;
    transform: scale(1.05);
  }

  &:disabled {
    background-color: gray;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  margin-top: 20px;
  color: ${({ $success }) => ($success ? 'green' : 'red')};
  font-size: 1em;
`;

const MyPlan = () => {
  const [state, setState] = useState({
    subscription: null,
    loading: true,
    extending: false,
    reducing: false,
    message: null,
  });

  const handleSubscriptionChange = async (action) => {
    setState((prev) => ({ ...prev, message: null, [action]: true }));
    try {
      const data = await (action === 'extending' ? extendSubscription() : reduceSubscription());
      setState((prev) => ({
        ...prev,
        subscription: data.subscriptionEndDate,
        [action]: false,
        message: {
          text: `Subscription ${action === 'extending' ? 'extended' : 'reduced'} by 1 week.`,
          success: true,
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        [action]: false,
        message: {
          text: `Failed to ${action === 'extending' ? 'extend' : 'reduce'} subscription. Try again later.`,
          success: false,
        },
      }));
    }
  };

  const redirectToLogin = () => {
    window.location.href = '/signin';
  };

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await getProtectedData();
      setState((prev) => ({ ...prev, subscription: data.subscriptionEndDate, loading: false }));
    } catch (error) {
      if (error.response?.status === 401) {
        // Handle token expiration
        redirectToLogin();
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          message: { text: 'Failed to load subscription details. Please try again later.', success: false },
        }));
      }
    }
  }, []);

  const daysLeft = state.subscription
    ? Math.ceil((new Date(state.subscription) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return (
    <Container>
      <Title>My Plan</Title>
      {state.loading ? (
        <ClipLoader size={50} color={"blue"} />
      ) : (
        <Info>
          {state.subscription && new Date(state.subscription) > new Date() ? (
            <>
              <p>Your subscription is active.</p>
              <p>Expiry Date: {new Date(state.subscription).toLocaleDateString()}</p>
              <p>Days Remaining: {daysLeft} days</p>
              <Button
                onClick={() => handleSubscriptionChange('extending')}
                disabled={state.extending || state.reducing}
              >
                {state.extending ? 'Extending...' : 'Extend Subscription by 1 Week'}
              </Button>
              <Button
                onClick={() => handleSubscriptionChange('reducing')}
                disabled={state.extending || state.reducing}
              >
                {state.reducing ? 'Reducing...' : 'Reduce Subscription by 1 Week'}
              </Button>
            </>
          ) : (
            <>
              <p>Your subscription has expired.</p>
              <Button onClick={() => window.location.href = '/pricing'}>Renew Subscription</Button>
            </>
          )}
          {state.message && <Message $success={state.message.success}>{state.message.text}</Message>}
        </Info>
      )}
    </Container>
  );
};

export default MyPlan;
