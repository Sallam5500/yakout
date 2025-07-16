import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot, deleteDoc, doc,
  serverTimestamp, runTransaction, setDoc
} from "firebase/firestore";
import "../GlobalStyles.css";

/* ===== util ===== */
const normalize = (s = "") => s.trim().replace(/\s+/g, " ").toLowerCase();
const mapUnit = (u) => ({
  عدد: "qty",           // نعتبر «عدد» = زجاجة
  جرام: "g",
  كيس: "bag",
  كيلو: "kg", كيلوجرام: "kg",
  زجاجة: "qty",
  كرتونة: "carton",
  شكاره: "sack",
  وجبة: "meal"
}[u] || u);

const CONV = {
  /* وزن */
  g: { kg: 1 / 1000 },        kg: { g: 1000 },
  /* عبوات */
  carton: { qty: 12 },        qty: { carton: 1 / 12 },
  /* أمثلة أخرى */
  bottle: { carton: 1 / 12 }, carton: { bottle: 12 },
  sack: { kg: 50 },           kg: { sack: 1 / 50 },
  bag: { g: 1000 },           g: { bag: 1 / 1000 }
};
const convert = (q, f, t) => {
  if (f === t) return q;
  const F = mapUnit(f), T = mapUnit(t);
  if (CONV[F]?.[T]) return q * CONV[F][T];
  if (CONV[T]?.[F]) return q / CONV[T][F];
  throw Error(`لا تحويل من ${f} ↔ ${t}`);
};

/* ===== بيانات ثابتة ===== */
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
const UNIT_MAP = ["عدد", "زجاجة", "كرتونة", "جرام", "كيلوجرام", "شكاره", "كيس"];

/* ===== المكوّن ===== */
const StreetOut = () => {
  const nav = useNavigate();
  const [opts, setOpts] = useState([]);
  const [item, setItem] = useState("");
  const [qty,  setQty]  = useState("");
  const [unit, setUnit] = useState("عدد");
  const [note, setNote] = useState("");
  const [recs, setRecs] = useState([]);
  const [flt,  setFlt]  = useState([]);
  const [term, setTerm] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const outCol = collection(db, "street-out");
  const itemsCol = collection(db, "items");
  const stCol = collection(db, "street-store");

  /* تحميل السجلات والقائمة */
  useEffect(() => onSnapshot(outCol, s => {
    const d = s.docs.map(x => ({ id: x.id, ...x.data() }));
    setRecs(d); setFlt(d);
  }), []);
  useEffect(() => onSnapshot(itemsCol, s => {
    const extra = s.docs.map(d => d.id);
    setOpts([...new Set([...BASE_ITEMS, ...extra])]);
  }), []);

  const ensureItem = name =>
    setDoc(doc(itemsCol, name), { createdAt: serverTimestamp() }, { merge: true });

  /* ===== تسجيل الصادر ===== */
  const handleSubmit = async () => {
    const n = item.trim(), q = +qty;
    if (!n || !q) return alert("أدخل الاسم والكمية");
    if (!opts.includes(n)) await ensureItem(n);

    const key   = normalize(n);
    const stRef = doc(stCol, key);
    const dayDoc = doc(db, "street-store", date);

    try {
      let prevQtyRow = 0, curQtyRow = 0, storeUnit = unit;

      await runTransaction(db, async t => {
        const snap = await t.get(stRef);
        if (!snap.exists())
          throw Error("❌ الصنف غير موجود في رصيد المخزن");

        const bal = snap.data();
        storeUnit = bal.unit;
        const need = convert(q, unit, storeUnit);
        if (need > bal.quantity)
          throw Error(`❌ الكمية غير كافية (المتاح ${bal.quantity} ${storeUnit})`);

        prevQtyRow = convert(bal.quantity, storeUnit, unit);
        curQtyRow  = convert(bal.quantity - need, storeUnit, unit);

        t.update(stRef, { quantity: bal.quantity - need });
      });

      /* street-out */
      await addDoc(outCol, {
        name: n, nameKey: key, quantity: q, unit,
        note, date, createdAt: serverTimestamp()
      });

      /* صف سالـب فى يوم الشارع */
      await addDoc(collection(dayDoc, "items"), {
        name: n, nameKey: key, quantity: -q, unit,
        prevQty: prevQtyRow, currentQty: curQtyRow,
        type: "out", createdAt: serverTimestamp()
      });

      setItem(""); setQty(""); setNote("");
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    if (!window.confirm("تأكيد الحذف؟")) return;
    await deleteDoc(doc(outCol, id));
  };

  const doSearch = () => {
    const t = term.trim().toLowerCase();
    setFlt(!t ? recs : recs.filter(r => normalize(r.name).includes(t) || r.date === t));
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => nav(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من المخزن</h2>

      <div className="form-row">
        <label>📅 التاريخ:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className="form-row">
        <input list="items" placeholder="اسم الصنف" value={item} onChange={e => setItem(e.target.value)} />
        <datalist id="items">{opts.map(o => <option key={o} value={o} />)}</datalist>

        <input type="number" placeholder="الكمية" value={qty} onChange={e => setQty(e.target.value)} />
        <select value={unit} onChange={e => setUnit(e.target.value)}>{UNIT_MAP.map(u => <option key={u}>{u}</option>)}</select>
        <input type="text" placeholder="ملاحظات" value={note} onChange={e => setNote(e.target.value)} />
        <button onClick={handleSubmit}>➕ تسجيل</button>
      </div>

      <div className="form-row">
        <input placeholder="بحث" value={term} onChange={e => setTerm(e.target.value)} />
        <button onClick={doSearch}>🔍 بحث</button>
      </div>

      <div className="table-container">
        <table className="styled-table">
          <thead><tr><th>الصنف</th><th>الكمية</th><th>الوحدة</th><th>الملاحظات</th><th>التاريخ</th><th>حذف</th></tr></thead>
          <tbody>{flt.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td><td>{r.quantity}</td><td>{r.unit}</td>
              <td>{r.note || "-"}</td><td>{r.date}</td>
              <td><button onClick={() => handleDelete(r.id)}>🗑️</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

export default StreetOut;
