import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';

const BookShow: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { stations } = useRadio();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Book a Show</h1>
        <p>Select a radio station to book a show:</p>
        {stations.map(station => (
          <div key={station.id} className="mb-4">
            <h2 className="text-lg font-semibold">{station.name}</h2>
            <p>Genre: {station.genre}</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Book Now
            </button>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default BookShow;
