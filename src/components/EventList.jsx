import React, { useState } from 'react';
import { formatEventDate, calculateEventDuration } from '../utils/icsUtils';
import { CATEGORIES } from './EventCategories';
import '../styles/EventList.css';

export default function EventList({ events, onEdit, onDelete, onDuplicate }) {
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  if (events.length === 0) {
    return (
      <div className="event-list empty">
        <p>No events yet. Add or import events to get started.</p>
      </div>
    );
  }

  const getCategoryColor = (categoryId) => {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    return cat ? cat.color : CATEGORIES[4].color;
  };

  // Calculate pagination
  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEvents = events.slice(startIndex, endIndex);

  // Validate current page
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
    return null; // Will rerender with correct page
  }

  return (
    <div className="event-list">
      <table className="events-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date & Time</th>
            <th>Duration</th>
            <th>Location</th>
            <th>Description</th>
            <th>Attendees</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEvents.map((event) => (
            <tr key={event.id || event.uid}>
              <td className="title">
                <div style={{ borderLeft: `4px solid ${getCategoryColor(event.category)}`, paddingLeft: '0.75rem' }}>
                  {event.summary}
                  {event.recurrence && event.recurrence.type !== 'none' && (
                    <span className="recurrence-badge">
                      {event.recurrence.type.charAt(0).toUpperCase() + event.recurrence.type.slice(1)}
                    </span>
                  )}
                </div>
              </td>
              <td className="datetime">
                {event.isAllDay ? (
                  <div>
                    <strong>{new Date(event.startDate).toLocaleDateString()}</strong>
                    <small>All day</small>
                  </div>
                ) : (
                  <div>{formatEventDate(event.startDate)}</div>
                )}
              </td>
              <td className="duration">
                {event.isAllDay ? (
                  <span className="duration-badge all-day">All day</span>
                ) : (
                  <span className="duration-badge">{calculateEventDuration(event.startDate, event.endDate)}</span>
                )}
              </td>
              <td>{event.location || '-'}</td>
              <td className="description">{event.description || '-'}</td>
              <td className="attendees">
                {event.attendees && event.attendees.length > 0 ? (
                  <div className="attendee-list">
                    {event.attendees.length > 2 ? (
                      <>
                        <span title={event.attendees.join('\n')}>
                          {event.attendees.length} attendees
                        </span>
                      </>
                    ) : (
                      event.attendees.map((att, i) => (
                        <div key={i}>{att}</div>
                      ))
                    )}
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td className="actions">
                <button className="btn btn-sm btn-edit" onClick={() => onEdit(event)}>
                  Edit
                </button>
                {onDuplicate && (
                  <button className="btn btn-sm btn-duplicate" onClick={() => onDuplicate(event)} title="Duplicate event">
                    📋
                  </button>
                )}
                <button className="btn btn-sm btn-delete" onClick={() => onDelete(event)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({events.length} total events)
          </span>
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
