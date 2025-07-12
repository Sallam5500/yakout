// src/pages/OrdersPage.jsx
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
  query,
  orderBy,                  // ⭐️ مضاف
} from "firebase/firestore";
import { db } from "../firebase";
import "./InventoryPage.css";   // نفس التنسيق

/* أسماء الفروع */
const BRANCH_NAMES = { barka: "بركة السبع", qwesna: "قويسنا" };
/* كلمات مرور الحذف/التعديل */
const PASS = ["1234", "2991034"];

/* قائمة أصناف أساسية */
const BASE_PRODUCTS = [
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
  const { branchId }   = useParams();        // ex: barka
  const navigate       = useNavigate();
  const branchName     = BRANCH_NAMES[branchId] || "فرع غير معروف";

  /* Collections */
  const ordersCol = collection(db, `${branchId}_orders`);
  const itemsCol  = collection(db, "items");   // أصناف مشتركة

  /* state */
  const [productList, setProductList] = useState(BASE_PRODUCTS);
  const [orders, setOrders]           = useState([]);
  const [formData, setFormData] = useState({
    product: "", quantity: "", unit: "عدد", note: "",
  });
  const [editId, setEditId]       = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* تحميل الأصناف من Firestore */
  useEffect(() => {
    const unsub = onSnapshot(itemsCol, (snap) => {
      const extra = snap.docs.map((d) => d.id);
      setProductList(
        [...BASE_PRODUCTS, ...extra]
          .filter((v, i, arr) => arr.indexOf(v) === i)   // unique
          .sort()
      );
    });
    return () => unsub();
  }, []);

  /* تحميل الأوردرات لحظيًا بترتيب تصاعدي */
  useEffect(() => {
    const q = query(ordersCol, orderBy("date", "asc"));   // 🌟 يوم 1 ثم 2 ثم 3…
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* إضافة / تحديث أوردر */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product || !formData.quantity) return;

    const rec = {
      ...formData,
      quantity: parseInt(formData.quantity),
      date: new Date().toLocaleDateString("fr-CA"), // YYYY‑MM‑DD
      updated: Boolean(editId),
    };

    if (editId) {
      await updateDoc(doc(db, `${branchId}_orders`, editId), rec);
      setEditId(null);
    } else {
      await addDoc(ordersCol, rec);
    }
    setFormData({ product: "", quantity: "", unit: "عدد", note: "" });
  };

  /* بدء التعديل */
  const handleEdit = (item) => {
    setFormData({
      product: item.product,
      quantity: item.quantity,
      unit: item.unit,
      note: item.note || "",
    });
    setEditId(item.id);
  };

  /* حذف أوردر */
  const handleDelete = async (id) => {
    const pwd = prompt("ادخل كلمة السر لحذف الطلب:");
    if (!PASS.includes(pwd)) return alert("كلمة السر غير صحيحة");
    await deleteDoc(doc(db, `${branchId}_orders`, id));
  };

  /* اختيار صنف (مع إضافة جديد) */
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

  /* بحث */
  const filtered = orders.filter(
    (o) =>
      o.product.includes(searchTerm) ||
      o.date.includes(searchTerm.trim())
  );

  /* ---------------- JSX ---------------- */
  return (
    <div className="inventory-container" dir="rtl">
      <button className="back-button" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2>🧾 الأوردر اليومي - فرع {branchName}</h2>

      {/* نموذج الإدخال */}
      <form onSubmit={handleSubmit} className="inventory-form">
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
          onChange={(e) =>
            setFormData({ ...formData, quantity: e.target.value })
          }
          required
        />

        <select
          value={formData.unit}
          onChange={(e) =>
            setFormData({ ...formData, unit: e.target.value })
          }
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

        <button type="submit">{editId ? "تحديث" : "تسجيل الأوردر"}</button>
      </form>

      {/* البحث */}
      <input
        type="text"
        placeholder="🔍 ابحث باسم الصنف أو التاريخ"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%", padding: 12, marginBottom: 20,
          borderRadius: 8, border: "1px solid #ccc",
        }}
      />

      {/* جدول */}
      <table className="inventory-table">
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
            filtered.map((o) => (
              <tr key={o.id} style={{ backgroundColor: o.updated ? "#d0ebff" : "transparent" }}>
                <td>{o.date}</td><td>{o.product}</td><td>{o.quantity}</td>
                <td>{o.unit}</td><td>{o.note || "-"}</td>
                <td>
                  <button onClick={() => handleEdit(o)} style={{ marginRight: 8 }}>✏️</button>
                  <button onClick={() => handleDelete(o.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;
