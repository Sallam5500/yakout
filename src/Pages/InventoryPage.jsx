// src/pages/InventoryPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const InventoryPage = () => {
  const { branchId } = useParams();
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [note, setNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState([]);

  const branchName = branchId === "barkasaba" ? "بركة السبع" : "قويسنا";

  const collectionRef = collection(db, `shop-inventory-${branchId}/${selectedDate}/records`);

  useEffect(() => {
    const q = query(collectionRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(data);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item || !quantity) return alert("يرجى إدخال الصنف والكمية");

    await addDoc(collectionRef, {
      item,
      quantity: Number(quantity),
      unit,
      note,
      timestamp: serverTimestamp(),
    });

    setItem("");
    setQuantity("");
    setUnit("عدد");
    setNote("");
  };

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => window.history.back()}>⬅ رجوع</button>
      <h2 className="page-title">📋 جرد المحل - {branchName}</h2>

      <div className="form-row">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="اسم الصنف"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="عدد">عدد</option>
          <option value="كيلو">كيلو</option>
          <option value="علبة">علبة</option>
          <option value="سيرفيس">سيرفيس</option>
          <option value="صاج">برنيكة</option>
          <option value="صاج">صاج</option>
        </select>
        <input
          type="text"
          placeholder="ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button onClick={handleSubmit}>➕ إضافة</button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>الوحدة</th>
            <th>ملاحظات</th>
            <th>الوقت</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id}>
              <td>{rec.item}</td>
              <td>{rec.quantity}</td>
              <td>{rec.unit}</td>
              <td>{rec.note}</td>
              <td>{rec.timestamp?.toDate().toLocaleTimeString("ar-EG")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
