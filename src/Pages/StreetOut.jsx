// src/pages/StreetOut.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot,
  query, where, getDocs, serverTimestamp,
  deleteDoc, doc, setDoc,
} from "firebase/firestore";
import "../GlobalStyles.css";

const normalize = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();

const BASE_ITEMS = [
  "شكارة كريمه",
  "بسبوسة",
  "كيس بندق ني بسبوسة",
  "هريسة",
  "بسيمة",
  "حبيبه",
  "رموش",
  "لينزا",
  "جلاش",
  "نشابه",
  "صوابع",
  "بلح",
  "علب كريمة",
  "قشطوطة",
  "فادج",
  "كيس كاكو 1.750 جرام",
  "كيس جرانه",
  "عزيزية",
  "بسبوسة تركي",
  "شكارة سوداني مكسر",
  "ك بندق ني مكسر",
  "كيس سوداني روشيه",
  "كيس بندق محمص 250 جرام",
  "كيس أكلير",
  "كرتونة بندق سليم",
  "ك سكر بودره",
  "ك جوز هند ناعم",
  "ك سميد",
  "جيلاتينة",
  "ك لبن بودره",
  "كيس لبن بودره 150 جرام",
  "شيكولاته اسمر",
  "شيكولاته بيضاء",
  "كرتونة زيت",
  "جركن زيت",
  "لباني",
  "باستري",
  "فانليا",
  "فاكيوم 7سم",
  "لون احمر",
  "علب طلبية",
  "كرتونة خميرة فورية",
  "سمنة فرن",
  "نشا",
  "سكر",
  "دقيق اهرام",
  "وجبة بتي فور",
  "جوز هند محمص",
  "لوز محمص مجروش",
  "جوز هند ابيض",
  "وجبة بسكوت",
  "رابطة حلويات",
  "علب بتي فور نص",
  "علب بسكوت نص",
  "علب غريبة نص",
  "علب كعك ساده نص",
  "علب كعك ملبن نص",
  "لعب جاتوه",
  "دفتر ترنسفير الوان",
  "ملبن",
  "وجبه سيرب",
  "بكر استرتش",
  "ورق سلوفان موس",
  "علب جاتوه دسته",
  "دفتر ترانسفير ساده",
  "كرتونة بكين بودر",
  "ستان 2سم",
  "جيلي شفاف",
  "جيلي سخن"
];


const StreetOut = () => {
  const navigate = useNavigate();

  const [itemOptions, setItemOptions] = useState([...BASE_ITEMS, "أدخل صنف جديد"]);
  const [item, setItem]           = useState("");
  const [customItem, setCustomItem] = useState("");
  const [quantity, setQuantity]   = useState("");
  const [note, setNote]           = useState("");
  const [records, setRecords]     = useState([]);

  /* Collections */
  const outCol   = collection(db, "street-out");
  const storeCol = collection(db, "street-store");
  const itemsCol = collection(db, "items");

  /* تحميل الأصناف المُضافة سابقًا */
  useEffect(() => {
    const unsub = onSnapshot(itemsCol, (snap) => {
      const extra = snap.docs.map((d) => d.id);
      setItemOptions([...BASE_ITEMS, ...extra, "أدخل صنف جديد"]
        .filter((v, i, arr) => arr.indexOf(v) === i).sort());
    });
    return () => unsub();
  }, []);

  /* تحميل سجل الصادر */
  useEffect(() => {
    const unsub = onSnapshot(outCol, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRecords(data);
    });
    return () => unsub();
  }, []);

  /* اختيار صنف */
  const handleSelect = async (val) => {
    if (val === "أدخل صنف جديد") return setItem(val);
    setItem(val);
  };

  /* إضافة صنف جديد للقائمة */
  const ensureNewItem = async (name) => {
    await setDoc(doc(db, "items", name), { createdAt: serverTimestamp() });
  };

  /* تسجيل الصادر */
  const handleSubmit = async () => {
    const rawName   = item === "أدخل صنف جديد" ? customItem : item;
    const finalName = rawName.trim();
    const key       = normalize(finalName);

    if (!finalName || !quantity) return alert("أدخل اسم الصنف والكمية");

    /* لو صنف جديد خزّنه في items */
    if (item === "أدخل صنف جديد") await ensureNewItem(finalName);

    /* التحقق من الكمية في المخزن */
    const q = query(storeCol, where("nameKey", "==", key));
    const snap = await getDocs(q);

    if (snap.empty) return alert("❌ الصنف غير موجود في المخزن");

    const stock = snap.docs[0];
    const available = stock.data().quantity;

    if (Number(quantity) > available)
      return alert(`❌ الكمية غير كافية. المتاح: ${available}`);

    /* تسجيل الصادر */
    await addDoc(outCol, {
      name: finalName,
      nameKey: key,
      quantity: Number(quantity),
      note,
      date: new Date().toLocaleString("ar-EG", {
        timeZone: "Africa/Cairo",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      timestamp: serverTimestamp(),
    });

    alert("✅ تم تسجيل الصادر");
    setItem(""); setCustomItem(""); setQuantity(""); setNote("");
  };

  /* حذف سجل */
  const handleDelete = async (id) => {
    const pwd = prompt("أدخل كلمة المرور للحذف:");
    if (!["1234","2991034"].includes(pwd)) return alert("كلمة المرور غير صحيحة");
    if (!window.confirm("متأكد من الحذف؟")) return;
    await deleteDoc(doc(db, "street-out", id));
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من المخزن</h2>

      <div className="form-row">
        <select value={item} onChange={(e) => handleSelect(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        {item === "أدخل صنف جديد" && (
          <input
            placeholder="أدخل اسم الصنف"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
          />
        )}

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="text"
          placeholder="البيان / ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="add-button" onClick={handleSubmit}>➕ تسجيل</button>
      </div>

      <h3 className="table-title">📑 سجل الصادر:</h3>
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>الصنف</th><th>الكمية</th><th>البيان</th><th>التاريخ</th><th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td>{rec.name}</td><td>{rec.quantity}</td><td>{rec.note}</td>
                <td>{rec.date}</td>
                <td><button className="delete-btn" onClick={() => handleDelete(rec.id)}>حذف</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StreetOut;
