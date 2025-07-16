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

const MaintenanceInternal = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [section, setSection] = useState("");
  const [details, setDetails] = useState("");
  const [cost, setCost] = useState("");
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ التاريخ المختار (افتراضيًا اليوم)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("fr-CA")
  );

  const tasksRef = collection(db, "internalMaintenanceTasks", selectedDate, "tasks");

  // 🔁 تحميل البيانات اللحظية حسب التاريخ المختار
  useEffect(() => {
    const q = query(tasksRef, orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [selectedDate]);

  // ➕ إضافة مهمة
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
    if (pwd !== "1234") return alert("كلمة المرور خاطئة.");
    const docRef = doc(db, "internalMaintenanceTasks", selectedDate, "tasks", id);
    await deleteDoc(docRef);
  };

  // ✏️ تعديل
  const handleEdit = async (task) => {
    const pwd = prompt("ادخل كلمة المرور للتعديل:");
    if (pwd !== "1234") return alert("كلمة المرور خاطئة.");

    const newSection = prompt("القسم الجديد:", task.section);
    const newDetails = prompt("تفاصيل الصيانة الجديدة:", task.details);
    const newCost = prompt("المدة / التكلفة الجديدة:", task.cost);
    const newNote = prompt("الملاحظات الجديدة:", task.note);
    if (!newSection || !newDetails || !newCost) return;

    const docRef = doc(db, "internalMaintenanceTasks", selectedDate, "tasks", task.id);
    await updateDoc(docRef, {
      section: newSection,
      details: newDetails,
      cost: newCost,
      note: newNote,
      updated: true,
    });
  };

  // 🔍 فلترة
  const filtered = tasks.filter(
    (t) =>
      t.details.includes(searchTerm) ||
      t.section.includes(searchTerm) ||
      (t.timestamp?.toDate?.().toLocaleDateString("ar-EG") ?? "").includes(searchTerm)
  );

  return (
    <div className="page-container" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🛠️ الصيانة الداخلية - {selectedDate}</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      {/* 📅 اختيار التاريخ */}
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
        <input
          placeholder="القسم"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        />
        <input
          placeholder="تفاصيل الصيانة"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <input
          placeholder="المدة / التكلفة"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
        <input
          placeholder="ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
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
          <tr>
            <th>الوقت</th>
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
