import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc,
  serverTimestamp, setDoc, query, orderBy, getDocs, collectionGroup,
  where, runTransaction
} from "firebase/firestore";
import "../GlobalStyles.css";

/* ===== util ===== */
const normalize = (s = "") => s.trim().replace(/\s+/g, " ").toLowerCase();

/* توحيد أسماء الوحدات */
const mapUnit = (u) => ({
  عدد: "qty", زجاجة: "qty",                 // «عدد» = زجاجة مفردة
  جرام: "g",
  كيلو: "kg", كيلوجرام: "kg",
  كرتونة: "carton",
  شكاره: "sack",
  كيس: "bag",
  وجبة: "meal",
  "قالب شكولاته": "block"
}[u] || u);

/* جدول التحويلات */
const CONV = {
  /* وزن */
  g: { kg: 1 / 1000 },
  kg: { g: 1000 },

  /* عبوات الزيت: 1 كرتونة = 12 زجاجة */
  carton: { qty: 12 },
  qty: { carton: 1 / 12 },

  /* أمثلة إضافية (إن وجدت) */
  sack: { kg: 50 },         // 1 شكارة = 50 كجم
  bag: { g: 1000 },         // 1 كيس = 1 كجم
  block: { g: 250 }         // 1 قالب شوكولاتة = 250 جم
};

/* تحويل كمية من وحدة لأخرى */
const convert = (q, f, t) => {
  if (f === t) return q;
  const F = mapUnit(f);
  const T = mapUnit(t);
  if (CONV[F]?.[T]) return q * CONV[F][T];
  if (CONV[T]?.[F]) return q / CONV[T][F];
  throw Error(`لا تحويل من ${f} ↔ ${t}`);
};

/* ===== قوائم ثابتة ===== */
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
const UNIT_MAP = [
  "عدد", "زجاجة", "كرتونة",
  "جرام", "كيلوجرام",
  "شكاره", "كيس", "وجبة"
];

