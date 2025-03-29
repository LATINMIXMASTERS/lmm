
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layout/MainLayout";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { requestPasswordReset, isLoading } = useAuth();
  const { toast } = useToast();
  const supportEmail = "latinmixmasters@gmail.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Missing information",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
      toast({
        title: "Request submitted",
        description: "If your email exists in our system, you will receive password reset instructions shortly.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: "Something went wrong with your request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openEmailClient = () => {
    const subject = encodeURIComponent("Password Reset Request");
    const body = encodeURIComponent(
      `Hello Latin Mix Masters,\n\nI need to reset my password for the account with email: ${email}\n\nThank you.`
    );
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <MainLayout>
      <div className="container relative grid items-center gap-8 py-8 md:py-12 lg:pt-24 lg:pb-32">
        <div className="mx-auto grid w-full max-w-md items-start gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                {isSubmitted 
                  ? "Check your email for reset instructions" 
                  : "Enter your email to receive password reset instructions"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Processing..." : "Reset Password"}
                    </Button>
                    
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm text-center text-gray-500 mb-2">
                        Or contact support directly
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={openEmailClient}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Email {supportEmail}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center p-4">
                  <p className="mb-4">
                    We've sent reset instructions to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Don't see it? Check your spam folder or{" "}
                    <button
                      className="underline underline-offset-4 hover:text-blue"
                      onClick={() => setIsSubmitted(false)}
                    >
                      try again
                    </button>
                  </p>
                  
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Still having issues? Contact support directly:
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={openEmailClient}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Email {supportEmail}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-500 text-center">
                <Link 
                  to="/login" 
                  className="underline underline-offset-4 hover:text-blue"
                >
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPassword;
