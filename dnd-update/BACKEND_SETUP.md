# Backend Setup Guide for React App

## Overview
The backend uses PHP with MySQL for the API and session-based authentication. The React app communicates with these PHP endpoints to handle user authentication, character management, and other features.

## Current Backend Structure
- **Location**: `/var/www/dnd.lueshub.com/current-dnd/api/`
- **Database**: MySQL (database name: `dnd_campaigns`)
- **Authentication**: PHP sessions

## Development Setup

### 1. Proxy Configuration (Already Done)
The `package.json` includes a proxy configuration for development:
```json
"proxy": "http://localhost:80"
```

This allows the React dev server (port 3000) to proxy API requests to the PHP backend (port 80).

### 2. Environment Variables
Create a `.env` file in the React app root:
```
REACT_APP_API_URL=/api
```

For production, this would be the full URL to your API.

## Required Backend Modifications

### 1. Add CORS Headers
For production deployment, you'll need to add CORS headers to all PHP API files. Add this to the top of each PHP file in the API directory:

```php
// CORS headers
header('Access-Control-Allow-Origin: http://localhost:3000'); // Update for production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

### 2. Session Configuration
Ensure PHP sessions work across domains by updating `php.ini`:
```ini
session.cookie_samesite = "None"
session.cookie_secure = true  # Only for HTTPS
```

### 3. Database Configuration
The database credentials are currently hardcoded in `api/db.php`. Consider using environment variables for production.

## API Endpoints

### Authentication
- `POST /api/login.php` - User login
- `POST /api/register.php` - User registration
- `GET /api/session_check.php` - Check session status
- `GET /logout.php` - Logout user

### Characters
- `GET /api/character.php` - Get user's characters
- `GET /api/character.php?id={id}` - Get specific character
- `POST /api/character.php` - Save character data
- `POST /api/save_spells.php` - Save character spells
- `POST /api/rest.php` - Handle character rest

### Campaigns
- `GET /api/campaigns.php` - Get campaigns (placeholder)

### Dice
- `POST /api/roll.php` - Save dice roll history

## Authentication Flow

1. User submits login form
2. React sends POST request to `/api/login.php` with credentials
3. PHP validates credentials and creates session
4. React stores authentication state in context
5. All subsequent requests include session cookie

## Important Notes

1. **Session Cookies**: The React app uses `credentials: 'include'` in fetch requests to send session cookies.

2. **Error Handling**: The current PHP APIs return errors with 200 status codes. Consider updating to use proper HTTP status codes.

3. **Security**: 
   - Always validate and sanitize input
   - Use prepared statements for database queries
   - Keep sensitive data (like database credentials) in environment variables

4. **Production Deployment**:
   - Update CORS origins to match your production domain
   - Use HTTPS for secure cookie transmission
   - Consider implementing rate limiting
   - Add proper logging and monitoring

## Testing the Integration

1. Start your PHP backend (Apache/Nginx with PHP)
2. Start the React dev server: `npm start`
3. Try logging in with existing credentials
4. Check browser DevTools Network tab to verify API calls

## Common Issues

### CORS Errors
If you see CORS errors, ensure:
- CORS headers are added to PHP files
- Credentials are included in fetch requests
- Origin matches in CORS headers

### Session Not Persisting
Check:
- Cookie settings in PHP
- `credentials: 'include'` in fetch calls
- Same-site cookie policies

### API Not Found (404)
Verify:
- Proxy configuration in package.json
- API base URL in React config
- PHP files are in correct location