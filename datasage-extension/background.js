// Background service worker for DataSage extension

const API_URL = 'http://localhost:3001/api/automation';

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
  console.log('Background received message:', request.type || request.action);
  
  if (request.action === 'checkBackend') {
    // Check if backend server is running
    fetch('http://localhost:3001/health')
      .then(response => response.ok)
      .then(isRunning => sendResponse({ running: isRunning }))
      .catch(() => sendResponse({ running: false }));
    
    return true; // Keep message channel open for async response
  }
  
  if (request.type === 'RUN_AUTOMATION') {
    console.log('Starting automation for:', request.config.projectName);
    // Run automation in background
    runAutomationInBackground(request.config);
    return true; // Keep message channel open for async response
  }
});

// Run automation in background (continues even if popup closes)
async function runAutomationInBackground(config) {
  console.log('runAutomationInBackground called');
  
  try {
    console.log('Starting background automation for:', config.projectName);
    
    // Set status to running
    await chrome.storage.session.set({ 
      status: 'running',
      projectName: config.projectName,
      timestamp: Date.now()
    });
    
    console.log('Fetching:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    console.log('Response received, status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Backend request failed');
    }

    // Check response content type to handle different formats
    const contentType = response.headers.get('Content-Type');
    const outputFormat = config.outputFormat || 'json';
    
    console.log('Content-Type:', contentType, 'Output format:', outputFormat);
    
    // Always parse as JSON now (backend always returns JSON)
    const result = await response.json();
    
    console.log('Parsed JSON result:', result.success);
    
    // Store the result in session storage
    await chrome.storage.session.set({ 
      lastResult: result, 
      status: 'complete',
      timestamp: Date.now()
    });

    console.log('Result stored in session storage');

    // Send the result back to the popup (if it's open)
    chrome.runtime.sendMessage({ 
      type: 'AUTOMATION_COMPLETE', 
      result: result 
    }).catch((err) => {
      // Popup might be closed, that's okay
      console.log('Popup closed, result saved to session storage', err);
    });

    console.log('Creating notification...');

    // Create a desktop notification to inform the user
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'DataSage Automation Complete',
      message: `Project "${config.projectName}" finished successfully.`,
      priority: 2
    });
    
    console.log('Notification created');

  } catch (error) {
    console.error('Background automation error:', error);
    console.error('Error stack:', error.stack);

    // Store the error state
    await chrome.storage.session.set({ 
      lastError: error.message, 
      status: 'error',
      timestamp: Date.now()
    });

    console.log('Error stored in session storage');

    // Send the error back to the popup (if it's open)
    chrome.runtime.sendMessage({ 
      type: 'AUTOMATION_ERROR', 
      error: error.message 
    }).catch((err) => {
      console.log('Popup closed, error saved to session storage', err);
    });

    console.log('Creating error notification...');

    // Create a desktop notification for the error
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'DataSage Automation Failed',
      message: `An error occurred: ${error.message}`,
      priority: 2
    });
    
    console.log('Error notification created');
  }
}
