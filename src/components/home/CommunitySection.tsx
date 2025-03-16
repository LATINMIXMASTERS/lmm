
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CommunitySectionProps {
  isAuthenticated: boolean;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  
  const handleButtonClick = () => {
    if (isAuthenticated) {
      navigate('/user-profile');
    } else {
      navigate('/login?register=true');
    }
  };
  
  return (
    <section className="bg-gray-50 rounded-xl p-8 text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">JOIN THE LATINMIXMASTERS FAMILY</h2>
      <p className="text-gray-600 max-w-2xl mx-auto mb-6">
        LATINMIXMASTERS is an international DJ crew dedicated to bringing you the best Latin music
        from around the world. Join our community to discover new music, connect with other Latin music
        lovers, and stay updated on the latest events.
      </p>
      <button
        onClick={handleButtonClick}
        className="bg-red hover:bg-red-dark text-white font-bold py-3 px-8 rounded-full text-center transition-colors duration-300"
      >
        {isAuthenticated ? 'Join Now' : 'Register Now'}
      </button>
    </section>
  );
};

export default CommunitySection;
