
import { useToast } from '@/hooks/use-toast';

export const usePasswordResetActions = (
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storedUsers = localStorage.getItem('latinmixmasters_users');
      const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      const foundUser = allUsers.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase()
      );
      
      if (foundUser) {
        const resetToken = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
        
        const resetRequests = JSON.parse(localStorage.getItem('password_reset_requests') || '{}');
        resetRequests[resetToken] = {
          userId: foundUser.id,
          email: foundUser.email,
          expires: new Date(Date.now() + 3600000).toISOString(),
        };
        localStorage.setItem('password_reset_requests', JSON.stringify(resetRequests));
        
        console.log('Password reset requested for:', email);
        console.log('Reset token (for demo purposes):', resetToken);
        console.log('Reset URL would be:', `${window.location.origin}/reset-password?token=${resetToken}`);
        
        toast({
          title: "Password reset email sent",
          description: "Check your email for instructions to reset your password.",
        });
      } else {
        console.log('Password reset requested for non-existent email:', email);
        
        toast({
          title: "Password reset email sent",
          description: "If your email is registered, you'll receive reset instructions shortly.",
        });
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const resetRequests = JSON.parse(localStorage.getItem('password_reset_requests') || '{}');
      const request = resetRequests[token];
      
      if (!request) {
        throw new Error('Invalid or expired reset token');
      }
      
      if (new Date(request.expires) < new Date()) {
        throw new Error('Reset token has expired');
      }
      
      const storedUsers = localStorage.getItem('latinmixmasters_users');
      const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      const userIndex = allUsers.findIndex((u: any) => u.id === request.userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      allUsers[userIndex].password = newPassword;
      
      localStorage.setItem('latinmixmasters_users', JSON.stringify(allUsers));
      
      delete resetRequests[token];
      localStorage.setItem('password_reset_requests', JSON.stringify(resetRequests));
      
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestPasswordReset,
    resetPassword
  };
};
