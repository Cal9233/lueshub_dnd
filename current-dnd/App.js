import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="hero">
        <div className="hero-content">
          <h1>LuesHub Dungeons & Dragons</h1>
          <p>Embark on epic adventures in magical realms</p>
          <button className="cta-button">Begin Your Journey</button>
        </div>
      </header>

      <main>
        <section className="features">
          <div className="feature-card">
            <div className="feature-icon">🧙‍♂️</div>
            <h2>Character Creation</h2>
            <p>Create and manage your D&D characters with our easy-to-use character sheets.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎲</div>
            <h2>Dice Roller</h2>
            <p>Roll virtual dice for all your checks, saves, and attacks with our built-in dice roller.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h2>Campaign Management</h2>
            <p>Organize your campaigns, track encounters, and manage your party's progress.</p>
          </div>
        </section>

        <section className="about">
          <h2>About LuesHub D&D</h2>
          <p>
            Welcome to LuesHub D&D, your ultimate companion for Dungeons & Dragons adventures. 
            Whether you're a Dungeon Master weaving epic tales or a player embarking on heroic quests,
            our tools are designed to enhance your tabletop experience.
          </p>
          <p>
            Track character progression, manage spell slots, inventory, and more - all in one place.
            Join thousands of adventurers who have already enhanced their D&D experience with our platform.
          </p>
        </section>

        <section className="call-to-action">
          <h2>Ready to Roll Initiative?</h2>
          <p>Sign up now and start your adventure!</p>
          <div className="cta-buttons">
            <button className="cta-button">Sign Up</button>
            <button className="cta-button secondary">Learn More</button>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <p>&copy; 2025 LuesHub D&D. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;