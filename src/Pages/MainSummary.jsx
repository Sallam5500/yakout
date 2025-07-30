import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

const PASSWORD = "2991034";

const StockSummary = () => {
  const [summary, setSummary] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "storeItems"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const aggregated = {};

      data.forEach((item) => {
        const name = item.name;
        const qty = Number(item.quantity) || 0;
        const unit = item.unit || "";

        if (aggregated[name]) {
          aggregated[name].quantity += qty;
        } else {
          aggregated[name] = { quantity: qty, unit, ids: [item.id] };
        }
      });

      const result = Object.entries(aggregated).map(([name, val]) => ({
        name,
        quantity: val.quantity,
        unit: val.unit,
        ids: val.ids,
      }));

      setSummary(result);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (name) => {
    const pass = prompt("🔒 أدخل كلمة المرور لحذف الصنف:");
    if (pass !== PASSWORD) {
      alert("❌ كلمة المرور غير صحيحة.");
      return;
    }

    const confirmDelete = window.confirm(`هل أنت متأكد من حذف الصنف "${name}"؟`);
    if (!confirmDelete) return;

    const q = collection(db, "storeItems");
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const itemsToDelete = snapshot.docs.filter((doc) => doc.data().name === name);
      for (const docItem of itemsToDelete) {
        await deleteDoc(doc(db, "storeItems", docItem.id));
      }
    });
    setTimeout(() => unsubscribe(), 1000);
  };

  const handleEdit = async (name, currentQty, currentUnit) => {
    const pass = prompt("🔒 أدخل كلمة المرور لتعديل الصنف:");
    if (pass !== PASSWORD) {
      alert("❌ كلمة المرور غير صحيحة.");
      return;
    }

    const newName = prompt("✏️ أدخل الاسم الجديد:", name);
    if (!newName) return;

    const newQty = prompt("✏️ أدخل الكمية الجديدة:", currentQty);
    if (newQty === null) return;

    const newUnit = prompt("✏️ أدخل الوحدة الجديدة:", currentUnit || "");
    if (newUnit === null) return;

    const q = collection(db, "storeItems");
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const itemsToUpdate = snapshot.docs.filter((doc) => doc.data().name === name);
      for (const docItem of itemsToUpdate) {
        await updateDoc(doc(db, "storeItems", docItem.id), {
          name: newName,
          quantity: Number(newQty),
          unit: newUnit,
        });
      }
    });
    setTimeout(() => unsubscribe(), 1000);
  };

  const filtered = summary.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => window.history.back()}>
        ⬅ رجوع
      </button>

      <h2 className="page-title">📦 ملخص الكمية الإجمالية لكل صنف</h2>

      <div className="form-row">
        <input
          type="text"
          className="search"
          placeholder="🔍 ابحث باسم الصنف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>📦 الصنف</th>
            <th>📊 الكمية</th>
            <th>📐 الوحدة</th>
            <th>⚙️ خيارات</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length ? (
            filtered.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>
                  <button onClick={() => handleEdit(item.name, item.quantity, item.unit)}>✏️ تعديل</button>
                  <button onClick={() => handleDelete(item.name)} style={{ marginRight: "8px" }}>🗑️ حذف</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">لا توجد بيانات.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockSummary;
