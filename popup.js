const btn = document.getElementById("toggleBtn");
const statusCard = document.getElementById("statusCard");
const statusText = document.getElementById("statusText");
const startPomodoroBtn = document.getElementById("startPomodoroBtn");
const completedPomodorosEl = document.getElementById("completedPomodoros");
const totalMinutesEl = document.getElementById("totalMinutes");
const workDurationInput = document.getElementById("workDuration");
const breakDurationInput = document.getElementById("breakDuration");
const siteInput = document.getElementById("siteInput");
const addSiteBtn = document.getElementById("addSiteBtn");
const blockedListEl = document.getElementById("blockedList");

const DEFAULT_BLOCKED_SITES = [];
let blockedSites = [];

function updateUI(isEnabled, isPomodoroMode = false) {
  if (isEnabled) {
    btn.textContent = isPomodoroMode ? "Mode Pomodoro actif" : "Désactiver le blocage";
    btn.classList.add("active");
    statusCard.classList.add("active");
    statusText.textContent = isPomodoroMode ? "Pomodoro actif" : "Protection activée";
    
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
  const workMinutes = parseInt(workDurationInput.value) || 25;
  const breakMinutes = parseInt(breakDurationInput.value) || 5;
  const WORK_TIME = workMinutes * 60;
  const BREAK_TIME = breakMinutes * 60;
  
  chrome.storage.local.set({
    pomodoroTimeRemaining: WORK_TIME,
    pomodoroIsWorkSession: true,
    pomodoroIsRunning: true,
    workDuration: WORK_TIME,
    breakDuration: BREAK_TIME,
    isEnabled: true,
    pomodoroMode: true
  }, () => {
    chrome.windows.create({
      url: 'timer-window.html',
      type: 'popup',
      width: 300,
      height: 240,
      focused: true
    });
    
    window.close();
  });
}

function loadPomodoroStats() {
  chrome.storage.sync.get(['completedPomodoros', 'totalMinutes'], (data) => {
    completedPomodorosEl.textContent = data.completedPomodoros || 0;
    totalMinutesEl.textContent = data.totalMinutes || 0;
  });
  
  chrome.storage.local.get(['workDuration', 'breakDuration'], (data) => {
    if (data.workDuration) {
      workDurationInput.value = Math.floor(data.workDuration / 60);
    }
    if (data.breakDuration) {
      breakDurationInput.value = Math.floor(data.breakDuration / 60);
    }
  });
}

chrome.storage.local.get(["isEnabled", "pomodoroMode"], (data) => {
  const isPomodoroMode = data.pomodoroMode || false;
  updateUI(data.isEnabled || false, isPomodoroMode);
});

loadPomodoroStats();

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

function normalizeSite(site) {
  if (!site) return "";
  return site
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .toLowerCase();
}

function renderBlockedSites() {
  blockedListEl.innerHTML = "";

  if (!blockedSites.length) {
    const empty = document.createElement("div");
    empty.className = "empty-sites";
    empty.textContent = "Aucun site bloqué";
    blockedListEl.appendChild(empty);
    return;
  }

  blockedSites.forEach((site, index) => {
    const item = document.createElement("div");
    item.className = "site-item";

    const label = document.createElement("span");
    label.textContent = site;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Retirer";
    removeBtn.addEventListener("click", () => {
      blockedSites.splice(index, 1);
      saveBlockedSites();
    });

    item.appendChild(label);
    item.appendChild(removeBtn);
    blockedListEl.appendChild(item);
  });
}

function saveBlockedSites() {
  chrome.storage.sync.set({ blockedSites }, () => {
    renderBlockedSites();
    chrome.runtime.sendMessage("refreshRules");
  });
}

function loadBlockedSites() {
  chrome.storage.sync.get({ blockedSites: DEFAULT_BLOCKED_SITES }, (data) => {
    blockedSites = Array.isArray(data.blockedSites) ? data.blockedSites : DEFAULT_BLOCKED_SITES;
    renderBlockedSites();
  });
}

function addSite() {
  const formatted = normalizeSite(siteInput.value);
  if (!formatted) {
    return;
  }

  if (blockedSites.includes(formatted)) {
    siteInput.value = "";
    return;
  }

  blockedSites.push(formatted);
  siteInput.value = "";
  saveBlockedSites();
}

addSiteBtn.addEventListener("click", addSite);
siteInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addSite();
  }
});

loadBlockedSites();
