// src/pages/Store.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

export default function Store() {
  const navigate = useNavigate();

  return (
    <div className="store-page">
      <button className="back-btn text-center" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="text-center">المخزن الرئيسي</h2>

      <div className="cards-container">
        {/* البضاعة */}
        <div className="card-section" onClick={() => navigate("/store/stock")}>
          <h3>📦 البضاعة (المخزون الرئيسي)</h3>
          <p>عرض وتسجيل أصناف البضاعة المتوفرة</p>
          <button>الدخول</button>
        </div>

        {/* الصادرات */}
        <div className="card-section" onClick={() => navigate("/store/exports")}>
          <h3>📤 الصادرات</h3>
          <p>تسجيل الصادرات والخصم من المخزون</p>
          <button>الدخول</button>
        </div>

        {/* ملخّص المخزن */}
        <div
          className="card-section"
          onClick={() => navigate("/store/main-summary")}  
        >
          <h3>📊 ملخّص المخزن</h3>
          <p>إجمالي الداخل والخارج ورصيد كل صنف</p>
          <button>الدخول</button>
        </div>
      </div>
    </div>
  );
}
