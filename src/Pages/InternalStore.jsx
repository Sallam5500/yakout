// src/pages/InternalStore.jsx المخزن الي جوا المصنع
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Factory.css"; // نفس تنسيقات الكروت

const InternalStore = () => {
  const navigate = useNavigate();

  const sections = [
    { name: "🏪 المخزن اللي في الشارع", path: "/internal-store/street-store" },
    { name: "🚪 قسم الغرف", path: "/internal-store/rooms" },
  ];

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>المخزن الداخلي</h2>

      <div className="factory-sections">
        {sections.map((section, index) => (
          <div
            key={index}
            className="factory-card"
            onClick={() => navigate(section.path)}
          >
            {section.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InternalStore;