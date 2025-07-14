import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import "../GlobalStyles.css";

/* تجميع سريع للبيانات */
const aggregate = (snap, field) =>
  snap.docs.reduce((acc, d) => {
    const { name, quantity = 0 } = d.data();
    acc[name] = (acc[name] || 0) + quantity;
    return acc;
  }, {});

export default function MainSummary() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  /* realtime — يسمع من storeItems + exportItems */
  useEffect(() => {
    const qStore = query(collection(db, "storeItems"), orderBy("name"));
    const unsubStore = onSnapshot(qStore, (storeSnap) => {
      const inMap = aggregate(storeSnap);

      const qOut = query(collection(db, "exportItems"), orderBy("name"));
      const unsubOut = onSnapshot(qOut, (outSnap) => {
        const outMap = aggregate(outSnap);

        const result = Object.keys(inMap).map((n) => ({
          name: n,
          inQty: inMap[n],
          outQty: outMap[n] || 0,
          balance: inMap[n] - (outMap[n] || 0),
        }));

        setRows(result);
        setFiltered(result);
      });

      return () => unsubOut();
    });

    return () => unsubStore();
  }, []);

  const handleSearch = () => {
    const t = search.trim();
    if (!t) return setFiltered(rows);
    setFiltered(rows.filter((r) => r.name.includes(t)));
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => nav(-1)}>
        ⬅ رجوع
      </button>
      <h2 className="page-title">📊 ملخّص المخزن الرئيسي</h2>

      <div className="form-row">
        <input
          placeholder="بحث بالصنف"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>🔍 بحث</button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الداخل الكلي</th>
            <th>الصادر الكلي</th>
            <th>الرصيد</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length ? (
            filtered.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.inQty}</td>
                <td>{r.outQty}</td>
                <td>{r.balance}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">لا توجد بيانات.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
