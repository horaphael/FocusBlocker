const DEFAULT_BLOCKED_SITES = [];
const workHours = { start: 9, end: 17 };

function isWorkTime() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= workHours.start && hour < workHours.end;
}

function getSettings(callback) {
  chrome.storage.local.get(["isEnabled"], (localData) => {
    chrome.storage.sync.get({ blockedSites: DEFAULT_BLOCKED_SITES }, (syncData) => {
      const storedSites = Array.isArray(syncData.blockedSites) ? syncData.blockedSites : DEFAULT_BLOCKED_SITES;
      const uniqueSites = [...new Set(storedSites.map((site) => (site || "").trim()).filter(Boolean))];

      callback({
        isEnabled: localData.isEnabled ?? false,
        blockedSites: uniqueSites
      });
    });
  });
}

function updateBlockingRules() {
  getSettings(({ isEnabled, blockedSites }) => {
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const existingIds = existingRules.map((rule) => rule.id);
      const rules = [];

      if (isEnabled) {
        blockedSites.forEach((site, index) => {
          rules.push({
            id: index + 1,
            priority: 1,
            action: {
              type: "redirect",
              redirect: { extensionPath: "/blocked.html" }
            },
            condition: {
              urlFilter: site,
              resourceTypes: ["main_frame"]
            }
          });
        });
      }

      chrome.declarativeNetRequest.updateDynamicRules(
        {
          removeRuleIds: existingIds,
          addRules: rules
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("Erreur DNR:", chrome.runtime.lastError);
          } else {
            console.log("Règles mises à jour:", rules.length, "règles actives");
          }
        }
      );
    });
  });
}

chrome.runtime.onStartup.addListener(updateBlockingRules);
chrome.runtime.onInstalled.addListener(updateBlockingRules);
chrome.storage.onChanged.addListener(updateBlockingRules);
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message === "refreshRules") {
    updateBlockingRules();
    sendResponse({ ok: true });
  }
});

setInterval(updateBlockingRules, 60 * 60 * 1000);
