import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";

/**
 * TimeSlotPicker - An efficient time slot selection component for booking services
 * 
 * Features:
 * - Visual calendar with availability indicators
 * - 30-minute slot intervals
 * - Clear slot status (available, booked, blocked, break)
 * - Slot duration display
 * - Responsive design
 */
const TimeSlotPicker = ({
  provider,
  onSelectSlot,
  onClose,
  selectedDate: initialDate,
  fetchAvailability, // Function to fetch availability: (providerId, date) => Promise<{timeSlots, weeklySchedule}>
  slotDuration = 60, // Duration in minutes (30, 60, 90, 120)
}) => {
  // Initialize with today or provided date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [currentMonth, setCurrentMonth] = useState(
    initialDate ? new Date(initialDate.getFullYear(), initialDate.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(initialDate || today);
  const [timeSlots, setTimeSlots] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Format date as YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
  const formatLocalDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch availability when date changes
  const loadAvailability = useCallback(async (date) => {
    if (!provider?.id || !fetchAvailability) return;
    
    setLoading(true);
    try {
      const dateStr = formatLocalDate(date);
      const response = await fetchAvailability(provider.id, dateStr);
      setTimeSlots(response.timeSlots || []);
      setWeeklySchedule(response.weeklySchedule || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  }, [provider?.id, fetchAvailability]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability(selectedDate);
    }
  }, [selectedDate, loadAvailability]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];

    // Get day availability from weekly schedule
    const getDayAvailability = (date) => {
      const dayOfWeek = date.getDay();
      const schedule = weeklySchedule.find(s => {
        const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
        return dayMap[s.day] === dayOfWeek;
      });
      return schedule?.isAvailable || schedule?.enabled || false;
    };

    // Empty cells for padding
    for (let i = 0; i < startPadding; i++) {
      days.push({ type: 'empty', key: `empty-${i}` });
    }

    // Calendar days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPast = date < today;
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() && 
        date.getMonth() === selectedDate.getMonth() && 
        date.getFullYear() === selectedDate.getFullYear();
      const isToday = today.toDateString() === date.toDateString();
      const hasAvailability = !isPast && getDayAvailability(date);

      days.push({
        type: 'day',
        day,
        date,
        isPast,
        isSelected,
        isToday,
        hasAvailability,
        key: `day-${day}`,
      });
    }

    return days;
  };

  // Handle slot selection
  const handleSlotClick = (slot) => {
    if (slot.status !== 'available') return;
    setSelectedSlot(slot);
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedSlot && selectedDate) {
      onSelectSlot({
        date: selectedDate,
        slot: selectedSlot,
        formattedDateTime: `${selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })} at ${selectedSlot.time}`,
      });
    }
  };

  // Get slot status styling
  const getSlotStyle = (slot) => {
    const baseStyle = "relative p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200";
    
    switch (slot.status) {
      case 'available':
        const isActive = selectedSlot?.timeValue === slot.timeValue;
        return `${baseStyle} ${isActive 
          ? 'border-teal-500 bg-teal-500 text-white shadow-lg scale-105' 
          : 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:border-teal-300 hover:shadow-md cursor-pointer'
        }`;
      case 'booked':
        return `${baseStyle} border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed`;
      case 'blocked':
        return `${baseStyle} border-red-200 bg-red-50 text-red-400 cursor-not-allowed`;
      case 'break':
      case 'lunch':
        return `${baseStyle} border-orange-200 bg-orange-50 text-orange-400 cursor-not-allowed`;
      default:
        return `${baseStyle} border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed`;
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'booked': return 'Booked';
      case 'blocked': return 'Unavailable';
      case 'break':
      case 'lunch': return 'Break';
      default: return null;
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {provider?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Book Appointment
              </h2>
              <p className="text-sm text-gray-600">{provider?.name} • {provider?.service}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-lg font-bold text-gray-900">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item) => {
                  if (item.type === 'empty') {
                    return <div key={item.key} className="h-10" />;
                  }
                  return (
                    <button
                      key={item.key}
                      onClick={() => !item.isPast && setSelectedDate(item.date)}
                      disabled={item.isPast}
                      className={`h-10 w-full rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-200
                        ${item.isSelected
                          ? 'bg-teal-500 text-white shadow-lg'
                          : item.isToday
                            ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-300'
                            : item.isPast
                              ? 'text-gray-300 cursor-not-allowed'
                              : item.hasAvailability
                                ? 'hover:bg-white hover:shadow-md text-gray-700'
                                : 'text-gray-400 hover:bg-gray-100'
                        }`}
                    >
                      <span>{item.day}</span>
                      {!item.isPast && item.hasAvailability && !item.isSelected && (
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-0.5"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                  <span className="text-xs text-gray-500">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  <span className="text-xs text-gray-500">Not Available</span>
                </div>
              </div>
            </div>

            {/* Time Slots Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-500" />
                    {selectedDate
                      ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                      : 'Select a date'
                    }
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {slotDuration} min per slot
                  </p>
                </div>
                {timeSlots.filter(s => s.status === 'available').length > 0 && (
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                    {timeSlots.filter(s => s.status === 'available').length} slots available
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent absolute inset-0"></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Loading available slots...</p>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-600 font-medium">No available slots</p>
                  <p className="text-sm text-gray-400 mt-1">Provider doesn't work on this day</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Morning slots */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Morning</p>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.filter(s => {
                        const hour = parseInt(s.timeValue?.split(':')[0] || 0);
                        return hour < 12;
                      }).map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleSlotClick(slot)}
                          disabled={slot.status !== 'available'}
                          className={getSlotStyle(slot)}
                        >
                          <span className="flex items-center justify-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {slot.time}
                          </span>
                          {getStatusLabel(slot.status) && (
                            <span className="absolute -top-2 -right-2 text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                              {getStatusLabel(slot.status)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon slots */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Afternoon</p>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.filter(s => {
                        const hour = parseInt(s.timeValue?.split(':')[0] || 0);
                        return hour >= 12 && hour < 17;
                      }).map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleSlotClick(slot)}
                          disabled={slot.status !== 'available'}
                          className={getSlotStyle(slot)}
                        >
                          <span className="flex items-center justify-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {slot.time}
                          </span>
                          {getStatusLabel(slot.status) && (
                            <span className="absolute -top-2 -right-2 text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                              {getStatusLabel(slot.status)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Evening slots */}
                  {timeSlots.filter(s => {
                    const hour = parseInt(s.timeValue?.split(':')[0] || 0);
                    return hour >= 17;
                  }).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Evening</p>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.filter(s => {
                          const hour = parseInt(s.timeValue?.split(':')[0] || 0);
                          return hour >= 17;
                        }).map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlotClick(slot)}
                            disabled={slot.status !== 'available'}
                            className={getSlotStyle(slot)}
                          >
                            <span className="flex items-center justify-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {slot.time}
                            </span>
                            {getStatusLabel(slot.status) && (
                              <span className="absolute -top-2 -right-2 text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                {getStatusLabel(slot.status)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedSlot && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-teal-500" />
                  <span className="text-gray-600">
                    Selected: <span className="font-semibold text-gray-900">{selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedSlot.time}</span>
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={!selectedSlot}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotPicker;
