import React, { useState } from 'react';
import { storeIndustry } from '../localCache/localCache';

interface SelectIndustryScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const industries = [
  'Automotive', 'Retail and E-commerce', 'Energy (Oil and Gas)',
  'Food and Beverage', 'Pharmaceuticals and Healthcare', 'Consumer Electronics',
  'Agriculture and Commodities', 'Textiles and Apparel', 'Chemicals and Petrochemicals',
  'Construction Materials', 'Mining and Natural Resources', 'Aerospace and Defense',
  'Furniture and Home Goods', 'Technology and IT Equipment', 'Machinery and Equipment'
];

const SelectIndustryScreen: React.FC<SelectIndustryScreenProps> = ({ onNext, onBack }) => {
  const [industry, setIndustry] = useState(industries[0]);

  const handleNext = () => {
    storeIndustry(industry);
    onNext();
  };

  return (
    <div className="screenContainer">
      <h2>Select Industry</h2>
      <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
        {industries.map((ind) => (
          <option key={ind} value={ind}>{ind}</option>
        ))}
      </select>
      <div className="buttonRow">
        <button className="backButton" onClick={onBack}>Back</button>
        <button className="nextButton" onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

export default SelectIndustryScreen; 