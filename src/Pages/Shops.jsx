import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../GlobalStyles.css";

const Shops = () => {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const passwords = {
  barkasaba: ['1234', '2991034'],
  qwiesna: ['1234', '2991034'],
};

const handleAccess = () => {
  if (passwords[selectedBranch]?.includes(password)) {
    navigate(`/shops/${selectedBranch}`);
  } else {
    setError('كلمة السر غير صحيحة');
  }
};


  return (
    <div className="factory-page ">
        <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>اختار الفرع</h2>
    <div className="flex">
        <div className="card-section">
        <button onClick={() => setSelectedBranch('barkasaba')}>فرع بركة السبع</button>
        
      </div>
      <div className="card-section m20">
        <button onClick={() => setSelectedBranch('qwiesna')}>فرع قويسنا</button>
        
      </div>
    </div>

      {selectedBranch && (
        <div className="password-box">
          <h4>كلمة السر لفرع {selectedBranch === 'barkasaba' ? 'بركة السبع' : 'قويسنا'}</h4>
          <input
            type="password"
            placeholder="كلمة السر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleAccess}>دخول</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Shops;
