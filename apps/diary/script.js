function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFormData() {
  const formData = {
    'date': document.getElementById("entryDate").value,
    'mood': document.getElementById("moodRating").value,
    'title': document.getElementById("entryTitle").value || 'Untitled',
    'message': document.getElementById("entryMessage").value,
    'tags': document.getElementById("entryTags").value || 'general'
  };
  return formData;
}

async function makeAPICall(formData) {
  const config = window.DIARY_CONFIG || {};
  const authToken = config.authToken;
  const spreadsheetId = config.spreadsheetId;

  if (!authToken || !spreadsheetId) {
    throw new Error('Missing diary configuration. Set window.DIARY_CONFIG.authToken and spreadsheetId.');
  }

  const url = `https://api.sheetson.com/v2/sheets/entries`;

  const myHeaders = new Headers({
    "Authorization": `Bearer ${authToken}`,
    "X-Spreadsheet-Id": spreadsheetId,
    "Content-Type": "application/json"
  });

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 30000);
  const signal = abortController.signal;

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(formData),
    signal: signal
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`API request error: ${error.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

function resetForm() {
  const form = document.getElementById('diary-form');
  form.reset();
  document.getElementById('entryDate').value = getTodayDate();
  document.getElementById('moodRating').value = '3';
  document.getElementById('moodLabel').textContent = 'Okay';
  document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('[data-mood="3"]').classList.add('active');
  updateCharCount();
}

function showBlock(primary, secondary) {
  const successBlock = document.getElementById('successBlock');
  const msg1 = document.getElementById('successmsg1');
  const msg2 = document.getElementById('successmsg2');

  if (successBlock.classList.contains('hide')) {
    msg1.textContent = primary;
    msg2.textContent = secondary;

    successBlock.classList.remove('hide');

    setTimeout(function () {
      successBlock.classList.add('hide');
    }, 3000);
  }
}

function showLoadingSpinner() {
  const loader = document.getElementById('loader');
  const btn = document.getElementById('submitBtn');
  loader.classList.remove('hide');
  btn.disabled = true;
}

function hideLoadingSpinner() {
  const loader = document.getElementById('loader');
  const btn = document.getElementById('submitBtn');
  loader.classList.add('hide');
  btn.disabled = false;
}

function updateCharCount() {
  const message = document.getElementById('entryMessage');
  document.getElementById('charCount').textContent = message.value.length;
}

function initMoodSelector() {
  const moodBtns = document.querySelectorAll('.mood-btn');
  const moodLabels = {
    '1': 'Terrible 😞',
    '2': 'Bad 😕',
    '3': 'Okay 😐',
    '4': 'Good 🙂',
    '5': 'Excellent 😄'
  };

  moodBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      moodBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const mood = this.getAttribute('data-mood');
      document.getElementById('moodRating').value = mood;
      document.getElementById('moodLabel').textContent = moodLabels[mood];
    });
  });

  // Set initial active button
  document.querySelector('[data-mood="3"]').classList.add('active');
}

function initializeApp() {
  // Set today's date
  document.getElementById('entryDate').value = getTodayDate();

  // Initialize mood selector
  initMoodSelector();

  // Character counter
  document.getElementById('entryMessage').addEventListener('input', updateCharCount);

  // Form submission
  const form = document.getElementById('diary-form');
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const formData = getFormData();
      showLoadingSpinner();
      const result = await makeAPICall(formData);
      window.diaryResult = JSON.parse(result).rowIndex;
      showBlock(`${formData.title}`, `Mood: ${formData.mood}/5 on ${formData.date}`);
      resetForm();
      loadEntries(); // Refresh entries list
    } catch (error) {
      console.error('API request error:', error.message);
      showBlock("Error", error.message);
    } finally {
      hideLoadingSpinner();
    }
  });

  // Reset button
  document.getElementById('resetBtn').addEventListener('click', resetForm);
}

// Load and display past entries
async function loadEntries() {
  const config = window.DIARY_CONFIG || {};
  const authToken = config.authToken;
  const spreadsheetId = config.spreadsheetId;

  if (!authToken || !spreadsheetId) {
    console.log('Diary config not set. Browse entries feature disabled.');
    return;
  }

  try {
    const url = `https://api.sheetson.com/v2/sheets/entries`;
    const myHeaders = new Headers({
      "Authorization": `Bearer ${authToken}`,
      "X-Spreadsheet-Id": spreadsheetId,
      "Content-Type": "application/json"
    });

    const response = await fetch(url, { headers: myHeaders });
    if (!response.ok) throw new Error('Failed to load entries');

    const data = await response.json();
    const entries = data.results || [];

    displayEntries(entries);
  } catch (error) {
    console.error('Error loading entries:', error);
    document.getElementById('entriesList').innerHTML = '<p class="text-danger">Failed to load entries.</p>';
  }
}

