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
  query,
  where
} from "firebase/firestore";

const StockPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("fr-CA");
  const collectionRef = collection(db, "storeItems");

  // تحميل البيانات من Firestore
  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collectionRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStockItems(data);
    };

    fetchData();
  }, []);

  // إضافة أو تحديث صنف
  const handleAddStock = async () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const existingItem = stockItems.find(
      (item) => item.name === name && item.date === today && item.unit === unit
    );

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + parseInt(quantity);
      await updateDoc(doc(db, "storeItems", existingItem.id), {
        quantity: updatedQuantity,
        updated: true,
      });
      setStockItems((prev) =>
        prev.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: updatedQuantity, updated: true }
            : item
        )
      );
    } else {
      const newItem = {
        name,
        quantity: parseInt(quantity),
        unit,
        date: today,
      };
      const docRef = await addDoc(collectionRef, newItem);
      setStockItems((prev) => [...prev, { id: docRef.id, ...newItem }]);
    }

    setName("");
    setQuantity("");
    setUnit("عدد");
  };

  // حذف صنف
  const handleDelete = async (id) => {
    const password = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (password !== "2991034") {
      alert("كلمة المرور خاطئة.");
      return;
    }

    await deleteDoc(doc(db, "storeItems", id));
    setStockItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = stockItems.filter(
    (item) =>
      item.name.includes(searchTerm) || item.date.includes(searchTerm)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📦 البضاعة (المخزون الرئيسي)</h2>

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
        <button onClick={handleAddStock}>➕ إضافة للمخزن</button>
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
              <tr
                key={item.id}
                style={{
                  backgroundColor: item.updated ? "#d0ebff" : "transparent",
                }}
              >
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

export default StockPage;
