import React from 'react';
import PropTypes from 'prop-types';
import './HPBar.css';

const HPBar = ({
  currentHP,
  maxHP,
  tempHP = 0,
  onCurrentHPChange,
  onMaxHPChange,
  onTempHPChange
}) => {
  const hpPercentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
  const tempHPPercentage = maxHP > 0 ? (tempHP / maxHP) * 100 : 0;

  const handleHPChange = (type, delta) => {
    switch (type) {
      case 'current':
        const newCurrent = Math.max(0, Math.min(currentHP + delta, maxHP));
        onCurrentHPChange(newCurrent);
        break;
      case 'max':
        const newMax = Math.max(1, maxHP + delta);
        onMaxHPChange(newMax);
        break;
      case 'temp':
        const newTemp = Math.max(0, tempHP + delta);
        onTempHPChange(newTemp);
        break;
      default:
        break;
    }
  };

  return (
    <section className="hp-section">
      <div className="hp-container">
        <div className="hp-display">
          <div className="hp-shield">
            <div className="current-hp">{currentHP}</div>
            <div className="max-hp">/ {maxHP}</div>
            {tempHP > 0 && <div className="temp-hp">+{tempHP}</div>}
          </div>
        </div>
        
        <div className="hp-controls">
          <div className="hp-control-group">
            <label>Current HP</label>
            <div className="hp-input-with-buttons">
              <button 
                className="hp-btn hp-decrease" 
                onClick={() => handleHPChange('current', -1)}
              >
                <i className="fas fa-minus"></i>
              </button>
              <input 
                type="number" 
                value={currentHP}
                onChange={(e) => onCurrentHPChange(parseInt(e.target.value) || 0)}
                className="form-input hp-input"
              />
              <button 
                className="hp-btn hp-increase"
                onClick={() => handleHPChange('current', 1)}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
          
          <div className="hp-control-group">
            <label>Max HP</label>
            <div className="hp-input-with-buttons">
              <button 
                className="hp-btn hp-decrease"
                onClick={() => handleHPChange('max', -1)}
              >
                <i className="fas fa-minus"></i>
              </button>
              <input 
                type="number" 
                value={maxHP}
                onChange={(e) => onMaxHPChange(parseInt(e.target.value) || 1)}
                className="form-input hp-input"
              />
              <button 
                className="hp-btn hp-increase"
                onClick={() => handleHPChange('max', 1)}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
          
          <div className="hp-control-group">
            <label>Temp HP</label>
            <div className="hp-input-with-buttons">
              <button 
                className="hp-btn hp-decrease"
                onClick={() => handleHPChange('temp', -1)}
              >
                <i className="fas fa-minus"></i>
              </button>
              <input 
                type="number" 
                value={tempHP}
                onChange={(e) => onTempHPChange(parseInt(e.target.value) || 0)}
                className="form-input hp-input"
              />
              <button 
                className="hp-btn hp-increase"
                onClick={() => handleHPChange('temp', 1)}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className="hp-bar-container">
          <div className="hp-bar-background"></div>
          <div 
            className="hp-bar-fill" 
            style={{ width: `${hpPercentage}%` }}
          />
          {tempHP > 0 && (
            <div 
              className="hp-bar-temp" 
              style={{ width: `${tempHPPercentage}%`, left: `${hpPercentage}%` }}
            />
          )}
          <div className="hp-bar-text">
            <span>{currentHP} / {maxHP}{tempHP > 0 && ` (+${tempHP})`}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

HPBar.propTypes = {
  currentHP: PropTypes.number.isRequired,
  maxHP: PropTypes.number.isRequired,
  tempHP: PropTypes.number,
  onCurrentHPChange: PropTypes.func.isRequired,
  onMaxHPChange: PropTypes.func.isRequired,
  onTempHPChange: PropTypes.func.isRequired
};

export default HPBar;