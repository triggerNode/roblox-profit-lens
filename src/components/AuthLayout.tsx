import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AuthLayoutProps {
  type: "signup" | "login";
}

const AuthLayout = ({ type }: AuthLayoutProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();

  const isSignup = type === "signup";

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignup) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Successful",
            description: "Please check your email to verify your account.",
          });
          navigate("/dashboard");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isSignup ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-muted-foreground">
            {isSignup 
              ? "Start tracking your Roblox profits today" 
              : "Sign in to view your dashboard"
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : (isSignup ? "Create Account" : "Sign In")}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}
              <Link 
                to={isSignup ? "/login" : "/signup"} 
                className="ml-1 text-primary hover:underline"
              >
                {isSignup ? "Sign In" : "Sign Up"}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;