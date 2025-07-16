// src/pages/MonthlyRequiredReport.jsx
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const MonthlyRequiredReport = () => {
  const [reportData, setReportData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "required-items"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = {};
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      snap.forEach((doc) => {
        const d = doc.data();
        if (!d.createdAt) return;
        const createdDate = new Date(d.createdAt.seconds * 1000);
        const m = createdDate.getMonth();
        const y = createdDate.getFullYear();
        if (m !== thisMonth || y !== thisYear) return;

        const key = d.name;
        if (!data[key]) {
          data[key] = { name: key, count: 0, totalQty: 0, unit: d.unit };
        }
        data[key].count += 1;
        data[key].totalQty += Number(d.quantity);
      });

      setReportData(Object.values(data));
    });

    return () => unsub();
  }, []);

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📊 تقرير شهري - الاحتياجات من الخارج</h2>

      <table className="styled-table">
        <thead>
          <tr><th>الصنف</th><th>مرات الطلب</th><th>الكمية المطلوبة</th><th>الوحدة</th></tr>
        </thead>
        <tbody>
          {reportData.length === 0 ? (
            <tr><td colSpan="4">لا توجد بيانات لهذا الشهر.</td></tr>
          ) : (
            reportData.map((item, i) => (
              <tr key={i}>
                <td>{item.name}</td>
                <td>{item.count}</td>
                <td>{item.totalQty}</td>
                <td>{item.unit}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyRequiredReport;
