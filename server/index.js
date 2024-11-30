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

const sendStatus = (type, appName, data = {}) => {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify({
      type,
      appName,
      ...data
    }));
  }
};

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

// Function to download file via HTTP/HTTPS (for apps)
const downloadFile = async (url, destination, appName) => {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  const totalLength = parseInt(response.headers['content-length'], 10);
  let downloadedLength = 0;

  response.data.on('data', (chunk) => {
    downloadedLength += chunk.length;
    const progress = Math.min((downloadedLength / totalLength) * 100, 100);
    sendStatus('status', appName, {
      status: 'downloading',
      message: `Downloading ${appName}`,
      progress: Math.round(progress)
    });
  });

  const writer = fs.createWriteStream(destination);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// Add this new function to search for executable
const findExecutable = (directory, exeName) => {
  let result = null;
  
  const searchInDir = (dir) => {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        searchInDir(fullPath);
      } else if (file.toLowerCase() === exeName.toLowerCase()) {
        result = fullPath;
        return;
      }
    }
  };

  try {
    searchInDir(directory);
  } catch (error) {
    console.error('Error searching for executable:', error);
  }

  return result;
};

// Add this function to launch the application
const launchApplication = (appDir, executablePath, appName) => {
  // First try the specified path
  const fullExePath = path.join(appDir, executablePath.replace(/^\\/, ''));
  
  if (fs.existsSync(fullExePath)) {
    // Use the specified path if it exists
    exec(`"${fullExePath}"`, (error) => {
      if (error) {
        console.error('Error running executable:', error);
        sendStatus('error', appName, { message: 'Failed to run executable' });
      }
    });
  } else {
    // If specified path doesn't exist, search for the executable
    const exeName = path.basename(executablePath);
    const foundExePath = findExecutable(appDir, exeName);
    
    if (foundExePath) {
      exec(`"${foundExePath}"`, (error) => {
        if (error) {
          console.error('Error running executable:', error);
          sendStatus('error', appName, { message: 'Failed to run executable' });
        }
      });
    } else {
      sendStatus('error', appName, { 
        message: `Could not find executable: ${exeName}`
      });
    }
  }
};

app.post('/download', async (req, res) => {
  const { type, source, url, appName, executablePath, paths, dlc } = req.body;
  
  try {
    if (type === 'rclone') {
      // Handle rclone downloads
      await executeRclone(source, path.join(DOWNLOAD_DIR, paths.install));

      // Download DLC if available
      if (dlc && dlc.length > 0) {
        for (const dlcItem of dlc) {
          await executeRclone(
            dlcItem.source,
            path.join(DOWNLOAD_DIR, paths.install, 'DLC', dlcItem.id)
          );
        }
      }

      // Launch the game using the new launch function
      const gameDir = path.join(DOWNLOAD_DIR, paths.install);
      launchApplication(gameDir, paths.executable, appName);

      res.json({ success: true });
    } else {
      // Handle regular app downloads
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

      // Launch the application using the new launch function
      launchApplication(appDir, executablePath, appName);

      res.json({ success: true });
    }
  } catch (error) {
    console.error('Server error:', error);
    sendStatus('error', appName, { message: error.message });
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