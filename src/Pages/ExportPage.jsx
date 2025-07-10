import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

const ExportPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [exportItems, setExportItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("fr-CA");

  const storeRef = collection(db, "storeItems");
  const exportRef = collection(db, "exportItems");

  // تحميل الأصناف والمخزون
  useEffect(() => {
    const fetchData = async () => {
      const storeSnap = await getDocs(storeRef);
      const exportSnap = await getDocs(exportRef);

      setStockItems(storeSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setExportItems(exportSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const handleAddExport = async () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const stockItem = stockItems.find(
      (item) => item.name === name && item.unit === unit
    );

    if (!stockItem || stockItem.quantity < parseInt(quantity)) {
      alert("الكمية غير متوفرة في المخزن.");
      return;
    }

    // خصم من المخزون
    const updatedQuantity = stockItem.quantity - parseInt(quantity);
    await updateDoc(doc(db, "storeItems", stockItem.id), {
      quantity: updatedQuantity,
    });

    // إضافة في الصادرات
    const newExport = {
      name,
      quantity: parseInt(quantity),
      unit,
      date: today,
    };

    const exportDoc = await addDoc(exportRef, newExport);
    setExportItems((prev) => [...prev, { id: exportDoc.id, ...newExport }]);

    setName("");
    setQuantity("");
    setUnit("عدد");
  };

  const handleDelete = async (id) => {
    const password = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (password !== "2991034") {
      alert("كلمة المرور خاطئة.");
      return;
    }

    await deleteDoc(doc(db, "exportItems", id));
    setExportItems((prev) => prev.filter((item) => item.id !== id));
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
          {[...new Set(stockItems.map((item) => item.name))].map((itemName, index) => (
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
