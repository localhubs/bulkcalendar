import React, { useState, useEffect, useRef } from 'react';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import ImportExport from './components/ImportExport';
import EventSearch from './components/EventSearch';
import MonthView from './components/MonthView';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import DarkModeToggle from './components/DarkModeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import useDarkMode from './hooks/useDarkMode';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'month'
  const searchInputRef = useRef(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        // Convert date strings back to Date objects
        const eventsWithDates = parsed.map((e) => ({
          ...e,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
        }));
        setEvents(eventsWithDates);
      } catch (error) {
        console.error('Error loading saved events:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    // Reset filters when events change
    setFilteredEvents(events);
  }, [events]);

  const handleAddEvent = (eventData) => {
    if (editingEvent) {
      // Update existing event
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id || e.uid === editingEvent.uid ? eventData : e))
      );
      setEditingEvent(null);
    } else {
      // Add new event with unique ID
      const newEvent = {
        ...eventData,
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        uid: eventData.uid || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@bulkcalendar`,
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    setShowForm(false);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDeleteEvent = (event) => {
    if (confirm(`Are you sure you want to delete "${event.summary}"?`)) {
      setEvents((prev) => prev.filter((e) => e.id !== event.id && e.uid !== event.uid));
    }
  };

  const handleDuplicateEvent = (event) => {
    // Create a new event with the same properties but new ID and UID
    const duplicatedEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uid: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@bulkcalendar`,
      summary: `${event.summary} (Copy)`,
    };
    setEvents((prev) => [...prev, duplicatedEvent]);
  };

  const handleImportEvents = (importedEvents) => {
    // Add imported events with unique IDs
    const newEvents = importedEvents.map((e) => ({
      ...e,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uid: e.uid || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@bulkcalendar`,
    }));
    setEvents((prev) => [...prev, ...newEvents]);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📅 Bulk Calendar</h1>
        <p>Manage events with Outlook ICS import/export support</p>
      </header>

      <main className="app-main">
        <section className="section">
          <ImportExport events={events} onImport={handleImportEvents} />
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Event Manager</h2>
            <div className="header-controls">
              <div className="view-toggle">
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  📋 List
                </button>
                <button 
                  className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                  onClick={() => setViewMode('month')}
                >
                  📅 Month
                </button>
              </div>
              {!showForm && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  ➕ Add New Event
                </button>
              )}
            </div>
          </div>

          {showForm && (
            <>
              <div className="form-overlay" onClick={handleCancelForm}></div>
              <div className="form-modal">
                <ErrorBoundary>
                  <EventForm initialEvent={editingEvent} onSave={handleAddEvent} onCancel={handleCancelForm} allEvents={events} />
                </ErrorBoundary>
              </div>
            </>
          )}

          {events.length > 0 && viewMode === 'list' && (
            <EventSearch ref={searchInputRef} events={events} onFilter={setFilteredEvents} />
          )}

          {viewMode === 'month' ? (
            <MonthView 
              events={events} 
              onEventClick={handleEditEvent}
              onDateClick={(date) => setShowForm(true)}
            />
          ) : (
            <EventList events={filteredEvents} onEdit={handleEditEvent} onDelete={handleDeleteEvent} onDuplicate={handleDuplicateEvent} />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          💡 Tip: Events are automatically saved to your browser. Export your events regularly to keep
          backups.
        </p>
      </footer>

      <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />

      <KeyboardShortcuts 
        onAddClick={() => setShowForm(true)}
        onSearchFocus={() => searchInputRef.current?.focus()}
      />
    </div>
  );
}

export default App;
