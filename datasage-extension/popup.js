// Configuration State
let extractionRules = [];
let isRunning = false;

// Backend API URL
const API_URL = 'http://localhost:3001/api/automation';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  initializeChevrons();
  loadSavedConfig();
  updateRulesCount();
  addDemoRule();
});

// Initialize all event listeners (no inline onclick handlers allowed in Manifest V3)
function initializeEventListeners() {
  // Toggle section listeners
  document.querySelectorAll('[data-toggle]').forEach(element => {
    element.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-toggle');
      toggleSection(sectionId);
    });
  });
  
  // Button listeners
  document.getElementById('testUrlBtn')?.addEventListener('click', testUrl);
  document.getElementById('addDomQueryBtn')?.addEventListener('click', () => addExtractionRule('dom'));
  document.getElementById('addJsEvalBtn')?.addEventListener('click', () => addExtractionRule('js'));
  document.getElementById('runButton')?.addEventListener('click', runAutomation);
  
  // Checkbox listener
  document.getElementById('requiresAuth')?.addEventListener('change', toggleAuthFields);
  
  // Save config on input changes
  const inputFields = [
    'projectName', 'targetUrl', 'outputFormat', 'pageTimeout', 
    'retryAttempts', 'headlessMode', 'requiresAuth', 'loginUrl',
    'username', 'usernameSelector', 'passwordSelector', 'submitSelector'
  ];
  
  inputFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('change', saveConfig);
      if (field.type === 'text' || field.type === 'url' || field.type === 'number') {
        field.addEventListener('input', saveConfig);
      }
    }
  });
}

// Initialize chevron directions based on section state
function initializeChevrons() {
  // Find all sections with IDs that can be toggled
  const sections = [
    'targetSection',
    'authSection', 
    'extractionSection',
    'logsSection',
    'advancedSettings'
  ];
  
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const card = section.closest('.card');
    const isCollapsibleContent = section.classList.contains('collapsible-content');
    
    let chevron;
    if (isCollapsibleContent) {
      const trigger = section.previousElementSibling;
      chevron = trigger?.querySelector('.chevron-small');
    } else {
      chevron = card?.querySelector('.card-header .chevron');
    }
    
    if (chevron) {
      chevron.style.transform = section.classList.contains('hidden') 
        ? 'rotate(0deg)' 
        : 'rotate(180deg)';
    }
  });
}

// Toggle Section Visibility
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) {
    console.error(`Section with id "${sectionId}" not found`);
    return;
  }
  
  const card = section.closest('.card');
  const isCollapsibleContent = section.classList.contains('collapsible-content');
  
  // Toggle visibility
  if (section.classList.contains('hidden')) {
    section.classList.remove('hidden');
    card?.classList.remove('collapsed');
  } else {
    section.classList.add('hidden');
    card?.classList.add('collapsed');
  }
  
  // Rotate chevron - look for it in the card-header or collapsible-trigger
  let chevron;
  if (isCollapsibleContent) {
    // For collapsible-trigger sections (like advanced settings)
    const trigger = section.previousElementSibling;
    chevron = trigger?.querySelector('.chevron-small');
  } else {
    // For card sections
    chevron = card?.querySelector('.card-header .chevron');
  }
  
  if (chevron) {
    chevron.style.transform = section.classList.contains('hidden') 
      ? 'rotate(0deg)' 
      : 'rotate(180deg)';
  }
}

// Toggle Authentication Fields
function toggleAuthFields() {
  const requiresAuth = document.getElementById('requiresAuth').checked;
  const authFields = document.getElementById('authFields');
  
  if (requiresAuth) {
    authFields.classList.remove('hidden');
  } else {
    authFields.classList.add('hidden');
  }
}

// Add Extraction Rule
function addExtractionRule(type) {
  const rule = {
    id: Date.now(),
    type: type,
    name: '',
    selector: '',
    jsCode: '',
    attribute: 'textContent'
  };
  
  extractionRules.push(rule);
  renderExtractionRules();
  updateRulesCount();
}

// Remove Extraction Rule
function removeExtractionRule(ruleId) {
  extractionRules = extractionRules.filter(r => r.id !== ruleId);
  renderExtractionRules();
  updateRulesCount();
}

// Render Extraction Rules
function renderExtractionRules() {
  const container = document.getElementById('extractionRules');
  
  if (extractionRules.length === 0) {
    container.innerHTML = '<p class="empty-message">No extraction rules defined yet. Add a DOM query or JS evaluation above.</p>';
    return;
  }
  
  container.innerHTML = extractionRules.map(rule => `
    <div class="rule-card" data-rule-id="${rule.id}">
      <div class="rule-header">
        <span class="rule-badge ${rule.type === 'dom' ? 'badge-primary' : 'badge-secondary'}">
          ${rule.type === 'dom' ? 'DOM Query' : 'JS Evaluation'}
        </span>
        <button class="delete-button" data-action="delete-rule" data-rule-id="${rule.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
      <div class="rule-content">
        <div class="form-group">
          <label>Data Point Name</label>
          <input type="text" 
            class="rule-name" 
            data-rule-id="${rule.id}"
            data-field="name"
            placeholder="e.g., Total Revenue, User Count" 
            value="${rule.name}" />
        </div>
        ${rule.type === 'dom' ? `
          <div class="form-group">
            <label>CSS Selector</label>
            <div class="input-with-button">
              <input type="text" 
                class="mono-input" 
                data-rule-id="${rule.id}"
                data-field="selector"
                placeholder="div.revenue-widget .total-value" 
                value="${rule.selector}" />
              <button class="icon-button" data-action="test-selector" data-rule-id="${rule.id}" title="Test Selector">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2"></path>
                  <path d="M8.5 2h7"></path>
                  <path d="M14.5 16h-5"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Attribute to Extract</label>
            <select data-rule-id="${rule.id}" data-field="attribute">
              <option value="textContent" ${rule.attribute === 'textContent' ? 'selected' : ''}>Text Content</option>
              <option value="innerText" ${rule.attribute === 'innerText' ? 'selected' : ''}>Inner Text</option>
              <option value="innerHTML" ${rule.attribute === 'innerHTML' ? 'selected' : ''}>HTML</option>
              <option value="href" ${rule.attribute === 'href' ? 'selected' : ''}>href</option>
              <option value="src" ${rule.attribute === 'src' ? 'selected' : ''}>src</option>
              <option value="value" ${rule.attribute === 'value' ? 'selected' : ''}>value</option>
            </select>
          </div>
        ` : `
          <div class="form-group">
            <label>JavaScript Code</label>
            <textarea 
              class="mono-input" 
              rows="4" 
              data-rule-id="${rule.id}"
              data-field="jsCode"
              placeholder="return document.querySelectorAll('.item').length;">${rule.jsCode}</textarea>
            <p class="help-text">Code will be executed in the page context. Use 'return' to return a value.</p>
          </div>
        `}
      </div>
    </div>
  `).join('');
  
  // Attach event listeners to newly created elements
  attachRuleEventListeners();
}

// Attach event listeners to rule elements
function attachRuleEventListeners() {
  // Delete buttons
  document.querySelectorAll('[data-action="delete-rule"]').forEach(button => {
    button.addEventListener('click', function() {
      const ruleId = parseInt(this.getAttribute('data-rule-id'));
      removeExtractionRule(ruleId);
    });
  });
  
  // Test selector buttons
  document.querySelectorAll('[data-action="test-selector"]').forEach(button => {
    button.addEventListener('click', function() {
      const ruleId = parseInt(this.getAttribute('data-rule-id'));
      testSelector(ruleId);
    });
  });
  
  // Input fields and selects
  document.querySelectorAll('[data-rule-id][data-field]').forEach(element => {
    const ruleId = parseInt(element.getAttribute('data-rule-id'));
    const field = element.getAttribute('data-field');
    
    element.addEventListener('change', function() {
      updateRule(ruleId, field, this.value);
    });
    
    // Also add input event for text inputs
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.addEventListener('input', function() {
        updateRule(ruleId, field, this.value);
      });
    }
  });
}

// Update Rule
function updateRule(ruleId, field, value) {
  const rule = extractionRules.find(r => r.id === ruleId);
  if (rule) {
    rule[field] = value;
    saveConfig();
  }
}

// Update Rules Count
function updateRulesCount() {
  document.getElementById('rulesCount').textContent = `${extractionRules.length} ${extractionRules.length === 1 ? 'Rule' : 'Rules'}`;
}

// Test URL
function testUrl() {
  const url = document.getElementById('targetUrl').value;
  if (!url) {
    showStatus('Please enter a URL first', 'error');
    return;
  }
  
  showStatus('Testing URL...', 'loading');
  
  // Simple validation
  try {
    new URL(url);
    showStatus('URL is valid ✓', 'success');
  } catch (e) {
    showStatus('Invalid URL format', 'error');
  }
}

// Test Selector
function testSelector(ruleId) {
  showStatus('Selector testing requires execution', 'info');
}

