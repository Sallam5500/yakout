// src/pages/StockSummary.jsx
import React, { useEffect, useState } from "react";
import { collectionGroup, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../GlobalStyles.css";

const StockSummary = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // تحميل البيانات من كل Subcollections اللي اسمها "items"
  useEffect(() => {
    const unsub = onSnapshot(collectionGroup(db, "items"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), path: doc.ref.path }));
      setItems(data);
    });

    return () => unsub();
  }, []);

  // فلترة حسب البحث
  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // دالة مسح مع تأكيد الباسورد
  const handleDelete = async (item) => {
    const password = prompt("اكتب كلمة المرور لمسح الصنف");
    if (password !== "123456") return alert("كلمة المرور غير صحيحة");

    try {
      await deleteDoc(doc(db, item.path));
      alert("تم حذف الصنف بنجاح");
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="factory-page">
      <h2 className="page-title">ملخص المخزن</h2>

      <div className="form-row">
        <input
          type="text"
          placeholder="ابحث باسم الصنف"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="back-button" onClick={() => navigate(-1)}>
          رجوع
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>اسم الصنف</th>
            <th>الكمية</th>
            <th>الوحدة</th>
            <th>إجراء</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, idx) => (
            <tr key={item.id + idx}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>
                <button onClick={() => handleDelete(item)} className="delete-btn">
                  حذف
                </button>
              </td>
            </tr>
          ))}
          {filteredItems.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                لا توجد أصناف مطابقة
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockSummary;
