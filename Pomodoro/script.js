const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const saveSettingsButton = document.getElementById('saveSettings');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');

let countdown;
let timeLeftInSeconds;

function setTimer(timeInMinutes) {
  timeLeftInSeconds = timeInMinutes * 60;
  displayTimeLeft();
}

function displayTimeLeft() {
  const minutes = Math.floor(timeLeftInSeconds / 60);
  const seconds = timeLeftInSeconds % 60;
  minutesDisplay.textContent = minutes < 10 ? '0' + minutes : minutes;
  secondsDisplay.textContent = seconds < 10 ? '0' + seconds : seconds;
}

function startTimer() {
  if (!countdown) {
    countdown = setInterval(() => {
      timeLeftInSeconds--;
      if (timeLeftInSeconds < 0) {
        clearInterval(countdown);
        countdown = null;
        alert('Time is up!');
      }
      displayTimeLeft();
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(countdown);
  countdown = null;
}

function resetTimer() {
  clearInterval(countdown);
  countdown = null;
  setTimer(workTimeInput.value);
}

setTimer(workTimeInput.value);

saveSettingsButton.addEventListener('click', () => {
  setTimer(workTimeInput.value);
});

startButton.addEventListener('click', startTimer);

stopButton.addEventListener('click', stopTimer);

resetButton.addEventListener('click', resetTimer);
