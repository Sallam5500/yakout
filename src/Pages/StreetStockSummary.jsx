import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collectionGroup, onSnapshot } from "firebase/firestore";
import "../GlobalStyles.css";

/* تطبيع النص (للبحث والتجميع) */
const normalize = (s = "") => String(s).trim().replace(/\s+/g, " ").toLowerCase();

/* تحديد السجل: إضافة أو خصم بناءً على مسار الوثيقة */
const isAddition = (path) => /(?:street-store|rooms-store)/.test(path);
const isDeduction = (path) => /(?:street-out|rooms-out)/.test(path);

const StreetStockSummary = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);      // كل الأصناف بصافي الكمية
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [totalQty, setTotalQty] = useState(null);

  /* ✔️ اجمع كل سجلات items من الشارع والغرف (دخول وخروج) */
  useEffect(() => {
    const unsub = onSnapshot(collectionGroup(db, "items"), (snap) => {
      const addMap = new Map();    // إجمالي الإضافات لكل صنف
      const outMap = new Map();    // إجمالي الخصم لكل صنف

      snap.docs.forEach((d) => {
        const data = d.data();
        if (!data.name) return;          // تجاهل السجلات الناقصة
        const key = data.nameKey || normalize(data.name);
        const qty = parseFloat(data.quantity) || 0;

        if (isAddition(d.ref.path)) {
          addMap.set(key, (addMap.get(key) || 0) + qty);
        } else if (isDeduction(d.ref.path)) {
          outMap.set(key, (outMap.get(key) || 0) + qty);
        }
      });

      const result = [];
      addMap.forEach((inQty, key) => {
        const outQty = outMap.get(key) || 0;
        result.push({
          nameKey: key,
          name: key,       // يمكن لاحقًا حفظ الاسم الأصلي لو حبيت
          added: inQty,
          deducted: outQty,
          quantity: inQty - outQty,
        });
      });

      setRows(result);
      setFiltered(result);
    });
    return () => unsub();
  }, []);

  /* 🔍 البحث */
  const handleSearch = () => {
    const term = search.trim().toLowerCase();
    if (!term) {
      setFiltered(rows);
      setTotalQty(null);
      return;
    }
    const data = rows.filter((r) => normalize(r.name).includes(term));
    setFiltered(data);
    const tot = data.reduce((sum, r) => sum + r.quantity, 0);
    setTotalQty(tot);
  };

  return (
    <div className="page-container" dir="rtl">
      <div className="top-bar">
        <button className="back-button" onClick={() => navigate(-1)}>⬅ رجوع</button>
        <button onClick={() => window.print()}>🖨️ طباعة</button>
      </div>

      <h2 className="page-title">📦 ملخص المخزن العام</h2>

      {/* شريط البحث */}
      <div className="form-row">
        <input
          type="text"
          placeholder="ابحث بالصنف"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>🔍 بحث</button>
        {totalQty !== null && (
          <span style={{ marginRight: "1rem", color: "#00ff80", fontWeight: "bold" }}>
            🧮 الإجمالي: {totalQty}
          </span>
        )}
      </div>

      {/* جدول النتائج */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الداخل الكلي</th>
            <th>الخصم الكلي</th>
            <th>الصافي المتبقي</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.nameKey}>
              <td>{r.name}</td>
              <td>{r.added}</td>
              <td>{r.deducted}</td>
              <td>{r.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StreetStockSummary;
