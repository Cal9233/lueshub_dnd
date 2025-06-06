import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS, api } from '../../config/api';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Button from '../../components/Button/Button';
import FormInput from '../../components/Form/FormInput';
import StatInput from '../../components/StatInput/StatInput';
import HPBar from '../../components/HPBar/HPBar';
import Header from '../../components/Headers/Header';
import Notes from '../../components/Notes/Notes';
import { FOOTER_LINKS } from '../../utilities/footer-links';
import './Character.css';

const Character = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Character state
  const [character, setCharacter] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
    currentHP: 10,
    maxHP: 10,
    tempHP: 0,
    ac: 10,
    initiative: 0,
    speed: 30,
    proficiencyBonus: 2,
    passivePerception: 10,
    gold: 0,
    silver: 0,
    copper: 0,
    notes_array: [],
    background: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    // Load character data
    if (id && id !== 'new') {
      fetchCharacter();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchCharacter = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.CHARACTER(id));
      if (data.success && data.character) {
        setCharacter(data.character);
      } else {
        console.error('Failed to fetch character:', data.message);
        navigate('/characters');
      }
    } catch (error) {
      console.error('Error fetching character:', error);
      navigate('/characters');
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const handleLevelChange = (delta) => {
    const newLevel = Math.max(1, Math.min(20, character.level + delta));
    setCharacter(prev => ({ 
      ...prev, 
      level: newLevel,
      proficiencyBonus: Math.floor((newLevel - 1) / 4) + 2
    }));
  };

  const handleShortRest = () => {
    console.log('Short rest taken');
    // TODO: Implement short rest logic
  };

  const handleLongRest = () => {
    setCharacter(prev => ({ ...prev, currentHP: prev.maxHP }));
    console.log('Long rest taken - HP restored');
  };

  const handleSave = useCallback(async () => {
    if (!id || id === 'new') return;
    
    setSaving(true);
    try {
      // Prepare character data for API
      const characterData = {
        id: character.id,
        name: character.name,
        race: character.race,
        class: character.class,
        level: character.level,
        armor_class: character.ac,
        hit_points: character.currentHP,
        max_hit_points: character.maxHP,
        temp_hit_points: character.tempHP,
        initiative: character.initiative,
        speed: character.speed,
        passive_perception: character.passivePerception,
        proficiency_bonus: character.proficiencyBonus,
        gold: character.gold,
        silver: character.silver,
        copper: character.copper,
        notes: JSON.stringify(character.notes_array || []),
        background: character.background || ''
      };
      
      const response = await api.post(API_ENDPOINTS.SAVE_CHARACTER, characterData);
      if (response.success) {
        console.log('Character saved successfully');
      } else {
        console.error('Failed to save character:', response.message);
      }
    } catch (error) {
      console.error('Error saving character:', error);
    } finally {
      setSaving(false);
    }
  }, [id, character]);

  if (loading) {
    return (
      <div className="app">
        <Navbar 
          username={user?.username}
          activePage="characters"
        />
        <main className="main-content">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading character...</p>
          </div>
        </main>
        <Footer links={FOOTER_LINKS} />
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar 
        username={user?.username}
        activePage="characters"
      />
      
      <div className="character-container">
        <main className="character-content">
          {/* Action Toolbar */}
          <div className="action-toolbar">
            <div className="action-group">
              <Button variant="secondary" onClick={handleShortRest}>
                <i className="fas fa-coffee"></i> Short Rest
              </Button>
              <Button onClick={handleLongRest}>
                <i className="fas fa-bed"></i> Long Rest
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={saving}
              >
                <i className={`fas fa-${saving ? 'spinner fa-spin' : 'save'}`}></i> {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
            
            <div className="action-group currency-group">
              <div className="currency-item">
                <i className="fas fa-coins gold"></i>
                <input 
                  type="number" 
                  value={character.gold}
                  onChange={handleInputChange('gold')}
                  className="currency-input"
                />
              </div>
              <div className="currency-item">
                <i className="fas fa-coins silver"></i>
                <input 
                  type="number" 
                  value={character.silver}
                  onChange={handleInputChange('silver')}
                  className="currency-input"
                />
              </div>
              <div className="currency-item">
                <i className="fas fa-coins copper"></i>
                <input 
                  type="number" 
                  value={character.copper}
                  onChange={handleInputChange('copper')}
                  className="currency-input"
                />
              </div>
            </div>
            
            <div className="action-group">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="save-button"
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Character
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Character Header */}
          <section className="character-header">
            <div className="character-header-primary">
              <div className="character-portrait">
                <div className="portrait-container">
                  <i className="fas fa-user-circle portrait-placeholder"></i>
                  <div className="portrait-overlay">
                    <button className="portrait-upload-btn">
                      <i className="fas fa-camera"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="character-identity">
                <div className="character-name-container">
                  <input 
                    type="text" 
                    value={character.name}
                    onChange={handleInputChange('name')}
                    className="character-name-input" 
                    placeholder="Character Name"
                  />
                </div>
                
                <div className="character-details-grid">
                  <FormInput
                    id="charRace"
                    name="race"
                    type="text"
                    label="Race"
                    value={character.race}
                    onChange={handleInputChange('race')}
                  />
                  <FormInput
                    id="charClass"
                    name="class"
                    type="text"
                    label="Class"
                    value={character.class}
                    onChange={handleInputChange('class')}
                  />
                  <div className="character-detail">
                    <label htmlFor="charLevel">Level</label>
                    <div className="level-control">
                      <button 
                        className="level-btn level-down"
                        onClick={() => handleLevelChange(-1)}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        id="charLevel"
                        value={character.level}
                        onChange={handleInputChange('level')}
                        className="form-input level-input" 
                        min="1" 
                        max="20"
                      />
                      <button 
                        className="level-btn level-up"
                        onClick={() => handleLevelChange(1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="character-header-secondary">
              <div className="character-stats-grid">
                <StatInput
                  id="charAC"
                  label="Armor Class"
                  value={character.ac}
                  onChange={handleInputChange('ac')}
                  icon="fas fa-shield-alt"
                  min={0}
                />
                <StatInput
                  id="charInitiative"
                  label="Initiative"
                  value={character.initiative}
                  onChange={handleInputChange('initiative')}
                  icon="fas fa-bolt"
                />
                <StatInput
                  id="charSpeed"
                  label="Speed"
                  value={character.speed}
                  onChange={handleInputChange('speed')}
                  icon="fas fa-running"
                />
                <StatInput
                  id="proficiencyBonus"
                  label="Proficiency"
                  value={`+${character.proficiencyBonus}`}
                  icon="fas fa-check-circle"
                  readOnly
                />
                <StatInput
                  id="passivePerception"
                  label="Passive Perc."
                  value={character.passivePerception}
                  onChange={handleInputChange('passivePerception')}
                  icon="fas fa-eye"
                />
              </div>
            </div>
          </section>
          
          {/* HP Section */}
          <HPBar
            currentHP={character.currentHP}
            maxHP={character.maxHP}
            tempHP={character.tempHP}
            onCurrentHPChange={(value) => setCharacter(prev => ({ ...prev, currentHP: value }))}
            onMaxHPChange={(value) => setCharacter(prev => ({ ...prev, maxHP: value }))}
            onTempHPChange={(value) => setCharacter(prev => ({ ...prev, tempHP: value }))}
          />
          
          {/* Notes Section */}
          <Notes 
            notes={character.notes_array || []}
            onChange={(newNotes) => setCharacter(prev => ({ ...prev, notes_array: newNotes }))}
          />
          
          {/* Background Section */}
          <section className="character-background">
            <Header as="h3">Character Background</Header>
            <textarea
              className="background-textarea"
              value={character.background || ''}
              onChange={(e) => setCharacter(prev => ({ ...prev, background: e.target.value }))}
              placeholder="Write your character's background story, personality traits, ideals, bonds, and flaws..."
              rows="6"
            />
          </section>
          
          {/* More sections would go here: Abilities, Skills, Equipment, Spells, etc. */}
          <div className="coming-soon-section">
            <Header as="h3">More Features Coming Soon!</Header>
            <p>Abilities, Skills, Equipment, Spells, and more will be added here.</p>
          </div>
        </main>
      </div>
      
      <Footer links={FOOTER_LINKS} />
    </div>
  );
};

export default Character;