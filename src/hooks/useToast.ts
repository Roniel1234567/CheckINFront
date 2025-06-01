import { useCallback } from 'react';
import { useSnackbar } from 'notistack';

export const useToast = () => {
  const { enqueueSnackbar } = useSnackbar();

  const success = useCallback((message: string) => {
    enqueueSnackbar(message, { variant: 'success' });
  }, [enqueueSnackbar]);

  const error = useCallback((message: string) => {
    enqueueSnackbar(message, { variant: 'error' });
  }, [enqueueSnackbar]);

  const warning = useCallback((message: string) => {
    enqueueSnackbar(message, { variant: 'warning' });
  }, [enqueueSnackbar]);

  const info = useCallback((message: string) => {
    enqueueSnackbar(message, { variant: 'info' });
  }, [enqueueSnackbar]);

  return {
    success,
    error,
    warning,
    info
  };
};

export default useToast; 