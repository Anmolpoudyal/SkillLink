import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/button";
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

  // Customer info
  const customer = {
    name: "Customer",
    initial: "C",
  };

  // Available locations
  const locations = ["All Locations", "Kathmandu", "Lalitpur", "Bhaktapur"];

  // Available services
  const services = ["All Services", "Electrician", "Plumber", "Carpenter", "AC Repair", "Painter"];

  // Sample providers data
  const providers = [
    {
      id: 1,
      name: "Ram Sharma",
      initial: "R",
      service: "Electrician",
      location: "Kathmandu",
      rating: 4.8,
      reviews: 124,
      experience: 8,
      hourlyRate: 600,
    },
    {
      id: 2,
      name: "Sita Thapa",
      initial: "S",
      service: "Plumber",
      location: "Lalitpur",
      rating: 4.9,
      reviews: 98,
      experience: 5,
      hourlyRate: 500,
    },
    {
      id: 3,
      name: "Hari Bahadur",
      initial: "H",
      service: "Carpenter",
      location: "Kathmandu",
      rating: 4.7,
      reviews: 156,
      experience: 10,
      hourlyRate: 550,
    },
    {
      id: 4,
      name: "Gita Rai",
      initial: "G",
      service: "AC Repair",
      location: "Bhaktapur",
      rating: 4.9,
      reviews: 87,
      experience: 6,
      hourlyRate: 700,
    },
    {
      id: 5,
      name: "Krishna Tamang",
      initial: "K",
      service: "Electrician",
      location: "Kathmandu",
      rating: 4.6,
      reviews: 143,
      experience: 7,
      hourlyRate: 650,
    },
  ];

  // Filter providers based on search and filters
  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation =
      selectedLocation === "All Locations" || provider.location === selectedLocation;
    const matchesService =
      selectedService === "All Services" || provider.service === selectedService;
    const matchesRate = !maxRate || provider.hourlyRate <= Number(maxRate);

    return matchesSearch && matchesLocation && matchesService && matchesRate;
  });

  const getServiceColor = (service) => {
    const colors = {
      Electrician: "bg-teal-100 text-teal-700",
      Plumber: "bg-blue-100 text-blue-700",
      Carpenter: "bg-amber-100 text-amber-700",
      "AC Repair": "bg-cyan-100 text-cyan-700",
      Painter: "bg-purple-100 text-purple-700",
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
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <Calendar className="w-5 h-5" />
              <span>My Bookings</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-medium">
                {customer.initial}
              </div>
              <span className="text-gray-700">{customer.name}</span>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>

        {/* No Results */}
        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No providers found matching your criteria</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default CustomerDashboard;
