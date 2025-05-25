import React from 'react';
import PropTypes from 'prop-types';
import './CharacterCard.css';

const CharacterCard = ({
  character,
  onView,
  onEdit,
  onDelete
}) => {
  const { id, name, race, class: charClass, level, hp, maxHp } = character;
  const hpPercentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;

  return (
    <div className="character-card">
      <div className="character-header">
        <h3>{name || 'Unnamed Character'}</h3>
        <div className="character-meta">
          <span>{race || 'Unknown Race'}</span>
          <span>•</span>
          <span>Level {level || 1} {charClass || 'Adventurer'}</span>
        </div>
      </div>
      
      <div className="character-details">
        <div className="character-stat">
          <div className="stat-label">Hit Points</div>
          <div className="hp-bar">
            <div 
              className="hp-bar-fill" 
              style={{ width: `${hpPercentage}%` }}
            />
            <span className="hp-text">{hp || 0} / {maxHp || 0}</span>
          </div>
        </div>
        
        <div className="character-stat">
          <div className="stat-label">Armor Class</div>
          <div className="stat-value">{character.ac || 10}</div>
        </div>
        
        <div className="character-stat">
          <div className="stat-label">Initiative</div>
          <div className="stat-value">{character.initiative >= 0 ? '+' : ''}{character.initiative || 0}</div>
        </div>
      </div>
      
      <div className="character-actions">
        <button 
          className="character-action view-action"
          onClick={() => onView(id)}
          title="View Character"
        >
          <i className="fas fa-eye"></i>
          <span>View</span>
        </button>
        <button 
          className="character-action edit-action"
          onClick={() => onEdit(id)}
          title="Edit Character"
        >
          <i className="fas fa-edit"></i>
          <span>Edit</span>
        </button>
        <button 
          className="character-action delete-action"
          onClick={() => onDelete(id)}
          title="Delete Character"
        >
          <i className="fas fa-trash"></i>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

CharacterCard.propTypes = {
  character: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    race: PropTypes.string,
    class: PropTypes.string,
    level: PropTypes.number,
    hp: PropTypes.number,
    maxHp: PropTypes.number,
    ac: PropTypes.number,
    initiative: PropTypes.number
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default CharacterCard;