// Run Automation
async function runAutomation() {
  if (isRunning) return;
  
  // Validate inputs
  const projectName = document.getElementById('projectName').value;
  const targetUrl = document.getElementById('targetUrl').value;
  
  if (!projectName) {
    showStatus('Please enter a project name', 'error');
    return;
  }
  
  if (!targetUrl) {
    showStatus('Please enter a target URL', 'error');
    return;
  }
  
  if (extractionRules.length === 0) {
    showStatus('Please add at least one extraction rule', 'error');
    return;
  }
  
  // Validate all rules have names and selectors/code
  const invalidRules = extractionRules.filter(rule => 
    !rule.name || (rule.type === 'dom' ? !rule.selector : !rule.jsCode)
  );
  
  if (invalidRules.length > 0) {
    showStatus('Please fill in all rule fields', 'error');
    return;
  }
  
  isRunning = true;
  updateRunButton(true);
  clearResults();
  clearLogs();
  showStatus('Connecting to backend...', 'loading');
  
  // Build configuration
  const config = {
    projectName,
    target: {
      url: targetUrl
    },
    execution: {
      timeout: parseInt(document.getElementById('pageTimeout').value) || 30000,
      retries: parseInt(document.getElementById('retryAttempts').value) || 3,
      headless: document.getElementById('headlessMode').checked
    },
    outputFormat: document.getElementById('outputFormat').value,
    extraction: extractionRules.map(rule => ({
      name: rule.name,
      type: rule.type,
      selector: rule.type === 'dom' ? rule.selector : undefined,
      attribute: rule.type === 'dom' ? rule.attribute : undefined,
      jsCode: rule.type === 'js' ? rule.jsCode : undefined
    }))
  };
  
  // Add authentication if enabled
  const requiresAuth = document.getElementById('requiresAuth').checked;
  if (requiresAuth) {
    const loginUrl = document.getElementById('loginUrl').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!loginUrl || !username || !password) {
      showStatus('Please fill in all authentication fields', 'error');
      isRunning = false;
      updateRunButton(false);
      return;
    }
    
    config.auth = {
      loginUrl,
      username,
      password,
      selectors: {
        username: document.getElementById('usernameSelector').value,
        password: document.getElementById('passwordSelector').value,
        submit: document.getElementById('submitSelector').value
      }
    };
  }
  
  // Save configuration
  saveConfig();
  
  try {
    addLog('Sending request to backend server...', 'info');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Backend request failed');
    }
    
    const result = await response.json();
    
    // Display results
    displayResults(result);
    
    // Display logs
    if (result.logs && result.logs.length > 0) {
      result.logs.forEach(log => addLog(log.message, log.level));
    }
    
    if (result.success) {
      showStatus('Automation completed successfully ✓', 'success');
    } else {
      showStatus('Automation completed with errors', 'warning');
    }
    
  } catch (error) {
    console.error('Automation error:', error);
    
    if (error.message.includes('fetch')) {
      showStatus('Cannot connect to backend server. Is it running on port 3001?', 'error');
      addLog('Backend server connection failed. Make sure the server is running.', 'error');
    } else {
      showStatus(`Error: ${error.message}`, 'error');
      addLog(`Automation failed: ${error.message}`, 'error');
    }
    
    displayError(error.message);
  } finally {
    isRunning = false;
    updateRunButton(false);
  }
}

