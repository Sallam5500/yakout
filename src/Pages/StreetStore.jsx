// src/pages/StreetStore.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StreetStore = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem("streetStoreItems")) || [];
    setItems(storedItems);
  }, []);

  const saveToLocalStorage = (data) => {
    localStorage.setItem("streetStoreItems", JSON.stringify(data));
  };

  const handleAddOrUpdate = () => {
    if (!name || !quantity) return alert("من فضلك أدخل الاسم والكمية");

    const today = new Date().toISOString().split("T")[0];

    if (editId) {
      // تعديل
      const updatedItems = items.map((item) =>
        item.id === editId
          ? { ...item, name, quantity: parseFloat(quantity), unit }
          : item
      );
      setItems(updatedItems);
      saveToLocalStorage(updatedItems);
      setEditId(null);
    } else {
      // إضافة جديدة
      const newItem = {
        id: Date.now(),
        name,
        quantity: parseFloat(quantity),
        unit,
        date: today,
      };
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      saveToLocalStorage(updatedItems);
    }

    // تفريغ الحقول
    setName("");
    setQuantity("");
    setUnit("عدد");
  };

  const handleDelete = (id) => {
    const password = prompt("أدخل كلمة المرور للحذف:");
    if (password !== "1234") {
      alert("كلمة المرور غير صحيحة.");
      return;
    }

    const confirmDelete = window.confirm("هل أنت متأكد من الحذف؟");
    if (!confirmDelete) return;

    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    saveToLocalStorage(updatedItems);
  };

  const handleEdit = (item) => {
    setName(item.name);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setEditId(item.id);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto", direction: "rtl" }}>
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

      <h2>🏪 المخزن اللي في الشارع</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="اسم المنتج"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "6px", marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ padding: "6px", marginRight: "10px" }}
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          style={{ padding: "6px" }}
        >
          <option>عدد</option>
          <option>كيلو</option>
        </select>
        <button
          onClick={handleAddOrUpdate}
          style={{
            marginRight: "10px",
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
            <th>الاسم</th>
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

export default StreetStore;