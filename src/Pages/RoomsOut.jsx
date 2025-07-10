import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const RoomsOut = () => {
  const [item, setItem] = useState("");
  const [customItem, setCustomItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [records, setRecords] = useState([]);
  const [editedIds, setEditedIds] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const navigate = useNavigate();

  const itemOptions = [
    "شيكولاتة",
    "مانجا فليت",
    "فرولة فليت",
    "كيوي فليت",
    "جيلي",
    "أدخل صنف جديد"
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("rooms-out")) || [];
    setRecords(stored);

    const storedEdited = JSON.parse(localStorage.getItem("rooms-out-edited")) || [];
    setEditedIds(storedEdited);
  }, []);

  const updateEditedIds = (ids) => {
    setEditedIds(ids);
    localStorage.setItem("rooms-out-edited", JSON.stringify(ids));
  };

  const updateStock = (name, qtyChange) => {
    const stock = JSON.parse(localStorage.getItem("roomItems")) || [];
    const updated = stock.map((row) =>
      row.name.trim().toLowerCase() === name.trim().toLowerCase()
        ? { ...row, quantity: row.quantity + qtyChange }
        : row
    );
    localStorage.setItem("roomItems", JSON.stringify(updated));
  };

  const handleSubmit = () => {
    const finalItem = item === "أدخل صنف جديد" ? customItem.trim() : item.trim();

    if (!finalItem || !quantity) {
      alert("من فضلك أدخل اسم الصنف والكمية");
      return;
    }

    if (editIndex !== null) {
      const password = prompt("أدخل كلمة المرور للتعديل:");
      if (password !== "1234" && password !== "2991034") {
        alert("❌ كلمة المرور غير صحيحة.");
        return;
      }

      const oldRecord = records[editIndex];
      const diff = oldRecord.quantity - Number(quantity);
      updateStock(oldRecord.name, diff);

      const updatedRecord = {
        ...oldRecord,
        name: finalItem,
        quantity: Number(quantity),
        note,
      };

      const updatedRecords = [...records];
      updatedRecords[editIndex] = updatedRecord;
      setRecords(updatedRecords);
      localStorage.setItem("rooms-out", JSON.stringify(updatedRecords));

      const updatedIds = [...editedIds, oldRecord.date];
      updateEditedIds([...new Set(updatedIds)]);

      alert("✅ تم تعديل الصنف.");
    } else {
      const stock = JSON.parse(localStorage.getItem("roomItems")) || [];
      const found = stock.some(
        (row) => row.name.trim().toLowerCase() === finalItem.toLowerCase()
      );
      if (!found) {
        alert("❌ هذا الصنف غير موجود في قسم الغرف.");
        return;
      }

      const updatedStock = stock.map((row) =>
        row.name.trim().toLowerCase() === finalItem.toLowerCase()
          ? { ...row, quantity: row.quantity - Number(quantity) }
          : row
      );
      localStorage.setItem("roomItems", JSON.stringify(updatedStock));

      const now = new Date().toLocaleString("ar-EG", {
        timeZone: "Africa/Cairo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const newRecord = {
        name: finalItem,
        quantity: Number(quantity),
        note,
        date: now,
      };

      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      localStorage.setItem("rooms-out", JSON.stringify(updatedRecords));
    }

    // Reset
    setItem("");
    setCustomItem("");
    setQuantity("");
    setNote("");
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const record = records[index];
    setItem(itemOptions.includes(record.name) ? record.name : "أدخل صنف جديد");
    setCustomItem(record.name);
    setQuantity(record.quantity);
    setNote(record.note);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const password = prompt("أدخل كلمة المرور للحذف:");
    if (password !== "1234" && password !== "2991034") {
      alert("❌ كلمة المرور غير صحيحة.");
      return;
    }

    const confirm = window.confirm("هل أنت متأكد من الحذف؟");
    if (!confirm) return;

    const deleted = records[index];
    updateStock(deleted.name, deleted.quantity);

    const updatedRecords = records.filter((_, i) => i !== index);
    setRecords(updatedRecords);
    localStorage.setItem("rooms-out", JSON.stringify(updatedRecords));

    const updatedIds = editedIds.filter((id) => id !== deleted.date);
    updateEditedIds(updatedIds);
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من الغرف</h2>

      <div className="form-row">
        <select value={item} onChange={(e) => setItem(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>

        {item === "أدخل صنف جديد" && (
          <input
            type="text"
            placeholder="اسم الصنف الجديد"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
          />
        )}

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="text"
          placeholder="البيان / ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="add-button" onClick={handleSubmit}>
          {editIndex !== null ? "💾 تحديث" : "➕ تسجيل"}
        </button>
      </div>

      <h3 className="table-title">📑 سجل الصادر:</h3>
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>اسم الصنف</th>
              <th>الكمية</th>
              <th>البيان</th>
              <th>التاريخ</th>
              <th>تعديل</th>
              <th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, index) => (
              <tr
                key={index}
                className={editedIds.includes(rec.date) ? "edited-row" : ""}
              >
                <td>{rec.name}</td>
                <td>{rec.quantity}</td>
                <td>{rec.note}</td>
                <td>{rec.date}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(index)}>تعديل</button>
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(index)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomsOut;
