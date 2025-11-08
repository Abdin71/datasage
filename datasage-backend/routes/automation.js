const express = require('express');
const router = express.Router();
const puppeteerRunner = require('../lib/puppeteer-runner');
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
    if (!config.target || !config.target.url) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: target.url'
      });
    }
    
    if (!config.extraction || config.extraction.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one extraction rule is required'
      });
    }
    
    logger.info(`Starting automation for project: ${config.projectName || 'Unnamed'}`);
    logger.info(`Target URL: ${config.target.url}`);
    
    // Run automation
    const result = await puppeteerRunner.run(config);
    
    const duration = Date.now() - startTime;
    logger.info(`Automation completed in ${duration}ms`);
    
    // Return results
    res.json({
      success: true,
      projectName: config.projectName,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      data: result.data,
      logs: result.logs,
      screenshots: result.screenshots || []
    });
    
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
