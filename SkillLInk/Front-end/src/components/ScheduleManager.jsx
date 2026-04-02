import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  Save,
  Calendar,
  Check,
  X,
  Coffee,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";

/**
 * ScheduleManager - Provider's scheduling management component
 * 
 * Features:
 * - Visual weekly schedule with drag-and-drop feel
 * - 30-minute interval time selection
 * - Break time configuration
 * - Block time off with visual calendar
 * - Quick templates for common schedules
 */

const format12HourTime = (hours24, minutes) => {
  const hour12 = hours24 > 12 ? hours24 - 12 : hours24 === 0 ? 12 : hours24;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

const normalizeTimeLabel = (value) => {
  if (!value) return '';
  if (typeof value !== 'string') return value;

  // Support values like "9:00 AM", "09:00 AM", or "09:00"
  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    let [, hh, mm, period] = twelveHourMatch;
    const hours = Math.max(1, Math.min(12, parseInt(hh, 10)));
    return `${String(hours).padStart(2, '0')}:${mm} ${period.toUpperCase()}`;
  }

  const twentyFourHourMatch = value.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHourMatch) {
    const [, hh, mm] = twentyFourHourMatch;
    const hours24 = Math.max(0, Math.min(23, parseInt(hh, 10)));
    return format12HourTime(hours24, parseInt(mm, 10));
  }

  return value;
};

