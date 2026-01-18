// Cinefill - Background Service Worker

// Badge colors
const BADGE_ON_COLOR = '#34C759';  // Green
const BADGE_OFF_COLOR = '#8E8E93'; // Gray

// Update badge based on state
function updateBadge(enabled) {
  chrome.action.setBadgeText({ text: enabled ? 'ON' : 'OFF' });
  chrome.action.setBadgeBackgroundColor({
    color: enabled ? BADGE_ON_COLOR : BADGE_OFF_COLOR
  });
}

// Initialize badge on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['enabled'], (result) => {
    updateBadge(result.enabled || false);
  });
});

// Initialize badge on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['enabled'], (result) => {
    updateBadge(result.enabled || false);
  });
});

// Listen for storage changes to update badge
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.enabled) {
    updateBadge(changes.enabled.newValue);
  }
});

// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-cinefill') {
    toggleExtension();
  }
});

// Toggle the extension state
async function toggleExtension() {
  const result = await chrome.storage.local.get(['enabled']);
  const newState = !result.enabled;

  await chrome.storage.local.set({ enabled: newState });

  // Send message to content script in active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'toggle',
      enabled: newState
    }).catch(() => {
      // Content script not loaded on this page
    });
  }
}
