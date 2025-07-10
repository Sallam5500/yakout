// src/pages/ExportPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  doc
} from "firebase/firestore";

const ExportPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [exportItems, setExportItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // جلب بيانات المخزون لحظيًا
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "storeItems"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStockItems(items);
    });
    return () => unsubscribe();
  }, []);

  // جلب بيانات الصادرات لحظيًا
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "exportItems"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExportItems(items);
    });
    return () => unsubscribe();
  }, []);

  // تسجيل عملية تصدير
  const handleAddExport = async () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const date = new Date().toLocaleDateString("fr-CA");

    // البحث في المخزون
    const q = query(
      collection(db, "storeItems"),
      where("name", "==", name),
      where("unit", "==", unit)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("الصنف غير موجود في المخزون.");
      return;
    }

    const stockDoc = snapshot.docs[0];
    const stockData = stockDoc.data();

    if (stockData.quantity < parseInt(quantity)) {
      alert("الكمية غير متوفرة في المخزون.");
      return;
    }

    // خصم الكمية من المخزون
    const newQty = stockData.quantity - parseInt(quantity);
    await updateDoc(doc(db, "storeItems", stockDoc.id), { quantity: newQty });

    // تسجيل الصادر
    await addDoc(collection(db, "exportItems"), {
      name,
      quantity: parseInt(quantity),
      unit,
      date,
    });

    setName("");
    setQuantity("");
    setUnit("عدد");
  };

  // حذف صادر
  const handleDelete = async (id) => {
    const password = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (password !== "2991034") {
      alert("كلمة المرور خاطئة.");
      return;
    }

    const updated = exportItems.filter((item) => item.id !== id);
    setExportItems(updated); // تحديث الواجهة فقط (اختياري)

    await updateDoc(doc(db, "exportItems", id), {
      quantity: 0,
    });
  };

  const filteredItems = exportItems.filter(
    (item) =>
      item.name.includes(searchTerm) || item.date.includes(searchTerm)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادرات</h2>

      <div className="form-row">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">اختر الصنف</option>
          {[...new Set(stockItems.map((item) => item.name))].sort().map((itemName, index) => (
            <option key={index} value={itemName}>{itemName}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="عدد">عدد</option>
          <option value="كيلو">كيلو</option>
          <option value="كيس">كيس</option>
          <option value="برنيكه">برنيكه</option>
          <option value="جرام">جرام</option>
          <option value="برميل">برميل</option>
          <option value="كرتونة">كرتونة</option>
        </select>

        <button onClick={handleAddExport}>➕ تسجيل صادر</button>
      </div>

      <div className="form-row">
        <input
          type="text"
          className="search"
          placeholder="🔍 ابحث بالاسم أو التاريخ"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handlePrint}>🖨️ طباعة</button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>📅 التاريخ</th>
            <th>📦 الصنف</th>
            <th>🔢 الكمية</th>
            <th>⚖️ الوحدة</th>
            <th>🛠️ إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length === 0 ? (
            <tr><td colSpan="5">لا توجد بيانات.</td></tr>
          ) : (
            filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>
                  <button onClick={() => handleDelete(item.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExportPage;
