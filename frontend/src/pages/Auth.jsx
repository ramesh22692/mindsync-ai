import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Get redirect path from query params
  const from = new URLSearchParams(location.search).get('from') || '/portal';
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginData.email, loginData.password);
      toast.success("Welcome back!");
      navigate(from);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(
        registerData.email,
        registerData.password,
        registerData.fullName,
        registerData.phone || null
      );
      toast.success("Account created successfully!");
      navigate(from);
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen" data-testid="auth-page">
      <section className="section-padding">
        <div className="container-custom max-w-md mx-auto">
          <Card className="card-base">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Client Portal</CardTitle>
              <CardDescription>
                Sign in to manage your appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="login-tab">Sign In</TabsTrigger>
                  <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
                </TabsList>
                
                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className="pl-10"
                          required
                          data-testid="login-email"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="pl-10 pr-10"
                          required
                          data-testid="login-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="btn-primary w-full"
                      disabled={isLoading}
                      data-testid="login-submit"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                {/* Register Tab */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Your full name"
                          value={registerData.fullName}
                          onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                          className="pl-10"
                          required
                          data-testid="register-name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          className="pl-10"
                          required
                          data-testid="register-email"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Phone (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                          className="pl-10"
                          data-testid="register-phone"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create password (min 6 chars)"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className="pl-10"
                          required
                          minLength={6}
                          data-testid="register-password"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-confirm"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          className="pl-10"
                          required
                          data-testid="register-confirm"
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="btn-primary w-full"
                      disabled={isLoading}
                      data-testid="register-submit"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an appointment yet?{" "}
              <Link to="/book" className="text-primary font-medium hover:underline">
                Book now
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
