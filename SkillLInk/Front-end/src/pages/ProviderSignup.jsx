import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../components/ui/Card.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select.jsx";
import { Wrench, Upload } from "lucide-react";
import { useToast } from "../hooks/useToast.js";

const serviceCategories = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "AC Repair",
  "Appliance Repair",
  "Cleaning Service",
  "Painter",
  "Pest Control",
];

const locations = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Biratnagar",
  "Birgunj",
  "Dharan",
  "Butwal",
];





const ProviderSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    serviceCategory: "",
    locations: [],
    hourlyRate: "",
    experience: "",
    bio: "",
    ctevtCertificate: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, ctevtCertificate: e.target.files[0] });
    }
  };

  const toggleLocation = (location) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter((l) => l !== location)
        : [...prev.locations, location],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.locations.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service location",
        variant: "destructive",
      });
      return;
    }

    if (!formData.ctevtCertificate) {
      toast({
        title: "Error",
        description: "Please upload your CTEVT certificate",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Application Submitted",
      description: "Your application is pending admin approval.",
    });

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

    

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">SkillLink</span>
          </div>
          <CardTitle className="text-2xl">Apply as Service Provider</CardTitle>
          <CardDescription>
            Complete your application for admin review
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Personal Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+977 98XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Service Details</h3>

              <div className="space-y-2">
                <Label>Service Category</Label>
                <Select
                  value={formData.serviceCategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceCategory: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>

                  <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Service Locations</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {locations.map((location) => (
                    <Button
                      key={location}
                      type="button"
                      variant={
                        formData.locations.includes(location)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleLocation(location)}
                    >
                      {location}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (NPR)</Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    placeholder="500"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    placeholder="5"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Describe your experience..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>
            </div>

            {/* Certificate Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Certification</h3>

              <div className="space-y-2">
                <Label>CTEVT Certificate</Label>

                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />

                  <Label htmlFor="ctevtCertificate" className="cursor-pointer">
                    <span className="text-primary hover:underline">
                      Upload file
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      or drag and drop
                    </span>
                  </Label>

                  <Input
                    id="ctevtCertificate"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {formData.ctevtCertificate && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {formData.ctevtCertificate.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Submit Application
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
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

export default ProviderSignup;
