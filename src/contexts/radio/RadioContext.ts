
import { createContext } from 'react';
import { RadioContextType } from './types';

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export default RadioContext;
