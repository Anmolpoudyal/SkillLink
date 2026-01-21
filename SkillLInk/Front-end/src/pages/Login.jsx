import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Wrench } from "lucide-react";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [role, setRole] = useState("customer");

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
      localStorage.setItem("userRole", response.user.role);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", response.user.email);
      localStorage.setItem("userName", response.user.full_name);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.full_name}!`,
      });

      // Navigation based on role
      if (response.user.role === "admin") {
        navigate("/admin");
      } else if (response.user.role === "service_provider") {
        navigate("/provider");
      } else {
        navigate("/customer");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">SkillLink</span>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={role} onValueChange={(v) => setRole(v)} className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="provider">Provider</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>

            {role === "provider" ? (
              <Link to="/provider-signup" className="text-primary hover:underline">
                Apply as Provider
              </Link>
            ) : (
              <Link to="/customer-signup" className="text-primary hover:underline">
                Sign up as Customer
              </Link>
            )}
          </div>

          <div className="mt-2 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
