// HBO Max Ultrawide Fixer - Content Script
(function() {
  'use strict';

  const DEFAULT_ZOOM = 1.33;
  let isEnabled = false;
  let zoomLevel = DEFAULT_ZOOM;
  let videoElement = null;
  let observer = null;
  let styleElement = null;

  // Load saved settings
  chrome.storage.local.get(['enabled', 'zoom'], (result) => {
    isEnabled = result.enabled || false;
    zoomLevel = result.zoom || DEFAULT_ZOOM;
    if (isEnabled) {
      applyZoom();
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggle') {
      isEnabled = message.enabled;
      if (isEnabled) {
        applyZoom();
      } else {
        removeZoom();
      }
      sendResponse({ success: true });
    } else if (message.action === 'setZoom') {
      zoomLevel = message.zoom;
      if (isEnabled) {
        applyZoom();
      }
      sendResponse({ success: true });
    } else if (message.action === 'getState') {
      sendResponse({ enabled: isEnabled, zoom: zoomLevel });
    }
    return true;
  });

  function findVideo() {
    const allVideos = document.querySelectorAll('video');

    if (allVideos.length > 0) {
      // Return the largest video (likely the main player)
      let largest = allVideos[0];
      let largestArea = 0;

      allVideos.forEach((video) => {
        const rect = video.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > largestArea) {
          largestArea = area;
          largest = video;
        }
      });

      return largest;
    }

    return null;
  }

  function applyZoom() {
    videoElement = findVideo();
    if (!videoElement) {
      setupObserver();
      setTimeout(applyZoom, 1000);
      return;
    }

    // Remove old style if exists
    if (styleElement) {
      styleElement.remove();
    }

    // Create a style element with !important to override HBO's styles
    styleElement = document.createElement('style');
    styleElement.id = 'ultrawide-fixer-styles';
    styleElement.textContent = `
      video {
        transform: scale(${zoomLevel}) !important;
        transform-origin: center center !important;
      }

      /* Hide overflow on all parent containers */
      video[style*="transform"],
      .player,
      [class*="player"],
      [class*="Player"],
      [class*="video"],
      [class*="Video"],
      [data-testid*="player"],
      [data-testid*="video"] {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Also apply inline styles as backup
    videoElement.style.setProperty('transform', `scale(${zoomLevel})`, 'important');
    videoElement.style.setProperty('transform-origin', 'center center', 'important');

    // Handle overflow on parent containers
    let parent = videoElement.parentElement;
    let depth = 0;
    while (parent && depth < 10) {
      parent.style.setProperty('overflow', 'hidden', 'important');
      parent = parent.parentElement;
      depth++;
    }
  }

  function removeZoom() {
    // Remove style element
    if (styleElement) {
      styleElement.remove();
      styleElement = null;
    }

    if (videoElement) {
      videoElement.style.removeProperty('transform');
      videoElement.style.removeProperty('transform-origin');

      // Remove overflow hidden from parents
      let parent = videoElement.parentElement;
      let depth = 0;
      while (parent && depth < 10) {
        parent.style.removeProperty('overflow');
        parent = parent.parentElement;
        depth++;
      }
    }
  }

  function setupObserver() {
    if (observer) return;

    const target = document.body || document.documentElement;
    if (!target) {
      setTimeout(setupObserver, 100);
      return;
    }

    observer = new MutationObserver(() => {
      if (isEnabled) {
        const video = findVideo();
        if (video && video !== videoElement) {
          videoElement = video;
          applyZoom();
        }
      }
    });

    observer.observe(target, {
      childList: true,
      subtree: true
    });
  }

  // Start observing when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObserver);
  } else {
    setupObserver();
  }

  // Re-apply on fullscreen changes
  document.addEventListener('fullscreenchange', () => {
    if (isEnabled) {
      setTimeout(applyZoom, 200);
    }
  });

  // Re-apply when video metadata loads
  document.addEventListener('loadedmetadata', (e) => {
    if (e.target.tagName === 'VIDEO' && isEnabled) {
      videoElement = e.target;
      applyZoom();
    }
  }, true);

  // Also listen for play events
  document.addEventListener('play', (e) => {
    if (e.target.tagName === 'VIDEO' && isEnabled) {
      videoElement = e.target;
      setTimeout(applyZoom, 100);
    }
  }, true);
})();
