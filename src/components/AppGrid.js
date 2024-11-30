import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Info as InfoIcon,
  Launch as LaunchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AppCard = ({ app, onDownload, isDownloading, currentApp }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Box
        sx={{
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(18, 18, 18, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={2} p={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h3" component="span" sx={{ fontSize: '2rem' }}>
              {app.icon}
            </Typography>
            <Box flex={1}>
              <Typography variant="h6" noWrap>
                {app.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {app.version} • {app.size}
              </Typography>
            </Box>
            <Tooltip title="App Info">
              <IconButton size="small">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
            {app.description}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {app.features?.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                variant="outlined"
                sx={{ m: 0.5 }}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="contained"
              startIcon={
                isDownloading && currentApp === app.name ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <DownloadIcon />
                )
              }
              onClick={() => onDownload(app)}
              disabled={isDownloading}
            >
              {isDownloading && currentApp === app.name ? 'Downloading...' : 'Download'}
            </Button>
            {app.website && (
              <Tooltip title="Visit Website">
                <IconButton 
                  size="small"
                  onClick={() => window.open(app.website, '_blank')}
                >
                  <LaunchIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Box>
    </motion.div>
  );
};

const AppGrid = ({
  apps,
  isLoading,
  onDownload,
  isDownloading,
  currentApp,
  searchQuery,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (apps.length === 0) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          {searchQuery ? 'No apps found matching your search' : 'No apps available'}
        </Typography>
        {searchQuery && (
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: 3,
        p: 2,
      }}
    >
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          onDownload={onDownload}
          isDownloading={isDownloading}
          currentApp={currentApp}
        />
      ))}
    </Box>
  );
};

export default AppGrid; 