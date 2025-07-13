// src/pages/StreetOut.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot, query, where,
  getDocs, runTransaction, serverTimestamp,
  deleteDoc, doc, setDoc, orderBy,
} from "firebase/firestore";
import "../GlobalStyles.css";

/* تطبيع الاسم */
const normalize = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();

/* القائمة الأساسية (احتياطية) */
const BASE_ITEMS = [
  "شكارة كريمه","بسبوسة","كيس بندق ني بسبوسة","هريسة","بسيمة","حبيبه","رموش",
  "لينزا","جلاش","نشابه","صوابع","بلح","علب كريمة","قشطوطة","فادج",
  "كيس كاكو 1.750 جرام","كيس جرانه","عزيزية","بسبوسة تركي","شكارة سوداني مكسر",
  "ك بندق ني مكسر","كيس سوداني روشيه","كيس بندق محمص 250 جرام","كيس أكلير",
  "كرتونة بندق سليم","ك سكر بودره","ك جوز هند ناعم","ك سميد","جيلاتينة","ك لبن بودره",
  "كيس لبن بودره 150 جرام","شيكولاته اسمر","شيكولاته بيضاء","كرتونة زيت","جركن زيت",
  "لباني","باستري","فانليا","فاكيوم 7سم","لون احمر","علب طلبية",
  "كرتونة خميرة فورية","سمنة فرن","نشا","سكر","دقيق اهرام","وجبة بتي فور",
  "جوز هند محمص","لوز محمص مجروش","جوز هند ابيض","وجبة بسكوت","رابطة حلويات",
  "علب بتي فور نص","علب بسكوت نص","علب غريبة نص","علب كعك ساده نص",
  "علب كعك ملبن نص","لعب جاتوه","دفتر ترنسفير الوان","ملبن","وجبه سيرب",
  "بكر استرتش","ورق سلوفان موس","علب جاتوه دسته","دفتر ترانسفير ساده",
  "كرتونة بكين بودر","ستان 2سم","جيلي شفاف","جيلي سخن"
];

const StreetOut = () => {
  const navigate = useNavigate();

  // قوائم وحالات
  const [itemOptions, setItemOptions] = useState([]);
  const [item, setItem]             = useState("");
  const [customItem, setCustomItem] = useState("");
  const [quantity, setQuantity]     = useState("");
  const [note, setNote]             = useState("");
  const [records, setRecords]       = useState([]);

  /* Collections */
  const outCol   = collection(db, "street-out");
  const storeCol = collection(db, "street-store");
  const itemsCol = collection(db, "items");

  /* تحميل أصناف المخزن ثم دمجها مع الأساسية */
  useEffect(() => {
    // أولًا: أصناف المخزن بترتيب إدخالها (الأقدم أولًا)
    const qStore = query(
      storeCol,
      orderBy("date","asc"), orderBy("createdAt","asc")
    );
    const unsubStore = onSnapshot(qStore, (snap) => {
      const storeNames = [];
      snap.docs.forEach((d) => {
        if (!storeNames.includes(d.data().name)) storeNames.push(d.data().name);
      });

      // ثانيًا: الأصناف المضافة يدويًا (itemsCol)
      onSnapshot(itemsCol, (snapExtra) => {
        const extra = snapExtra.docs.map((d) => d.id);
        // دمج: مخزن ← إضافية ← قائمة أساسية ناقصة ← خيار جديد
        const merged = [
          ...storeNames,
          ...extra.filter((x) => !storeNames.includes(x)),
          ...BASE_ITEMS.filter((b) => !storeNames.includes(b) && !extra.includes(b)),
          "أدخل صنف جديد"
        ];
        setItemOptions(merged);
      });
    });

    return () => unsubStore();
  }, []);

  /* سجل الصادر (ترتيب حسب وقت الإدخال) */
  useEffect(() => {
    const q = query(outCol, orderBy("timestamp", "asc"));
    return onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  /* إضافة اسم جديد لكولكشن items */
  const ensureNewItem = async (name) =>
    setDoc(doc(itemsCol, name), { createdAt: serverTimestamp() }, { merge: true });

  /* تسجيل الصادر مع خصم المخزن */
  const handleSubmit = async () => {
    const raw  = item === "أدخل صنف جديد" ? customItem : item;
    const name = raw.trim();
    const qty  = Number(quantity);
    if (!name || !qty) return alert("أدخل الاسم والكمية");

    if (item === "أدخل صنف جديد") await ensureNewItem(name);

    const key = normalize(name);

    // ابحث عن الصنف في مخزن الشارع
    const qStock = query(storeCol, where("nameKey", "==", key));
    const snap   = await getDocs(qStock);
    if (snap.empty) return alert("❌ الصنف غير موجود في المخزن");

    const stockRef = snap.docs[0].ref;

    try {
      await runTransaction(db, async (trx) => {
        const stockSnap = await trx.get(stockRef);
        const available = stockSnap.data().quantity;
        if (qty > available) throw new Error(`الكمية غير كافية (المتاح ${available})`);

        // خصم الكمية
        trx.update(stockRef, { quantity: available - qty });

        // إضافة سجل الصادر
        trx.set(doc(outCol), {
          name,
          nameKey: key,
          quantity: qty,
          note,
          date: new Date().toLocaleDateString("fr-CA"),
          timestamp: serverTimestamp(),
        });
      });

      alert("✅ تم تسجيل الصادر وخصم الكمية");
      setItem(""); setCustomItem(""); setQuantity(""); setNote("");
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  /* حذف سجل */
  const handleDelete = async (id) => {
    const pwd = prompt("كلمة المرور للحذف؟");
    if (pwd !== "2991034") return alert("كلمة المرور غير صحيحة");
    if (!window.confirm("تأكيد الحذف؟")) return;
    await deleteDoc(doc(outCol, id));
  };

  /* واجهة المستخدم */
  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من المخزن (خصم تلقائي)</h2>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <select value={item} onChange={(e) => setItem(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        {item === "أدخل صنف جديد" && (
          <input
            placeholder="اسم الصنف الجديد"
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
          placeholder="ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button type="button" onClick={handleSubmit}>➕ تسجيل</button>
      </div>

      {/* جدول الصادر */}
      <h3 className="table-title">📑 سجل الصادر</h3>
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>الصنف</th><th>الكمية</th><th>الملاحظات</th>
              <th>التاريخ</th><th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.quantity}</td>
                <td>{r.note || "-"}</td>
                <td>{r.date}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(r.id)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StreetOut;
