// src/pages/RequiredItems.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const RequiredItems = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // تحميل البيانات من Firestore لحظيًا
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "required-items"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(
        data.sort(
          (a, b) =>
            b.createdAt?.seconds - a.createdAt?.seconds
        )
      );
    });

    return () => unsub();
  }, []);

  // إضافة صنف جديد
  const handleAdd = async () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    await addDoc(collection(db, "required-items"), {
      name,
      quantity: parseInt(quantity),
      unit,
      createdAt: serverTimestamp(),
      updated: false,
    });

    setName("");
    setQuantity("");
    setUnit("عدد");
  };

  // حذف صنف
  const handleDelete = async (id) => {
    const password = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (password === "1234" || password === "2991034") {
      await deleteDoc(doc(db, "required-items", id));
    } else {
      alert("كلمة المرور خاطئة.");
    }
  };

  // تعديل صنف
  const handleEdit = async (item) => {
    const password = prompt("ادخل كلمة المرور لتعديل الصنف:");
    if (password !== "1234" && password !== "2991034") {
      alert("كلمة المرور خاطئة.");
      return;
    }

    const newName = prompt("اسم الصنف الجديد:", item.name);
    const newQuantity = prompt("الكمية الجديدة:", item.quantity);
    const newUnit = prompt("الوحدة الجديدة (عدد أو كيلو):", item.unit);

    if (!newName || !newQuantity || !newUnit) {
      alert("لم يتم تعديل البيانات.");
      return;
    }

    await updateDoc(doc(db, "required-items", item.id), {
      name: newName,
      quantity: parseInt(newQuantity),
      unit: newUnit,
      updated: true,
    });
  };

  // فلترة
  const filteredItems = items.filter(
    (item) =>
      item.name.includes(searchTerm.trim()) ||
      (item.createdAt &&
        new Date(item.createdAt.seconds * 1000)
          .toLocaleDateString("fr-CA")
          .includes(searchTerm.trim()))
  );

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📄 الاحتياجات المطلوبة من الخارج</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      {/* الإدخال */}
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
          <option value="كيلو">كيلو</option>
        </select>
        <button className="add-button" onClick={handleAdd}>تسجيل احتياج</button>
      </div>

      {/* البحث */}
      <input
        type="text"
        className="search"
        placeholder="اكتب اسم أو تاريخ"
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

      {/* الجدول */}
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
            <tr>
              <td colSpan="5">لا توجد بيانات.</td>
            </tr>
          ) : (
            filteredItems.map((item, index) => (
              <tr key={item.id} className={item.updated ? "edited-row" : ""}>
                <td>
                  {item.createdAt
                    ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("fr-CA")
                    : "—"}
                </td>
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

export default RequiredItems;
