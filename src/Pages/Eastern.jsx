// src/pages/Eastern.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, addDoc, onSnapshot, deleteDoc, updateDoc,
  doc, query, orderBy, serverTimestamp, setDoc
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

/* قائمة ثابتة كبداية (يمكن حذفها أو تقليلها لاحقًا) */
const BASE_ITEMS = [
  "كنافة فادج","بسبوسة سادة","بسبوسة قشطة","بلح الشام",
];

const Eastern = () => {
  const nav = useNavigate();

  // مدخلات
  const [name, setName]         = useState("");
  const [customName, setCustom] = useState("");
  const [qty, setQty]           = useState("");
  const [unit, setUnit]         = useState("عدد");

  // بيانات & قوائم
  const [items, setItems]       = useState([]);
  const [itemOptions, setOpts]  = useState([...BASE_ITEMS, "أدخل صنف جديد"]);
  const [search, setSearch]     = useState("");

  /* Collections */
  const ordersRef = collection(db, "easternOrders");
  const itemsRef  = collection(db, "easternItems");    // يحتفظ بأسماء الأصناف

  /* -------- تحميل أسماء الأصناف -------- */
  useEffect(() => {
    const unsub = onSnapshot(itemsRef, snap => {
      const extra = snap.docs.map(d => d.id);
      setOpts([
        ...BASE_ITEMS,
        ...extra.filter(x => !BASE_ITEMS.includes(x)),
        "أدخل صنف جديد"
      ]);
    });
    return () => unsub();
  }, []);

  /* -------- تحميل الأوردرات بترتيب ثنائي -------- */
  useEffect(() => {
    const q = query(
      ordersRef,
      orderBy("date","asc"), orderBy("createdAt","asc")
    );
    return onSnapshot(q, snap =>
      setItems(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    );
  }, []);

  /* -------- إضافة اسم جديد لقائمة الأصناف -------- */
  const ensureNewItem = (n) =>
    setDoc(doc(itemsRef, n), { createdAt: serverTimestamp() }, { merge:true });

  /* -------- إضافة أوردر -------- */
  const handleAdd = async () => {
    const finalName = name === "أدخل صنف جديد" ? customName.trim() : name.trim();
    if (!finalName || !qty) return alert("أدخل الاسم والكمية");

    if (name === "أدخل صنف جديد") await ensureNewItem(finalName);

    await addDoc(ordersRef, {
      name: finalName,
      quantity: Number(qty),
      unit,
      date: new Date().toLocaleDateString("fr-CA"),
      createdAt: serverTimestamp(),
      updated: false,
    });

    setName(""); setCustom(""); setQty(""); setUnit("عدد");
  };

  /* -------- حذف -------- */
  const handleDelete = async (id) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    await deleteDoc(doc(ordersRef, id));
  };

  /* -------- تعديل -------- */
  const handleEdit = async (it) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    const newName = prompt("اسم جديد:", it.name) ?? it.name;
    const newQty  = prompt("كمية جديدة:", it.quantity) ?? it.quantity;
    const newUnit = prompt("وحدة جديدة:", it.unit) ?? it.unit;
    await updateDoc(doc(ordersRef, it.id), {
      name: newName,
      quantity: Number(newQty),
      unit: newUnit,
      updated: true,
    });
  };

  /* -------- فلترة -------- */
  const filtered = items.filter(
    it => it.name.includes(search.trim()) || it.date.includes(search.trim())
  );

  /* -------- واجهة المستخدم -------- */
  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={()=>nav(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🍬 أوردرات الحلويات الشرقية</h2>
      <button className="print-btn" onClick={()=>window.print()}>🖨️ طباعة</button>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <select value={name} onChange={e=>setName(e.target.value)}>
          <option value="">اختر صنف</option>
          {itemOptions.map(opt=>(
            <option key={opt}>{opt}</option>
          ))}
        </select>

        {name === "أدخل صنف جديد" && (
          <input
            placeholder="اسم الصنف الجديد"
            value={customName}
            onChange={e=>setCustom(e.target.value)}
          />
        )}

        <input type="number" placeholder="الكمية"
               value={qty} onChange={e=>setQty(e.target.value)} />

        <select value={unit} onChange={e=>setUnit(e.target.value)}>
          <option>عدد</option><option>صاج</option><option>صينية</option>
          <option>كيلو</option><option>سيرفيز</option>
        </select>

        <button onClick={handleAdd}>تسجيل الصنف</button>
      </div>

      {/* بحث */}
      <input className="search" placeholder="بحث بالاسم أو التاريخ"
             value={search} onChange={e=>setSearch(e.target.value)} />

      {/* جدول */}
      <table className="styled-table">
        <thead>
          <tr><th>التاريخ</th><th>الصنف</th><th>الكمية</th>
              <th>الوحدة</th><th>إجراءات</th></tr>
        </thead>
        <tbody>
          {filtered.length ? filtered.map(it=>(
            <tr key={it.id} className={it.updated ? "edited-row" : ""}>
              <td>{it.date}</td><td>{it.name}</td>
              <td>{it.quantity}</td><td>{it.unit}</td>
              <td>
                <button className="edit-btn"   onClick={()=>handleEdit(it)}>✏️</button>{" "}
                <button className="delete-btn" onClick={()=>handleDelete(it.id)}>🗑️</button>
              </td>
            </tr>
          )) : <tr><td colSpan="5">لا توجد بيانات.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default Eastern;