// Time options in 30-minute intervals
const TIME_OPTIONS = [];
for (let hour = 6; hour <= 22; hour++) {
  for (let min = 0; min < 60; min += 30) {
    const time24 = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    const time12 = format12HourTime(hour, min);
    TIME_OPTIONS.push({ value: time24, label: time12 });
  }
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SCHEDULE_TEMPLATES = [
  {
    name: 'Standard (Mon-Fri, 9-6)',
    schedule: DAYS_OF_WEEK.map((day, i) => ({
      day,
      enabled: i >= 1 && i <= 5, // Mon-Fri
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      breakStart: '01:00 PM',
      breakEnd: '02:00 PM',
    })),
  },
  {
    name: 'Extended Hours',
    schedule: DAYS_OF_WEEK.map((day, i) => ({
      day,
      enabled: i >= 1 && i <= 6, // Mon-Sat
      startTime: '08:00 AM',
      endTime: '08:00 PM',
      breakStart: '01:00 PM',
      breakEnd: '02:00 PM',
    })),
  },
  {
    name: 'Weekend Only',
    schedule: DAYS_OF_WEEK.map((day, i) => ({
      day,
      enabled: i === 0 || i === 6, // Sun & Sat
      startTime: '10:00 AM',
      endTime: '05:00 PM',
      breakStart: '',
      breakEnd: '',
    })),
  },
];

const ScheduleManager = ({
  initialSchedule = [],
  initialBlockedSlots = [],
  onSaveSchedule,
  onAddBlockedSlot,
  onDeleteBlockedSlot,
  saving = false,
}) => {
  // Weekly schedule state
  const [schedule, setSchedule] = useState(() => {
    if (initialSchedule.length > 0) {
      // Ensure breakStart/breakEnd fields exist on every item
      return initialSchedule.map(item => ({
        ...item,
        startTime: normalizeTimeLabel(item.startTime || '09:00 AM'),
        endTime: normalizeTimeLabel(item.endTime || '06:00 PM'),
        breakStart: normalizeTimeLabel(item.breakStart || ''),
        breakEnd: normalizeTimeLabel(item.breakEnd || ''),
      }));
    }
    return DAYS_OF_WEEK.map(day => ({
      day,
      enabled: false,
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      breakStart: '',
      breakEnd: '',
    }));
  });

  // Blocked slots state
  const [blockedSlots, setBlockedSlots] = useState(initialBlockedSlots);
  
  // UI state
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'blocked'
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [blockMonth, setBlockMonth] = useState(new Date());
  const [selectedBlockDate, setSelectedBlockDate] = useState(null);
  const [blockForm, setBlockForm] = useState({
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    reason: '',
    allDay: true,
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Update state when props change
  useEffect(() => {
    if (initialSchedule.length > 0) {
      // Ensure breakStart/breakEnd fields exist on every item
      setSchedule(initialSchedule.map(item => ({
        ...item,
        startTime: normalizeTimeLabel(item.startTime || '09:00 AM'),
        endTime: normalizeTimeLabel(item.endTime || '06:00 PM'),
        breakStart: normalizeTimeLabel(item.breakStart || ''),
        breakEnd: normalizeTimeLabel(item.breakEnd || ''),
      })));
    }
  }, [initialSchedule]);

  useEffect(() => {
    setBlockedSlots(initialBlockedSlots);
  }, [initialBlockedSlots]);

  // Track changes
  useEffect(() => {
    const originalJson = JSON.stringify(initialSchedule);
    const currentJson = JSON.stringify(schedule);
    setHasChanges(originalJson !== currentJson);
  }, [schedule, initialSchedule]);

  // Toggle day enabled
  const toggleDay = (dayIndex) => {
    setSchedule(prev => prev.map((item, i) => 
      i === dayIndex ? { ...item, enabled: !item.enabled } : item
    ));
  };

  // Update day schedule
  const updateDaySchedule = (dayIndex, field, value) => {
    setSchedule(prev => prev.map((item, i) => 
      i === dayIndex ? { ...item, [field]: value } : item
    ));
  };

  // Apply template
  const applyTemplate = (template) => {
    setSchedule(template.schedule);
  };

  // Copy to all days
  const copyToAllDays = (sourceIndex) => {
    const source = schedule[sourceIndex];
    setSchedule(prev => prev.map(item => ({
      ...item,
      startTime: source.startTime,
      endTime: source.endTime,
      breakStart: source.breakStart,
      breakEnd: source.breakEnd,
    })));
  };

  // Handle save
  const handleSave = async () => {
    if (onSaveSchedule) {
      await onSaveSchedule(schedule);
    }
  };

  // Handle add blocked slot
  const handleAddBlockedSlot = async () => {
    if (!selectedBlockDate) return;

    const year = selectedBlockDate.getFullYear();
    const month = String(selectedBlockDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedBlockDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (onAddBlockedSlot) {
      await onAddBlockedSlot({
        date: dateStr,
        startTime: blockForm.allDay ? '00:00' : blockForm.startTime,
        endTime: blockForm.allDay ? '23:59' : blockForm.endTime,
        reason: blockForm.reason || 'Time off',
      });
    }

    setShowAddBlockModal(false);
    setSelectedBlockDate(null);
    setBlockForm({ startTime: '09:00 AM', endTime: '06:00 PM', reason: '', allDay: true });
  };

  // Generate calendar for blocked slots
  const generateBlockCalendar = () => {
    const firstDay = new Date(blockMonth.getFullYear(), blockMonth.getMonth(), 1);
    const lastDay = new Date(blockMonth.getFullYear(), blockMonth.getMonth() + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startPadding; i++) {
      days.push({ type: 'empty', key: `empty-${i}` });
    }

    // Format date as YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
    const fmtLocalDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };
    const normalizeDateKey = (value) => {
      if (!value) return '';
      if (typeof value === 'string') return value.slice(0, 10);
      return fmtLocalDate(new Date(value));
    };

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(blockMonth.getFullYear(), blockMonth.getMonth(), day);
      const dateStr = fmtLocalDate(date);
      const isBlocked = blockedSlots.some(slot => {
        const slotDate = normalizeDateKey(slot.date);
        return slotDate === dateStr;
      });
      const isPast = date < today;
      const isSelected = selectedBlockDate && 
        date.getDate() === selectedBlockDate.getDate() && 
        date.getMonth() === selectedBlockDate.getMonth();

      days.push({
        type: 'day',
        day,
        date,
        dateStr,
        isBlocked,
        isPast,
        isSelected,
        key: `day-${day}`,
      });
    }

    return days;
  };

  const calendarDays = generateBlockCalendar();

  // Time select component
  const TimeSelect = ({ value, onChange, label, allowEmpty = false }) => (
    <div className="flex-1">
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      >
        {allowEmpty && <option value="">None</option>}
        {TIME_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.label}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'weekly'
              ? 'border-teal-500 text-teal-600 bg-teal-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Weekly Schedule
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'blocked'
              ? 'border-teal-500 text-teal-600 bg-teal-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Time Off
          {blockedSlots.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
              {blockedSlots.length}
            </span>
          )}
        </button>
      </div>

      {/* Weekly Schedule Tab */}
      {activeTab === 'weekly' && (
        <div className="p-6">
          {/* Quick Templates */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Templates</p>
            <div className="flex flex-wrap gap-2">
              {SCHEDULE_TEMPLATES.map((template, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(template)}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="space-y-3">
            {schedule.map((daySchedule, index) => (
              <div
                key={daySchedule.day}
                className={`p-4 rounded-xl border-2 transition-all ${
                  daySchedule.enabled
                    ? 'border-teal-200 bg-teal-50/50'
                    : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Day Toggle */}
                  <button
                    onClick={() => toggleDay(index)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      daySchedule.enabled ? 'bg-teal-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                        daySchedule.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>

                  {/* Day Name */}
                  <div className="w-24">
                    <span className={`font-semibold ${daySchedule.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                      {daySchedule.day.slice(0, 3)}
                    </span>
                  </div>

                  {/* Time Inputs */}
                  {daySchedule.enabled ? (
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <TimeSelect
                          value={daySchedule.startTime}
                          onChange={(val) => updateDaySchedule(index, 'startTime', val)}
                          label="Start"
                        />
                        <span className="text-gray-400 mt-5">to</span>
                        <TimeSelect
                          value={daySchedule.endTime}
                          onChange={(val) => updateDaySchedule(index, 'endTime', val)}
                          label="End"
                        />
                      </div>

                      {/* Break Time */}
                      <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                        <Coffee className="w-4 h-4 text-orange-400" />
                        <TimeSelect
                          value={daySchedule.breakStart || ''}
                          onChange={(val) => updateDaySchedule(index, 'breakStart', val)}
                          label="Break Start"
                          allowEmpty
                        />
                        <span className="text-gray-400 mt-5">to</span>
                        <TimeSelect
                          value={daySchedule.breakEnd || ''}
                          onChange={(val) => updateDaySchedule(index, 'breakEnd', val)}
                          label="Break End"
                          allowEmpty
                        />
                      </div>

                      {/* Copy Action */}
                      <button
                        onClick={() => copyToAllDays(index)}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-100 rounded-lg transition-colors ml-auto"
                        title="Copy to all days"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 text-gray-400 text-sm">
                      Not available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Schedule
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Time Off Tab */}
      {activeTab === 'blocked' && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setBlockMonth(new Date(blockMonth.getFullYear(), blockMonth.getMonth() - 1, 1))}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-lg font-bold text-gray-900">
                  {blockMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setBlockMonth(new Date(blockMonth.getFullYear(), blockMonth.getMonth() + 1, 1))}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
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
                      onClick={() => {
                        if (!item.isPast && !item.isBlocked) {
                          setSelectedBlockDate(item.date);
                          setShowAddBlockModal(true);
                        }
                      }}
                      disabled={item.isPast}
                      className={`h-10 w-full rounded-lg flex items-center justify-center text-sm font-medium transition-all
                        ${item.isBlocked
                          ? 'bg-red-100 text-red-600 border-2 border-red-200'
                          : item.isSelected
                            ? 'bg-teal-500 text-white'
                            : item.isPast
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'hover:bg-white hover:shadow-md text-gray-700'
                        }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Click on a date to add time off
              </p>
            </div>

            {/* Blocked Slots List */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Upcoming Time Off
              </h3>

              {blockedSlots.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No time off scheduled</p>
                  <p className="text-sm text-gray-400 mt-1">Click on a calendar date to add</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {blockedSlots.map((slot, index) => (
                    <div
                      key={slot.id || index}
                      className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {(() => {
                            const dateKey = typeof slot.date === 'string' ? slot.date.slice(0, 10) : null;
                            if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
                              const [y, m, d] = dateKey.split('-').map(Number);
                              return new Date(y, m - 1, d).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              });
                            }
                            return new Date(slot.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            });
                          })()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {slot.time || `${slot.startTime} - ${slot.endTime}`}
                        </p>
                        {slot.reason && (
                          <p className="text-xs text-gray-400 mt-1">{slot.reason}</p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteBlockedSlot && onDeleteBlockedSlot(slot.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Block Modal */}
      {showAddBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Add Time Off</h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedBlockDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* All Day Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">All Day</span>
                <button
                  onClick={() => setBlockForm(prev => ({ ...prev, allDay: !prev.allDay }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    blockForm.allDay ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                      blockForm.allDay ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Time Selection */}
              {!blockForm.allDay && (
                <div className="flex gap-4">
                  <TimeSelect
                    value={blockForm.startTime}
                    onChange={(val) => setBlockForm(prev => ({ ...prev, startTime: val }))}
                    label="From"
                  />
                  <TimeSelect
                    value={blockForm.endTime}
                    onChange={(val) => setBlockForm(prev => ({ ...prev, endTime: val }))}
                    label="To"
                  />
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Personal appointment, Vacation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddBlockModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddBlockedSlot}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time Off
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;
