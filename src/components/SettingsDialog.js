import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  FolderOpen as FolderIcon,
  CloudDownload,
  Storage as StorageIcon,
  SportsEsports as GamesIcon,
  Apps as AppsIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const SettingsDialog = ({
  open,
  onClose,
  onSave,
  settings,
  setSettings,
  setSourceManagerOpen,
  appSources,
  gameSource,
}) => {
  const handleBrowseFolder = () => {
    window.electron?.showOpenDialog({
      properties: ['openDirectory']
    }).then(result => {
      if (!result.canceled) {
        setSettings({ ...settings, downloadPath: result.filePaths[0] });
      }
    });
  };

  const getTotalApps = () => {
    return Object.values(appSources).reduce((total, source) => 
      total + (source.apps?.length || 0), 0
    );
  };

  const getTotalGames = () => {
    return gameSource?.games?.length || 0;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <StorageIcon />
          <Typography variant="h6">Settings</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={4} sx={{ mt: 2 }}>
          {/* Sources Section */}
          <Stack spacing={3}>
            <Typography variant="subtitle1" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudDownload /> Content Sources
            </Typography>

            <Stack spacing={2}>
              {/* Apps Sources Card */}
              <Box sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper'
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AppsIcon color="primary" />
                    <Typography variant="subtitle2">App Sources</Typography>
                  </Stack>
                  <Typography variant="caption">
                    {Object.keys(appSources).length} sources • {getTotalApps()} apps
                  </Typography>
                </Stack>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSourceManagerOpen(true);
                    localStorage.setItem('sourceManagerTab', '0');
                    onClose(); // Close settings dialog
                  }}
                  fullWidth
                >
                  Manage App Sources
                </Button>
              </Box>

              {/* Games Sources Card */}
              <Box sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper'
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GamesIcon color="primary" />
                    <Typography variant="subtitle2">Game Sources</Typography>
                  </Stack>
                  <Typography variant="caption">
                    1 source • {getTotalGames()} games
                  </Typography>
                </Stack>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSourceManagerOpen(true);
                    localStorage.setItem('sourceManagerTab', '1');
                    onClose(); // Close settings dialog
                  }}
                  fullWidth
                >
                  Manage Game Sources
                </Button>
              </Box>
            </Stack>
          </Stack>

          <Divider />

          {/* Download Settings */}
          <Stack spacing={3}>
            <Typography variant="subtitle1" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudDownload /> Download Settings
            </Typography>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <TextField
                fullWidth
                label="Download Location"
                value={settings.downloadPath}
                onChange={(e) => setSettings({ ...settings, downloadPath: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Browse Folder">
                      <IconButton onClick={handleBrowseFolder}>
                        <FolderIcon />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoLaunch}
                  onChange={(e) => setSettings({ ...settings, autoLaunch: e.target.checked })}
                />
              }
              label="Auto-launch after download"
            />
          </Stack>

          <Divider />

          {/* General Settings */}
          <Stack spacing={3}>
            <Typography variant="subtitle1" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon /> General Settings
            </Typography>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <LanguageIcon fontSize="small" />
                  <InputLabel>Language</InputLabel>
                </Stack>
                <Select
                  value={settings.language}
                  label="Language"
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <NotificationsIcon fontSize="small" />
                    <Typography>Enable notifications</Typography>
                  </Stack>
                }
              />
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog; 