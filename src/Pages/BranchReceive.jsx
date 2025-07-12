// src/pages/BranchReceive.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection, addDoc, onSnapshot, serverTimestamp, setDoc, doc,
  query, orderBy            // ⭐️ أضفنا query و orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

/* خريطة الفروع */
const BRANCH_NAMES = { barka: "بركة السبع", qwesna: "قويسنا" };

/* قائمة أصناف أساسية (كما هي، بدون تغيير) */
const BASE_PRODUCTS = [
  "كنافه كريمة","لينزا","مدلعة","صاج عزيزيه","بسبوسة ساده","بسبوسة بندق",
  "جلاش كريمة","بسبوسة قشطة","بسبوسة لوتس","كنافة قشطة","جلاش","بقلاوة",
  "جلاش حجاب","سوارية ساده","سوارية مكسرات","بصمة سادة","بصمة مكسرات","بسيمة",
  "حبيبة","رموش","اسكندراني","كنافة عش","بصمة كاجو","بلح ساده","صوابع زينب",
  "عش نوتيلا","عش فاكهة","صاج رواني","جلاش تركي","كنافة فادج","كنافة بستاشيو",
  "بلح كريمة","كورنيه","دسباسيتو","بروفترول","ميني مربعه","تورته ميني",
  "تشيز كيك","موس مشكلة","فادج","فلوتس","مربعه فور سيزون","ط26 فور سيزون",
  "ط24 فور سيزون","تفاحة نص ونص","تفاحة R/F","مربعه نص ونص","مربعه R/F",
  "ط 26 نص ونص","ط 26 رومانتك","ط 26 فاكيوم","ط 24 بلاك","ط 20 نص ونص","ط 20 بلاك",
  "قلب صفير","فيستفال","قشطوطة","جاتوه سواريه","20*30","موس ابيض","موس كرامل",
  "موس توت","موس لوتس","موس فراولة","موس شوكولاتة","موس مانجا","موس كيوي",
  "أكواب فاكهة","أكواب شوكولاتة","مهلبية","كاس موس","كاسات فاكهة","كوبيات جيلاتين",
  "جاتوه كبير","جاتوه صغير","التشكلات","كاب توت","موس قديم","بولا","فاني كيك",
  "طبقات 22","30*30","35*35","مانجا مستطيل","موس فرنسوي","كارت كيك","فاكهة جديد",
  "فلوش جديد","بيستاشيو مستطيل","كب بيستاشيو","تورتة مانجا","أدخل صنف جديد"
];

const BranchReceive = () => {
  const navigate = useNavigate();
  const { branchId } = useParams();                       // barka أو qwesna
  const branchName   = BRANCH_NAMES[branchId] || "فرع غير معروف";

  /* collections */
  const receiveCol = collection(db, `${branchId}_receive`);
  const itemsCol   = collection(db, "items");

  /* state */
  const [productList, setProductList] = useState(BASE_PRODUCTS);
  const [item, setItem]       = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit]       = useState("عدد");
  const [note, setNote]       = useState("");
  const [records, setRecords] = useState([]);

  /* تحميل الأصناف من كولكشن items */
  useEffect(() => {
    const unsub = onSnapshot(itemsCol, (snap) => {
      const extra = snap.docs.map((d) => d.id);
      setProductList(
        [...BASE_PRODUCTS, ...extra]
          .filter((v, i, arr) => arr.indexOf(v) === i)   // unique
          .sort()
      );
    });
    return () => unsub();
  }, []);

  /* تحميل السجل لحظيًا — مرتَّب تصاعديًا بالتاريخ */
  useEffect(() => {
    const q = query(receiveCol, orderBy("createdAt", "asc"));   // 🌟 يوم 1 ثم 2 ثم 3…
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* اختيار صنف (مع إضافة جديد) */
  const handleSelect = async (val) => {
    if (val === "__new") {
      const newProd = prompt("اكتب اسم الصنف الجديد:");
      if (newProd) {
        await setDoc(doc(db, "items", newProd), { createdAt: serverTimestamp() });
        setItem(newProd);
      }
    } else {
      setItem(val);
    }
  };

  /* حفظ الاستلام */
  const handleSubmit = async () => {
    if (!item || !quantity) return alert("من فضلك أدخل اسم الصنف والكمية");

    await addDoc(receiveCol, {
      name: item,
      quantity: Number(quantity),
      unit,
      note,
      createdAt: serverTimestamp(),
    });

    setItem(""); setQuantity(""); setUnit("عدد"); setNote("");
    alert("✅ تم تسجيل الاستلام.");
  };

  /* تنسيق الطابع الزمني */
  const fmtDate = (ts) =>
    ts?.seconds
      ? new Date(ts.seconds * 1000).toLocaleString("ar-EG", {
          timeZone: "Africa/Cairo",
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : "-";

  /* ---------------- JSX ---------------- */
  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📥 استلام من المصنع - فرع {branchName}</h2>

      {/* نموذج الإدخال */}
      <div className="form-section">
        <div className="form-row">
          <select value={item} onChange={(e) => handleSelect(e.target.value)} required>
            <option value="">اختر الصنف</option>
            {[...productList, "__new"].map((p) => (
              <option key={p} value={p}>
                {p === "__new" ? "➕ إضافة صنف جديد…" : p}
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
            <option>عدد</option><option>برنيكة</option>
            <option>سيرفيز</option><option>كيلو</option><option>صاج</option>
          </select>

          <input
            type="text"
            placeholder="بيان / ملاحظات"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button onClick={handleSubmit}>💾 تسجيل الاستلام</button>
      </div>

      {/* السجل */}
      <h3 className="page-subtitle">📋 السجل:</h3>
      <table className="styled-table">
        <thead>
          <tr>
            <th>اسم الصنف</th><th>الكمية</th><th>الوحدة</th>
            <th>البيان</th><th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr><td colSpan="5">لا توجد بيانات.</td></tr>
          ) : (
            records.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td><td>{r.quantity}</td><td>{r.unit}</td>
                <td>{r.note || "-"}</td><td>{fmtDate(r.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BranchReceive;
