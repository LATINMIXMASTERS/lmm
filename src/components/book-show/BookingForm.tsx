
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
  station: RadioStation;
  isVerifiedHost: boolean;
  userId: string;
  username: string;
  onBookShow: (bookingData: {
    stationId: string;
    hostId: string;
    hostName: string;
    title: string;
    startTime: string;
    endTime: string;
    approved: boolean;
  }) => void;
  hasBookingConflict: (stationId: string, startTime: Date, endTime: Date) => boolean;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  station,
  isVerifiedHost,
  userId,
  username,
  onBookShow,
  hasBookingConflict,
  onCancel
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

  const handleSubmit = () => {
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
    
    if (hasBookingConflict(station.id, startDateTime, endDateTime)) {
      toast({
        title: "Time slot unavailable",
        description: "This time slot conflicts with an existing booking",
        variant: "destructive"
      });
      return;
    }
    
    onBookShow({
      stationId: station.id,
      hostId: userId,
      hostName: username,
      title: showTitle,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      approved: isVerifiedHost // Auto-approve for verified hosts
    });
  };

  // Disable past dates in the calendar
  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(now));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Show Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="showTitle">Show Title</Label>
            <Input
              id="showTitle"
              value={showTitle}
              onChange={(e) => setShowTitle(e.target.value)}
              placeholder="Enter your show title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's your show about?"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !showDate && "text-muted-foreground",
                      errors.date && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {showDate ? format(showDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={showDate}
                    onSelect={setShowDate}
                    disabled={isDateDisabled}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select 
                value={startTime} 
                onValueChange={setStartTime}
              >
                <SelectTrigger className={errors.time ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Duration (hours)</Label>
              <Select 
                value={duration} 
                onValueChange={setDuration}
              >
                <SelectTrigger className={errors.duration ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option} hour{option !== '1' ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleSubmit} className="w-full">
              Book Show
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
