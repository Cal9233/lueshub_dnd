import React, { useState, useRef, useEffect } from 'react';
import './SimpleDice.css';

const SimpleDice = ({ onRoll, allowMultiple = true }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState(null);
  const [diceNotation, setDiceNotation] = useState('1d20');
  const [rollHistory, setRollHistory] = useState([]);
  const diceRef = useRef(null);

  // Common dice presets
  const dicePresets = [
    { label: 'd4', value: '1d4' },
    { label: 'd6', value: '1d6' },
    { label: 'd8', value: '1d8' },
    { label: 'd10', value: '1d10' },
    { label: 'd12', value: '1d12' },
    { label: 'd20', value: '1d20' },
    { label: 'd100', value: '1d100' }
  ];

  const rollDice = async (notation = diceNotation) => {
    if (isRolling) return;

    setIsRolling(true);
    
    try {
      // Animate dice
      if (diceRef.current) {
        diceRef.current.classList.add('rolling');
      }

      // Make API call
      const response = await fetch('/dnd-update/api/roll.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          dice: notation,
          roll_type: 'manual'
        })
      });

      if (!response.ok) {
        throw new Error('Roll failed');
      }

      const data = await response.json();
      
      // Simulate rolling animation delay
      setTimeout(() => {
        setCurrentRoll(data.result);
        setRollHistory(prev => [data.result, ...prev].slice(0, 10));
        
        if (diceRef.current) {
          diceRef.current.classList.remove('rolling');
        }
        
        setIsRolling(false);
        
        if (onRoll) {
          onRoll(data.result);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Roll error:', error);
      setIsRolling(false);
      if (diceRef.current) {
        diceRef.current.classList.remove('rolling');
      }
    }
  };

  const handleNotationChange = (e) => {
    const value = e.target.value;
    // Basic validation for dice notation
    if (/^\d*d?\d*[\+\-]?\d*$/.test(value) || value === '') {
      setDiceNotation(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && diceNotation && !isRolling) {
      rollDice();
    }
  };

  return (
    <div className="simple-dice-container">
      <div className="dice-input-section">
        <input
          type="text"
          value={diceNotation}
          onChange={handleNotationChange}
          onKeyPress={handleKeyPress}
          placeholder="e.g., 3d6+2"
          className="dice-notation-input"
          disabled={isRolling}
        />
        <button
          onClick={() => rollDice()}
          disabled={isRolling || !diceNotation}
          className="roll-button"
        >
          {isRolling ? 'Rolling...' : 'Roll'}
        </button>
      </div>

      <div className="dice-presets">
        {dicePresets.map(preset => (
          <button
            key={preset.value}
            onClick={() => {
              setDiceNotation(preset.value);
              rollDice(preset.value);
            }}
            disabled={isRolling}
            className="preset-button"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="dice-display" ref={diceRef}>
        {currentRoll && (
          <div className="current-roll">
            <div className="roll-total">{currentRoll.total}</div>
            <div className="roll-details">
              {currentRoll.rolls.join(' + ')}
              {currentRoll.modifier !== 0 && (
                <span> {currentRoll.modifier > 0 ? '+' : ''}{currentRoll.modifier}</span>
              )}
            </div>
            {currentRoll.critical && (
              <div className={`critical-indicator ${currentRoll.critical}`}>
                {currentRoll.critical === 'hit' ? 'Critical Hit!' : 'Critical Miss!'}
              </div>
            )}
          </div>
        )}
      </div>

      {rollHistory.length > 0 && (
        <div className="roll-history">
          <h4>Recent Rolls</h4>
          <div className="history-list">
            {rollHistory.map((roll, index) => (
              <div key={index} className="history-item">
                <span className="history-notation">{roll.notation}</span>
                <span className="history-total">{roll.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDice;