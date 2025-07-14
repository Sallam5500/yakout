// src/pages/Rooms.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, doc, addDoc, onSnapshot, deleteDoc,
  updateDoc, serverTimestamp, query, orderBy,
  setDoc, getDocs, collectionGroup
} from "firebase/firestore";
import "../GlobalStyles.css";

const normalize = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();

const itemOptions = [
  "بيض", "مانجا فليت", "فرولة فليت", "كيوي فليت", "مربي مشمش", "لباني ",
  "جبنه تشيز كيك ", "رومانتك ابيض ", "رومانتك اسمر ", "بشر اسمر ",
  "بشر ابيض ", "لوتس ", "نوتيلا ", "جناش جديد ", "جناش  ", "أدخل صنف جديد"
];

const Rooms = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [quantity, setQty] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [totalQty, setTotalQty] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "rooms-store", selectedDate, "items"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(data);
      setFiltered(data);
    });
  }, [selectedDate]);

  const handleAddOrUpdate = async () => {
    const finalName = name === "أدخل صنف جديد" ? customName.trim() : name.trim();
    if (!finalName || !quantity) return alert("أدخل الاسم والكمية");

    const key = normalize(finalName);
    const qty = parseFloat(quantity);
    const todayRef = collection(db, "rooms-store", selectedDate, "items");

    // اجمع الكمية السابقة من جميع الأيام
    const allDocs = await getDocs(collectionGroup(db, "items"));
    let prev = 0;
    allDocs.forEach((d) => {
      const data = d.data();
      if (data.nameKey === key && data.source === "rooms") prev += parseFloat(data.quantity || 0);
      if (data.nameKey === key && data.source === "rooms-out") prev -= parseFloat(data.quantity || 0);
    });

    const payload = {
      name: finalName,
      nameKey: key,
      quantity: qty,
      unit,
      prevQty: prev,
      currentQty: prev + qty,
      createdAt: serverTimestamp(),
      isEdited: !!editId,
      source: "rooms"
    };

    if (editId) {
      const pwd = prompt("كلمة مرور التعديل؟");
      if (pwd !== "2991034") return alert("كلمة المرور غير صحيحة");
      await updateDoc(doc(db, "rooms-store", selectedDate, "items", editId), payload);
      setEditId(null);
    } else {
      await addDoc(todayRef, payload);
    }

    setName(""); setCustomName(""); setQty(""); setUnit("عدد");
  };

  const handleDelete = async (id) => {
    const pwd = prompt("كلمة المرور للحذف؟");
    if (pwd !== "2991034") return;
    if (!window.confirm("تأكيد الحذف؟")) return;
    await deleteDoc(doc(db, "rooms-store", selectedDate, "items", id));
  };

  const handleEdit = (it) => {
    setName(it.name); setCustomName("");
    setQty(it.quantity); setUnit(it.unit);
    setEditId(it.id);
  };

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) { setFiltered(items); setTotalQty(null); return; }
    const data = items.filter((it) => normalize(it.name).includes(term));
    setFiltered(data);
    const total = data.reduce((sum, it) => sum + parseFloat(it.quantity || 0), 0);
    setTotalQty(total);
  };

  return (
    <div className="page-container" dir="rtl">
      <button className="back-button" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🧊 غرفة التبريد</h2>

      <div className="form-row">
        <label>📅 اختر التاريخ:</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      <div className="form-row">
        <input
          type="text"
          placeholder="ابحث باسم الصنف"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>🔍 بحث</button>
        {totalQty !== null && (
          <span style={{ marginRight: "1rem", color: "#007700", fontWeight: "bold" }}>
            🧮 إجمالي الكمية: {totalQty}
          </span>
        )}
      </div>

      <div className="form-row">
        <input
          list="items-list"
          placeholder="اسم الصنف"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <datalist id="items-list">
          {itemOptions.map((opt) => <option value={opt} key={opt} />)}
        </datalist>

        {name === "أدخل صنف جديد" && (
          <input
            placeholder="اسم الصنف الجديد"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        )}

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQty(e.target.value)}
        />

        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option>عدد</option><option>كيلو</option><option>صاج</option>
          <option>جردل</option><option>كيس</option><option>برنيكة</option>
        </select>

        <button onClick={handleAddOrUpdate}>{editId ? "تحديث" : "إضافة"}</button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>الصنف</th><th>الكمية</th><th>الوحدة</th>
            <th>السابق</th><th>الحالي</th><th>تعديل</th><th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((it) => (
            <tr key={it.id} style={{ backgroundColor: it.isEdited ? "#ffcccc" : "transparent", textAlign: "center" }}>
              <td>{it.name}</td>
              <td>{it.quantity}</td>
              <td>{it.unit}</td>
              <td>{it.prevQty || 0}</td>
              <td>{it.currentQty || 0}</td>
              <td><button onClick={() => handleEdit(it)}>تعديل</button></td>
              <td><button onClick={() => handleDelete(it.id)}>حذف</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Rooms;