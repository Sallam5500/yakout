// src/pages/MaintenanceInternal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc,
  query, orderBy                     // ⭐️ أضفنا query و orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const MaintenanceInternal = () => {
  const navigate                    = useNavigate();
  const [tasks, setTasks]           = useState([]);
  const [section, setSection]       = useState("");
  const [details, setDetails]       = useState("");
  const [cost, setCost]             = useState("");
  const [note, setNote]             = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const collectionRef = collection(db, "internalMaintenanceTasks");

  /* ---------- تحميل البيانات بترتيب تصاعدي (يوم 1 ثم 2 ثم 3…) ---------- */
  useEffect(() => {
    const q = query(collectionRef, orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* ---------- إضافة مهمة ---------- */
  const handleAdd = async () => {
    if (!section || !details || !cost) return alert("يرجى إدخال القسم والتفاصيل والتكلفة.");

    const date = new Date().toLocaleDateString("fr-CA"); // YYYY‑MM‑DD
    await addDoc(collectionRef, {
      date, section, details, cost, note, updated: false,
    });

    setSection(""); setDetails(""); setCost(""); setNote("");
  };

  /* ---------- حذف ---------- */
  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة المرور للحذف:");
    if (pwd !== "1234") return alert("كلمة المرور خاطئة.");
    await deleteDoc(doc(db, "internalMaintenanceTasks", id));
  };

  /* ---------- تعديل ---------- */
  const handleEdit = async (t) => {
    const pwd = prompt("ادخل كلمة المرور للتعديل:");
    if (pwd !== "1234") return alert("كلمة المرور خاطئة.");

    const newSection  = prompt("القسم الجديد:", t.section);
    const newDetails  = prompt("تفاصيل الصيانة الجديدة:", t.details);
    const newCost     = prompt("المدة / التكلفة الجديدة:", t.cost);
    const newNote     = prompt("الملاحظات الجديدة:", t.note);
    if (!newSection || !newDetails || !newCost) return;

    await updateDoc(doc(db, "internalMaintenanceTasks", t.id), {
      section: newSection,
      details: newDetails,
      cost: newCost,
      note: newNote,
      updated: true,
    });
  };

  /* ---------- فلترة بحث ---------- */
  const filtered = tasks.filter(
    (t) =>
      t.details.includes(searchTerm) ||
      t.section.includes(searchTerm) ||
      t.date.includes(searchTerm)
  );

  /* ---------------- JSX ---------------- */
  return (
    <div className="page-container" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🛠️ الصيانة الداخلية</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <input placeholder="القسم"            value={section} onChange={(e) => setSection(e.target.value)} />
        <input placeholder="تفاصيل الصيانة"   value={details} onChange={(e) => setDetails(e.target.value)} />
        <input placeholder="المدة / التكلفة"  value={cost}    onChange={(e) => setCost(e.target.value)} />
        <input placeholder="ملاحظات"          value={note}    onChange={(e) => setNote(e.target.value)} />
        <button onClick={handleAdd}>➕ إضافة</button>
      </div>

      {/* البحث */}
      <input
        className="search"
        placeholder="🔍 بحث بالاسم أو التاريخ أو القسم"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* الجدول */}
      <table className="styled-table">
        <thead>
          <tr><th>التاريخ</th><th>القسم</th><th>تفاصيل الصيانة</th><th>المدة / التكلفة</th><th>ملاحظات</th><th>إجراء</th></tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="6">لا توجد بيانات.</td></tr>
          ) : (
            filtered.map((t) => (
              <tr key={t.id} className={t.updated ? "edited-row" : ""}>
                <td>{t.date}</td><td>{t.section}</td><td>{t.details}</td>
                <td>{t.cost}</td><td>{t.note}</td>
                <td>
                  <button onClick={() => handleEdit(t)}>✏️</button>{" "}
                  <button onClick={() => handleDelete(t.id)}>🗑️</button>
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
