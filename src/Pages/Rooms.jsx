import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const Rooms = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);

  const itemOptions = [
    "شيكولاتة",
    "مانجا فليت",
    "فرولة فليت",
    "كيوي فليت",
    "جيلي",
    "أدخل صنف جديد"
  ];

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem("roomItems")) || [];
    setItems(storedItems);
  }, []);

  const saveToLocalStorage = (data) => {
    localStorage.setItem("roomItems", JSON.stringify(data));
  };

  const handleAddOrUpdate = () => {
    const finalName = name === "أدخل صنف جديد" ? customName.trim() : name.trim();

    if (!finalName || !quantity) return alert("من فضلك أدخل الاسم والكمية");

    const today = new Date().toISOString().split("T")[0];

    if (editId) {
      const password = prompt("ادخل كلمة السر لتعديل الصنف:");
      if (password !== "1234" && password !== "2991034") {
        alert("كلمة المرور غير صحيحة");
        return;
      }

      const updatedItems = items.map((item) =>
        item.id === editId
          ? {
              ...item,
              name: finalName,
              quantity: parseFloat(quantity),
              unit,
              isEdited: true,
            }
          : item
      );
      setItems(updatedItems);
      saveToLocalStorage(updatedItems);
      setEditId(null);
    } else {
      const newItem = {
        id: Date.now(),
        name: finalName,
        quantity: parseFloat(quantity),
        unit,
        date: today,
        isEdited: false,
      };
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      saveToLocalStorage(updatedItems);
    }

    setName("");
    setCustomName("");
    setQuantity("");
    setUnit("عدد");
  };

  const handleDelete = (id) => {
    const password = prompt("أدخل كلمة المرور للحذف:");
    if (password !== "1234" && password !== "2991034") {
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
    setCustomName("");
    setQuantity(item.quantity);
    setUnit(item.unit);
    setEditId(item.id);
  };

  return (
    <div className="page-container" dir="rtl">
      <button className="back-button" onClick={() => navigate(-1)}>
        ⬅ رجوع
      </button>

      <h2 className="page-title">🢨 غرفة التبريد</h2>

      <div className="form-row">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((item, idx) => (
            <option key={idx} value={item}>
              {item}
            </option>
          ))}
        </select>

        {name === "أدخل صنف جديد" && (
          <input
            type="text"
            placeholder="أدخل اسم الصنف"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        )}

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option>عدد</option>
          <option>كيلو</option>
          <option>صاج</option>
          <option>جردل</option>
          <option>كيس</option>
          <option>برنيكة</option>
        </select>
        <button className="add-button" onClick={handleAddOrUpdate}>
          {editId ? "تحديث" : "إضافة"}
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
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
            <tr
              key={item.id}
              className={item.isEdited ? "edited-row" : ""}
              style={{ textAlign: "center" }}
            >
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.date}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(item)}>
                  تعديل
                </button>
              </td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
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

export default Rooms;
