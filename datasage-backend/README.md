# DataSage Backend Server

Backend server for the DataSage Chrome Extension. Built with Express.js and Puppeteer to handle web automation, authentication, and data extraction tasks.

## 🚀 Features

- **Puppeteer-based Automation** - Headless (or visible) Chrome browser control
- **Authentication Handling** - Automatic login flows
- **DOM Extraction** - CSS selector and XPath support
- **JavaScript Evaluation** - Run custom code in page context
- **Configurable Timeouts** - Control page load and execution timing
- **Structured Logging** - Detailed execution logs
- **RESTful API** - Simple JSON-based communication

## 📋 Requirements

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

### 1. Install Dependencies

```bash
cd datasage-backend
npm install
```

This will install:
- `express` - Web server framework
- `puppeteer` - Headless browser automation
- `cors` - Cross-origin resource sharing
- `body-parser` - JSON request parsing
- `dotenv` - Environment configuration

### 2. Configure Environment

Copy or edit the `.env` file:

```bash
# .env
PORT=3001
NODE_ENV=development
HEADLESS=true
PUPPETEER_TIMEOUT=30000
LOG_LEVEL=info
```

### 3. Start the Server

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

You should see:

```
╔════════════════════════════════════════════════╗
║        DataSage Backend Server Running         ║
╚════════════════════════════════════════════════╝

🚀 Server: http://localhost:3001
📡 API Endpoint: http://localhost:3001/api/automation
💚 Health Check: http://localhost:3001/health

Ready to receive automation requests from Chrome extension...
```

## 📖 API Documentation

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T17:00:00.000Z"
}
```

### Run Automation

```http
POST /api/automation
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectName": "Dashboard Validator",
  "target": {
    "url": "https://example.com/dashboard"
  },
  "auth": {
    "loginUrl": "https://example.com/login",
    "username": "user@example.com",
    "password": "password123",
    "selectors": {
      "username": "#username",
      "password": "#password",
      "submit": "button[type='submit']"
    }
  },
  "execution": {
    "timeout": 30000,
    "retries": 3,
    "headless": true
  },
  "extraction": [
    {
      "name": "Total Revenue",
      "type": "dom",
      "selector": "div.revenue-widget .total-value",
      "attribute": "textContent"
    },
    {
      "name": "User Count",
      "type": "js",
      "jsCode": "return document.querySelectorAll('.user-item').length;"
    }
  ],
  "outputFormat": "json"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "projectName": "Dashboard Validator",
  "timestamp": "2025-11-08T17:00:00.000Z",
  "duration": "3542ms",
  "data": {
    "Total Revenue": "$125,432",
    "User Count": 342
  },
  "logs": [
    {
      "level": "info",
      "message": "Launching browser...",
      "timestamp": "2025-11-08T17:00:00.000Z"
    },
    {
      "level": "success",
      "message": "Browser launched successfully",
      "timestamp": "2025-11-08T17:00:01.000Z"
    }
  ],
  "screenshots": []
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Navigation timeout exceeded",
  "duration": "30015ms",
  "logs": [
    {
      "level": "error",
      "message": "Navigation timeout exceeded",
      "timestamp": "2025-11-08T17:00:30.000Z"
    }
  ]
}
```

### Get Status

```http
GET /api/status
```

**Response:**
```json
{
  "status": "operational",
  "capabilities": {
    "authentication": true,
    "domExtraction": true,
    "jsEvaluation": true,
    "screenshots": true,
    "formats": ["json", "csv", "xml"]
  },
  "version": "1.0.0"
}
```

## 🏗️ Architecture

### File Structure

```
datasage-backend/
├── server.js                 # Main Express server
├── package.json             # Dependencies
├── .env                     # Configuration
├── routes/
│   └── automation.js        # API endpoints
└── lib/
    ├── puppeteer-runner.js  # Main automation logic
    ├── authentication.js    # Login handler
    ├── extraction.js        # Data extraction utilities
    └── logger.js           # Logging utility
