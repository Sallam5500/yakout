// src/pages/RoomsOut.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot, query, where, getDocs,
  runTransaction, serverTimestamp, deleteDoc, doc, orderBy, setDoc
} from "firebase/firestore";
import "../GlobalStyles.css";

/* القائمة الثابتة الاحتياطية */
const BASE_ITEMS = [
  "بيض","مانجا فليت","فرولة فليت","كيوي فليت","مربي مشمش","لباني",
  "جبنه تشيز كيك","رومانتك ابيض","رومانتك اسمر","بشر اسمر","بشر ابيض",
  "لوتس","نوتيلا","جناش جديد","جناش"
];

const RoomsOut = () => {
  const navigate = useNavigate();

  // حالـة الإدخال
  const [item, setItem]           = useState("");
  const [customItem, setCustom]   = useState("");
  const [quantity, setQty]        = useState("");
  const [note, setNote]           = useState("");

  // القوائم والبيانات
  const [itemOptions, setOptions] = useState([]);
  const [records, setRecords]     = useState([]);

  /* Collections */
  const roomsStoreRef = collection(db, "rooms-store");
  const roomsOutRef   = collection(db, "rooms-out");
  const itemsRef      = collection(db, "rooms-items"); // يحتفظ بأسماء مضافة يدويًا

  /* -------- بناء قائمة الأصناف: مخزون الغرف ← إضافية ← ثابتة -------- */
  useEffect(() => {
    const qStore = query(
      roomsStoreRef,
      orderBy("date","asc"), orderBy("createdAt","asc")
    );
    const unsubStore = onSnapshot(qStore, (snap) => {
      const storeNames = [];
      snap.docs.forEach(d => {
        if (!storeNames.includes(d.data().name)) storeNames.push(d.data().name);
      });

      onSnapshot(itemsRef, (extraSnap) => {
        const extra = extraSnap.docs.map(d => d.id);
        setOptions([
          ...storeNames,
          ...extra.filter(x => !storeNames.includes(x)),
          ...BASE_ITEMS.filter(b => !storeNames.includes(b) && !extra.includes(b)),
          "أدخل صنف جديد"
        ]);
      });
    });
    return () => unsubStore();
  }, []);

  /* -------- تحميل سجل الصادر بالترتيب -------- */
  useEffect(() => {
    const q = query(roomsOutRef, orderBy("timestamp", "asc"));
    return onSnapshot(q, snap =>
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* -------- إضافة اسم جديد لقائمة إضافية -------- */
  const ensureNewItem = async (name) =>
    setDoc(doc(itemsRef, name), { createdAt: serverTimestamp() }, { merge: true });

  /* -------- تسجيل الصادر مع خصم المخزون -------- */
  const handleSubmit = async () => {
    const finalName = item === "أدخل صنف جديد" ? customItem.trim() : item.trim();
    const qty       = Number(quantity);

    if (!finalName || !qty) return alert("أدخل الاسم والكمية");

    if (item === "أدخل صنف جديد") await ensureNewItem(finalName);

    // ابحث عن الصنف في مخزن الغرف
    const q = query(roomsStoreRef, where("name", "==", finalName));
    const snap = await getDocs(q);
    if (snap.empty) return alert("❌ الصنف غير موجود في مخزن الغرف.");

    const stockRef = snap.docs[0].ref;

    try {
      await runTransaction(db, async (trx) => {
        const stockSnap = await trx.get(stockRef);
        const available = stockSnap.data().quantity;
        if (qty > available) throw new Error(`الكمية غير كافية (المتاح ${available})`);

        // خصم
        trx.update(stockRef, { quantity: available - qty });

        // سجل خروج
        trx.set(doc(roomsOutRef), {
          name: finalName,
          quantity: qty,
          note,
          date: new Date().toLocaleDateString("fr-CA"),
          timestamp: serverTimestamp()
        });
      });

      alert("✅ تم تسجيل الصادر وخصم الكمية.");
      setItem(""); setCustom(""); setQty(""); setNote("");
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  /* -------- حذف سجل -------- */
  const handleDelete = async (id) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    if (!window.confirm("تأكيد الحذف؟")) return;
    await deleteDoc(doc(roomsOutRef, id));
  };

  /* -------- واجهة المستخدم -------- */
  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={()=>navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من الغرف</h2>

      <div className="form-row">
        <select value={item} onChange={e=>setItem(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map(opt=>(
            <option key={opt}>{opt}</option>
          ))}
        </select>

        {item === "أدخل صنف جديد" && (
          <input
            placeholder="اسم الصنف الجديد"
            value={customItem}
            onChange={e=>setCustom(e.target.value)}
          />
        )}

        <input type="number" placeholder="الكمية"
               value={quantity} onChange={e=>setQty(e.target.value)} />

        <input type="text" placeholder="بيان / ملاحظات"
               value={note} onChange={e=>setNote(e.target.value)} />

        <button type="button" onClick={handleSubmit}>➕ تسجيل</button>
      </div>

      {/* جدول الصادر */}
      <h3 className="table-title">📑 سجل الصادر</h3>
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>الصنف</th><th>الكمية</th><th>البيان</th>
              <th>التاريخ</th><th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {records.map(rec=>(
              <tr key={rec.id}>
                <td>{rec.name}</td>
                <td>{rec.quantity}</td>
                <td>{rec.note || "-"}</td>
                <td>{rec.date}</td>
                <td>
                  <button className="delete-btn" onClick={()=>handleDelete(rec.id)}>حذف</button>
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
