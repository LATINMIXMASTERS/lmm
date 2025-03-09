
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
  CheckCircle2,
  AlertCircle
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
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [newBooking, setNewBooking] = useState<any>(null);
  
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
      const booking = addBooking({
        stationId: stationId!,
        hostId: user.id,
        hostName: user.username,
        startTime: startDateTime,
        endTime: endDateTime,
        title: showTitle,
        approved: user.isAdmin ? true : false
      });
      
      setNewBooking(booking);
      setBookingSuccess(true);
      
      toast({
        title: "Show booked successfully",
        description: user.isAdmin 
          ? "Your show has been scheduled." 
          : "Your booking request has been submitted and is waiting for approval.",
      });
      
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
  
  if (bookingSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center mb-6">
              <CheckCircle2 className="text-green-500 mr-2" />
              <h1 className="text-2xl font-bold">Show Booked Successfully</h1>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center mb-4 p-3 bg-green-50 rounded-md text-green-700">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <p className="text-sm">
                  {newBooking?.approved 
                    ? "Your show has been scheduled successfully." 
                    : "Your booking request has been submitted and is waiting for approval."}
                </p>
              </div>
              
              <div className="border border-gray-100 rounded-lg p-4 mb-6">
                <h2 className="font-semibold text-lg mb-2">{newBooking?.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      {format(new Date(newBooking?.startTime), "MMMM d, yyyy")}
                    </p>
                    <p className="text-gray-600">
                      <Clock className="w-4 h-4 inline mr-2" />
                      {format(new Date(newBooking?.startTime), "h:mm a")} - {format(new Date(newBooking?.endTime), "h:mm a")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      <Radio className="w-4 h-4 inline mr-2" />
                      {station.name}
                    </p>
                    <p className="text-gray-600">
                      Host: {newBooking?.hostName}
                    </p>
                  </div>
                </div>
              </div>
              
              {station.streamDetails && newBooking?.approved ? (
                <div className="border border-blue-100 rounded-lg p-4 mb-6 bg-blue-50">
                  <h3 className="font-semibold mb-3 text-blue-800">Stream Connection Details</h3>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-md border border-blue-100">
                      <div className="text-sm font-medium text-gray-500">Stream URL</div>
                      <div>{station.streamDetails.url}</div>
                    </div>
                    <div className="bg-white p-3 rounded-md border border-blue-100">
                      <div className="text-sm font-medium text-gray-500">Port</div>
                      <div>{station.streamDetails.port}</div>
                    </div>
                    <div className="bg-white p-3 rounded-md border border-blue-100">
                      <div className="text-sm font-medium text-gray-500">Password</div>
                      <div>{station.streamDetails.password}</div>
                    </div>
                  </div>
                  <div className="flex items-center mt-4 p-3 rounded-md bg-blue-100 text-blue-800">
                    <Info className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">You can use these settings to connect broadcasting software like VirtualDJ, OBS, or other Shoutcast-compatible software.</p>
                  </div>
                </div>
              ) : newBooking?.approved ? (
                <div className="border border-yellow-100 rounded-lg p-4 mb-6 bg-yellow-50">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                    <p className="text-yellow-800">Stream connection details will be available once the admin sets them up.</p>
                  </div>
                </div>
              ) : (
                <div className="border border-yellow-100 rounded-lg p-4 mb-6 bg-yellow-50">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                    <p className="text-yellow-800">Stream connection details will be available after your booking is approved.</p>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button 
                  onClick={() => navigate(`/stations/${stationId}`)}
                  className="bg-blue hover:bg-blue-dark"
                >
                  View Station
                </Button>
                <Button 
                  onClick={() => {
                    setBookingSuccess(false);
                    setShowTitle("");
                    setDate(new Date());
                    setStartTime("12:00");
                    setDuration(1);
                  }}
                  variant="outline"
                >
                  Book Another Show
                </Button>
              </div>
            </div>
          </div>
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
