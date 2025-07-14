// src/pages/StreetStore.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot,
  deleteDoc, updateDoc, doc, serverTimestamp, setDoc,
  query, orderBy, getDocs, collectionGroup
} from "firebase/firestore";
import "../GlobalStyles.css";

const normalize = (s = "") => String(s).trim().replace(/\s+/g, " ").toLowerCase();
const isAddition = (path) => path.includes("street-store");
const isDeduction = (path) => path.includes("street-out");

const BASE_ITEMS = [
 "شكارة كريمه", "بسبوسة", "كيس بندق ني بسبوسة", "هريسة", "بسيمة",
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
  "كرتونة بكين بودر", "ستان 2سم", "جيلي شفاف", "جيلي سخن"
];

const StreetStore = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [quantity, setQty] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [editId, setEditId] = useState(null);
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [totalQty, setTotalQty] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const itemsCol = collection(db, "items");

  /* تحميل أسماء الأصناف */
  useEffect(() => {
    const unsub = onSnapshot(itemsCol, (snap) => {
      const extra = snap.docs.map((d) => d.id);
      setOptions([...BASE_ITEMS, ...extra].filter((v, i, a) => a.indexOf(v) === i));
    });
    return () => unsub();
  }, []);

  /* تحميل بيانات اليوم */
  useEffect(() => {
    const dayDoc = doc(db, "street-store", selectedDate);
    const subCol = collection(dayDoc, "items");
    const q = query(subCol, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data(), date: selectedDate }));
      setItems(data);
      setFiltered(data);
    });
    return () => unsub();
  }, [selectedDate]);

  /* حساب الكمية السابقة قبل الحفظ */
  const calcPrevTotal = async (nameKey) => {
    let add = 0;
    let out = 0;
    const all = await getDocs(collectionGroup(db, "items"));
    all.docs.forEach((snap) => {
      const data = snap.data();
      if (!data.nameKey && data.name) data.nameKey = normalize(data.name);
      if (data.nameKey !== nameKey) return;

      const parentDate = snap.ref.parent.parent.id; // YYYY-MM-DD
      if (parentDate >= selectedDate) return; // نحتاج ما قبل اليوم الحالي فقط

      const qty = parseFloat(data.quantity) || 0;
      if (isAddition(snap.ref.path)) add += qty;
      else if (isDeduction(snap.ref.path)) out += qty;
    });
    return add - out; // صافي السابق
  };

  const handleSave = async () => {
    const finalName = name.trim();
    if (!finalName) return alert("أدخل اسم الصنف");
    if (!quantity) return alert("أدخل الكمية");

    if (!options.includes(finalName)) {
      await setDoc(doc(itemsCol, finalName), { createdAt: serverTimestamp() });
    }

    const nameKey = normalize(finalName);
    const qtyNum = parseFloat(quantity);

    const prevTotal = await calcPrevTotal(nameKey);
    const currentTotal = prevTotal + qtyNum;

    const payload = {
      name: finalName,
      nameKey,
      quantity: qtyNum,
      unit,
      prevQty: prevTotal,
      currentQty: currentTotal,
      createdAt: serverTimestamp(),
      isEdited: !!editId,
    };

    const dayDoc = doc(db, "street-store", selectedDate);
    const subCol = collection(dayDoc, "items");

    if (editId) {
      const pwd = prompt("كلمة مرور التعديل؟");
      if (pwd !== "2991034") return alert("كلمة المرور غير صحيحة");
      await updateDoc(doc(subCol, editId), payload);
      setEditId(null);
    } else {
      await addDoc(subCol, payload);
    }

    setName(""); setQty(""); setUnit("عدد");
  };

  const handleDelete = async (id) => {
    const pwd = prompt("كلمة المرور؟");
    if (pwd !== "2991034") return;
    if (!window.confirm("تأكيد الحذف؟")) return;

    const dayDoc = doc(db, "street-store", selectedDate);
    const subCol = collection(dayDoc, "items");
    await deleteDoc(doc(subCol, id));
  };

  const handleEdit = (it) => {
    setName(it.name);
    setQty(it.quantity);
    setUnit(it.unit);
    setEditId(it.id);
  };

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) { setFiltered(items); setTotalQty(null); return; }

    const data = items.filter((it) => normalize(it.name).includes(term));
    setFiltered(data);

    const total = data.reduce((sum, it) => sum + parseFloat(it.quantity || 0), 0);
    setTotalQty(total);
  };

  return (
    <div className="page-container" dir="rtl">
      <div className="top-bar">
        <button className="back-button" onClick={() => navigate(-1)}>⬅ رجوع</button>
        <button onClick={() => window.print()}>🖨️ طباعة</button>
      </div>

      <h2 className="page-title">🏪 مخزن الشارع</h2>

      {/* اختيار التاريخ */}
      <div className="form-row">
        <label>📅 اختر التاريخ:</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      {/* البحث */}
      <div className="form-row">
        <input type="text" placeholder="ابحث باسم الصنف" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <button onClick={handleSearch}>🔍 بحث</button>
        {totalQty !== null && (
          <span style={{ marginRight: "1rem", color: "#007700", fontWeight: "bold" }}>
            🧮 إجمالي الكمية: {totalQty}
          </span>
        )}
      </div>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <input list="items-list" placeholder="اسم الصنف" value={name} onChange={(e) => setName(e.target.value)} />
        <datalist id="items-list">
          {options.map((opt) => <option key={opt} value={opt} />)}
        </datalist>

        <input type="number" placeholder="الكمية" value={quantity} onChange={(e) => setQty(e.target.value)} />

        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option>عدد</option><option>كيلو</option><option>شكارة</option>
          <option>جرام</option><option>برميل</option><option>كيس</option>
          <option>جردل</option>
        </select>

        <button onClick={handleSave}>{editId ? "تحديث" : "إضافة"}</button>
      </div>

      {/* جدول البيانات */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الكمية</th>
            <th>السابق</th>
            <th>الحالي</th>
            <th>الوحدة</th>
            <th>تعديل</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((it) => (
            <tr key={it.id} style={{ backgroundColor: it.isEdited ? "#ffcccc" : "transparent" }}>
              <td>{it.name}</td>
              <td>{it.quantity}</td>
              <td>{it.prevQty ?? "-"}</td>
              <td>{it.currentQty ?? "-"}</td>
              <td>{it.unit}</td>
              <td><button onClick={() => handleEdit(it)}>تعديل</button></td>
              <td><button onClick={() => handleDelete(it.id)}>حذف</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StreetStore;
