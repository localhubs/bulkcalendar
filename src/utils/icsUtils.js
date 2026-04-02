/**
 * Utility functions for parsing and generating ICS (iCalendar) files
 * Supports Outlook-compatible ICS format
 */

import ICAL from 'ical.js';

/**
 * Parse ICS file content and extract events
 * @param {string} icsContent - The content of the ICS file
 * @returns {Array} Array of parsed events
 */
export function parseIcsFile(icsContent) {
  try {
    // First, try to normalize the ICS content to handle encoding issues
    let normalizedContent = icsContent;
    
    // Remove any BOM (Byte Order Mark) if present
    if (normalizedContent.charCodeAt(0) === 0xFEFF) {
      normalizedContent = normalizedContent.slice(1);
    }

    // Try to parse the ICS file
    let jcalData;
    try {
      jcalData = ICAL.parse(normalizedContent);
    } catch (parseError) {
      // If standard parsing fails, try to recover by fixing common issues
      console.warn('Initial parse failed, attempting recovery:', parseError.message);
      
      // Try removing carriage returns and normalizing line endings
      normalizedContent = normalizedContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      jcalData = ICAL.parse(normalizedContent);
    }

    const comp = new ICAL.Component(jcalData);
    const events = [];

    // Get all VEVENT components
    const vevents = comp.getAllSubcomponents('vevent');

    vevents.forEach((vevent) => {
      try {
        const event = vevent.getFirstPropertyValue('summary') || 'Untitled Event';
        const description = vevent.getFirstPropertyValue('description') || '';
        const location = vevent.getFirstPropertyValue('location') || '';
        const uid = vevent.getFirstPropertyValue('uid') || generateUID();
        const attendees = [];

        // Check if this is an all-day event by looking at the DTSTART property
        let isAllDay = false;
        try {
          const dtstartProp = vevent.getFirstProperty('dtstart');
          if (dtstartProp) {
            const param = dtstartProp.getParameter('value');
            isAllDay = param === 'DATE';
          }
        } catch (e) {
          // Ignore error, default to false
        }

        // Safely extract start date
        let startDate = new Date();
        try {
          const dtstart = vevent.getFirstPropertyValue('dtstart');
          if (dtstart && dtstart.toJSDate) {
            startDate = dtstart.toJSDate();
          } else if (dtstart) {
            // Try to convert string date if it's not an ICAL.Time object
            startDate = new Date(dtstart.toString());
          }
        } catch (dateError) {
          console.warn('Could not parse start date, using current time:', dateError.message);
          startDate = new Date();
        }

        // Safely extract end date
        let endDate = new Date(startDate.getTime() + 3600000); // Default to 1 hour after start
        try {
          const dtend = vevent.getFirstPropertyValue('dtend');
          if (dtend && dtend.toJSDate) {
            endDate = dtend.toJSDate();
          } else if (dtend) {
            endDate = new Date(dtend.toString());
          }
        } catch (dateError) {
          console.warn('Could not parse end date, using default:', dateError.message);
          endDate = new Date(startDate.getTime() + 3600000);
        }

        // For all-day events, ensure times are set to midnight
        if (isAllDay) {
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
        }

        // Ensure end date is after start date
        if (endDate <= startDate) {
          endDate = new Date(startDate.getTime() + 3600000);
        }

        // Extract attendee information
        try {
          const attendeeProps = vevent.getAllProperties('attendee');
          attendeeProps.forEach((prop) => {
            try {
              const attendeeValue = prop.getFirstValue();
              if (attendeeValue) {
                const attendeeStr = attendeeValue.toString();
                // Clean up mailto: prefix if present
                const cleaned = attendeeStr.replace(/^mailto:/i, '');
                if (cleaned) {
                  attendees.push(cleaned);
                }
              }
            } catch (attendeeError) {
              console.warn('Could not parse attendee:', attendeeError.message);
            }
          });
        } catch (attendeeError) {
          console.warn('Error extracting attendees:', attendeeError.message);
        }

        events.push({
          id: uid,
          summary: event,
          description,
          startDate,
          endDate,
          location,
          attendees,
          uid,
          isAllDay,
          recurrence: parseRRULE(vevent),
        });
      } catch (eventError) {
        console.warn('Error processing event, skipping:', eventError.message);
        // Continue to next event if one fails
      }
    });

    if (events.length === 0) {
      throw new Error('No valid events found in ICS file');
    }

    return events;
  } catch (error) {
    console.error('Error parsing ICS file:', error);
    throw new Error('Failed to parse ICS file: ' + error.message);
  }
}

