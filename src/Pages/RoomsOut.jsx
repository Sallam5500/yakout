// src/pages/RoomsOut.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot, query, where, getDocs,
  serverTimestamp, deleteDoc, doc, orderBy       // ⭐️ أضفنا orderBy
} from "firebase/firestore";
import "../GlobalStyles.css";

const RoomsOut = () => {
  const navigate = useNavigate();
  const [item,        setItem]        = useState("");
  const [customItem,  setCustomItem]  = useState("");
  const [quantity,    setQuantity]    = useState("");
  const [note,        setNote]        = useState("");
  const [records,     setRecords]     = useState([]);

  const itemOptions = [
    "بيض","مانجا فليت","فرولة فليت","كيوي فليت","مربي مشمش","لباني",
    "جبنه تشيز كيك","رومانتك ابيض","رومانتك اسمر","بشر اسمر","بشر ابيض",
    "لوتس","نوتيلا","جناش جديد","جناش","أدخل صنف جديد"
  ];

  /* Collections */
  const roomsStoreRef = collection(db, "rooms-store");
  const roomsOutRef   = collection(db, "rooms-out");

  /* تحميل سجل الصادر بترتيب تصاعدي (يوم 1 ثم 2 ثم 3 ...) */
  useEffect(() => {
    const q = query(roomsOutRef, orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* إضافة سجل خروج */
  const handleSubmit = async () => {
    const finalItem = item === "أدخل صنف جديد" ? customItem.trim() : item.trim();
    if (!finalItem || !quantity) {
      alert("من فضلك أدخل اسم الصنف والكمية");
      return;
    }

    /* التحقق من توفر الصنف والكمية */
    const q = query(roomsStoreRef, where("name", "==", finalItem));
    const snap = await getDocs(q);
    if (snap.empty) return alert("❌ هذا الصنف غير موجود في قسم الغرف.");

    const available = snap.docs[0].data().quantity;
    if (Number(quantity) > available) {
      return alert(`❌ الكمية غير كافية. المتاح: ${available}`);
    }

    /* إضافة السجل (لا خصم فعلي) */
    await addDoc(roomsOutRef, {
      name: finalItem,
      quantity: Number(quantity),
      note,
      date: new Date().toLocaleString("ar-EG", {
        timeZone: "Africa/Cairo",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      timestamp: serverTimestamp(),
    });

    alert("✅ تم تسجيل الصادر بنجاح.");
    setItem(""); setCustomItem(""); setQuantity(""); setNote("");
  };

  /* حذف سجل خروج */
  const handleDelete = async (id) => {
    const pwd = prompt("أدخل كلمة المرور للحذف:");
    if (!["1234", "2991034"].includes(pwd)) return alert("❌ كلمة المرور غير صحيحة.");
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    await deleteDoc(doc(db, "rooms-out", id));
    alert("✅ تم الحذف.");
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من الغرف</h2>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <select value={item} onChange={(e) => setItem(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        {item === "أدخل صنف جديد" && (
          <input
            type="text"
            placeholder="اسم الصنف الجديد"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
          />
        )}

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="text"
          placeholder="البيان / ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="add-button" onClick={handleSubmit}>➕ تسجيل</button>
      </div>

      {/* جدول السجلات */}
      <h3 className="table-title">📑 سجل الصادر:</h3>
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>اسم الصنف</th><th>الكمية</th><th>البيان</th>
              <th>التاريخ</th><th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td>{rec.name}</td>
                <td>{rec.quantity}</td>
                <td>{rec.note || "-"}</td>
                <td>{rec.date}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(rec.id)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomsOut;
