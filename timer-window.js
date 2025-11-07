// Récupération des éléments
const timerModeEl = document.getElementById('timerMode');
const timerDisplayEl = document.getElementById('timerDisplay');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const statsEl = document.getElementById('stats');

let timerInterval = null;
let timeRemaining = 0;
let isWorkSession = true;
let isRunning = true;
let WORK_TIME = 25 * 60;
let BREAK_TIME = 5 * 60;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
  timerDisplayEl.textContent = formatTime(timeRemaining);
  
  if (isWorkSession) {
    timerModeEl.textContent = '🍅 Session de travail';
    document.body.classList.remove('break');
    document.body.classList.add('work');
  } else {
    timerModeEl.textContent = '☕ Pause';
    document.body.classList.remove('work');
    document.body.classList.add('break');
  }
  
  pauseBtn.textContent = isRunning ? 'Pause' : 'Reprendre';
}

function updateStats() {
  chrome.storage.sync.get(['completedPomodoros', 'totalMinutes'], (data) => {
    const sessions = data.completedPomodoros || 0;
    const minutes = data.totalMinutes || 0;
    statsEl.textContent = `${sessions} sessions · ${minutes} min`;
  });
}

function saveState() {
  chrome.storage.local.set({
    pomodoroTimeRemaining: timeRemaining,
    pomodoroIsWorkSession: isWorkSession,
    pomodoroIsRunning: isRunning,
    workDuration: WORK_TIME,
    breakDuration: BREAK_TIME
  });
}

function startTimer() {
  if (!isRunning) return;
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateDisplay();
    saveState();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      
      // Notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon-128.png',
        title: isWorkSession ? '🎉 Session terminée !' : '✨ Pause terminée !',
        message: isWorkSession ? `Bravo ! Prends une pause de ${Math.floor(BREAK_TIME / 60)} minutes.` : `C'est reparti pour ${Math.floor(WORK_TIME / 60)} minutes de focus !`,
        priority: 2
      });

      if (isWorkSession) {
        // Session de travail terminée → Passer en pause
        chrome.storage.sync.get(['completedPomodoros', 'totalMinutes'], (data) => {
          const completed = (data.completedPomodoros || 0) + 1;
          const workMinutes = Math.floor(WORK_TIME / 60);
          const total = (data.totalMinutes || 0) + workMinutes;
          chrome.storage.sync.set({ 
            completedPomodoros: completed,
            totalMinutes: total
          });
          updateStats();
        });
        
        isWorkSession = false;
        timeRemaining = BREAK_TIME;
        
        // DÉSACTIVER le blocage pendant la pause !
        chrome.storage.local.set({ isEnabled: false, pomodoroMode: true });
      } else {
        // Pause terminée → Retour au travail
        isWorkSession = true;
        timeRemaining = WORK_TIME;
        
        // RÉACTIVER le blocage pour le travail
        chrome.storage.local.set({ isEnabled: true, pomodoroMode: true });
      }

      updateDisplay();
      saveState();
      startTimer();
    }
  }, 1000);
}

function togglePause() {
  isRunning = !isRunning;
  
  if (isRunning) {
    startTimer();
  } else {
    clearInterval(timerInterval);
  }
  
  updateDisplay();
  saveState();
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isWorkSession = true;
  timeRemaining = WORK_TIME;
  
  // Désactiver le mode Pomodoro
  chrome.storage.local.set({ pomodoroMode: false, isEnabled: false });
  
  updateDisplay();
  saveState();
  
  // Fermer la fenêtre
  window.close();
}

// Event listeners
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetTimer);

// Charger l'état au démarrage
chrome.storage.local.get([
  'pomodoroTimeRemaining',
  'pomodoroIsWorkSession',
  'pomodoroIsRunning',
  'workDuration',
  'breakDuration'
], (data) => {
  if (data.workDuration) WORK_TIME = data.workDuration;
  if (data.breakDuration) BREAK_TIME = data.breakDuration;
  
  timeRemaining = data.pomodoroTimeRemaining || WORK_TIME;
  isWorkSession = data.pomodoroIsWorkSession !== false;
  isRunning = data.pomodoroIsRunning !== false;
  
  updateDisplay();
  updateStats();
  
  if (isRunning) {
    startTimer();
  }
});

// Écouter les changements de storage pour mettre à jour les stats
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.completedPomodoros || changes.totalMinutes)) {
    updateStats();
  }
});
