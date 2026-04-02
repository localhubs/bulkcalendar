# 📅 Bulk Calendar

A modern React-based calendar application for managing multiple events with seamless Outlook ICS file import/export support.

## Features

- **📥 Import ICS Files**: Bulk import events from Outlook or other calendar applications in ICS format
- **📤 Export to ICS**: Export all your events to Outlook-compatible ICS format for easy sharing and backup
- **➕ Add/Edit Events**: Create and modify individual events with full details
- **🗑️ Delete Events**: Remove unwanted events from your calendar
- **📅 All-Day Events**: Create events that span entire days without specific times
- **🔄 Recurring Events**: Set up events that repeat daily, weekly, monthly, or yearly
- **✏️ Rich Text Descriptions**: Use a WYSIWYG editor with formatting (bold, italic, links, lists, code blocks) for event descriptions
- **🔍 Search & Filter**: Find events by text, type, or date range - works across all event properties
- **💾 Auto-Save**: Events are automatically saved to browser localStorage
- **📊 Event Management**: View all events in an organized table with sorting and filtering
- **🎨 Modern UI**: Clean, responsive interface that works on desktop and mobile devices
- **🌙 Dark Mode**: Toggle between light and dark themes for comfortable viewing

## Getting Started

### Prerequisites
- Node.js 14+ and npm installed

### Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd calendar
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173/`

## Usage

### Adding Events

1. Click the **➕ Add New Event** button
2. Fill in the event details:
   - **Event Title** (required)
   - **Description** (optional - supports rich text formatting with bold, italic, links, lists, and code blocks via WYSIWYG editor)
   - **Start Date & Time** (required, or just date if all-day)
   - **End Date & Time** (required - must be after start time, or just date if all-day)
   - **Location** (optional)
   - **Attendees** (optional - comma-separated email addresses)
   - **All day event** (optional - check to create an all-day event without specific times)
3. Click **Add Event** to save

### Creating All-Day Events

1. Click the **➕ Add New Event** button
2. Check the **All day event** checkbox
3. The date/time inputs will change to date-only pickers
4. Select the event date
5. Fill in other event details as needed
6. Click **Add Event** to save
7. All-day events will display with "All day" label in the event list instead of times

### Creating Recurring Events

1. Click the **➕ Add New Event** button
2. Fill in the event details (title, date/time, location, etc.)
3. Under the **Recurrence** section, select the recurrence type:
   - **No Recurrence** - One-time event (default)
   - **Daily** - Repeats every day
   - **Weekly** - Repeats on selected days of the week
   - **Monthly** - Repeats on the same date each month
   - **Yearly** - Repeats annually on the same date
4. If **Weekly** is selected, choose which days of the week the event repeats
5. Set when the recurrence ends:
   - **Never** - Repeats indefinitely (default)
   - **On a specific date** - Repeats until the chosen date
   - **After a number of occurrences** - Repeats for a specified number of times
6. Click **Add Event** to save
7. Recurring events will display with a colored badge (e.g., "DAILY", "WEEKLY") in the event list

**Examples:**
- Daily standup meeting: Select "Daily", choose weekdays only, set end date
- Weekly team meeting: Select "Weekly", choose Monday-Friday, set end date
- Monthly review: Select "Monthly", set to repeat 12 times
- Annual celebration: Select "Yearly", set to never end or specific end date

### Searching & Filtering Events

1. The **search bar** appears below the event form
2. **Text search** - Type to search across:
   - Event titles
   - Descriptions
   - Locations
   - Attendee emails
3. **Filter by type** - Choose from:
   - **All Events** - Show everything
   - **Upcoming** - Events today and later
   - **Past** - Events that already happened
   - **Recurring Only** - Events with recurrence rules
   - **All-Day Only** - All-day events only
4. **Date range** - Filter by:
   - **From** - Start date (inclusive)
   - **To** - End date (inclusive)
5. **Clear filters** - Click the ✕ button to reset all filters
6. Combine filters - Search "meeting" + filter "Upcoming" + set date range for precise results

### Importing from Outlook/ICS

1. Click the **📥 Import ICS File** button
2. Select an `.ics` or `.vcs` file from your computer
3. Events from the file will be added to your calendar automatically
4. A success message will confirm the number of imported events

### Exporting to ICS

1. Click the **📤 Export to ICS** button
2. A `.ics` file will be downloaded with all your calendar events
3. Use this file to:
   - Back up your events
   - Share events with others
   - Import into Outlook, Google Calendar, or other applications

### Editing Events

1. Click the **Edit** button on any event in the list
2. Modify the event details in the form
3. Click **Update Event** to save changes
4. Click **Cancel** to discard changes

### Deleting Events

1. Click the **Delete** button on any event in the list
2. Confirm the deletion when prompted
3. The event will be removed immediately

## ICS File Format

The application supports standard iCalendar (ICS) files compatible with:
- Microsoft Outlook
- Google Calendar
- Apple Calendar
- Yahoo Calendar
- Most other calendar applications

### Supported Event Properties

- Summary/Title
- Description
- Start Date/Time
- End Date/Time
- Location
- Attendees
- UID (unique identifier)
- All-Day Events (VALUE=DATE format)
- Recurrence Rules (RRULE - Daily, Weekly, Monthly, Yearly)

## Data Storage

Events are stored in your browser's localStorage, which means:
- ✅ Data persists between browser sessions
- ✅ No server required
- ⚠️ Data is device-specific (not synced across devices)
- 💾 **Always export important events for backup**

## Building for Production

To build the application for production:

```bash
npm run build
```

The output will be in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TipTap** - WYSIWYG rich text editor with extensible editor framework
- **ical.js** - ICS file parsing and generation
- **CSS3** - Styling

## Troubleshooting

### Events not saving
- Ensure your browser allows localStorage access
- Check if you've disabled local storage in browser settings
- Try exporting events regularly to create backups

### Import fails with error
- Verify the ICS file is not corrupted
- Try opening the file in a text editor to check the format
- Ensure the file has a `.ics` or `.vcs` extension

### Events not appearing after import
- Check the import status message for details
- Verify the ICS file contains valid event data
- Check browser console for error messages (F12)

## Tips & Best Practices

1. **Regular Backups**: Export your events weekly
2. **Before Deleting**: Verify event details before deletion
3. **Organizing Events**: Use descriptive titles and locations
4. **Attendees**: Include full email addresses for better compatibility
5. **Time Zones**: Be specific about time zones in event descriptions

## License

This project is provided as-is for personal and commercial use.

## Support

For issues or feature requests, please check the browser console (F12) for error messages and verify your ICS file format.

---

**Happy scheduling!** 📅✨
