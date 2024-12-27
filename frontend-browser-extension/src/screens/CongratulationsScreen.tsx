import React from 'react';

interface CongratulationsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const CongratulationsScreen: React.FC<CongratulationsScreenProps> = ({ onNext, onBack }) => {
  return (
    <div className="screenContainer">
      <h2>Congratulations!</h2>
      <p>Your setup is almost complete.</p>
      <div className="buttonRow">
        <button className="backButton" onClick={onBack}>Back</button>
        <button className="nextButton" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
};

export default CongratulationsScreen; 