import React, { useState, useEffect } from 'react';
import './SimpleDice.css';

const SimpleDice = ({ sides, onRoll, isRolling }) => {
  const [displayValue, setDisplayValue] = useState(sides);
  const [animationPhase, setAnimationPhase] = useState('idle');
  
  useEffect(() => {
    if (isRolling) {
      setAnimationPhase('rolling');
      
      // Show random values during roll
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * sides) + 1);
      }, 100);
      
      // After 1.5 seconds, show the final result
      setTimeout(() => {
        clearInterval(interval);
        const result = Math.floor(Math.random() * sides) + 1;
        setDisplayValue(result);
        setAnimationPhase('result');
        onRoll(result);
      }, 1500);
      
      return () => clearInterval(interval);
    } else {
      setAnimationPhase('idle');
      setDisplayValue(sides);
    }
  }, [isRolling, onRoll]);
  
  const getDiceIcon = () => {
    const diceIcons = {
      4: '🎲', 
      6: '🎲',
      8: '🎲',
      10: '🎲',
      12: '🎲',
      20: '🎲',
      100: '💯'
    };
    
    return diceIcons[sides] || '🎲';
  };
  
  return (
    <div className={`simple-dice d${sides} ${animationPhase}`}>
      <div className="dice-face">
        <span className="dice-icon">{getDiceIcon()}</span>
        <div className="dice-value">{displayValue}</div>
      </div>
    </div>
  );
};

export default SimpleDice;