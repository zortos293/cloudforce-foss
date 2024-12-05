const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const WebSocket = require('ws');
const extract = require('extract-zip');
const { exec } = require('child_process');
const axios = require('axios');

// Check if we're in development mode
const isDev = !app.isPackaged;

// Create Express app
const serverApp = express();
serverApp.use(cors());
serverApp.use(express.json());

// Update the static file serving paths
const getAssetPath = (assetPath) => {
  return isDev 
    ? path.join(__dirname, '..', assetPath)
    : path.join(process.resourcesPath, 'app.asar', assetPath);
};

// Update the static file serving
serverApp.use('/static', express.static(getAssetPath('build/static')));
serverApp.use(express.static(getAssetPath('build')));

// Get app data path for downloads
const DOWNLOAD_DIR = path.join(
  app.getPath('userData'),
  'downloads'
);

console.log('Download directory:', DOWNLOAD_DIR);

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
  try {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating downloads directory:', error);
  }
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

// Function to send status updates via WebSocket
const sendStatus = (type, appName, data) => {
  if (wsConnection) {
    wsConnection.send(JSON.stringify({
      type,
      appName,
      ...data
    }));
  }
};

// Function to download files
const downloadFile = async (url, filePath, appName) => {
  const writer = fs.createWriteStream(filePath);
  
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    const totalLength = response.headers['content-length'];

    response.data.pipe(writer);

    let downloadedLength = 0;
    response.data.on('data', (chunk) => {
      downloadedLength += chunk.length;
      const progress = Math.round((downloadedLength / totalLength) * 100);
      
      sendStatus('status', appName, {
        status: 'downloading',
        message: 'Downloading...',
        progress
      });
    });

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    fs.unlinkSync(filePath); // Clean up partial file
    throw error;
  }
};

// Function to launch applications
const launchApplication = (appDir, executablePath, appName) => {
  try {
    const fullPath = path.join(appDir, executablePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Executable not found: ${fullPath}`);
    }

    sendStatus('status', appName, {
      status: 'launching',
      message: 'Launching application...'
    });

    exec(`"${fullPath}"`, (error) => {
      if (error) {
        console.error(`Error launching ${appName}:`, error);
        sendStatus('error', appName, {
          message: `Failed to launch ${appName}`
        });
      }
    });
  } catch (error) {
    console.error(`Launch error for ${appName}:`, error);
    sendStatus('error', appName, {
      message: error.message
    });
    throw error;
  }
};

// Define your server routes here
serverApp.post('/download', async (req, res) => {
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

// Update the catch-all route
serverApp.get('*', (req, res) => {
  res.sendFile(getAssetPath('build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3001;
serverApp.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Electron app setup
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load from the local server instead of file://
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `http://localhost:${PORT}`);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
