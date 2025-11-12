const logger = require('./logger');

/**
 * Data formatting utilities for different output formats
 */
class Formatter {
  /**
   * Format data based on specified format
   */
  format(data, format = 'json') {
    switch (format.toLowerCase()) {
      case 'csv':
        return this.toCSV(data);
      case 'xml':
        return this.toXML(data);
      case 'json':
      default:
        return this.toJSON(data);
    }
  }

  /**
   * Convert to JSON string
   */
  toJSON(data) {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      logger.error(`JSON formatting error: ${error.message}`);
      throw new Error('Failed to format data as JSON');
    }
  }

  /**
   * Convert to CSV format
   */
  toCSV(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Data must be an object for CSV conversion');
      }

      // Handle empty data
      if (Object.keys(data).length === 0) {
        return '';
      }

      // Check if data contains arrays (multiple rows)
      const hasArrays = Object.values(data).some(value => Array.isArray(value));

      if (hasArrays) {
        return this.toCSVMultiRow(data);
      } else {
        return this.toCSVSingleRow(data);
      }
    } catch (error) {
      logger.error(`CSV formatting error: ${error.message}`);
      throw new Error('Failed to format data as CSV');
    }
  }

  /**
   * Convert single row data to CSV
   */
  toCSVSingleRow(data) {
    const headers = Object.keys(data);
    const values = Object.values(data).map(value => this.escapeCSV(value));
    
    return `${headers.join(',')}\n${values.join(',')}`;
  }

  /**
   * Convert multi-row data to CSV
   */
  toCSVMultiRow(data) {
    // Find the longest array to determine number of rows
    let maxLength = 1;
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length > maxLength) {
        maxLength = value.length;
      }
    }

    const headers = Object.keys(data);
    let csv = headers.join(',') + '\n';

    // Create rows
    for (let i = 0; i < maxLength; i++) {
      const row = headers.map(header => {
        const value = data[header];
        if (Array.isArray(value)) {
          return this.escapeCSV(value[i]);
        } else {
          return i === 0 ? this.escapeCSV(value) : '';
        }
      });
      csv += row.join(',') + '\n';
    }

    return csv.trim();
  }

  /**
   * Escape CSV special characters
   */
  escapeCSV(value) {
    if (value === null || value === undefined) {
      return '';
    }

    const str = String(value);
    
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    
    return str;
  }

  /**
   * Convert to XML format
   */
  toXML(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Data must be an object for XML conversion');
      }

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<data>\n';
      
      for (const [key, value] of Object.entries(data)) {
        xml += this.toXMLElement(key, value, 1);
      }
      
      xml += '</data>';
      
      return xml;
    } catch (error) {
      logger.error(`XML formatting error: ${error.message}`);
      throw new Error('Failed to format data as XML');
    }
  }

  /**
   * Convert a single element to XML
   */
  toXMLElement(key, value, indent = 0) {
    const spaces = '  '.repeat(indent);
    const safeKey = this.sanitizeXMLTag(key);
    
    if (value === null || value === undefined) {
      return `${spaces}<${safeKey} />\n`;
    }
    
    if (Array.isArray(value)) {
      let xml = `${spaces}<${safeKey}>\n`;
      value.forEach((item, index) => {
        xml += this.toXMLElement('item', item, indent + 1);
      });
      xml += `${spaces}</${safeKey}>\n`;
      return xml;
    }
    
    if (typeof value === 'object') {
      let xml = `${spaces}<${safeKey}>\n`;
      for (const [k, v] of Object.entries(value)) {
        xml += this.toXMLElement(k, v, indent + 1);
      }
      xml += `${spaces}</${safeKey}>\n`;
      return xml;
    }
    
    const escapedValue = this.escapeXML(String(value));
    return `${spaces}<${safeKey}>${escapedValue}</${safeKey}>\n`;
  }

  /**
   * Sanitize XML tag names
   */
  sanitizeXMLTag(tag) {
    // Replace spaces and special chars with underscores
    return tag.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^[^a-zA-Z_]/, '_');
  }

  /**
   * Escape XML special characters
   */
  escapeXML(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Get content type for format
   */
  getContentType(format) {
    const contentTypes = {
      json: 'application/json',
      csv: 'text/csv',
      xml: 'application/xml'
    };
    return contentTypes[format.toLowerCase()] || 'application/json';
  }

  /**
   * Get file extension for format
   */
  getFileExtension(format) {
    return format.toLowerCase();
  }
}

module.exports = new Formatter();
