import { useEffect, useState } from 'react';
import { authService } from '../services/authService';

export const useReadOnlyMode = () => {
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsReadOnly(user?.rol === 5); // El rol 5 (Observador) siempre está en modo solo lectura
  }, []);

  return isReadOnly;
}; 