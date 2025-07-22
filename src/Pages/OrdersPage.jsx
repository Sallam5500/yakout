// src/pages/OrdersPage.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDocs,
} from "firebase/firestore";
import "../GlobalStyles.css";
const itemList = [
  "كنافه كريمة", "لينزا", "مدلعة", "صاج عزيزيه", "بسبوسة ساده", "بسبوسة بندق",
  "جلاش كريمة", "بسبوسة قشطة", "بسبوسة لوتس", "كنافة قشطة", "جلاش", "بقلاوة",
  "جلاش حجاب", "سوارية ساده", "سوارية مكسرات", "بصمة سادة", "بصمة مكسرات", "بسيمة",
  "حبيبة", "رموش", "اسكندراني", "كنافة عش", "بصمة كاجو", "بلح ساده", "صوابع زينب",
  "عش نوتيلا", "عش فاكهة", "صاج رواني", "جلاش تركي", "كنافة فادج", "كنافة بستاشيو",
  "بلح كريمة", "كورنيه", "دسباسيتو", "بروفترول", "ميني مربعه", "تورته ميني",
  "تشيز كيك", "موس مشكلة", "فادج", "فلوتس", "مربعه فور سيزون", "ط26 فور سيزون",
  "ط24 فور سيزون", "تفاحة نص ونص", "تفاحة R/F", "مربعه نص ونص", "مربعه R/F",
  "ط 26 نص ونص", "ط 26 رومانتك", "ط 26 فاكيوم", "ط 24 بلاك", "ط 20 نص ونص", "ط 20 بلاك",
  "قلب صفير", "فيستفال", "قشطوطة", "جاتوه سواريه", "20*30", "موس ابيض", "موس كرامل",
  "موس توت", "موس لوتس", "موس فراولة", "موس شوكولاتة", "موس مانجا", "موس كيوي",
  "أكواب فاكهة", "أكواب شوكولاتة", "مهلبية", "كاس موس", "كاسات فاكهة", "كوبيات جيلاتين",
  "جاتوه كبير", "جاتوه صغير", "التشكلات", "كاب توت", "موس قديم", "بولا", "فاني كيك",
  "طبقات 22", "30*30", "35*35", "مانجا مستطيل", "موس فرنسوي", "كارت كيك", "فاكهة جديد",
  "فلوش جديد", "بيستاشيو مستطيل", "كب بيستاشيو", "تورتة مانجا", "أدخل صنف جديد"
];


const OrdersPage = () => {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [note, setNote] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [itemsList, setItemsList] = useState([]);

  const today = selectedDate;
  const ordersCollectionRef = collection(db, `daily-orders/${today}/orders`);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(ordersCollectionRef, orderBy("timestamp", "desc")),
      (snapshot) => {
        const newData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(newData);
      }
    );
    return () => unsubscribe();
  }, [today]);

  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, "storeItems"));
      const items = snapshot.docs.map((doc) => doc.id);
      setItemsList(items);
    };
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item || !quantity || !unit) return alert("من فضلك املأ كل الخانات");
    try {
      await addDoc(ordersCollectionRef, {
        item,
        quantity,
        unit,
        note,
        timestamp: serverTimestamp(),
      });
      setItem("");
      setQuantity("");
      setUnit("عدد");
      setNote("");
    } catch (err) {
      console.error("Error adding document: ", err);
    }
  };

  return (
    <div className="factory-page">
      <h2 className="page-title">الأوردر اليومي</h2>
      <div className="form-row">
        <label>اختر التاريخ: </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <form className="form-row" onSubmit={handleSubmit}>
       <select value={item} onChange={(e) => setItem(e.target.value)}>
  <option value="">اختر صنف</option>
  {itemList.map((itemName, index) => (
    <option key={index} value={itemName}>
      {itemName}
    </option>
  ))}
</select>
        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="عدد">عدد</option>
          <option value="كيلو">كيلو</option>
          <option value="علبة">علبة</option>
        </select>
        <input
          type="text"
          placeholder="ملاحظات"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit">إضافة</button>
      </form>

      <table className="styled-table">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>الوحدة</th>
            <th>ملاحظات</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.item}</td>
              <td>{order.quantity}</td>
              <td>{order.unit}</td>
              <td>{order.note}</td>
              <td>
                {order.timestamp?.toDate().toLocaleString("ar-EG", {
                  dateStyle: "short",
                  timeStyle: "short",
                }) || "--"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;
