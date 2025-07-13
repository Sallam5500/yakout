import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const predefinedItems = [
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

const StockPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, "storeItems"),
      orderBy("date", "asc"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStockItems(items);
    });

    return () => unsubscribe();
  }, []);

  const handleAddStock = async () => {
    if (!name || !quantity) {
      alert("يرجى إدخال اسم الصنف والكمية.");
      return;
    }

    const date = new Date().toLocaleDateString("fr-CA");

    const existing = stockItems.find(
      (item) => item.name === name && item.unit === unit && item.date === date
    );

    if (existing) {
      const updatedQuantity = existing.quantity + parseInt(quantity);
      await updateDoc(doc(db, "storeItems", existing.id), {
        quantity: updatedQuantity,
      });
    } else {
      await addDoc(collection(db, "storeItems"), {
        name,
        quantity: parseInt(quantity),
        unit,
        date,
        createdAt: serverTimestamp(),
      });
    }

    setName("");
    setQuantity("");
    setUnit("عدد");
  };

  const handleDelete = async (id) => {
    const password = prompt("ادخل كلمة المرور لحذف الصنف:");
    if (password !== "2991034") {
      alert("كلمة المرور خاطئة.");
      return;
    }
    await deleteDoc(doc(db, "storeItems", id));
  };

  const handleDeleteAll = async () => {
    const confirm = window.confirm("هل أنت متأكد أنك تريد حذف كل البيانات؟");
    if (!confirm) return;

    const password = prompt("ادخل كلمة المرور لحذف جميع البيانات:");
    if (password !== "2991034") {
      alert("كلمة المرور خاطئة.");
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, "storeItems"));
      const deletions = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "storeItems", docSnap.id))
      );
      await Promise.all(deletions);
      alert("✅ تم حذف كل البيانات بنجاح.");
    } catch (error) {
      console.error("❌ فشل الحذف:", error);
      alert("حدث خطأ أثناء الحذف.");
    }
  };

  const filteredItems = stockItems.filter(
    (item) =>
      item.name.includes(searchTerm) || item.date.includes(searchTerm)
  );

  const handlePrint = () => window.print();

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📦 البضاعة (المخزون الرئيسي)</h2>

      <div className="form-row">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">اختر صنف من القائمة</option>
          {predefinedItems.map((itemName, index) => (
            <option key={index} value={itemName}>{itemName}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="أو اكتب صنف جديد"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />

        <input
          type="number"
          placeholder="الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="عدد">عدد</option>
          <option value="شكاره">شكاره</option>
          <option value="جردل">جردل</option>
          <option value="كيلو">كيلو</option>
          <option value="كيس">كيس</option>
          <option value="برنيكه">برنيكه</option>
          <option value="جرام">جرام</option>
          <option value="برميل">برميل</option>
          <option value="كرتونة">كرتونة</option>
        </select>

        <button onClick={handleAddStock}>➕ إضافة للمخزن</button>
      </div>

      <div className="form-row">
        <input
          type="text"
          className="search"
          placeholder="🔍 ابحث بالاسم أو التاريخ"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handlePrint}>🖨️ طباعة</button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>📅 التاريخ</th>
            <th>📦 الصنف</th>
            <th>🔢 الكمية</th>
            <th>⚖️ الوحدة</th>
            <th>🛠️ إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length === 0 ? (
            <tr><td colSpan="5">لا توجد بيانات.</td></tr>
          ) : (
            filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>
                  <button onClick={() => handleDelete(item.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button
        className="delete-all-btn"
        style={{
          backgroundColor: "darkred",
          color: "white",
          marginTop: "20px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        onClick={handleDeleteAll}
      >
        🧹 حذف كل البيانات
      </button>
    </div>
  );
};

export default StockPage;
