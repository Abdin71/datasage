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
      const { selector, selectorType = 'css', attribute = 'textContent' } = rule;
      
      if (selectorType === 'xpath') {
        return await this.extractXPath(page, rule);
      }
      
      // Wait for element to be present
      await page.waitForSelector(selector, { timeout: 10000 });
      
      // Wait a bit more for content to load
      await page.waitForTimeout(1000);
      
      // Extract data with retry for empty content
      let value = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && (value === null || value === '')) {
        if (attempts > 0) {
          await page.waitForTimeout(2000); // Wait before retry
        }
        
        value = await page.evaluate((sel, attr) => {
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
          } else if (attr === 'count') {
            // Count all elements matching the selector
            return document.querySelectorAll(sel).length;
          } else {
            return element.getAttribute(attr);
          }
        }, selector, attribute);
        
        attempts++;
      }
      
      return value;
      
    } catch (error) {
      logger.error(`DOM extraction error: ${error.message}`);
      throw new Error(`Could not extract using selector "${rule.selector}": ${error.message}`);
    }
  }

  /**
   * Extract data using XPath selector
   */
  async extractXPath(page, rule) {
    try {
      const { selector, attribute = 'textContent' } = rule;
      
      // Wait for element to exist and have content (retry up to 3 times)
      let value = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && (value === null || value === '')) {
        if (attempts > 0) {
          await page.waitForTimeout(2000); // Wait before retry
        }
        
        // Extract data using XPath
        value = await page.evaluate((xpath, attr) => {
          const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          );
          
          const element = result.singleNodeValue;
          
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
          } else if (attr === 'count') {
            // Count all elements matching the XPath
            const countResult = document.evaluate(
              xpath,
              document,
              null,
              XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
              null
            );
            return countResult.snapshotLength;
          } else {
            return element.getAttribute(attr);
          }
        }, selector, attribute);
        
        attempts++;
      }
      
      return value;
      
    } catch (error) {
      logger.error(`XPath extraction error: ${error.message}`);
      throw new Error(`Could not extract using XPath "${rule.selector}": ${error.message}`);
    }
  }

  /**
   * Extract data using DOM selector (multiple elements)
   */
  async extractDOMMultiple(page, rule) {
    try {
      const { selector, selectorType = 'css', attribute = 'textContent' } = rule;
      
      if (selectorType === 'xpath') {
        return await this.extractXPathMultiple(page, rule);
      }
      
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
   * Extract data using XPath selector (multiple elements)
   */
  async extractXPathMultiple(page, rule) {
    try {
      const { selector, attribute = 'textContent' } = rule;
      
      // Extract data from all matching elements using XPath
      const values = await page.evaluate((xpath, attr) => {
        const result = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        
        const elements = [];
        for (let i = 0; i < result.snapshotLength; i++) {
          elements.push(result.snapshotItem(i));
        }
        
        return elements.map(element => {
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
      logger.error(`XPath multiple extraction error: ${error.message}`);
      throw new Error(`Could not extract multiple using XPath "${rule.selector}": ${error.message}`);
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
        
        // Try to get headers from thead, otherwise use first row
        let headers = [];
        const theadHeaders = table.querySelectorAll('thead th, thead td');
        
        if (theadHeaders.length > 0) {
          headers = Array.from(theadHeaders).map(th => th.textContent.trim());
        } else {
          // No thead, try first row as headers
          const firstRow = table.querySelector('tr');
          if (firstRow) {
            const cells = firstRow.querySelectorAll('th, td');
            headers = Array.from(cells).map(cell => cell.textContent.trim());
          }
        }
        
        // If still no headers, generate column names
        if (headers.length === 0) {
          const firstRow = table.querySelector('tr');
          if (firstRow) {
            const cellCount = firstRow.querySelectorAll('th, td').length;
            headers = Array.from({ length: cellCount }, (_, i) => `Column${i + 1}`);
          }
        }
        
        // Get data rows (skip header row if it was used as header)
        const rowSelector = theadHeaders.length > 0 ? 'tbody tr' : 'tr:not(:first-child)';
        const rows = Array.from(table.querySelectorAll(rowSelector))
          .map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'))
              .map(cell => cell.textContent.trim());
            
            const rowData = {};
            headers.forEach((header, index) => {
              rowData[header] = cells[index] || '';
            });
            
            return rowData;
          })
          .filter(row => Object.values(row).some(val => val !== '')); // Remove empty rows
        
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
