import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Mic, Headphones } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GoLive: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { stations } = useRadio();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user?.isRadioHost) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoLive = () => {
    navigate('/host-dashboard');
  };

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Go Live</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <p className="text-muted-foreground">
                  Ready to start your live radio show? Click the button below to
                  access your host dashboard and begin broadcasting.
                </p>
              </div>
              <Button onClick={handleGoLive}>
                <Radio className="mr-2 h-4 w-4" />
                Go Live Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default GoLive;
