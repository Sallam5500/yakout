// src/pages/Cleaning.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const Cleaning = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [section, setSection] = useState("");
  const [details, setDetails] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const collectionRef = collection(db, "cleaningTasks");

  // قراءة البيانات لحظياً من Firestore
  useEffect(() => {
    const unsub = onSnapshot(collectionRef, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!section || !details || !duration) {
      alert("يرجى ملء الحقول الأساسية.");
      return;
    }

    const date = new Date().toLocaleDateString("fr-CA");
    await addDoc(collectionRef, {
      date,
      section,
      details,
      duration,
      note,
      updated: false,
    });

    setSection("");
    setDetails("");
    setDuration("");
    setNote("");
  };

  const handleDelete = async (id) => {
    const password = prompt("ادخل كلمة المرور للحذف:");
    if (password !== "1234") return alert("كلمة المرور خاطئة.");
    await deleteDoc(doc(db, "cleaningTasks", id));
  };

  const handleEdit = async (task) => {
    const password = prompt("ادخل كلمة المرور للتعديل:");
    if (password !== "1234") return alert("كلمة المرور خاطئة.");

    const newSection = prompt("القسم الجديد:", task.section);
    const newDetails = prompt("تفاصيل النظافة الجديدة:", task.details);
    const newDuration = prompt("المدة / الكمية الجديدة:", task.duration);
    const newNote = prompt("الملاحظات الجديدة:", task.note);

    if (!newSection || !newDetails || !newDuration) {
      alert("لم يتم تعديل البيانات.");
      return;
    }

    await updateDoc(doc(db, "cleaningTasks", task.id), {
      section: newSection,
      details: newDetails,
      duration: newDuration,
      note: newNote,
      updated: true,
    });
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
      <h2 className="page-title">🧽 النظافة</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      <div className="form-row">
        <input placeholder="القسم" value={section} onChange={(e) => setSection(e.target.value)} />
        <input placeholder="تفاصيل النظافة" value={details} onChange={(e) => setDetails(e.target.value)} />
        <input placeholder="المدة / الكمية" value={duration} onChange={(e) => setDuration(e.target.value)} />
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
            <th>التفاصيل</th>
            <th>المدة / الكمية</th>
            <th>ملاحظات</th>
            <th>إجراء</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="6">لا توجد بيانات.</td></tr>
          ) : (
            filtered.map((item) => (
              <tr key={item.id} className={item.updated ? "edited-row" : ""}>
                <td>{item.date}</td>
                <td>{item.section}</td>
                <td>{item.details}</td>
                <td>{item.duration}</td>
                <td>{item.note}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>✏️</button>{" "}
                  <button onClick={() => handleDelete(item.id)}>🗑️</button>
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
