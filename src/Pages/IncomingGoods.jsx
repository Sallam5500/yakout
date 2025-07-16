import React, { useState, useEffect, useRef } from "react";
import {
  collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc,
  serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../GlobalStyles.css";

const IncomingGoods = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarRef = useRef();
  const navigate = useNavigate();

  const itemOptions = ["شكارة كريمه", "بسبوسة", "كيس بندق ني بسبوسة", "هريسة", "بسيمة",
  "حبيبه", "رموش", "لينزا", "جلاش", "نشابه", "صوابع", "بلح",
  "علب كريمة", "قشطوطة", "فادج", "كيس كاكو 1.750 جرام", "كيس جرانه",
  "عزيزية", "بسبوسة تركي", "شكارة سوداني مكسر", "ك بندق ني مكسر",
  "كيس سوداني روشيه", "كيس بندق محمص 250 جرام", "كيس أكلير",
  "كرتونة بندق سليم", "ك سكر بودره", "ك جوز هند ناعم", "ك سميد",
  "جيلاتينة", "ك لبن بودره", "كيس لبن بودره 150 جرام", "شيكولاته اسمر",
  "شيكولاته بيضاء", "كرتونة زيت", "جركن زيت", "لباني", "باستري",
  "فانليا", "فاكيوم 7سم", "لون احمر", "علب طلبية", "كرتونة خميرة فورية",
  "سمنة فرن", "نشا", "سكر", "دقيق اهرام", "وجبة بتي فور",
  "جوز هند محمص", "لوز محمص مجروش", "جوز هند ابيض", "وجبة بسكوت",
  "رابطة حلويات", "علب بتي فور نص", "علب بسكوت نص", "علب غريبة نص",
  "علب كعك ساده نص", "علب كعك ملبن نص", "لعب جاتوه",
  "دفتر ترنسفير الوان", "ملبن", "وجبه سيرب", "بكر استرتش",
  "ورق سلوفان موس", "علب جاتوه دسته", "دفتر ترانسفير ساده",
  "كرتونة بكين بودر", "ستان 2سم", "جيلي شفاف", "جيلي سخن", "أدخل صنف جديد"];

  useEffect(() => {
    const q = query(collection(db, "incoming-goods"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = async () => {
    if (!name || !quantity) return alert("يرجى إدخال اسم الصنف والكمية.");
    await addDoc(collection(db, "incoming-goods"), {
      name,
      quantity: Number(quantity),
      unit,
      createdAt: serverTimestamp(),
      updated: false,
    });
    setName(""); setQuantity(""); setUnit("عدد");
  };

  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (!["1234", "2991034"].includes(pwd)) return alert("كلمة المرور خاطئة.");
    await deleteDoc(doc(db, "incoming-goods", id));
  };

  const handleEdit = async (it) => {
    const pwd = prompt("ادخل كلمة المرور لتعديل الصنف:");
    if (!["1234", "2991034"].includes(pwd)) return alert("كلمة المرور خاطئة.");

    const newName = prompt("اسم الصنف الجديد:", it.name);
    const newQty = prompt("الكمية الجديدة:", it.quantity);
    const newUnit = prompt("الوحدة الجديدة:", it.unit);
    if (!newName || !newQty || !newUnit) return;

    await updateDoc(doc(db, "incoming-goods", it.id), {
      name: newName,
      quantity: Number(newQty),
      unit: newUnit,
      updated: true,
    });
  };

  const filtered = items.filter(
    (it) =>
      it.name.includes(searchTerm.trim()) ||
      (it.createdAt &&
        new Date(it.createdAt.seconds * 1000).toLocaleDateString("fr-CA")
          .includes(searchTerm.trim()))
  );

  const groupedByDate = filtered.reduce((acc, item) => {
    const date = item.createdAt
      ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("fr-CA")
      : "—";
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📥 البضاعة الواردة للمصنع</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      {/* زر عرض التقويم */}
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        style={{
          backgroundColor: "#2196f3",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "15px"
        }}
      >
        🗓️ عرض/إخفاء التقويم
      </button>

      {/* التقويم */}
      {showCalendar && (
        <div ref={calendarRef} style={{ marginBottom: "20px", direction: "ltr" }}>
          <Calendar onChange={(date) => setSelectedDate(date)} value={selectedDate} />
        </div>
      )}

      {/* نموذج الإدخال */}
      <div className="form-row">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <input type="number" placeholder="الكمية" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="عدد">عدد</option><option value="كيلو">كيلو</option>
          <option value="شكارة">شكارة</option><option value="كرتونة">كرتونة</option>
          <option value="كيس">كيس</option><option value="علب">علب</option>
          <option value="برميل">برميل</option>
        </select>
        <button className="add-button" onClick={handleAdd}>تسجيل البضاعة</button>
      </div>

      {/* البحث */}
      <input
        className="search" type="text" placeholder="بحث بالاسم أو التاريخ"
        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px", borderRadius: "6px", border: "none",
          marginBottom: "15px", fontSize: "16px", width: "300px", textAlign: "center"
        }}
      />

      {/* عرض حسب الأيام */}
      {Object.keys(groupedByDate).length === 0 ? (
        <p style={{ textAlign: "center" }}>لا توجد بيانات.</p>
      ) : (
        Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date}>
            <h3 style={{ marginTop: "20px", color: "#333" }}>📅 {date}</h3>
            <table className="styled-table">
              <thead>
                <tr><th>الصنف</th><th>الكمية</th><th>الوحدة</th><th>إجراءات</th></tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className={it.updated ? "edited-row" : ""}>
                    <td>{it.name}</td><td>{it.quantity}</td><td>{it.unit}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(it)}>✏️</button>{" "}
                      <button className="delete-btn" onClick={() => handleDelete(it.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* زر التقرير الشهري */}
      <button
        className="report-btn"
        style={{
          marginTop: "20px",
          backgroundColor: "#4caf50",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/incoming-monthly-report")}
      >
        📊 عرض التقرير الشهري
      </button>
    </div>
  );
};

export default IncomingGoods;