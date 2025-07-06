import React from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css";

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
    if (password === "1234") {
      navigate(path);
    } else {
      alert("كلمة المرور غير صحيحة.");
    }
  };

  return (
    <div className="store-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>📝 أوردرات التصنيع</h2>
      <div className="cards-container">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="card-section"
            onClick={() => handleProtectedNavigate(sec.path)}
            style={{ cursor: "pointer", textAlign: "center" }}
          >
            <h3>{sec.label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersMenu;
