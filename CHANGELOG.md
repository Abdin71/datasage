# Changelog

All notable changes to DataSage will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-19

### Initial Release

#### Added

- Chrome Manifest V3 extension with service worker architecture
- Express.js backend server with Puppeteer automation engine
- Visual selector tool for capturing element XPath/CSS selectors
- Support for multiple output formats (JSON, CSV, XML)
- Preview panels for all output formats with copy-to-clipboard functionality
- Optional download buttons for CSV and XML outputs
- Project management system with create, edit, delete capabilities
- Session state persistence across popup reopening
- Background execution with desktop notifications
- Debug mode for development troubleshooting
- Comprehensive request validation with XPath support
- HTML escaping for safe XML display in preview
- Status state machine (idle → running → complete/error)
- Screenshot capture on automation failure
- Execution logs with timestamps
- Authentication support for login-protected websites
- Production-ready status messages for end users

#### Features

- **Visual Selector**: Click-to-capture XPath for target elements
- **Multi-Format Export**: JSON, CSV, XML with proper character escaping
- **Background Processing**: Automations continue after popup close
- **Project Persistence**: Save and reuse automation configurations
- **Error Handling**: Detailed logs and screenshots on failure
- **Local Processing**: All data processing occurs on user's machine
- **No External Tracking**: Complete privacy, no analytics or telemetry

#### Technical

- Puppeteer headless browser automation
- Chrome Storage API for state persistence
- Formatter module with special character handling
- Validator module with comprehensive input validation
- Background service worker for non-blocking execution
- Notification API for completion alerts

## [Unreleased]

### Planned

- Export automation configurations for sharing
- Batch automation support (multiple URLs)
- Scheduling and periodic execution
- Advanced authentication options (OAuth, API keys)
- Custom JavaScript execution in target pages
- Data transformation pipeline
- Export to database connectors