/**
 * Generate ICS file content from events array
 * @param {Array} events - Array of event objects
 * @returns {string} ICS file content
 */
export function generateIcsFile(events) {
  try {
    // Get timezone info
    const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Start building the ICS file as a string for maximum compatibility
    let icsContent = 'BEGIN:VCALENDAR\r\n';
    icsContent += 'VERSION:2.0\r\n';
    icsContent += 'PRODID:-//Bulk Calendar//EN\r\n';
    icsContent += 'CALSCALE:GREGORIAN\r\n';
    icsContent += 'METHOD:PUBLISH\r\n';
    icsContent += 'X-WR-CALNAME:Bulk Calendar\r\n';
    icsContent += `X-WR-TIMEZONE:${tzName}\r\n`;

    // Add each event
    events.forEach((event) => {
      icsContent += 'BEGIN:VEVENT\r\n';
      
      // UID (required)
      icsContent += `UID:${event.uid || generateUID()}\r\n`;
      
      // DTSTAMP (required - current time in UTC)
      const now = new Date();
      icsContent += `DTSTAMP:${formatDateTimeToICS(now)}\r\n`;
      
      // Start and end times - use DATE format for all-day events
      if (event.isAllDay) {
        icsContent += `DTSTART;VALUE=DATE:${formatDateToICS(event.startDate)}\r\n`;
        icsContent += `DTEND;VALUE=DATE:${formatDateToICS(event.endDate)}\r\n`;
      } else {
        icsContent += `DTSTART:${formatDateTimeToICS(event.startDate)}\r\n`;
        icsContent += `DTEND:${formatDateTimeToICS(event.endDate)}\r\n`;
      }
      
      // Summary (required)
      icsContent += `SUMMARY:${escapeICSValue(event.summary || 'Untitled Event')}\r\n`;
      
      // Description (optional)
      if (event.description) {
        icsContent += `DESCRIPTION:${escapeICSValue(event.description)}\r\n`;
      }
      
      // Location (optional)
      if (event.location) {
        icsContent += `LOCATION:${escapeICSValue(event.location)}\r\n`;
      }
      
      // Attendees (optional)
      if (event.attendees && event.attendees.length > 0) {
        event.attendees.forEach((attendee) => {
          const attendeeEmail = attendee.includes('@') ? attendee : `mailto:${attendee}`;
          icsContent += `ATTENDEE:${attendeeEmail}\r\n`;
        });
      }
      
      // Recurrence rule (optional)
      if (event.recurrence && event.recurrence.type !== 'none') {
        const rrule = generateRRULE(event.recurrence, event.startDate);
        if (rrule) {
          icsContent += `RRULE:${rrule}\r\n`;
        }
      }
      
      icsContent += 'END:VEVENT\r\n';
    });

    icsContent += 'END:VCALENDAR';
    
    return icsContent;
  } catch (error) {
    console.error('Error generating ICS file:', error);
    throw new Error('Failed to generate ICS file: ' + error.message);
  }
}

/**
 * Format a JavaScript Date to ICS datetime format (YYYYMMDDTHHMMSSZ)
 * @param {Date} date - The date to format
 * @returns {string} Formatted date in ICS format
 */
