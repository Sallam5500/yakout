// src/pages/IncomingMonthlyReport.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import "../GlobalStyles.css";

const IncomingMonthlyReport = () => {
  const [items, setItems] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "incoming-goods"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(data);
    });
    return () => unsub();
  }, []);

  const filteredItems = items.filter((it) => {
    if (!it.createdAt) return false;
    const date = new Date(it.createdAt.seconds * 1000);
    const itemMonth = date.toISOString().slice(0, 7);
    return itemMonth === month;
  });

  const summary = filteredItems.reduce((acc, item) => {
    if (!acc[item.name]) acc[item.name] = { quantity: 0, unit: item.unit };
    acc[item.name].quantity += Number(item.quantity);
    return acc;
  }, {});

  const exportToExcel = () => {
    const data = Object.entries(summary).map(([name, { quantity, unit }]) => ({
      "الصنف": name,
      "إجمالي الكمية": quantity,
      "الوحدة": unit
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير شهرى");
    const blob = new Blob([
      XLSX.write(wb, { bookType: "xlsx", type: "array" })
    ]);
    saveAs(blob, `تقرير البضاعة الواردة - ${month}.xlsx`);
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📊 تقرير البضاعة الواردة الشهري</h2>

      <input
        type="month" value={month} onChange={(e) => setMonth(e.target.value)}
        style={{ padding: "8px", borderRadius: "6px", fontSize: "16px", marginBottom: "20px" }}
      />

      <button
        onClick={exportToExcel}
        style={{ marginBottom: "15px", padding: "8px 16px", backgroundColor: "#4caf50", color: "white", border: "none", borderRadius: "6px" }}
      >📥 تصدير Excel</button>

      <table className="styled-table">
        <thead>
          <tr><th>الصنف</th><th>إجمالي الكمية</th><th>الوحدة</th></tr>
        </thead>
        <tbody>
          {Object.entries(summary).length === 0 ? (
            <tr><td colSpan="3">لا توجد بيانات لهذا الشهر.</td></tr>
          ) : (
            Object.entries(summary).map(([name, { quantity, unit }]) => (
              <tr key={name}>
                <td>{name}</td><td>{quantity}</td><td>{unit}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default IncomingMonthlyReport;