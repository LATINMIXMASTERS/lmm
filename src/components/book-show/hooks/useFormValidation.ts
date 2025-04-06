
import { useState, useEffect } from 'react';
import { isBefore, startOfDay } from 'date-fns';

interface ValidationHookProps {
  showTitle: string;
  showDate: Date | undefined;
  startTime: string;
  duration: string;
}

export const useFormValidation = ({ 
  showTitle, 
  showDate, 
  startTime, 
  duration 
}: ValidationHookProps) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const now = new Date();
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!showTitle.trim()) {
      newErrors.title = "Show title is required";
    }
    
    if (!showDate) {
      newErrors.date = "Date is required";
    } else {
      // Check if the selected date is in the past
      const selectedDate = new Date(showDate);
      const today = startOfDay(new Date());
      
      if (isBefore(selectedDate, today)) {
        newErrors.date = "Cannot book shows in the past";
      }
    }
    
    if (!startTime) {
      newErrors.time = "Start time is required";
    }
    
    if (!duration) {
      newErrors.duration = "Duration is required";
    }
    
    // Check if the selected datetime is in the past
    if (showDate && startTime) {
      const [hours] = startTime.split(':').map(Number);
      const selectedDateTime = new Date(showDate);
      selectedDateTime.setHours(hours, 0, 0, 0);
      
      if (isBefore(selectedDateTime, now)) {
        newErrors.time = "Cannot book a show in the past";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return {
    errors,
    validateForm
  };
};

export default useFormValidation;
