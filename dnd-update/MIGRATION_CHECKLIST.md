# Migration Checklist from current-dnd to dnd-update

## Already Completed
1. ✅ React application is built and functional
2. ✅ API files copied:
   - rest.php (character rest functionality)
   - roll.php (dice rolling)
   - save_spells.php (spell management)
   - character_old.php (backup of old character.php)
3. ✅ Database is configured and working
4. ✅ Audio files directory exists with test.mp3

## Required Actions Before Going Live

### 1. Update Base URLs ✅
Since you're moving from `/dnd-update/` to root `/`, you need to:

- ✅ **In src/config/api.js**: Changed `API_BASE_URL` from `/dnd-update/api` to `/api`
- ✅ **In src/contexts/AudioContext.jsx**: Changed audio paths to use `/audio_files/` and `/api/`
- ✅ **In package.json**: No homepage field present, proxy updated to localhost

### 2. Copy .htaccess for React Router ✅
Created `.htaccess` file in the dnd-update folder with proper rewrite rules:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle API requests
  RewriteRule ^api/(.*)$ api/$1 [L]
  
  # Handle audio files
  RewriteRule ^audio_files/(.*)$ audio_files/$1 [L]
  
  # Handle React Router - send all other requests to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Prevent directory listing
Options -Indexes
```

### 3. Database Tables
All necessary tables already exist:
- users
- characters (with all required columns)
- campaigns
- audio_state
- user_campaigns
- rolls
- common_rolls

### 4. Update CORS Settings ✅
In api/config.php, production domain is already included:
```php
$allowed_origins = [
    'https://dnd.lueshub.com',  // Add your actual domain
    'http://localhost:3000'     // Keep for development
];
```

### 5. File Permissions
Ensure proper permissions after moving:
```bash
chmod 755 api/
chmod 644 api/*.php
chmod 755 audio_files/
chmod 644 audio_files/*.mp3
```

### 6. Features Status
- ✅ User Authentication (login/register)
- ✅ Character Management
- ✅ Dice Roller (2D and 3D)
- ✅ Audio System (DM only)
- ✅ Dashboard
- ⚠️  Campaigns (basic implementation, needs more work)
- ⚠️  Notes (page exists but no backend)
- ⚠️  Master Controls (page exists but limited functionality)

## Steps to Deploy

1. Update the configuration files as mentioned above
2. Run `npm run build` after making the changes
3. Copy entire dnd-update folder contents to your web root
4. Update file permissions
5. Test all functionality

## Optional Enhancements
- Add more audio files to the audio_files directory
- Implement full campaign management
- Add note-taking functionality
- Enhance master controls for DMs