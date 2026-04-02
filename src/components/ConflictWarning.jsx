import React, { useMemo } from 'react';
import { findEventConflicts } from '../utils/conflictUtils';
import '../styles/ConflictWarning.css';

const ConflictWarning = ({ event, allEvents }) => {
  const conflicts = useMemo(
    () => (event && allEvents ? findEventConflicts(event, allEvents) : []),
    [event, allEvents]
  );

  if (conflicts.length === 0) {
    return null;
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="conflict-warning">
      <div className="conflict-header">
        <span className="conflict-icon">⚠️</span>
        <span className="conflict-title">Time Conflict Detected</span>
      </div>
      <div className="conflict-list">
        {conflicts.map((conflictEvent) => (
          <div key={conflictEvent.id || conflictEvent.uid} className="conflict-item">
            <div className="conflict-event-name">{conflictEvent.summary}</div>
            <div className="conflict-event-time">
              {formatTime(conflictEvent.startDate)} - {formatTime(conflictEvent.endDate)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConflictWarning;
