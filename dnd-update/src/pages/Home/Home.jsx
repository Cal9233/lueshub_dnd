import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Headers/Header';
import Button from '../../components/Button/Button';
import ButtonGroup from '../../components/Button/ButtonGroup';
import Paragraph from '../../components/Typography/Paragraph';
import { FeatureCard } from '../../components/Card/Card';
import { Section } from '../../components/Section/Section';
import { FEATURES_DATA } from '../../utilities/features-data';
import { FOOTER_LINKS } from '../../utilities/footer-links';
import './Home.css';

const Home = () => {
  const { currentTheme } = useTheme();
  
  return (
  <div className="app">
    <HeroBanner
      title="LuesHub Dungeons & Dragons"
      subtitle="Embark on epic adventures in magical realms"
      primaryLabel="Login"
      primaryHref="/login"
      secondaryLabel="Learn More"
      secondaryHref="#contact"
    />
    
    <main>
      <Section className="features">
        {FEATURES_DATA.map((feature) => (
          <FeatureCard 
            key={feature.id}
            icon={feature.icon}
            title={feature.title}
            content={feature.content}
          />
        ))}
      </Section>

      <Section className="about" variant="content" fullWidth>
        <Header as="h2">About LuesHub D&D</Header>
        <Paragraph>
          Welcome to LuesHub D&D, your ultimate companion for Dungeons & Dragons adventures. 
          Whether you're a Dungeon Master weaving epic tales or a player embarking on heroic quests,
          our tools are designed to enhance your tabletop experience.
        </Paragraph>
        <Paragraph>
          Track character progression, manage spell slots, inventory, and more - all in one place.
          Join thousands of adventurers who have already enhanced their D&D experience with our platform.
        </Paragraph>
      </Section>

      <Section className="call-to-action" variant="content" fullWidth>
        <Header as="h2">Ready to Roll Initiative?</Header>
        <Paragraph>Sign up now and start your adventure!</Paragraph>
        <div className="center-button">
          <Button href="/signup">Sign Up</Button>
        </div>
      </Section>

      <Section id="contact" className="contact" variant="content" fullWidth>
        <Header as="h2">Contact Us</Header>
        <Paragraph>
          Ready to start your adventure? Contact your Dungeon Master to get access to the platform.
        </Paragraph>
        <Paragraph>
          For technical support or questions about LuesHub D&D, reach out to our support team.
        </Paragraph>
        <ButtonGroup>
          <Button href="mailto:support@lueshub.com">Email Support</Button>
        </ButtonGroup>
      </Section>
    </main>
    
    <Footer links={FOOTER_LINKS} />
  </div>
  );
};

export default Home;
