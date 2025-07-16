import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const MaintenanceExternal = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [section, setSection] = useState("");
  const [details, setDetails] = useState("");
  const [cost, setCost] = useState("");
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ التاريخ الحالي
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("fr-CA")
  );

  const tasksRef = collection(db, "externalMaintenanceTasks", selectedDate, "tasks");

  // 🔁 تحميل البيانات اللحظي حسب اليوم المختار
  useEffect(() => {
    const q = query(tasksRef, orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [selectedDate]);

  // ➕ إضافة
  const handleAdd = async () => {
    if (!section || !details || !cost)
      return alert("يرجى إدخال القسم والتفاصيل والتكلفة.");

    await addDoc(tasksRef, {
      section,
      details,
      cost,
      note,
      timestamp: new Date(),
      updated: false,
    });

    setSection("");
    setDetails("");
    setCost("");
    setNote("");
  };

  // 🗑️ حذف
  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة المرور للحذف:");
    if (pwd !== "1234" && pwd !== "2991034") return alert("كلمة المرور خاطئة.");
    await deleteDoc(doc(db, "externalMaintenanceTasks", selectedDate, "tasks", id));
  };

  // ✏️ تعديل
  const handleEdit = async (t) => {
    const pwd = prompt("ادخل كلمة المرور للتعديل:");
    if (pwd !== "1234" && pwd !== "2991034") return alert("كلمة المرور خاطئة.");

    const newSection = prompt("القسم الجديد:", t.section);
    const newDetails = prompt("تفاصيل الصيانة الجديدة:", t.details);
    const newCost = prompt("المدة / التكلفة الجديدة:", t.cost);
    const newNote = prompt("الملاحظات الجديدة:", t.note);
    if (!newSection || !newDetails || !newCost) return alert("لم يتم تعديل البيانات.");

    await updateDoc(doc(db, "externalMaintenanceTasks", selectedDate, "tasks", t.id), {
      section: newSection,
      details: newDetails,
      cost: newCost,
      note: newNote,
      updated: true,
    });
  };

  const filtered = tasks.filter(
    (t) =>
      t.details.includes(searchTerm) ||
      t.section.includes(searchTerm) ||
      (t.timestamp?.toDate?.().toLocaleDateString("ar-EG") ?? "").includes(searchTerm)
  );

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🔩 الصيانة الخارجية - {selectedDate}</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      {/* 📅 اختيار اليوم */}
      <div className="form-row">
        <label>📅 اختر التاريخ:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <input placeholder="القسم" value={section} onChange={(e) => setSection(e.target.value)} />
        <input placeholder="تفاصيل الصيانة" value={details} onChange={(e) => setDetails(e.target.value)} />
        <input placeholder="المدة / التكلفة" value={cost} onChange={(e) => setCost(e.target.value)} />
        <input placeholder="ملاحظات" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="add-button" onClick={handleAdd}>➕ إضافة</button>
      </div>

      {/* البحث */}
      <input
        className="search"
        placeholder="🔍 بحث بالاسم أو التاريخ أو القسم"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "6px",
          border: "none",
          marginBottom: "15px",
          fontSize: "16px",
          width: "300px",
          textAlign: "center",
        }}
      />

      {/* الجدول */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>الوقت</th>
            <th>القسم</th>
            <th>تفاصيل الصيانة</th>
            <th>المدة / التكلفة</th>
            <th>ملاحظات</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="6">لا توجد بيانات.</td></tr>
          ) : (
            filtered.map((t) => (
              <tr key={t.id} className={t.updated ? "edited-row" : ""}>
                <td>
                  {t.timestamp?.toDate?.().toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>{t.section}</td>
                <td>{t.details}</td>
                <td>{t.cost}</td>
                <td>{t.note}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(t)}>✏️</button>{" "}
                  <button className="delete-btn" onClick={() => handleDelete(t.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceExternal;
