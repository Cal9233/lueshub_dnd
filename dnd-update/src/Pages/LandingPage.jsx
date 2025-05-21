import HeroBanner from '../Components/HeroBanner/HeroBanner';
import Footer from '../Components/Footer/Footer';
import Header from '../Components/Headers/Header';
import '../App.css';

const LandingPage = () => (
  <div className="app">
    <HeroBanner
      primaryLabel="Sign In"
      primaryHref="login.html"
      secondaryLabel="Learn More"
      secondaryHref="#contact"
    />
    <main>
      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🧙‍♂️</div>
          <Header as="h2">Character Creation</Header>
          <p>Create and manage your D&D characters with our easy-to-use character sheets.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎲</div>
          <Header as="h2">Dice Roller</Header>
          <p>Roll virtual dice for all your checks, saves, and attacks with our built-in dice roller.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🗺️</div>
          <Header as="h2">Campaign Management</Header>
          <p>Organize your campaigns, track encounters, and manage your party's progress.</p>
        </div>
      </section>

      <section className="about">
        <Header as="h2">About LuesHub D&D</Header>
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
        <Header as="h2">Ready to Roll Initiative?</Header>
        <p>Sign in to access your characters and campaigns!</p>
        <div className="cta-buttons">
          <a href="login.html" className="cta-button">Sign In</a>
          <a href="#contact" className="cta-button secondary">Contact DM</a>
        </div>
      </section>
    </main>
    <Footer>
      <div className="footer-content">
        <p>&copy; 2025 LuesHub D&D. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact Us</a>
        </div>
      </div>
    </Footer>
  </div>
);

export default LandingPage;
