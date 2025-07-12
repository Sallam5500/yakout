// src/pages/StreetStore.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  setDoc,
  query,
  orderBy,   // ⭐️ مهم للترتيب
} from "firebase/firestore";
import "../GlobalStyles.css";

/* تطبيع الاسم: إزالة الفراغات الزائدة + أحرف صغيرة */
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
  const navigate                       = useNavigate();
  const [name, setName]                = useState("");
  const [customName, setCustomName]    = useState("");
  const [quantity, setQuantity]        = useState("");
  const [unit, setUnit]                = useState("عدد");
  const [items, setItems]              = useState([]);
  const [editId, setEditId]            = useState(null);
  const [itemOptions, setItemOptions]  = useState([...BASE_ITEMS, "أدخل صنف جديد"]);

  /* Collections */
  const storeCol = collection(db, "street-store");
  const itemsCol = collection(db, "items");  // للاحتفاظ بأصناف مضافة لاحقًا

  /* تحميل الأصناف الديناميكية */
  useEffect(() => {
    const unsub = onSnapshot(itemsCol, (snap) => {
      const extra = snap.docs.map((d) => d.id);
      setItemOptions([...BASE_ITEMS, ...extra, "أدخل صنف جديد"]
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .sort());
    });
    return () => unsub();
  }, []);

  /* تحميل مخزون الشارع بترتيب تصاعدي بالتاريخ */
  useEffect(() => {
    const q = query(storeCol, orderBy("date", "asc"));  // يوم 1 ثم 2 ثم 3...
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(data);
    });
    return () => unsub();
  }, []);

  /* إضافة أو تحديث صنف */
  const handleAddOrUpdate = async () => {
    const rawName   = name === "أدخل صنف جديد" ? customName : name;
    const finalName = rawName.trim();
    const key       = normalize(finalName);

    if (!finalName || !quantity)
      return alert("من فضلك أدخل الاسم والكمية");

    /* حفظ الصنف الجديد في كولكشن items إن لم يكن موجود */
    if (name === "أدخل صنف جديد") {
      await setDoc(doc(db, "items", finalName), { createdAt: serverTimestamp() });
    }

    if (editId) {
      const pwd = prompt("ادخل كلمة السر لتعديل الصنف:");
      if (!["1234", "2991034"].includes(pwd)) return alert("كلمة المرور غير صحيحة");
      await updateDoc(doc(db, "street-store", editId), {
        name: finalName,
        nameKey: key,
        quantity: parseFloat(quantity),
        unit,
        isEdited: true,
      });
      setEditId(null);
    } else {
      await addDoc(storeCol, {
        name: finalName,
        nameKey: key,
        quantity: parseFloat(quantity),
        unit,
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        isEdited: false,
        timestamp: serverTimestamp(),
      });
    }

    // إعادة تعيين الحقول
    setName(""); setCustomName(""); setQuantity(""); setUnit("عدد");
  };

  /* حذف صنف */
  const handleDelete = async (id) => {
    const pwd = prompt("أدخل كلمة المرور للحذف:");
    if (!["1234", "2991034"].includes(pwd)) return alert("كلمة المرور غير صحيحة.");
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    await deleteDoc(doc(db, "street-store", id));
  };

  /* تحميل بيانات صنف للتعديل */
  const handleEdit = (it) => {
    setName(it.name);
    setCustomName("");
    setQuantity(it.quantity);
    setUnit(it.unit);
    setEditId(it.id);
  };

  return (
    <div className="page-container" dir="rtl">
      <button className="back-button" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🏪 المخزن اللي في الشارع</h2>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        {name === "أدخل صنف جديد" && (
          <input
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
          <option>عدد</option><option>كيلو</option><option>شكارة</option>
          <option>جرام</option><option>برميل</option><option>كيس</option><option>جردل</option>
          <option>شكاره</option>
        </select>

        <button className="add-button" onClick={handleAddOrUpdate}>
          {editId ? "تحديث" : "إضافة"}
        </button>
      </div>

      {/* جدول البيانات */}
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
              <td>{it.name}</td>
              <td>{it.quantity}</td>
              <td>{it.unit}</td>
              <td>{it.date}</td>
              <td><button className="edit-btn" onClick={() => handleEdit(it)}>تعديل</button></td>
              <td><button className="delete-btn" onClick={() => handleDelete(it.id)}>حذف</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StreetStore;
