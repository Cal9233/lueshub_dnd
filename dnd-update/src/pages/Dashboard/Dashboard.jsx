/**
 * Dashboard Component
 * 
 * Main dashboard page for the D&D application. Provides an overview of user's
 * characters, campaigns, recent dice rolls, and quick actions. Serves as the
 * central hub for navigating to different features of the application.
 * 
 * Features:
 * - Displays user's characters with quick access links
 * - Shows active campaigns (both as player and DM)
 * - Recent dice roll history
 * - Quick action buttons for common tasks
 * - Responsive grid layout
 * - Theme persistence (light/dark mode)
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS, api } from '../../config/api';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import Header from '../../components/Headers/Header';
import AudioControls from '../../components/AudioControls/AudioControls';
import { FOOTER_LINKS } from '../../utilities/footer-links';
import './Dashboard.css';

const Dashboard = () => {
  // User authentication context - provides current user data
  const { user } = useAuth();
  
  // Characters state - stores user's D&D characters
  const [characters, setCharacters] = useState([]);
  
  // Campaigns state - stores user's active campaigns
  const [campaigns, setCampaigns] = useState([]);
  
  // Loading state - tracks individual loading states for different data types
  const [loading, setLoading] = useState({
    characters: true,
    campaigns: true
  });

  /**
   * Initial load effect - handles data fetching
   * Runs when component mounts and when user authentication state changes
   */
  useEffect(() => {
    // Fetch dashboard data only if user is authenticated
    if (user) {
      fetchDashboardData();
    }
  }, [user]); // Re-run when user auth state changes

  /**
   * Fetches all dashboard data (characters and campaigns)
   * Handles loading states individually for each data type
   * Gracefully handles errors by setting empty arrays
   */
  const fetchDashboardData = async () => {
    // Fetch user's characters
    try {
      const charactersData = await api.get(API_ENDPOINTS.CHARACTERS);
      if (charactersData.success) {
        setCharacters(charactersData.characters || []);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      setCharacters([]); // Set empty array on error to prevent UI issues
    } finally {
      // Update loading state for characters regardless of success/failure
      setLoading(prev => ({ ...prev, characters: false }));
    }

    // Fetch user's campaigns (both as player and DM)
    try {
      const campaignsData = await api.get(API_ENDPOINTS.CAMPAIGNS);
      if (campaignsData.success) {
        setCampaigns(campaignsData.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]); // Set empty array on error to prevent UI issues
    } finally {
      // Update loading state for campaigns regardless of success/failure
      setLoading(prev => ({ ...prev, campaigns: false }));
    }
  };


  // Check if current user is a Dungeon Master - affects available actions
  const isDM = user?.role === 'dungeon_master';

  return (
    <div className="app">
      {/* Navigation bar with user info */}
      <Navbar 
        username={user?.username}
        activePage="dashboard"
      />
      
      <main className="main-content">
        {/* Dashboard header section with welcome message */}
        <div className="dashboard-header">
          <Header as="h2">Welcome to Your Adventure Hub</Header>
          <p>Manage your characters, campaigns, and roll some dice!</p>
        </div>
        
        {/* Main dashboard grid layout - responsive card layout */}
        <div className="dashboard-grid">
          {/* Characters Card - displays user's D&D characters */}
          <DashboardCard
            id="characters-card"
            title="My Characters"
            icon="fas fa-user-shield"
            headerAction={{ href: '/characters', text: 'View All' }}
            loading={loading.characters}
            elevation="raised"
          >
            {characters.length > 0 ? (
              // Character list - renders each character with basic info
              <div className="character-list">
                {characters.map(char => (
                  <div key={char.id} className="character-item">
                    <div className="character-info">
                      <h4>{char.name}</h4>
                      <p>Level {char.level} {char.class}</p>
                    </div>
                    <a href={`/character/${char.id}`} className="character-link">
                      <i className="fas fa-chevron-right"></i>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state - shown when user has no characters
              <EmptyState 
                icon="fas fa-user-plus"
                message="No characters yet."
                actionText="Create Character"
                actionHref="/characters/new"
              />
            )}
          </DashboardCard>

          {/* Campaigns Card - shows user's active campaigns */}
          <DashboardCard
            id="campaigns-card"
            title="My Campaigns"
            icon="fas fa-book-open"
            headerAction={{ href: '/campaigns', text: 'View All' }}
            loading={loading.campaigns}
            elevation="raised"
          >
            {campaigns.length > 0 ? (
              // Campaign list - shows campaigns with role and DM info
              <div className="campaign-list">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="campaign-item">
                    <div className="campaign-info">
                      <h4>{campaign.name}</h4>
                      <p>{campaign.role} • DM: {campaign.dm}</p>
                    </div>
                    <a href={`/campaign/${campaign.id}`} className="campaign-link">
                      <i className="fas fa-chevron-right"></i>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state - different action based on user role
              <EmptyState 
                icon="fas fa-plus-circle"
                message="No active campaigns."
                actionText={isDM ? "Create Campaign" : "Join Campaign"}
                actionHref={isDM ? "/campaigns/new" : "/#contact"}
              />
            )}
          </DashboardCard>

          {/* Recent Rolls Card - placeholder for dice roll history */}
          <DashboardCard
            id="recent-rolls-card"
            title="Recent Rolls"
            icon="fas fa-dice"
            headerAction={{ href: '/dice-roller', text: 'Roll Dice' }}
            elevation="raised"
          >
            {/* Currently shows empty state - future feature for roll history */}
            <EmptyState 
              icon="fas fa-dice-d20"
              message="No recent rolls."
              actionText="Start Rolling"
              actionHref="/dice-roller"
            />
          </DashboardCard>

          {/* Ambient Music Card - audio controls for DMs and players */}
          <DashboardCard
            id="ambient-music-card"
            title="Ambient Music"
            icon="fas fa-music"
            elevation="raised"
          >
            <AudioControls />
          </DashboardCard>

          {/* Quick Actions Card - provides shortcuts to common tasks */}
          <DashboardCard
            id="quick-actions-card"
            title="Quick Actions"
            icon="fas fa-bolt"
            elevation="raised"
          >
            <div className="quick-actions">
              {/* Create new character button */}
              <a href="/characters/new" className="action-button">
                <i className="fas fa-user-plus"></i>
                <span>New Character</span>
              </a>
              
              {/* Quick access to dice roller */}
              <a href="/dice-roller" className="action-button">
                <i className="fas fa-dice-d20"></i>
                <span>Roll Dice</span>
              </a>
              
              {/* Create campaign button - only shown to DMs */}
              {isDM && (
                <>
                  <a href="/campaigns/new" className="action-button">
                    <i className="fas fa-plus-circle"></i>
                    <span>New Campaign</span>
                  </a>
                  <a href="/master-controls" className="action-button">
                    <i className="fas fa-crown"></i>
                    <span>DM Controls</span>
                  </a>
                </>
              )}
              
              {/* Access to notes/journal */}
              <a href="/notes" className="action-button">
                <i className="fas fa-scroll"></i>
                <span>Notes</span>
              </a>
            </div>
          </DashboardCard>
        </div>
      </main>
      
      {/* Footer with navigation links */}
      <Footer links={FOOTER_LINKS} className="dashboard-footer" />
    </div>
  );
};

export default Dashboard;