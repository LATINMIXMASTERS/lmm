
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/contexts/auth/types";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserEditDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, userData: Partial<User>) => void;
}

const UserEditDialog: React.FC<UserEditDialogProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const { toast } = useToast();
  const [userData, setUserData] = useState<Partial<User>>({
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin || false,
    isRadioHost: user.isRadioHost || false,
  });
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (field: 'isAdmin' | 'isRadioHost') => {
    setUserData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setShowPasswordField(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave: Partial<User> = { ...userData };
    
    if (showPasswordField && newPassword) {
      dataToSave.password = newPassword;
      toast({
        title: "Password Reset",
        description: `Password has been reset for ${user.username}`,
      });
    }
    
    onSave(user.id, dataToSave);
    onClose();
  };

  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(newPassword);
    toast({
      title: "Password Copied",
      description: "Password has been copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user profile. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={userData.username}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">Password</div>
              <div className="col-span-3 space-y-2">
                {!showPasswordField ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateRandomPassword}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Password
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyPasswordToClipboard}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      This new password will be set when you save changes.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">Permissions</div>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRadioHost"
                    checked={userData.isRadioHost}
                    onCheckedChange={() => handleCheckboxChange('isRadioHost')}
                  />
                  <Label htmlFor="isRadioHost">Radio Host</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAdmin"
                    checked={userData.isAdmin}
                    onCheckedChange={() => handleCheckboxChange('isAdmin')}
                    disabled={user.id === 'official-admin'} // Can't remove admin from main admin account
                  />
                  <Label htmlFor="isAdmin">
                    Administrator
                    {user.id === 'official-admin' && (
                      <span className="ml-2 text-xs text-gray-500">(Cannot be changed for main admin)</span>
                    )}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditDialog;
