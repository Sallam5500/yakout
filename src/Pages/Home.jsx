// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h2>الصفحة الرئيسية</h2>
      <div className="cards-container">
        <div className="card" onClick={() => navigate('/store')}>المخزن الرئيسي</div>
        <div className="card" onClick={() => navigate('/factory')}>المصنع</div>
        <div className="card" onClick={() => navigate('/shops')}>المحلات</div>
      </div>
    </div>
  );
};

export default Home;
