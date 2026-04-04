import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { User, Briefcase, Eye, EyeOff, ArrowLeft, Sparkles, Shield } from "lucide-react";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";
import BrandLogo from "../components/BrandLogo.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [role, setRole] = useState("customer");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Map frontend role to database role
      const dbRole = role === 'provider' ? 'service_provider' : role;
      
      const response = await api.login({
        email,
        password,
        role: dbRole,
      });

      // Store user info
      localStorage.setItem("userId", response.user.id);
      localStorage.setItem("userRole", response.user.role);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", response.user.email);
      localStorage.setItem("userName", response.user.full_name);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.full_name}!`,
      });

      // Navigation based on role
      if (response.user.role === "service_provider") {
        navigate("/provider-dashboard");
      } else {
        navigate("/customer-dashboard");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    customer: User,
    provider: Briefcase,
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-dots opacity-20" />
      </div>

      {/* Floating Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-gradient-to-br from-primary/30 to-blue-400/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-gradient-to-br from-accent/30 to-orange-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Back Button */}
      <Link 
        to="/" 
        className={`absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 group z-20 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Login Card */}
      <div className={`relative z-10 w-full max-w-md p-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Card className="glass-card shadow-2xl border-0 overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-blue-400 to-accent" />
          
          <CardHeader className="space-y-4 pt-8 pb-4 flex flex-col items-center relative">
            {/* Logo */}
            <div className="mb-2">
              <BrandLogo imageClassName="h-20 drop-shadow-md mx-auto" />
            </div>
            <div className="text-center">
              <CardTitle className="text-3xl font-bold text-gradient mb-1">Welcome Back</CardTitle>
              <CardDescription className="text-base">Sign in to continue to SkillLink</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-8 px-8">
            {/* Role Tabs */}
            <Tabs value={role} onValueChange={(v) => setRole(v)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 p-1.5 bg-muted/50 rounded-xl h-14">
                {[
                  { value: "customer", label: "Customer", icon: User },
                  { value: "provider", label: "Provider", icon: Briefcase },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300 flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-4 pr-4 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-primary/50 transition-all duration-300 input-animated"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pl-4 pr-12 rounded-xl border-2 border-border/50 bg-white/50 focus:bg-white focus:border-primary/50 transition-all duration-300 input-animated"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 btn-shine" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Sign In
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-muted-foreground">New to SkillLink?</span>
              </div>
            </div>

            {/* Sign Up Links */}
            <div className="text-center space-y-3">
              {role === "provider" ? (
                <Link 
                  to="/provider-signup" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors link-underline"
                >
                  <Briefcase className="w-4 h-4" />
                  Apply as Service Provider
                </Link>
              ) : (
                <Link 
                  to="/customer-signup" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors link-underline"
                >
                  <User className="w-4 h-4" />
                  Create a Customer Account
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className={`flex items-center justify-center gap-2 mt-6 text-muted-foreground text-sm transition-all duration-700 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <Shield className="w-4 h-4 text-green-500" />
          <span>Your data is secure with 256-bit encryption</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
