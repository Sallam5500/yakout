// src/pages/RequiredItems.jsx
import React, { useState, useEffect } from "react";
import {
  collection, addDoc, deleteDoc, doc, updateDoc,
  onSnapshot, serverTimestamp, query, orderBy   // ⭐️ أضفنا query و orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const RequiredItems = () => {
  const [items, setItems]           = useState([]);
  const [name, setName]             = useState("");
  const [quantity, setQuantity]     = useState("");
  const [unit, setUnit]             = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate                    = useNavigate();

  /* تحميل البيانات مرتَّبة تصاعديًا بالتاريخ (يوم 1 ثم 2 ثم 3 ...) */
  useEffect(() => {
    const q = query(collection(db, "required-items"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* إضافة صنف جديد */
  const handleAdd = async () => {
    if (!name || !quantity) return alert("يرجى إدخال اسم الصنف والكمية.");
    await addDoc(collection(db, "required-items"), {
      name,
      quantity: Number(quantity),
      unit,
      createdAt: serverTimestamp(),
      updated: false,
    });
    setName(""); setQuantity(""); setUnit("عدد");
  };

  /* حذف صنف */
  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (!["1234", "2991034"].includes(pwd)) return alert("كلمة المرور خاطئة.");
    await deleteDoc(doc(db, "required-items", id));
  };

  /* تعديل صنف */
  const handleEdit = async (it) => {
    const pwd = prompt("ادخل كلمة المرور لتعديل الصنف:");
    if (!["1234", "2991034"].includes(pwd)) return alert("كلمة المرور خاطئة.");

    const newName     = prompt("اسم الصنف الجديد:", it.name);
    const newQuantity = prompt("الكمية الجديدة:", it.quantity);
    const newUnit     = prompt("الوحدة الجديدة (عدد أو كيلو):", it.unit);
    if (!newName || !newQuantity || !newUnit) return alert("لم يتم تعديل البيانات.");

    await updateDoc(doc(db, "required-items", it.id), {
      name: newName,
      quantity: Number(newQuantity),
      unit: newUnit,
      updated: true,
    });
  };

  /* فلترة بالبحث */
  const filtered = items.filter(
    (it) =>
      it.name.includes(searchTerm.trim()) ||
      (it.createdAt &&
        new Date(it.createdAt.seconds * 1000)
          .toLocaleDateString("fr-CA")
          .includes(searchTerm.trim()))
  );

  /* JSX */
  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📄 الاحتياجات المطلوبة من الخارج</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <input type="text"  placeholder="اسم الصنف" value={name}     onChange={(e) => setName(e.target.value)} />
        <input type="number"placeholder="الكمية"    value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="عدد">عدد</option><option value="كيلو">كيلو</option>
          <option value="كرتونه">كرتونه</option><option value="شكاره">شكاره</option>
          <option value="جردل">جردل</option><option value="كيس">كيس</option>
          <option value="برميل">برميل</option><option value="برنيكه">برنيكه</option>
        </select>
        <button className="add-button" onClick={handleAdd}>تسجيل احتياج</button>
      </div>

      {/* البحث */}
      <input
        type="text" className="search" placeholder="اكتب اسم أو تاريخ"
        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding:"10px", borderRadius:"6px", border:"none",
                 marginBottom:"15px", fontSize:"16px", width:"300px", textAlign:"center" }}
      />

      {/* جدول البيانات */}
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
                <td>{it.createdAt ? new Date(it.createdAt.seconds * 1000).toLocaleDateString("fr-CA") : "—"}</td>
                <td>{it.name}</td><td>{it.quantity}</td><td>{it.unit}</td>
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

export default RequiredItems;
