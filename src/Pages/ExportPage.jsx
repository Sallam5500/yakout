import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";
import { db } from "../firebase";
import {
  collection, onSnapshot, addDoc, updateDoc,
  query, where, getDocs, doc, orderBy,
  deleteDoc, serverTimestamp,
} from "firebase/firestore";

/* الوحدات الافتراضية ( fallback ) */
const unitsList = [
  "عدد", "شكاره", "جردل", "كيلو", "كيس",
  "برنيكه", "جرام", "برميل", "كرتونة"
];

const ExportPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [exportItems, setExportItems] = useState([]);

  // إدخال المستخدم
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");

  // قوائم ديناميكية
  const [availableNames, setAvailableNames] = useState([]);  // 🆕
  const [availableUnits, setAvailableUnits] = useState(unitsList); // 🆕

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  /* ---------- استماع للمخزون ---------- */
  useEffect(() => {
    const q = query(
      collection(db, "storeItems"),
      orderBy("date", "asc"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStockItems(items);

      // حدّث قائمة الأسماء الفريدة
      const names = [...new Set(items.map((it) => it.name))].sort();
      setAvailableNames(names);
    });
  }, []);

  /* ---------- استماع للصادرات ---------- */
  useEffect(() => {
    const q = query(
      collection(db, "exportItems"),
      orderBy("date", "asc"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) =>
      setExportItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* ---------- تحديث الوحدات عند تغيير الاسم ---------- */
  useEffect(() => {
    const unitsForName = [
      ...new Set(stockItems
        .filter((it) => it.name === name.trim())
        .map((it) => it.unit))
    ];
    if (unitsForName.length) {
      setAvailableUnits(unitsForName);
      if (!unitsForName.includes(unit)) setUnit(unitsForName[0]);
    } else {
      setAvailableUnits(unitsList); // صنف جديد لم يُسجَّل بعد
    }
  }, [name, stockItems]);  // يعيد التقييم مع تغيّر الاسم أو المخزون

  /* ---------- تسجيل صادر ---------- */
  const handleAddExport = async () => {
    const cleanedName = name.trim();
    if (!cleanedName || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }
    const date = new Date().toLocaleDateString("fr-CA");

    // ابحث بالاسم فقط
    const qStock = query(
      collection(db, "storeItems"),
      where("name", "==", cleanedName)
    );
    const stockSnap = await getDocs(qStock);

    if (stockSnap.empty) {
      alert("الصنف غير موجود في المخزن.");
      return;
    }

    // مطابقة الوحدة
    const matchDoc = stockSnap.docs.find((d) => d.data().unit === unit);
    if (!matchDoc) {
      const unitsAvail = [...new Set(stockSnap.docs.map((d) => d.data().unit))].join(" ، ");
      alert(`الوحدة «${unit}» غير مسجَّلة لهذا الصنف.\nالوحدات المتاحة: ${unitsAvail}`);
      return;
    }

    const { quantity: availQty } = matchDoc.data();
    const qtyWanted = parseInt(quantity);

    if (availQty < qtyWanted) {
      alert(`الكمية غير متوفرة. المتاح: ${availQty}`);
      return;
    }

    // خصم من المخزون
    await updateDoc(doc(db, "storeItems", matchDoc.id), {
      quantity: availQty - qtyWanted,
    });

    // دمج/إضافة إلى exportItems
    const qExport = query(
      collection(db, "exportItems"),
      where("name", "==", cleanedName),
      where("unit", "==", unit),
      where("date", "==", date)
    );
    const exportSnap = await getDocs(qExport);

    if (!exportSnap.empty) {
      const expDoc = exportSnap.docs[0];
      await updateDoc(doc(db, "exportItems", expDoc.id), {
        quantity: expDoc.data().quantity + qtyWanted,
      });
    } else {
      await addDoc(collection(db, "exportItems"), {
        name: cleanedName,
        quantity: qtyWanted,
        unit,
        date,
        createdAt: serverTimestamp(),
      });
    }

    // إعادة الضبط
    setName("");
    setQuantity("");
    setUnit("عدد");
  };

  /* ---------- حذف صادر ---------- */
  const handleDelete = async (id) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    await deleteDoc(doc(db, "exportItems", id));
  };

  /* ---------- فلترة الجدول ---------- */
  const filtered = exportItems.filter(
    (it) => it.name.includes(searchTerm) || it.date.includes(searchTerm)
  );

  /* ---------- UI ---------- */
  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادرات</h2>

      {/* إدخال صادر */}
      <div className="form-row">
        {/* اسم الصنف: ديناميكي من المخزون */}
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">اختر صنف</option>
          {availableNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="أو اكتب صنف جديد"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* الكمية */}
        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {/* الوحدة: تتغيّر حسب الصنف */}
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          {availableUnits.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <button type="button" onClick={handleAddExport}>➕ تسجيل صادر</button>
      </div>

      {/* بحث وطباعة */}
      <div className="form-row">
        <input
          className="search"
          placeholder="🔍 ابحث بالاسم أو التاريخ"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="button" onClick={() => window.print()}>🖨️ طباعة</button>
      </div>

      {/* جدول الصادرات */}
      <table className="styled-table">
        <thead><tr>
          <th>📅 التاريخ</th><th>📦 الصنف</th><th>🔢 الكمية</th>
          <th>⚖️ الوحدة</th><th>🛠️ إجراءات</th>
        </tr></thead>
        <tbody>
          {filtered.length ? filtered.map((it) => (
            <tr key={it.id}>
              <td>{it.date}</td><td>{it.name}</td>
              <td>{it.quantity}</td><td>{it.unit}</td>
              <td><button onClick={() => handleDelete(it.id)}>🗑️</button></td>
            </tr>
          )) : <tr><td colSpan="5">لا توجد بيانات.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default ExportPage;
