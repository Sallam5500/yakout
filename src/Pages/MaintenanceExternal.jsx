import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css";

const MaintenanceExternal = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [section, setSection] = useState("");
  const [details, setDetails] = useState("");
  const [cost, setCost] = useState("");
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("externalMaintenanceTasks");
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("externalMaintenanceTasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAdd = () => {
    const date = new Date().toLocaleDateString("fr-CA");
    const newItem = { date, section, details, cost, note };
    setTasks([...tasks, newItem]);
    setSection(""); setDetails(""); setCost(""); setNote("");
  };

  const handleDelete = (index) => {
    const password = prompt("ادخل كلمة المرور للحذف:");
    if (password !== "1234") return alert("كلمة المرور خاطئة.");
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  const filtered = tasks.filter(
    (item) =>
      item.details.includes(searchTerm) ||
      item.section.includes(searchTerm) ||
      item.date.includes(searchTerm)
  );

  return (
    <div className="store-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>🔩 الصيانة الخارجية</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      <div className="form-section">
        <input placeholder="القسم" value={section} onChange={(e) => setSection(e.target.value)} />
        <input placeholder="تفاصيل الصيانة" value={details} onChange={(e) => setDetails(e.target.value)} />
        <input placeholder="المدة / التكلفة" value={cost} onChange={(e) => setCost(e.target.value)} />
        <input placeholder="ملاحظات" value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={handleAdd}>➕ إضافة</button>
      </div>

      <input
        className="search"
        placeholder="بحث بالاسم أو التاريخ أو القسم"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="items-table">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>القسم</th>
            <th>تفاصيل الصيانة</th>
            <th>المدة / التكلفة</th>
            <th>ملاحظات</th>
            <th>إجراء</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item, i) => (
            <tr key={i}>
              <td>{item.date}</td>
              <td>{item.section}</td>
              <td>{item.details}</td>
              <td>{item.cost}</td>
              <td>{item.note}</td>
              <td>
                <button onClick={() => handleDelete(i)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceExternal;
