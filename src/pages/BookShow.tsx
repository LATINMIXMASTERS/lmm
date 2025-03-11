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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  CalendarIcon, 
  Clock, 
  Radio, 
  Info, 
  CheckCircle2,
  AlertCircle,
  X,
  Edit,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addHours, isAfter, addMinutes, isBefore, startOfHour, endOfHour, setHours, setMinutes, isToday } from "date-fns";

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  return {
    value: hour < 10 ? `0${hour}:00` : `${hour}:00`,
    label: format(setHours(new Date(), hour), 'h:00 a'),
    hour
  };
});

const BookShow: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    getStationById, 
    addBooking, 
    bookings, 
    getBookingsForStation, 
    hasBookingConflict,
    cancelBooking,
    updateBooking,
    getBookingsForToday
  } = useRadio();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("12:00");
  const [showTitle, setShowTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [station, setStation] = useState<any>(null);
  const [stationBookings, setStationBookings] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [newBooking, setNewBooking] = useState<any>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  
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
    updateStationBookings();
  }, [stationId, isAuthenticated, user, navigate, toast, getStationById, getBookingsForStation]);
  
  const updateStationBookings = () => {
    if (!stationId) return;
    const bookingsData = getBookingsForStation(stationId);
    setStationBookings(bookingsData);
    
    const todayData = getBookingsForToday(stationId);
    setTodayBookings(todayData);
    
    if (date) {
      updateAvailableTimeSlots(date);
    }
  };
  
  useEffect(() => {
    if (date) {
      updateAvailableTimeSlots(date);
    }
  }, [date, stationBookings]);
  
  const updateAvailableTimeSlots = (selectedDate: Date) => {
    const slots = TIME_SLOTS.map(slot => {
      const [hours] = slot.value.split(':').map(Number);
      const slotDate = new Date(selectedDate);
      slotDate.setHours(hours, 0, 0, 0);
      
      const endTime = addHours(slotDate, 1);
      
      const isBooked = hasBookingConflict(stationId!, slotDate, endTime, editingBookingId || undefined);
      
      const isPast = isAfter(new Date(), endTime);
      
      return {
        ...slot,
        isBooked,
        isPast,
        isAvailable: !isBooked && !isPast
      };
    });
    
    setAvailableTimeSlots(slots);
    
    const currentSlot = slots.find(slot => slot.value === selectedTimeSlot);
    if (currentSlot && !currentSlot.isAvailable) {
      const firstAvailable = slots.find(slot => slot.isAvailable);
      if (firstAvailable) {
        setSelectedTimeSlot(firstAvailable.value);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !selectedTimeSlot || !showTitle || !user) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const [hours] = selectedTimeSlot.split(":").map(Number);
    const startDateTime = new Date(date);
    startDateTime.setHours(hours, 0, 0, 0);
    
    const endDateTime = addHours(startDateTime, 1);
    
    const minBookingTime = addMinutes(new Date(), 30);
    if (isBefore(startDateTime, minBookingTime)) {
      toast({
        title: "Invalid booking time",
        description: "Shows must be booked at least 30 minutes in advance.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isEditing && editingBookingId) {
        const updatedBooking = updateBooking(editingBookingId, {
          title: showTitle,
          startTime: startDateTime,
          endTime: endDateTime
        });
        
        if (!updatedBooking) {
          toast({
            title: "Update failed",
            description: "This time slot conflicts with another booking.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        setNewBooking(updatedBooking);
        setBookingSuccess(true);
        
        toast({
          title: "Show updated successfully",
          description: "Your show booking has been updated."
        });
        
      } else {
        if (hasBookingConflict(stationId!, startDateTime, endDateTime)) {
          toast({
            title: "Booking conflict",
            description: "This time slot is already booked. Please choose another slot.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
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
        
        if (booking.rejected) {
          toast({
            title: "Booking rejected",
            description: booking.rejectionReason || "This time slot conflicts with another booking.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        toast({
          title: "Show booked successfully",
          description: booking.approved 
            ? "Your show has been scheduled." 
            : "Your booking request has been submitted and is waiting for approval.",
        });
      }
      
      setIsEditing(false);
      setEditingBookingId(null);
      
      updateStationBookings();
    } catch (error) {
      toast({
        title: isEditing ? "Update failed" : "Booking failed",
        description: `There was an error ${isEditing ? "updating" : "booking"} your show. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditBooking = (booking: any) => {
    setIsEditing(true);
    setEditingBookingId(booking.id);
    setShowTitle(booking.title);
    
    const bookingDate = new Date(booking.startTime);
    setDate(bookingDate);
    
    const hours = bookingDate.getHours();
    const formattedHours = hours < 10 ? `0${hours}:00` : `${hours}:00`;
    setSelectedTimeSlot(formattedHours);
    
    updateAvailableTimeSlots(bookingDate);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelBooking = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setShowCancelDialog(true);
  };
  
  const confirmCancelBooking = () => {
    if (!bookingToCancel) return;
    
    try {
      cancelBooking(bookingToCancel);
      
      toast({
        title: "Show canceled",
        description: "Your show booking has been canceled."
      });
      
      updateStationBookings();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel the booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowCancelDialog(false);
      setBookingToCancel(null);
    }
  };
  
  const resetForm = () => {
    setIsEditing(false);
    setEditingBookingId(null);
    setShowTitle("");
    setDate(new Date());
    setSelectedTimeSlot("12:00");
    updateAvailableTimeSlots(new Date());
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
  
  if (bookingSuccess && !newBooking?.rejected) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center mb-6">
              <CheckCircle2 className="text-green-500 mr-2" />
              <h1 className="text-2xl font-bold">{isEditing ? "Show Updated Successfully" : "Show Booked Successfully"}</h1>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center mb-4 p-3 bg-green-50 rounded-md text-green-700">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                <p className="text-sm">
                  {newBooking?.approved 
                    ? isEditing ? "Your show has been updated successfully." : "Your show has been scheduled successfully."
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
                    resetForm();
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
            <h1 className="text-2xl font-bold">
              {isEditing ? "Edit Show Booking" : `Book a Show on ${station.name}`}
            </h1>
            {isEditing && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetForm} 
                className="ml-auto"
              >
                <X className="w-4 h-4 mr-1" /> Cancel Edit
              </Button>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-md text-blue-700">
              <Info className="w-5 h-5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                <p>Shows are booked in 1-hour time slots. Each slot starts at the beginning of the hour.</p>
                <p className="mt-1">Your booking will be automatically approved if the time slot is available.</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date" className="block mb-2">Select Date</Label>
                  <div className="border rounded-md">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        if (selectedDate) updateAvailableTimeSlots(selectedDate);
                      }}
                      disabled={(date) => date < new Date()}
                      className={cn("rounded-md")}
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
                    <Label htmlFor="time-slot" className="block mb-2">Available Time Slots</Label>
                    <div className="border border-gray-200 rounded-md p-3 max-h-64 overflow-y-auto">
                      {availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {availableTimeSlots.map((slot) => (
                            <div
                              key={slot.value}
                              className={cn(
                                "px-3 py-2 rounded-md cursor-pointer flex items-center justify-between",
                                slot.isAvailable
                                  ? selectedTimeSlot === slot.value
                                    ? "bg-blue text-white"
                                    : "border border-blue-100 hover:bg-blue-50"
                                  : slot.isPast
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-red-50 text-red-500 cursor-not-allowed"
                              )}
                              onClick={() => {
                                if (slot.isAvailable) {
                                  setSelectedTimeSlot(slot.value);
                                }
                              }}
                            >
                              <span>{slot.label}</span>
                              {slot.isBooked && !slot.isPast && (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          No available time slots for this date.
                        </div>
                      )}
                    </div>
                    {availableTimeSlots.filter(slot => slot.isAvailable).length === 0 && (
                      <p className="text-sm text-red-500 mt-2">
                        No available time slots for this date. Please select another date.
                      </p>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue hover:bg-blue-dark" 
                      disabled={isLoading || availableTimeSlots.filter(slot => slot.isAvailable).length === 0}
                    >
                      {isLoading 
                        ? (isEditing ? "Updating..." : "Booking...") 
                        : (isEditing ? "Update Show" : "Book Show")}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Today's Bookings</h2>
            {todayBookings.length > 0 ? (
              <div className="space-y-3">
                {todayBookings
                  .filter(booking => !booking.rejected) // Don't show rejected bookings
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((booking) => (
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
                        <p className="text-sm mt-1">
                          {format(new Date(booking.startTime), "h:mm a")} to {format(new Date(booking.endTime), "h:mm a")}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {booking.approved && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                        )}
                        
                        {booking.hostId === user?.id && isAfter(new Date(booking.startTime), new Date()) && (
                          <div className="flex space-x-1 mt-auto">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              onClick={() => handleEditBooking(booking)}
                            >
                              <Edit className="h-4 w-4 text-blue" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No bookings scheduled for today.</p>
            )}
          </div>
        </div>
      </div>
      
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Show Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this show booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelBooking}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Cancel Show
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default BookShow;
