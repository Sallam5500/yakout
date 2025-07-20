// ... باقي الاستيرادات نفسها
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import "../GlobalStyles.css";

const UNITS = ["عدد", "صاج", "صنية", "برنيكه", "سرفيس", "بلاكة"];

export default function OrderListPageTemp({ collectionName, title }) {
  const nav = useNavigate();
  const { date: urlDate } = useParams();
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(urlDate || today);
  const [allOrders, setAllOrders] = useState([]);
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [editId, setEditId] = useState(null);
  const [nameOpts, setNameOpts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy("date", "desc"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllOrders(arr);
      setNameOpts([...new Set(arr.map((o) => o.item))].sort());
    });
    return () => unsub();
  }, [collectionName]);

  const handleSave = async () => {
    const clean = item.trim();
    const qtyNum = parseFloat(qty);
    if (!clean || !qtyNum) return alert("أدخل الصنف والكمية.");

    if (editId) {
      await updateDoc(doc(db, collectionName, editId), { item: clean, qty: qtyNum, unit });
      setEditId(null);
    } else {
      const qSame = query(
        collection(db, collectionName),
        where("date", "==", date),
        where("item", "==", clean),
        where("unit", "==", unit)
      );
      const sameSnap = await getDocs(qSame);
      if (!sameSnap.empty) {
        const ref = sameSnap.docs[0].ref;
        await updateDoc(ref, { qty: sameSnap.docs[0].data().qty + qtyNum });
      } else {
        await addDoc(collection(db, collectionName), {
          item: clean,
          qty: qtyNum,
          unit,
          date,
          createdAt: serverTimestamp(),
          source: "orders",
        });
      }
    }

    setItem("");
    setQty("");
    setUnit("عدد");
  };

  const loadForEdit = (o) => {
    setItem(o.item);
    setQty(o.qty);
    setUnit(o.unit);
    setEditId(o.id);
  };

  const handleDelete = async (id) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    await deleteDoc(doc(db, collectionName, id));
    if (editId === id) setEditId(null);
  };

  const ordersToday = allOrders.filter(
    (o) => o.date === date && o.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => nav(-1)}>⬅ رجوع</button>
      <h2 className="page-title">{title}</h2>

      {/* اختيار التاريخ */}
      <div className="form-row">
        <label>📅 التاريخ:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {/* بحث بالاسم */}
      <div className="form-row">
        <label>🔍 بحث بالصنف:</label>
        <input
          type="text"
          placeholder="اكتب جزء من اسم الصنف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* إدخال أوردر */}
      <div className="form-row">
        <input list="items-suggest" placeholder="الصنف" value={item} onChange={(e) => setItem(e.target.value)} />
        <datalist id="items-suggest">
          {nameOpts.map((n) => <option key={n} value={n} />)}
        </datalist>

        <input type="number" placeholder="الكمية" value={qty} onChange={(e) => setQty(e.target.value)} />

        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNITS.map((u) => <option key={u}>{u}</option>)}
        </select>

        <button onClick={handleSave}>{editId ? "تحديث" : "إضافة"}</button>
      </div>

      {/* جدول اليوم */}
      <table className="styled-table">
        <thead>
          <tr><th>الصنف</th><th>الكمية</th><th>الوحدة</th><th>تعديل</th><th>حذف</th></tr>
        </thead>
        <tbody>
          {ordersToday.length ? ordersToday.map((o) => (
            <tr key={o.id}>
              <td>{o.item}</td><td>{o.qty}</td><td>{o.unit}</td>
              <td><button onClick={() => loadForEdit(o)}>✏️</button></td>
              <td><button onClick={() => handleDelete(o.id)}>🗑️</button></td>
            </tr>
          )) : <tr><td colSpan="5">لا توجد أوامر.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
