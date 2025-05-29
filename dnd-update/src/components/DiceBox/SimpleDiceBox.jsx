import React, { useState, useEffect } from 'react';
import './DiceBox.css';

const SimpleDiceBox = ({ dice = [], onRollComplete }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [results, setResults] = useState({});
  const [displayResults, setDisplayResults] = useState(false);

  useEffect(() => {
    if (dice.length > 0 && !isRolling) {
      rollDice();
    }
  }, [dice]);

  const getDiceSides = (type) => {
    const sides = {
      'd4': 4,
      'd6': 6,
      'd8': 8,
      'd10': 10,
      'd12': 12,
      'd20': 20,
      'd100': 100
    };
    return sides[type] || 6;
  };

  const rollDice = () => {
    if (dice.length === 0) return;
    
    setIsRolling(true);
    setDisplayResults(false);
    setResults({});

    // Simulate rolling animation
    setTimeout(() => {
      const newResults = {};
      dice.forEach((die, index) => {
        const sides = getDiceSides(die.type);
        newResults[index] = Math.floor(Math.random() * sides) + 1;
      });

      setResults(newResults);
      setDisplayResults(true);
      setIsRolling(false);

      // Calculate totals
      const totals = dice.reduce((acc, die, index) => {
        acc[die.type] = (acc[die.type] || 0) + newResults[index];
        return acc;
      }, {});

      const grandTotal = Object.values(newResults).reduce((a, b) => a + b, 0);

      if (onRollComplete) {
        onRollComplete({
          individual: newResults,
          totals,
          grandTotal
        });
      }
    }, 2000); // 2 second roll animation
  };

  const getDiceIcon = (type) => {
    const icons = {
      'd4': 'fas fa-dice-d4',
      'd6': 'fas fa-dice-d6',
      'd8': 'fas fa-dice-one',
      'd10': 'fas fa-dice-two',
      'd12': 'fas fa-dice-three',
      'd20': 'fas fa-dice-d20',
      'd100': 'fas fa-percentage'
    };
    return icons[type] || 'fas fa-dice';
  };

  return (
    <div className="simple-dice-box">
      <div className="dice-3d-area">
        {dice.length === 0 ? (
          <div className="dice-placeholder">
            <i className="fas fa-dice fa-3x"></i>
            <p>Select dice and click "Roll Dice" to begin</p>
          </div>
        ) : (
          <div className="dice-animation-area">
            {dice.map((die, index) => (
              <div 
                key={index} 
                className={`animated-die ${isRolling ? 'rolling' : ''} ${displayResults ? 'settled' : ''}`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <i className={getDiceIcon(die.type)}></i>
                {displayResults && (
                  <div className="die-result">{results[index]}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {isRolling && (
        <div className="rolling-indicator">
          <i className="fas fa-dice fa-spin"></i>
          <span>Rolling...</span>
        </div>
      )}
    </div>
  );
};

export default SimpleDiceBox;