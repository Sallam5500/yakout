// src/pages/ExportPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css";

const ExportPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [exportItems, setExportItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedStock = localStorage.getItem("storeItems");
    const storedExports = localStorage.getItem("exportItems");
    if (storedStock) setStockItems(JSON.parse(storedStock));
    if (storedExports) setExportItems(JSON.parse(storedExports));
  }, []);

  useEffect(() => {
    localStorage.setItem("storeItems", JSON.stringify(stockItems));
    localStorage.setItem("exportItems", JSON.stringify(exportItems));
  }, [stockItems, exportItems]);

  const handleAddExport = () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const date = new Date().toLocaleDateString("fr-CA");
    const stockIndex = stockItems.findIndex(
      (item) => item.name === name && item.unit === unit
    );

    if (stockIndex === -1 || stockItems[stockIndex].quantity < parseInt(quantity)) {
      alert("الكمية غير متوفرة في المخزن.");
      return;
    }

    const updatedStock = [...stockItems];
    updatedStock[stockIndex].quantity -= parseInt(quantity);
    setStockItems(updatedStock);

    const newExport = { name, quantity: parseInt(quantity), unit, date };
    setExportItems([...exportItems, newExport]);

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

    const updated = [...exportItems];
    updated.splice(index, 1);
    setExportItems(updated);
  };

  const filteredItems = exportItems.filter(
    (item) => item.name.includes(searchTerm) || item.date.includes(searchTerm)
  );

  return (
    <div className="store-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>📤 الصادرات</h2>

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
        <button onClick={handleAddExport}>تسجيل صادر</button>
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

export default ExportPage;
