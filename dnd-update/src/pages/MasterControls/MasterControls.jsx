import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import PageHeader from '../../components/PageHeader/PageHeader';
import AudioControls from '../../components/AudioControls/AudioControls';
import { FOOTER_LINKS } from '../../utilities/footer-links';
import './MasterControls.css';

const MasterControls = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is DM
  const isDM = user?.role === 'dungeon_master' || user?.role === 'admin';

  // Redirect non-DMs
  React.useEffect(() => {
    if (user && !isDM) {
      navigate('/dashboard');
    }
  }, [user, isDM, navigate]);

  if (!isDM) {
    return null; // Don't render anything while redirecting
  }

  const controls = [
    {
      id: 'campaign-manager',
      icon: 'fas fa-globe',
      title: 'Campaign Manager',
      description: 'Create and manage epic campaigns. Control the narrative, NPCs, and world events.',
      status: 'Coming Soon',
      available: false
    },
    {
      id: 'player-management',
      icon: 'fas fa-users',
      title: 'Player Management',
      description: 'Oversee player characters, approve changes, and manage party composition.',
      status: 'Coming Soon',
      available: false
    },
    {
      id: 'monster-compendium',
      icon: 'fas fa-dragon',
      title: 'Monster Compendium',
      description: 'Access and customize monsters, create encounters, and track combat.',
      status: 'Coming Soon',
      available: false
    },
    {
      id: 'world-builder',
      icon: 'fas fa-map-marked-alt',
      title: 'World Builder',
      description: 'Design maps, locations, and points of interest for your campaigns.',
      status: 'Coming Soon',
      available: false
    },
    {
      id: 'quest-designer',
      icon: 'fas fa-scroll',
      title: 'Quest Designer',
      description: 'Create quests, manage objectives, and track party progress.',
      status: 'Coming Soon',
      available: false
    },
    {
      id: 'loot-generator',
      icon: 'fas fa-coins',
      title: 'Loot Generator',
      description: 'Generate treasure, magical items, and rewards for your players.',
      status: 'Coming Soon',
      available: false
    }
  ];

  return (
    <div className="master-controls-page">
      <Navbar username={user?.username} activePage="master-controls" />
      
      <PageHeader 
        title="Dungeon Master Controls" 
        subtitle="Wield the power of the realm"
        icon="fas fa-crown"
      />

      <main className="master-controls-content">
        <div className="master-container">
          {/* Audio Controls Section */}
          <section className="audio-section">
            <h2><i className="fas fa-music"></i> Ambient Music Control</h2>
            <p className="section-description">
              Set the perfect atmosphere with synchronized music for all players
            </p>
            <AudioControls />
          </section>

          {/* Other Controls Grid */}
          <section className="controls-section">
            <h2><i className="fas fa-toolbox"></i> DM Tools</h2>
            <div className="controls-grid">
              {controls.map(control => (
                <div key={control.id} className="control-card">
                  <div className="control-icon">
                    <i className={control.icon}></i>
                  </div>
                  <h3 className="control-title">{control.title}</h3>
                  <p className="control-description">{control.description}</p>
                  {control.available ? (
                    <button className="control-button">
                      <i className="fas fa-plug"></i> Activate
                    </button>
                  ) : (
                    <span className="control-status">{control.status}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer links={FOOTER_LINKS} />
    </div>
  );
};

export default MasterControls;