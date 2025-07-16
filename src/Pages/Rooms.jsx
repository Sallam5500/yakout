// src/pages/Rooms.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
  increment,
  getDocs,
  where,
  collectionGroup,
} from "firebase/firestore";
import "../GlobalStyles.css";

const normalize = (s = "") => s.trim().replace(/\s+/g, " ").toLowerCase();

/* أصناف ووحدات أساسية */
const BASE_ITEMS = [
  "بيض",
  "مانجا فليت",
  "فرولة فليت",
  "كيوي فليت",
  "مربي مشمش",
  "لباني",
  "جبنه تشيز كيك",
  "رومانتك ابيض",
  "رومانتك اسمر",
  "بشر اسمر",
  "بشر ابيض",
  "لوتس",
  "نوتيلا",
  "جناش جديد",
  "جناش",
  "أدخل صنف جديد",
];
const UNIT_MAP = ["كيس", "جردل", "برنيكه", "عدد"];

export default function Rooms() {
  const nav = useNavigate();

  /* إدخال */
  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("كيس");

  /* التاريخ */
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  /* خام */
  const [inRows, setInRows] = useState([]);
  const [outRows, setOutRows] = useState([]);

  /* ملخّص */
  const summary = React.useMemo(() => {
    const map = new Map();
    inRows.forEach((r) => {
      const k = r.nameKey || normalize(r.name);
      if (!map.has(k)) map.set(k, { name: r.name, in: 0, out: 0, unit: r.unit });
      map.get(k).in += r.quantity;
    });
    outRows.forEach((r) => {
      const k = r.nameKey || normalize(r.name);
      if (!map.has(k)) map.set(k, { name: r.name, in: 0, out: 0, unit: r.unit });
      map.get(k).out += Math.abs(r.quantity);
    });
    return [...map.entries()].map(([k, v]) => ({
      ...v,
      current: v.in - v.out,
      nameKey: k,
    }));
  }, [inRows, outRows]);

  /* قائمة الأصناف */
  const [opts, setOpts] = useState([...BASE_ITEMS]);
  useEffect(() => {
    const unsub = onSnapshot(collectionGroup(db, "items"), (s) => {
      const set = new Set(BASE_ITEMS);
      s.docs.forEach((d) => {
        if (d.ref.path.includes("rooms-store")) set.add(d.data().name);
      });
      setOpts([...set]);
    });
    return () => unsub();
  }, []);

  /* اشتراك لليوم (items + outs) */
  useEffect(() => {
    const itemsQ = query(
      collection(db, "rooms-store", date, "items"),
      orderBy("createdAt", "asc")
    );
    const outsQ = query(
      collection(db, "rooms-store", date, "outs"),
      orderBy("createdAt", "asc")
    );

    const u1 = onSnapshot(itemsQ, (s) =>
      setInRows(s.docs.map((d) => ({ id: d.id, col: "items", ...d.data() })))
    );
    const u2 = onSnapshot(outsQ, (s) =>
      setOutRows(s.docs.map((d) => ({ id: d.id, col: "outs", ...d.data() })))
    );
    return () => {
      u1();
      u2();
    };
  }, [date]);

  /* تحديث الرصيد الجذرى */
  const bumpRoot = (key, delta, u) =>
    setDoc(doc(db, "rooms-store", key), { quantity: increment(delta), unit: u }, { merge: true });

  /* إضافة داخل */
  const addNew = async () => {
    const final = name === "أدخل صنف جديد" ? newName.trim() : name.trim();
    const amount = +qty;
    if (!final || !amount)
      return alert("أدخل الاسم والكمية");
    const key = normalize(final);
    await addDoc(collection(db, "rooms-store", date, "items"), {
      name: final,
      nameKey: key,
      quantity: amount,
      unit,
      createdAt: serverTimestamp(),
    });
    await bumpRoot(key, amount, unit);
    setName("");
    setNewName("");
    setQty("");
    setUnit("كيس");
  };

  /* ===== Modal التفاصيل ===== */
  const [show, setShow] = useState(false);
  const [modalRows, setModalRows] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const openModal = async (key, display) => {
    const itemsQ = query(
      collection(db, "rooms-store", date, "items"),
      where("nameKey", "==", key)
    );
    const outsQ = query(
      collection(db, "rooms-store", date, "outs"),
      where("nameKey", "==", key)
    );
    const [iSnap, oSnap] = await Promise.all([getDocs(itemsQ), getDocs(outsQ)]);
    const list = [
      ...iSnap.docs.map((d) => ({ id: d.id, col: "items", ...d.data() })),
      ...oSnap.docs.map((d) => ({ id: d.id, col: "outs", ...d.data() })),
    ];
    setModalRows(list);
    setModalTitle(display);
    setShow(true);
  };

  const editItem = (row) => {
    setShow(false);
    setName(row.name);
    setQty(row.quantity);
    setUnit(row.unit);
    // نستخدم id التحرير لاحقًا إن احتجت
  };

  const deleteItem = async (row) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    await deleteDoc(doc(db, "rooms-store", date, row.col, row.id));
    await bumpRoot(row.nameKey, -row.quantity, row.unit);
  };

  /* ===== حذف جميع بيانات اليوم ===== */
  const deleteAll = async () => {
    const pass = prompt(
      "⚠️ سيتم حذف كافة بيانات هذا اليوم. للتأكيد اكتب كلمة المرور 299"
    );
    if (pass !== "299") return;
    if (!window.confirm("هل أنت متأكد أنك تريد حذف جميع بيانات هذا اليوم؟"))
      return;

    try {
      const tasks = [];
      // حذف الداخل
      inRows.forEach((r) => {
        tasks.push(deleteDoc(doc(db, "rooms-store", date, "items", r.id)));
        tasks.push(bumpRoot(r.nameKey, -r.quantity, r.unit));
      });
      // حذف الصادر
      outRows.forEach((r) => {
        tasks.push(deleteDoc(doc(db, "rooms-store", date, "outs", r.id)));
        const delta = r.quantity < 0 ? Math.abs(r.quantity) : r.quantity;
        tasks.push(bumpRoot(r.nameKey, delta, r.unit));
      });
      await Promise.all(tasks);
      alert("تم حذف جميع بيانات اليوم بنجاح");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحذف، حاول مرة أخرى");
    }
  };

  return (
    <div className="page-container" dir="rtl">
      <button className="back-button" onClick={() => nav(-1)}>
        ⬅ رجوع
      </button>
      <h2 className="page-title">🏬 مخزن الغرف (ملخّص اليوم)</h2>

      <div className="form-row">
        <label>📅</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* زر حذف كل البيانات */}
      <div className="form-row">
        <button className="danger-button" onClick={deleteAll}>
          🗑️ حذف جميع بيانات اليوم
        </button>
      </div>

      {/* إضافة داخل */}
      <div className="form-row">
        <input
          list="list"
          placeholder="اسم الصنف"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <datalist id="list">
          {opts.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        {name === "أدخل صنف جديد" && (
          <input
            placeholder="الصنف الجديد"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        )}
        <input
          type="number"
          placeholder="كمية الداخل"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNIT_MAP.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
        <button onClick={addNew}>➕ إضافة</button>
      </div>

      {/* جدول الملخص */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الداخل</th>
            <th>الصادر</th>
            <th>الحالى</th>
            <th>تفاصيل</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((r) => (
            <tr key={r.nameKey}>
              <td>{r.name}</td>
              <td>{r.in}</td>
              <td>{r.out}</td>
              <td>{r.current}</td>
              <td>
                <button onClick={() => openModal(r.nameKey, r.name)}>🔎</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* نافذة التفاصيل */}
      {show && (
        <div className="modal">
          <div className="modal-content">
            <h3>تفاصيل {modalTitle}</h3>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>الكمية</th>
                  <th>الوحدة</th>
                  <th>✏️</th>
                  <th>🗑️</th>
                </tr>
              </thead>
              <tbody>
                {modalRows.map((r) => (
                  <tr
                    key={r.id}
                    style={{ background: r.col === "outs" ? "#141414ff" : "transparent" }}
                  >
                    <td>{r.quantity}</td>
                    <td>{r.unit}</td>
                    <td>
                      {r.col === "items" && (
                        <button onClick={() => editItem(r)}>✏️</button>
                      )}
                    </td>
                    <td>
                      {r.col === "items" && (
                        <button onClick={() => deleteItem(r)}>🗑️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setShow(false)}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}