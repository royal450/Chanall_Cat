import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-2.5 m-0">
      <Card className="w-full max-w-[95vw] sm:max-w-md">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mb-3">
              <GraduationCap className="text-white text-lg sm:text-2xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Sign in to continue learning</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                  }
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="text-sm text-primary hover:underline p-0">
                Forgot Password?
              </Button>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Button 
                variant="link" 
                onClick={() => setLocation("/signup")}
                className="text-primary hover:underline font-semibold p-0"
              >
                Sign up
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
