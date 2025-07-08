import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../GlobalStyles.css";

const BranchReceive = () => {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [note, setNote] = useState("");
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();
  const { branchId } = useParams();

  const branchKey = branchId === "barkasaba" ? "barka-receive" : "qwaysna-receive";
  const branchName = branchId === "barkasaba" ? "بركة السبع" : "قويسنا";

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(branchKey)) || [];
    setRecords(stored);
  }, [branchKey]);

  const handleSubmit = () => {
    if (!item || !quantity) {
      alert("من فضلك أدخل اسم الصنف والكمية");
      return;
    }

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
      unit,
      note,
      date: now,
    };

    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem(branchKey, JSON.stringify(updatedRecords));

    setItem("");
    setQuantity("");
    setUnit("عدد");
    setNote("");
    alert("✅ تم تسجيل الاستلام.");
  };

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📥 استلام من المصنع - فرع {branchName}</h2>

      <div className="form-section">
        <div className="form-row">
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
            <option>عدد</option>
            <option>برنيكة</option>
            <option>سيرفيز</option>
            <option>كيلو</option>
            <option>صاج</option>
          </select>
          <input
            type="text"
            placeholder="بيان / ملاحظات"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button onClick={handleSubmit}>💾 تسجيل الاستلام</button>
      </div>

      <h3 className="page-subtitle">📋 السجل:</h3>
      <table className="styled-table">
        <thead>
          <tr>
            <th>اسم الصنف</th>
            <th>الكمية</th>
            <th>الوحدة</th>
            <th>البيان</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr><td colSpan="5">لا توجد بيانات.</td></tr>
          ) : (
            records.map((rec, index) => (
              <tr key={index}>
                <td>{rec.name}</td>
                <td>{rec.quantity}</td>
                <td>{rec.unit}</td>
                <td>{rec.note || '-'}</td>
                <td>{rec.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BranchReceive;
