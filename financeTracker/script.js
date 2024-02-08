
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}



document.getElementById('datePicker').value = getTodayDate();

const form = document.getElementById('waste-form');

async function sendData() {


    const formData ={};
    formData['expense_name']=document.getElementById("expense_name").value;
    formData['expense_rs']=document.getElementById("expense_rs").value;
    formData['category']=document.getElementById("cat").value;
    formData['date']=document.getElementById("datePicker").value;

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer h1fSj_TDMQ-lVN_WUn3RKPSubpz0ENNQoWWyBthYqryh2Qhj5xR7N28kZdA");
    myHeaders.append("X-Spreadsheet-Id", "1LArqac_OgzHg7E-FHep8GjsxLy0PWlPKbRS3dM5N2T8");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "_cfuvid=9FeoLb_oWmPRe_eH9MedE0zO9EGKHhRjdHDNED_rMrU-1704957294765-0-604800000");

    var raw = JSON.stringify(formData);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    const month=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
    const urlMonth=month[parseInt(formData['date'][5]+formData['date'][6])-1 ];
    const url="https://api.sheetson.com/v2/sheets/"+urlMonth;
    

    fetch(url, requestOptions)
        .then(response => response.text())
        .then(result =>{ console.log(result);
                          window.rowResult=JSON.parse(result).rowIndex;
                          showBlock(formData.expense_name +" : " +formData.expense_rs,formData.category +" , "+formData.date);
                        })
        .catch(error => {console.log('error', error)
                         showBlock("Error",error);
                        });
    
    
}


form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendData();
  form.reset();
  document.getElementById('datePicker').value = getTodayDate();

});


function showBlock(primary,secondary) {
  var successBlock = document.getElementById('successBlock');
  var msg1=document.getElementById('successmsg1');
  var msg2=document.getElementById('successmsg2');

  if (successBlock.classList.contains('hide')) {
    
    msg1.textContent = primary;
    msg2.textContent = secondary;

    successBlock.classList.remove('hide');

    setTimeout(function () {
        successBlock.classList.add('hide');
    }, 3000);
}
}
