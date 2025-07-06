// src/pages/StockPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css";

const StockPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedStock = localStorage.getItem("storeItems");
    if (storedStock) setStockItems(JSON.parse(storedStock));
  }, []);

  useEffect(() => {
    localStorage.setItem("storeItems", JSON.stringify(stockItems));
  }, [stockItems]);

  const handleAddStock = () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const date = new Date().toLocaleDateString("fr-CA");
    const existingIndex = stockItems.findIndex(
      (item) => item.name === name && item.date === date && item.unit === unit
    );

    if (existingIndex !== -1) {
      const updated = [...stockItems];
      updated[existingIndex].quantity += parseInt(quantity);
      setStockItems(updated);
    } else {
      const newItem = { name, quantity: parseInt(quantity), unit, date };
      setStockItems([...stockItems, newItem]);
    }

    setName("");
    setQuantity("");
    setUnit("عدد");
  };

  const handleDelete = (index) => {
    const password = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (password !== "1234") {
      alert("كلمة المرور خاطئة.");
      return;
    }

    const updated = [...stockItems];
    updated.splice(index, 1);
    setStockItems(updated);
  };

  const filteredItems = stockItems.filter(
    (item) => item.name.includes(searchTerm) || item.date.includes(searchTerm)
  );

  return (
    <div className="store-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>📦 البضاعة (المخزون الرئيسي)</h2>

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
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="عدد">عدد</option>
          <option value="كيلو">كيلو</option>
        </select>
        <button onClick={handleAddStock}>إضافة للمخزن</button>
      </div>

      <input
        type="text"
        className="search"
        placeholder="ابحث بالاسم أو التاريخ"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="items-table">
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
            <tr><td colSpan="5">لا توجد بيانات.</td></tr>
          ) : (
            filteredItems.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
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

export default StockPage;
