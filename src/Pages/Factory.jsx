import React from "react";
import { useNavigate } from "react-router-dom";
import "./Factory.css";

const Factory = () => {
  const navigate = useNavigate();

  const sections = [
    { name: "🏬 المخزن الداخلي", path: "/factory/internal-store" },
    { name: "🧾 أوردرات التصنيع", path: "/factory/orders" },
    { name: "🛠️ قسم الصيانة والنظافة", path: "/factory/maintenance" },
    { name: "👨‍🏭 قسم الموظفين", path: "/factory/employees" },
    { name: "📦البضاعه المطلوبه (من الخارج) ", path: "/factory/required-goods" },
    { name: "🚚 البضاعه الوارده (من المصنع التاني) ", path: "/factory/incoming-goods" },
    { name: "🏗️ تحميل العربيات", path: "/factory/loading" },
  ];

  const handleProtectedNavigation = (path) => {
    const password = prompt("أدخل كلمة المرور للدخول:");
    if (password === "1234") {
      navigate(path);
    } else {
      alert("كلمة المرور غير صحيحة.");
    }
  };

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>أقسام المصنع</h2>

      <div className="factory-sections">
        {sections.map((section, index) => (
          <div
            key={index}
            className="factory-card"
            onClick={() => handleProtectedNavigation(section.path)}
          >
            {section.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Factory;
