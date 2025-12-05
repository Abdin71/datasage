const logger = require('./logger');

/**
 * Mock data generator for demo purposes
 * Generates realistic data without running Puppeteer automation
 */
class MockDataGenerator {
  /**
   * Check if mock data mode is enabled
   */
  shouldUseMockData() {
    const enabled = process.env.ENABLE_MOCK_DATA === 'true';
    
    if (enabled) {
      logger.info('🎭 Mock data mode is ENABLED');
    }
    
    return enabled;
  }

  /**
   * Generate mock automation result matching real automation structure
   */
  generateMockResult(config) {
    const logs = [
      { level: 'info', message: '🎭 Mock Mode: Generating demo data...', timestamp: new Date().toISOString() },
      { level: 'success', message: 'Mock browser launched successfully', timestamp: new Date().toISOString() },
      { level: 'info', message: `Mock navigation to ${config.target.url}...`, timestamp: new Date().toISOString() },
      { level: 'success', message: 'Mock page loaded successfully', timestamp: new Date().toISOString() },
      { level: 'info', message: 'Extracting mock data...', timestamp: new Date().toISOString() }
    ];

    // Generate mock data based on extraction rules
    const data = {};
    
    if (config.extraction && config.extraction.length > 0) {
      config.extraction.forEach((rule, index) => {
        const mockValue = this.generateMockValue(rule, index);
        data[rule.name] = mockValue;
        
        const valuePreview = this.formatValue(mockValue);
        logs.push({
          level: 'success',
          message: `Extracted "${rule.name}": ${valuePreview}`,
          timestamp: new Date().toISOString()
        });
      });
    } else {
      // Default mock data if no extraction rules
      data['Demo Field 1'] = 'Mock Value 1';
      data['Demo Field 2'] = 'Mock Value 2';
      data['Demo Field 3'] = 'Mock Value 3';
    }

    logs.push({
      level: 'success',
      message: `Extracted ${Object.keys(data).length} data points`,
      timestamp: new Date().toISOString()
    });
    
    logs.push({
      level: 'info',
      message: 'Mock browser closed',
      timestamp: new Date().toISOString()
    });

    return { data, logs };
  }

  /**
   * Generate mock value based on rule type and name
   */
  generateMockValue(rule, index) {
    const name = rule.name.toLowerCase();
    
    // Table extraction type
    if (rule.extractionType === 'table') {
      return this.generateMockTable();
    }
    
    // Form extraction type
    if (rule.extractionType === 'form') {
      return this.generateMockForm();
    }
    
    // List extraction type
    if (rule.extractionType === 'list' || rule.extractionType === 'multiple') {
      return this.generateMockList(rule.name);
    }
    
    // Smart mock data based on field name
    if (name.includes('price') || name.includes('cost') || name.includes('revenue') || name.includes('amount')) {
      return this.generateMockPrice();
    }
    
    if (name.includes('count') || name.includes('total') || name.includes('number')) {
      return this.generateMockCount();
    }
    
    if (name.includes('date') || name.includes('time') || name.includes('updated')) {
      return new Date().toISOString().split('T')[0];
    }
    
    if (name.includes('email')) {
      return `demo${index + 1}@example.com`;
    }
    
    if (name.includes('url') || name.includes('link')) {
      return `https://example.com/page${index + 1}`;
    }
    
    if (name.includes('title') || name.includes('heading')) {
      return `Demo ${rule.name} ${index + 1}`;
    }
    
    if (name.includes('status')) {
      return ['Active', 'Pending', 'Completed', 'Processing'][index % 4];
    }
    
    if (name.includes('percent') || name.includes('rate')) {
      return `${(Math.random() * 100).toFixed(1)}%`;
    }
    
    // Default mock value
    return `Mock ${rule.name} Data`;
  }

  /**
   * Generate mock table data
   */
  generateMockTable() {
    return {
      headers: ['Product Name', 'Price', 'Stock', 'Category'],
      rows: [
        { 'Product Name': 'Laptop Pro', 'Price': '$1,299.99', 'Stock': '25', 'Category': 'Electronics' },
        { 'Product Name': 'Wireless Mouse', 'Price': '$29.99', 'Stock': '150', 'Category': 'Accessories' },
        { 'Product Name': 'USB-C Cable', 'Price': '$14.99', 'Stock': '300', 'Category': 'Accessories' },
        { 'Product Name': 'Monitor 27"', 'Price': '$399.99', 'Stock': '40', 'Category': 'Electronics' },
        { 'Product Name': 'Keyboard', 'Price': '$89.99', 'Stock': '75', 'Category': 'Accessories' }
      ]
    };
  }

  /**
   * Generate mock form data
   */
  generateMockForm() {
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345',
      subscribe: true
    };
  }

  /**
   * Generate mock list data
   */
  generateMockList(fieldName) {
    return [
      `${fieldName} Item 1`,
      `${fieldName} Item 2`,
      `${fieldName} Item 3`,
      `${fieldName} Item 4`,
      `${fieldName} Item 5`
    ];
  }

  /**
   * Generate mock price
   */
  generateMockPrice() {
    const price = (Math.random() * 10000 + 100).toFixed(2);
    return `$${price.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  /**
   * Generate mock count
   */
  generateMockCount() {
    return Math.floor(Math.random() * 1000) + 100;
  }

  /**
   * Format value for logging
   */
  formatValue(value) {
    if (value === null || value === undefined) return 'null';
    
    if (Array.isArray(value)) {
      return `Array(${value.length} items)`;
    }
    
    if (typeof value === 'object') {
      if (value.headers && value.rows) {
        return `Table(${value.rows.length} rows, ${value.headers.length} columns)`;
      }
      const keys = Object.keys(value);
      return `Object(${keys.length} fields)`;
    }
    
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    
    return String(value);
  }
}

module.exports = new MockDataGenerator();
