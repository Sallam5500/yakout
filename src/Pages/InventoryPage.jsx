import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../GlobalStyles.css';

const InventoryPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const branchName = branchId === 'barkasaba' ? 'بركة السبع' : 'قويسنا';
  const storageKey = `${branchId}_inventory`;
  const deletePassword = "1234";

  const [formData, setFormData] = useState({ product: '', quantity: '', unit: 'عدد', note: '' });
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setInventory(JSON.parse(saved));
    }
  }, [storageKey]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRecord = {
      ...formData,
      date: new Date().toLocaleDateString('fr-CA'),
    };

    let updated;

    if (editIndex !== null) {
      updated = [...inventory];
      updated[editIndex] = newRecord;
      updated[editIndex].updated = true;
      setEditIndex(null);
    } else {
      updated = [...inventory, newRecord];
    }

    setInventory(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setFormData({ product: '', quantity: '', unit: 'عدد', note: '' });
  };

  const handleEdit = (index) => {
    const item = inventory[index];
    setFormData({ 
      product: item.product, 
      quantity: item.quantity, 
      unit: item.unit || 'عدد', 
      note: item.note || '' 
    });
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const enteredPass = prompt("ادخل كلمة السر لحذف الصنف:");
    if (enteredPass === deletePassword) {
      const updated = inventory.filter((_, i) => i !== index);
      setInventory(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      alert("تم الحذف بنجاح");
    } else {
      alert("كلمة السر غير صحيحة");
    }
  };

  const filteredData = inventory.filter((item) =>
    item.product.includes(searchTerm) || item.date.includes(searchTerm)
  );

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>
      <h2 className="page-title">📋 جرد المحل - فرع {branchName}</h2>

      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-row">
          <select
            value={formData.product}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            required
          >
            <option value="">اختر الصنف</option>
            {[
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
            ].map((item, index) => (
              <option key={index} value={item}>{item}</option>
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
        </div>

        <button type="submit">{editIndex !== null ? 'تحديث' : 'تسجيل'}</button>
      </form>

      <input
        type="text"
        className="search"
        placeholder="ابحث باسم الصنف أو التاريخ"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="styled-table">
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
          {filteredData.length === 0 ? (
            <tr><td colSpan="6">لا توجد بيانات.</td></tr>
          ) : (
            filteredData.map((item, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: item.updated ? "#d0ebff" : "transparent",
                }}
              >
                <td>{item.date}</td>
                <td>{item.product}</td>
                <td>{item.quantity}</td>
                <td>{item.unit || '-'}</td>
                <td>{item.note || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(index)}>✏️</button>{' '}
                  <button onClick={() => handleDelete(index)}>🗑️</button>
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
