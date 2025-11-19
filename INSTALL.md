# Installation Guide

This guide covers installation and setup for both the Chrome extension and the backend server.

## Prerequisites

- **Node.js**: Version 14 or higher ([Download](https://nodejs.org/))
- **Google Chrome**: Latest version
- **Git** (optional): For cloning the repository

## Installation Steps

### 1. Download DataSage

**Option A: Clone Repository**
```bash
git clone <repository-url>
cd datasage
```

**Option B: Download ZIP**

Download and extract the ZIP file from the releases page.

### 2. Install Backend Server

Navigate to the backend directory and install dependencies:

```bash
cd datasage-backend
npm install
```

### 3. Start Backend Server

Start the server on port 3001:

```bash
npm start
```

You should see:
```
✓ Backend server running on http://localhost:3001
```

**Keep this terminal window open** while using DataSage.

### 4. Load Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `datasage-extension` folder
5. The DataSage extension icon should appear in your toolbar

## Verification

### Test Backend Server

Visit `http://localhost:3001/health` in your browser. You should see:
```json
{"status":"ok"}
```

### Test Extension

1. Click the DataSage extension icon
2. You should see "Backend: Connected ✓"
3. If not, ensure the backend server is running

## Configuration

### Backend Port (Optional)

To change the default port (3001), edit `datasage-backend/index.js`:

```javascript
const PORT = process.env.PORT || 3001;
```

And update `datasage-extension/popup.js`:

```javascript
const BACKEND_URL = 'http://localhost:3001';
```

## Troubleshooting

### Backend Connection Failed

- Verify backend server is running: `http://localhost:3001/health`
- Check for port conflicts (another app using port 3001)
- Ensure firewall allows localhost connections

### Extension Not Loading

- Confirm Chrome Developer mode is enabled
- Check for manifest errors in `chrome://extensions/`
- Reload the extension after code changes

### Automation Errors

- Open Chrome DevTools (F12) while extension is open
- Check Console tab for error messages
- Enable Debug mode in `popup.js` for detailed logs

## Uninstallation

### Remove Extension

1. Go to `chrome://extensions/`
2. Find DataSage
3. Click **Remove**

### Stop Backend Server

Press `Ctrl+C` in the terminal running the backend server.

### Delete Files

Remove the datasage directory:

```bash
rm -rf datasage
```

## Next Steps

- Read the [README](README.md) for usage instructions
- Review [TERMS.md](TERMS.md) and [PRIVACY.md](PRIVACY.md)
- Check [CHANGELOG.md](CHANGELOG.md) for version history

## Support

For issues or questions, please open an issue on the GitHub repository.
