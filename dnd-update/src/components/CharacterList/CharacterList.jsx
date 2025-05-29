import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { API_ENDPOINTS, api } from '../../config/api';
import './CharacterList.css';

const CharacterList = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.CHARACTERS);
      
      if (data.success) {
        setCharacters(data.characters || []);
      } else {
        toast.error(data.message || 'Failed to load characters');
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      toast.error('Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const deleteCharacter = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.CHARACTER(id), {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Character deleted successfully');
        fetchCharacters();
      } else {
        toast.error(data.message || 'Failed to delete character');
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      toast.error('Failed to delete character');
    }
  };

  if (loading) {
    return <div className="loading">Loading characters...</div>;
  }

  return (
    <div className="character-list">
      <div className="character-list-header">
        <h2>My Characters</h2>
        <Link to="/characters/new" className="create-button">
          <i className="fas fa-plus"></i> Create New Character
        </Link>
      </div>

      {characters.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-users fa-3x"></i>
          <p>No characters yet. Create your first character to begin your adventure!</p>
          <Link to="/characters/new" className="create-button">
            Create Character
          </Link>
        </div>
      ) : (
        <div className="character-grid">
          {characters.map(character => (
            <div key={character.id} className="character-card">
              <div className="character-portrait">
                {character.portrait_url ? (
                  <img src={character.portrait_url} alt={character.name} />
                ) : (
                  <i className="fas fa-user-circle"></i>
                )}
              </div>
              <div className="character-info">
                <h3>{character.name || 'Unnamed Character'}</h3>
                <p className="character-details">
                  Level {character.level} {character.race} {character.class}
                </p>
                <div className="character-stats">
                  <span><i className="fas fa-heart"></i> {character.hit_points}/{character.max_hit_points}</span>
                  <span><i className="fas fa-shield-alt"></i> AC {character.armor_class}</span>
                </div>
              </div>
              <div className="character-actions">
                <Link to={`/characters/${character.id}`} className="action-button edit">
                  <i className="fas fa-edit"></i> Edit
                </Link>
                <button 
                  onClick={() => deleteCharacter(character.id, character.name)}
                  className="action-button delete"
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterList;