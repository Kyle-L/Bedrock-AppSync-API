import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function Protected({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, loaded } = useAuth();

  useEffect(() => {
    if (!loaded) {
      return;
    }

    if (!user) {
      navigate('/auth/login');
    }
  }, [loaded, user]);

  return <>{children}</>;
}
