import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const TruckReceive = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("برنيكة");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // قائمة الأصناف
  const itemOptions = [
    "كنافه كريمة", "لينزا", "مدلعة", "صاج عزيزيه", "بسبوسة ساده", "بسبوسة بندق",
    "جلاش كريمة", "بسبوسة قشطة", "بسبوسة لوتس", "كنافة قشطة", "جلاش", "بقلاوة",
    "جلاش حجاب", "سوارية ساده", "سوارية مكسرات", "بصمة سادة", "بصمة مكسرات", "بسيمة",
    "حبيبة", "رموش", "اسكندراني", "كنافة عش", "بصمة كاجو", "بلح ساده", "صوابع زينب",
    "عش نوتيلا", "عش فاكهة", "صاج رواني", "جلاش تركي", "كنافة فادج", "كنافة بستاشيو",
    "بلح كريمة", "كورنيه", "دسباسيتو", "بروفترول", "ميني مربعه", "تورته ميني",
    "تشيز كيك", "موس مشكلة", "فادج", "فلوتس", "مربعه فور سيزون", "ط26 فور سيزون",
    "ط24 فور سيزون", "تفاحة نص ونص", "تفاحة R/F", "مربعه نص ونص", "مربعه R/F",
    "ط 26 نص ونص", "ط 26 رومانتك", "ط 26 فاكيوم", "ط 24 بلاك", "ط 20 نص ونص", "ط 20 بلاك",
    "قلب صفير", "فيستفال", "قشطوطة", "جاتوه سواريه", "20*30", "موس ابيض", "موس كرامل",
    "موس توت", "موس لوتس", "موس فراولة", "موس شوكولاتة", "موس مانجا", "موس كيوي",
    "أكواب فاكهة", "أكواب شوكولاتة", "مهلبية", "كاس موس", "كاسات فاكهة", "كوبيات جيلاتين",
    "جاتوه كبير", "جاتوه صغير", "التشكلات", "كاب توت", "موس قديم", "بولا", "فاني كيك",
    "طبقات 22", "30*30", "35*35", "مانجا مستطيل", "موس فرنسوي", "كارت كيك", "فاكهة جديد",
    "فلوش جديد", "بيستاشيو مستطيل", "كب بيستاشيو", "تورتة مانجا", "أدخل صنف جديد"
  ];

  useEffect(() => {
    const stored = localStorage.getItem("truckReceive");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("truckReceive", JSON.stringify(items));
  }, [items]);

  const handleAdd = () => {
    const finalName = name === "أدخل صنف جديد" ? customName.trim() : name.trim();

    if (!finalName || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const date = new Date().toLocaleDateString("fr-CA");
    const newItem = {
      name: finalName,
      quantity: parseInt(quantity),
      unit,
      date,
      updated: false
    };
    setItems([...items, newItem]);

    setName("");
    setCustomName("");
    setQuantity("");
    setUnit("برنيكة");
  };

  const handleDelete = (index) => {
    const password = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (password === "1234" || password === "2991034") {
      const updated = [...items];
      updated.splice(index, 1);
      setItems(updated);
    } else {
      alert("كلمة المرور خاطئة.");
    }
  };

  const handleEdit = (index) => {
    const password = prompt("ادخل كلمة المرور لتعديل الصنف:");
    if (password !== "1234" && password !== "2991034") {
      alert("كلمة المرور خاطئة.");
      return;
    }

    const currentItem = items[index];
    const newName = prompt("اسم الصنف الجديد:", currentItem.name);
    const newQuantity = prompt("الكمية الجديدة:", currentItem.quantity);
    const newUnit = prompt("الوحدة الجديدة:", currentItem.unit);

    if (!newName || !newQuantity || !newUnit) {
      alert("لم يتم تعديل البيانات.");
      return;
    }

    const updated = [...items];
    updated[index] = {
      ...currentItem,
      name: newName,
      quantity: parseInt(newQuantity),
      unit: newUnit,
      updated: true
    };
    setItems(updated);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.includes(searchTerm.trim()) || item.date.includes(searchTerm.trim())
  );

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🏭 استلام بضاعة من المصنع</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

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
          <option value="برنيكة">برنيكة</option>
          <option value="صاج">صاج</option>
          <option value="عدد">عدد</option>
          <option value="كيلو">كيلو</option>
          <option value="سيرفيز">سيرفيز</option>
          <option value="بلاكه">بلاكه</option>
        </select>

        <button className="add-button" onClick={handleAdd}>تسجيل استلام</button>
      </div>

      <input
        type="text"
        className="search"
        placeholder="بحث بالاسم أو التاريخ"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "6px",
          border: "none",
          marginBottom: "15px",
          fontSize: "16px",
          width: "300px",
          textAlign: "center"
        }}
      />

      <table className="styled-table">
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
              <tr key={index} className={item.updated ? "edited-row" : ""}>
                <td>{item.date}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(index)}>✏️</button>{" "}
                  <button className="delete-btn" onClick={() => handleDelete(index)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TruckReceive;
