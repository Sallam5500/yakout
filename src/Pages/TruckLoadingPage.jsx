// src/pages/TruckLoadingPage.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../GlobalStyles.css";

const BRANCH_TITLES = {
  barka: "تحميل فرع بركة السبع",
  qwesna: "تحميل فرع قويسنا",
  receive: "استلام من المصنع",
};

const UNITS = ["عدد", "برنيكه", "سيرفيز", "صاج", "قطعه"];

const ITEM_OPTIONS = [
  "كنافه كريمة",
  "لينزا",
  "مدلعة",
  "صاج عزيزيه",
  "بسبوسة ساده",
  "بسبوسة بندق",
  "جلاش كريمة",
  "بسبوسة قشطة",
  "بسبوسة لوتس",
  "كنافة قشطة",
  "جلاش",
  "بقلاوة",
  "جلاش حجاب",
  "سوارية ساده",
  "سوارية مكسرات",
  "بصمة سادة",
  "بصمة مكسرات",
  "بسيمة",
  "حبيبة",
  "رموش",
  "اسكندراني",
  "كنافة عش",
  "بصمة كاجو",
  "بلح ساده",
  "صوابع زينب",
  "عش نوتيلا",
  "عش فاكهة",
  "صاج رواني",
  "جلاش تركي",
  "كنافة فادج",
  "كنافة بستاشيو",
  "بلح كريمة",
  "كورنيه",
  "دسباسيتو",
  "بروفترول",
  "ميني مربعه",
  "تورته ميني",
  "تشيز كيك",
  "موس مشكلة",
  "فادج",
  "فلوتس",
  "مربعه فور سيزون",
  "ط26 فور سيزون",
  "ط24 فور سيزون",
  "تفاحة نص ونص",
  "تفاحة R/F",
  "مربعه نص ونص",
  "مربعه R/F",
  "ط 26 نص ونص",
  "ط 26 رومانتك",
  "ط 26 فاكيوم",
  "ط 24 بلاك",
  "ط 20 نص ونص",
  "ط 20 بلاك",
  "قلب صفير",
  "فيستفال",
  "قشطوطة",
  "جاتوه سواريه",
  "20*30",
  "موس ابيض",
  "موس كرامل",
  "موس توت",
  "موس لوتس",
  "موس فراولة",
  "موس شوكولاتة",
  "موس مانجا",
  "موس كيوي",
  "أكواب فاكهة",
  "أكواب شوكولاتة",
  "مهلبية",
  "كاس موس",
  "كاسات فاكهة",
  "كوبيات جيلاتين",
  "جاتوه كبير",
  "جاتوه صغير",
  "التشكلات",
  "كاب توت",
  "موس قديم",
  "بولا",
  "فاني كيك",
  "طبقات 22",
  "30*30",
  "35*35",
  "مانجا مستطيل",
  "موس فرنسوي",
  "كارت كيك",
  "فاكهة جديد",
  "فلوش جديد",
  "بيستاشيو مستطيل",
  "كب بيستاشيو",
  "تورتة مانجا",
];

