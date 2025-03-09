
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radio, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/layout/MainLayout';
import { cn } from '@/lib/utils';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'login') {
      await login(email, password);
      navigate('/stations');
    } else {
      await register(username, email, password);
      navigate('/stations');
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-lg mx-auto my-12 p-6 md:p-10 border border-gray-lightest rounded-xl shadow-sm">
        <div 
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full bg-blue/10 text-blue text-xs font-medium mb-4 mx-auto",
            !isAnimated ? "opacity-0" : "animate-fade-in"
          )}
        >
          <Radio className="w-3 h-3 mr-1" />
          WaveRadio Account
        </div>
        
        <h1 
          className={cn(
            "text-3xl font-bold mb-6 text-center",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.1s" }}
        >
          {activeTab === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        
        {/* Tabs */}
        <div 
          className={cn(
            "flex border-b border-gray-lightest mb-6",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.2s" }}
        >
          <button
            className={cn(
              "flex-1 py-3 text-center border-b-2 font-medium transition-all duration-300",
              activeTab === 'login' ? "border-blue text-blue" : "border-transparent text-gray hover:text-gray-dark"
            )}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-center border-b-2 font-medium transition-all duration-300",
              activeTab === 'register' ? "border-blue text-blue" : "border-transparent text-gray hover:text-gray-dark"
            )}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>
        
        <form 
          onSubmit={handleSubmit}
          className={cn(
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.3s" }}
        >
          {/* Registration form fields */}
          {activeTab === 'register' && (
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-1 text-gray-dark">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray">
                  <User size={18} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-light focus:border-blue focus:ring-2 focus:ring-blue/30 outline-none transition-all duration-300"
                  placeholder="Your username"
                  required
                />
              </div>
            </div>
          )}
          
          {/* Common form fields */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-dark">
              Email address
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-light focus:border-blue focus:ring-2 focus:ring-blue/30 outline-none transition-all duration-300"
                placeholder={activeTab === 'login' ? "demo@example.com" : "Your email address"}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-dark">
                Password
              </label>
              {activeTab === 'login' && (
                <Link to="/forgot-password" className="text-sm text-blue hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-light focus:border-blue focus:ring-2 focus:ring-blue/30 outline-none transition-all duration-300"
                placeholder={activeTab === 'login' ? "password" : "Create a password"}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-3 px-4 bg-blue text-white rounded-lg font-medium flex items-center justify-center",
              "transition-all duration-300",
              "hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-blue/50",
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            )}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                {activeTab === 'login' ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {activeTab === 'login' ? 'Login to account' : 'Create account'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
          
          {activeTab === 'login' && (
            <p className="text-center mt-6 text-sm text-gray-dark">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={() => setActiveTab('register')} 
                className="text-blue hover:underline"
              >
                Create one now
              </button>
            </p>
          )}
          
          {activeTab === 'register' && (
            <p className="text-center mt-6 text-sm text-gray-dark">
              Already have an account?{" "}
              <button 
                type="button"
                onClick={() => setActiveTab('login')} 
                className="text-blue hover:underline"
              >
                Login here
              </button>
            </p>
          )}
        </form>
      </div>
    </MainLayout>
  );
};

export default Login;
