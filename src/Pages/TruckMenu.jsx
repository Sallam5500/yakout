import React from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css"; // نستخدم نفس التنسيق العام

const TruckMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="store-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>تحميل العربيات 🚚</h2>

      <div className="cards-container">
        {/* كارت بركة السبع */}
        <div className="card-section">
          <h3>🏪 محل بركة السبع</h3>
          <p>تحميل البضاعة المرسلة إلى فرع بركة السبع.</p>
          <button onClick={() => navigate("/factory/truck-loading/barka")}>
            دخول ⬅️
          </button>
        </div>

        {/* كارت قويسنا */}
        <div className="card-section">
          <h3>🏬 محل قويسنا</h3>
          <p>تحميل البضاعة المرسلة إلى فرع قويسنا.</p>
          <button onClick={() => navigate("/factory/truck-loading/qwesna")}>
            دخول ⬅️
          </button>
        </div>

        {/* كارت استلام من المصنع */}
        <div className="card-section">
          <h3>🏭 استلام من المصنع</h3>
          <p>تحميل واستلام بضاعة من المصنع إلى المحلات.</p>
          <button onClick={() => navigate("/factory/truck-loading/receive")}>
            دخول ⬅️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TruckMenu;
