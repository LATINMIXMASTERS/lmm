
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateTimeInputsProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

const DateTimeInputs: React.FC<DateTimeInputsProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  // Function to ensure we don't select dates in the past
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // If end date is now before start date, update it
    if (endDate && new Date(newStartDate) >= new Date(endDate)) {
      // Set end date to start date + 1 hour
      const newEndDate = new Date(newStartDate);
      newEndDate.setHours(newEndDate.getHours() + 1);
      setEndDate(newEndDate.toISOString().slice(0, 16));
    }
  };

  // Ensure we can't select end dates before start dates
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    if (!startDate || new Date(newEndDate) > new Date(startDate)) {
      setEndDate(newEndDate);
    } else {
      // If invalid selection, set to start date + 1 hour
      const newEndDate = new Date(startDate);
      newEndDate.setHours(newEndDate.getHours() + 1);
      setEndDate(newEndDate.toISOString().slice(0, 16));
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="startDate">Start Date and Time</Label>
        <Input
          id="startDate"
          type="datetime-local"
          value={startDate}
          onChange={handleStartDateChange}
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>
      <div>
        <Label htmlFor="endDate">End Date and Time</Label>
        <Input
          id="endDate"
          type="datetime-local"
          value={endDate}
          onChange={handleEndDateChange}
          min={startDate || new Date().toISOString().slice(0, 16)}
        />
      </div>
    </div>
  );
};

export default DateTimeInputs;
