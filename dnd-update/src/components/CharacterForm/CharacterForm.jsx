import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from 'react-toastify';
import { API_ENDPOINTS, api } from '../../config/api';
import './CharacterForm.css';

const CharacterForm = ({ characterId, initialData = {} }) => {
  const [characterData, setCharacterData] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
    armor_class: 10,
    hit_points: 10,
    max_hit_points: 10,
    temp_hit_points: 0,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    gold: 0,
    silver: 0,
    copper: 0,
    spell_save_dc: 10,
    spell_attack_bonus: 0,
    spell_slots_json: '{}',
    known_spells: '',
    spells_array_json: '[]',
    weapons: '',
    gear: '',
    background: '',
    notes: '[]',
    portrait_url: '',
    initiative: 0,
    speed: 30,
    hit_dice_current: 1,
    hit_dice_max: 1,
    hit_dice_type: 'd8',
    passive_perception: 10,
    proficiency_bonus: 2,
    spellcasting_ability: 'intelligence',
    ...initialData
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Debounced save function
  const debouncedData = useDebounce(characterData, 5000);

  // Calculate ability modifiers
  const getAbilityModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  // Handle input changes
  const handleChange = (field, value) => {
    setCharacterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle number inputs
  const handleNumberChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    handleChange(field, numValue);
  };

  // Save character data
  const saveCharacter = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const data = await api.post(API_ENDPOINTS.SAVE_CHARACTER, {
        ...characterData,
        id: characterId
      });

      if (data.success) {
        setLastSaved(new Date());
        toast.success('Character saved successfully');
      } else {
        toast.error(data.message || 'Failed to save character');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save character');
    } finally {
      setIsSaving(false);
    }
  }, [characterData, characterId, isSaving]);

  // Auto-save when data changes
  useEffect(() => {
    if (debouncedData && characterId) {
      saveCharacter();
    }
  }, [debouncedData, characterId, saveCharacter]);

  // Load character data if editing
  useEffect(() => {
    if (characterId && !initialData.id) {
      api.get(API_ENDPOINTS.CHARACTER(characterId))
        .then(data => {
          if (data.success && data.character) {
            setCharacterData(data.character);
          }
        })
        .catch(err => {
          console.error('Failed to load character:', err);
          toast.error('Failed to load character');
        });
    }
  }, [characterId, initialData.id]);

  return (
    <div className="character-form">
      <div className="form-header">
        <h2>{characterId ? 'Edit Character' : 'Create Character'}</h2>
        {lastSaved && (
          <span className="save-status">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
        {isSaving && <span className="saving-indicator">Saving...</span>}
      </div>

      <div className="form-sections">
        {/* Basic Information */}
        <section className="form-section basic-info">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Character Name</label>
              <input
                type="text"
                id="name"
                value={characterData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter character name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="race">Race</label>
              <input
                type="text"
                id="race"
                value={characterData.race}
                onChange={(e) => handleChange('race', e.target.value)}
                placeholder="e.g., Human, Elf, Dwarf"
              />
            </div>
            <div className="form-group">
              <label htmlFor="class">Class</label>
              <input
                type="text"
                id="class"
                value={characterData.class}
                onChange={(e) => handleChange('class', e.target.value)}
                placeholder="e.g., Fighter, Wizard, Rogue"
              />
            </div>
            <div className="form-group">
              <label htmlFor="level">Level</label>
              <input
                type="number"
                id="level"
                min="1"
                max="20"
                value={characterData.level}
                onChange={(e) => handleNumberChange('level', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Combat Stats */}
        <section className="form-section combat-stats">
          <h3>Combat Stats</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="armor_class">Armor Class</label>
              <input
                type="number"
                id="armor_class"
                value={characterData.armor_class}
                onChange={(e) => handleNumberChange('armor_class', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="initiative">Initiative</label>
              <input
                type="number"
                id="initiative"
                value={characterData.initiative}
                onChange={(e) => handleNumberChange('initiative', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="speed">Speed</label>
              <input
                type="number"
                id="speed"
                value={characterData.speed}
                onChange={(e) => handleNumberChange('speed', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="proficiency_bonus">Proficiency Bonus</label>
              <input
                type="number"
                id="proficiency_bonus"
                value={characterData.proficiency_bonus}
                onChange={(e) => handleNumberChange('proficiency_bonus', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Hit Points */}
        <section className="form-section hit-points">
          <h3>Hit Points</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="hit_points">Current HP</label>
              <input
                type="number"
                id="hit_points"
                value={characterData.hit_points}
                onChange={(e) => handleNumberChange('hit_points', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="max_hit_points">Max HP</label>
              <input
                type="number"
                id="max_hit_points"
                value={characterData.max_hit_points}
                onChange={(e) => handleNumberChange('max_hit_points', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="temp_hit_points">Temp HP</label>
              <input
                type="number"
                id="temp_hit_points"
                value={characterData.temp_hit_points}
                onChange={(e) => handleNumberChange('temp_hit_points', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="hit_dice_type">Hit Dice Type</label>
              <select
                id="hit_dice_type"
                value={characterData.hit_dice_type}
                onChange={(e) => handleChange('hit_dice_type', e.target.value)}
              >
                <option value="d6">d6</option>
                <option value="d8">d8</option>
                <option value="d10">d10</option>
                <option value="d12">d12</option>
              </select>
            </div>
          </div>
        </section>

        {/* Abilities */}
        <section className="form-section abilities">
          <h3>Abilities</h3>
          <div className="abilities-grid">
            {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(ability => (
              <div key={ability} className="ability-group">
                <label htmlFor={ability}>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                <input
                  type="number"
                  id={ability}
                  min="1"
                  max="30"
                  value={characterData[ability]}
                  onChange={(e) => handleNumberChange(ability, e.target.value)}
                />
                <span className="ability-modifier">
                  {getAbilityModifier(characterData[ability]) >= 0 ? '+' : ''}
                  {getAbilityModifier(characterData[ability])}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Currency */}
        <section className="form-section currency">
          <h3>Currency</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="gold">Gold</label>
              <input
                type="number"
                id="gold"
                min="0"
                value={characterData.gold}
                onChange={(e) => handleNumberChange('gold', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="silver">Silver</label>
              <input
                type="number"
                id="silver"
                min="0"
                value={characterData.silver}
                onChange={(e) => handleNumberChange('silver', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="copper">Copper</label>
              <input
                type="number"
                id="copper"
                min="0"
                value={characterData.copper}
                onChange={(e) => handleNumberChange('copper', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Equipment */}
        <section className="form-section equipment">
          <h3>Equipment</h3>
          <div className="form-group">
            <label htmlFor="weapons">Weapons</label>
            <textarea
              id="weapons"
              value={characterData.weapons}
              onChange={(e) => handleChange('weapons', e.target.value)}
              placeholder="List your weapons here..."
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="gear">Gear</label>
            <textarea
              id="gear"
              value={characterData.gear}
              onChange={(e) => handleChange('gear', e.target.value)}
              placeholder="List your gear here..."
              rows="3"
            />
          </div>
        </section>

        {/* Background */}
        <section className="form-section background">
          <h3>Background</h3>
          <div className="form-group">
            <textarea
              id="background"
              value={characterData.background}
              onChange={(e) => handleChange('background', e.target.value)}
              placeholder="Describe your character's background..."
              rows="5"
            />
          </div>
        </section>

        {/* Actions */}
        <div className="form-actions">
          <button 
            className="save-button"
            onClick={saveCharacter}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Character'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterForm;