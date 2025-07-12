// src/pages/Cleaning.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc,
  query, orderBy                    // ⭐️ أضفنا query و orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const Cleaning = () => {
  const navigate                    = useNavigate();
  const [tasks, setTasks]           = useState([]);
  const [section, setSection]       = useState("");
  const [details, setDetails]       = useState("");
  const [duration, setDuration]     = useState("");
  const [note, setNote]             = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const collectionRef = collection(db, "cleaningTasks");

  /* ---------- تحميل البيانات بترتيب تصاعدي (يوم 1 ثم 2 ثم 3…) ---------- */
  useEffect(() => {
    const q = query(collectionRef, orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* ---------- إضافة مهمة تنظيف ---------- */
  const handleAdd = async () => {
    if (!section || !details || !duration) return alert("يرجى ملء الحقول الأساسية.");

    const date = new Date().toLocaleDateString("fr-CA"); // YYYY‑MM‑DD
    await addDoc(collectionRef, {
      date, section, details, duration, note, updated: false,
    });

    setSection(""); setDetails(""); setDuration(""); setNote("");
  };

  /* ---------- حذف ---------- */
  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة المرور للحذف:");
    if (pwd !== "1234") return alert("كلمة المرور خاطئة.");
    await deleteDoc(doc(db, "cleaningTasks", id));
  };

  /* ---------- تعديل ---------- */
  const handleEdit = async (t) => {
    const pwd = prompt("ادخل كلمة المرور للتعديل:");
    if (pwd !== "1234") return alert("كلمة المرور خاطئة.");

    const newSection  = prompt("القسم الجديد:", t.section);
    const newDetails  = prompt("تفاصيل النظافة الجديدة:", t.details);
    const newDuration = prompt("المدة / الكمية الجديدة:", t.duration);
    const newNote     = prompt("الملاحظات الجديدة:", t.note);
    if (!newSection || !newDetails || !newDuration) return;

    await updateDoc(doc(db, "cleaningTasks", t.id), {
      section: newSection,
      details: newDetails,
      duration: newDuration,
      note: newNote,
      updated: true,
    });
  };

  /* ---------- فلترة بحث ---------- */
  const filtered = tasks.filter(
    (it) =>
      it.details.includes(searchTerm) ||
      it.section.includes(searchTerm) ||
      it.date.includes(searchTerm)
  );

  /* ---------------- JSX ---------------- */
  return (
    <div className="page-container" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🧽 النظافة</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <input placeholder="القسم"            value={section}  onChange={(e) => setSection(e.target.value)} />
        <input placeholder="تفاصيل النظافة"   value={details}  onChange={(e) => setDetails(e.target.value)} />
        <input placeholder="المدة / الكمية"   value={duration} onChange={(e) => setDuration(e.target.value)} />
        <input placeholder="ملاحظات"          value={note}      onChange={(e) => setNote(e.target.value)} />
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
          <tr><th>التاريخ</th><th>القسم</th><th>التفاصيل</th><th>المدة / الكمية</th><th>ملاحظات</th><th>إجراء</th></tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="6">لا توجد بيانات.</td></tr>
          ) : (
            filtered.map((it) => (
              <tr key={it.id} className={it.updated ? "edited-row" : ""}>
                <td>{it.date}</td><td>{it.section}</td><td>{it.details}</td>
                <td>{it.duration}</td><td>{it.note}</td>
                <td>
                  <button onClick={() => handleEdit(it)}>✏️</button>{" "}
                  <button onClick={() => handleDelete(it.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Cleaning;
