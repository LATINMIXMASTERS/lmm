
import { useState } from 'react';
import { useRadio } from './useRadioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export const useBookShow = () => {
  const { addBooking, stations } = useRadio();
  const { user } = useAuth();
  const { toast } = useToast();
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
      // Find the station to get its name
      const station = stations.find(s => s.id === selectedStation);
      
      if (!station) {
        setError('Selected station not found');
        return;
      }
      
      const result = addBooking({
        stationId: selectedStation,
        userId: user?.id || 'guest',
        hostName: user?.username || 'Guest User',
        title,
        startTime: startDate,
        endTime: endDate,
        stationName: station.name,
        approved: false
      });
      
      if (result) {
        setSuccess('Booking request submitted!');
        toast({
          title: "Booking submitted",
          description: "Your show booking request has been submitted successfully",
        });
        
        // Reset form
        setError('');
        setTitle('');
        setStartDate('');
        setEndDate('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setSuccess('');
      toast({
        title: "Booking error",
        description: err.message || 'An error occurred while submitting your booking',
        variant: "destructive"
      });
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
