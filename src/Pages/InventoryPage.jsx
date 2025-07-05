import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './InventoryPage.css';

const InventoryPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const branchName = branchId === 'barkasaba' ? 'بركة السبع' : 'قويسنا';
  const storageKey = `${branchId}_inventory`;
  const deletePassword = "1234";

  const [formData, setFormData] = useState({ product: '', quantity: '' });
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
      date: new Date().toLocaleDateString('ar-EG'),
    };

    let updated;

    if (editIndex !== null) {
      updated = [...inventory];
      updated[editIndex] = newRecord;
      setEditIndex(null);
    } else {
      updated = [...inventory, newRecord];
    }

    setInventory(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setFormData({ product: '', quantity: '' });
  };

  const handleEdit = (index) => {
    const item = inventory[index];
    setFormData({ product: item.product, quantity: item.quantity });
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
    <div className="inventory-container">
      <button className="back-button" onClick={() => navigate(-1)}>← رجوع</button>
      <h2>جرد اليومي للمحل - فرع {branchName}</h2>

      <form onSubmit={handleSubmit} className="inventory-form">
        <input
          type="text"
          placeholder="اسم الصنف"
          value={formData.product}
          onChange={(e) => setFormData({ ...formData, product: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="الكمية"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required
        />
        <button type="submit">{editIndex !== null ? 'تحديث' : 'تسجيل'}</button>
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
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.product}</td>
              <td>{item.quantity}</td>
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

export default InventoryPage;
