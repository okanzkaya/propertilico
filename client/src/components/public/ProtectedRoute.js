import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProtectedData } from '../../api';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      try {
        const { subscriptionEndDate } = await getProtectedData();
        const isValidSubscription = new Date(subscriptionEndDate) > new Date();
        setIsAuthenticated(isValidSubscription);
        if (!isValidSubscription) navigate('/my-plan', { replace: true });
      } catch {
        navigate('/signin', { replace: true });
      }
    };

    checkAuthAndSubscription();
  }, [navigate]);

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
