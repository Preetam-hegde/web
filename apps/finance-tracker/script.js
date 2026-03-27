function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFormData() {
  const formData = {
    'expense_name': document.getElementById("expense_name").value,
    'expense_rs': document.getElementById("expense_rs").value,
    'category': document.getElementById("cat").value,
    'date': document.getElementById("datePicker").value
  };
  return formData;
}

async function makeAPICall(formData) {
  const config = window.FINANCE_TRACKER_CONFIG || {};
  const authToken = config.authToken;
  const spreadsheetId = config.spreadsheetId;

  if (!authToken || !spreadsheetId) {
    throw new Error('Missing finance tracker API configuration. Set window.FINANCE_TRACKER_CONFIG.authToken and spreadsheetId.');
  }

  const monthIndex = parseInt(formData['date'].slice(5, 7), 10) - 1;
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex >= months.length) {
    throw new Error('Invalid date selected.');
  }
  const urlMonth = months[monthIndex];
  const url = `https://api.sheetson.com/v2/sheets/${urlMonth}`;

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
  form.reset();
  document.getElementById('datePicker').value = getTodayDate();
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

const form = document.getElementById('waste-form');

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const formData = getFormData();
    showLoadingSpinner();
    const result = await makeAPICall(formData);
    window.rowResult = JSON.parse(result).rowIndex;
    showBlock(`${formData.expense_name} : ${formData.expense_rs}`, `${formData.category} , ${formData.date}`);
  } catch (error) {
    console.error('API request error:', error.message);
    showBlock("Error", error.message);
  } finally {
    hideLoadingSpinner();
    resetForm();
  }
});

document.getElementById('datePicker').value = getTodayDate();

function showLoadingSpinner() {
  const spinner = document.getElementById('loader');
  const btn=document.getElementById('btn');
  btn.classList.add('hide');
  spinner.classList.remove('hide') ;

}

function hideLoadingSpinner() {
  const spinner = document.getElementById('loader');
  const btn=document.getElementById('btn');
  btn.classList.remove('hide');
  spinner.classList.add('hide') ;
}