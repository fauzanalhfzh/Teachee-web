import { useState, useEffect } from 'react';
import { getAuthToken } from '../services/authService';

export default function useAuth() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(getAuthToken());
  }, []);

  return { token };
}
