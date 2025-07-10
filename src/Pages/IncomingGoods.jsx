import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const IncomingGoods = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const itemOptions = [
    "شكارة كريمه ", "بسبوسة", "كيس بندق ني بسبوسة", "هريسة", "بسيمة", "حبيبه", " رموش", 
    "لينزا", "جلاش", "نشابه", "صوابع", "بلح", "علب كريمة", "قشطوطة", 
    "فادج ", "كيس كاكو1.750جرام ", " كيس جرانه", "عزيزية ", "بسبوسة تركي ",
    "شكارة سوداني مكسر ", "ك بندق ني مكسر  ", " كيس سوداني روشيه", "كيس بندق محمص250جرام ", " كيس أكلير ",
    "كرتونة بندق سليم", "ك سكر بودره ", " ك جوز هند ناعم", "ك سميد", "جيلاتينة","ك لبن بودره",
    "كيس لبن بودره 150 جرام","شيكولاته اسمر","شيكولاته بيضاء","كرتونة زيت","جركن زيت","لباني","باستري",
    "فانليا","فاكيوم 7سم",
    "لون احمر","علب طلبية","كرتونة خميرة فورية","سمنة فرن","نشا","سكر","دقيق اهرام","وجبة بتي فور","جوز هند محمص",
    "لوز محمص مجروش","جوز هند ابيض","وجبة بسكوت","رابطة حلويات","علب بتي فور نص","علب بسكوت نص","علب غريبة نص",
    "علب كعك ساده نص","علب كعك ملبن نص","لعب جاتوه","دفتر ترنسفير الوان","ملبن","وجبه سيرب","بكر استرتش",
    "ورق سلوفان موس","علب جاتوه دسته","دفتر ترانسفير ساده","كرتونة بكين بودر ","ستان 2سم","جيلي شفاف","جيلي سخن",
    "بيض",
    "مانجا فليت",
    "فرولة فليت",
    "كيوي فليت",
    "مربي مشمش",
    "لباني ",
    "جبنه تشيز كيك ",
    "رومانتك ابيض ",
    "رومانتك اسمر ",
    "بشر اسمر ",
    "بشر ابيض ",
    "لوتس ",
    "نوتيلا ",
    "جناش جديد ",
    "جناش  ",
    "أدخل صنف جديد"
  ];

  useEffect(() => {
    const stored = localStorage.getItem("incomingGoods");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("incomingGoods", JSON.stringify(items));
  }, [items]);

  const handleAdd = () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const date = new Date().toLocaleDateString("fr-CA");
    const newItem = { name, quantity: parseInt(quantity), unit, date, updated: false };
    setItems([...items, newItem]);

    setName("");
    setQuantity("");
    setUnit("عدد");
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
      updated: true,
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
      <h2 className="page-title">📥 البضاعة الواردة للمصنع</h2>
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
        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="عدد">عدد</option>
          <option value="كيلو">كيلو</option>
          <option value="شكارة">شكارة</option>
          <option value="كرتونة">كرتونة</option>
          <option value="كيس">كيس</option>
          <option value="علب">علب</option>
          <option value="برميل">برميل</option>
        </select>
        <button className="add-button" onClick={handleAdd}>تسجيل البضاعة</button>
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

export default IncomingGoods;
