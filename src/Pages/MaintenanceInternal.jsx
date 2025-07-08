import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const MaintenanceInternal = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [section, setSection] = useState("");
  const [details, setDetails] = useState("");
  const [cost, setCost] = useState("");
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("internalMaintenanceTasks");
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("internalMaintenanceTasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAdd = () => {
    if (!section || !details || !cost) {
      alert("يرجى إدخال القسم والتفاصيل والتكلفة.");
      return;
    }

    const date = new Date().toLocaleDateString("fr-CA");
    const newItem = { date, section, details, cost, note, updated: false };
    setTasks([...tasks, newItem]);
    setSection("");
    setDetails("");
    setCost("");
    setNote("");
  };

  const handleDelete = (index) => {
    const password = prompt("ادخل كلمة المرور للحذف:");
    if (password !== "1234") return alert("كلمة المرور خاطئة.");
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  const handleEdit = (index) => {
    const password = prompt("ادخل كلمة المرور للتعديل:");
    if (password !== "1234") {
      alert("كلمة المرور خاطئة.");
      return;
    }

    const task = tasks[index];
    const newSection = prompt("القسم الجديد:", task.section);
    const newDetails = prompt("تفاصيل الصيانة الجديدة:", task.details);
    const newCost = prompt("المدة / التكلفة الجديدة:", task.cost);
    const newNote = prompt("الملاحظات الجديدة:", task.note);

    if (!newSection || !newDetails || !newCost) {
      alert("لم يتم تعديل البيانات.");
      return;
    }

    const updated = [...tasks];
    updated[index] = {
      ...updated[index],
      section: newSection,
      details: newDetails,
      cost: newCost,
      note: newNote,
      updated: true,
    };
    setTasks(updated);
  };

  const filtered = tasks.filter(
    (item) =>
      item.details.includes(searchTerm) ||
      item.section.includes(searchTerm) ||
      item.date.includes(searchTerm)
  );

  return (
    <div className="page-container" dir="rtl">
     
        <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
        <h2 className="page-title">🛠️ الصيانة الداخلية</h2>
        <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>
 

      <div className="form-row">
        <input placeholder="القسم" value={section} onChange={(e) => setSection(e.target.value)} />
        <input placeholder="تفاصيل الصيانة" value={details} onChange={(e) => setDetails(e.target.value)} />
        <input placeholder="المدة / التكلفة" value={cost} onChange={(e) => setCost(e.target.value)} />
        <input placeholder="ملاحظات" value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={handleAdd}>➕ إضافة</button>
      </div>

      <input
        className="search"
        placeholder="🔍 بحث بالاسم أو التاريخ أو القسم"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="styled-table">
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
          {filtered.length === 0 ? (
            <tr><td colSpan="6">لا توجد بيانات.</td></tr>
          ) : (
            filtered.map((item, i) => (
              <tr key={i} className={item.updated ? "edited-row" : ""}>
                <td>{item.date}</td>
                <td>{item.section}</td>
                <td>{item.details}</td>
                <td>{item.cost}</td>
                <td>{item.note}</td>
                <td>
                  <button onClick={() => handleEdit(i)}>✏️</button>{" "}
                  <button onClick={() => handleDelete(i)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceInternal;
