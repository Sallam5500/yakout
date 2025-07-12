// src/pages/TruckLoadingPage.jsx
import React, { useState, useEffect } from "react";
import {
  collection, addDoc, deleteDoc, doc, updateDoc,
  onSnapshot, serverTimestamp, setDoc,
  query, orderBy                             // ⭐️ أضفنا query و orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import "../GlobalStyles.css";

/* ---------- عناوين الصفحات حسب الفرع ---------- */
const BRANCH_TITLES = {
  barka: "تحميل فرع بركة السبع",
  qwesna: "تحميل فرع قويسنا",
  receive: "استلام من المصنع",
};

/* ---------- الوحدات المتاحة ---------- */
const UNITS = ["عدد", "برنيكه", "سيرفيز", "صاج", "قطعه"];

/* ---------- الأصناف الأساسية ---------- */
const ITEM_OPTIONS = [
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
  "فلوش جديد","بيستاشيو مستطيل","كب بيستاشيو","تورتة مانجا"
];

const TruckLoadingPage = () => {
  /* ---------- تحديد الفرع ---------- */
  const { branch } = useParams();                         // barka / qwesna / receive
  const collectionName = `truck-loading-${branch}`;       // مثال: truck-loading-barka
  const pageTitle = BRANCH_TITLES[branch] || "تحميل العربيات";

  /* ---------- state ---------- */
  const [records, setRecords] = useState([]);
  const [itemsList, setItemsList] = useState(ITEM_OPTIONS);

  const [item, setItem] = useState("");
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(UNITS[0]);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  /* ---------- دمج الأصناف من Firestore ---------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "items"), (snap) => {
      const firebaseItems = snap.docs.map((d) => d.id);
      setItemsList(Array.from(new Set([...ITEM_OPTIONS, ...firebaseItems])).sort());
    });
    return () => unsub();
  }, []);

  /* ---------- استماع لحظي لِحركات التحميل بترتيب تصاعدي ---------- */
  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy("createdAt", "asc")); // يوم 1 ثم 2 ثم 3...
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [collectionName]);

  /* ---------- إضافة صنف جديد ---------- */
  const handleAddNewItem = async () => {
    const name = newItemName.trim();
    if (!name) return;
    await setDoc(doc(db, "items", name), { createdAt: serverTimestamp() });
    setItem(name);
    setNewItemName("");
    setIsAddingNewItem(false);
  };

  /* ---------- إضافة حركة تحميل ---------- */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!item || !quantity) return alert("أدخل الصنف والكمية");

    await addDoc(collection(db, collectionName), {
      item,
      quantity: Number(quantity),
      unit,
      note,
      createdAt: serverTimestamp(),
      updated: false,
    });

    setItem("");
    setQuantity("");
    setUnit(UNITS[0]);
    setNote("");
  };

  /* ---------- حذف ---------- */
  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة المرور للحذف:");
    if (!["1234", "2991034"].includes(pwd)) return alert("كلمة المرور خاطئة");
    await deleteDoc(doc(db, collectionName, id));
  };

  /* ---------- تعديل ---------- */
  const handleEdit = async (rec) => {
    const pwd = prompt("ادخل كلمة المرور للتعديل:");
    if (!["1234", "2991034"].includes(pwd)) return alert("كلمة المرور خاطئة");

    const newItem = prompt("الصنف الجديد:", rec.item);
    const newQty  = prompt("الكمية الجديدة:", rec.quantity);
    const newUnit = prompt("الوحدة الجديدة:", rec.unit);
    const newNote = prompt("ملاحظة جديدة:", rec.note || "");

    if (!newItem || !newQty || !newUnit) return;

    await updateDoc(doc(db, collectionName, rec.id), {
      item: newItem,
      quantity: Number(newQty),
      unit: newUnit,
      note: newNote,
      updated: true,
    });
  };

  /* ---------- فلترة ---------- */
  const filtered = records.filter(
    (r) =>
      r.item.includes(search.trim()) ||
      (r.createdAt &&
        new Date(r.createdAt.seconds * 1000)
          .toLocaleDateString("fr-CA")
          .includes(search.trim()))
  );

  /* ========================= JSX ========================= */
  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🚚 {pageTitle}</h2>
      <button className="print-btn" onClick={() => window.print()}>🖨️ طباعة</button>

      {/* نموذج الإدخال */}
      <form onSubmit={handleAdd} className="form-row">
        {isAddingNewItem ? (
          <>
            <input
              type="text"
              placeholder="أدخل اسم الصنف الجديد"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <button type="button" onClick={handleAddNewItem}>حفظ ➕</button>
          </>
        ) : (
          <>
            <select
              value={item}
              onChange={(e) =>
                e.target.value === "__new"
                  ? (setIsAddingNewItem(true), setItem(""))
                  : setItem(e.target.value)
              }
            >
              <option value="">اختر صنفًا...</option>
              {itemsList.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              <option value="__new">+ صنف جديد...</option>
            </select>
          </>
        )}

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          <option value="أخرى">وحدة أخرى...</option>
        </select>
        <input
          type="text"
          placeholder="ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="add-button" type="submit">تسجيل</button>
      </form>

      {/* البحث */}
      <input
        className="search" type="text" placeholder="بحث بالاسم أو التاريخ"
        value={search} onChange={(e) => setSearch(e.target.value)}
        style={{
          padding:"10px", border:"none", borderRadius:"6px",
          marginBottom:"15px", fontSize:"16px", width:"300px", textAlign:"center"
        }}
      />

      {/* الجدول */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>التاريخ</th><th>الصنف</th><th>الكمية</th>
            <th>الوحدة</th><th>ملاحظات</th><th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="6">لا توجد بيانات.</td></tr>
          ) : (
            filtered.map((rec) => (
              <tr key={rec.id} className={rec.updated ? "edited-row" : ""}>
                <td>{rec.createdAt ? new Date(rec.createdAt.seconds * 1000).toLocaleDateString("fr-CA") : "—"}</td>
                <td>{rec.item}</td><td>{rec.quantity}</td><td>{rec.unit}</td>
                <td>{rec.note || "—"}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(rec)}>✏️</button>{" "}
                  <button className="delete-btn" onClick={() => handleDelete(rec.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TruckLoadingPage;
