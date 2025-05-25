import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import PageContainer from '../../components/PageContainer/PageContainer';
import Header from '../../components/Headers/Header';
import Button from '../../components/Button/Button';
import { FOOTER_LINKS } from '../../utilities/footer-links';
import './Campaigns.css';

const Campaigns = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="app">
      <Navbar 
        username={user?.username}
        activePage="campaigns"
        onThemeToggle={handleThemeToggle}
        currentTheme={theme}
      />
      
      <main className="main-content">
        <PageContainer>
          <div className="placeholder-container">
            <div className="placeholder-icon">
              <i className="fas fa-book-open"></i>
            </div>
            
            <Header as="h1" className="placeholder-title">
              Campaigns Coming Soon!
            </Header>
            
            <p className="placeholder-text">
              The campaign management system is currently under development. Soon you'll be able to create, join, and manage your D&D campaigns with your party members!
            </p>
            
            <div className="features-list">
              <p className="placeholder-text">Features in development:</p>
              <ul className="features-bullets">
                <li>Create and manage campaigns</li>
                <li>Invite players to your campaigns</li>
                <li>Track campaign progress and notes</li>
                <li>Share resources with party members</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleBackToDashboard}
              className="back-button"
            >
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </Button>
          </div>
        </PageContainer>
      </main>
      
      <Footer links={FOOTER_LINKS} />
    </div>
  );
};

export default Campaigns;