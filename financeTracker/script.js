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
  const monthIndex = parseInt(formData['date'].slice(5, 7)) - 1;
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const urlMonth = months[monthIndex];
  const url = `https://api.sheetson.com/v2/sheets/${urlMonth}`;

  const myHeaders = new Headers({
    "Authorization": "Bearer h1fSj_TDMQ-lVN_WUn3RKPSubpz0ENNQoWWyBthYqryh2Qhj5xR7N28kZdA",
    "X-Spreadsheet-Id": "1LArqac_OgzHg7E-FHep8GjsxLy0PWlPKbRS3dM5N2T8",
    "Content-Type": "application/json",
    "Cookie": "_cfuvid=9FeoLb_oWmPRe_eH9MedE0zO9EGKHhRjdHDNED_rMrU-1704957294765-0-604800000"
  });

  const abortController = new AbortController();
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
    abortController.abort(); // Cancel the request
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