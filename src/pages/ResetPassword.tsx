
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layout/MainLayout";
import { Link, useNavigate, useLocation } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { resetPassword, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL query params
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (token) {
      setResetToken(token);
    } else {
      toast({
        title: "Invalid reset link",
        description: "The password reset link appears to be invalid or expired.",
        variant: "destructive"
      });
    }
  }, [location, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please enter and confirm your new password",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure that your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Your password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }
    
    if (!resetToken) {
      toast({
        title: "Missing reset token",
        description: "Invalid password reset request",
        variant: "destructive"
      });
      return;
    }
    
    setIsResetting(true);
    
    try {
      await resetPassword(resetToken, password);
      setIsComplete(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error resetting password",
        description: "There was a problem resetting your password. The link may be expired.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  return (
    <MainLayout>
      <div className="container relative grid items-center gap-8 py-8 md:py-12 lg:pt-24 lg:pb-32">
        <div className="mx-auto grid w-full max-w-md items-start gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                {isComplete 
                  ? "Your password has been reset successfully" 
                  : "Create a new password for your account"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {!resetToken && !isComplete ? (
                <div className="text-center p-4">
                  <p className="mb-4">
                    Invalid or expired password reset link.
                  </p>
                  <Link 
                    to="/forgot-password" 
                    className="underline underline-offset-4 hover:text-blue"
                  >
                    Request a new password reset
                  </Link>
                </div>
              ) : isComplete ? (
                <div className="text-center p-4">
                  <p className="mb-4">Your password has been reset successfully!</p>
                  <Button onClick={redirectToLogin}>
                    Log in with new password
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        placeholder="Enter your new password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        placeholder="Confirm your new password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={isLoading || isResetting}>
                      {isResetting ? "Resetting..." : "Save New Password"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-gray-500">
                <Link 
                  to="/login" 
                  className="underline underline-offset-4 hover:text-blue"
                >
                  Back to Login
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPassword;
