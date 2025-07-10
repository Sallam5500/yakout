import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../GlobalStyles.css";

const Home = () => {
  const navigate = useNavigate();
  const [animationKey, setAnimationKey] = useState(0);

  const handleNavigation = (path) => {
    const password = prompt('من فضلك ادخل كلمة المرور:');
    const correctPasswords = ['1234', '2991034'];
    if (correctPasswords.includes(password)) {
      navigate(path);
    } else {
      alert('كلمة المرور غير صحيحة!');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>

      {/* 🌀 الأنميشن بتاع اسم "Yaqoot Sweet" */}
      <div className="welcome-text" key={animationKey}>
  {"Yakoot Sweet".split("").map((char, i) => (
    <span
      key={i}
      className="animated-char"
      style={{ animationDelay: `${i * 0.5}s` }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ))}
</div>


      <h2 className="page-title">الصفحة الرئيسية</h2>

      <div className="cards-container">
        <div className="card" onClick={() => handleNavigation('/store')}>📦 المخزن الرئيسي</div>
        <div className="card" onClick={() => handleNavigation('/factory')}>🏭 المصنع</div>
        <div className="card" onClick={() => handleNavigation('/shops')}>🏪 المحلات</div>
      </div>
    </div>
  );
};

export default Home;