```

### Execution Flow

1. **Receive Request** - API endpoint validates configuration
2. **Launch Browser** - Puppeteer starts Chrome instance
3. **Authenticate** (optional) - Navigate to login and submit credentials
4. **Navigate** - Go to target URL and wait for page load
5. **Extract Data** - Run DOM queries or JavaScript evaluations
6. **Return Results** - Send extracted data with logs back to extension
7. **Cleanup** - Close browser and free resources

## 🔍 Configuration Options

### Target Configuration

```javascript
{
  "target": {
    "url": "https://example.com/page"  // Required: URL to scrape
  }
}
```

### Authentication

```javascript
{
  "auth": {
    "loginUrl": "https://example.com/login",  // Login page URL
    "username": "user@example.com",           // Username or email
    "password": "password123",                // Password
    "selectors": {                           // Optional selectors
      "username": "#username",               // Default: #username
      "password": "#password",               // Default: #password
      "submit": "button[type='submit']"      // Default: button[type='submit']
    }
  }
}
```

### Execution Settings

```javascript
{
  "execution": {
    "timeout": 30000,    // Page load timeout in ms (default: 30000)
    "retries": 3,        // Retry attempts on failure (default: 3)
    "headless": true     // Run browser in headless mode (default: true)
  }
}
```

### Extraction Rules

#### DOM Extraction

```javascript
{
  "name": "Field Name",
  "type": "dom",
  "selector": ".my-element",     // CSS selector or XPath
  "attribute": "textContent"     // Attribute to extract
}
```

**Supported Attributes:**
- `textContent` - Text content of element
- `innerText` - Inner text (visible text only)
- `innerHTML` - HTML content
- `href` - Link URL
- `src` - Image/script source
- `value` - Form input value
- Any custom HTML attribute

#### JavaScript Evaluation

```javascript
{
  "name": "Field Name",
  "type": "js",
  "jsCode": "return document.querySelectorAll('.item').length;"
}
```

**Examples:**

```javascript
// Count elements
"jsCode": "return document.querySelectorAll('.product').length;"

// Extract array of data
"jsCode": "return Array.from(document.querySelectorAll('.item')).map(el => el.textContent);"

// Complex object
"jsCode": `
  return {
    title: document.title,
    url: window.location.href,
    itemCount: document.querySelectorAll('.item').length
  };
`
```

## 🛠️ Development

### Run in Development Mode

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `HEADLESS` | true | Run browser in headless mode |
| `PUPPETEER_TIMEOUT` | 30000 | Default timeout (ms) |
| `LOG_LEVEL` | info | Logging level (error/warn/info/debug) |

### Logging

The server uses a custom logger with colored output:

```javascript
logger.info('Information message');    // Cyan
logger.warn('Warning message');        // Yellow
logger.error('Error message');         // Red
logger.debug('Debug message');         // Gray
```

## 🔍 Troubleshooting

### Puppeteer Installation Issues

If Puppeteer fails to download Chromium:

```bash
# Set custom download path
export PUPPETEER_DOWNLOAD_PATH=/path/to/custom/dir

# Or skip download and use system Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### Port Already in Use

Change the port in `.env`:

```bash
PORT=3002
```

### Memory Issues

For large-scale scraping, increase Node.js memory:

```bash
node --max-old-space-size=4096 server.js
```

### Headless Mode Issues

Some websites block headless browsers. Try:

```javascript
// In .env
HEADLESS=false
```

Or add browser arguments in `puppeteer-runner.js`:

```javascript
args: [
  '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
]
```

## 📊 Performance Tips

1. **Use Headless Mode** - Faster execution without UI rendering
2. **Adjust Timeouts** - Lower timeouts for faster failures
3. **Minimize Wait Times** - Use specific selectors instead of arbitrary delays
4. **Reuse Browser Instances** - For multiple requests (not implemented yet)
5. **Limit DOM Queries** - Extract multiple values in single JS evaluation

## 🔐 Security Considerations

- **Local Only** - Server should only be accessible on localhost
- **No Authentication** - API has no auth layer (assumes local use)
- **Input Validation** - Basic validation is implemented
- **Credential Handling** - Passwords received via HTTPS only (Chrome extension)

## 🚀 Production Deployment

For production use:

1. **Set Environment**:
   ```bash
   NODE_ENV=production
   ```

2. **Use Process Manager**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name datasage-backend
   ```

3. **Add SSL** (if needed):
   - Use nginx/Apache as reverse proxy
   - Configure HTTPS certificates

4. **Monitor Logs**:
   ```bash
   pm2 logs datasage-backend
   ```

## 📝 API Client Examples

### cURL

```bash
curl -X POST http://localhost:3001/api/automation \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test",
    "target": {"url": "https://example.com"},
    "extraction": [
      {"name": "Title", "type": "dom", "selector": "h1", "attribute": "textContent"}
    ]
  }'
```

### JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3001/api/automation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectName: 'Test',
    target: { url: 'https://example.com' },
    extraction: [
      { name: 'Title', type: 'dom', selector: 'h1', attribute: 'textContent' }
    ]
  })
});

const result = await response.json();
console.log(result.data);
```

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- [ ] Browser instance pooling/reuse
- [ ] Screenshot capture
- [ ] CSV/XML export formatting
- [ ] Retry logic with exponential backoff
- [ ] Rate limiting
- [ ] Authentication token caching
- [ ] Proxy support
- [ ] Custom Puppeteer launch options via config

## 📄 License

MIT License - See LICENSE file for details

---

**Made with ❤️ by the DataSage Team**
