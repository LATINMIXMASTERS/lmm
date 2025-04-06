
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RadioStation } from '@/models/RadioStation';

// Import our form components
import {
  StationSelector,
  ShowTitleInput,
  DateTimeInputs,
  FormAlerts,
  SubmitButton
} from './form';

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
  handleSubmit: onSubmitBooking,
  isPrivilegedUser
}) => {
  // Handle the form submission
  const processSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitBooking(e);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Radio Show</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={processSubmit}>
          <div className="space-y-4">
            <StationSelector 
              stations={stations}
              selectedStation={selectedStation}
              setSelectedStation={setSelectedStation}
            />
            
            <ShowTitleInput 
              title={title}
              setTitle={setTitle}
            />
            
            <DateTimeInputs 
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
            
            <FormAlerts 
              error={error}
              success={success}
            />
            
            <SubmitButton 
              isPrivilegedUser={isPrivilegedUser}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
