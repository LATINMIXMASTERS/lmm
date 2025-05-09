import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layout/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import AdminPasswordReset from "@/components/AdminPasswordReset";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, isLoading, isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User is already authenticated, redirecting away from login");
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Attempting login with:", { email, passwordLength: password.length });
    
    await login(email, password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail || !newPassword) {
      toast({
        title: "Missing information",
        description: "Please fill all the required fields",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Attempting registration with:", { newUsername, newEmail, passwordLength: newPassword.length });
    
    await register(newUsername, newEmail, newPassword);
    setIsRegistering(false);
  };

  if (isAuthenticated && user) {
    return <div className="p-8 text-center">Already logged in. Redirecting...</div>;
  }

  return (
    <MainLayout>
      <div className="container relative grid items-center gap-8 py-8 md:py-12 lg:pt-24 lg:pb-32">
        <div className="mx-auto grid w-full max-w-5xl items-start gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                {isRegistering ? "Create an account" : "Login to your account"}
              </h1>
              <p className="max-w-[600px] text-gray-dark">
                {isRegistering
                  ? "Create a new account to start booking radio shows."
                  : "Login to your account to manage your radio shows and interact with tracks."}
              </p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{isRegistering ? "Register" : "Login"}</CardTitle>
              <CardDescription>
                {isRegistering
                  ? "Create a new account"
                  : "Enter your email and password to login"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                <div className="grid gap-2">
                  {isRegistering && (
                    <>
                      <div className="grid gap-1">
                        <Label htmlFor="newUsername">Username</Label>
                        <Input
                          id="newUsername"
                          placeholder="Enter your username"
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="newEmail">Email</Label>
                        <Input
                          id="newEmail"
                          placeholder="Enter your email"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="newPassword">Password</Label>
                        <Input
                          id="newPassword"
                          placeholder="Enter your password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  {!isRegistering && (
                    <>
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
                      <div className="grid gap-1">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          placeholder="Enter your password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Processing..." : isRegistering ? "Create Account" : "Login"}
                  </Button>
                </div>
              </form>
              
              <div className="text-sm text-gray-500">
                {isRegistering ? (
                  <>
                    Already have an account?{" "}
                    <button
                      className="underline underline-offset-4 hover:text-blue"
                      onClick={() => setIsRegistering(false)}
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <button
                      className="underline underline-offset-4 hover:text-blue"
                      onClick={() => setIsRegistering(true)}
                    >
                      Register
                    </button>
                  </>
                )}
              </div>

              {!isRegistering && (
                <div className="text-sm text-gray-500 text-center">
                  <Link 
                    to="/forgot-password" 
                    className="underline underline-offset-4 hover:text-blue"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
              
              {!isRegistering && <AdminPasswordReset />}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
