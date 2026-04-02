import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import EventCategories from './EventCategories';
import ConflictWarning from './ConflictWarning';
import '../styles/EventForm.css';

const formatToDateTimeLocal = (value) => {
  if (!value) return new Date().toISOString().slice(0, 16);
  const dateValue = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateValue.getTime())) return '';
  return dateValue.toISOString().slice(0, 16);
};

const normalizeEvent = (event) => ({
  ...event,
  summary: event.summary || '',
  description: event.description || '',
  startDate: formatToDateTimeLocal(event.startDate),
  endDate: formatToDateTimeLocal(event.endDate),
  location: event.location || '',
  attendees: event.attendees ? event.attendees.join(', ') : '',
  isAllDay: !!event.isAllDay,
  category: event.category || 'other',
  recurrence: event.recurrence || {
    type: 'none',
    endType: 'never',
    endDate: '',
    occurrences: '',
    weekDays: [],
  },
});

export default function EventForm({ initialEvent = null, onSave, onCancel, allEvents = [] }) {
  const defaultEvent = {
    summary: '',
    description: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    location: '',
    attendees: '',
    isAllDay: false,
    category: 'other',
    recurrence: {
      type: 'none', // 'none', 'daily', 'weekly', 'monthly', 'yearly'
      endType: 'never', // 'never', 'on', 'after'
      endDate: '',
      occurrences: '',
      weekDays: [], // for weekly
    },
  };

  const [formData, setFormData] = useState(initialEvent ? normalizeEvent(initialEvent) : defaultEvent);

  const [errors, setErrors] = useState({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (initialEvent) {
      setFormData(normalizeEvent(initialEvent));
    }
    setIsMounted(true);
  }, [initialEvent]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData((prev) => {
        const updated = { ...prev, [name]: checked };
        
        // If switching to all-day, adjust times to preserve the date
        if (name === 'isAllDay' && checked) {
          // Parse the datetime-local value as local time (not UTC)
          // Format is YYYY-MM-DDThh:mm
          const [datePart] = prev.startDate.split('T');
          const [endDatePart] = prev.endDate.split('T');
          
          // For all-day events, just keep the date part and add T00:00
          updated.startDate = datePart + 'T00:00';
          
          // If end date is same day, move to next day
          if (datePart === endDatePart) {
            const dateObj = new Date(datePart + 'T00:00');
            dateObj.setDate(dateObj.getDate() + 1);
            const nextDay = dateObj.toISOString().split('T')[0];
            updated.endDate = nextDay + 'T00:00';
          } else {
            updated.endDate = endDatePart + 'T00:00';
          }
        }
        
        return updated;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRecurrenceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      recurrence: { ...prev.recurrence, [field]: value },
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
    // Clear error when user starts typing
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: '' }));
    }
  };

  const handleWeekDayToggle = (day) => {
    setFormData((prev) => {
      const weekDays = prev.recurrence.weekDays.includes(day)
        ? prev.recurrence.weekDays.filter((d) => d !== day)
        : [...prev.recurrence.weekDays, day];
      return {
        ...prev,
        recurrence: { ...prev.recurrence, weekDays },
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.summary.trim()) {
      newErrors.summary = 'Event title is required';
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (isNaN(startDate.getTime())) {
      newErrors.startDate = 'Valid start date is required';
    }
    if (isNaN(endDate.getTime())) {
      newErrors.endDate = 'Valid end date is required';
    }
    if (startDate > endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const attendees = formData.attendees
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a);

    let startDate = new Date(formData.startDate);
    let endDate = new Date(formData.endDate);
    
    // For all-day events, set times to midnight
    if (formData.isAllDay) {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
    }

    onSave({
      ...formData,
      startDate,
      endDate,
      attendees,
      recurrence: formData.recurrence,
    });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="summary">Event Title *</label>
        <input
          type="text"
          id="summary"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Enter event title"
          className={errors.summary ? 'error' : ''}
        />
        {errors.summary && <span className="error-message">{errors.summary}</span>}
      </div>

      {/* Conflict Warning - shown if event has time conflicts with other events */}
      {!formData.isAllDay && formData.summary && (
        <ConflictWarning 
          event={{
            id: initialEvent?.id || `preview-${Date.now()}`,
            uid: initialEvent?.uid || `preview-${Date.now()}`,
            summary: formData.summary,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            isAllDay: false,
          }} 
          allEvents={allEvents.filter(e => e.id !== initialEvent?.id && e.uid !== initialEvent?.uid)}
        />
      )}

      <div className="form-group">
        <label htmlFor="description">Description</label>
        {isMounted && (
          <RichTextEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Enter event description"
          />
        )}
      </div>

      <div className="form-group checkbox-group">
        <label htmlFor="isAllDay" className="checkbox-label">
          <input
            type="checkbox"
            id="isAllDay"
            name="isAllDay"
            checked={formData.isAllDay}
            onChange={handleChange}
          />
          <span>All day event</span>
        </label>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date {!formData.isAllDay && '& Time'} *</label>
          <input
            type={formData.isAllDay ? 'date' : 'datetime-local'}
            id="startDate"
            name="startDate"
            value={formData.isAllDay ? formData.startDate.split('T')[0] : formData.startDate}
            onChange={(e) => {
              let value = e.target.value;
              if (formData.isAllDay && !value.includes('T')) {
                value += 'T00:00';
              }
              handleChange({ ...e, target: { ...e.target, name: 'startDate', value } });
            }}
            className={errors.startDate ? 'error' : ''}
          />
          {errors.startDate && <span className="error-message">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date {!formData.isAllDay && '& Time'} *</label>
          <input
            type={formData.isAllDay ? 'date' : 'datetime-local'}
            id="endDate"
            name="endDate"
            value={formData.isAllDay ? formData.endDate.split('T')[0] : formData.endDate}
            onChange={(e) => {
              let value = e.target.value;
              if (formData.isAllDay && !value.includes('T')) {
                value += 'T00:00';
              }
              handleChange({ ...e, target: { ...e.target, name: 'endDate', value } });
            }}
            className={errors.endDate ? 'error' : ''}
          />
          {errors.endDate && <span className="error-message">{errors.endDate}</span>}
        </div>
      </div>

      {/* Recurrence Section */}
      <div className="form-group">
        <label htmlFor="recurrenceType">Recurrence</label>
        <select
          id="recurrenceType"
          value={formData.recurrence.type}
          onChange={(e) => handleRecurrenceChange('type', e.target.value)}
        >
          <option value="none">No Recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Weekly recurrence day selection */}
      {formData.recurrence.type === 'weekly' && (
        <div className="form-group">
          <label>Days of Week</label>
          <div className="weekdays-selector">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <label key={day} className="weekday-checkbox">
                <input
                  type="checkbox"
                  checked={formData.recurrence.weekDays.includes(idx)}
                  onChange={() => handleWeekDayToggle(idx)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Recurrence end condition */}
      {formData.recurrence.type !== 'none' && (
        <div className="form-group">
          <label htmlFor="recurrenceEndType">Recurrence Ends</label>
          <select
            id="recurrenceEndType"
            value={formData.recurrence.endType}
            onChange={(e) => handleRecurrenceChange('endType', e.target.value)}
          >
            <option value="never">Never</option>
            <option value="on">On a specific date</option>
            <option value="after">After a number of occurrences</option>
          </select>
        </div>
      )}

      {formData.recurrence.type !== 'none' && formData.recurrence.endType === 'on' && (
        <div className="form-group">
          <label htmlFor="recurrenceEndDate">End Date</label>
          <input
            type="date"
            id="recurrenceEndDate"
            value={formData.recurrence.endDate}
            onChange={(e) => handleRecurrenceChange('endDate', e.target.value)}
          />
        </div>
      )}

      {formData.recurrence.type !== 'none' && formData.recurrence.endType === 'after' && (
        <div className="form-group">
          <label htmlFor="recurrenceOccurrences">Number of Occurrences</label>
          <input
            type="number"
            id="recurrenceOccurrences"
            min="1"
            value={formData.recurrence.occurrences}
            onChange={(e) => handleRecurrenceChange('occurrences', e.target.value)}
            placeholder="e.g., 10"
          />
        </div>
      )}

      <div className="form-group" onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}>
        <EventCategories
          selectedCategory={formData.category}
          onSelect={(category) => setFormData((prev) => ({ ...prev, category }))}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter event location"
        />
      </div>

      <div className="form-group">
        <label htmlFor="attendees">Attendees (comma-separated)</label>
        <input
          type="text"
          id="attendees"
          name="attendees"
          value={formData.attendees}
          onChange={handleChange}
          placeholder="e.g., user1@example.com, user2@example.com"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initialEvent ? 'Update Event' : 'Add Event'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
