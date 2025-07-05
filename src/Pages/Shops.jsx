import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Shops.css';

const Shops = () => {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const passwords = {
    barkasaba: '1234',
    qwiesna: '1234',
  };

  const handleAccess = () => {
    if (password === passwords[selectedBranch]) {
      navigate(`/shops/${selectedBranch}`)
    } else {
      setError('كلمة السر غير صحيحة');
    }
  };

  return (
    <div className="shops-container">
      <h2>اختار الفرع</h2>
      <div className="branches">
        <button onClick={() => setSelectedBranch('barkasaba')}>فرع بركة السبع</button>
        <button onClick={() => setSelectedBranch('qwiesna')}>فرع قويسنا</button>
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
