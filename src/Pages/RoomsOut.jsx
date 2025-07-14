// src/pages/RoomsOut.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  collectionGroup,
  doc,
  addDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import "../GlobalStyles.css";

const normalize = (s = "") => String(s).trim().replace(/\s+/g, " ").toLowerCase();
const today = new Date().toISOString().split("T")[0];
const isAddition = (path) => path.includes("rooms-store");
const isDeduction = (path) => path.includes("rooms-out");

const BASE_ITEMS = [
  "بيض", "مانجا فليت", "فرولة فليت", "كيوي فليت", "مربي مشمش", "لباني",
  "جبنه تشيز كيك", "رومانتك ابيض", "رومانتك اسمر", "بشر اسمر", "بشر ابيض",
  "لوتس", "نوتيلا", "جناش جديد", "جناش",
];

export default function RoomsOut() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(today);
  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [quantity, setQty] = useState("");
  const [note, setNote] = useState("");

  const [options, setOptions] = useState([]);
  const [filteredOpts, setFilteredOpts] = useState([]);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredRecs, setFilteredRecs] = useState([]);

  const extraItemsCol = collection(db, "rooms-items");
  const outDayCol = (date) => collection(db, "rooms-out", date, "items");

  useEffect(() => {
    const unsubStore = onSnapshot(collectionGroup(db, "items"), (snap) => {
      const roomNames = [];
      snap.docs.forEach((d) => {
        if (d.ref.path.includes("rooms-store")) {
          const n = d.data().name;
          if (typeof n === "string" && n.trim() && !roomNames.includes(n)) roomNames.push(n);
        }
      });
      onSnapshot(extraItemsCol, (esnap) => {
        const extra = esnap.docs.map((x) => x.id);
        const merged = [
          ...roomNames,
          ...extra.filter((x) => !roomNames.includes(x)),
          ...BASE_ITEMS.filter((b) => !roomNames.includes(b) && !extra.includes(b)),
          "أدخل صنف جديد",
        ];
        setOptions(merged.filter((v) => typeof v === "string" && v.trim()).filter((v, i, a) => a.indexOf(v) === i));
      });
    });
    return () => unsubStore();
  }, []);

  useEffect(() => {
    const q = query(
      collectionGroup(db, "items"),
      where("source", "==", "rooms-out"),
      orderBy("date", "asc"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.ref.path, ...d.data() }));
      setRecords(data);
      setFilteredRecs(data);
    });
    return () => unsub();
  }, []);

  const ensureNewItem = async (itemName) => {
    if (!itemName) return;
    await setDoc(doc(extraItemsCol, itemName), { createdAt: serverTimestamp() }, { merge: true });
  };

  const calcPrevTotal = async (nameKey) => {
    let add = 0, out = 0;
    const snap = await getDocs(collectionGroup(db, "items"));
    snap.docs.forEach((d) => {
      const data = d.data();
      const k = data.nameKey || normalize(data.name);
      if (k !== nameKey) return;
      const q = parseFloat(data.quantity) || 0;
      if (isAddition(d.ref.path)) add += q;
      else if (isDeduction(d.ref.path)) out += q;
    });
    return add - out;
  };

  const handleNameInput = (val) => {
    setName(val);
    const v = val.trim().toLowerCase();
    setFilteredOpts(options.filter((o) => typeof o === "string" && o.toLowerCase().includes(v)));
  };

  const handleSubmit = async () => {
    const finalName = name === "أدخل صنف جديد" ? customName.trim() : name.trim();
    const qtyNum = parseFloat(quantity);
    if (!finalName || !qtyNum) return alert("أدخل الاسم والكمية");

    if (!options.includes(finalName) && finalName !== "أدخل صنف جديد") await ensureNewItem(finalName);

    const key = normalize(finalName);
    const prev = await calcPrevTotal(key);
    if (qtyNum > prev) return alert(`❌ الكمية غير كافية (المتاح ${prev})`);
    const curr = prev - qtyNum;

    await addDoc(outDayCol(selectedDate), {
      name: finalName,
      nameKey: key,
      quantity: qtyNum,
      prevQty: prev,
      currentQty: curr,
      note,
      date: selectedDate,
      createdAt: serverTimestamp(),
      source: "rooms-out",
    });

    setName(""); setCustomName(""); setQty(""); setNote(""); setSearch("");
  };

  const handleDelete = async (idPath) => {
    if (prompt("كلمة المرور؟") !== "2991034") return;
    if (!window.confirm("تأكيد الحذف؟")) return;
    await deleteDoc(doc(db, idPath));
  };

  const handleSearch = () => {
    const term = search.trim().toLowerCase();
    if (!term) { setFilteredRecs(records); return; }
    setFilteredRecs(records.filter((r) => normalize(r.name).includes(term) || r.date === term));
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من الغرف</h2>

      <div className="form-row">
        <label>📅 التاريخ:</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      <div className="form-row">
        <input list="rooms-items" placeholder="اسم الصنف" value={name} onChange={(e) => handleNameInput(e.target.value)} />
        <datalist id="rooms-items">
          {filteredOpts.map((opt) => (<option key={opt} value={opt} />))}
        </datalist>
        {name === "أدخل صنف جديد" && (
          <input placeholder="اسم الصنف الجديد" value={customName} onChange={(e) => setCustomName(e.target.value)} />
        )}
        <input type="number" placeholder="الكمية" value={quantity} onChange={(e) => setQty(e.target.value)} />
        <input type="text" placeholder="ملاحظات" value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={handleSubmit}>➕ تسجيل</button>
      </div>

      <div className="form-row">
        <input type="text" placeholder="بحث بالاسم أو التاريخ" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={handleSearch}>🔍 بحث</button>
      </div>

      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>الصنف</th><th>السابق</th><th>الكمية</th><th>الحالي</th><th>ملاحظات</th><th>التاريخ</th><th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecs.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.prevQty}</td>
                <td>{r.quantity}</td>
                <td>{r.currentQty}</td>
                <td>{r.note || "-"}</td>
                <td>{r.date}</td>
                <td><button className="delete-btn" onClick={() => handleDelete(r.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
