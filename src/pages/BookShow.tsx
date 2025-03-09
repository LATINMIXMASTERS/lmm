
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRadio } from "@/contexts/RadioContext";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layout/MainLayout";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CalendarIcon, 
  Clock, 
  Radio, 
  Info, 
  CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addHours, isAfter, addMinutes, isBefore } from "date-fns";

const BookShow: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getStationById, addBooking, bookings, getBookingsForStation } = useRadio();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("12:00");
  const [duration, setDuration] = useState<number>(1);
  const [showTitle, setShowTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [station, setStation] = useState<any>(null);
  const [stationBookings, setStationBookings] = useState<any[]>([]);
  
  useEffect(() => {
    if (!isAuthenticated || !user?.isRadioHost) {
      toast({
        title: "Access denied",
        description: "You must be logged in as a radio host to book a show.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    if (!stationId) {
      navigate("/stations");
      return;
    }
    
    const stationData = getStationById(stationId);
    if (!stationData) {
      toast({
        title: "Station not found",
        description: "The radio station you're looking for doesn't exist.",
        variant: "destructive"
      });
      navigate("/stations");
      return;
    }
    
    setStation(stationData);
    setStationBookings(getBookingsForStation(stationId));
  }, [stationId, isAuthenticated, user, navigate, toast, getStationById, getBookingsForStation]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !startTime || !showTitle || !user) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Parse the selected date and time
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDateTime = new Date(date);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    // Calculate end time based on duration
    const endDateTime = addHours(startDateTime, duration);
    
    // Validate booking is at least 30 minutes in the future
    const minBookingTime = addMinutes(new Date(), 30);
    if (isBefore(startDateTime, minBookingTime)) {
      toast({
        title: "Invalid booking time",
        description: "Shows must be booked at least 30 minutes in advance.",
        variant: "destructive"
      });
      return;
    }
    
    // Check for conflicts with existing bookings
    const hasConflict = stationBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      return (
        (isAfter(startDateTime, bookingStart) && isBefore(startDateTime, bookingEnd)) ||
        (isAfter(endDateTime, bookingStart) && isBefore(endDateTime, bookingEnd)) ||
        (isBefore(startDateTime, bookingStart) && isAfter(endDateTime, bookingEnd))
      );
    });
    
    if (hasConflict) {
      toast({
        title: "Booking conflict",
        description: "Another show is already scheduled during this time.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add the booking
      addBooking({
        stationId: stationId!,
        hostId: user.id,
        hostName: user.username,
        startTime: startDateTime,
        endTime: endDateTime,
        title: showTitle,
        approved: user.isAdmin ? true : false
      });
      
      toast({
        title: "Show booked successfully",
        description: user.isAdmin 
          ? "Your show has been scheduled." 
          : "Your booking request has been submitted and is waiting for approval.",
      });
      
      navigate(`/stations/${stationId}`);
    } catch (error) {
      toast({
        title: "Booking failed",
        description: "There was an error booking your show. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!station) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading...</div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Radio className="text-red-500 mr-2" />
            <h1 className="text-2xl font-bold">Book a Show on {station.name}</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-md text-blue-700">
              <Info className="w-5 h-5 mr-2" />
              <p className="text-sm">Shows must be booked at least 30 minutes in advance. Your booking will need approval unless you're an admin.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date" className="block mb-2">Date</Label>
                  <div className="border rounded-md">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="show-title" className="block mb-2">Show Title</Label>
                    <Input
                      id="show-title"
                      value={showTitle}
                      onChange={(e) => setShowTitle(e.target.value)}
                      placeholder="Enter a title for your show"
                      className="w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="start-time" className="block mb-2">Start Time</Label>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-500" />
                      <Input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration" className="block mb-2">Duration (hours)</Label>
                    <div className="flex items-center">
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="4"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue hover:bg-blue-dark" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Booking..." : "Book Show"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Current Bookings</h2>
            {stationBookings.length > 0 ? (
              <div className="space-y-3">
                {stationBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className={cn(
                      "border rounded-md p-3",
                      booking.approved ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
                    )}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{booking.title}</h3>
                        <p className="text-sm text-gray-600">
                          Host: {booking.hostName}
                        </p>
                      </div>
                      {booking.approved && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm mt-1">
                      {format(new Date(booking.startTime), "MMMM d, yyyy - h:mm a")} to {format(new Date(booking.endTime), "h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No bookings scheduled for this station yet.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookShow;
