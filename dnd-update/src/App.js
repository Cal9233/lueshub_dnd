/**
 * App.js - Main application component
 * 
 * This is the root component of the LuesHub D&D application.
 * It sets up the routing structure and authentication context for the entire app.
 * 
 * Features:
 * - Client-side routing with React Router
 * - Authentication state management with AuthProvider
 * - Protected routes that require user login
 * - Public routes for landing, login, and signup pages
 */

// Page components imports
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import CharactersPage from './pages/Characters/CharactersPage';
import Character from './pages/Character/Character';
import Campaigns from './pages/Campaigns/Campaigns';
import DiceRoller from './pages/DiceRoller/DiceRoller';
import MasterControls from './pages/MasterControls/MasterControls';

// React Router for navigation
import { BrowserRouter, Routes, Route } from "react-router";

// Authentication context and route protection
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AudioProvider } from './contexts/AudioContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Toast notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Global styles
import './App.css';

function App() {
  return (
    // ThemeProvider wraps everything to provide theme state globally
    <ThemeProvider>
      {/* AuthProvider provides authentication state */}
      <AuthProvider>
        {/* AudioProvider provides audio synchronization */}
        <AudioProvider>
          {/* BrowserRouter enables client-side routing */}
          <BrowserRouter>
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
        <Routes>
          {/* Public routes - accessible without login */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes - require authentication */}
          {/* Dashboard - Main hub after login */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Character management routes */}
          <Route path="/characters/*" element={
            <ProtectedRoute>
              <CharactersPage />
            </ProtectedRoute>
          } />
          
          {/* Character detail view (same component for view and edit) */}
          <Route path="/character/:id" element={
            <ProtectedRoute>
              <Character />
            </ProtectedRoute>
          } />
          
          {/* Character edit mode (uses same Character component) */}
          <Route path="/character/:id/edit" element={
            <ProtectedRoute>
              <Character />
            </ProtectedRoute>
          } />
          
          {/* Campaigns page (coming soon) */}
          <Route path="/campaigns" element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          } />
          
          {/* Virtual dice roller */}
          <Route path="/dice-roller" element={
            <ProtectedRoute>
              <DiceRoller />
            </ProtectedRoute>
          } />
          
          {/* Master controls - DM only */}
          <Route path="/master-controls" element={
            <ProtectedRoute>
              <MasterControls />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
        </AudioProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;