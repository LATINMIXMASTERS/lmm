
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Radio } from 'lucide-react';
import { format, addHours, isBefore, startOfDay } from 'date-fns';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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

const BookShow: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const { isAuthenticated, user } = useAuth();
  const { stations, addBooking, hasBookingConflict } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [station, setStation] = useState<any>(null);
  const [showTitle, setShowTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDate, setShowDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('12:00');
  const [duration, setDuration] = useState('1');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Check if user is admin or host (privileged users)
  const isPrivilegedUser = isAuthenticated && (user?.isAdmin || user?.isRadioHost);
  
  // Get current date and time for validation
  const now = new Date();
  const currentHour = now.getHours();
  
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
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
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
  }, [showDate]);

  useEffect(() => {
    // Redirect if not authenticated or not a host/admin
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isPrivilegedUser) {
      navigate('/stations');
      toast({
        title: "Access Denied",
        description: "Only hosts and admins can book shows",
        variant: "destructive"
      });
      return;
    }
    
    if (stationId) {
      const foundStation = stations.find(s => s.id === stationId);
      if (foundStation) {
        setStation(foundStation);
      } else {
        navigate('/stations');
        toast({
          title: "Station not found",
          description: "The station you're looking for doesn't exist",
          variant: "destructive"
        });
      }
    } else {
      navigate('/stations');
    }
  }, [stationId, stations, isAuthenticated, isPrivilegedUser, navigate, toast]);

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

  const handleBookShow = () => {
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
    
    // Hosts with verified accounts can book without approval
    const isVerifiedHost = user?.isAdmin === true || user?.isRadioHost === true;
    
    addBooking({
      stationId: station.id,
      hostId: user?.id || '',
      hostName: user?.username || 'Anonymous',
      title: showTitle,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      approved: isVerifiedHost // Auto-approve for verified hosts
    });
    
    const approvalMessage = isVerifiedHost 
      ? "Your show has been booked successfully!"
      : "Your booking request has been submitted for approval";
    
    toast({
      title: isVerifiedHost ? "Show Booked" : "Request Submitted",
      description: approvalMessage,
    });
    navigate('/stations');
  };

  // Disable past dates in the calendar
  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(now));
  };

  if (!station || !isPrivilegedUser) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Book a Show on {station.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
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
                    <Button onClick={handleBookShow} className="w-full">
                      Book Show
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Station Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <img src={station.image} alt={station.name} className="w-20 h-20 rounded-md object-cover" />
                  <div>
                    <h2 className="font-semibold">{station.name}</h2>
                    <p className="text-sm text-muted-foreground">Genre: {station.genre}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Radio className="h-3 w-3 mr-1" />
                      <span>{station.listeners} listeners</span>
                    </div>
                  </div>
                </div>
                
                {station.broadcastTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                    <Clock className="h-4 w-4" />
                    <span>Regular broadcast: {station.broadcastTime}</span>
                  </div>
                )}
                
                {station.streamDetails && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <h3 className="text-sm font-medium mb-2">Shoutcast Stream Info:</h3>
                    <div className="text-xs space-y-1">
                      <p>Server: {station.streamDetails.url}</p>
                      <p>Port: {station.streamDetails.port}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-sm">
                  <p>Before booking, please note:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                    <li>Verified hosts can book shows instantly</li>
                    <li>Time slots are 1-4 hours in duration</li>
                    <li>You cannot book shows in the past</li>
                    <li>Please be ready 15 minutes before your slot</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookShow;
