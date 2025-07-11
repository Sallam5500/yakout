// src/pages/FrenchMousse.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const FrenchMousse = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const collectionRef = collection(db, "frenchMousseOrders");

  useEffect(() => {
    const unsub = onSnapshot(collectionRef, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(data);
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!name || !quantity) return alert("يرجى إدخال اسم الصنف والكمية.");

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
    const pwd = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (pwd === "1234" || pwd === "2991034") {
      await deleteDoc(doc(db, "frenchMousseOrders", id));
    } else {
      alert("كلمة المرور خاطئة.");
    }
  };

  const handleEdit = async (item) => {
    const pwd = prompt("ادخل كلمة المرور لتعديل الصنف:");
    if (pwd !== "1234" && pwd !== "2991034") return alert("كلمة المرور خاطئة.");

    const newName = prompt("اسم الصنف الجديد:", item.name);
    const newQty = prompt("الكمية الجديدة:", item.quantity);
    const newUnit = prompt("الوحدة الجديدة:", item.unit);

    if (!newName || !newQty || !newUnit) return alert("لم يتم تعديل البيانات.");

    await updateDoc(doc(db, "frenchMousseOrders", item.id), {
      name: newName,
      quantity: parseInt(newQty),
      unit: newUnit,
      updated: true,
    });
  };

  const filtered = items.filter(
    (it) =>
      it.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      it.date.includes(searchTerm.trim())
  );

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🍮 أوردرات الموس الفرنسي</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

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
          {filtered.length === 0 ? (
            <tr><td colSpan="5">لا توجد بيانات.</td></tr>
          ) : (
            filtered.map((it) => (
              <tr key={it.id} className={it.updated ? "edited-row" : ""}>
                <td>{it.date}</td>
                <td>{it.name}</td>
                <td>{it.quantity}</td>
                <td>{it.unit}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(it)}>✏️</button>{" "}
                  <button className="delete-btn" onClick={() => handleDelete(it.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FrenchMousse;
