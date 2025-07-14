import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot,
  getDocs, collectionGroup,
  deleteDoc, doc, setDoc, serverTimestamp
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

const StreetOut = () => {
  const navigate = useNavigate();

  const [itemOptions, setItemOptions] = useState([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  /* Collections */
  const outCol = collection(db, "street-out");
  const itemsCol = collection(db, "items");

  /* تحميل الصادر */
  useEffect(() => {
    const unsub = onSnapshot(outCol, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRecords(data);
      setFiltered(data);
    });
    return () => unsub();
  }, []);

  /* تحميل أسماء الأصناف */
  useEffect(() => {
    onSnapshot(itemsCol, (snap) => {
      const extra = snap.docs.map((d) => d.id);
      setItemOptions([...BASE_ITEMS, ...extra].filter((v, i, a) => a.indexOf(v) === i));
    });
  }, []);

  const ensureNewItem = async (name) =>
    setDoc(doc(itemsCol, name), { createdAt: serverTimestamp() }, { merge: true });

  const calcCurrentTotal = async (nameKey) => {
    let add = 0, out = 0;
    const all = await getDocs(collectionGroup(db, "items"));
    all.docs.forEach((snap) => {
      const d = snap.data();
      const k = d.nameKey || normalize(d.name);
      if (k !== nameKey) return;
      const q = parseFloat(d.quantity) || 0;
      if (isAddition(snap.ref.path)) add += q; else if (isDeduction(snap.ref.path)) out += q;
    });
    return add - out;
  };

  const handleSubmit = async () => {
    const name = item.trim();
    const qty = Number(quantity);
    if (!name || !qty) return alert("أدخل الاسم والكمية");

    if (!itemOptions.includes(name)) await ensureNewItem(name);

    const key = normalize(name);
    const prev = await calcCurrentTotal(key);
    const current = prev - qty;
    if (qty > prev) return alert(`❌ الكمية غير كافية (المتاح ${prev})`);

    await addDoc(outCol, {
      name,
      nameKey: key,
      quantity: qty,
      prevQty: prev,
      currentQty: current,
      note,
      date: selectedDate,
      createdAt: serverTimestamp(),
    });

    setItem(""); setQuantity(""); setNote("");
  };

  const handleDelete = async (id) => {
    const pwd = prompt("كلمة المرور للحذف؟");
    if (pwd !== "2991034") return alert("كلمة المرور غير صحيحة");
    if (!window.confirm("تأكيد الحذف؟")) return;
    await deleteDoc(doc(outCol, id));
  };

  /* ===== البحث في السجل ===== */
  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) { setFiltered(records); return; }
    const data = records.filter((r) => normalize(r.name).includes(term) || r.date === term);
    setFiltered(data);
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من المخزن</h2>

      {/* اختيار التاريخ */}
      <div className="form-row">
        <label>📅 التاريخ:</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      {/* نموذج الإدخال */}
      <div className="form-row">
        <input
          list="items-list"
          placeholder="اسم الصنف"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <datalist id="items-list">
          {itemOptions.map((opt) => <option key={opt} value={opt} />)}
        </datalist>

        <input type="number" placeholder="الكمية" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <input type="text" placeholder="ملاحظات" value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={handleSubmit}>➕ تسجيل</button>
      </div>

      {/* شريط البحث في السجل */}
      <div className="form-row">
        <input type="text" placeholder="ابحث بالاسم أو التاريخ" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <button onClick={handleSearch}>🔍 بحث</button>
      </div>

      {/* جدول الصادر */}
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>الصنف</th><th>الكمية</th><th>السابق</th><th>الحالي</th>
              <th>الملاحظات</th><th>التاريخ</th><th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.quantity}</td>
                <td>{r.prevQty ?? "-"}</td>
                <td>{r.currentQty ?? "-"}</td>
                <td>{r.note || "-"}</td>
                <td>{r.date}</td>
                <td><button className="delete-btn" onClick={() => handleDelete(r.id)}>حذف</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StreetOut;
