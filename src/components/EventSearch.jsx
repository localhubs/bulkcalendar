import React, { useState, forwardRef } from 'react';
import '../styles/EventSearch.css';

const EventSearch = forwardRef(({ events, onFilter }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(term, filterType, dateFrom, dateTo);
  };

  const handleFilterTypeChange = (e) => {
    const type = e.target.value;
    setFilterType(type);
    applyFilters(searchTerm, type, dateFrom, dateTo);
  };

  const handleDateFromChange = (e) => {
    const date = e.target.value;
    setDateFrom(date);
    applyFilters(searchTerm, filterType, date, dateTo);
  };

  const handleDateToChange = (e) => {
    const date = e.target.value;
    setDateTo(date);
    applyFilters(searchTerm, filterType, dateFrom, date);
  };

  const applyFilters = (search, type, from, to) => {
    let filtered = events;

    // Text search
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((event) => {
        const summary = (event.summary || '').toLowerCase();
        const description = (event.description || '').toLowerCase();
        const location = (event.location || '').toLowerCase();
        const attendees = (event.attendees || [])
          .join(' ')
          .toLowerCase();

        return (
          summary.includes(lowerSearch) ||
          description.includes(lowerSearch) ||
          location.includes(lowerSearch) ||
          attendees.includes(lowerSearch)
        );
      });
    }

    // Filter by type
    if (type !== 'all') {
      if (type === 'recurring') {
        filtered = filtered.filter((event) => event.recurrence?.type !== 'none');
      } else if (type === 'allday') {
        filtered = filtered.filter((event) => event.isAllDay);
      } else if (type === 'upcoming') {
        const now = new Date();
        filtered = filtered.filter((event) => new Date(event.startDate) >= now);
      } else if (type === 'past') {
        const now = new Date();
        filtered = filtered.filter((event) => new Date(event.startDate) < now);
      }
    }

    // Date range filter
    if (from) {
      const fromDate = new Date(from);
      filtered = filtered.filter((event) => new Date(event.startDate) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((event) => new Date(event.startDate) <= toDate);
    }

    onFilter(filtered);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setDateFrom('');
    setDateTo('');
    onFilter(events);
  };

  const activeFilters = [
    searchTerm ? 1 : 0,
    filterType !== 'all' ? 1 : 0,
    dateFrom ? 1 : 0,
    dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="event-search">
      <div className="search-container">
        <input
          ref={ref}
          type="text"
          className="search-input"
          placeholder="🔍 Search by title, location, description, attendees..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="filters-row">
        <div className="filter-group">
          <label htmlFor="filterType">Filter Type</label>
          <select
            id="filterType"
            value={filterType}
            onChange={handleFilterTypeChange}
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="recurring">Recurring Only</option>
            <option value="allday">All-Day Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="dateFrom">From</label>
          <input
            type="date"
            id="dateFrom"
            value={dateFrom}
            onChange={handleDateFromChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="dateTo">To</label>
          <input
            type="date"
            id="dateTo"
            value={dateTo}
            onChange={handleDateToChange}
          />
        </div>

        {activeFilters > 0 && (
          <button className="btn-clear" onClick={handleClearFilters}>
            ✕ Clear ({activeFilters})
          </button>
        )}
      </div>

      {activeFilters > 0 && (
        <div className="filter-info">
          {activeFilters === 1 && <span>1 filter active</span>}
          {activeFilters > 1 && <span>{activeFilters} filters active</span>}
          {' — '}
          Showing {events.length > 0 ? 'filtered results' : 'no results'}
        </div>
      )}
    </div>
  );
});

EventSearch.displayName = 'EventSearch';

export default EventSearch;
