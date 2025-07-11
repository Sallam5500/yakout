// src/pages/Torte.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const Torte = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const collectionRef = collection(db, "torteOrders");

  useEffect(() => {
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const date = new Date().toLocaleDateString("fr-CA");
    await addDoc(collectionRef, {
      name,
      quantity: parseInt(quantity),
      unit,
      date,
      updated: false,
    });

    setName("");
    setQuantity("");
    setUnit("عدد");
  };

  const handleDelete = async (id) => {
    const password = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (password === "1234" || password === "2991034") {
      await deleteDoc(doc(db, "torteOrders", id));
    } else {
      alert("كلمة المرور خاطئة.");
    }
  };

  const handleEdit = async (item) => {
    const password = prompt("ادخل كلمة المرور لتعديل الصنف:");
    if (password !== "1234" && password !== "2991034") {
      alert("كلمة المرور خاطئة.");
      return;
    }

    const newName = prompt("اسم الصنف الجديد:", item.name);
    const newQuantity = prompt("الكمية الجديدة:", item.quantity);
    const newUnit = prompt("الوحدة الجديدة:", item.unit);

    if (!newName || !newQuantity || !newUnit) {
      alert("لم يتم تعديل البيانات.");
      return;
    }

    await updateDoc(doc(db, "torteOrders", item.id), {
      name: newName,
      quantity: parseInt(newQuantity),
      unit: newUnit,
      updated: true,
    });
  };

  const filteredItems = items.filter(
    (item) => item.name.includes(searchTerm.trim()) || item.date.includes(searchTerm.trim())
  );

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🎂 أوردرات التورت</h2>

      <button onClick={() => window.print()} className="print-btn">🖨️ طباعة</button>

      <div className="form-row">
        <input
          type="text"
          placeholder="اسم الصنف"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="عدد">عدد</option>
          <option value="قالب">قالب</option>
          <option value="صينية">صينية</option>
        </select>
        <button className="add-button" onClick={handleAdd}>تسجيل الصنف</button>
      </div>

      <input
        type="text"
        className="search"
        placeholder="بحث بالاسم أو التاريخ"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "6px",
          border: "none",
          marginBottom: "15px",
          fontSize: "16px",
          width: "300px",
          textAlign: "center"
        }}
      />

      <table className="styled-table">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>الوحدة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length === 0 ? (
            <tr><td colSpan="5">لا توجد بيانات.</td></tr>
          ) : (
            filteredItems.map((item) => (
              <tr
                key={item.id}
                className={item.updated ? "edited-row" : ""}
              >
                <td>{item.date}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(item)}>✏️</button>{" "}
                  <button className="delete-btn" onClick={() => handleDelete(item.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Torte;
