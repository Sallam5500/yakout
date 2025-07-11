// src/pages/StreetOut.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "../GlobalStyles.css";

const StreetOut = () => {
  const [item, setItem] = useState("");
  const [customItem, setCustomItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();

  const itemOptions = [
    "شكارة كريمه", "بسبوسة", "كيس بندق ني بسبوسة", "هريسة", "بسيمة", "حبيبه", "رموش",
    "لينزا", "جلاش", "نشابه", "صوابع", "بلح", "علب كريمة", "قشطوطة",
    "فادج", "كيس كاكو1.750جرام", "كيس جرانه", "عزيزية", "بسبوسة تركي",
    "شكارة سوداني مكسر", "ك بندق ني مكسر", "كيس سوداني روشيه", "كيس بندق محمص250جرام", "كيس أكلير",
    "كرتونة بندق سليم", "ك سكر بودره", "ك جوز هند ناعم", "ك سميد", "جيلاتينة", "ك لبن بودره",
    "كيس لبن بودره 150 جرام", "شيكولاته اسمر", "شيكولاته بيضاء", "كرتونة زيت", "جركن زيت", "لباني", "باستري",
    "فانليا", "فاكيوم 7سم", "لون احمر", "علب طلبية", "كرتونة خميرة فورية", "سمنة فرن", "نشا", "سكر", "دقيق اهرام",
    "وجبة بتي فور", "جوز هند محمص", "لوز محمص مجروش", "جوز هند ابيض", "وجبة بسكوت", "رابطة حلويات",
    "علب بتي فور نص", "علب بسكوت نص", "علب غريبة نص", "علب كعك ساده نص", "علب كعك ملبن نص", "لعب جاتوه",
    "دفتر ترنسفير الوان", "ملبن", "وجبه سيرب", "بكر استرتش", "ورق سلوفان موس", "علب جاتوه دسته",
    "دفتر ترانسفير ساده", "كرتونة بكين بودر", "ستان 2سم", "جيلي شفاف", "جيلي سخن", "أدخل صنف جديد"
  ];

  const streetOutRef = collection(db, "street-out");

  // قراءة بيانات الصادر من Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(streetOutRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    const finalItem = item === "أدخل صنف جديد" ? customItem.trim() : item.trim();

    if (!finalItem || !quantity) {
      alert("من فضلك أدخل اسم الصنف والكمية");
      return;
    }

    // التأكد من توفر الصنف والكمية في المخزن
    const stockRef = collection(db, "street-store");
    const q = query(stockRef, where("name", "==", finalItem));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("❌ هذا الصنف غير موجود في المخزن.");
      return;
    }

    const stockDoc = snapshot.docs[0];
    const availableQty = stockDoc.data().quantity;

    if (Number(quantity) > availableQty) {
      alert(`❌ الكمية غير كافية. المتاح: ${availableQty}`);
      return;
    }

    // تسجيل الصادر فقط بدون خصم فعلي
    await addDoc(streetOutRef, {
      name: finalItem,
      quantity: Number(quantity),
      note,
      date: new Date().toLocaleString("ar-EG", {
        timeZone: "Africa/Cairo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: serverTimestamp(),
    });

    alert("✅ تم تسجيل الصادر بنجاح.");
    setItem("");
    setCustomItem("");
    setQuantity("");
    setNote("");
  };

  const handleDelete = async (id) => {
    const password = prompt("أدخل كلمة المرور للحذف:");
    if (password !== "1234" && password !== "2991034") {
      alert("❌ كلمة المرور غير صحيحة.");
      return;
    }

    const confirm = window.confirm("هل أنت متأكد من الحذف؟");
    if (!confirm) return;

    await deleteDoc(doc(db, "street-out", id));
    alert("✅ تم الحذف.");
  };

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📤 الصادر من المخزن</h2>

      <div className="form-row">
        <select value={item} onChange={(e) => setItem(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((i, idx) => (
            <option key={idx} value={i}>{i}</option>
          ))}
        </select>

        {item === "أدخل صنف جديد" && (
          <input
            type="text"
            placeholder="أدخل اسم الصنف"
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
          placeholder="البيان / ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="add-button" onClick={handleSubmit}>
          ➕ تسجيل
        </button>
      </div>

      <h3 className="table-title">📑 سجل الصادر:</h3>
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>اسم الصنف</th>
              <th>الكمية</th>
              <th>البيان</th>
              <th>التاريخ</th>
              <th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td>{rec.name}</td>
                <td>{rec.quantity}</td>
                <td>{rec.note}</td>
                <td>{rec.date}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(rec.id)}>حذف</button>
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
