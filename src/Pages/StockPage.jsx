// src/pages/StockPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
} from "firebase/firestore";

const predefinedItems = [
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

const unitsList = [
  "عدد", "شكاره", "جردل", "كيلو", "كيس",
  "برنيكه", "جرام", "برميل", "كرتونة"
];

export default function StockPage() {
  const nav = useNavigate();

  const [stock, setStock] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQty] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // 🗓️ تاريخ اليوم

  /* === جلب البيانات لحظيًا === */
  useEffect(() => {
    const q = query(collection(db, "storeItems"), orderBy("date", "asc"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, snap => {
      setStock(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* === إضافة / دمج مخزون اليوم === */
  const handleAdd = async () => {
    const clean = name.trim();
    const qtyNum = parseInt(quantity);
    if (!clean || !qtyNum) return alert("أدخل الاسم والكمية");

    const qPrev = query(collection(db, "storeItems"), where("name", "==", clean), where("unit", "==", unit));
    const prevSnap = await getDocs(qPrev);
    const prevTotal = prevSnap.docs.reduce((s, d) => s + (d.data().currentQty ?? d.data().quantity ?? 0), 0);

    const currentTotal = prevTotal + qtyNum;

    const qToday = query(
      collection(db, "storeItems"),
      where("name", "==", clean),
      where("unit", "==", unit),
      where("date", "==", date)
    );
    const todaySnap = await getDocs(qToday);

    if (!todaySnap.empty) {
      const docRef = todaySnap.docs[0].ref;
      await updateDoc(docRef, {
        quantity: (todaySnap.docs[0].data().quantity || 0) + qtyNum,
        prevQty: prevTotal,
        currentQty: currentTotal,
      });
    } else {
      await addDoc(collection(db, "storeItems"), {
        name: clean,
        quantity: qtyNum,
        unit,
        prevQty: prevTotal,
        currentQty: currentTotal,
        date,
        createdAt: serverTimestamp(),
        source: "main-stock"
      });
    }

    setName(""); setQty(""); setUnit("عدد"); setSearch("");
  };

  /* === حذف سجل مفرد === */
  const handleDelete = async (id) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    await deleteDoc(doc(db, "storeItems", id));
  };

  /* === فلترة حسب التاريخ والبحث === */
  const show = stock.filter(it =>
    (it.name.includes(search) || it.date.includes(search)) &&
    it.date === date
  );

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => nav(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📦 البضاعة (المخزون الرئيسي)</h2>

      <div className="form-row">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ padding: "5px", fontSize: "16px", borderRadius: "8px" }}
        />

        <select value={name} onChange={e => setName(e.target.value)}>
          <option value="">اختر من القائمة</option>
          {predefinedItems.map(n => <option key={n}>{n}</option>)}
        </select>

        <input placeholder="أو اكتب صنف جديد" value={name} onChange={e => setName(e.target.value)} />
        <input type="number" placeholder="الكمية" value={quantity} onChange={e => setQty(e.target.value)} />
        <select value={unit} onChange={e => setUnit(e.target.value)}>
          {unitsList.map(u => <option key={u}>{u}</option>)}
        </select>
        <button onClick={handleAdd}>➕ إضافة للمخزن</button>
      </div>

      <div className="form-row">
        <input className="search" placeholder="🔍 ابحث بالاسم أو التاريخ" value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => window.print()}>🖨️ طباعة</button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>📅 التاريخ</th><th>الصنف</th><th>الكمية</th><th>الوحدة</th>
            <th>السابق</th><th>الحالي</th><th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {show.length ? show.map(it => (
            <tr key={it.id}>
              <td>{it.date}</td><td>{it.name}</td><td>{it.quantity}</td><td>{it.unit}</td>
              <td>{it.prevQty ?? "-"}</td><td>{it.currentQty ?? "-"}</td>
              <td><button onClick={() => handleDelete(it.id)}>🗑️</button></td>
            </tr>
          )) : <tr><td colSpan="7">لا توجد بيانات لليوم المختار.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
