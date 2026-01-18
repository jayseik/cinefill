// Cinefill - Popup Script
document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const statusLabel = document.getElementById('statusLabel');
  const zoomSlider = document.getElementById('zoomSlider');
  const zoomValue = document.getElementById('zoomValue');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Dark mode initialization
  function initDarkMode() {
    chrome.storage.local.get(['darkMode'], (result) => {
      let isDark;
      if (result.darkMode === undefined) {
        // Auto-detect system preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = result.darkMode;
      }
      applyDarkMode(isDark);
    });
  }

  function applyDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    darkModeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  // Dark mode toggle handler
  darkModeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    applyDarkMode(isDark);
    chrome.storage.local.set({ darkMode: isDark });
  });

  initDarkMode();

  // Load saved state
  chrome.storage.local.get(['enabled', 'zoom'], (result) => {
    const enabled = result.enabled || false;
    const zoom = result.zoom || 1.33;

    enableToggle.checked = enabled;
    statusLabel.textContent = enabled ? 'Enabled' : 'Disabled';
    zoomSlider.value = zoom;
    zoomValue.textContent = zoom.toFixed(2) + 'x';
    updatePresetButtons(zoom);
  });

  // Toggle handler
  enableToggle.addEventListener('change', () => {
    const enabled = enableToggle.checked;
    statusLabel.textContent = enabled ? 'Enabled' : 'Disabled';

    // Save state
    chrome.storage.local.set({ enabled });

    // Send message to content script
    sendToContentScript({ action: 'toggle', enabled });
  });

  // Zoom slider handler
  zoomSlider.addEventListener('input', () => {
    const zoom = parseFloat(zoomSlider.value);
    zoomValue.textContent = zoom.toFixed(2) + 'x';
    updatePresetButtons(zoom);

    // Save state
    chrome.storage.local.set({ zoom });

    // Send message to content script
    sendToContentScript({ action: 'setZoom', zoom });
  });

  // Preset buttons handler
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const zoom = parseFloat(btn.dataset.zoom);
      zoomSlider.value = zoom;
      zoomValue.textContent = zoom.toFixed(2) + 'x';
      updatePresetButtons(zoom);

      // Save state
      chrome.storage.local.set({ zoom });

      // Send message to content script
      sendToContentScript({ action: 'setZoom', zoom });
    });
  });

  function updatePresetButtons(currentZoom) {
    presetBtns.forEach(btn => {
      const btnZoom = parseFloat(btn.dataset.zoom);
      btn.classList.toggle('active', Math.abs(btnZoom - currentZoom) < 0.01);
    });
  }

  function sendToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {
          // Content script not loaded on this page
        });
      }
    });
  }
});
