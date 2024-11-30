import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  TextField,
  Typography,
  Box,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const Sidebar = ({
  width = 280,
  categories,
  selectedCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
  onClearSearch,
  appSources,
  gameSource,
  selectedSource,
  onSourceSelect,
  activeTab,
}) => {
  const theme = useTheme();

  // Get the current categories based on active tab
  const currentCategories = activeTab === 0 
    ? appSources[selectedSource]?.categories || {}
    : gameSource?.categories || {};

  // Get the current sources based on active tab
  const currentSources = activeTab === 0 
    ? appSources 
    : { default: gameSource };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          background: theme.palette.mode === 'dark' 
            ? 'rgba(18, 18, 18, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRight: `1px solid ${
            theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(0, 0, 0, 0.05)'
          }`,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Sources Section */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          {activeTab === 0 ? 'App Sources' : 'Game Sources'}
        </Typography>
        <List>
          {Object.entries(currentSources).map(([key, source]) => (
            <ListItemButton
              key={key}
              selected={selectedSource === key}
              onClick={() => onSourceSelect(key)}
            >
              <ListItemText 
                primary={source.name}
                secondary={source.author}
              />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        
        {/* Search Box */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder={`Search ${activeTab === 0 ? 'apps' : 'games'}...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.5 }} />,
            endAdornment: searchQuery && (
              <IconButton size="small" onClick={onClearSearch}>
                <ClearIcon />
              </IconButton>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Categories */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          Categories
        </Typography>
        <List>
          <ListItemButton
            selected={!selectedCategory}
            onClick={() => onCategorySelect(null)}
          >
            <ListItemIcon>🏠</ListItemIcon>
            <ListItemText primary={`All ${activeTab === 0 ? 'Apps' : 'Games'}`} />
          </ListItemButton>
          
          {Object.entries(currentCategories).map(([key, category]) => (
            <ListItemButton
              key={key}
              selected={selectedCategory === category.id}
              onClick={() => onCategorySelect(category.id)}
            >
              <ListItemIcon>{category.icon}</ListItemIcon>
              <ListItemText 
                primary={category.name}
                secondary={category.description}
                secondaryTypographyProps={{
                  noWrap: true,
                  sx: { opacity: 0.7 }
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 