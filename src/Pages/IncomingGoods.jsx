// src/pages/IncomingGoods.jsx
import React, { useState, useEffect } from "react";
import {
  collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc,
  serverTimestamp, query, orderBy            // ⭐️ أضفنا query و orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const IncomingGoods = () => {
  const [items, setItems]           = useState([]);
  const [name, setName]             = useState("");
  const [quantity, setQuantity]     = useState("");
  const [unit, setUnit]             = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate                    = useNavigate();

  const itemOptions = [
    "شكارة كريمه","بسبوسة","كيس بندق ني بسبوسة","هريسة","بسيمة","حبيبه","رموش",
    "لينزا","جلاش","نشابه","صوابع","بلح","علب كريمة","قشطوطة","فادج",
    "كيس كاكو1.750جرام","كيس جرانه","عزيزية","بسبوسة تركي","شكارة سوداني مكسر",
    "ك بندق ني مكسر","كيس سوداني روشيه","كيس بندق محمص250جرام","كيس أكلير",
    "كرتونة بندق سليم","ك سكر بودره","ك جوز هند ناعم","ك سميد","جيلاتينة","ك لبن بودره",
    "كيس لبن بودره 150 جرام","شيكولاته اسمر","شيكولاته بيضاء","كرتونة زيت","جركن زيت",
    "لباني","باستري","فانليا","فاكيوم 7سم","لون احمر","علب طلبية","كرتونة خميرة فورية",
    "سمنة فرن","نشا","سكر","دقيق اهرام","وجبة بتي فور","جوز هند محمص","لوز محمص مجروش",
    "جوز هند ابيض","وجبة بسكوت","رابطة حلويات","علب بتي فور نص","علب بسكوت نص",
    "علب غريبة نص","علب كعك ساده نص","علب كعك ملبن نص","لعب جاتوه","دفتر ترنسفير الوان",
    "ملبن","وجبه سيرب","بكر استرتش","ورق سلوفان موس","علب جاتوه دسته","دفتر ترانسفير ساده",
    "كرتونة بكين بودر","ستان 2سم","جيلي شفاف","جيلي سخن","بيض","مانجا فليت","فرولة فليت",
    "كيوي فليت","مربي مشمش","لباني","جبنه تشيز كيك","رومانتك ابيض","رومانتك اسمر",
    "بشر اسمر","بشر ابيض","لوتس","نوتيلا","جناش جديد","جناش","أدخل صنف جديد"
  ];

  /* ---------- تحميل البيانات بترتيب تصاعدي ---------- */
  useEffect(() => {
    const q = query(collection(db, "incoming-goods"), orderBy("createdAt", "asc")); // يوم 1 ثم 2...
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* ---------- إضافة صنف ---------- */
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

  /* ---------- حذف ---------- */
  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (!["1234","2991034"].includes(pwd)) return alert("كلمة المرور خاطئة.");
    await deleteDoc(doc(db, "incoming-goods", id));
  };

  /* ---------- تعديل ---------- */
  const handleEdit = async (it) => {
    const pwd = prompt("ادخل كلمة المرور لتعديل الصنف:");
    if (!["1234","2991034"].includes(pwd)) return alert("كلمة المرور خاطئة.");

    const newName = prompt("اسم الصنف الجديد:", it.name);
    const newQty  = prompt("الكمية الجديدة:", it.quantity);
    const newUnit = prompt("الوحدة الجديدة:", it.unit);
    if (!newName || !newQty || !newUnit) return;

    await updateDoc(doc(db, "incoming-goods", it.id), {
      name: newName,
      quantity: Number(newQty),
      unit: newUnit,
      updated: true,
    });
  };

  /* ---------- فلترة بحث ---------- */
  const filtered = items.filter(
    (it) =>
      it.name.includes(searchTerm.trim()) ||
      (it.createdAt &&
        new Date(it.createdAt.seconds * 1000)
          .toLocaleDateString("fr-CA")
          .includes(searchTerm.trim()))
  );

  /* ---------------- JSX ---------------- */
  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📥 البضاعة الواردة للمصنع</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <input
          type="number" placeholder="الكمية" value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

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
        style={{ padding:"10px", borderRadius:"6px", border:"none",
                 marginBottom:"15px", fontSize:"16px", width:"300px", textAlign:"center" }}
      />

      {/* الجدول */}
      <table className="styled-table">
        <thead>
          <tr><th>التاريخ</th><th>الصنف</th><th>الكمية</th><th>الوحدة</th><th>إجراءات</th></tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="5">لا توجد بيانات.</td></tr>
          ) : (
            filtered.map((it) => (
              <tr key={it.id} className={it.updated ? "edited-row" : ""}>
                <td>{it.createdAt ? new Date(it.createdAt.seconds * 1000).toLocaleDateString("fr-CA") : "—"}</td>
                <td>{it.name}</td><td>{it.quantity}</td><td>{it.unit}</td>
                <td>
                  <button className="edit-btn"   onClick={() => handleEdit(it)}>✏️</button>{" "}
                  <button className="delete-btn" onClick={() => handleDelete(it.id)}>🗑️</button>
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
