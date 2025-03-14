
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TestAccount: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const createTestAccount = () => {
    // Log in with a test account (admin has access to all features)
    login('admin@example.com', 'admin');
    
    toast({
      title: "Test Account Created",
      description: "You're now logged in as admin with full access to all features"
    });
  };
  
  const viewProfile = () => {
    navigate('/user/1'); // Navigate to admin profile
  };
  
  const viewHostProfile = () => {
    navigate('/host/1'); // Navigate to admin host profile (since admin is also a host)
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Test Account Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Try the profile features with a test account to see how profiles work like in Mixcloud.</p>
        
        <div className="flex flex-wrap gap-4">
          <Button onClick={createTestAccount}>
            Login as Test Admin
          </Button>
          
          <Button variant="outline" onClick={viewProfile}>
            View User Profile
          </Button>
          
          <Button variant="outline" onClick={viewHostProfile}>
            View DJ Profile
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground mt-2">
          <p>After logging in, you can:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Upload tracks/mixes</li>
            <li>Edit your profile</li>
            <li>Manage radio stations</li>
            <li>Add comments and like tracks</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestAccount;
