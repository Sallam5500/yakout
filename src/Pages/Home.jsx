// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    const password = prompt('من فضلك ادخل كلمة المرور:');
    const correctPassword = '1234'; // هنا حط الباسورد اللي انت عايزه

    if (password === correctPassword) {
      navigate(path);
    } else {
      alert('كلمة المرور غير صحيحة!');
    }
  };

  return (
    <div className="home-container">
        <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>الصفحة الرئيسية</h2>
      <div className="cards-container">
        <div className="card" onClick={() => handleNavigation('/store')}>المخزن الرئيسي</div>
        <div className="card" onClick={() => handleNavigation('/factory')}>المصنع</div>
        <div className="card" onClick={() => handleNavigation('/shops')}>المحلات</div>
      </div>
    </div>
  );
};

export default Home;
