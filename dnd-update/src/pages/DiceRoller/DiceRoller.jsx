import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import PageContainer from '../../components/PageContainer/PageContainer';
import IsometricDice from '../../components/IsometricDice/IsometricDice';
import './DiceRoller.css';

const DiceItem = ({ dice, icon, selected, onClick }) => (
  <div 
    className={`dice-item ${selected ? 'selected' : ''}`}
    data-dice={dice}
    onClick={onClick}
  >
    <i className={icon}></i>
    <span>{dice.toUpperCase()}</span>
  </div>
);

DiceItem.propTypes = {
  dice: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

const DiceRoller = () => {
  const { user } = useAuth();
  const [selectedDice, setSelectedDice] = useState('d20');
  const [viewMode, setViewMode] = useState('2d');
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollHistory, setRollHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState('Roll the dice to see results');
  const [currentTotal, setCurrentTotal] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [diceToRoll, setDiceToRoll] = useState([]);


  const diceTypes = [
    { type: 'd4', icon: 'fas fa-dice-d4', sides: 4 },
    { type: 'd6', icon: 'fas fa-dice-d6', sides: 6 },
    { type: 'd8', icon: 'fas fa-dice-one', sides: 8 },
    { type: 'd10', icon: 'fas fa-dice-two', sides: 10 },
    { type: 'd12', icon: 'fas fa-dice-three', sides: 12 },
    { type: 'd20', icon: 'fas fa-dice-d20', sides: 20 },
    { type: 'd100', icon: 'fas fa-dice-five', sides: 100 }
  ];

  const handleDiceSelect = (diceType) => {
    setSelectedDice(diceType);
  };

  const handleViewToggle = (mode) => {
    setViewMode(mode);
    // In a real implementation, this would toggle between 2D and 3D rendering
  };

  const handleDiceCountChange = (delta) => {
    const newCount = Math.max(1, Math.min(10, diceCount + delta));
    setDiceCount(newCount);
  };

  const handleModifierChange = (delta) => {
    const newModifier = Math.max(-20, Math.min(20, modifier + delta));
    setModifier(newModifier);
  };

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    
    if (viewMode === '3d') {
      // Create array of dice for 3D rolling with unique IDs
      const dice = [];
      const rollId = Date.now();
      for (let i = 0; i < diceCount; i++) {
        dice.push({ type: selectedDice, id: rollId + i });
      }
      console.log('Rolling 3D dice:', dice);
      setDiceToRoll(dice);
    } else {
      // 2D rolling logic with animation
      const diceInfo = diceTypes.find(d => d.type === selectedDice);
      
      // Show rolling animation immediately
      console.log('Starting 2D dice roll animation');
      
      // Simulate rolling animation
      setTimeout(() => {
        const rolls = [];
        let total = 0;

        for (let i = 0; i < diceCount; i++) {
          const roll = Math.floor(Math.random() * diceInfo.sides) + 1;
          rolls.push(roll);
          total += roll;
        }

        total += modifier;

        handleRollComplete({
          individual: rolls.reduce((acc, roll, i) => ({ ...acc, [i]: roll }), {}),
          totals: { [selectedDice]: rolls.reduce((a, b) => a + b, 0) },
          grandTotal: total - modifier
        });
      }, 1000); // 1 second animation delay
    }
  };

  const handleRollComplete = (results) => {
    const rolls = Object.values(results.individual);
    const total = results.grandTotal + modifier;

    // Update results
    const rollString = rolls.join(' + ');
    const modifierString = modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : '';
    setCurrentResult(`${rollString}${modifierString}`);
    setCurrentTotal(total);

    // Add to history
    const historyEntry = {
      id: Date.now(),
      dice: `${diceCount}${selectedDice}${modifierString}`,
      rolls: rolls,
      modifier: modifier,
      total: total,
      timestamp: new Date().toLocaleTimeString()
    };
    setRollHistory([historyEntry, ...rollHistory.slice(0, 9)]);

    setIsRolling(false);
    // Don't clear dice immediately - let them stay visible
    // setDiceToRoll([]); 
  };

  const clearTable = () => {
    setCurrentResult('Roll the dice to see results');
    setCurrentTotal(0);
    setRollHistory([]);
    setDiceToRoll([]);
    setIsRolling(false);
  };

  return (
    <div className="app">
      <Navbar 
        username={user?.username}
        activePage="dice-roller"
      />

      <main className="main-content">
        <PageContainer>
          <div className="dashboard-header">
            <h2>Virtual Dice Table</h2>
            <p>Select and roll 3D dice with realistic physics</p>
          </div>

          <div className="dice-container">
            <div className="dice-options">
              <div className="dice-selector">
                <h3>Select Dice</h3>
                <div className="dice-grid">
                  {diceTypes.map(dice => (
                    <DiceItem
                      key={dice.type}
                      dice={dice.type}
                      icon={dice.icon}
                      selected={selectedDice === dice.type}
                      onClick={() => handleDiceSelect(dice.type)}
                    />
                  ))}
                </div>
              </div>

              <div className="view-toggle">
                <h3>View Mode</h3>
                <div className="toggle-buttons">
                  <button 
                    id="toggle-2d" 
                    className={`toggle-button ${viewMode === '2d' ? 'active' : ''}`}
                    onClick={() => handleViewToggle('2d')}
                  >
                    2D View
                  </button>
                  <button 
                    id="toggle-3d" 
                    className={`toggle-button ${viewMode === '3d' ? 'active' : ''}`}
                    onClick={() => handleViewToggle('3d')}
                  >
                    3D View
                  </button>
                </div>
              </div>

              <div className="dice-actions">
                <div className="dice-amount">
                  <label htmlFor="dice-count">Number of Dice:</label>
                  <div className="dice-counter">
                    <button 
                      id="decrease-dice" 
                      className="dice-btn"
                      onClick={() => handleDiceCountChange(-1)}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      id="dice-count" 
                      value={diceCount} 
                      min="1" 
                      max="10"
                      onChange={(e) => setDiceCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    />
                    <button 
                      id="increase-dice" 
                      className="dice-btn"
                      onClick={() => handleDiceCountChange(1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="dice-modifier">
                  <label htmlFor="dice-modifier">Modifier:</label>
                  <div className="dice-counter">
                    <button 
                      id="decrease-mod" 
                      className="dice-btn"
                      onClick={() => handleModifierChange(-1)}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      id="dice-modifier" 
                      value={modifier} 
                      min="-20" 
                      max="20"
                      onChange={(e) => setModifier(Math.max(-20, Math.min(20, parseInt(e.target.value) || 0)))}
                    />
                    <button 
                      id="increase-mod" 
                      className="dice-btn"
                      onClick={() => handleModifierChange(1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  id="roll-dice" 
                  className={`roll-button ${isRolling ? 'rolling' : ''}`}
                  onClick={rollDice}
                  disabled={isRolling}
                >
                  <i className="fas fa-dice"></i> {isRolling ? 'Rolling...' : 'Roll Dice'}
                </button>

                <button id="clear-dice" className="clear-button" onClick={clearTable}>
                  <i className="fas fa-trash"></i> Clear Table
                </button>
              </div>

              <div className="roll-history">
                <h3>Roll History</h3>
                <div id="roll-log">
                  {rollHistory.length === 0 ? (
                    <div className="roll-log-entry">
                      <span className="roll-log-result">No rolls yet</span>
                    </div>
                  ) : (
                    rollHistory.map(entry => (
                      <div key={entry.id} className="roll-log-entry">
                        <span className="roll-log-dice">{entry.dice}</span>
                        <span className="roll-log-result">
                          Rolls: {entry.rolls.join(', ')}
                          {entry.modifier !== 0 && ` (${entry.modifier >= 0 ? '+' : ''}${entry.modifier})`}
                        </span>
                        <span className="roll-log-total">Total: {entry.total}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="dice-table-container">
              <div id="dice-canvas-container" className={viewMode === '3d' ? 'mode-3d' : ''}>
                {viewMode === '3d' ? (
                  <IsometricDice 
                    dice={diceToRoll} 
                    onRollComplete={handleRollComplete}
                  />
                ) : (
                  <div className="dice-2d-display">
                    <div className="dice-2d-result">
                      {isRolling ? (
                        <>
                          <i className="fas fa-dice fa-spin"></i>
                          <div style={{ marginTop: '1rem', fontSize: '1.5rem' }}>Rolling...</div>
                        </>
                      ) : (
                        <>
                          {diceTypes.find(d => d.type === selectedDice) && (
                            <i className={diceTypes.find(d => d.type === selectedDice).icon}></i>
                          )}
                          <div style={{ marginTop: '1rem', fontSize: '1.5rem' }}>
                            {currentTotal > 0 ? `Rolled ${currentResult}` : 'Click Roll Dice'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="dice-results">
                <div id="dice-result" className="result-display">
                  <span>{currentResult}</span>
                </div>
                <div id="dice-total" className="total-display">
                  <span>Total: {currentTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 LuesHub D&D. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DiceRoller;