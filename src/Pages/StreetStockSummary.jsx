// ============================
// StreetStockSummary.jsx  (ملخص المخزن العام)
// ============================
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collectionGroup, onSnapshot } from "firebase/firestore";
import "../GlobalStyles.css";

/* ===== util ===== */
const normalize = (s = "") => s.trim().replace(/\s+/g, " ").toLowerCase();
const mapUnit = (u) => ({
  عدد: "qty", جرام: "g", كيلو: "kg", كيلوجرام: "kg",
  زجاجة: "bottle", كرتونة: "carton", شكاره: "sack",
  كيس: "bag", وجبة: "meal"
}[u] || u);
const CONV = {
  g: { kg: 1 / 1000 }, kg: { g: 1000 },
  bottle: { carton: 1 / 12 }, carton: { bottle: 12 },
  sack: { kg: 50 }, kg: { sack: 1 / 50 },
  bag: { g: 1000 }, g: { bag: 1 / 1000 },
};
const convert = (q, f, t) => {
  if (f === t) return q;
  const F = mapUnit(f), T = mapUnit(t);
  if (CONV[F]?.[T]) return q * CONV[F][T];
  if (CONV[T]?.[F]) return q / CONV[T][F];
  return null; // لا تحويل متاح
};

export default function StreetStockSummary() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [totalQty, setTotalQty] = useState(null);

  /* نراقب items + outs معاً */
  useEffect(() => {
    let itemsDocs = [], outsDocs = [];

    const build = () => {
      const map = new Map();

      [...itemsDocs, ...outsDocs].forEach((d) => {
        /* تجاهل أى وثيقة فى rooms‑out log (الموجب المُكرر) */
        if (d.ref.path.includes("rooms-out/")) return;

        const data = d.data();
        if (!data.name || data.quantity === undefined) return;

        const key   = data.nameKey || normalize(data.name);
        const baseU = map.get(key)?.unit || data.unit;

        if (!map.has(key))
          map.set(key, { name: data.name, unit: baseU, add: 0, out: 0 });

        const row  = map.get(key);
        const conv = convert(data.quantity, data.unit, row.unit);
        if (conv === null) return;

        if (conv >= 0) row.add += conv;
        else           row.out += Math.abs(conv);

        map.set(key, row);
      });

      const list = [...map.entries()].map(([k, v]) => ({
        nameKey:  k,
        name:     v.name,
        unit:     v.unit,
        added:    v.add.toFixed(2),
        deducted: v.out.toFixed(2),
        quantity: (v.add - v.out).toFixed(2)
      }));

      setRows(list);
      setFiltered(list);
    };

    const unsubItems = onSnapshot(collectionGroup(db, "items"), snap => {
      itemsDocs = snap.docs;
      build();
    });
    const unsubOuts  = onSnapshot(collectionGroup(db, "outs"), snap => {
      outsDocs = snap.docs;
      build();
    });
    return () => { unsubItems(); unsubOuts(); };
  }, []);

  /* بحث */
  const handleSearch = () => {
    const term = search.trim().toLowerCase();
    if (!term) { setFiltered(rows); setTotalQty(null); return; }
    const data = rows.filter(r => normalize(r.name).includes(term));
    setFiltered(data);
    setTotalQty(data.reduce((s, r) => s + parseFloat(r.quantity), 0));
  };

  return (
    <div className="page-container" dir="rtl">
      <div className="top-bar">
        <button className="back-button" onClick={() => nav(-1)}>⬅ رجوع</button>
        <button onClick={() => window.print()}>🖨️ طباعة</button>
      </div>
      <h2 className="page-title">📦 ملخص المخزن العام</h2>

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
            🧮 الإجمالي: {totalQty.toFixed(2)}
          </span>
        )}
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>الصنف</th><th>الداخل</th><th>الخصم</th><th>الصافي</th><th>الوحدة</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.nameKey} style={{ background: r.quantity < 0 ? "#1f1e1eff" : "transparent" }}>
              <td>{r.name}</td>
              <td>{r.added}</td>
              <td>{r.deducted}</td>
              <td>{r.quantity}</td>
              <td>{r.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
