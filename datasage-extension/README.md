# DataSage Chrome Extension

DataSage is a powerful Chrome extension for web automation and data extraction. It connects to a local backend server running Puppeteer to perform advanced web scraping, authentication, and data extraction tasks.

## 🚀 Features

- **Visual Configuration Interface** - Easy-to-use popup interface for configuring automation tasks
- **Authentication Support** - Handle login flows with customizable selectors
- **DOM Extraction** - Extract data using CSS selectors or XPath
- **JavaScript Evaluation** - Run custom JavaScript code to extract complex data
- **Multiple Output Formats** - Export data as JSON, CSV, or XML
- **Execution Logs** - View detailed logs of automation execution
- **Persistent Configuration** - Save and load automation configurations

## 📋 Requirements

- Google Chrome (latest version)
- DataSage Backend Server running on `localhost:3001`

## 🔧 Installation

### 1. Install the Extension

1. Open Google Chrome
2. Navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `datasage-extension` folder
6. The DataSage extension icon should appear in your toolbar

### 2. Pin the Extension (Optional)

1. Click the puzzle icon in Chrome toolbar
2. Find "DataSage" in the list
3. Click the pin icon to keep it visible

## 📖 Usage

### Basic Workflow

1. **Click the DataSage icon** in your Chrome toolbar
2. **Configure your automation**:
   - Enter a project name
   - Specify target URL
   - Add extraction rules (DOM selectors or JS code)
3. **Optional: Set up authentication**
   - Toggle "Requires Authentication"
   - Enter login credentials and selectors
4. **Click "Run Automation"**
5. **View results** in the Results section

### Target Configuration

- **Project Name**: Give your automation a descriptive name
- **Target URL**: The webpage you want to scrape
- **Output Format**: Choose between JSON, CSV, or XML
- **Advanced Settings**:
  - Page Load Timeout (ms)
  - Retry Attempts
  - Headless Mode toggle

### Authentication

If your target website requires login:

1. Enable "Requires Authentication"
2. Enter:
   - Login URL
   - Username/Email
   - Password
   - Selectors for username field, password field, and submit button

### Data Extraction Rules

#### DOM Query

Extract data using CSS selectors:

- **Data Point Name**: Name for the extracted value (e.g., "Total Revenue")
- **CSS Selector**: DOM selector (e.g., `div.revenue-widget .total-value`)
- **Attribute**: Which attribute to extract (textContent, innerHTML, href, etc.)

#### JS Evaluation

Run custom JavaScript code in the page context:

```javascript
// Count all items
return document.querySelectorAll('.item').length;

// Get computed style
return window.getComputedStyle(document.querySelector('.box')).backgroundColor;

// Complex extraction
return Array.from(document.querySelectorAll('.product')).map(p => ({
  name: p.querySelector('.name').textContent,
  price: p.querySelector('.price').textContent
}));
```

## 🎯 Example Configurations

### Example 1: Extract Dashboard Metrics

**Target URL**: `https://admin.example.com/dashboard`

**Extraction Rules**:
- DOM Query: "Total Revenue" → `div.revenue .amount` → textContent
- DOM Query: "User Count" → `span.user-count` → textContent
- DOM Query: "Pending Orders" → `div.orders .pending` → textContent

### Example 2: Scrape Product Listings

**Target URL**: `https://shop.example.com/products`

**Extraction Rules**:
- JS Evaluation: "Product List" →
  ```javascript
  return Array.from(document.querySelectorAll('.product')).map(p => ({
    name: p.querySelector('h3').textContent,
    price: p.querySelector('.price').textContent,
    inStock: p.querySelector('.stock').textContent.includes('In Stock')
  }));
  ```

## 🔍 Troubleshooting

### Extension doesn't appear
- Make sure Developer Mode is enabled in `chrome://extensions`
- Check that all files are present in the extension folder
- Try reloading the extension

### "Cannot connect to backend server"
- Ensure the backend server is running on port 3001
- Check that the server URL in the extension matches your setup
- Try accessing `http://localhost:3001/health` in your browser

### Authentication fails
- Verify your credentials are correct
- Check that the selectors match your login form
- Look at the execution logs for detailed error messages

### Data extraction returns null
- Use browser DevTools to verify your selectors are correct
- Try the "Test Selector" button to validate
- Check execution logs for specific error messages
- Ensure the page has fully loaded before extraction

## 💾 Data Storage

The extension stores your configuration locally in Chrome's storage. Your data includes:
- Project configurations
- Target URLs
- Extraction rules
- Authentication settings (passwords are stored locally only)

## 🔐 Security Notes

- **Passwords are stored locally** in Chrome's storage (not encrypted)
- The extension can only communicate with `localhost:3001`
- All automation runs through the local backend server
- No data is sent to external servers

## 🛠️ Development

### File Structure

```
datasage-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Main UI
├── popup.js          # UI logic & API calls
├── background.js     # Service worker
├── styles.css        # Styling
└── icons/           # Extension icons
```

### Making Changes

1. Edit the files in the extension folder
2. Go to `chrome://extensions`
3. Click the refresh icon on the DataSage extension
4. Click the extension icon to test changes

## 📝 Configuration Format

The extension sends the following JSON structure to the backend:

```json
{
  "projectName": "My Automation",
  "target": {
    "url": "https://example.com/page"
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
      "name": "Item Count",
      "type": "js",
      "jsCode": "return document.querySelectorAll('.item').length;"
    }
  ],
  "outputFormat": "json"
}
```

## 🤝 Support

For issues or questions:
1. Check the execution logs in the extension
2. Check the backend server logs
3. Verify your selectors using Chrome DevTools

## 📄 License

MIT License - See LICENSE file for details

---

**Made with ❤️ by the DataSage Team**
