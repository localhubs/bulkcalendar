/**
 * Utility functions for detecting event conflicts
 */

/**
 * Check if two events overlap in time
 * @param {Object} event1 - First event
 * @param {Object} event2 - Second event
 * @returns {boolean} True if events overlap
 */
export function eventsOverlap(event1, event2) {
  const start1 = new Date(event1.startDate);
  const end1 = new Date(event1.endDate);
  const start2 = new Date(event2.startDate);
  const end2 = new Date(event2.endDate);

  // All-day events don't conflict with timed events in this implementation
  if (event1.isAllDay || event2.isAllDay) {
    return false;
  }

  // Check for overlap: event1 starts before event2 ends AND event1 ends after event2 starts
  return start1 < end2 && end1 > start2;
}

/**
 * Find all conflicts for a given event
 * @param {Object} event - The event to check
 * @param {Array} allEvents - Array of all events
 * @returns {Array} Array of conflicting events
 */
export function findEventConflicts(event, allEvents) {
  return allEvents.filter((otherEvent) => {
    // Don't compare with itself
    if (otherEvent.id === event.id || otherEvent.uid === event.uid) {
      return false;
    }
    return eventsOverlap(event, otherEvent);
  });
}

/**
 * Get all conflicts in the calendar
 * @param {Array} events - Array of all events
 * @returns {Array} Array of conflict pairs
 */
export function getAllConflicts(events) {
  const conflicts = [];
  const processedPairs = new Set();

  events.forEach((event, index) => {
    const conflicts_ = findEventConflicts(event, events);
    conflicts_.forEach((conflictEvent) => {
      const pairKey = [event.id, conflictEvent.id].sort().join('-');
      if (!processedPairs.has(pairKey)) {
        conflicts.push({ event1: event, event2: conflictEvent });
        processedPairs.add(pairKey);
      }
    });
  });

  return conflicts;
}

/**
 * Format conflict info for display
 * @param {Array} conflictingEvents - Array of conflicting events
 * @returns {string} Formatted conflict message
 */
export function formatConflictMessage(conflictingEvents) {
  if (conflictingEvents.length === 0) {
    return 'No conflicts';
  }
  if (conflictingEvents.length === 1) {
    return `Conflicts with: ${conflictingEvents[0].summary}`;
  }
  return `Conflicts with ${conflictingEvents.length} events`;
}
