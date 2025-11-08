// Background service worker for DataSage extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('DataSage extension installed');
  
  // Set default configuration
  chrome.storage.local.get(['config'], (result) => {
    if (!result.config) {
      chrome.storage.local.set({
        config: {
          projectName: '',
          targetUrl: '',
          outputFormat: 'json',
          pageTimeout: '30000',
          retryAttempts: '3',
          headlessMode: true,
          requiresAuth: false,
          extractionRules: []
        }
      });
    }
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkBackend') {
    // Check if backend server is running
    fetch('http://localhost:3001/health')
      .then(response => response.ok)
      .then(isRunning => sendResponse({ running: isRunning }))
      .catch(() => sendResponse({ running: false }));
    
    return true; // Keep message channel open for async response
  }
});
