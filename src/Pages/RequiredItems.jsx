// src/pages/RequiredItems.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RequiredItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("RequiredItems")) || [];
    setItems(stored);
  }, []);

  const handleAddOrUpdate = () => {
    if (!name || !quantity) return alert("يرجى ملء اسم الصنف والكمية");

    const item = {
      id: editId || Date.now(),
      name,
      quantity,
      unit,
      date: new Date().toLocaleDateString("en-GB"),
    };

    let updated;
    if (editId) {
      updated = items.map((el) => (el.id === editId ? item : el));
    } else {
      updated = [...items, item];
    }

    setItems(updated);
    localStorage.setItem("RequiredItems", JSON.stringify(updated));

    setName("");
    setQuantity("");
    setUnit("عدد");
    setEditId(null);
  };

  const handleEdit = (item) => {
    setName(item.name);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setEditId(item.id);
  };

  const handleDelete = (id) => {
    const pass = prompt("ادخل كلمة المرور لحذف الصنف");
    if (pass !== "1234") return alert("كلمة المرور خاطئة");

    if (!window.confirm("هل أنت متأكد من حذف هذا الصنف؟")) return;

    const updated = items.filter((el) => el.id !== id);
    setItems(updated);
    localStorage.setItem("RequiredItems", JSON.stringify(updated));
  };

  return (
    <div style={{ padding: "20px", direction: "rtl", maxWidth: "800px", margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "15px",
          padding: "6px 12px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        ⬅ رجوع
      </button>

      <h2>📦 البضاعة المطلوبة</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="اسم الصنف"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "6px", marginLeft: "10px" }}
        />
        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ padding: "6px", marginLeft: "10px" }}
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          style={{ padding: "6px", marginLeft: "10px" }}
        >
          <option value="عدد">عدد</option>
          <option value="كيلو">كيلو</option>
        </select>
        <br />
        <button
          onClick={handleAddOrUpdate}
          style={{
            marginTop: "10px",
            padding: "6px 12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {editId ? "تحديث" : "إضافة"}
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>الوحدة</th>
            <th>التاريخ</th>
            <th>تعديل</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ textAlign: "center" }}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.date}</td>
              <td>
                <button
                  onClick={() => handleEdit(item)}
                  style={{
                    backgroundColor: "#ffc107",
                    color: "black",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  تعديل
                </button>
              </td>
              <td>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequiredItems;