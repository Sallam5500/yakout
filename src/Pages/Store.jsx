import React from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css";

const Store = () => {
  const navigate = useNavigate();

  return (
    <div className="store-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>المخزن الرئيسي</h2>

      <div className="cards-container">
        <div className="card-section" onClick={() => navigate("/store/stock")} style={{ cursor: "pointer" }}>
          <h3>📦 البضاعة (المخزون الرئيسي)</h3>
          <p>عرض وتسجيل أصناف البضاعة المتوفرة</p>
          <button>الدخول</button>
        </div>

        <div className="card-section" onClick={() => navigate("/store/exports")} style={{ cursor: "pointer" }}>
          <h3>📤 الصادرات</h3>
          <p>تسجيل الصادرات والخصم من المخزون</p>
          <button>الدخول</button>
        </div>
      </div>
    </div>
  );
};

export default Store;
