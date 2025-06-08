
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CSRFContextType {
  token: string | null;
  getToken: () => string | null;
  validateToken: (token: string) => boolean;
}

const CSRFContext = createContext<CSRFContextType | null>(null);

export const CSRFProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Generate CSRF token
    const generateToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };

    const newToken = generateToken();
    setToken(newToken);
    sessionStorage.setItem('csrf-token', newToken);
    
    // Set in meta tag for forms
    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    if (metaTag) {
      metaTag.content = newToken;
    }
  }, []);

  const getToken = () => {
    return sessionStorage.getItem('csrf-token');
  };

  const validateToken = (submittedToken: string) => {
    const storedToken = sessionStorage.getItem('csrf-token');
    return storedToken === submittedToken && submittedToken.length > 0;
  };

  const value = {
    token,
    getToken,
    validateToken,
  };

  return (
    <CSRFContext.Provider value={value}>
      {children}
    </CSRFContext.Provider>
  );
};

export const useCSRF = () => {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF must be used within CSRFProvider');
  }
  return context;
};

// HOC for forms with CSRF protection
export const withCSRFProtection = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const { getToken } = useCSRF();
    
    return (
      <Component 
        {...props} 
        csrfToken={getToken()}
      />
    );
  };
};
