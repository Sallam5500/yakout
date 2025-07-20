import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import "../GlobalStyles.css";

/* بدون التقطيعات */
const ORDER_COLLECTIONS = [
  { name: "orders-eastern", label: "الحلويات الشرقية" },
  { name: "orders-torte", label: "التورت" },
  { name: "orders-gateau", label: "الجاتوه" },
  { name: "orders-mousse", label: "الموس" },
  { name: "orders-french-mousse", label: "الموس الفرنسي" },
];

const today = new Date().toISOString().split("T")[0];

export default function OrdersReport() {
  const nav = useNavigate();
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo] = useState(today);
  const [itemsData, setItemsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ إضافة البحث

  useEffect(() => {
    const fetchAllOrders = async () => {
      const itemMap = {};

      for (const { name, label } of ORDER_COLLECTIONS) {
        const q = query(
          collection(db, name),
          where("date", ">=", from),
          where("date", "<=", to)
        );

        const snap = await getDocs(q);
        snap.forEach((doc) => {
          const { item, qty = 0 } = doc.data();
          if (!item) return;

          if (!itemMap[item]) {
            itemMap[item] = { name: item, section: label, total: 0 };
          }
          itemMap[item].total += Number(qty);
        });
      }

      const result = Object.values(itemMap);
      setItemsData(result);
    };

    fetchAllOrders();
  }, [from, to]);

  // ✅ فلترة البيانات حسب البحث
  const filteredData = itemsData.filter(
    (row) =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => nav(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📊 تقرير إجمالي أوردرات التصنيع</h2>

      {/* فلترة بالتاريخ */}
      <div className="form-row">
        <label>من:</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <label>إلى:</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {/* 🔍 مربع البحث */}
      <div className="form-row">
        <label>بحث:</label>
        <input
          type="text"
          placeholder="ابحث باسم الصنف أو القسم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* جدول مجمع */}
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>الصنف</th>
              <th>القسم</th>
              <th>إجمالي الكمية</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length ? filteredData.map((row, index) => (
              <tr key={index}>
                <td>{row.name}</td>
                <td>{row.section}</td>
                <td>{row.total}</td>
              </tr>
            )) : <tr><td colSpan="3">لا توجد بيانات في هذه الفترة أو لا تطابق البحث.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* رسم بياني */}
      <div style={{ width: "100%", height: 400, marginTop: "2rem" }}>
        <ResponsiveContainer>
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#0077cc" name="إجمالي الكمية" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
