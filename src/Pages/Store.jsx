import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css";

const Store = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("storeItems");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("storeItems", JSON.stringify(items));
  }, [items]);

  const handleAdd = () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const date = new Date().toISOString().split("T")[0];
    const existingIndex = items.findIndex(
      (item) => item.name === name && item.date === date
    );

    if (existingIndex !== -1) {
      // موجود → زود الكمية
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += parseInt(quantity);
      setItems(updatedItems);
    } else {
      // جديد → أضفه
      const newItem = { name, quantity: parseInt(quantity), date };
      setItems([...items, newItem]);
    }

    setName("");
    setQuantity("");
  };

  const handleDelete = (index) => {
    const password = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (password === "1234") {
      const updated = [...items];
      updated.splice(index, 1);
      setItems(updated);
    } else {
      alert("كلمة المرور خاطئة.");
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.includes(searchTerm) || item.date.includes(searchTerm)
  );

  return (
    <div className="store-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>المخزن الرئيسي</h2>

      <div className="form-section">
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
        <button onClick={handleAdd}>تسجيل الأصناف</button>
      </div>

      <input
        type="text"
        className="search"
        placeholder="اكتب اسم الصنف أو التاريخ"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="items-table">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length === 0 ? (
            <tr>
              <td colSpan="4">لا توجد بيانات.</td>
            </tr>
          ) : (
            filteredItems.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>
                  <button onClick={() => handleDelete(index)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Store;