import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/useToast.js";
import api from "../services/api.js";
import {
  Search,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Calendar,
  LogOut,
  Eye,
  ChevronDown,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  CheckCircle,
  Copy,
  AlertTriangle,
  PlayCircle,
  AlertCircle,
  Flag,
  Edit,
  Camera,
  User,
} from "lucide-react";

const CustomerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedService, setSelectedService] = useState("All Services");
  const [maxRate, setMaxRate] = useState("");

  // Booking state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    problemDescription: "",
    address: "",
    latitude: "27.7172",
    longitude: "85.3240",
    selectedDateTime: "",
  });

  // Profile view state
  const [showProfileView, setShowProfileView] = useState(false);
  const [profileTab, setProfileTab] = useState("about");
  const [profileAvailMonth, setProfileAvailMonth] = useState(new Date(2026, 0, 1)); // January 2026
  const [profileSelectedDate, setProfileSelectedDate] = useState(new Date(2026, 0, 26)); // Jan 26
  const [profileSelectedSlot, setProfileSelectedSlot] = useState(null);

  // Profile time slots data
  const profileTimeSlots = [
    { time: "09:00 AM", status: "available" },
    { time: "10:00 AM", status: "available" },
    { time: "11:00 AM", status: "booked" },
    { time: "12:00 PM", status: "available" },
    { time: "01:00 PM", status: "lunch" },
    { time: "02:00 PM", status: "available" },
    { time: "03:00 PM", status: "available" },
    { time: "04:00 PM", status: "booked" },
    { time: "05:00 PM", status: "available" },
  ];

  // My Bookings state
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [bookingsTab, setBookingsTab] = useState("all");

  // Sample bookings data
  const myBookings = [
    {
      id: 1,
      provider: { name: "Ram Sharma", initial: "R", service: "Electrician" },
      description: "Ceiling fan not working",
      date: "2024-01-15 at 10:00 AM",
      location: "Kathmandu",
      status: "pending",
      payment: 1200,
    },
    {
      id: 2,
      provider: { name: "Sita Thapa", initial: "S", service: "Plumber" },
      description: "Kitchen sink leaking",
      date: "2024-01-12 14:00",
      location: "Lalitpur",
      status: "active",
      payment: 1500,
      verificationCode: "582914",
    },
    {
      id: 3,
      provider: { name: "Hari Bahadur", initial: "H", service: "Carpenter" },
      description: "Door repair needed",
      date: "2024-01-05 at 9:00 AM",
      location: "Kathmandu",
      status: "done",
      payment: 2000,
    },
  ];

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleOpenRatingModal = (booking) => {
    setRatingBooking(booking);
    setRatingValue(0);
    setRatingHover(0);
    setReviewText("");
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    console.log("Submitting rating:", {
      booking: ratingBooking,
      rating: ratingValue,
      review: reviewText,
    });
    // TODO: Implement API call
    setShowRatingModal(false);
    setRatingBooking(null);
  };

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportBooking, setReportBooking] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const reportReasons = [
    "Poor quality of work",
    "Unprofessional behavior",
    "Did not show up",
    "Overcharged",
    "Damaged property",
    "Harassment or inappropriate behavior",
    "Other",
  ];

  const handleOpenReportModal = (booking) => {
    setReportBooking(booking);
    setReportReason("");
    setReportDescription("");
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    console.log("Submitting report:", {
      booking: reportBooking,
      reason: reportReason,
      description: reportDescription,
    });
    // TODO: Implement API call
    setShowReportModal(false);
    setReportBooking(null);
  };

  // Availability modal state
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [slotsMonth, setSlotsMonth] = useState(new Date(2026, 0, 1)); // January 2026
  const [selectedSlotDate, setSelectedSlotDate] = useState(new Date(2026, 0, 25)); // Jan 25

  // Sample time slots data
  const timeSlots = [
    { time: "09:00 AM", status: "available" },
    { time: "10:00 AM", status: "available" },
    { time: "11:00 AM", status: "booked" },
    { time: "12:00 PM", status: "available" },
    { time: "01:00 PM", status: "lunch" },
    { time: "02:00 PM", status: "available" },
    { time: "03:00 PM", status: "available" },
    { time: "04:00 PM", status: "booked" },
    { time: "05:00 PM", status: "available" },
  ];

  const handleOpenSlotsModal = () => {
    setShowSlotsModal(true);
  };

  const handleCloseSlotsModal = () => {
    setShowSlotsModal(false);
  };

  const handleSelectTimeSlot = (slot) => {
    if (slot.status !== "available") return;
    
    const dateStr = selectedSlotDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    
    setBookingForm({
      ...bookingForm,
      selectedDateTime: `${dateStr} at ${slot.time}`,
    });
    setShowSlotsModal(false);
  };

  const navigate = useNavigate();
  const { toast } = useToast();

  // Loading state
  const [loading, setLoading] = useState(true);

  // Customer info - will be populated from API
  const [customer, setCustomer] = useState({
    name: localStorage.getItem("userName") || "Customer",
    initial: (localStorage.getItem("userName") || "C").charAt(0).toUpperCase(),
  });

  // Edit Profile modal state - declare before useEffect
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [customerProfileForm, setCustomerProfileForm] = useState({
    fullName: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    phone: "",
    address: "",
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.getProfile();
        const user = response.user;
        
        setCustomer({
          name: user.full_name,
          initial: user.full_name.charAt(0).toUpperCase(),
        });

        setCustomerProfileForm({
          fullName: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
        });

        // Pre-fill booking form with customer info
        setBookingForm(prev => ({
          ...prev,
          fullName: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
        }));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please login again.",
          variant: "destructive",
        });
        // Redirect to login if not authenticated
        if (error.message.includes("Not authorized")) {
          navigate("/Login");
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.clear();
      navigate("/Login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/Login");
    }
  };

  const handleSaveCustomerProfile = async () => {
    try {
      const response = await api.updateProfile({
        fullName: customerProfileForm.fullName,
        email: customerProfileForm.email,
        phone: customerProfileForm.phone,
        address: customerProfileForm.address,
      });

      // Update local state
      setCustomer({
        name: response.user.full_name,
        initial: response.user.full_name.charAt(0).toUpperCase(),
      });

      // Update localStorage
      localStorage.setItem("userName", response.user.full_name);
      localStorage.setItem("userEmail", response.user.email);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      setShowEditProfileModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Available locations - will be fetched from API
  const [locations, setLocations] = useState(["All Locations"]);

  // Available services - will be fetched from API
  const [services, setServices] = useState(["All Services"]);

  // Providers state - fetched from API
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(true);

  // Fetch locations and categories on mount
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [locationsRes, categoriesRes] = await Promise.all([
          api.getLocations(),
          api.getCategories()
        ]);
        
        setLocations(["All Locations", ...locationsRes.locations]);
        setServices(["All Services", ...categoriesRes.categories.map(c => c.name)]);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchFiltersData();
  }, []);

  // Fetch providers when search/filter changes
  useEffect(() => {
    const fetchProviders = async () => {
      setProvidersLoading(true);
      try {
        const response = await api.getProviders({
          search: searchQuery,
          location: selectedLocation,
          service: selectedService,
          maxRate: maxRate || undefined
        });
        
        setProviders(response.providers);
      } catch (error) {
        console.error("Error fetching providers:", error);
        toast({
          title: "Error",
          description: "Failed to load providers",
          variant: "destructive",
        });
      } finally {
        setProvidersLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchProviders();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedLocation, selectedService, maxRate, toast]);

  // Filter is now done on the backend, so just use providers directly
  const filteredProviders = providers;

  const getServiceColor = (service) => {
    const colors = {
      Electrician: "bg-teal-100 text-teal-700",
      Plumber: "bg-blue-100 text-blue-700",
      Carpenter: "bg-amber-100 text-amber-700",
      "AC Repair": "bg-cyan-100 text-cyan-700",
      Painter: "bg-purple-100 text-purple-700",
      "Appliance Repair": "bg-orange-100 text-orange-700",
      "Pest Control": "bg-red-100 text-red-700",
      Cleaner: "bg-green-100 text-green-700",
      General: "bg-gray-100 text-gray-700",
    };
    return colors[service] || "bg-gray-100 text-gray-700";
  };

  const handleViewProfile = (provider) => {
    setSelectedProvider(provider);
    setProfileTab("about");
    setShowProfileView(true);
  };

  const handleBackFromProfile = () => {
    setShowProfileView(false);
    setSelectedProvider(null);
  };

  const handleBookFromProfile = () => {
    setShowProfileView(false);
    setBookingForm({
      fullName: "",
      phone: "",
      email: "",
      problemDescription: "",
      address: "",
      latitude: "27.7172",
      longitude: "85.3240",
      selectedDateTime: "",
    });
    setShowBookingForm(true);
  };

  const handleBookNow = (provider) => {
    setSelectedProvider(provider);
    setBookingForm({
      fullName: "",
      phone: "",
      email: "",
      problemDescription: "",
      address: "",
      latitude: "27.7172",
      longitude: "85.3240",
      selectedDateTime: "",
    });
    setShowBookingForm(true);
  };

  const handleBackToSearch = () => {
    setShowBookingForm(false);
    setSelectedProvider(null);
  };

  const handleSendBookingRequest = () => {
    console.log("Sending booking request:", {
      provider: selectedProvider,
      bookingDetails: bookingForm,
    });
    // TODO: Implement API call to send booking request
    setShowBookingForm(false);
    setSelectedProvider(null);
  };

  const ProviderCard = ({ provider }) => (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header with avatar and info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-lg">
            {provider.initial}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{provider.name}</h3>
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getServiceColor(
                provider.service
              )}`}
            >
              {provider.service}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{provider.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-800">{provider.rating}</span>
            <span className="text-gray-400">({provider.reviews} reviews)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{provider.experience} years experience</span>
          </div>
        </div>

        {/* Footer with rate and buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-teal-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>{provider.hourlyRate} NPR/hr</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewProfile(provider)}
              className="text-gray-600"
            >
              <Eye className="w-4 h-4 mr-1" />
              Profile
            </Button>
            <Button
              size="sm"
              onClick={() => handleBookNow(provider)}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">SkillLink</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowMyBookings(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <Calendar className="w-5 h-5" />
              <span>My Bookings</span>
            </button>
            <button 
              onClick={() => setShowEditProfileModal(true)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-medium">
                {customer.initial}
              </div>
              <span className="text-gray-700">{customer.name}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Find Service Providers</h1>
          <p className="text-gray-500 mt-1">Search and book verified professionals near you</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border border-gray-100 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                />
              </div>

              {/* Location Dropdown */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 appearance-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none bg-white"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Service Dropdown */}
              <div className="relative">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 appearance-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none bg-white"
                >
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Max Hourly Rate */}
            <div className="max-w-xs">
              <input
                type="number"
                placeholder="Max hourly rate (NPR)"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Providers Grid */}
        {providersLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-4">Loading providers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!providersLoading && filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No providers found matching your criteria</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* My Bookings View */}
      {showMyBookings && (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-6 py-4">
              <button
                onClick={() => setShowMyBookings(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex gap-1">
                {[
                  { id: "all", label: "All" },
                  { id: "pending", label: "Pending" },
                  { id: "active", label: "Active", count: myBookings.filter(b => b.status === "active").length },
                  { id: "done", label: "Done" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setBookingsTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                      ${bookingsTab === tab.id
                        ? "border-teal-500 text-teal-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {tab.label}
                    {tab.count && (
                      <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="max-w-5xl mx-auto p-6 space-y-4">
            {myBookings
              .filter((booking) => bookingsTab === "all" || booking.status === bookingsTab)
              .map((booking) => (
                <Card key={booking.id} className="bg-white border border-gray-100 shadow-sm">
                  <CardContent className="p-6">
                    {/* Booking Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-lg">
                          {booking.provider.initial}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.provider.name}</h3>
                          <p className="text-sm text-gray-500">{booking.provider.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.status === "pending" && (
                          <>
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                              Pending
                            </span>
                          </>
                        )}
                        {booking.status === "active" && (
                          <>
                            <PlayCircle className="w-4 h-4 text-teal-500" />
                            <span className="px-3 py-1 bg-teal-100 text-teal-600 text-xs font-medium rounded-full">
                              In Progress
                            </span>
                          </>
                        )}
                        {booking.status === "done" && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                              Completed
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Booking Details */}
                    <p className="text-gray-700 mb-2">{booking.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.location}</span>
                      </div>
                    </div>

                    {/* Verification Code for Active Bookings */}
                    {booking.status === "active" && booking.verificationCode && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="w-5 h-5 text-teal-500" />
                          <span className="font-medium text-gray-900">Verification Code</span>
                        </div>
                        
                        {/* Code Display */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                          {booking.verificationCode.split('').map((digit, index) => (
                            <div
                              key={index}
                              className="w-10 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-lg font-semibold text-gray-800"
                            >
                              {digit}
                            </div>
                          ))}
                        </div>

                        {/* Copy Code Button */}
                        <button
                          onClick={() => navigator.clipboard.writeText(booking.verificationCode)}
                          className="w-full flex items-center justify-center gap-2 py-2 text-gray-600 hover:text-gray-800 border-t border-gray-200"
                        >
                          <Copy className="w-4 h-4" />
                          <span className="text-sm">Copy Code</span>
                        </button>

                        {/* Share Info */}
                        <div className="text-center mt-3">
                          <p className="text-sm text-gray-500">
                            Share with <span className="font-medium text-gray-700">{booking.provider.name}</span>
                          </p>
                          <p className="text-sm text-teal-600 font-medium">Payment: NPR {booking.payment}</p>
                        </div>

                        {/* Warning */}
                        <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700">
                            Only share this code when the service is completed to your satisfaction. Payment will be released once the provider enters this code.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Rate Service for Completed Bookings */}
                    {booking.status === "done" && (
                      <div className="mt-4">
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleOpenRatingModal(booking)}
                            className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Rate Service
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleOpenReportModal(booking)}
                            className="py-3 px-6 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            Report
                          </Button>
                        </div>
                        <p className="text-sm text-teal-600 font-medium mt-3">Paid: NPR {booking.payment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

            {/* No Bookings Message */}
            {myBookings.filter((booking) => bookingsTab === "all" || booking.status === bookingsTab).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No bookings found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provider Profile View */}
      {showProfileView && selectedProvider && (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
          {/* Back to Search Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-5xl mx-auto px-6 py-4">
              <button
                onClick={handleBackFromProfile}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Search</span>
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto p-6">
            {/* Profile Header Card */}
            <Card className="bg-white border border-gray-100 shadow-sm mb-6">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-teal-400 flex items-center justify-center text-white font-bold text-4xl">
                      {selectedProvider.initial}
                    </div>
                    {/* Provider Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">{selectedProvider.name}</h1>
                        <CheckCircle className="w-5 h-5 text-teal-500" />
                      </div>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mb-3 ${getServiceColor(selectedProvider.service)}`}>
                        {selectedProvider.service}
                      </span>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedProvider.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Member since 2019</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>+977 9841234567</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>ram.sharma@email.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                    <Button
                      onClick={handleBookFromProfile}
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="bg-white border border-gray-100">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <Star className="w-5 h-5 fill-amber-500" />
                    <span className="text-xl font-bold">{selectedProvider.rating}</span>
                  </div>
                  <p className="text-sm text-gray-500">Rating</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-100">
                <CardContent className="p-4 text-center">
                  <p className="text-xl font-bold text-gray-900 mb-1">{selectedProvider.reviews}</p>
                  <p className="text-sm text-gray-500">Reviews</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-100">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-900 mb-1">
                    <Clock className="w-5 h-5" />
                    <span className="text-xl font-bold">{selectedProvider.experience}</span>
                  </div>
                  <p className="text-sm text-gray-500">Years Exp.</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-100">
                <CardContent className="p-4 text-center">
                  <p className="text-xl font-bold text-teal-600 mb-1">$ {selectedProvider.hourlyRate}</p>
                  <p className="text-sm text-gray-500">NPR/hour</p>
                </CardContent>
              </Card>
            </div>

            {/* Profile Tabs */}
            <Card className="bg-white border border-gray-100">
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  {["about", "portfolio", "reviews", "availability"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setProfileTab(tab)}
                      className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors
                        ${profileTab === tab
                          ? "text-teal-600 border-b-2 border-teal-500"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <CardContent className="p-6">
                {profileTab === "about" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Professional electrician with over {selectedProvider.experience} years of experience in residential and commercial electrical work. 
                      Specialized in wiring, panel installations, and LED fixture setups. Committed to safety and quality workmanship.
                    </p>
                  </div>
                )}

                {profileTab === "portfolio" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <span className="text-sm">Project {item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileTab === "reviews" && (
                  <div className="space-y-6">
                    {/* Rating Overview */}
                    <Card className="bg-white border border-gray-100">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Overview</h3>
                        <div className="flex items-start gap-8">
                          {/* Left side - Overall rating */}
                          <div className="text-center">
                            <p className="text-5xl font-bold text-teal-500 mb-1">{selectedProvider.rating}</p>
                            <div className="flex items-center justify-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${i < Math.floor(selectedProvider.rating) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-500">Based on {selectedProvider.reviews} reviews</p>
                          </div>
                          
                          {/* Right side - Rating bars */}
                          <div className="flex-1 space-y-2">
                            {[
                              { stars: 5, count: 89 },
                              { stars: 4, count: 25 },
                              { stars: 3, count: 7 },
                              { stars: 2, count: 2 },
                              { stars: 1, count: 1 },
                            ].map((item) => {
                              const percentage = (item.count / selectedProvider.reviews) * 100;
                              return (
                                <div key={item.stars} className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 w-8">
                                    <span className="text-sm text-gray-600">{item.stars}</span>
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  </div>
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-amber-500 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Customer Reviews */}
                    <Card className="bg-white border border-gray-100">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Reviews</h3>
                        <div className="space-y-0">
                          {[
                            { name: "Amit Poudel", initial: "A", rating: 5, comment: "Excellent work! Ram fixed our electrical panel quickly and professionally. Highly recommended!", date: "2 days ago", bgColor: "bg-teal-500" },
                            { name: "Sunita Karki", initial: "S", rating: 5, comment: "Very punctual and skilled. Did a great job with our home wiring. Fair pricing too.", date: "1 week ago", bgColor: "bg-blue-500" },
                            { name: "Bikash Thapa", initial: "B", rating: 4, comment: "Good service overall. Completed the work on time. Would hire again.", date: "2 weeks ago", bgColor: "bg-teal-500" },
                            { name: "Rekha Shrestha", initial: "R", rating: 5, comment: "Amazing work on our LED installation. The whole house looks beautiful now!", date: "3 weeks ago", bgColor: "bg-orange-500" },
                            { name: "Dipak Maharjan", initial: "D", rating: 4, comment: "Professional and knowledgeable. Fixed a tricky wiring issue that others couldn't solve.", date: "1 month ago", bgColor: "bg-teal-400" },
                          ].map((review, index) => (
                            <div key={index} className="py-5 border-b border-gray-100 last:border-0">
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full ${review.bgColor} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                                  {review.initial}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-gray-900">{review.name}</p>
                                    <p className="text-sm text-gray-400">{review.date}</p>
                                  </div>
                                  <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-teal-700 text-sm">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Load More Button */}
                        <div className="mt-6">
                          <Button
                            variant="outline"
                            className="w-full py-3 border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            Load More Reviews
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {profileTab === "availability" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">Available Time Slots</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Select Date Card */}
                      <Card className="border border-dashed border-gray-200">
                        <CardContent className="p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h4>
                          
                          {/* Month Navigation */}
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <button
                              onClick={() => setProfileAvailMonth(new Date(profileAvailMonth.getFullYear(), profileAvailMonth.getMonth() - 1, 1))}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <ChevronLeft className="w-5 h-5 text-gray-400" />
                            </button>
                            <span className="text-base font-medium text-gray-700">
                              {profileAvailMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                              onClick={() => setProfileAvailMonth(new Date(profileAvailMonth.getFullYear(), profileAvailMonth.getMonth() + 1, 1))}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>

                          {/* Day headers */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar days */}
                          <div className="grid grid-cols-7 gap-1">
                            {(() => {
                              const firstDay = new Date(profileAvailMonth.getFullYear(), profileAvailMonth.getMonth(), 1);
                              const lastDay = new Date(profileAvailMonth.getFullYear(), profileAvailMonth.getMonth() + 1, 0);
                              const startPadding = firstDay.getDay();
                              const days = [];
                              
                              // Previous month days
                              const prevMonthLastDay = new Date(profileAvailMonth.getFullYear(), profileAvailMonth.getMonth(), 0).getDate();
                              for (let i = startPadding - 1; i >= 0; i--) {
                                days.push(
                                  <div key={`prev-${i}`} className="h-9 flex items-center justify-center text-sm text-gray-300">
                                    {prevMonthLastDay - i}
                                  </div>
                                );
                              }

                              // Current month days
                              for (let day = 1; day <= lastDay.getDate(); day++) {
                                const date = new Date(profileAvailMonth.getFullYear(), profileAvailMonth.getMonth(), day);
                                const isSelected = profileSelectedDate &&
                                  date.getDate() === profileSelectedDate.getDate() &&
                                  date.getMonth() === profileSelectedDate.getMonth() &&
                                  date.getFullYear() === profileSelectedDate.getFullYear();
                                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                                days.push(
                                  <button
                                    key={day}
                                    onClick={() => !isPast && setProfileSelectedDate(date)}
                                    disabled={isPast}
                                    className={`h-9 w-9 mx-auto rounded-md flex items-center justify-center text-sm transition-colors
                                      ${isSelected
                                        ? 'bg-teal-500 text-white'
                                        : isPast
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : 'hover:bg-gray-100 text-gray-600'
                                      }`}
                                  >
                                    {day}
                                  </button>
                                );
                              }

                              return days;
                            })()}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Available Time Slots Card */}
                      <Card className="border border-dashed border-gray-200">
                        <CardContent className="p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">Available Time Slots</h4>
                          <p className="text-sm text-gray-500 mb-4">
                            {profileSelectedDate
                              ? profileSelectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                              : 'Select a date'
                            }
                          </p>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {profileTimeSlots.map((slot, index) => (
                              <button
                                key={index}
                                onClick={() => slot.status === 'available' && setProfileSelectedSlot(slot.time)}
                                disabled={slot.status !== 'available'}
                                className={`relative p-4 rounded-lg border text-sm font-medium transition-colors
                                  ${slot.status === 'available'
                                    ? profileSelectedSlot === slot.time
                                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 cursor-pointer'
                                    : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                  }`}
                              >
                                <span>{slot.time}</span>
                                {slot.status === 'booked' && (
                                  <span className="block mt-1 text-xs text-teal-600 font-medium">
                                    Booked
                                  </span>
                                )}
                                {slot.status === 'lunch' && (
                                  <span className="block mt-1 text-xs text-teal-600 font-medium">
                                    Lunch Break
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Book Appointment Button */}
                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={() => {
                          if (profileSelectedSlot && profileSelectedDate) {
                            const dateStr = profileSelectedDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            });
                            setBookingForm({
                              ...bookingForm,
                              selectedDateTime: `${dateStr} at ${profileSelectedSlot}`,
                            });
                            setShowProfileView(false);
                            setShowBookingForm(true);
                          }
                        }}
                        disabled={!profileSelectedSlot}
                        className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Book an Appointment
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Booking Form View */}
      {showBookingForm && selectedProvider && (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6">
            {/* Back Button */}
            <button
              onClick={handleBackToSearch}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Search</span>
            </button>

            {/* Provider Info Card */}
            <Card className="bg-white border border-gray-100 shadow-sm mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xl">
                    {selectedProvider.initial}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{selectedProvider.name}</h2>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getServiceColor(
                        selectedProvider.service
                      )}`}
                    >
                      {selectedProvider.service}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedProvider.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {selectedProvider.rating}
                  </span>
                  <span className="flex items-center gap-1 text-teal-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    {selectedProvider.hourlyRate} NPR/hr
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">Book Service</h3>
                <p className="text-sm text-gray-500 mb-6">Provide details about your service request</p>

                {/* Your Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Your Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={bookingForm.fullName}
                        onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+977 98XXXXXXXX"
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                    <input
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                    />
                  </div>
                </div>

                {/* Service Details */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Service Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Problem Description</label>
                    <textarea
                      placeholder="Describe the issue you're facing..."
                      value={bookingForm.problemDescription}
                      onChange={(e) => setBookingForm({ ...bookingForm, problemDescription: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-y"
                    />
                  </div>
                </div>

                {/* Service Location */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Service Location</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Full Address</label>
                    <textarea
                      placeholder="Street, Area, Landmark"
                      value={bookingForm.address}
                      onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-y"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Latitude (Optional)</label>
                      <input
                        type="text"
                        value={bookingForm.latitude}
                        onChange={(e) => setBookingForm({ ...bookingForm, latitude: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Longitude (Optional)</label>
                      <input
                        type="text"
                        value={bookingForm.longitude}
                        onChange={(e) => setBookingForm({ ...bookingForm, longitude: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Schedule */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Preferred Schedule</h4>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Selected Date & Time</p>
                      <p className="text-sm text-gray-500">
                        {bookingForm.selectedDateTime || "Click \"View Available Slots\" to select a time"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenSlotsModal}
                      className="text-teal-600 border-teal-200 hover:bg-teal-50"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      View Available Slots
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSendBookingRequest}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white"
                >
                  Send Booking Request
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* View Available Slots Modal */}
      {showSlotsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedProvider?.name}'s Availability
                </h2>
                <p className="text-sm text-gray-500 mt-1">Select a date and time slot for your appointment</p>
              </div>
              <button
                onClick={handleCloseSlotsModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSlotsMonth(new Date(slotsMonth.getFullYear(), slotsMonth.getMonth() - 1, 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {slotsMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => setSlotsMonth(new Date(slotsMonth.getFullYear(), slotsMonth.getMonth() + 1, 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const firstDay = new Date(slotsMonth.getFullYear(), slotsMonth.getMonth(), 1);
                      const lastDay = new Date(slotsMonth.getFullYear(), slotsMonth.getMonth() + 1, 0);
                      const startPadding = firstDay.getDay();
                      const days = [];

                      // Empty cells for days before month starts
                      for (let i = 0; i < startPadding; i++) {
                        days.push(<div key={`empty-${i}`} className="h-10" />);
                      }

                      // Calendar days
                      for (let day = 1; day <= lastDay.getDate(); day++) {
                        const date = new Date(slotsMonth.getFullYear(), slotsMonth.getMonth(), day);
                        const isSelected = selectedSlotDate &&
                          date.getDate() === selectedSlotDate.getDate() &&
                          date.getMonth() === selectedSlotDate.getMonth() &&
                          date.getFullYear() === selectedSlotDate.getFullYear();
                        const isToday = new Date().toDateString() === date.toDateString();
                        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                        days.push(
                          <button
                            key={day}
                            onClick={() => !isPast && setSelectedSlotDate(date)}
                            disabled={isPast}
                            className={`h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-colors
                              ${isSelected
                                ? 'bg-teal-500 text-white'
                                : isToday
                                  ? 'bg-teal-100 text-teal-700'
                                  : isPast
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'hover:bg-gray-100 text-gray-700'
                              }`}
                          >
                            {day}
                          </button>
                        );
                      }

                      return days;
                    })()}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedSlotDate
                      ? selectedSlotDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                      : 'Select a date'
                    }
                  </h3>
                  <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                    {timeSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectTimeSlot(slot)}
                        disabled={slot.status !== 'available'}
                        className={`relative p-3 rounded-lg border text-sm font-medium transition-colors
                          ${slot.status === 'available'
                            ? 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:border-teal-300 cursor-pointer'
                            : slot.status === 'booked'
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'border-orange-200 bg-orange-50 text-orange-400 cursor-not-allowed'
                          }`}
                      >
                        <span>{slot.time}</span>
                        {slot.status === 'booked' && (
                          <span className="absolute top-1 right-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            Booked
                          </span>
                        )}
                        {slot.status === 'lunch' && (
                          <span className="absolute top-1 right-1 text-xs bg-orange-200 text-orange-600 px-2 py-0.5 rounded-full">
                            Lunch Break
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && ratingBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
                <p className="text-sm text-gray-500 mt-1">Help others by sharing your feedback</p>
              </div>
              <button
                onClick={() => setShowRatingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-6">
              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      onMouseEnter={() => setRatingHover(star)}
                      onMouseLeave={() => setRatingHover(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (ratingHover || ratingValue)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Review (Optional)</label>
                <textarea
                  placeholder="Share your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-y"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitRating}
                disabled={ratingValue === 0}
                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Rating
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && reportBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Report Provider</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-5 pb-5">
              {/* Reason Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                >
                  <option value="">Select a reason</option>
                  {reportReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Details (Optional)</label>
                <textarea
                  placeholder="Describe the issue..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitReport}
                disabled={!reportReason}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Edit Profile</h3>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Update your account information</p>
            </div>

            {/* Profile Form */}
            <div className="p-6 space-y-5">
              {/* Profile Photo */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-teal-400 flex items-center justify-center text-white font-bold text-xl">
                    {customerProfileForm.fullName.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white hover:bg-teal-600 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Profile Photo</p>
                  <p className="text-sm text-gray-500">Click to change</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={customerProfileForm.fullName}
                    onChange={(e) => setCustomerProfileForm({ ...customerProfileForm, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={customerProfileForm.email}
                    onChange={(e) => setCustomerProfileForm({ ...customerProfileForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={customerProfileForm.phone}
                    onChange={(e) => setCustomerProfileForm({ ...customerProfileForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={customerProfileForm.address}
                    onChange={(e) => setCustomerProfileForm({ ...customerProfileForm, address: e.target.value })}
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCustomerProfile}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
