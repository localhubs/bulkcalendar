import React, { useState } from 'react';
import ConflictWarning from '../components/ConflictWarning';
import { findEventConflicts } from '../utils/conflictUtils';

/**
 * Test Suite for Conflict Detection Feature
 * 
 * This component demonstrates and tests the conflict detection functionality
 * to ensure it works correctly in various scenarios.
 */
export default function ConflictDetectionTest() {
  // Sample events for testing
  const [testEvents] = useState([
    {
      id: 'event-1',
      uid: 'event-1@calendar',
      summary: 'Team Standup',
      startDate: new Date('2026-04-02T10:00:00'),
      endDate: new Date('2026-04-02T10:30:00'),
      isAllDay: false,
    },
    {
      id: 'event-2',
      uid: 'event-2@calendar',
      summary: 'Project Discussion',
      startDate: new Date('2026-04-02T10:15:00'),
      endDate: new Date('2026-04-02T11:00:00'),
      isAllDay: false,
    },
    {
      id: 'event-3',
      uid: 'event-3@calendar',
      summary: 'All Day Workshop',
      startDate: new Date('2026-04-02T00:00:00'),
      endDate: new Date('2026-04-02T00:00:00'),
      isAllDay: true,
    },
    {
      id: 'event-4',
      uid: 'event-4@calendar',
      summary: 'Lunch Break',
      startDate: new Date('2026-04-02T12:00:00'),
      endDate: new Date('2026-04-02T13:00:00'),
      isAllDay: false,
    },
  ]);

  // Test Case 1: Overlapping events
  const testOverlappingEvent = {
    id: 'test-overlap',
    uid: 'test-overlap@calendar',
    summary: 'New Meeting',
    startDate: new Date('2026-04-02T10:20:00'),
    endDate: new Date('2026-04-02T10:50:00'),
    isAllDay: false,
  };

  // Test Case 2: Non-overlapping event
  const testNonOverlappingEvent = {
    id: 'test-nonoverlap',
    uid: 'test-nonoverlap@calendar',
    summary: 'Coffee Break',
    startDate: new Date('2026-04-02T11:00:00'),
    endDate: new Date('2026-04-02T11:30:00'),
    isAllDay: false,
  };

  // Test Case 3: All-day event (should not conflict)
  const testAllDayEvent = {
    id: 'test-allday',
    uid: 'test-allday@calendar',
    summary: 'Conference',
    startDate: new Date('2026-04-02T10:00:00'),
    endDate: new Date('2026-04-02T18:00:00'),
    isAllDay: true,
  };

  // Run tests
  const overlapConflicts = findEventConflicts(testOverlappingEvent, testEvents);
  const noOverlapConflicts = findEventConflicts(testNonOverlappingEvent, testEvents);
  const allDayConflicts = findEventConflicts(testAllDayEvent, testEvents);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Conflict Detection Test Suite</h1>
      
      <section style={{ marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
        <h2>Test Case 1: Overlapping Event (Should Show Conflicts)</h2>
        <p><strong>New Event:</strong> {testOverlappingEvent.summary}</p>
        <p><strong>Time:</strong> 10:20 AM - 10:50 AM</p>
        <p><strong>Expected Result:</strong> 2 conflicts (Standup @ 10:00-10:30, Discussion @ 10:15-11:00)</p>
        <p><strong>Actual Conflicts Found:</strong> {overlapConflicts.length}</p>
        {overlapConflicts.length > 0 && (
          <div>
            <ConflictWarning event={testOverlappingEvent} allEvents={testEvents} />
          </div>
        )}
        {overlapConflicts.length === 0 && (
          <p style={{ color: 'red' }}>❌ FAILED - Expected conflicts but found none</p>
        )}
        {overlapConflicts.length === 2 && (
          <p style={{ color: 'green' }}>✅ PASSED - Found expected 2 conflicts</p>
        )}
      </section>

      <section style={{ marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
        <h2>Test Case 2: Non-Overlapping Event (Should Show No Conflicts)</h2>
        <p><strong>New Event:</strong> {testNonOverlappingEvent.summary}</p>
        <p><strong>Time:</strong> 11:00 AM - 11:30 AM</p>
        <p><strong>Expected Result:</strong> 0 conflicts</p>
        <p><strong>Actual Conflicts Found:</strong> {noOverlapConflicts.length}</p>
        {noOverlapConflicts.length === 0 && (
          <p style={{ color: 'green' }}>✅ PASSED - No conflicts as expected</p>
        )}
        {noOverlapConflicts.length > 0 && (
          <p style={{ color: 'red' }}>❌ FAILED - Expected no conflicts but found {noOverlapConflicts.length}</p>
        )}
      </section>

      <section style={{ marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
        <h2>Test Case 3: All-Day Event (Should Show No Conflicts)</h2>
        <p><strong>New Event:</strong> {testAllDayEvent.summary}</p>
        <p><strong>Type:</strong> All-Day Event</p>
        <p><strong>Expected Result:</strong> 0 conflicts (all-day events excluded)</p>
        <p><strong>Actual Conflicts Found:</strong> {allDayConflicts.length}</p>
        {allDayConflicts.length === 0 && (
          <p style={{ color: 'green' }}>✅ PASSED - All-day events correctly excluded</p>
        )}
        {allDayConflicts.length > 0 && (
          <p style={{ color: 'red' }}>❌ FAILED - All-day events should not conflict</p>
        )}
      </section>

      <section style={{ marginBottom: '30px', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '5px' }}>
        <h2>Test Summary</h2>
        <p>
          <strong>Total Tests:</strong> 3
        </p>
        <p>
          <strong>Passed:</strong> {
            (overlapConflicts.length === 2 ? 1 : 0) +
            (noOverlapConflicts.length === 0 ? 1 : 0) +
            (allDayConflicts.length === 0 ? 1 : 0)
          }/3
        </p>
        <p>
          <strong>Status:</strong> {
            (overlapConflicts.length === 2 && noOverlapConflicts.length === 0 && allDayConflicts.length === 0)
              ? '✅ ALL TESTS PASSED'
              : '❌ SOME TESTS FAILED'
          }
        </p>
      </section>
    </div>
  );
}
