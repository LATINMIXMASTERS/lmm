
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface CommunitySectionProps {
  isAuthenticated: boolean;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ isAuthenticated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleJoinNow = () => {
    if (isAuthenticated && user) {
      // If user is logged in, take them to their profile area
      if (user.isRadioHost) {
        navigate(`/host/${user.id}`);
      } else {
        navigate(`/profile/${user.id}`);
      }
    } else {
      // If not logged in, take them to login page
      navigate('/login');
    }
  };
  
  return (
    <section className="py-12 px-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
        <p className="text-lg mb-8 dark:text-gray-300">
          LATINMIXMASTERS is more than just music. It's a vibrant community of passionate DJs, 
          producers, and music lovers from around the world. Sign up today to start your journey!
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleJoinNow}
            size="lg" 
            className="bg-gold hover:bg-gold-dark text-black transition-colors px-8"
          >
            {isAuthenticated ? 'Go to Profile' : 'Join Now'}
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-gold text-gold hover:bg-gold/10"
            asChild
          >
            <Link to="/stations">Browse Stations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
