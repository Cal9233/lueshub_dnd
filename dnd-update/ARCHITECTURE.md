# LuesHub D&D - Architecture Documentation

## Overview

This document outlines the architecture and design patterns used in the LuesHub D&D React application.

## Project Structure

```
dnd-update/
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   └── favicon.ico        # App icon
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── contexts/         # React Context providers
│   ├── config/           # Configuration files
│   ├── hoc/              # Higher-Order Components
│   ├── utilities/        # Helper functions and data
│   ├── App.js            # Root component
│   ├── App.css           # Global styles
│   └── index.js          # App entry point
└── api/                  # PHP backend
    ├── config.php        # Database & CORS config
    └── *.php             # API endpoints
```

## Design Patterns

### 1. Component Architecture

#### Atomic Design
- **Components**: Small, reusable UI elements (Button, FormInput, etc.)
- **Pages**: Full page components that compose smaller components
- **Layouts**: Consistent page structure with Navbar and Footer

#### Component Categories
- **Presentational Components**: Focus on UI (Button, Card, Header)
- **Container Components**: Handle business logic (Dashboard, Characters)
- **Form Components**: Specialized for user input (FormInput, StatInput)

### 2. State Management

#### Context API
- **AuthContext**: Global authentication state
- Provides user data and auth methods to entire app
- Handles session persistence

#### Local State
- Component-specific state using useState
- Form state managed by HOC pattern

### 3. Routing

#### Protected Routes
- `ProtectedRoute` component wraps authenticated pages
- Redirects to login if user not authenticated
- Shows loading state during auth check

#### Route Structure
```
/ (public)
├── /login (public)
├── /signup (public)
└── /dashboard (protected)
    ├── /characters (protected)
    ├── /character/:id (protected)
    ├── /campaigns (protected)
    └── /dice-roller (protected)
```

### 4. Higher-Order Components (HOC)

#### withFormHandling
- Provides form state management
- Handles input changes and validation
- Reduces boilerplate in form components

Usage:
```javascript
const LoginForm = withFormHandling(LoginComponent, initialState);
```

### 5. API Integration

#### Centralized Configuration
- All API endpoints defined in `config/api.js`
- Base URL configurable via environment
- Consistent fetch configuration

#### API Helper Functions
```javascript
api.get(endpoint)    // GET request
api.post(endpoint, data)  // POST request
```

#### Session Management
- PHP sessions for authentication
- Cookies included in all requests
- Automatic session check on app load

## Styling Architecture

### CSS Variables
- Theme colors defined as CSS variables
- Easy theme switching (light/dark)
- Consistent color palette

### Component Styles
- Each component has its own CSS file
- BEM-like naming convention
- Responsive design with media queries

### Theme System
```css
:root[data-theme="light"] {
  --bg-primary: #f8f9fa;
  --text-primary: #2c3e50;
  ...
}

:root[data-theme="dark"] {
  --bg-primary: #1a1a2e;
  --text-primary: #ecf0f1;
  ...
}
```

## Backend Architecture

### PHP API Design
- RESTful endpoints
- PDO for database access
- Prepared statements for security
- JSON responses

### Database Schema
```sql
users
├── id
├── username
├── password
└── role

characters
├── id
├── user_id
├── name
├── race
├── class
└── ... (stats)
```

### Security Measures
- Password hashing (bcrypt)
- SQL injection prevention
- CORS configuration
- Session-based auth
- Input validation

## Development Workflow

### Local Development
1. Start PHP server (Apache/Nginx)
2. Run `npm start` for React dev server
3. Proxy configuration handles API routing

### Build Process
```bash
npm run build  # Creates optimized production build
```

### Environment Configuration
- Development: Uses proxy to PHP backend
- Production: Configure API_URL environment variable

## Best Practices

### Code Organization
- One component per file
- Related files grouped in folders
- Clear naming conventions

### Component Guidelines
- PropTypes for type checking
- Default props where appropriate
- Destructure props for clarity
- Comments for complex logic

### Performance
- Lazy loading for routes (future)
- Optimized re-renders with React.memo (future)
- Efficient API calls with caching (future)

### Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management

## Future Enhancements

### Planned Features
- Real-time updates with WebSockets
- Offline support with Service Workers
- Advanced character sheet features
- Campaign management tools
- Dice rolling animations

### Technical Improvements
- TypeScript migration
- State management with Redux/Zustand
- API response caching
- Code splitting
- Testing suite

## Debugging Tips

### Common Issues
1. **CORS errors**: Check API CORS headers
2. **Session issues**: Verify cookie settings
3. **Routing problems**: Check protected route logic
4. **State updates**: Use React DevTools

### Development Tools
- React DevTools for component inspection
- Network tab for API debugging
- Console for error tracking
- PHP error logs for backend issues

---

This architecture provides a solid foundation for a scalable, maintainable D&D companion application.