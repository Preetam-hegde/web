# 📔 Dear Diary

A beautiful, modern diary app that saves your daily entries to Google Sheets using the Sheetson API. Similar to the finance-tracker setup, but designed for journaling your thoughts, feelings, and daily experiences.

## Features

✨ **Core Features:**
- 📝 Write daily diary entries with titles and messages
- 😊 Rate your day (1-5 scale with mood emojis)
- 📅 Automatic date selection
- 🏷️ Add tags to entries (e.g., work, family, health)
- 📊 View past entries in a beautiful card layout
- 🔍 Search and filter entries
- 📅 Calendar view to see entry history
- 💾 Persistent storage via Google Sheets + Sheetson API

## Setup Instructions

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named **"Diary"**
3. Rename the first sheet to **"entries"**
4. Add these column headers in row 1:
   ```
   date | mood | title | message | tags
   ```

### 2. Get Sheetson API Credentials

1. Go to [Sheetson.com](https://sheetson.com)
2. Sign up for a free account
3. Connect your Google Sheets
4. Copy your:
   - **Auth Token** (API key)
   - **Spreadsheet ID** (found in your Google Sheet URL)

### 3. Configure the App with Global .env

1. Copy the `.env.example` file at the **workspace root** to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:
   ```env
   DIARY_AUTH_TOKEN=your_sheetson_api_key_here
   DIARY_SPREADSHEET_ID=your_google_sheet_id_here
   ```

Replace:
- `your_sheetson_api_key_here` with your Sheetson API key
- `your_google_sheet_id_here` with your Google Sheet ID (from the URL)

Example URL: `https://docs.google.com/spreadsheets/d/1e3v_PqKt2mN4z-aB3cD5eF6gH7iJ/edit`
ID is: `1e3v_PqKt2mN4z-aB3cD5eF6gH7iJ`

**⚠️ Security:** 
- Keep `.env` file **private** — don't commit it to git
- `.env` is in `.gitignore` at workspace root
- Never share your API tokens publicly

## Usage

### Creating an Entry
1. Click the **📝 New Entry** tab
2. Select today's date (auto-populated)
3. Choose your mood using the emoji buttons (1-5)
4. Add a title (optional)
5. Write your entry message (500 characters)
6. Add tags for categorization (optional)
7. Click **Save Entry**

### Viewing Entries
1. Click the **📚 Entries** tab
2. Browse all your past entries
3. Use the search box to find specific entries
4. Entries are sorted by date (newest first)

### Calendar View
1. Click the **📅 Calendar** tab
2. Navigate months with Previous/Next buttons
3. Today's date is highlighted
4. Shows which dates have entries

## API Integration (Sheetson)

Like the **finance-tracker** app, this uses the **Sheetson API** to:
- POST new diary entries to Google Sheets
- GET existing entries for viewing/searching
- Automatic row indexing and timestamps

**API Endpoint:** `https://api.sheetson.com/v2/sheets/entries`

**Request Format:**
```json
{
  "date": "2024-03-27",
  "mood": "5",
  "title": "Amazing Day",
  "message": "Today was incredible...",
  "tags": "work,family,happiness"
}
```

## File Structure

```
apps/diary/
├── index.html      # Main HTML with form and tabs
├── script.js       # Form handling, API calls, search & calendar
├── style.css       # Modern gradient styling with animations
└── README.md       # This file
```

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Troubleshooting

**Entries not saving?**
- Check that `DIARY_CONFIG` is set correctly
- Verify Sheetson API token is valid
- Check browser console for error messages

**Old entries not showing?**
- Make sure the "entries" sheet exists in your Google Sheet
- Verify API token has read permissions

**Can't configure the app?**
- See Setup Instructions above
- Contact Sheetson support if API issues persist

## Future Enhancements

- 🌙 Dark mode toggle
- 📱 Mobile app version
- 🔐 Password protection
- 📤 Export entries as PDF
- 🎨 Custom mood categories
- 💭 AI-powered mood analysis
- 🔔 Daily entry reminders

## Credits

Built with ❤️ for your daily reflections.
API powered by [Sheetson](https://sheetson.com)