function formatDateTimeToICS(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Format a JavaScript Date to ICS date format (YYYYMMDD) for all-day events
 * @param {Date} date - The date to format
 * @returns {string} Formatted date in ICS date format
 */
function formatDateToICS(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

/**
 * Escape special characters in ICS field values
 * @param {string} value - The value to escape
 * @returns {string} Escaped value
 */
function escapeICSValue(value) {
  if (typeof value !== 'string') {
    return String(value);
  }
  // Escape special characters according to RFC 5545
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Generate a unique UID for events
 * @returns {string} Unique identifier
 */
function generateUID() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@bulkcalendar`;
}

/**
 * Download ICS content as a file
 * @param {string} icsContent - ICS file content
 * @param {string} filename - Name of the file to download
 */
export function downloadIcsFile(icsContent, filename = 'calendar.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Validate and format event dates
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatEventDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate the duration of an event and return a formatted string
 * @param {Date|string} startDate - The event start date
 * @param {Date|string} endDate - The event end date
 * @returns {string} Formatted duration (e.g., "2h 30m", "1d 3h", etc.)
 */
export function calculateEventDuration(startDate, endDate) {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  // Calculate difference in milliseconds
  const diffMs = end - start;
  
  if (diffMs <= 0) {
    return '0m';
  }
  
  // Convert to different units
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Build the duration string
  let parts = [];
  
  if (diffDays > 0) {
    parts.push(`${diffDays}d`);
  }
  
  const remainingHours = diffHours % 24;
  if (remainingHours > 0) {
    parts.push(`${remainingHours}h`);
  }
  
  const remainingMinutes = diffMinutes % 60;
  if (remainingMinutes > 0 && diffDays === 0) {
    parts.push(`${remainingMinutes}m`);
  }
  
  return parts.length > 0 ? parts.join(' ') : '0m';
}

/**
 * Parse RRULE from a VEVENT component
 * @param {ICAL.Component} vevent - The VEVENT component
 * @returns {Object} Recurrence object
 */
function parseRRULE(vevent) {
  const recurrence = {
    type: 'none',
    endType: 'never',
    endDate: '',
    occurrences: '',
    weekDays: [],
  };

  try {
    const rruleProp = vevent.getFirstProperty('rrule');
    if (!rruleProp) {
      return recurrence;
    }

    const rruleValue = rruleProp.getFirstValue();
    if (!rruleValue) {
      return recurrence;
    }

    // Parse FREQ parameter
    const freq = rruleValue.freq;
    if (freq) {
      recurrence.type = freq.toLowerCase();
    }

    // Parse BYDAY parameter (for weekly events)
    if (rruleValue.byday) {
      const dayMap = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 };
      rruleValue.byday.forEach((day) => {
        if (dayMap[day] !== undefined) {
          recurrence.weekDays.push(dayMap[day]);
        }
      });
    }

    // Parse until/count
    if (rruleValue.until) {
      recurrence.endType = 'on';
      const untilDate = rruleValue.until;
      if (untilDate && untilDate.toJSDate) {
        const date = untilDate.toJSDate();
        recurrence.endDate = date.toISOString().split('T')[0];
      }
    } else if (rruleValue.count) {
      recurrence.endType = 'after';
      recurrence.occurrences = String(rruleValue.count);
    }
  } catch (error) {
    console.warn('Could not parse RRULE:', error.message);
  }

  return recurrence;
}

/**
 * Generate RRULE string from recurrence object
 * @param {Object} recurrence - The recurrence configuration
 * @param {Date} startDate - The event start date
 * @returns {string|null} RRULE string or null if no recurrence
 */
function generateRRULE(recurrence, startDate) {
  if (!recurrence || recurrence.type === 'none') {
    return null;
  }

  let rrule = `FREQ=${recurrence.type.toUpperCase()}`;

  // Add BYDAY for weekly recurrence
  if (recurrence.type === 'weekly' && recurrence.weekDays && recurrence.weekDays.length > 0) {
    const dayMap = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    const days = recurrence.weekDays
      .sort((a, b) => a - b)
      .map((idx) => dayMap[idx])
      .join(',');
    rrule += `;BYDAY=${days}`;
  }

  // Add ending condition
  if (recurrence.endType === 'on' && recurrence.endDate) {
    // Convert date string YYYY-MM-DD to YYYYMMDD format
    const dateStr = recurrence.endDate.replace(/-/g, '');
    rrule += `;UNTIL=${dateStr}`;
  } else if (recurrence.endType === 'after' && recurrence.occurrences) {
    rrule += `;COUNT=${recurrence.occurrences}`;
  }

  return rrule;
}
