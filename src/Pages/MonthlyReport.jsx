// src/pages/MonthlyReport.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../GlobalStyles.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const MonthlyReport = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.toISOString().slice(0, 7));
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cleaningData, setCleaningData] = useState([]);
  const [internalData, setInternalData] = useState([]);
  const [externalData, setExternalData] = useState([]);

  const fetchAllData = async () => {
    const fetchData = async (collectionName) => {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    };

    const [c, i, e] = await Promise.all([
      fetchData("cleaningTasks"),
      fetchData("internalMaintenanceTasks"),
      fetchData("externalMaintenanceTasks"),
    ]);

    setCleaningData(c);
    setInternalData(i);
    setExternalData(e);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const isInDateRange = (dateStr) => {
    if (!from || !to) return true;
    return dateStr >= from && dateStr <= to;
  };

  const filteredCleaning = cleaningData.filter((d) => isInDateRange(d.date));
  const filteredInternal = internalData.filter((d) => isInDateRange(d.date));
  const filteredExternal = externalData.filter((d) => isInDateRange(d.date));

  const groupByDate = (data, key = "count") => {
    const grouped = {};
    data.forEach((item) => {
      const d = item.date;
      if (!grouped[d]) grouped[d] = 0;
      grouped[d] += key === "cost" ? parseFloat(item.cost || 0) : 1;
    });
    return Object.entries(grouped).map(([date, value]) => ({ date, value }));
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filteredCleaning), "Cleaning");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filteredInternal), "Internal Maintenance");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filteredExternal), "External Maintenance");
    XLSX.writeFile(wb, `Report-${month}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Monthly Report - ${month}`, 10, 10);

    autoTable(doc, {
      head: [["Date", "Section", "Details", "Duration", "Note"]],
      body: filteredCleaning.map(d => [d.date, d.section, d.details, d.duration || "", d.note || ""]),
      startY: 20,
    });

    autoTable(doc, {
      head: [["Date", "Section", "Details", "Cost", "Note"]],
      body: filteredInternal.map(d => [d.date, d.section, d.details, d.cost || "", d.note || ""]),
    });

    autoTable(doc, {
      head: [["Date", "Section", "Details", "Cost", "Note"]],
      body: filteredExternal.map(d => [d.date, d.section, d.details, d.cost || "", d.note || ""]),
    });

    doc.save(`Report-${month}.pdf`);
  };
const navigate = useNavigate();
  return (
    <div className="page-container" dir="rtl">
          <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📊 التقرير الشهري - {month}</h2>

      {/* الفلاتر */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="من تاريخ" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} placeholder="إلى تاريخ" />
        <button className="print-btn" onClick={() => window.print()}>🖨️ Print</button>
        <button onClick={exportToExcel}>📥 Excel</button>
        <button onClick={exportToPDF}>📄 PDF</button>
      </div>

      <h3>🧽 Cleaning</h3>
      <table className="styled-table">
        <thead><tr><th>Date</th><th>Section</th><th>Details</th><th>Duration</th><th>Note</th></tr></thead>
        <tbody>
          {filteredCleaning.map((d, i) => (
            <tr key={i}><td>{d.date}</td><td>{d.section}</td><td>{d.details}</td><td>{d.duration}</td><td>{d.note}</td></tr>
          ))}
        </tbody>
      </table>

      <h3>🛠️ Internal Maintenance</h3>
      <table className="styled-table">
        <thead><tr><th>Date</th><th>Section</th><th>Details</th><th>Cost</th><th>Note</th></tr></thead>
        <tbody>
          {filteredInternal.map((d, i) => (
            <tr key={i}><td>{d.date}</td><td>{d.section}</td><td>{d.details}</td><td>{d.cost}</td><td>{d.note}</td></tr>
          ))}
        </tbody>
      </table>

      <h3>🔩 External Maintenance</h3>
      <table className="styled-table">
        <thead><tr><th>Date</th><th>Section</th><th>Details</th><th>Cost</th><th>Note</th></tr></thead>
        <tbody>
          {filteredExternal.map((d, i) => (
            <tr key={i}><td>{d.date}</td><td>{d.section}</td><td>{d.details}</td><td>{d.cost}</td><td>{d.note}</td></tr>
          ))}
        </tbody>
      </table>

      <h3>📈 Graphs</h3>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={groupByDate(filteredInternal, "cost")}> <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
            <Line type="monotone" dataKey="value" name="Internal Maintenance Cost" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={groupByDate(filteredCleaning)}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="value" name="Cleaning Tasks Count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={groupByDate(filteredExternal)} dataKey="value" nameKey="date" outerRadius={120} label>
              {groupByDate(filteredExternal).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyReport;