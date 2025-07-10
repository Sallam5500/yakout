import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './InventoryPage.css'; // نفس التصميم

const OrdersPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const branchName = branchId === 'barkasaba' ? 'بركة السبع' : 'قويسنا';
  const storageKey = `${branchId}_orders`;
  const deletePassword = "delete123";

  const [formData, setFormData] = useState({ product: '', quantity: '', unit: 'عدد', note: '' });
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, [storageKey]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newOrder = {
      ...formData,
      date: new Date().toLocaleDateString('ar-EG'),
    };

    let updated;

    if (editIndex !== null) {
      updated = [...orders];
      updated[editIndex] = newOrder;
      setEditIndex(null);
    } else {
      updated = [...orders, newOrder];
    }

    setOrders(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setFormData({ product: '', quantity: '', unit: 'عدد', note: '' });
  };

  const handleEdit = (index) => {
    const item = orders[index];
    setFormData({ 
      product: item.product, 
      quantity: item.quantity, 
      unit: item.unit || 'عدد', 
      note: item.note || '' 
    });
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const enteredPass = prompt("ادخل كلمة السر لحذف الطلب:");
    if (enteredPass === deletePassword) {
      const updated = orders.filter((_, i) => i !== index);
      setOrders(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      alert("تم الحذف بنجاح");
    } else {
      alert("كلمة السر غير صحيحة");
    }
  };

  const filteredData = orders.filter((item) =>
    item.product.includes(searchTerm) || item.date.includes(searchTerm)
  );

  const productList = [
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

  return (
    <div className="inventory-container">
      <button className="back-button" onClick={() => navigate(-1)}>← رجوع</button>
      <h2>الأوردر اليومي - فرع {branchName}</h2>

      <form onSubmit={handleSubmit} className="inventory-form">
        <select
          value={formData.product}
          onChange={(e) => setFormData({ ...formData, product: e.target.value })}
          required
        >
          <option value="">اختر الصنف</option>
          {productList.map((item, index) => (
            <option key={index} value={item}>{item}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="الكمية المطلوبة"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required
        />

        <select
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        >
          <option>عدد</option>
          <option>سيرفيز</option>
          <option>برنيكة</option>
          <option>كيلو</option>
          <option>صاج</option>
        </select>

        <input
          type="text"
          placeholder="بيان / ملاحظات"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        />
        <button type="submit">{editIndex !== null ? 'تحديث' : 'تسجيل الأوردر'}</button>
      </form>

      <input
        type="text"
        placeholder="ابحث باسم الصنف أو التاريخ"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ccc' }}
      />

      <table className="inventory-table">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>الوحدة</th>
            <th>البيان</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.product}</td>
              <td>{item.quantity}</td>
              <td>{item.unit || '-'}</td>
              <td>{item.note || '-'}</td>
              <td>
                <button onClick={() => handleEdit(index)} style={{ marginRight: '8px' }}>✏</button>
                <button onClick={() => handleDelete(index)}>🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;
