import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      currency: 'MYR',
      autoTemplate: true,
      customTemplate: null,
      logo: null,
    };
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(state));
  }, [state]);

  const setCurrency = (currency) => setState(prev => ({ ...prev, currency }));
  const setAutoTemplate = (autoTemplate) => setState(prev => ({ ...prev, autoTemplate }));
  const setCustomTemplate = (customTemplate) => setState(prev => ({ ...prev, customTemplate }));
  const setLogo = (logo) => setState(prev => ({ ...prev, logo }));

  return (
    <AppContext.Provider value={{ ...state, setCurrency, setAutoTemplate, setCustomTemplate, setLogo }}>
      {children}
    </AppContext.Provider>
  );
};
