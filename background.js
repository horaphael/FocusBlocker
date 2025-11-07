const blockedSites = ["youtube.com", "tiktok.com", "facebook.com"];
const workHours = { start: 9, end: 17 };

function isWorkTime() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= workHours.start && hour < workHours.end;
}

function updateBlockingRules() {
  chrome.storage.local.get(["isEnabled"], (data) => {
    const isEnabled = data.isEnabled ?? false;
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
        removeRuleIds: blockedSites.map((_, i) => i + 1),
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
}

chrome.runtime.onStartup.addListener(updateBlockingRules);
chrome.runtime.onInstalled.addListener(updateBlockingRules);
chrome.storage.onChanged.addListener(updateBlockingRules);

setInterval(updateBlockingRules, 60 * 60 * 1000);
