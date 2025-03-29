
import React, { useState } from 'react';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const PasswordResetManager: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentResets, setRecentResets] = useState<{email: string, timestamp: Date, status: 'success' | 'failed'}[]>([]);
  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();

  const handleSendResetLink = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter the user's email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      
      // Add to recent resets
      setRecentResets(prev => [
        { email, timestamp: new Date(), status: 'success' },
        ...prev.slice(0, 9) // Keep only the 10 most recent
      ]);
      
      toast({
        title: "Reset Link Sent",
        description: `Password reset link has been sent to ${email}`,
      });
      setEmail('');
    } catch (error) {
      console.error("Failed to send reset link:", error);
      
      // Add to recent resets with failed status
      setRecentResets(prev => [
        { email, timestamp: new Date(), status: 'failed' },
        ...prev.slice(0, 9)
      ]);
      
      toast({
        title: "Failed to Send",
        description: "There was an error sending the reset link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password Reset Management</CardTitle>
          <CardDescription>
            Send password reset links to registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Send Reset Link</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter user email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSendResetLink} 
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This will send a password reset link to the user's email address.
            </p>
          </div>

          {recentResets.length > 0 && (
            <div>
              <h3 className="text-md font-medium mb-2">Recent Password Reset Requests</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentResets.map((reset, index) => (
                    <TableRow key={index}>
                      <TableCell>{reset.email}</TableCell>
                      <TableCell>
                        {reset.timestamp.toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        {reset.status === 'success' ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Sent
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Failed
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetManager;
