
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lock } from "lucide-react";

const AdminPasswordReset: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  
  // This is a simple security check - not meant to be highly secure but prevents casual resets
  const secretAdminResetKey = "LMM-3509-Admin-Reset";

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword || !secretKey) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure your passwords match",
        variant: "destructive"
      });
      return;
    }

    if (secretKey !== secretAdminResetKey) {
      toast({
        title: "Invalid reset key",
        description: "The security key you entered is incorrect",
        variant: "destructive"
      });
      return;
    }

    setIsResetting(true);
    
    try {
      // Get users from localStorage
      const storedUsers = localStorage.getItem('lmm_users');
      if (storedUsers) {
        const allUsers = JSON.parse(storedUsers);
        
        // Find the admin user
        const updatedUsers = allUsers.map((u: any) => {
          if (u.email.toLowerCase() === 'lmmappstore@gmail.com') {
            return {
              ...u,
              password: newPassword
            };
          }
          return u;
        });
        
        // Save back to localStorage
        localStorage.setItem('lmm_users', JSON.stringify(updatedUsers));
        
        toast({
          title: "Password reset successful",
          description: "The admin password has been updated. You can now login.",
        });
        
        setIsOpen(false);
        setNewPassword("");
        setConfirmPassword("");
        setSecretKey("");
      }
    } catch (error) {
      console.error("Error resetting admin password:", error);
      toast({
        title: "Reset failed",
        description: "There was an error resetting the password",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <div className="text-center mt-4">
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Reset admin password
        </button>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Admin Password</DialogTitle>
            <DialogDescription>
              This will reset the password for the main admin account (lmmappstore@gmail.com)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Security Key</label>
              <Input
                type="password"
                placeholder="Enter security key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Contact system administrator for the security key</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button disabled={isResetting} onClick={handleResetPassword}>
              {isResetting ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPasswordReset;
