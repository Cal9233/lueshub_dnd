# LuesHub D&D - Digital Dungeons & Dragons Companion

A modern, responsive web application for managing Dungeons & Dragons characters, campaigns, and dice rolling. Built with React and PHP, this app provides players and Dungeon Masters with digital tools to enhance their tabletop RPG experience.

## 🎲 Features

### Core Features
- **User Authentication**: Secure login and registration system with session management
- **Character Management**: Create, edit, and manage multiple D&D characters
- **Campaign Organization**: Join and manage campaigns (coming soon)
- **Virtual Dice Roller**: Roll any combination of dice with modifiers
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Character Features
- Track character stats (HP, AC, abilities, etc.)
- Manage character inventory and equipment
- Track spell slots and known spells
- Handle short and long rests
- Real-time HP management with temporary HP support

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PHP 7.4 or higher
- MySQL/MariaDB database
- Apache or Nginx web server

### Installation

1. **Clone the repository**
   ```bash
   cd /var/www/dnd.lueshub.com/dnd-update
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the backend**
   - Ensure PHP and MySQL are running
   - Database credentials are in `api/config.php`
   - The app uses the existing `dnd_campaigns` database

4. **Start the development server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

### Production Build

To create a production build:
```bash
npm run build
```

The optimized files will be in the `build/` directory.

## 📁 Project Structure

```
dnd-update/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts (Auth)
│   ├── config/        # Configuration files
│   ├── utilities/     # Utility functions and data
│   ├── hoc/           # Higher-order components
│   └── App.js         # Main app component
├── api/               # PHP backend API
│   ├── config.php     # Database configuration
│   ├── login.php      # Authentication endpoints
│   ├── register.php   
│   └── ...           
└── package.json       # Project dependencies
```

## 🔧 Technology Stack

### Frontend
- **React 19**: Modern UI library
- **React Router**: Client-side routing
- **CSS3**: Styling with CSS variables for theming
- **Font Awesome**: Icons
- **Google Fonts**: Typography (Poppins, MedievalSharp)

### Backend
- **PHP 8.3**: Server-side logic
- **MySQL**: Database
- **PDO**: Database abstraction
- **Session-based Auth**: Secure authentication

## 🎨 Design Features

- **Medieval Theme**: Fantasy-inspired design with gradient accents
- **Responsive Grid Layouts**: Adapts to all screen sizes
- **Smooth Animations**: Subtle transitions and hover effects
- **Accessibility**: Semantic HTML and ARIA labels
- **Loading States**: Skeleton loaders for better UX

## 🔐 Security

- Password hashing with bcrypt
- SQL injection prevention with prepared statements
- XSS protection
- CORS configuration for API security
- Session-based authentication
- Input validation and sanitization

## 📱 Pages Overview

### Home (`/`)
Landing page with app introduction and call-to-action buttons

### Login (`/login`)
User authentication page

### Signup (`/signup`)
New user registration

### Dashboard (`/dashboard`)
Main hub showing user's characters and campaigns

### Characters (`/characters`)
List view of all user's characters

### Character Detail (`/character/:id`)
Detailed character sheet with stats and abilities

### Campaigns (`/campaigns`)
Campaign management (coming soon)

### Dice Roller (`/dice-roller`)
Virtual dice rolling tool with 2D/3D views

## 🛠️ API Endpoints

- `POST /api/login.php` - User login
- `POST /api/register.php` - User registration
- `GET /api/session_check.php` - Check auth status
- `GET /api/characters.php` - Get user's characters
- `POST /api/characters.php` - Create/update character
- `GET /api/campaigns.php` - Get campaigns
- `POST /api/logout.php` - User logout

## 🎮 Usage Tips

1. **Creating a Character**: Click "Create New Character" from the dashboard
2. **Rolling Dice**: Select dice type, set modifiers, and click "Roll Dice"
3. **Managing HP**: Use the HP bar for quick adjustments during combat
4. **Theme Toggle**: Click the sun/moon icon in the navbar

## 🐛 Known Issues

- 3D dice rendering is currently a placeholder
- Campaign features are coming soon
- Spell management UI is in development

## 🤝 Contributing

This is a private project for LuesHub D&D group. For feature requests or bug reports, please contact the development team.

## 📄 License

This project is proprietary software for LuesHub D&D.

---

*May your rolls be ever in your favor! 🎲*