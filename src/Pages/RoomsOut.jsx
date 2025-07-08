import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Factory.css";

const RoomsOut = () => {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("rooms-out")) || [];
    setRecords(stored);
  }, []);

  const handleSubmit = () => {
    if (!item || !quantity) {
      alert("من فضلك أدخل اسم الصنف والكمية");
      return;
    }

    const stock = JSON.parse(localStorage.getItem("roomItems")) || [];

    const found = stock.some(
      (row) =>
        row.name.trim().toLowerCase() === item.trim().toLowerCase()
    );
    if (!found) {
      alert("❌ هذا الصنف غير موجود في قسم الغرف.");
      return;
    }

    const updatedStock = stock.map((row) =>
      row.name.trim().toLowerCase() === item.trim().toLowerCase()
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
      name: item,
      quantity: Number(quantity),
      note,
      date: now,
    };

    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem("rooms-out", JSON.stringify(updatedRecords));

    setItem("");
    setQuantity("");
    setNote("");
    alert("✅ تم تسجيل الصادر من الغرف.");
  };

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من الغرف</h2>

      <div className="form-container">
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
        <input
          type="text"
          placeholder="البيان / ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button onClick={handleSubmit}>💾 تسجيل</button>
      </div>

      <h3 className="table-title">📑 سجل الصادر:</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>اسم الصنف</th>
              <th>الكمية</th>
              <th>البيان</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, index) => (
              <tr key={index}>
                <td>{rec.name}</td>
                <td>{rec.quantity}</td>
                <td>{rec.note}</td>
                <td>{rec.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomsOut;
