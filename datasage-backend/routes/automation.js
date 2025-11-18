const express = require('express');
const router = express.Router();
const puppeteerRunner = require('../lib/puppeteer-runner');
const formatter = require('../lib/formatter');
const validator = require('../lib/validator');
const logger = require('../lib/logger');

/**
 * POST /api/automation
 * Main endpoint for running web automation
 */
router.post('/automation', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const config = req.body;
    
    // Validate configuration
    const validation = validator.validateConfig(config);
    
    if (!validation.valid) {
      logger.warn('Validation failed:', validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Configuration validation failed',
        errors: validation.errors
      });
    }
    
    logger.info(`Starting automation for project: ${config.projectName || 'Unnamed'}`);
    logger.info(`Target URL: ${config.target.url}`);
    
    // Run automation
    const result = await puppeteerRunner.run(config);
    
    const duration = Date.now() - startTime;
    logger.info(`Automation completed in ${duration}ms`);
    
    // Get output format (default to json)
    const outputFormat = (config.outputFormat || 'json').toLowerCase();
    
    // Format the data based on requested format
    const formattedData = formatter.format(result.data, outputFormat);
    const extension = formatter.getFileExtension(outputFormat);
    
    // Prepare response data (always return JSON with formatted content)
    const responseData = {
      success: true,
      projectName: config.projectName,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      outputFormat: outputFormat,
      formattedData: formattedData, // Include formatted string
      data: result.data, // Keep original data
      logs: result.logs,
      screenshots: result.screenshots || [],
      filename: `${config.projectName || 'data'}.${extension}`
    };
    
    // Always return JSON (extension will handle display/download)
    res.json(responseData);
    
  } catch (error) {
    logger.error(`Automation failed: ${error.message}`);
    
    const duration = Date.now() - startTime;
    
    res.status(500).json({
      success: false,
      message: error.message,
      duration: `${duration}ms`,
      logs: [{
        level: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }]
    });
  }
});

/**
 * GET /api/status
 * Check backend status and capabilities
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    capabilities: {
      authentication: true,
      domExtraction: true,
      jsEvaluation: true,
      screenshots: true,
      formats: ['json', 'csv', 'xml']
    },
    version: '1.0.0'
  });
});

module.exports = router;
