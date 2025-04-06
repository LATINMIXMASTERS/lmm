
import React, { useState, useEffect } from 'react';
import { format, addHours, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RadioStation } from '@/models/RadioStation';

interface BookingFormProps {
  stations: RadioStation[];
  selectedStation: string;
  setSelectedStation: (stationId: string) => void;
  title: string;
  setTitle: (title: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  error: string;
  success: string;
  handleSubmit: (e: React.FormEvent) => void;
  isPrivilegedUser: boolean;
  userId: string | undefined;
  username: string | undefined;
}

const BookingForm: React.FC<BookingFormProps> = ({
  stations,
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
  handleSubmit: onSubmitBooking, // Rename the prop to avoid conflict
  isPrivilegedUser,
  userId,
  username
}) => {
  const { toast } = useToast();
  const [showTitle, setShowTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDate, setShowDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('12:00');
  const [duration, setDuration] = useState('1');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Get current date and time for validation
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
  
  // Filter time slots to only show future times for today
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
  
  const timeSlots = generateTimeSlots();
  const durationOptions = ['1', '2', '3', '4'];

  // When date changes, reset time if needed
  useEffect(() => {
    if (showDate && isSameDay(showDate, now)) {
      // If the currently selected time is in the past, reset it
      const selectedHour = parseInt(startTime.split(':')[0]);
      if (selectedHour < currentHour) {
        setStartTime(`${currentHour.toString().padStart(2, '0')}:00`);
      }
    }
  }, [showDate]);

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

  const calculateEndTime = () => {
    if (!showDate) return null;
    
    const [hours] = startTime.split(':').map(Number);
    const durationHours = parseInt(duration);
    
    const startDateTime = new Date(showDate);
    startDateTime.setHours(hours, 0, 0, 0);
    
    const endDateTime = addHours(startDateTime, durationHours);
    return endDateTime;
  };

  // Renamed to processSubmit to avoid conflict with the prop
  const processSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const startDateTime = new Date(showDate!);
    const [hours] = startTime.split(':').map(Number);
    startDateTime.setHours(hours, 0, 0, 0);
    
    const endDateTime = calculateEndTime();
    
    if (!endDateTime) {
      toast({
        title: "Invalid time",
        description: "Please select a valid date and time",
        variant: "destructive"
      });
      return;
    }
    
    // Use the parent's handleSubmit (renamed to onSubmitBooking)
    onSubmitBooking(e);
  };

  // Disable past dates in the calendar
  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(now));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Radio Show</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={processSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="station">Select Station</Label>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Show Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your show title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date and Time</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date and Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-500 text-sm">{success}</div>}
            
            <Button type="submit" className="w-full">
              {isPrivilegedUser ? 'Book Show' : 'Request Booking'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
