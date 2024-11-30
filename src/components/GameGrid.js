import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Download,
  Info as InfoIcon,
  Launch as LaunchIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const GameCard = ({ game, onDownload, isDownloading, currentGame }) => {
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
        <Box
          sx={{
            position: 'relative',
            paddingTop: '56.25%', // 16:9 aspect ratio
            overflow: 'hidden',
          }}
        >
          <img
            src={game.background_image}
            alt={game.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 8px',
              borderRadius: 1,
              color: 'white',
            }}
          >
            {game.size}
          </Typography>
        </Box>

        <Stack spacing={2} p={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box flex={1}>
              <Typography variant="h6" noWrap>
                {game.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {game.version} • {game.platform}
              </Typography>
            </Box>
            <Tooltip title="Game Info">
              <IconButton size="small">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
            {game.description}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {game.features?.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                variant="outlined"
                sx={{ 
                  m: '2px',  // Use small uniform margin
                  height: '22px',  // Make chips even smaller
                  '& .MuiChip-label': {
                    px: 0.75,  // Reduce padding further
                    fontSize: '0.75rem',  // Make text smaller
                  }
                }}
              />
            ))}
          </Stack>

          {game.dlc && game.dlc.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Available DLC:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {game.dlc.map((dlc) => (
                  <Chip
                    key={dlc.id}
                    label={`${dlc.name} (${dlc.size})`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="contained"
              startIcon={
                isDownloading && currentGame === game.name ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Download />
                )
              }
              onClick={() => onDownload(game)}
              disabled={isDownloading}
            >
              {isDownloading && currentGame === game.name ? 'Downloading...' : 'Download'}
            </Button>
            {game.website && (
              <Tooltip title="Visit Website">
                <IconButton 
                  size="small"
                  onClick={() => window.open(game.website, '_blank')}
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

const GameGrid = ({
  games,
  isLoading,
  onDownload,
  isDownloading,
  currentGame,
  searchQuery,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (games.length === 0) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          {searchQuery ? 'No games found matching your search' : 'No games available'}
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
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onDownload={onDownload}
          isDownloading={isDownloading}
          currentGame={currentGame}
        />
      ))}
    </Box>
  );
};

export default GameGrid; 