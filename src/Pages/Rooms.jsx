// src/pages/Rooms.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot, deleteDoc,
  updateDoc, doc, serverTimestamp, query, orderBy
} from "firebase/firestore";
import "../GlobalStyles.css";

const Rooms = () => {
  const navigate = useNavigate();

  // مدخلات
  const [name, setName]           = useState("");
  const [customName, setCustom]   = useState("");
  const [quantity, setQty]        = useState("");
  const [unit, setUnit]           = useState("عدد");

  // بيانات العرض
  const [items, setItems]         = useState([]);
  const [editId, setEditId]       = useState(null);

  // قائمة الأصناف
  const itemOptions = [
    "بيض","مانجا فليت","فرولة فليت","كيوي فليت","مربي مشمش","لباني ",
    "جبنه تشيز كيك ","رومانتك ابيض ","رومانتك اسمر ","بشر اسمر ",
    "بشر ابيض ","لوتس ","نوتيلا ","جناش جديد ","جناش  ","أدخل صنف جديد"
  ];

  const roomsRef = collection(db, "rooms-store");

  /* ---------- استماع للبيانات بترتيب ثنائي ---------- */
  useEffect(() => {
    const q = query(
      roomsRef,
      orderBy("date", "asc"),        // اليوم
      orderBy("createdAt", "asc")    // وقت الإدخال داخل اليوم
    );
    return onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* ---------- إضافة أو تحديث ---------- */
  const handleAddOrUpdate = async () => {
    const finalName = name === "أدخل صنف جديد" ? customName.trim() : name.trim();
    if (!finalName || !quantity) return alert("من فضلك أدخل الاسم والكمية");

    const payload = {
      name: finalName,
      quantity: parseFloat(quantity),
      unit,
    };

    if (editId) {
      const pwd = prompt("كلمة المرور للتعديل؟");
      if (!["1234","2991034"].includes(pwd)) return alert("كلمة المرور غير صحيحة");
      await updateDoc(doc(roomsRef, editId), { ...payload, isEdited: true });
      setEditId(null);
    } else {
      await addDoc(roomsRef, {
        ...payload,
        date: new Date().toLocaleDateString("fr-CA"), // YYYY‑MM‑DD
        createdAt: serverTimestamp(),                 // 🆕 يحفظ زمن الإدخال
        isEdited: false,
      });
    }

    // إعادة الضبط
    setName(""); setCustom(""); setQty(""); setUnit("عدد");
  };

  /* ---------- حذف ---------- */
  const handleDelete = async (id) => {
    const pwd = prompt("أدخل كلمة المرور للحذف:");
    if (!["1234","2991034"].includes(pwd)) return alert("كلمة المرور غير صحيحة");
    if (!window.confirm("تأكيد الحذف؟")) return;
    await deleteDoc(doc(roomsRef, id));
  };

  /* ---------- تحميل للتعديل ---------- */
  const handleEdit = (it) => {
    setName(it.name); setCustom("");
    setQty(it.quantity); setUnit(it.unit);
    setEditId(it.id);
  };

  /* ---------- واجهة المستخدم ---------- */
  return (
    <div className="page-container" dir="rtl">
      <button className="back-button" onClick={()=>navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🢨 غرفة التبريد</h2>

      <div className="form-row">
        <select value={name} onChange={(e)=>setName(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((opt,i)=>(
            <option key={i}>{opt}</option>
          ))}
        </select>

        {name === "أدخل صنف جديد" && (
          <input
            placeholder="اسم الصنف الجديد"
            value={customName}
            onChange={(e)=>setCustom(e.target.value)}
          />
        )}

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e)=>setQty(e.target.value)}
        />

        <select value={unit} onChange={(e)=>setUnit(e.target.value)}>
          <option>عدد</option><option>كيلو</option><option>صاج</option>
          <option>جردل</option><option>كيس</option><option>برنيكة</option>
        </select>

        <button onClick={handleAddOrUpdate}>
          {editId ? "تحديث" : "إضافة"}
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>الاسم</th><th>الكمية</th><th>الوحدة</th>
            <th>التاريخ</th><th>تعديل</th><th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it)=>(
            <tr key={it.id} style={{ backgroundColor: it.isEdited ? "#ffcccc" : "transparent", textAlign:"center" }}>
              <td>{it.name}</td><td>{it.quantity}</td><td>{it.unit}</td>
              <td>{it.date}</td>
              <td><button onClick={()=>handleEdit(it)}>تعديل</button></td>
              <td><button onClick={()=>handleDelete(it.id)}>حذف</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Rooms;
