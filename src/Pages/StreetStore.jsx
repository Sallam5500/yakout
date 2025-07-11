import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase"; // تأكد إنك عامل ملف firebase.js فيه config
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import "../GlobalStyles.css";

const StreetStore = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);

  const itemOptions = ["شكارة كريمه",  "بسبوسة", "كيس بندق ني بسبوسة", "هريسة", "بسيمة", "حبيبه", " رموش", 
    "لينزا", "جلاش", "نشابه", "صوابع", "بلح", "علب كريمة", "قشطوطة", 
    "فادج ", "كيس كاكو1.750جرام ", " كيس جرانه", "عزيزية ", "بسبوسة تركي ",
    "شكارة سوداني مكسر ", "ك بندق ني مكسر  ", " كيس سوداني روشيه", "كيس بندق محمص250جرام ", " كيس أكلير ",
    "كرتونة بندق سليم", "ك سكر بودره ", " ك جوز هند ناعم", "ك سميد", "جيلاتينة","ك لبن بودره",
    "كيس لبن بودره 150 جرام","شيكولاته اسمر","شيكولاته بيضاء","كرتونة زيت","جركن زيت","لباني","باستري",
    "فانليا","فاكيوم 7سم",
    "لون احمر","علب طلبية","كرتونة خميرة فورية","سمنة فرن","نشا","سكر","دقيق اهرام","وجبة بتي فور","جوز هند محمص",
    "لوز محمص مجروش","جوز هند ابيض","وجبة بسكوت","رابطة حلويات","علب بتي فور نص","علب بسكوت نص","علب غريبة نص",
    "علب كعك ساده نص","علب كعك ملبن نص","لعب جاتوه","دفتر ترنسفير الوان","ملبن","وجبه سيرب","بكر استرتش",
    "ورق سلوفان موس","علب جاتوه دسته","دفتر ترانسفير ساده","كرتونة بكين بودر ","ستان 2سم","جيلي شفاف","جيلي سخن", "أدخل صنف جديد"];

  const streetStoreRef = collection(db, "street-store");

  useEffect(() => {
    const unsubscribe = onSnapshot(streetStoreRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAddOrUpdate = async () => {
    const finalName = name === "أدخل صنف جديد" ? customName.trim() : name.trim();
    if (!finalName || !quantity) return alert("من فضلك أدخل الاسم والكمية");

    if (editId) {
      const password = prompt("ادخل كلمة السر لتعديل الصنف:");
      if (password !== "1234" && password !== "2991034") {
        alert("كلمة المرور غير صحيحة");
        return;
      }

      const itemRef = doc(db, "street-store", editId);
      await updateDoc(itemRef, {
        name: finalName,
        quantity: parseFloat(quantity),
        unit,
        isEdited: true,
      });
      setEditId(null);
    } else {
      await addDoc(streetStoreRef, {
        name: finalName,
        quantity: parseFloat(quantity),
        unit,
        date: new Date().toISOString().split("T")[0],
        isEdited: false,
        timestamp: serverTimestamp(), // للفرز لاحقًا
      });
    }

    setName("");
    setCustomName("");
    setQuantity("");
    setUnit("عدد");
  };

  const handleDelete = async (id) => {
    const password = prompt("أدخل كلمة المرور للحذف:");
    if (password !== "1234" && password !== "2991034") {
      alert("كلمة المرور غير صحيحة.");
      return;
    }
    const confirmDelete = window.confirm("هل أنت متأكد من الحذف؟");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "street-store", id));
  };

  const handleEdit = (item) => {
    setName(item.name);
    setCustomName("");
    setQuantity(item.quantity);
    setUnit(item.unit);
    setEditId(item.id);
  };

  return (
    <div className="page-container" dir="rtl">
      <button className="back-button" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">🏪 المخزن اللي في الشارع</h2>

      <div className="form-row">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">اختر الصنف</option>
          {itemOptions.map((item, idx) => (
            <option key={idx} value={item}>{item}</option>
          ))}
        </select>

        {name === "أدخل صنف جديد" && (
          <input
            type="text"
            placeholder="أدخل اسم الصنف"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        )}

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option>عدد</option>
          <option>كيلو</option>
          <option>شكارة</option>
          <option>جرام</option>
          <option>برمل</option>
          <option>كيس</option>
          <option>جردل</option>
        </select>
        <button className="add-button" onClick={handleAddOrUpdate}>
          {editId ? "تحديث" : "إضافة"}
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الكمية</th>
            <th>الوحدة</th>
            <th>التاريخ</th>
            <th>تعديل</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              style={{
                backgroundColor: item.isEdited ? "#ffcccc" : "transparent",
                textAlign: "center",
              }}
            >
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.date}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(item)}>تعديل</button>
              </td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(item.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StreetStore;
