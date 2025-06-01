import React, { createContext, useContext, ReactNode } from 'react';
import { authService } from '../services/authService';

interface ReadOnlyContextType {
  isReadOnly: boolean;
}

const ReadOnlyContext = createContext<ReadOnlyContextType>({ isReadOnly: false });

export const useReadOnly = () => useContext(ReadOnlyContext);

export const ReadOnlyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const user = authService.getCurrentUser();
  const isReadOnly = user?.rol === 5; // El rol 5 (Observador) siempre está en modo solo lectura

  return (
    <ReadOnlyContext.Provider value={{ isReadOnly }}>
      {children}
    </ReadOnlyContext.Provider>
  );
}; 