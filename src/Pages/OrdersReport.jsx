// src/pages/OrdersReport.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "../GlobalStyles.css";

/* كل كولكشنات الأوردر */
const ORDER_COLLECTIONS = [
  "orders-eastern",
  "orders-torte",
  "orders-gateau",
  "orders-cuts",
  "orders-mousse",
  "orders-french-mousse",
];

const today = new Date().toISOString().split("T")[0];

export default function OrdersReport() {
  const nav = useNavigate();
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo]     = useState(today);
  const [data, setData] = useState([]);

  /* === مستمع لحظي يدمج كل الكولكشنات في الفترة المطلوبة === */
  useEffect(() => {
    /* خريطة لتجميع الكميات حسب التاريخ */
    const dateMap = {};

    /* مصفوفة unsub حتى نفصل المستمعين عند تغيير الفترة */
    const unsubs = ORDER_COLLECTIONS.map((colName) => {
      const q = query(
        collection(db, colName),
        where("date", ">=", from),
        where("date", "<=", to),
        orderBy("date")
      );

      return onSnapshot(q, (snap) => {
        /* أعد ضبط map ثم أدمج كل اللقطات مجددًا */
        Object.keys(dateMap).forEach((d) => (dateMap[d] = 0));
        ORDER_COLLECTIONS.forEach((c) => (dateMap[c] = dateMap[c])); // حفاظ

        snap.docs.forEach((d) => {
          const { date, qty = 0 } = d.data();
          dateMap[date] = (dateMap[date] || 0) + qty;
        });

        /* حوّل الخريطة إلى Array مرتبة */
        const arr = Object.entries(dateMap)
          .map(([date, qty]) => ({ date, qty }))
          .sort((a, b) => (a.date > b.date ? 1 : -1));

        setData(arr);
      });
    });

    return () => unsubs.forEach((u) => u && u());
  }, [from, to]);

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => nav(-1)}>
        ⬅ رجوع
      </button>
      <h2 className="page-title">📈 كميات الأوردرات عبر الأيام</h2>

      {/* مدى زمني */}
      <div className="form-row">
        <label>من:</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <label>إلى:</label>
        <input type="date" value={to}   onChange={(e) => setTo(e.target.value)} />
      </div>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="qty" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
