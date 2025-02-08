// background.js
const ACTIVE_ICON = "icon.png";
const INACTIVE_ICON = "icon-grey.png";

function isValidUrl(url) {
  if (!url) return false;
  const validDomains = ['biorxiv.org', 'medrxiv.org'];
  return validDomains.some(domain => url.includes(domain));
}

async function updateExtensionState(tabId) {
  try {
    const tab = await browser.tabs.get(tabId);
    
    if (isValidUrl(tab.url)) {
      await browser.browserAction.setIcon({ path: ACTIVE_ICON, tabId });
      await browser.browserAction.setTitle({ title: "Share on Bluesky", tabId });
    } else {
      await browser.browserAction.setIcon({ path: INACTIVE_ICON, tabId });
      await browser.browserAction.setTitle({ title: "Not a bioRxiv/medRxiv paper", tabId });
    }
  } catch (error) {
    console.error('Error updating extension state:', error);
  }
}

// Listen for tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    updateExtensionState(tabId);
  }
});

// Listen for tab activation (switching tabs)
browser.tabs.onActivated.addListener((activeInfo) => {
  updateExtensionState(activeInfo.tabId);
});

browser.browserAction.onClicked.addListener(async (tab) => {
  if (isValidUrl(tab.url)) {
    try {
      const response = await browser.tabs.sendMessage(tab.id, { action: "getPaperInfo" });
      
      if (response && response.title && response.lastAuthor) {
        const text = `${response.title}\n\nby ${response.lastAuthor} and team:\n\n${tab.url}`;
        const blueskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
        browser.tabs.create({ url: blueskyUrl });
      }
    } catch (error) {
      console.error('Error getting paper info:', error);
    }
  }
});

// Initial state check for current tab
browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
  if (tabs[0]) {
    updateExtensionState(tabs[0].id);
  }
});