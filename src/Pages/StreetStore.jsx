// src/pages/StreetStore.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot,
  deleteDoc, updateDoc, doc, serverTimestamp,
  setDoc, query, orderBy,
} from "firebase/firestore";
import "../GlobalStyles.css";

/* تطبيع الاسم */
const normalize = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();

/* الأصناف الأساسية */
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
  const navigate                 = useNavigate();

  // مدخلات
  const [name, setName]          = useState("");
  const [newName, setNewName]    = useState("");
  const [quantity, setQty]       = useState("");
  const [unit, setUnit]          = useState("عدد");

  // بيانات
  const [items, setItems]        = useState([]);
  const [options, setOptions]    = useState([]);
  const [editId, setEditId]      = useState(null);

  /* كولكشنات */
  const streetCol = collection(db, "street-store");
  const itemsCol  = collection(db, "items");    // يحتفظ بأسماء أصناف الشارع

  /* تحميل أصناف الشارع + الأساسية */
  useEffect(() => {
    const unsub = onSnapshot(itemsCol, (snap) => {
      const extra = snap.docs.map((d) => d.id);
      // «➕ أضف صنف جديد…» دائمًا أول عنصر
      setOptions(["_NEW_", ...BASE_ITEMS, ...extra].filter(
        (v,i,a) => a.indexOf(v) === i
      ));
    });
    return () => unsub();
  }, []);

  /* تحميل بيانات المخزن بترتيب ثنائي */
  useEffect(() => {
    const q = query(
      streetCol,
      orderBy("date", "asc"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  /* إضافة / تحديث */
  const handleSave = async () => {
    const finalName = name === "_NEW_" ? newName.trim() : name;
    if (!finalName) return alert("أدخل اسم الصنف");
    if (!quantity)  return alert("أدخل الكمية");

    // إحفظ الصنف الجديد في itemsCol
    if (name === "_NEW_") {
      await setDoc(doc(itemsCol, finalName), { createdAt: serverTimestamp() });
    }

    const payload = {
      name: finalName,
      nameKey: normalize(finalName),
      quantity: parseFloat(quantity),
      unit,
    };

    if (editId) {
      const pwd = prompt("كلمة مرور التعديل؟");
      if (pwd !== "2991034") return alert("كلمة المرور غير صحيحة");
      await updateDoc(doc(streetCol, editId), { ...payload, isEdited: true });
      setEditId(null);
    } else {
      await addDoc(streetCol, {
        ...payload,
        date: new Date().toLocaleDateString("fr-CA"),
        createdAt: serverTimestamp(),
        isEdited: false,
      });
    }

    // إعادة الضبط
    setName(""); setNewName(""); setQty(""); setUnit("عدد");
  };

  /* حذف */
  const handleDelete = async (id) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    if (!window.confirm("تأكيد الحذف؟")) return;
    await deleteDoc(doc(streetCol, id));
  };

  /* تحميل للتعديل */
  const handleEdit = (it) => {
    setName(it.name); setNewName("");
    setQty(it.quantity); setUnit(it.unit); setEditId(it.id);
  };

  /* واجهة المستخدم */
  return (
    <div className="page-container" dir="rtl">
      <button className="back-button" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🏪 مخزن الشارع</h2>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">اختر الصنف</option>
          <option value="_NEW_">➕ أضف صنف جديد…</option>
          {options.filter(o => o !== "_NEW_").map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>

        {name === "_NEW_" && (
          <input
            placeholder="اسم الصنف الجديد"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        )}

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQty(e.target.value)}
        />

        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option>عدد</option><option>كيلو</option><option>شكارة</option>
          <option>جرام</option><option>برميل</option><option>كيس</option>
          <option>جردل</option>
        </select>

        <button type="button" onClick={handleSave}>
          {editId ? "تحديث" : "إضافة"}
        </button>
      </div>

      {/* جدول */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>الاسم</th><th>الكمية</th><th>الوحدة</th>
            <th>التاريخ</th><th>تعديل</th><th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} style={{ backgroundColor: it.isEdited ? "#ffcccc" : "transparent" }}>
              <td>{it.name}</td><td>{it.quantity}</td><td>{it.unit}</td>
              <td>{it.date}</td>
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
