import HeroBanner from '../../components/HeroBanner/HeroBanner';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Headers/Header';
import { FeatureCard } from '../../components/Card/Card';
import { Section } from '../../components/Section/Section';
import { FEATURES_DATA } from "../../utilities/features-data";
import './Home.css';

const LandingPage = () => (
  <div className="app">
    <HeroBanner
      primaryLabel="Sign In"
      primaryHref="login.html"
      secondaryLabel="Learn More"
      secondaryHref="#contact"
    />
    <main>
      <Section>
        {FEATURES_DATA.map((feature, idx) => (
          <FeatureCard 
            key={idx}
            id={feature.id}
            icon={feature.icon}
            title={feature.title}
            content={feature.content}
          />
        ))}
      </Section>
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
