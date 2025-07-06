import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css";

const FrenchMousse = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("frenchMousseOrders");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("frenchMousseOrders", JSON.stringify(items));
  }, [items]);

  const handleAdd = () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const date = new Date().toLocaleDateString("fr-CA");
    const newItem = { name, quantity: parseInt(quantity), unit, date };
    setItems([...items, newItem]);

    setName("");
    setQuantity("");
    setUnit("عدد");
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

  const handleEdit = (index) => {
    const password = prompt("ادخل كلمة المرور لتعديل الصنف:");
    if (password !== "1234") {
      alert("كلمة المرور خاطئة.");
      return;
    }

    const newName = prompt("اسم الصنف الجديد:", items[index].name);
    const newQuantity = prompt("الكمية الجديدة:", items[index].quantity);
    const newUnit = prompt("الوحدة الجديدة:", items[index].unit);

    if (!newName || !newQuantity || !newUnit) {
      alert("لم يتم تعديل البيانات.");
      return;
    }

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      name: newName,
      quantity: parseInt(newQuantity),
      unit: newUnit,
      updated: true,
    };
    setItems(updated);
  };

  const filteredItems = items.filter(
    (item) => item.name.includes(searchTerm) || item.date.includes(searchTerm)
  );

  return (
    <div className="store-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>🍮 أوردرات الموس الفرنسي</h2>
      
      <button onClick={() => window.print()} className="print-btn">🖨️ طباعة</button>

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
          <option value="قالب">قالب</option>
          <option value="صينية">صينية</option>
        </select>
        <button onClick={handleAdd}>تسجيل الصنف</button>
      </div>

      <input
        type="text"
        className="search"
        placeholder="بحث بالاسم أو التاريخ"
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
              <tr
                key={index}
                style={{
                  backgroundColor: item.updated ? "#d0ebff" : "transparent",
                }}
              >
                <td>{item.date}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>
                  <button onClick={() => handleEdit(index)}>✏️</button>{" "}
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

export default FrenchMousse;
