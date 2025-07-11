// src/pages/InventoryPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "../GlobalStyles.css";

/* خريطة أسماء الفروع */
const BRANCH_NAMES = {
  barka: "بركة السبع",
  qwesna: "قويسنا",
};
/* كلمات مرور الحذف/التعديل */
const PASS = ["1234", "2991034"];

/* القائمة الأساسية */
const BASE_PRODUCTS = [
  "كنافه كريمة","لينزا","مدلعة","صاج عزيزيه","بسبوسة ساده","بسبوسة بندق",
  /* … بقية الأصناف … */ "تورتة مانجا"
];

const InventoryPage = () => {
  const { branchId } = useParams();              // barka أو qwesna
  const navigate = useNavigate();
  const branchName = BRANCH_NAMES[branchId] || "فرع غير معروف";

  /* Collections */
  const inventoryCol = collection(db, `${branchId}_inventory`);
  const itemsCol     = collection(db, "items");

  /* state */
  const [productList, setProductList] = useState(BASE_PRODUCTS);
  const [inventory, setInventory]     = useState([]);
  const [formData, setFormData] = useState({
    product: "", quantity: "", unit: "عدد", note: "",
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* تحميل الأصناف المشتركة من Firestore */
  useEffect(() => {
    const unsub = onSnapshot(itemsCol, (snap) => {
      const extra = snap.docs.map((d) => d.id);
      setProductList([...BASE_PRODUCTS, ...extra].filter(
        (v, i, arr) => arr.indexOf(v) === i   // unique
      ).sort());
    });
    return () => unsub();
  }, []);

  /* تحميل الجرد لحظيًا */
  useEffect(() => {
    const unsub = onSnapshot(inventoryCol, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setInventory(data);
    });
    return () => unsub();
  }, []);

  /* اختيار صنف (مع إضافة) */
  const handleProductSelect = async (val) => {
    if (val === "__new") {
      const newProd = prompt("اكتب اسم الصنف الجديد:");
      if (newProd) {
        await setDoc(doc(db, "items", newProd), { createdAt: Date.now() });
        setFormData({ ...formData, product: newProd });
      }
    } else {
      setFormData({ ...formData, product: val });
    }
  };

  /* إضافة/تحديث صنف مخزون */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product || !formData.quantity) return;

    const rec = {
      ...formData,
      quantity: parseInt(formData.quantity),
      date: new Date().toLocaleDateString("fr-CA"),
      updated: Boolean(editId),
    };

    if (editId) {
      await updateDoc(doc(db, `${branchId}_inventory`, editId), rec);
      setEditId(null);
    } else {
      await addDoc(inventoryCol, rec);
    }
    setFormData({ product: "", quantity: "", unit: "عدد", note: "" });
  };

  /* التعديل */
  const handleEdit = (item) => {
    setFormData({
      product: item.product, quantity: item.quantity,
      unit: item.unit || "عدد", note: item.note || "",
    });
    setEditId(item.id);
  };

  /* الحذف */
  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة السر لحذف الصنف:");
    if (!PASS.includes(pwd)) return alert("كلمة المرور غير صحيحة");
    await deleteDoc(doc(db, `${branchId}_inventory`, id));
  };

  /* فلترة */
  const filtered = inventory.filter(
    (it) => it.product.includes(searchTerm) || it.date.includes(searchTerm.trim())
  );

  return (
    <div className="factory-page" dir="rtl">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📋 جرد المحل - فرع {branchName}</h2>

      {/* نموذج */}
      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-row">
          <select
            value={formData.product}
            onChange={(e) => handleProductSelect(e.target.value)}
            required
          >
            <option value="">اختر الصنف</option>
            {[...productList, "__new"].map((p) => (
              <option key={p} value={p}>
                {p === "__new" ? "➕ إضافة صنف جديد…" : p}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="الكمية"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />

          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          >
            <option>عدد</option><option>سيرفيز</option>
            <option>برنيكة</option><option>كيلو</option><option>صاج</option>
          </select>

          <input
            type="text"
            placeholder="بيان / ملاحظات"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </div>
        <button type="submit">{editId ? "تحديث" : "تسجيل"}</button>
      </form>

      {/* بحث */}
      <input
        className="search"
        placeholder="🔍 ابحث باسم الصنف أو التاريخ"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* جدول */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>التاريخ</th><th>الصنف</th><th>الكمية</th>
            <th>الوحدة</th><th>البيان</th><th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan="6">لا توجد بيانات.</td></tr>
          ) : (
            filtered.map((it) => (
              <tr key={it.id} style={{ backgroundColor: it.updated ? "#d0ebff" : "transparent" }}>
                <td>{it.date}</td><td>{it.product}</td><td>{it.quantity}</td>
                <td>{it.unit}</td><td>{it.note || "-"}</td>
                <td>
                  <button onClick={() => handleEdit(it)}>✏️</button>{" "}
                  <button onClick={() => handleDelete(it.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
