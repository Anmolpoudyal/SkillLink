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
              onClick={() => handleViewProfile(provider.id)}
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
