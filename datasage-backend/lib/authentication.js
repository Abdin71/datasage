const logger = require('./logger');

/**
 * Authentication handler for web applications
 */
class Authentication {
  /**
   * Perform login on a page
   */
  async login(page, authConfig) {
    const logs = [];
    
    try {
      // Navigate to login URL
      logs.push({ 
        level: 'info', 
        message: `Navigating to login page: ${authConfig.loginUrl}`,
        timestamp: new Date().toISOString()
      });
      
      await page.goto(authConfig.loginUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Wait for login form
      const usernameSelector = authConfig.selectors?.username || '#username';
      const passwordSelector = authConfig.selectors?.password || '#password';
      const submitSelector = authConfig.selectors?.submit || "button[type='submit']";
      
      logs.push({ 
        level: 'info', 
        message: 'Waiting for login form...',
        timestamp: new Date().toISOString()
      });
      
      await page.waitForSelector(usernameSelector, { timeout: 10000 });
      
      // Fill in credentials
      logs.push({ 
        level: 'info', 
        message: 'Filling in credentials...',
        timestamp: new Date().toISOString()
      });
      
      await page.type(usernameSelector, authConfig.username, { delay: 100 });
      await page.type(passwordSelector, authConfig.password, { delay: 100 });
      
      // Submit form
      logs.push({ 
        level: 'info', 
        message: 'Submitting login form...',
        timestamp: new Date().toISOString()
      });
      
      await Promise.all([
        page.click(submitSelector),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 })
      ]);
      
      // Check if login was successful
      const currentUrl = page.url();
      const isLoginPage = currentUrl.includes('login') || currentUrl.includes('signin');
      
      if (isLoginPage) {
        // Still on login page, check for error messages
        const errorElement = await page.$('.error, .alert-danger, [role="alert"]');
        
        if (errorElement) {
          const errorText = await page.evaluate(el => el.textContent, errorElement);
          throw new Error(`Login failed: ${errorText.trim()}`);
        }
        
        throw new Error('Login failed: Still on login page');
      }
      
      logs.push({ 
        level: 'success', 
        message: 'Login successful',
        timestamp: new Date().toISOString()
      });
      
      return { success: true, logs };
      
    } catch (error) {
      logger.error(`Authentication error: ${error.message}`);
      
      logs.push({ 
        level: 'error', 
        message: `Authentication failed: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      
      return { 
        success: false, 
        message: error.message,
        logs 
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(page, authConfig) {
    try {
      const currentUrl = page.url();
      
      // If we're on a login page, we're not authenticated
      if (currentUrl.includes('login') || currentUrl.includes('signin')) {
        return false;
      }
      
      // If we have a custom check, run it
      if (authConfig.checkSelector) {
        const element = await page.$(authConfig.checkSelector);
        return element !== null;
      }
      
      return true;
      
    } catch (error) {
      logger.error(`Auth check error: ${error.message}`);
      return false;
    }
  }
}

module.exports = new Authentication();
