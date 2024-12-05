const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const extract = require('extract-zip');
const { exec } = require('child_process');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const DOWNLOAD_DIR = path.join(__dirname, '../downloads');
console.log('Download directory:', DOWNLOAD_DIR);

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Create WebSocket server on port 3002
let wsConnection = null;
const wss = new WebSocket.Server({ port: 3002 });
wss.on('connection', (ws) => {
  console.log('WebSocket client connected on port 3002');
  wsConnection = ws;
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    if (wsConnection === ws) {
      wsConnection = null;
    }
  });
});

// Function to execute rclone command (for games)
const executeRclone = (source, destination) => {
  return new Promise((resolve, reject) => {
    const rcloneCommand = `rclone copy "${source.remote}:${source.path}" "${destination}" --progress`;
    
    const process = exec(rcloneCommand);
    let lastProgress = 0;

    process.stdout.on('data', (data) => {
      const progressMatch = data.toString().match(/(\d+)%/);
      if (progressMatch) {
        const progress = parseInt(progressMatch[1]);
        if (progress !== lastProgress) {
          lastProgress = progress;
          if (wsConnection) {
            wsConnection.send(JSON.stringify({
              type: 'status',
              status: 'downloading',
              message: `Downloading game files...`,
              progress
            }));
          }
        }
      }
    });

    process.stderr.on('data', (data) => {
      console.error(`Rclone error: ${data}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Rclone process exited with code ${code}`));
      }
    });
  });
};

app.post('/download', async (req, res) => {
  const { url, appName, executablePath } = req.body;
  
  try {
    if (!url) {
      throw new Error('URL is required for app downloads');
    }

    const appDir = path.join(DOWNLOAD_DIR, appName);
    
    // Create directory for the app if it doesn't exist
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    // Get filename from URL or use a default
    const urlParts = url.split('/');
    const fileName = urlParts.length > 0 ? urlParts[urlParts.length - 1] : 'download';
    const filePath = path.join(appDir, fileName);

    // Download the file
    await downloadFile(url, filePath, appName);

    // Handle ZIP files
    if (fileName.endsWith('.zip')) {
      sendStatus('status', appName, {
        status: 'extracting',
        message: 'Extracting files...',
      });

      try {
        await extract(filePath, { dir: appDir });
        fs.unlinkSync(filePath); // Delete ZIP after extraction
      } catch (error) {
        throw new Error('Failed to extract ZIP file');
      }
    }

    // Launch the application
    launchApplication(appDir, executablePath, appName);

    res.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    sendStatus('error', appName, { message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Download directory: ${DOWNLOAD_DIR}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});