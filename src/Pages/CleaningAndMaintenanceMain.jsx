import React from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css";

const CleaningAndMaintenanceMain = () => {
  const navigate = useNavigate();

  return (
    <div className="store-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>🧹 قسم النظافة والصيانة</h2>

      <div className="cards-container">
        {/* كارت النظافة */}
        <div className="card-section clickable" onClick={() => navigate("/cleaning")}>
          <h3>🧽 النظافة</h3>
          <p>إدارة مهام وأعمال النظافة اليومية داخل المصنع</p>
        </div>

        {/* كارت الصيانة الداخلية */}
        <div className="card-section clickable" onClick={() => navigate("/maintenance-internal")}>
          <h3>🛠️ الصيانة الداخلية</h3>
          <p>تسجيل أعمال الصيانة التي تمت داخل المصنع</p>
        </div>

        {/* كارت الصيانة الخارجية */}
        <div className="card-section clickable" onClick={() => navigate("/maintenance-external")}>
          <h3>🔩 الصيانة الخارجية</h3>
          <p>تسجيل أي أعمال صيانة تمت خارج المصنع</p>
        </div>
      </div>
    </div>
  );
};

export default CleaningAndMaintenanceMain;
