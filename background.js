// Cinefill - Background Service Worker

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
