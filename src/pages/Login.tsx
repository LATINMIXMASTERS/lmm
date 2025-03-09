
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layout/MainLayout";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

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
    
    // For debugging
    console.log("Attempting login with:", { email, password });
    
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
    
    // For debugging
    console.log("Attempting registration with:", { newUsername, newEmail, newPassword });
    
    await register(newUsername, newEmail, newPassword);
    setIsRegistering(false);
  };

  const handleTestLogin = (type: 'host' | 'user' | 'admin') => {
    if (type === 'host') {
      setEmail('testhost@example.com');
      setPassword('test123');
    } else if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin');
    } else {
      setEmail('testuser@example.com');
      setPassword('test123');
    }
  };

  // For debugging
  console.log("Current login state:", { email, password, isRegistering });

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
              {!isRegistering && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Test Accounts Available</AlertTitle>
                  <AlertDescription>
                    You can use our test accounts to explore the platform:
                    <div className="grid gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestLogin('admin')}
                      >
                        Use Admin Account
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestLogin('host')}
                      >
                        Use Test Host Account
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestLogin('user')}
                      >
                        Use Test User Account
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
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
            </CardContent>
            
            {!isRegistering && (
              <CardFooter className="flex flex-col text-sm text-muted-foreground">
                <div>Admin login: admin@example.com / admin</div>
                <div>Test Host login: testhost@example.com / test123</div>
                <div>Test User login: testuser@example.com / test123</div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
