const logger = require('./logger');

/**
 * Request validation utilities
 */
class Validator {
  /**
   * Validate automation configuration
   */
  validateConfig(config) {
    const errors = [];

    // Validate target
    if (!config.target) {
      errors.push({ field: 'target', message: 'Target configuration is required' });
    } else {
      if (!config.target.url) {
        errors.push({ field: 'target.url', message: 'Target URL is required' });
      } else if (!this.isValidURL(config.target.url)) {
        errors.push({ field: 'target.url', message: 'Invalid URL format' });
      }
    }

    // Validate project name
    if (config.projectName && config.projectName.length > 100) {
      errors.push({ field: 'projectName', message: 'Project name must be less than 100 characters' });
    }

    // Validate extraction rules
    if (!config.extraction || !Array.isArray(config.extraction)) {
      errors.push({ field: 'extraction', message: 'Extraction rules must be an array' });
    } else if (config.extraction.length === 0) {
      errors.push({ field: 'extraction', message: 'At least one extraction rule is required' });
    } else {
      config.extraction.forEach((rule, index) => {
        const ruleErrors = this.validateExtractionRule(rule, index);
        errors.push(...ruleErrors);
      });
    }

    // Validate authentication
    if (config.auth) {
      const authErrors = this.validateAuth(config.auth);
      errors.push(...authErrors);
    }

    // Validate execution settings
    if (config.execution) {
      const execErrors = this.validateExecution(config.execution);
      errors.push(...execErrors);
    }

    // Validate output format
    if (config.outputFormat) {
      if (!['json', 'csv', 'xml'].includes(config.outputFormat.toLowerCase())) {
        errors.push({ 
          field: 'outputFormat', 
          message: 'Output format must be one of: json, csv, xml' 
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate extraction rule
   */
  validateExtractionRule(rule, index) {
    const errors = [];
    const prefix = `extraction[${index}]`;

    // Validate type
    if (!rule.type) {
      errors.push({ field: `${prefix}.type`, message: 'Rule type is required' });
    } else if (!['dom', 'js'].includes(rule.type)) {
      errors.push({ field: `${prefix}.type`, message: 'Rule type must be "dom" or "js"' });
    }

    // Validate name
    if (!rule.name || rule.name.trim().length === 0) {
      errors.push({ field: `${prefix}.name`, message: 'Rule name is required' });
    } else if (rule.name.length > 100) {
      errors.push({ field: `${prefix}.name`, message: 'Rule name must be less than 100 characters' });
    }

    // Validate DOM rules
    if (rule.type === 'dom') {
      if (!rule.selector || rule.selector.trim().length === 0) {
        errors.push({ field: `${prefix}.selector`, message: 'Selector is required for DOM rules' });
      } else if (rule.selector.length > 500) {
        errors.push({ field: `${prefix}.selector`, message: 'Selector must be less than 500 characters' });
      }

      // Validate selector type
      if (rule.selectorType && !['css', 'xpath'].includes(rule.selectorType)) {
        errors.push({ 
          field: `${prefix}.selectorType`, 
          message: 'Selector type must be "css" or "xpath"' 
        });
      }

      // Basic XPath syntax validation
      if (rule.selectorType === 'xpath' && !this.isValidXPath(rule.selector)) {
        errors.push({ 
          field: `${prefix}.selector`, 
          message: 'Invalid XPath syntax' 
        });
      }

      // Validate attribute
      const validAttributes = ['textContent', 'innerText', 'innerHTML', 'href', 'src', 'value', 'count'];
      if (rule.attribute && !validAttributes.includes(rule.attribute)) {
        errors.push({ 
          field: `${prefix}.attribute`, 
          message: `Attribute must be one of: ${validAttributes.join(', ')}` 
        });
      }
    }

    // Validate JS rules
    if (rule.type === 'js') {
      if (!rule.jsCode || rule.jsCode.trim().length === 0) {
        errors.push({ field: `${prefix}.jsCode`, message: 'JavaScript code is required for JS rules' });
      } else if (rule.jsCode.length > 5000) {
        errors.push({ field: `${prefix}.jsCode`, message: 'JavaScript code must be less than 5000 characters' });
      }

      // Basic security check
      if (this.containsDangerousJS(rule.jsCode)) {
        errors.push({ 
          field: `${prefix}.jsCode`, 
          message: 'JavaScript code contains potentially dangerous operations' 
        });
      }
    }

    return errors;
  }

  /**
   * Validate authentication configuration
   */
  validateAuth(auth) {
    const errors = [];

    if (!auth.loginUrl) {
      errors.push({ field: 'auth.loginUrl', message: 'Login URL is required' });
    } else if (!this.isValidURL(auth.loginUrl)) {
      errors.push({ field: 'auth.loginUrl', message: 'Invalid login URL format' });
    }

    if (!auth.username || auth.username.trim().length === 0) {
      errors.push({ field: 'auth.username', message: 'Username is required' });
    }

    if (!auth.password || auth.password.trim().length === 0) {
      errors.push({ field: 'auth.password', message: 'Password is required' });
    }

    if (auth.selectors) {
      if (!auth.selectors.username) {
        errors.push({ field: 'auth.selectors.username', message: 'Username selector is required' });
      }
      if (!auth.selectors.password) {
        errors.push({ field: 'auth.selectors.password', message: 'Password selector is required' });
      }
      if (!auth.selectors.submit) {
        errors.push({ field: 'auth.selectors.submit', message: 'Submit button selector is required' });
      }
    }

    return errors;
  }

  /**
   * Validate execution settings
   */
  validateExecution(execution) {
    const errors = [];

    if (execution.timeout !== undefined) {
      if (typeof execution.timeout !== 'number') {
        errors.push({ field: 'execution.timeout', message: 'Timeout must be a number' });
      } else if (execution.timeout < 1000 || execution.timeout > 300000) {
        errors.push({ 
          field: 'execution.timeout', 
          message: 'Timeout must be between 1000ms (1s) and 300000ms (5min)' 
        });
      }
    }

    if (execution.retries !== undefined) {
      if (typeof execution.retries !== 'number') {
        errors.push({ field: 'execution.retries', message: 'Retries must be a number' });
      } else if (execution.retries < 0 || execution.retries > 10) {
        errors.push({ field: 'execution.retries', message: 'Retries must be between 0 and 10' });
      }
    }

    if (execution.headless !== undefined && typeof execution.headless !== 'boolean') {
      errors.push({ field: 'execution.headless', message: 'Headless must be a boolean' });
    }

    return errors;
  }

  /**
   * Validate URL format
   */
  isValidURL(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch (error) {
      return false;
    }
  }

  /**
   * Basic XPath syntax validation
   */
  isValidXPath(xpath) {
    // Check if starts with / or // (absolute path)
    if (!xpath.startsWith('/')) {
      return false;
    }

    // Check for balanced brackets
    const openBrackets = (xpath.match(/\[/g) || []).length;
    const closeBrackets = (xpath.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      return false;
    }

    // Check for balanced parentheses
    const openParens = (xpath.match(/\(/g) || []).length;
    const closeParens = (xpath.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      return false;
    }

    // Check for balanced quotes
    const singleQuotes = (xpath.match(/'/g) || []).length;
    const doubleQuotes = (xpath.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
      return false;
    }

    return true;
  }

  /**
   * Check for dangerous JavaScript patterns
   */
  containsDangerousJS(code) {
    const dangerousPatterns = [
      /require\s*\(/i,           // Node.js require
      /import\s+.*\s+from/i,     // ES6 imports
      /process\./i,              // Node.js process
      /fs\./i,                   // File system
      /child_process/i,          // Child processes
      /eval\s*\(/i,              // Direct eval calls
      /Function\s*\(/i,          // Function constructor
      /setTimeout.*eval/i,       // Eval in setTimeout
      /setInterval.*eval/i,      // Eval in setInterval
    ];

    return dangerousPatterns.some(pattern => pattern.test(code));
  }

  /**
   * Sanitize string input
   */
  sanitize(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim();
  }
}

module.exports = new Validator();
