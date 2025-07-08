import React from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const CleaningAndMaintenanceMain = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "🧽 النظافة",
      desc: "إدارة مهام وأعمال النظافة اليومية داخل المصنع",
      path: "/cleaning",
    },
    {
      title: "🛠️ الصيانة الداخلية",
      desc: "تسجيل أعمال الصيانة التي تمت داخل المصنع",
      path: "/maintenance-internal",
    },
    {
      title: "🔩 الصيانة الخارجية",
      desc: "تسجيل أي أعمال صيانة تمت خارج المصنع",
      path: "/maintenance-external",
    },
  ];

  return (
    <div className="store-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🧹 قسم النظافة والصيانة</h2>

      <div className="cards-container">
        {sections.map((section, index) => (
          <div
            key={index}
            className="card-section clickable"
            onClick={() => navigate(section.path)}
          >
            <h3>{section.title}</h3>
            <p>{section.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CleaningAndMaintenanceMain;
