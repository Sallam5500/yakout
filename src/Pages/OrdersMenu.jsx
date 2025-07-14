// src/pages/OrdersMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const OrdersMenu = () => {
  const navigate = useNavigate();

  const sections = [
    { label: "🍬 الحلويات الشرقية", path: "/factory/orders/eastern" },
    { label: "🍰 الجاتوه",           path: "/factory/orders/gateau"  },
    { label: "🎂 التورت",            path: "/factory/orders/torte"   },
    { label: "🔪 التقطيعات",         path: "/factory/orders/cuts"    },
    { label: "🍧 الموس",             path: "/factory/orders/mousse"  },
    { label: "🍮 الموس الفرنسي",      path: "/factory/orders/french-mousse" },
    { label: "📈 تقرير الأوردرات",    path: "/factory/orders/report" }   // ⭐ الكارت الجديد
  ];

  const askPwd = (path) => {
    const ok = ["1234", "2991034"].includes(prompt("من فضلك أدخل كلمة المرور:"));
    ok ? navigate(path) : alert("كلمة المرور غير صحيحة.");
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📝 أوردرات التصنيع</h2>

      <div className="cards-container" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"15px" }}>
        {sections.map(({label, path}) => (
          <div key={path} className="factory-card" onClick={() => askPwd(path)}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersMenu;
