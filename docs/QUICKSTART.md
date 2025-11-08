# DataSage - Quick Start Guide

Get DataSage up and running in 5 minutes!

## 📋 Prerequisites

- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- Google Chrome browser
- Terminal/Command Line access

## 🚀 Installation Steps

### Step 1: Start the Backend Server (2 minutes)

```bash
# Open terminal and navigate to backend folder
cd /Users/abdinasir/Documents/datasage/datasage-backend

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

✅ **Success Check**: You should see:
```
╔════════════════════════════════════════════════╗
║        DataSage Backend Server Running         ║
╚════════════════════════════════════════════════╝

🚀 Server: http://localhost:3001
```

Leave this terminal window open!

### Step 2: Load Chrome Extension (2 minutes)

1. Open Google Chrome
2. Type in address bar: `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Navigate to and select: `/Users/abdinasir/Documents/datasage/datasage-extension`
6. Click **"Select"**

✅ **Success Check**: You should see the DataSage extension card with a robot icon.

### Step 3: Pin the Extension (30 seconds)

1. Click the puzzle icon 🧩 in Chrome toolbar
2. Find "DataSage" in the list
3. Click the pin 📌 icon next to it

✅ **Success Check**: DataSage icon now visible in Chrome toolbar.

## 🎯 Run Your First Automation

### Test with Example.com (2 minutes)

1. **Click the DataSage icon** in your Chrome toolbar
2. **Fill in the form**:
   - Project Name: `My First Test`
   - Target URL: `https://example.com`
3. **Add an extraction rule**:
   - Click "Add DOM Query"
   - Data Point Name: `Page Title`
   - CSS Selector: `h1`
   - Attribute: `textContent` (already selected)
4. **Click "Run Automation"**

✅ **Success Check**: You should see:
- Status changes to "Running automation..."
- After a few seconds: "Automation completed successfully ✓"
- Results section shows: `{ "Page Title": "Example Domain" }`

## 🎓 Next Steps

### Try a Real Website

1. Go to any public website (e.g., a news site, product page)
2. Open Chrome DevTools (F12 or right-click → Inspect)
3. Use the element selector to find CSS selectors
4. Add those selectors as extraction rules in DataSage
5. Run automation!

### Example: Extract Multiple Items

Try extracting a list of items:

1. Target URL: `https://news.ycombinator.com`
2. Add JS Evaluation rule:
   - Name: `Top Stories`
   - Code:
   ```javascript
   return Array.from(document.querySelectorAll('.titleline > a'))
     .slice(0, 5)
     .map(a => a.textContent);
   ```
3. Run automation
4. See array of top 5 story titles!

## 🔧 Troubleshooting

### "Cannot connect to backend server"

**Solution**: Make sure the backend server is running!
```bash
cd /Users/abdinasir/Documents/datasage/datasage-backend
npm start
```

### "Data extraction returned null"

**Solutions**:
- Check your CSS selector is correct (use Chrome DevTools)
- Make sure the page has fully loaded (increase timeout in Advanced Settings)
- Check execution logs for details

### Backend shows errors

**Solution**: Install dependencies again:
```bash
cd /Users/abdinasir/Documents/datasage/datasage-backend
rm -rf node_modules
npm install
```

## 💡 Tips & Tricks

### Finding Good Selectors

1. Open Chrome DevTools (F12)
2. Click the element selector icon (top-left of DevTools)
3. Click the element you want to extract
4. In the Elements tab, right-click the highlighted element
5. Copy → Copy selector

### Testing Selectors

Use the "Test Selector" button (🧪) next to selector inputs to validate before running full automation.

### Saving Time

DataSage automatically saves your configuration. When you reopen the extension, your last settings are still there!

### Running in Background

To see the browser in action:
1. Open Advanced Execution Settings
2. Uncheck "Run in Headless Mode"
3. Watch the browser automate!

## 📚 Learn More

- [Full Documentation](./README.md)
- [Extension Guide](./datasage-extension/README.md)
- [Backend API Reference](./datasage-backend/README.md)

## 🆘 Need Help?

Common issues and solutions:

| Problem | Solution |
|---------|----------|
| Port 3001 already in use | Change PORT in `.env` file |
| Puppeteer won't install | Run `npm install puppeteer --unsafe-perm=true` |
| Extension won't load | Check all files exist, enable Developer Mode |
| Slow extraction | Reduce timeout or enable headless mode |

## ✅ Verification Checklist

Before reporting issues, check:

- [ ] Node.js version 14+ installed (`node --version`)
- [ ] Backend server is running (terminal shows "Server Running")
- [ ] Chrome extension is loaded (visible in `chrome://extensions`)
- [ ] Extension has access to localhost (check manifest.json permissions)
- [ ] No firewall blocking port 3001

---

**You're all set! Happy automating! 🎉**
