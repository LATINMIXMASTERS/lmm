
import { useContext } from 'react';
import RadioContext from '@/contexts/RadioContext';

export const useRadio = () => {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
};
