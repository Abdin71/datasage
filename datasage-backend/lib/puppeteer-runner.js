const puppeteer = require('puppeteer');
const authentication = require('./authentication');
const extraction = require('./extraction');
const logger = require('./logger');

/**
 * Main Puppeteer automation runner
 */
class PuppeteerRunner {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Run automation with provided configuration
   */
  async run(config) {
    const logs = [];
    const data = {};
    
    try {
      // Launch browser
      logs.push({ level: 'info', message: 'Launching browser...', timestamp: new Date().toISOString() });
      
      this.browser = await puppeteer.launch({
        headless: config.execution?.headless !== false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security'
        ],
        slowMo: process.env.PUPPETEER_SLOWMO || 0
      });
      
      this.page = await this.browser.newPage();
      
      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      // Set timeout
      const timeout = config.execution?.timeout || 30000;
      this.page.setDefaultTimeout(timeout);
      this.page.setDefaultNavigationTimeout(timeout);
      
      logs.push({ level: 'success', message: 'Browser launched successfully', timestamp: new Date().toISOString() });
      
      // Handle authentication if required
      if (config.auth) {
        logs.push({ level: 'info', message: 'Authenticating...', timestamp: new Date().toISOString() });
        
        const authResult = await authentication.login(this.page, config.auth);
        
        if (!authResult.success) {
          throw new Error(`Authentication failed: ${authResult.message}`);
        }
        
        logs.push({ level: 'success', message: 'Authentication successful', timestamp: new Date().toISOString() });
        authResult.logs?.forEach(log => logs.push(log));
      }
      
      // Navigate to target URL
      logs.push({ level: 'info', message: `Navigating to ${config.target.url}...`, timestamp: new Date().toISOString() });
      
      await this.page.goto(config.target.url, {
        waitUntil: 'networkidle2',
        timeout: timeout
      });
      
      logs.push({ level: 'success', message: 'Page loaded successfully', timestamp: new Date().toISOString() });
      
      // Wait a bit for dynamic content
      await this.page.waitForTimeout(2000);
      
      // Extract data
      logs.push({ level: 'info', message: 'Extracting data...', timestamp: new Date().toISOString() });
      
      for (const rule of config.extraction) {
        try {
          let value;
          
          if (rule.type === 'dom') {
            value = await extraction.extractDOM(this.page, rule);
            logs.push({ 
              level: 'success', 
              message: `Extracted "${rule.name}": ${this.formatValue(value)}`,
              timestamp: new Date().toISOString()
            });
          } else if (rule.type === 'js') {
            value = await extraction.extractJS(this.page, rule);
            logs.push({ 
              level: 'success', 
              message: `Evaluated "${rule.name}": ${this.formatValue(value)}`,
              timestamp: new Date().toISOString()
            });
          }
          
          data[rule.name] = value;
          
        } catch (error) {
          logs.push({ 
            level: 'error', 
            message: `Failed to extract "${rule.name}": ${error.message}`,
            timestamp: new Date().toISOString()
          });
          data[rule.name] = null;
        }
      }
      
      logs.push({ level: 'success', message: `Extracted ${Object.keys(data).length} data points`, timestamp: new Date().toISOString() });
      
      return { data, logs };
      
    } catch (error) {
      logger.error(`Automation error: ${error.message}`);
      logs.push({ 
        level: 'error', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw error;
      
    } finally {
      // Cleanup
      if (this.browser) {
        await this.browser.close();
        logs.push({ level: 'info', message: 'Browser closed', timestamp: new Date().toISOString() });
      }
    }
  }

  /**
   * Format value for logging
   */
  formatValue(value) {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 50) + '...';
    }
    return String(value);
  }
}

module.exports = new PuppeteerRunner();
