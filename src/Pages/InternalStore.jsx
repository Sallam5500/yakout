import React from "react";
import { useNavigate } from "react-router-dom";

const InternalStore = () => {
  const navigate = useNavigate();

  /* ✨ ضفت كارت الملخص */
  const sections = [
    { name: "📦 ملخص المخزن",          path: "/street-stock-summary" },
    { name: "🏪 المخزن اللي في الشارع", path: "/internal-store/street-store" },
    { name: "🚪 قسم الغرف",             path: "/internal-store/rooms" },
    { name: "📤 الصادر من المخزن",      path: "/internal-store/street-out" },
    { name: "📤 الصادر من الغرف",       path: "/internal-store/rooms-out" },
  ];

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>المخزن الداخلي</h2>

      <div className="factory-sections">
        {sections.map((section, idx) => (
          <div
            key={idx}
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
