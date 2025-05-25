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
import Characters from './pages/Characters/Characters';
import Character from './pages/Character/Character';
import Campaigns from './pages/Campaigns/Campaigns';
import DiceRoller from './pages/DiceRoller/DiceRoller';

// React Router for navigation
import { BrowserRouter, Routes, Route } from "react-router";

// Authentication context and route protection
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Global styles
import './App.css';

function App() {
  return (
    // AuthProvider wraps the entire app to provide authentication state globally
    <AuthProvider>
      {/* BrowserRouter enables client-side routing */}
      <BrowserRouter>
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
          <Route path="/characters" element={
            <ProtectedRoute>
              <Characters />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;