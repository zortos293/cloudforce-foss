import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Stack,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const SourceManager = ({ 
  open, 
  onClose,
  appSources,
  gameSource,
  onSourcesUpdate 
}) => {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('sourceManagerTab');
    return savedTab ? parseInt(savedTab) : 0;
  });
  const [sources, setSources] = useState(() => ({
    apps: JSON.parse(localStorage.getItem('additionalAppSources') || '{}'),
    games: JSON.parse(localStorage.getItem('additionalGameSources') || '{}')
  }));
  
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [error, setError] = useState(null);

  // Update local state when props change
  useEffect(() => {
    setSources({
      apps: { ...appSources },
      games: gameSource ? { default: gameSource } : {}
    });
  }, [appSources, gameSource]);

  const validateSourceJson = (json, type) => {
    const requiredFields = ['name', 'author', 'description', 'categories'];
    const missingFields = requiredFields.filter(field => !json[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate apps/games array
    const itemsArray = type === 'apps' ? json.apps : json.games;
    if (!Array.isArray(itemsArray)) {
      throw new Error(`${type} must be an array`);
    }

    // Validate each item
    itemsArray.forEach((item, index) => {
      const requiredItemFields = ['id', 'name', 'category', 'source', 'paths'];
      const missingItemFields = requiredItemFields.filter(field => !item[field]);
      if (missingItemFields.length > 0) {
        throw new Error(`Item at index ${index} is missing fields: ${missingItemFields.join(', ')}`);
      }
    });

    return true;
  };

  const addSource = async () => {
    try {
      setError(null);
      const response = await fetch(newSourceUrl);
      if (!response.ok) throw new Error('Failed to fetch source');
      
      const sourceData = await response.json();
      const type = activeTab === 0 ? 'apps' : 'games';
      if (!validateSourceJson(sourceData, type)) return;

      const sourceKey = newSourceUrl.split('/').pop().replace('.json', '');
      const newSources = {
        ...sources,
        [type]: {
          ...sources[type],
          [sourceKey]: sourceData
        }
      };

      setSources(newSources);
      localStorage.setItem(
        activeTab === 0 ? 'additionalAppSources' : 'additionalGameSources', 
        JSON.stringify(newSources[type])
      );
      setNewSourceUrl('');
      
      // Notify parent component of the update
      if (onSourcesUpdate) {
        onSourcesUpdate(type, newSources[type]);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const removeSource = (sourceKey) => {
    const type = activeTab === 0 ? 'apps' : 'games';
    
    // Don't allow removing default source
    if (sourceKey === 'default') {
      setError("Cannot remove default source");
      return;
    }

    const newSources = {
      ...sources,
      [type]: { ...sources[type] }
    };
    delete newSources[type][sourceKey];
    
    setSources(newSources);
    localStorage.setItem(
      activeTab === 0 ? 'additionalAppSources' : 'additionalGameSources',
      JSON.stringify(newSources[type])
    );

    // Notify parent component of the update
    if (onSourcesUpdate) {
      onSourcesUpdate(type, newSources[type]);
    }
  };

  const getCurrentSources = () => {
    if (activeTab === 0) {
      return sources.apps || {};
    } else {
      return sources.games || {};
    }
  };

  const handleClose = () => {
    localStorage.removeItem('sourceManagerTab'); // Clean up
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Sources</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="App Sources" />
            <Tab label="Game Sources" />
          </Tabs>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Source URL"
              placeholder="https://example.com/source.json"
              value={newSourceUrl}
              onChange={(e) => setNewSourceUrl(e.target.value)}
              helperText={`Enter the URL of a JSON file containing ${activeTab === 0 ? 'app' : 'game'} definitions`}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addSource}
              disabled={!newSourceUrl}
            >
              Add
            </Button>
          </Stack>

          <Typography variant="h6">Current Sources</Typography>
          <List>
            {Object.entries(getCurrentSources()).map(([key, source]) => (
              <ListItem key={key}>
                <ListItemText
                  primary={source.name}
                  secondary={`${source.author} • ${(activeTab === 0 ? source.apps : source.games).length} items`}
                />
                <ListItemSecondaryAction>
                  {key !== 'default' && (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeSource(key)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SourceManager; 