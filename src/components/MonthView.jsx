import React, { useState } from 'react';
import '../styles/MonthView.css';

const MonthView = ({ events, onEventClick, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const checkDate = new Date(dateKey);

      return checkDate >= new Date(eventStart.toISOString().split('T')[0]) &&
             checkDate <= new Date(eventEnd.toISOString().split('T')[0]);
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before the month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date) => {
    if (!date) return false;
    return date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear();
  };

  return (
    <div className="month-view">
      <div className="month-header">
        <button onClick={handlePrevMonth} className="nav-button">←</button>
        <h2>{monthName}</h2>
        <button onClick={handleNextMonth} className="nav-button">→</button>
        <button onClick={handleToday} className="today-button">Today</button>
      </div>

      <div className="calendar-grid">
        <div className="weekday-headers">
          {weekDays.map((day) => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((date, dayIndex) => {
                const dayEvents = date ? getEventsForDate(date) : [];
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`calendar-day ${!date || !isCurrentMonth(date) ? 'other-month' : ''} ${isToday(date) ? 'today' : ''}`}
                    onClick={() => date && isCurrentMonth(date) && onDateClick && onDateClick(date)}
                  >
                    {date && (
                      <>
                        <div className="day-number">{date.getDate()}</div>
                        <div className="day-events">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id || event.uid}
                              className={`event-dot category-${event.category || 'other'}`}
                              title={event.summary}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick && onEventClick(event);
                              }}
                            >
                              <span className="event-title">{event.summary}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="more-events">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
