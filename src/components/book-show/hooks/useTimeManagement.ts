
import { useState, useEffect } from 'react';
import { addHours } from 'date-fns';

interface TimeManagementProps {
  showDate: Date | undefined;
}

export const useTimeManagement = ({ showDate }: TimeManagementProps) => {
  const [startTime, setStartTime] = useState('12:00');
  const [duration, setDuration] = useState('1');
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  // Generate time slots, filtering out past hours for today
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      slots.push(`${hour}:00`);
    }
    
    // If the selected date is today, filter out past hours
    if (showDate && isSameDay(showDate, now)) {
      return slots.filter(slot => {
        const slotHour = parseInt(slot.split(':')[0]);
        return slotHour >= currentHour;
      });
    }
    
    return slots;
  };
  
  // When date changes, reset time if needed
  useEffect(() => {
    if (showDate && isSameDay(showDate, now)) {
      // If the currently selected time is in the past, reset it
      const selectedHour = parseInt(startTime.split(':')[0]);
      if (selectedHour < currentHour) {
        setStartTime(`${currentHour.toString().padStart(2, '0')}:00`);
      }
    }
  }, [showDate, currentHour, startTime]);
  
  const calculateEndTime = () => {
    if (!showDate) return null;
    
    const [hours] = startTime.split(':').map(Number);
    const durationHours = parseInt(duration);
    
    const startDateTime = new Date(showDate);
    startDateTime.setHours(hours, 0, 0, 0);
    
    const endDateTime = addHours(startDateTime, durationHours);
    return endDateTime;
  };
  
  const timeSlots = generateTimeSlots();
  const durationOptions = ['1', '2', '3', '4'];
  
  return {
    startTime,
    setStartTime,
    duration,
    setDuration,
    timeSlots,
    durationOptions,
    calculateEndTime,
    isSameDay,
    now,
    currentHour
  };
};

export default useTimeManagement;
