const btn = document.getElementById("toggleBtn");
const statusCard = document.getElementById("statusCard");
const statusText = document.getElementById("statusText");
const startPomodoroBtn = document.getElementById("startPomodoroBtn");
const completedPomodorosEl = document.getElementById("completedPomodoros");
const totalMinutesEl = document.getElementById("totalMinutes");
const workDurationInput = document.getElementById("workDuration");
const breakDurationInput = document.getElementById("breakDuration");

function updateUI(isEnabled, isPomodoroMode = false) {
  if (isEnabled) {
    btn.textContent = isPomodoroMode ? "Mode Pomodoro actif" : "Désactiver le blocage";
    btn.classList.add("active");
    statusCard.classList.add("active");
    statusText.textContent = isPomodoroMode ? "🍅 Pomodoro actif" : "Protection activée";
    
    btn.disabled = isPomodoroMode;
    btn.style.opacity = isPomodoroMode ? "0.6" : "1";
    btn.style.cursor = isPomodoroMode ? "not-allowed" : "pointer";
  } else {
    btn.textContent = "Activer le blocage";
    btn.classList.remove("active");
    statusCard.classList.remove("active");
    statusText.textContent = "Inactif";
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
  }
}

function startTimer() {
  // Récupérer les durées configurées
  const workMinutes = parseInt(workDurationInput.value) || 25;
  const breakMinutes = parseInt(breakDurationInput.value) || 5;
  const WORK_TIME = workMinutes * 60;
  const BREAK_TIME = breakMinutes * 60;
  
  // Sauvegarder les durées et démarrer le timer
  chrome.storage.local.set({
    pomodoroTimeRemaining: WORK_TIME,
    pomodoroIsWorkSession: true,
    pomodoroIsRunning: true,
    workDuration: WORK_TIME,
    breakDuration: BREAK_TIME,
    isEnabled: true,
    pomodoroMode: true
  }, () => {
    // Ouvrir une petite fenêtre popup pour le timer
    chrome.windows.create({
      url: 'timer-window.html',
      type: 'popup',
      width: 300,
      height: 240,
      focused: true
    });
    
    // Fermer la popup actuelle
    window.close();
  });
}

// Charger les stats
function loadPomodoroStats() {
  chrome.storage.sync.get(['completedPomodoros', 'totalMinutes'], (data) => {
    completedPomodorosEl.textContent = data.completedPomodoros || 0;
    totalMinutesEl.textContent = data.totalMinutes || 0;
  });
  
  // Charger les durées sauvegardées
  chrome.storage.local.get(['workDuration', 'breakDuration'], (data) => {
    if (data.workDuration) {
      workDurationInput.value = Math.floor(data.workDuration / 60);
    }
    if (data.breakDuration) {
      breakDurationInput.value = Math.floor(data.breakDuration / 60);
    }
  });
}

// Initialisation
chrome.storage.local.get(["isEnabled", "pomodoroMode"], (data) => {
  const isPomodoroMode = data.pomodoroMode || false;
  updateUI(data.isEnabled || false, isPomodoroMode);
});

loadPomodoroStats();

// Event listeners
btn.addEventListener("click", () => {
  chrome.storage.local.get(["isEnabled", "pomodoroMode"], (data) => {
    if (data.pomodoroMode) {
      return;
    }
    
    const newState = !data.isEnabled;
    chrome.storage.local.set({ isEnabled: newState, pomodoroMode: false });
    updateUI(newState, false);
  });
});

startPomodoroBtn.addEventListener("click", startTimer);
