// src/pages/factory/InternalStore.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const InternalStore = () => {
  const navigate = useNavigate();

  return (
    <div className="section-page">
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "15px",
          padding: "6px 12px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        ⬅ رجوع
      </button>

      <h2>المخزن الداخلي</h2>

      {/* هنا تقدر تبدأ تضيف الكروت أو المحتوى الخاص بالمخزن */}
    </div>
  );
};

export default InternalStore;