function displayEntries(entries) {
  const entriesList = document.getElementById('entriesList');
  
  if (entries.length === 0) {
    entriesList.innerHTML = '<p class="text-muted text-center">No entries yet. Create your first entry! 📝</p>';
    return;
  }

  const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  let html = '<div class="entries-container">';
  sortedEntries.forEach((entry, index) => {
    const mood = entry.mood || 3;
    const moodEmojis = { '1': '😞', '2': '😕', '3': '😐', '4': '🙂', '5': '😄' };
    const moodEmoji = moodEmojis[mood] || '😐';
    const date = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

    html += `
      <div class="entry-card">
        <div class="entry-header">
          <h3 class="entry-title">${entry.title || 'Untitled'}</h3>
          <span class="entry-mood">${moodEmoji} ${mood}/5</span>
        </div>
        <div class="entry-date">${date}</div>
        <div class="entry-message">${entry.message.substring(0, 200)}${entry.message.length > 200 ? '...' : ''}</div>
        ${entry.tags ? `<div class="entry-tags"><small>${entry.tags.split(',').map(t => `<span class="badge bg-info">${t.trim()}</span>`).join(' ')}</small></div>` : ''}
      </div>
    `;
  });
  html += '</div>';

  entriesList.innerHTML = html;
}

function initSearchBox() {
  const searchBox = document.getElementById('searchBox');
  if (!searchBox) return;

  searchBox.addEventListener('keyup', function() {
    const searchTerm = this.value.toLowerCase();
    const entries = document.querySelectorAll('.entry-card');
    
    entries.forEach(entry => {
      const title = entry.querySelector('.entry-title').textContent.toLowerCase();
      const message = entry.querySelector('.entry-message').textContent.toLowerCase();
      
      if (title.includes(searchTerm) || message.includes(searchTerm)) {
        entry.style.display = '';
      } else {
        entry.style.display = 'none';
      }
    });
  });
}

// Initialize calendar
function initializeCalendar() {
  let currentDate = new Date();

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthYear = document.getElementById('monthYear');
    monthYear.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
      const header = document.createElement('div');
      header.className = 'calendar-day-header';
      header.textContent = day;
      calendar.appendChild(header);
    });

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day empty';
      calendar.appendChild(empty);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.textContent = day;

      const today = new Date();
      if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        dayEl.classList.add('today');
      }

      calendar.appendChild(dayEl);
    }
  }

  document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  renderCalendar(currentDate);
}

// Listen for tab changes
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();

  // Load entries when switching to view tab
  const viewTab = document.getElementById('view-tab');
  if (viewTab) {
    viewTab.addEventListener('shown.bs.tab', () => {
      loadEntries();
      setTimeout(initSearchBox, 100);
    });
  }

  // Initialize calendar when switching to calendar tab
  const calendarTab = document.getElementById('calendar-tab');
  if (calendarTab) {
    calendarTab.addEventListener('shown.bs.tab', () => {
      initializeCalendar();
    });
  }
});
