import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const RouterHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle preview page redirect
    if (location.pathname.includes('preview_page.html')) {
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};