import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const StockSummary = () => {
  const [summary, setSummary] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "storeItems"), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());

      const aggregated = {};

      data.forEach((item) => {
        const name = item.name;
        const qty = Number(item.quantity) || 0;

        if (aggregated[name]) {
          aggregated[name] += qty;
        } else {
          aggregated[name] = qty;
        }
      });

      const result = Object.entries(aggregated).map(([name, quantity]) => ({
        name,
        quantity,
      }));

      setSummary(result);
    });

    return () => unsubscribe();
  }, []);

  const filtered = summary.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => window.history.back()}>⬅ رجوع</button>

      <h2 className="page-title">📦 ملخص الكمية الإجمالية لكل صنف</h2>

      <div className="form-row">
        <input
          type="text"
          className="search"
          placeholder="🔍 ابحث باسم الصنف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>📦 الصنف</th>
            <th>📊 إجمالي الكمية</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length ? (
            filtered.map((item, index) => (
              <tr key={index}>
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
