// src/pages/TruckMonthlyReport.jsx
import React, { useEffect, useState } from "react";
import {
  collectionGroup,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const TruckMonthlyReport = () => {
  const [records, setRecords] = useState([]);
  const [reportType, setReportType] = useState("monthly"); // monthly or weekly
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collectionGroup(db, "records"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRecords(all);
    });
    return () => unsub();
  }, []);

  // 🧠 فلترة حسب نوع التقرير
  const filtered = records.filter((rec) => {
    if (!rec.createdAt) return false;
    const date = new Date(rec.createdAt.seconds * 1000);
    const today = new Date();

    if (reportType === "monthly") {
      const selectedMonth = new Date(`${month}-01`);
      return (
        date.getFullYear() === selectedMonth.getFullYear() &&
        date.getMonth() === selectedMonth.getMonth() &&
        date <= today
      );
    }

    if (reportType === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      return date >= oneWeekAgo && date <= today;
    }

    return false;
  });

  // ✅ تجميع البيانات حسب الفرع والصنف
  const summary = {};
  filtered.forEach((rec) => {
    const branch = rec.branch || "غير معروف";
    const item = rec.item || "غير محدد";
    const key = `${branch}__${item}`;
    if (!summary[key]) {
      summary[key] = {
        branch,
        item,
        total: 0,
      };
    }
    summary[key].total += Number(rec.quantity || 0);
  });

  // ✅ ترتيب التجميع حسب الفروع
  const branches = {};
  Object.values(summary).forEach((row) => {
    if (!branches[row.branch]) branches[row.branch] = [];
    branches[row.branch].push(row);
  });

  const formattedTitle =
    reportType === "weekly"
      ? "📆 تقرير آخر 7 أيام"
      : `📦 التقرير الشهري لـ ${month}`;

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">{formattedTitle}</h2>

      <div className="form-row">
        <label>نوع التقرير:</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px" }}
        >
          <option value="monthly">شهري</option>
          <option value="weekly">آخر 7 أيام</option>
        </select>

        {reportType === "monthly" && (
          <>
            <label style={{ marginInlineStart: "15px" }}>اختر الشهر:</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ padding: "10px", fontSize: "16px", borderRadius: "6px" }}
            />
          </>
        )}
      </div>

      {Object.keys(branches).length === 0 ? (
        <p style={{ textAlign: "center" }}>لا توجد بيانات لهذا التقرير.</p>
      ) : (
        Object.entries(branches).map(([branch, data]) => (
          <div key={branch}>
            <h3 style={{ marginTop: "20px" }}>🏪 {branch}</h3>
            <table className="styled-table">
              <thead>
                <tr><th>الصنف</th><th>إجمالي الكمية</th></tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.item}>
                    <td>{row.item}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default TruckMonthlyReport;
