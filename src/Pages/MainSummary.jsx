// src/pages/StockSummary.jsx

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const StockSummary = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "storeItems"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        quantity: doc.data().quantity,
      }));
      setItems(data);
    });

    return () => unsubscribe();
  }, []);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="factory-page" dir="rtl">
      {/* زر الرجوع */}
      <button className="back-btn" onClick={() => window.history.back()}>
        ⬅ رجوع
      </button>

      <h2 className="page-title">📦 ملخص الكمية المتوفرة فقط</h2>

      {/* البحث */}
      <div className="form-row">
        <input
          type="text"
          className="search"
          placeholder="🔍 ابحث باسم الصنف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* جدول */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>📦 الصنف</th>
            <th>📊 الكمية المتوفرة</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length ? (
            filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">لا توجد بيانات.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockSummary;
