
import { useState } from 'react';
import { useRadio } from './useRadioContext';
import { useAuth } from '@/contexts/AuthContext';

export const useBookShow = () => {
  const { addBooking } = useRadio();
  const { user } = useAuth();
  const [selectedStation, setSelectedStation] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStation || !title || !startDate || !endDate) {
      setError('Please fill in all fields');
      return;
    }
    
    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      setError('End time must be after start time');
      return;
    }
    
    try {
      addBooking({
        stationId: selectedStation,
        userId: user?.id || 'guest',
        hostName: user?.username || 'Guest User',
        title,
        startTime: startDate,
        endTime: endDate,
        approved: false
      });
      
      setSuccess('Booking request submitted!');
      setError('');
      setTitle('');
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setSuccess('');
    }
  };

  return {
    selectedStation,
    setSelectedStation,
    title,
    setTitle,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    error,
    success,
    handleSubmit
  };
};
