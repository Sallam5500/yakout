// src/pages/FrenchMousse.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc,
  query, orderBy                     // ⭐️ أضفنا query و orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const FrenchMousse = () => {
  const [items, setItems]       = useState([]);
  const [name, setName]         = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit]         = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate                = useNavigate();

  const collectionRef = collection(db, "frenchMousseOrders");

  /* ---------- تحميل البيانات بترتيب تصاعدي (يوم 1 ثم 2 ثم 3...) ---------- */
  useEffect(() => {
    const q = query(collectionRef, orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* ---------- إضافة صنف ---------- */
  const handleAdd = async () => {
    if (!name || !quantity) return alert("يرجى إدخال اسم الصنف والكمية.");

    const date = new Date().toLocaleDateString("fr-CA"); // YYYY‑MM‑DD
    await addDoc(collectionRef, {
      name,
      quantity: Number(quantity),
      unit,
      date,
      updated: false,
    });

    setName(""); setQuantity(""); setUnit("عدد");
  };

  /* ---------- حذف ---------- */
  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (!["1234","2991034"].includes(pwd)) return alert("كلمة المرور خاطئة.");
    await deleteDoc(doc(db, "frenchMousseOrders", id));
  };

  /* ---------- تعديل ---------- */
  const handleEdit = async (it) => {
    const pwd = prompt("ادخل كلمة المرور لتعديل الصنف:");
    if (!["1234","2991034"].includes(pwd)) return alert("كلمة المرور خاطئة.");

    const newName = prompt("اسم الصنف الجديد:", it.name);
    const newQty  = prompt("الكمية الجديدة:", it.quantity);
    const newUnit = prompt("الوحدة الجديدة:", it.unit);
    if (!newName || !newQty || !newUnit) return;

    await updateDoc(doc(db, "frenchMousseOrders", it.id), {
      name: newName,
      quantity: Number(newQty),
      unit: newUnit,
      updated: true,
    });
  };

  /* ---------- فلترة بحث ---------- */
  const filtered = items.filter(
    (it) =>
      it.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      it.date.includes(searchTerm.trim())
  );

  /* ---------------- JSX ---------------- */
  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🍮 أوردرات الموس الفرنسي</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <input type="text"  placeholder="اسم الصنف" value={name}     onChange={(e) => setName(e.target.value)} />
        <input type="number"placeholder="الكمية"    value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="عدد">عدد</option><option value="قطعه">قطعه</option>
          <option value="بلاكه">بلاكه</option><option value="صاج">صاج</option>
          <option value="برنيكه">برنيكه</option>
        </select>
        <button className="add-button" onClick={handleAdd}>تسجيل الصنف</button>
      </div>

      {/* البحث */}
      <input
        className="search" type="text" placeholder="بحث بالاسم أو التاريخ"
        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding:"10px", borderRadius:"6px", border:"none",
                 marginBottom:"15px", fontSize:"16px", width:"300px", textAlign:"center" }}
      />

      {/* الجدول */}
      <table className="styled-table">
        <thead>
          <tr><th>التاريخ</th><th>الصنف</th><th>الكمية</th><th>الوحدة</th><th>إجراءات</th></tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="5">لا توجد بيانات.</td></tr>
          ) : (
            filtered.map((it) => (
              <tr key={it.id} className={it.updated ? "edited-row" : ""}>
                <td>{it.date}</td><td>{it.name}</td><td>{it.quantity}</td><td>{it.unit}</td>
                <td>
                  <button className="edit-btn"   onClick={() => handleEdit(it)}>✏️</button>{" "}
                  <button className="delete-btn" onClick={() => handleDelete(it.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FrenchMousse;
