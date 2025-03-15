
import { useContext } from 'react';
import { RadioContext } from '@/contexts/radio';

export const useRadio = () => {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
};

export default useRadio;