const TruckLoadingPage = () => {
  const { branch } = useParams();
  const collectionName = `truck-loading-${branch}`;
  const pageTitle = BRANCH_TITLES[branch] || "تحميل العربيات";

  const [records, setRecords] = useState([]);
  const [itemsList, setItemsList] = useState(ITEM_OPTIONS);
  const [item, setItem] = useState("");
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(UNITS[0]);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [showAddNewOption, setShowAddNewOption] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const formattedDate = selectedDate.toISOString().split("T")[0];

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "items"), (snap) => {
      const firebaseItems = snap.docs.map((d) => d.id);
      setItemsList(
        Array.from(new Set([...ITEM_OPTIONS, ...firebaseItems])).sort()
      );
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const path = collection(db, collectionName, formattedDate, "records");
    const q = query(path, orderBy("createdAt"));
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [collectionName, formattedDate]);

  const handleAddNewItem = async () => {
    const name = newItemName.trim();
    if (!name) return;
    await setDoc(doc(db, "items", name), { createdAt: serverTimestamp() });
    setItem(name);
    setNewItemName("");
    setIsAddingNewItem(false);
    setShowAddNewOption(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!item || !quantity) return alert("أدخل الصنف والكمية");

    const docRef = collection(db, collectionName, formattedDate, "records");
    await addDoc(docRef, {
      item,
      quantity: Number(quantity),
      unit,
      note,
      createdAt: serverTimestamp(),
      updated: false,
      branch,
    });

    setItem("");
    setQuantity("");
    setUnit(UNITS[0]);
    setNote("");
    setShowAddNewOption(false);
  };

  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة المرور للحذف:");
    if (!["1234", "2991034"].includes(pwd))
      return alert("كلمة المرور خاطئة");
    await deleteDoc(
      doc(db, collectionName, formattedDate, "records", id)
    );
  };

  const handleEdit = async (rec) => {
    const pwd = prompt("ادخل كلمة المرور للتعديل:");
    if (!["1234", "2991034"].includes(pwd))
      return alert("كلمة المرور خاطئة");

    const newItem = prompt("الصنف الجديد:", rec.item);
    const newQty = prompt("الكمية الجديدة:", rec.quantity);
    const newUnit = prompt("الوحدة الجديدة:", rec.unit);
    const newNote = prompt("ملاحظة جديدة:", rec.note || "");

    if (!newItem || !newQty || !newUnit) return;

    await updateDoc(
      doc(db, collectionName, formattedDate, "records", rec.id),
      {
        item: newItem,
        quantity: Number(newQty),
        unit: newUnit,
        note: newNote,
        updated: true,
      }
    );
  };

  const filtered = records.filter(
    (r) =>
      r.item.toLowerCase().includes(search.trim().toLowerCase()) ||
      (r.createdAt &&
        new Date(r.createdAt.seconds * 1000)
          .toLocaleDateString("fr-CA")
          .includes(search.trim()))
  );

  const filteredItems = itemsList
    .filter((it) => it.toLowerCase().includes(item.trim().toLowerCase()))
    .slice(0, 100);

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ رجوع
      </button>
      <h2 className="page-title">🚚 {pageTitle}</h2>
      <button className="print-btn" onClick={() => window.print()}>
        🖨️ طباعة
      </button>

      {/* اختيار التاريخ احتفاظي لو بتحب تسجل على أيام مختلفة، لكن مش ظاهر في الجدول */}
      <div className="form-row">
        <label>اختر التاريخ: </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          className="date-picker"
        />
      </div>

      <form onSubmit={handleAdd} className="form-row">
        {isAddingNewItem ? (
          <>
            <input
              type="text"
              placeholder="أدخل اسم الصنف الجديد"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <button type="button" onClick={handleAddNewItem}>
              حفظ ➕
            </button>
          </>
        ) : (
          <>
            <div style={{ position: "relative" }}>
              <input
                list="items-list"
                placeholder="اكتب الصنف..."
                value={item}
                onChange={(e) => {
                  setItem(e.target.value);
                  const match = itemsList.some(
                    (it) =>
                      it.toLowerCase() === e.target.value.trim().toLowerCase()
                  );
                  setShowAddNewOption(!match && e.target.value.trim() !== "");
                }}
                onFocus={() => {
                  const match = itemsList.some(
                    (it) =>
                      it.toLowerCase() === item.trim().toLowerCase()
                  );
                  setShowAddNewOption(!match && item.trim() !== "");
                }}
              />
              <datalist id="items-list">
                {filteredItems.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              {showAddNewOption && (
                <button
                  type="button"
                  style={{ marginLeft: "8px" }}
                  onClick={() => {
                    setNewItemName(item.trim());
                    setIsAddingNewItem(true);
                  }}
                >
                  + إضافة "{item.trim()}"
                </button>
              )}
            </div>
          </>
        )}

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="add-button" type="submit">
          تسجيل
        </button>
      </form>

      <input
        className="search"
        type="text"
        placeholder="بحث بالاسم أو التاريخ"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <h3 style={{ marginTop: "15px" }}>
        📅 تحميلات يوم {formattedDate}
      </h3>

      <table className="styled-table">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>الوحدة</th>
            <th>ملاحظات</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="5">لا توجد بيانات.</td>
            </tr>
          ) : (
            filtered.map((rec) => (
              <tr
                key={rec.id}
                className={rec.updated ? "edited-row" : ""}
              >
                <td>{rec.item}</td>
                <td>{rec.quantity}</td>
                <td>{rec.unit}</td>
                <td>{rec.note || "—"}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(rec)}
                  >
                    ✏️
                  </button>{" "}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(rec.id)}
                  >
                    🗑️
                  </button>
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
