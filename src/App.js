import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  Box,
  Container,
  Button,
  Typography,
  Stack,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CloudQueue,
  Download,
  Delete,
  Save,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import { CheckCircle } from '@mui/icons-material';

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

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff69b4',
      light: '#ff8dc8',
      dark: '#d4478f',
    },
    secondary: {
      main: '#4a90e2',
      light: '#6ba5e7',
      dark: '#3570b2',
    },
    background: {
      default: '#d4478f',
      paper: 'rgba(255, 255, 255, 0)',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          fontWeight: 600,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

const MotionBox = motion(Box);

const GlassBox = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(12px)',
  borderRadius: '20px',
  border: 'none',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
  }
}));

const AppCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(12px)',
  border: 'none',
  transition: 'all 0.3s ease',
  boxShadow: 'none',
  '&:hover': {
    transform: 'translateY(-5px)',
    background: 'rgba(255, 255, 255, 0.15)',
  }
}));

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

  const showProgressBar = status === 'downloading' || status === 'extracting';
  const showLoadingBar = status === 'preparing';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        width: '350px',
        background: error ? 'rgba(244, 67, 54, 0.9)' : 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        animation: `${fadeIn} 0.3s ease-out`,
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 1.5,
          animation: showAnimation ? `${launchAnimation} 1s ease-out` : 'none'
        }}>
          {error ? (
            <ErrorOutline sx={{ color: 'white', fontSize: '1.5rem' }} />
          ) : (status === 'launching' || status === 'download_complete') && (
            <CheckCircle
              sx={{
                color: '#4caf50',
                animation: showAnimation ? `${launchAnimation} 1s ease-out` : `${successPulse} 0.5s ease-out`,
                fontSize: '1.5rem'
              }}
            />
          )}
          <Typography 
            variant="body1"
            color="white" 
            textAlign="center"
            sx={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              animation: showAnimation ? `${launchAnimation} 1s ease-out` : `${fadeIn} 0.3s ease-out`,
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          >
            {error ? error : message}
          </Typography>
        </Box>

        {(showProgressBar || showLoadingBar) && !error && (
          <Box sx={{ position: 'relative' }}>
            {showLoadingBar ? (
              <LinearProgress
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff69b4',
                    borderRadius: 5,
                    animation: `${loadingAnimation} 2s infinite`,
                  }
                }}
              />
            ) : (
              <>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: status === 'extracting' ? '#4caf50' : '#ff69b4',
                      borderRadius: 5,
                      transition: 'all 0.3s ease',
                    }
                  }}
                />
                <Typography
                  variant="body2"
                  color="white"
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: -25,
                    fontSize: '0.9rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    animation: `${fadeIn} 0.3s ease-out`,
                  }}
                >
                  {Math.round(progress)}%
                </Typography>
              </>
            )}
          </Box>
        )}
      </Stack>
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

  const apps = [
    { 
      name: 'Firefox', 
      icon: '🦊',
      iconType: 'emoji',
      url: 'https://download.mozilla.org/?product=firefox-latest&os=win64&lang=en-US',
      executablePath: '\\Firefox\\firefox.exe'
    },
    { 
      name: 'Process Hacker', 
      icon: '🧑‍💻',
      iconType: 'emoji',
      url: 'https://github.com/processhacker/processhacker/releases/download/v2.39/processhacker-2.39-setup.exe',
      executablePath: '\\ProcessHacker\\ProcessHacker.exe'
    },
    { 
      name: 'AdvancedRun', 
      icon: 'https://www.nirsoft.net/utils/advancedrun_icon.png',
      iconType: 'image',
      url: 'https://picteon.dev/files/AdvancedRun.exe',
      executablePath: '\\AdvancedRun.exe'
    },
    { 
      name: 'GIMP', 
      icon: '🎨',
      iconType: 'emoji',
      url: 'https://picteon.dev/files/Gimp.zip',
      executablePath: '\\GIMP\\App\\gimp\\bin\\gimp-2.10.exe'
    }
    // Add URLs for other apps
  ];

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
      
      const response = await fetch(`${API_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: app.url,
          appName: app.name,
          executablePath: app.executablePath
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
      setError(null);
      setFileType(null);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: '#db5b9a',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
          pointerEvents: 'none',
        }
      }}>
        {/* Modern Header */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: 'none',
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
                  color: '#ff69b4',
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
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                }}
              >
                App Launcher
              </Typography>
            </Stack>
          </Container>
        </Box>

        {/* Global Progress Bar */}
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
            mt: 12, 
            mb: 4,
            px: { xs: 2, sm: 3 },
            flex: 1,
          }}
        >
          <Stack spacing={4}>
            {/* Info Cards */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ mb: 4 }}
            >
              <GlassBox>
                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Typography 
                    component="span" 
                    sx={{ fontSize: '1.2rem' }}
                  >
                    💡
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      fontWeight: 500,
                      flex: 1,
                    }}
                  >
                    Press the button twice to run the program
                  </Typography>
                </Box>
              </GlassBox>
              <GlassBox>
                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Typography 
                    component="span" 
                    sx={{ fontSize: '1.2rem' }}
                  >
                    ⚠️
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      fontWeight: 500,
                      flex: 1,
                    }}
                  >
                    Don't close while saving files
                  </Typography>
                </Box>
              </GlassBox>
            </Stack>

            {/* Apps Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(auto-fit, minmax(250px, 1fr))',
                },
                gap: 2,
                py: 2,
              }}
            >
              {apps.map((app, index) => (
                <MotionBox
                  key={index}
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AppCard>
                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={
                          downloading && currentApp === app.name ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : app.iconType === 'emoji' ? (
                            <Typography sx={{ 
                              fontSize: '1.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {app.icon}
                            </Typography>
                          ) : (
                            <Box
                              component="img"
                              src={app.icon}
                              sx={{
                                width: 32,
                                height: 32,
                                objectFit: 'contain',
                              }}
                            />
                          )
                        }
                        fullWidth
                        onClick={() => handleDownload(app)}
                        disabled={downloading}
                        sx={{
                          background: 'rgba(255, 105, 180, 0.7)',
                          backdropFilter: 'blur(5px)',
                          boxShadow: 'none',
                          border: 'none',
                          color: 'white',
                          display: 'flex',
                          justifyContent: 'flex-start',
                          gap: 2,
                          '&:hover': {
                            background: 'rgba(255, 105, 180, 0.9)',
                            boxShadow: '0 4px 15px rgba(255,105,180,0.3)',
                            color: 'white',
                          },
                          '&:disabled': {
                            background: 'rgba(255,105,180,0.5)',
                            color: 'white'
                          },
                          height: '60px',
                          borderRadius: '15px',
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          padding: '12px 24px',
                        }}
                      >
                        {app.name}
                      </Button>
                    </Stack>
                  </AppCard>
                </MotionBox>
              ))}
            </Box>
          </Stack>
        </Container>

        {/* Footer */}
        <Box sx={{ 
          width: '100%',
          mt: 'auto',
          pb: 4,
        }}>
          <Container maxWidth="lg">
            <Stack spacing={3}>
              {/* Footer Actions */}
              <GlassBox sx={{ p: 2 }}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="center"
                  alignItems="center"
                >
                  {['Delete Save', 'Save Files', 'Load Files'].map((text, index) => (
                    <Button
                      key={text}
                      variant="contained"
                      startIcon={
                        index === 0 ? <Delete sx={{ fontSize: 24 }} /> : 
                        index === 1 ? <Save sx={{ fontSize: 24 }} /> : 
                        <Refresh sx={{ fontSize: 24 }} />
                      }
                      sx={{ 
                        background: 'rgba(255, 105, 180, 0.7)',
                        backdropFilter: 'blur(5px)',
                        color: 'white',
                        boxShadow: 'none',
                        border: 'none',
                        '&:hover': {
                          background: 'rgba(255, 105, 180, 0.9)',
                          boxShadow: '0 4px 15px rgba(255,105,180,0.3)',
                        },
                        height: '60px',
                        borderRadius: '15px',
                        textTransform: 'none',
                        fontSize: '1.2rem',
                        minWidth: '180px',
                        padding: '12px 24px'
                      }}
                    >
                      {text}
                    </Button>
                  ))}
                </Stack>
              </GlassBox>

              {/* Load Folder Info */}
              <Typography 
                variant="body2" 
                align="center" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                Load Folder: B:\CloudForce\Loaded
              </Typography>
            </Stack>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
