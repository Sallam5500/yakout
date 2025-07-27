import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";
import { db } from "../firebase";
import {
  collection, onSnapshot, addDoc, updateDoc,
  query, where, getDocs, doc, orderBy,
  deleteDoc, serverTimestamp,
} from "firebase/firestore";

const unitsList = [
  "عدد", "شكاره", "جردل", "كيلو", "كيس",
  "برنيكه", "جرام", "برميل", "كرتونة"
];

const ExportPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [exportItems, setExportItems] = useState([]);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");

  const [availableNames, setAvailableNames] = useState([]);
  const [availableUnits, setAvailableUnits] = useState(unitsList);

  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // ✅ تاريخ اليوم

  const navigate = useNavigate();

  /* 🟢 1: استماع للمخزون */
  useEffect(() => {
    const q = query(collection(db, "storeItems"), orderBy("date", "asc"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStockItems(items);
      setAvailableNames([...new Set(items.map((i) => i.name))].sort());
    });
  }, []);

  /* 🟢 2: استماع للصادر */
  useEffect(() => {
    const q = query(collection(db, "exportItems"), orderBy("date", "asc"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) =>
      setExportItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* 🔄 3: تحديث الوحدات بناءً على الاسم */
  useEffect(() => {
    const u = [
      ...new Set(stockItems.filter((it) => it.name === name.trim()).map((it) => it.unit))
    ];
    if (u.length) {
      setAvailableUnits(u);
      if (!u.includes(unit)) setUnit(u[0]);
    } else {
      setAvailableUnits(unitsList);
    }
  }, [name, stockItems]);

  /* ➕ 4: إضافة صادر مع خصم من المخزون */
  const handleAddExport = async () => {
    const cleaned = name.trim();
    if (!cleaned || !quantity) return alert("أدخل الاسم والكمية.");

    /* التحقق من الكمية في المخزون */
    const qStock = query(collection(db, "storeItems"), where("name", "==", cleaned), where("unit", "==", unit));
    const stockSnap = await getDocs(qStock);
    if (stockSnap.empty) return alert("الصنف غير موجود بالمخزون.");
    const stockDoc = stockSnap.docs[0];
    const availQty = stockDoc.data().quantity;
    const qtyWanted = parseInt(quantity);
    if (availQty < qtyWanted) return alert(`المتاح: ${availQty}`);

    await updateDoc(doc(db, "storeItems", stockDoc.id), {
      quantity: availQty - qtyWanted,
    });

    const prevSnap = await getDocs(query(
      collection(db, "exportItems"),
      where("name", "==", cleaned),
      where("unit", "==", unit)
    ));
    const prevTotal = prevSnap.docs.reduce((s, d) => s + d.data().quantity, 0);

    const qExport = query(
      collection(db, "exportItems"),
      where("name", "==", cleaned),
      where("unit", "==", unit),
      where("date", "==", date)
    );
    const expSnap = await getDocs(qExport);

    if (!expSnap.empty) {
      const expDoc = expSnap.docs[0];
      await updateDoc(doc(db, "exportItems", expDoc.id), {
        quantity: expDoc.data().quantity + qtyWanted,
        currentQty: expDoc.data().currentQty + qtyWanted,
      });
    } else {
      await addDoc(collection(db, "exportItems"), {
        name: cleaned,
        quantity: qtyWanted,
        unit,
        prevQty: prevTotal,
        currentQty: prevTotal + qtyWanted,
        date,
        createdAt: serverTimestamp(),
        source: "main-export"
      });
    }

    setName(""); setQuantity(""); setUnit("عدد"); setSearchTerm("");
  };

  /* 🗑️ حذف سجل */
  const handleDelete = async (id) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    await deleteDoc(doc(db, "exportItems", id));
  };

  /* 🔍 فلترة حسب التاريخ المختار */
  const filtered = exportItems.filter(
    (it) =>
      (it.name.includes(searchTerm) || it.date.includes(searchTerm)) &&
      it.date === date // ✅ فلترة بالتاريخ
  );

  /* 🖼️ UI */
  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادرات</h2>

      {/* 📅 اختيار التاريخ */}
      <div className="form-row">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "6px", borderRadius: "8px", fontSize: "16px" }}
        />
      </div>

      {/* ➕ تسجيل صادر */}
      <div className="form-row">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">اختر صنف</option>
          {availableNames.map((n) => <option key={n}>{n}</option>)}
        </select>

        <input placeholder="أو اكتب صنف جديد" value={name} onChange={(e) => setName(e.target.value)} />

        <input type="number" placeholder="الكمية" value={quantity} onChange={(e) => setQuantity(e.target.value)} />

        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          {availableUnits.map((u) => <option key={u}>{u}</option>)}
        </select>

        <button onClick={handleAddExport}>➕ تسجيل صادر</button>
      </div>

      {/* 🔍 بحث وطباعة */}
      <div className="form-row">
        <input className="search" placeholder="🔍 ابحث بالاسم أو التاريخ" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <button onClick={() => window.print()}>🖨️ طباعة</button>
      </div>

      {/* 📋 جدول الصادرات */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>📅 التاريخ</th><th>📦 الصنف</th><th>🔢 الكمية</th>
            <th>⚖️ الوحدة</th><th>السابق</th><th>الحالي</th><th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length ? filtered.map((it) => (
            <tr key={it.id}>
              <td>{it.date}</td><td>{it.name}</td><td>{it.quantity}</td><td>{it.unit}</td>
              <td>{it.prevQty ?? "-"}</td><td>{it.currentQty ?? "-"}</td>
              <td><button onClick={() => handleDelete(it.id)}>🗑️</button></td>
            </tr>
          )) : <tr><td colSpan="7">لا توجد بيانات لليوم المختار.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default ExportPage;
