const logger = require('./logger');

/**
 * Data extraction utilities
 */
class Extraction {
  /**
   * Extract data using DOM selector
   */
  async extractDOM(page, rule) {
    try {
      const { selector, attribute = 'textContent' } = rule;
      
      // Wait for element to be present
      await page.waitForSelector(selector, { timeout: 5000 });
      
      // Extract data
      const value = await page.evaluate((sel, attr) => {
        const element = document.querySelector(sel);
        
        if (!element) {
          return null;
        }
        
        // Handle different attribute types
        if (attr === 'textContent') {
          return element.textContent?.trim();
        } else if (attr === 'innerText') {
          return element.innerText?.trim();
        } else if (attr === 'innerHTML') {
          return element.innerHTML?.trim();
        } else {
          return element.getAttribute(attr);
        }
      }, selector, attribute);
      
      return value;
      
    } catch (error) {
      logger.error(`DOM extraction error: ${error.message}`);
      throw new Error(`Could not extract using selector "${rule.selector}": ${error.message}`);
    }
  }

  /**
   * Extract data using DOM selector (multiple elements)
   */
  async extractDOMMultiple(page, rule) {
    try {
      const { selector, attribute = 'textContent' } = rule;
      
      // Wait for elements to be present
      await page.waitForSelector(selector, { timeout: 5000 });
      
      // Extract data from all matching elements
      const values = await page.evaluate((sel, attr) => {
        const elements = document.querySelectorAll(sel);
        
        return Array.from(elements).map(element => {
          if (attr === 'textContent') {
            return element.textContent?.trim();
          } else if (attr === 'innerText') {
            return element.innerText?.trim();
          } else if (attr === 'innerHTML') {
            return element.innerHTML?.trim();
          } else {
            return element.getAttribute(attr);
          }
        });
      }, selector, attribute);
      
      return values;
      
    } catch (error) {
      logger.error(`DOM multiple extraction error: ${error.message}`);
      throw new Error(`Could not extract multiple using selector "${rule.selector}": ${error.message}`);
    }
  }

  /**
   * Extract data using JavaScript evaluation
   */
  async extractJS(page, rule) {
    try {
      const { jsCode } = rule;
      
      // Evaluate JavaScript in page context
      const value = await page.evaluate((code) => {
        try {
          // Wrap code in function if it doesn't have return
          const wrappedCode = code.trim().startsWith('return') 
            ? `(function() { ${code} })()`
            : `(function() { return ${code} })()`;
          
          return eval(wrappedCode);
        } catch (error) {
          throw new Error(`JS evaluation failed: ${error.message}`);
        }
      }, jsCode);
      
      return value;
      
    } catch (error) {
      logger.error(`JS extraction error: ${error.message}`);
      throw new Error(`JavaScript evaluation failed: ${error.message}`);
    }
  }

  /**
   * Extract table data
   */
  async extractTable(page, tableSelector) {
    try {
      await page.waitForSelector(tableSelector, { timeout: 5000 });
      
      const tableData = await page.evaluate((sel) => {
        const table = document.querySelector(sel);
        if (!table) return null;
        
        const headers = Array.from(table.querySelectorAll('thead th, thead td'))
          .map(th => th.textContent.trim());
        
        const rows = Array.from(table.querySelectorAll('tbody tr'))
          .map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'))
              .map(cell => cell.textContent.trim());
            
            const rowData = {};
            headers.forEach((header, index) => {
              rowData[header] = cells[index] || '';
            });
            
            return rowData;
          });
        
        return { headers, rows };
      }, tableSelector);
      
      return tableData;
      
    } catch (error) {
      logger.error(`Table extraction error: ${error.message}`);
      throw new Error(`Could not extract table "${tableSelector}": ${error.message}`);
    }
  }

  /**
   * Extract form data
   */
  async extractForm(page, formSelector) {
    try {
      await page.waitForSelector(formSelector, { timeout: 5000 });
      
      const formData = await page.evaluate((sel) => {
        const form = document.querySelector(sel);
        if (!form) return null;
        
        const data = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
          const name = input.name || input.id;
          if (name) {
            if (input.type === 'checkbox') {
              data[name] = input.checked;
            } else if (input.type === 'radio') {
              if (input.checked) {
                data[name] = input.value;
              }
            } else {
              data[name] = input.value;
            }
          }
        });
        
        return data;
      }, formSelector);
      
      return formData;
      
    } catch (error) {
      logger.error(`Form extraction error: ${error.message}`);
      throw new Error(`Could not extract form "${formSelector}": ${error.message}`);
    }
  }
}

module.exports = new Extraction();