// Display Results
function displayResults(result) {
  const container = document.getElementById('resultsContainer');
  
  if (!result.data || Object.keys(result.data).length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" x2="12" y1="8" y2="12"></line>
          <line x1="12" x2="12.01" y1="16" y2="16"></line>
        </svg>
        <h3>No data extracted</h3>
        <p>Check your selectors and try again</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="results-data">
      <div class="results-header">
        <h3>Extracted Data</h3>
        <button class="copy-button" id="copyResultsBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
          </svg>
          Copy JSON
        </button>
      </div>
      <pre class="results-json" id="resultsJson">${JSON.stringify(result.data, null, 2)}</pre>
    </div>
  `;
  
  // Attach event listener to copy button
  document.getElementById('copyResultsBtn')?.addEventListener('click', copyResults);
}

// Display Error
function displayError(message) {
  const container = document.getElementById('resultsContainer');
  container.innerHTML = `
    <div class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" x2="9" y1="9" y2="15"></line>
        <line x1="9" x2="15" y1="9" y2="15"></line>
      </svg>
      <h3>Automation Failed</h3>
      <p>${message}</p>
    </div>
  `;
}

// Copy Results
function copyResults() {
  const json = document.getElementById('resultsJson').textContent;
  navigator.clipboard.writeText(json).then(() => {
    showStatus('Results copied to clipboard ✓', 'success');
  });
}

// Clear Results
function clearResults() {
  const container = document.getElementById('resultsContainer');
  container.innerHTML = `
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="empty-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" x2="12" y1="8" y2="12"></line>
        <line x1="12" x2="12.01" y1="16" y2="16"></line>
      </svg>
      <h3>Running automation...</h3>
      <p>Please wait while we extract your data</p>
    </div>
  `;
}

// Add Log
function addLog(message, level = 'info') {
  const logsContainer = document.getElementById('logsContainer');
  const timestamp = new Date().toLocaleTimeString();
  
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry log-${level}`;
  logEntry.innerHTML = `
    <span class="log-time">[${timestamp}]</span>
    <span class="log-message">${message}</span>
  `;
  
  logsContainer.appendChild(logEntry);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Clear Logs
function clearLogs() {
  document.getElementById('logsContainer').innerHTML = '';
}

// Show Status
function showStatus(message, type = 'info') {
  const statusText = document.getElementById('statusText');
  const footerStatus = document.getElementById('footerStatus');
  const statusBar = document.getElementById('statusBar');
  
  statusText.textContent = message;
  footerStatus.textContent = message;
  
  // Update status bar color
  statusBar.className = 'status-bar';
  if (type === 'error') statusBar.classList.add('status-error');
  if (type === 'success') statusBar.classList.add('status-success');
  if (type === 'loading') statusBar.classList.add('status-loading');
  if (type === 'warning') statusBar.classList.add('status-warning');
  
  // Auto-clear non-error messages after 5 seconds
  if (type !== 'error') {
    setTimeout(() => {
      statusText.textContent = 'Ready to execute';
      footerStatus.textContent = 'Ready to execute';
      statusBar.className = 'status-bar';
    }, 5000);
  }
}

// Update Run Button
function updateRunButton(running) {
  const button = document.getElementById('runButton');
  
  if (running) {
    button.disabled = true;
    button.innerHTML = `
      <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" x2="12" y1="2" y2="6"></line>
        <line x1="12" x2="12" y1="18" y2="22"></line>
        <line x1="4.93" x2="7.76" y1="4.93" y2="7.76"></line>
        <line x1="16.24" x2="19.07" y1="16.24" y2="19.07"></line>
        <line x1="2" x2="6" y1="12" y2="12"></line>
        <line x1="18" x2="22" y1="12" y2="12"></line>
        <line x1="4.93" x2="7.76" y1="19.07" y2="16.24"></line>
        <line x1="16.24" x2="19.07" y1="7.76" y2="4.93"></line>
      </svg>
      Running...
    `;
  } else {
    button.disabled = false;
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="6 3 20 12 6 21 6 3"></polygon>
      </svg>
      Run Automation
    `;
  }
}

// Save Configuration
function saveConfig() {
  const config = {
    projectName: document.getElementById('projectName').value,
    targetUrl: document.getElementById('targetUrl').value,
    outputFormat: document.getElementById('outputFormat').value,
    pageTimeout: document.getElementById('pageTimeout').value,
    retryAttempts: document.getElementById('retryAttempts').value,
    headlessMode: document.getElementById('headlessMode').checked,
    requiresAuth: document.getElementById('requiresAuth').checked,
    loginUrl: document.getElementById('loginUrl').value,
    username: document.getElementById('username').value,
    usernameSelector: document.getElementById('usernameSelector').value,
    passwordSelector: document.getElementById('passwordSelector').value,
    submitSelector: document.getElementById('submitSelector').value,
    extractionRules: extractionRules
  };
  
  chrome.storage.local.set({ config });
}

// Load Saved Configuration
function loadSavedConfig() {
  chrome.storage.local.get(['config'], (result) => {
    if (result.config) {
      const config = result.config;
      
      document.getElementById('projectName').value = config.projectName || '';
      document.getElementById('targetUrl').value = config.targetUrl || '';
      document.getElementById('outputFormat').value = config.outputFormat || 'json';
      document.getElementById('pageTimeout').value = config.pageTimeout || '30000';
      document.getElementById('retryAttempts').value = config.retryAttempts || '3';
      document.getElementById('headlessMode').checked = config.headlessMode !== false;
      document.getElementById('requiresAuth').checked = config.requiresAuth || false;
      document.getElementById('loginUrl').value = config.loginUrl || '';
      document.getElementById('username').value = config.username || '';
      document.getElementById('usernameSelector').value = config.usernameSelector || '#username';
      document.getElementById('passwordSelector').value = config.passwordSelector || '#password';
      document.getElementById('submitSelector').value = config.submitSelector || "button[type='submit']";
      
      if (config.extractionRules) {
        extractionRules = config.extractionRules;
        renderExtractionRules();
        updateRulesCount();
      }
      
      toggleAuthFields();
    }
  });
}

// Add Demo Rule on First Load
function addDemoRule() {
  if (extractionRules.length === 0) {
    extractionRules.push({
      id: Date.now(),
      type: 'dom',
      name: 'Total Revenue',
      selector: 'div.revenue-widget .total-value',
      attribute: 'textContent'
    });
    renderExtractionRules();
    updateRulesCount();
  }
}