/* ===== المكوّن ===== */
const StreetStore = () => {
  const nav = useNavigate();

  /* حالات الإدخال والواجهة */
  const [name, setName]   = useState("");
  const [qty,  setQty]    = useState("");
  const [unit, setUnit]   = useState("عدد");
  const [isNew, setIsNew] = useState(false);

  const [editId,  setEditId]  = useState(null);
  const [editOld, setEditOld] = useState(null);

  const [items, setItems] = useState([]);
  const [opts,  setOpts]  = useState([]);
  const [search, setSearch] = useState("");
  const [flt, setFlt] = useState([]);
  const [tot, setTot] = useState(null);

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const itemsCol = collection(db, "items");

  /* تحميل قائمة الأصناف */
  useEffect(() =>
    onSnapshot(itemsCol, snap => {
      const extra = snap.docs.map(d => d.id);
      setOpts([...new Set([...BASE_ITEMS, ...extra])]);
    }),
    []
  );

  /* تحميل بيانات يوم محدد */
  useEffect(() => {
    const dayDoc = doc(db, "street-store", date);
    const q = query(collection(dayDoc, "items"), orderBy("createdAt", "asc"));
    return onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data);
      setFlt(data);
    });
  }, [date]);

  /* ========== دوال الحساب والإرسال ========== */

  /* رصيد سابق (حتى اليوم) */
  const calcPrev = async (key, tgtUnit) => {
    let total = 0;
    const snaps = await getDocs(
      query(collectionGroup(db, "items"), where("nameKey", "==", key))
    );
    snaps.forEach(s => {
      const parentDate = s.ref.parent.parent.id;
      if (parentDate > date) return;              // بعد اليوم لا يحسب
      const d = s.data();
      total += convert(+d.quantity || 0, d.unit, tgtUnit);
    });
    return total;
  };

  /* تحديث مستند الرصيد الجذري */
  const updateBalance = async (key, deltaQ, deltaU) => {
    const ref = doc(db, "street-store", key);
    await runTransaction(db, async t => {
      const snap = await t.get(ref);              // قراءة وحيدة
      if (!snap.exists()) {
        t.set(ref, { quantity: deltaQ, unit: deltaU });
        return;
      }
      const bal   = snap.data();
      const delta = convert(deltaQ, deltaU, bal.unit);
      t.update(ref, { quantity: bal.quantity + delta });
    });
  };

  /* إضافة صنف جديد لقائمة items */
  const addItem = async () => {
    const n = name.trim();
    if (!n) return;
    await setDoc(doc(itemsCol, n), { createdAt: serverTimestamp() });
    alert(`✅ تم إضافة «${n}» للقائمة`);
    setIsNew(false);
  };

  /* حفظ أو تعديل حركة اليوم */
  const handleSave = async () => {
    const n = name.trim();
    const q = +qty;
    if (!n)  return alert("أدخل الاسم");
    if (!q)  return alert("أدخل الكمية");

    /* إضافة الصنف للقائمة إذا كان جديدًا */
    if (!opts.includes(n))
      await setDoc(doc(itemsCol, n), { createdAt: serverTimestamp() });

    const key  = normalize(n);
    const prev = await calcPrev(key, unit);
    const curr = prev + q;

    const payload = {
      name: n, nameKey: key, quantity: q, unit,
      prevQty: prev, currentQty: curr,
      createdAt: serverTimestamp(), isEdited: !!editId
    };

    const dayDoc = doc(db, "street-store", date);
    const subCol = collection(dayDoc, "items");
    const root   = doc(db, "street-store", key);

    if (editId) {
      if (prompt("كلمة مرور التعديل؟") !== "2991034") return;
      const delta = q - editOld.q;
      await updateBalance(key, delta, unit);
      await updateDoc(doc(subCol, editId), payload);
      setEditId(null); setEditOld(null);
    } else {
      await updateBalance(key, q, unit);
      await addDoc(subCol, payload);
      await setDoc(root, { quantity: curr, unit }, { merge: true });
    }

    setName(""); setQty(""); setUnit("عدد");
  };

  /* حذف حركة */
  const handleDelete = async it => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    if (!window.confirm("تأكيد الحذف؟")) return;
    const day = doc(db, "street-store", date);
    await deleteDoc(doc(collection(day, "items"), it.id));
    await updateBalance(it.nameKey, -it.quantity, it.unit);
  };

  /* تحرير حركة */
  const handleEdit = it => {
    setName(it.name); setQty(it.quantity); setUnit(it.unit);
    setEditId(it.id); setEditOld({ q: +it.quantity, unit: it.unit });
    setIsNew(false);
  };

  /* البحث */
  const doSearch = () => {
    const t = search.trim().toLowerCase();
    if (!t) {
      setFlt(items); setTot(null); return;
    }
    const list = items.filter(i => normalize(i.name).includes(t));
    setFlt(list);
    setTot(list.reduce((s, i) => s + (+i.quantity || 0), 0));
  };

  /* onChange للاسم */
  const onName = e => {
    const v = e.target.value;
    setName(v);
    setIsNew(v.trim() && !opts.includes(v.trim()));
  };

  /* ========== واجهة المستخدم ========== */
  return (
    <div className="page-container" dir="rtl">
      <div className="top-bar  text-center">
        <button className="back-button" onClick={() => nav(-1)}>⬅ رجوع</button>
        <button onClick={() => window.print()}>🖨️ طباعة</button>
      </div>

      <h2 className="page-title text-center">🏪 مخزن الشارع</h2>

      <div className="form-row">
        <label>📅 التاريخ:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className="form-row">
        <input type="text" placeholder="بحث" value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={doSearch}>🔍 بحث</button>
        {tot !== null && (
          <span style={{ marginRight: "1rem", fontWeight: "bold" }}>
            🧮 الإجمالي: {tot}
          </span>
        )}
      </div>

      <div className="form-row">
        <input list="dlist" placeholder="اسم الصنف" value={name} onChange={onName} />
        {isNew && (
          <button type="button" style={{ marginInlineStart: "6px" }} onClick={addItem}>
            ➕ إضافة
          </button>
        )}
        <datalist id="dlist">
          {opts.map(o => <option key={o} value={o} />)}
        </datalist>

        <input
          type="number"
          placeholder="الكمية"
          value={qty}
          onChange={e => setQty(e.target.value)}
        />

        <select value={unit} onChange={e => setUnit(e.target.value)}>
          {UNIT_MAP.map(u => <option key={u}>{u}</option>)}
        </select>

        <button onClick={handleSave}>{editId ? "تحديث" : "إضافة"}</button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>الصنف</th><th>الكمية</th><th>السابق</th>
            <th>الحالي</th><th>الوحدة</th><th>✏️</th><th>🗑️</th>
          </tr>
        </thead>
        <tbody>
          {flt.map(i => (
            <tr
              key={i.id}
              style={{
                background:
                  i.quantity < 0 ? "#0c0c0cff"
                    : i.isEdited ? "#ffcaca"
                    : "transparent"
              }}
            >
              <td>{i.name}</td>
              <td>{i.quantity}</td>
              <td>{i.prevQty ?? "-"}</td>
              <td>{i.currentQty ?? "-"}</td>
              <td>{i.unit}</td>
            <td><button onClick={() => handleEdit(i)}>✏️</button></td>

              <td><button onClick={() => handleDelete(i)}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StreetStore;
