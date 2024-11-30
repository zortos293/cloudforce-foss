import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Paper,
  Stack,
  Card,
  CardContent,
  LinearProgress,
  FormControl,
  InputLabel,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  CloudQueue,
  Download,
  Delete,
  Save,
  Refresh,
  Settings as SettingsIcon,
  SportsEsports,
  Apps,
  Brightness4,
  Brightness7,
  CheckCircle,
  ErrorOutline,
  Add,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import SourceManager from './components/SourceManager';
import SettingsDialog from './components/SettingsDialog';
import AppGrid from './components/AppGrid';
import GameGrid from './components/GameGrid';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
`;

const successPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const loadingAnimation = keyframes`
  0% { width: 0%; }
  50% { width: 100%; }
  100% { width: 0%; }
`;

const launchAnimation = keyframes`
  0% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.1) translateY(-5px); }
  100% { transform: scale(1) translateY(0); }
`;

const GlassBox = ({ children, ...props }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        background: theme.palette.mode === 'light' 
          ? 'rgba(255, 255, 255, 0.8)' 
          : 'rgba(18, 18, 18, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: 4,
        border: `1px solid ${
          theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.3)' 
            : 'rgba(255, 255, 255, 0.05)'
        }`,
        transition: 'all 0.3s ease',
        '&:hover': {
          background: theme.palette.mode === 'light' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(28, 28, 28, 0.9)',
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

const GlobalProgress = ({ 
  show, 
  appName, 
  status, 
  message,
  progress,
  error,
  setDownloading
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (status === 'launching') {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
        setDownloading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, setDownloading]);

  if (!show && !showAnimation && !error) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        width: '350px',
      }}
    >
      <GlassBox
        sx={{
          p: 3,
          background: error 
            ? 'rgba(211, 47, 47, 0.9)' 
            : 'rgba(255, 255, 255, 0.15)',
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            {error ? (
              <ErrorOutline sx={{ color: 'white' }} />
            ) : (status === 'launching' || status === 'download_complete') && (
              <CheckCircle
                sx={{
                  color: theme.palette.success.main,
                  animation: showAnimation 
                    ? `${launchAnimation} 1s ease-out`
                    : `${successPulse} 0.5s ease-out`,
                }}
              />
            )}
            <Typography variant="body1" color="white">
              {error ? error : message}
            </Typography>
          </Stack>

          {status === 'downloading' && !error && (
            <Box sx={{ position: 'relative', pt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.secondary.main,
                    borderRadius: 4,
                  }
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: -20,
                  color: 'white',
                }}
              >
                {Math.round(progress)}%
              </Typography>
            </Box>
          )}

          {status === 'extracting' && !error && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <CircularProgress size={24} sx={{ color: 'white' }} />
            </Box>
          )}
        </Stack>
      </GlassBox>
    </Box>
  );
};

function App() {
  const [downloading, setDownloading] = useState(false);
  const [currentApp, setCurrentApp] = useState('');
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    downloadPath: 'B:\\CloudForce\\Loaded',
    language: 'en',
    autoLaunch: true,
  });
  const [mode, setMode] = useState('dark');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('default');
  const [appSources, setAppSources] = useState({});
  const [sourceManagerOpen, setSourceManagerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameSource, setGameSource] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3002');
    
    websocket.onopen = () => {
      console.log('WebSocket Connected');
    };
    
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        
        if (data.type === 'status') {
          setStatus(data.status);
          setStatusMessage(data.message);
          if (data.progress !== undefined) {
            setProgress(data.progress);
          }
          setCurrentApp(data.appName);
          setDownloading(true);
        } else if (data.type === 'error') {
          setError(data.message);
          setDownloading(false);
          setCurrentApp('');
          setStatus(null);
          setStatusMessage('');
          setProgress(0);
          setTimeout(() => setError(null), 3000);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error occurred');
      setDownloading(false);
      setCurrentApp('');
      setStatus(null);
      setStatusMessage('');
      setProgress(0);
      setTimeout(() => setError(null), 3000);
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  useEffect(() => {
    const loadAppSources = async () => {
      setIsLoading(true);
      try {
        // Load default app source from public folder
        const response = await fetch('/app-resources/cloudforce-apps.json');
        const defaultSource = await response.json();
        
        // Load additional sources from localStorage
        const additionalSources = JSON.parse(localStorage.getItem('additionalAppSources') || '{}');
        
        setAppSources({
          default: defaultSource,
          ...additionalSources
        });
      } catch (error) {
        console.error('Error loading app sources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppSources();
  }, []);

  useEffect(() => {
    const loadGameSource = async () => {
      try {
        const response = await fetch('/app-resources/cloudforce-games.json');
        const data = await response.json();
        setGameSource(data);
      } catch (error) {
        console.error('Error loading games:', error);
      }
    };

    loadGameSource();
  }, []);

  const handleDownload = async (app) => {
    try {
      // Reset all states at the start of download
      setDownloading(true);
      setCurrentApp(app.name);
      setStatus(null);
      setStatusMessage('');
      setProgress(0);
      setError(null);
      setFileType(null);
      
      // Get the URL from the source object
      const url = app.source?.url;
      if (!url) {
        throw new Error('No download URL provided for this app');
      }
      
      const response = await fetch(`${API_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,  // Use the URL from source
          appName: app.name,
          executablePath: app.paths.executable,  // Use paths.executable
          paths: app.paths  // Send all paths
        }),
      });

      if (!response.ok) throw new Error('Download failed');

      const data = await response.json();
      
      // Only reset downloading state if it's not a ZIP file that needs extraction
      if (!data.needsExtraction) {
        setTimeout(() => {
          setDownloading(false);
          setCurrentApp('');
          setStatus(null);
          setStatusMessage('');
          setProgress(0);
          setError(null);
          setFileType(null);
        }, 3000); // Give time for the launch message to show
      }
    } catch (error) {
      console.error('Download error:', error);
      setError(`Failed to download ${app.name}: ${error.message}`);
      // Reset all states on error
      setDownloading(false);
      setCurrentApp('');
      setStatus(null);
      setStatusMessage('');
      setProgress(0);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleSettingsSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('cloudforce_settings', JSON.stringify(settings));
    handleSettingsClose();
  };

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useTheme();

  const groupedApps = useMemo(() => {
    const currentSource = appSources[selectedSource];
    if (!currentSource?.apps) return {};

    return currentSource.apps.reduce((acc, app) => {
      if (!acc[app.category]) {
        acc[app.category] = [];
      }
      acc[app.category].push(app);
      return acc;
    }, {});
  }, [appSources, selectedSource]);

  const handleGameDownload = async (game) => {
    try {
      setDownloading(true);
      setCurrentApp(game.name);
      setStatus('preparing');
      setStatusMessage(`Preparing to download ${game.name}...`);
      setProgress(0);
      setError(null);
      
      const response = await fetch(`${API_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'rclone',
          source: game.source,
          appName: game.name,
          paths: game.paths,
          dlc: game.dlc // Include DLC information if selected
        }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const data = await response.json();
      
      // Show success message
      setStatus('launching');
      setStatusMessage(`${game.name} downloaded successfully!`);
      
      setTimeout(() => {
        setDownloading(false);
        setCurrentApp('');
        setStatus(null);
        setStatusMessage('');
        setProgress(0);
      }, 3000);
    } catch (error) {
      console.error('Download error:', error);
      setError(`Failed to download ${game.name}: ${error.message}`);
      setDownloading(false);
      setCurrentApp('');
      setStatus(null);
      setStatusMessage('');
      setProgress(0);
      setTimeout(() => setError(null), 3000);
    }
  };

  const filteredApps = useMemo(() => {
    const currentSource = appSources[selectedSource];
    if (!currentSource?.apps) return [];

    let filtered = [...currentSource.apps];

    if (selectedCategory) {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(query) ||
        app.description?.toLowerCase().includes(query) ||
        app.features?.some(feature => feature.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [appSources, selectedSource, selectedCategory, searchQuery]);

  const filteredGames = useMemo(() => {
    if (!gameSource?.games) return [];

    let filtered = [...gameSource.games];

    if (selectedCategory) {
      filtered = filtered.filter(game => game.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(query) ||
        game.description?.toLowerCase().includes(query) ||
        game.features?.some(feature => feature.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [gameSource, selectedCategory, searchQuery]);

  const handleSourcesUpdate = (type, newSources) => {
    if (type === 'apps') {
      setAppSources(newSources);
    } else {
      setGameSource(newSources);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        categories={activeTab === 0 ? appSources[selectedSource]?.categories : gameSource?.categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        appSources={appSources}
        gameSource={gameSource}
        selectedSource={selectedSource}
        onSourceSelect={setSelectedSource}
        activeTab={activeTab}
        onTabChange={(e, newValue) => {
          setActiveTab(newValue);
          setSelectedCategory(null);  // Reset category when switching tabs
          setSearchQuery('');  // Reset search when switching tabs
          setSelectedSource('default');  // Reset to default source when switching tabs
        }}
      />
      <Box 
        sx={{ 
          flexGrow: 1,
          minHeight: '100vh',
          paddingLeft: '280px', // Width of the sidebar
          paddingTop: '64px', // Height of the header
          background: theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)'
            : 'linear-gradient(135deg, #0f0f0f 0%, #171717 100%)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: '280px', // Width of the sidebar
            right: 0,
            height: '64px',
            zIndex: 1200,
            background: 'rgba(18, 18, 18, 0.8)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Container maxWidth="lg">
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center" 
              py={2}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CloudQueue sx={{ 
                  fontSize: 35, 
                  color: theme.palette.secondary.main,
                  filter: 'drop-shadow(0 0 10px rgba(255, 105, 180, 0.5))'
                }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '0 0 10px rgba(255, 105, 180, 0.3)'
                  }}
                >
                  CLOUDFORCE
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Tabs 
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      color: 'rgba(255,255,255,0.7)',
                      minWidth: 120,
                    }
                  }}
                >
                  <Tab 
                    icon={<Apps />} 
                    label="Apps" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<SportsEsports />} 
                    label="Games" 
                    iconPosition="start"
                  />
                </Tabs>

                <IconButton 
                  onClick={toggleColorMode}
                  sx={{ color: 'white' }}
                >
                  {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>

                <IconButton 
                  onClick={handleSettingsOpen}
                  sx={{ color: 'white' }}
                >
                  <SettingsIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Keep the GlobalProgress component */}
        <GlobalProgress 
          show={downloading}
          appName={currentApp}
          status={status}
          message={statusMessage}
          progress={progress}
          error={error}
          setDownloading={setDownloading}
        />

        {/* Main Content */}
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: 3, // Changed from mt: 15
            px: { xs: 2, sm: 3 },
          }}
        >
          {activeTab === 0 ? (
            <Stack spacing={5}>
              {/* Info Card */}
              <GlassBox sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h6" component="span">💡</Typography>
                    <Typography variant="body1">
                      Press the button twice to run the program
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h6" component="span">⚠️</Typography>
                    <Typography variant="body1">
                      Don't close while saving files
                    </Typography>
                  </Stack>
                </Stack>
              </GlassBox>

              {/* Apps Grid */}
              <AppGrid
                apps={filteredApps}
                isLoading={isLoading}
                onDownload={handleDownload}
                isDownloading={downloading}
                currentApp={currentApp}
                searchQuery={searchQuery}
              />
            </Stack>
          ) : (
            <Stack spacing={5}>
              {/* Info Card for Games */}
              <GlassBox sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h6" component="span">🎮</Typography>
                    <Typography variant="body1">
                      Games are downloaded using rclone from cloud storage
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h6" component="span">💾</Typography>
                    <Typography variant="body1">
                      Make sure you have enough storage space available
                    </Typography>
                  </Stack>
                </Stack>
              </GlassBox>

              {/* Games Grid */}
              <GameGrid
                games={filteredGames}
                isLoading={!gameSource}
                onDownload={handleGameDownload}
                isDownloading={downloading}
                currentGame={currentApp}
                searchQuery={searchQuery}
              />
            </Stack>
          )}
        </Container>

        <SettingsDialog
          open={settingsOpen}
          onClose={handleSettingsClose}
          onSave={handleSettingsSave}
          settings={settings}
          setSettings={setSettings}
          setSourceManagerOpen={setSourceManagerOpen}
          appSources={appSources}
          gameSource={gameSource}
        />
        <SourceManager 
          open={sourceManagerOpen} 
          onClose={() => setSourceManagerOpen(false)}
          appSources={appSources}
          gameSource={gameSource}
          onSourcesUpdate={handleSourcesUpdate}
        />
      </Box>
    </Box>
  );
}

export default App;
