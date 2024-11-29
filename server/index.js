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

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

let wsConnection = null;
const wss = new WebSocket.Server({ port: 3002 });
wss.on('connection', (ws) => {
  wsConnection = ws;
});

// Update the status handling in server/index.js
const sendStatus = (type, appName, data = {}) => {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify({
      type,
      appName,
      ...data
    }));
  }
};

app.post('/download', async (req, res) => {
  const { url, appName, executablePath } = req.body;
  const appDir = path.join(DOWNLOAD_DIR, appName);
  
  try {
    // Check if executable exists
    if (executablePath) {
      const fullExePath = path.join(appDir, executablePath.replace(/^\\/, ''));
      if (fs.existsSync(fullExePath)) {
        console.log(`${appName} already exists, launching...`);
        sendStatus('status', appName, { 
          status: 'launching',
          message: `Launching ${appName}...`
        });

        exec(`"${fullExePath}"`, (error) => {
          if (error) {
            console.error('Error running executable:', error);
            sendStatus('error', appName, { 
              message: 'Failed to run executable'
            });
            throw new Error('Failed to run executable');
          }
        });

        return res.json({ 
          success: true, 
          message: `${appName} is already installed`,
          alreadyExists: true
        });
      }
    }

    // Start download
    sendStatus('status', appName, { 
      status: 'downloading',
      message: `Downloading ${appName}`,
      progress: 0
    });

    // Create directory and start download
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const totalLength = parseInt(response.headers['content-length'], 10) || 0;
    let downloadedLength = 0;
    const fileName = url.split('/').pop();
    const filePath = path.join(appDir, fileName);
    const writer = fs.createWriteStream(filePath);

    response.data.on('data', (chunk) => {
      downloadedLength += chunk.length;
      const progress = Math.min((downloadedLength / totalLength) * 100, 100);
      sendStatus('status', appName, {
        status: 'downloading',
        message: `Downloading ${appName}`,
        progress: Math.round(progress)
      });
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    sendStatus('status', appName, {
      status: 'download_complete',
      message: 'Download completed!',
      progress: 100
    });

    // Handle different file types
    if (fileName.endsWith('.zip')) {
      sendStatus('status', appName, {
        status: 'preparing',
        message: 'Preparing to extract...'
      });

      try {
        let totalFiles = 0;
        await extract(filePath, { 
          dir: appDir,
          onEntry: () => totalFiles++
        });

        let extractedFiles = 0;
        await extract(filePath, { 
          dir: appDir,
          onEntry: () => {
            extractedFiles++;
            const progress = (extractedFiles / totalFiles) * 100;
            sendStatus('status', appName, {
              status: 'extracting',
              message: 'Extracting files...',
              progress: Math.round(progress)
            });
          }
        });

        fs.unlinkSync(filePath);
        
        sendStatus('status', appName, {
          status: 'launching',
          message: `Launching ${appName}...`
        });

        // Launch the extracted app
        const fullExePath = path.join(appDir, executablePath.replace(/^\\/, ''));
        exec(`"${fullExePath}"`, (error) => {
          if (error) {
            console.error('Error running executable:', error);
            sendStatus('error', appName, { 
              message: 'Failed to run executable'
            });
          }
        });
      } catch (error) {
        throw new Error('Failed to extract or run application');
      }
    } else if (fileName.endsWith('.exe')) {
      sendStatus('status', appName, {
        status: 'launching',
        message: `Launching ${appName}...`
      });

      exec(`"${filePath}"`, (error) => {
        if (error) {
          console.error('Error running executable:', error);
          sendStatus('error', appName, { 
            message: 'Failed to run executable'
          });
        }
      });
    }

    res.json({ success: true, message: 'Operation completed successfully' });
  } catch (error) {
    console.error('Server error:', error);
    sendStatus('error', appName, { 
      message: error.message || 'An unknown error occurred'
    });
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Download directory: ${DOWNLOAD_DIR}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit();
});