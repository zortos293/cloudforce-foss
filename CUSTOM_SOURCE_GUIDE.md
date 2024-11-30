# CloudForce Custom Source Guide

This guide explains how to create your own app or game source for CloudForce.

## Structure Overview

A CloudForce source JSON file must contain:
- Collection metadata (name, author, etc.)
- Categories definitions
- Apps/Games array
- Additional metadata

## Basic Template
```json
{
    "name": "Your Collection Name",
    "author": "Your Name",
    "website": "https://your-website.com",
    "description": "Description of your collection",
    "version": "1.0.0",
    "categories": {
        // Your categories here
    },  
    "apps": [
        // Your apps here
    ],
    "metadata": {
        // Additional metadata
    }
}
```

## Categories

Categories help organize your apps. Each category needs:
- Unique ID
- Display name
- Icon (emoji or URL)
- Description

Example:
```json
"categories": {
    "utility": {
    "id": "utility",
    "name": "Utilities",
    "icon": "🔨",
    "description": "Utility applications"
    },
    "browser": {
    "id": "browser",
    "name": "Browsers",
    "icon": "🌐",
    "description": "Web browsers"
    }
}
```

## Apps

Each app requires:
- Unique ID
- Name
- Icon
- Category (matching a category ID)
- Version
- Size information
- Source information
- Installation paths
- Features list
- Description

Example app:
```json
{
    "id": "my-app",
    "name": "My App",
    "icon": "📱",
    "category": "utility",
    "version": "1.0.0",
    "size": "10MB",
    "source": {
        "name": "Your Source",
        "url": "https://your-domain.com/downloads/app.zip"
    },
    "paths": {
        "executable": "\\MyApp\\app.exe",
        "install": "\\MyApp"
    },
    "features": [
        "Feature 1",
        "Feature 2"
    ],
    "description": "Description of your app",
    "website": "https://app-website.com",
    "portable": true,
    "gfnStatus": "Safe",
    "gfnIssues": "none"
}
```     

## GFN Status Types

The `gfnStatus` field can have these values:
- `"Safe"`: Works perfectly on GeForce NOW
- `"Unsafe"`: May have issues but generally works
- `"Crash"`: Known to crash on GeForce NOW

## File Types Support

CloudForce supports these file types for apps:
- `.zip` files (will be extracted automatically)
- `.exe` files (direct executables)
- Portable apps

## Path Guidelines

1. Installation Paths:
   - Use double backslashes: `\\folder\\file.exe`
   - Keep paths relative to installation directory
   - Example: `\\AppName\\bin\\app.exe`

2. Executable Paths:
   - Must point to the main executable
   - Can include subfolders
   - Example: `\\Firefox\\firefox.exe`

## Source URLs

Your source URLs should:
1. Be direct download links
2. Be stable and reliable
3. Support resume functionality
4. Be publicly accessible
5. Have good uptime

Example URL structures:

https://your-domain.com/files/app.zip
https://cdn.your-domain.com/downloads/app.exe
https://github.com/user/repo/releases/download/v1.0/app.zip


## Hosting Your Source

You can host your JSON file on:
1. GitHub (raw content)
2. Your own web server
3. CDN service
4. Any public hosting with CORS support

Example hosting URLs:


## Validation

Before sharing your source:

1. JSON Validation:
   - Valid JSON syntax
   - All required fields present
   - Correct field types

2. URL Testing:
   - All download links work
   - Files download correctly
   - URLs are accessible

3. Path Testing:
   - Installation paths are correct
   - Executables are found
   - No absolute paths used

## Best Practices

1. Updates:
   - Keep versions current
   - Update download URLs
   - Maintain working links

2. Organization:
   - Group similar apps
   - Use clear categories
   - Consistent naming

3. Documentation:
   - Clear descriptions
   - Accurate requirements
   - Known issues listed

## Example Sources

You can find example sources in the CloudForce repository:
1. [Default Apps](public/app-resources/cloudforce-apps.json)
2. [Default Games](public/app-resources/cloudforce-games.json)
3. [Example Custom](examples/custom-source.json)

## Testing Your Source

1. Local Testing:
   ```bash
   # Validate JSON syntax
   jsonlint your-source.json

   # Test with CloudForce
   1. Open Settings
   2. Go to Sources
   3. Add New Source
   4. Enter your JSON URL
   ```

2. Verify:
   - Apps appear in list
   - Downloads work
   - Apps launch correctly

## Common Issues

1. JSON Syntax:
   - Missing commas
   - Unclosed brackets
   - Invalid quotes

2. Paths:
   - Wrong slashes
   - Absolute paths
   - Missing executables

3. URLs:
   - Dead links
   - No direct downloads
   - CORS issues


## Contributing

Want to share your source?
1. Fork the repository
2. Add your source
3. Test thoroughly
4. Submit a pull request

