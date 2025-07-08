// src/pages/OrdersMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const OrdersMenu = () => {
  const navigate = useNavigate();

  const sections = [
    { label: "🍬 الحلويات الشرقية", path: "/factory/orders/eastern" },
    { label: "🍰 الجاتوه", path: "/factory/orders/gateau" },
    { label: "🎂 التورت", path: "/factory/orders/torte" },
    { label: "🔪 التقطيعات", path: "/factory/orders/cuts" },
    { label: "🍧 الموس", path: "/factory/orders/mousse" },
    { label: "🍮 الموس الفرنسي", path: "/factory/orders/french-mousse" },
  ];

  const handleProtectedNavigate = (path) => {
    const password = prompt("من فضلك ادخل كلمة المرور للدخول:");
    if (password === "1234" || password === "2991034") {
      navigate(path);
    } else {
      alert("كلمة المرور غير صحيحة.");
    }
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📝 أوردرات التصنيع</h2>

      <div className="factory-sections">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="factory-card"
            onClick={() => handleProtectedNavigate(sec.path)}
          >
            {sec.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersMenu;
