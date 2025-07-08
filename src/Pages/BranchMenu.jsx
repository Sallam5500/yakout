import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../GlobalStyles.css';

const BranchMenu = () => {
  const navigate = useNavigate();
  const { branchId } = useParams();

  const branchName = branchId === 'barkasaba' ? 'بركة السبع' : 'قويسنا';

  return (
    <div className="factory-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ رجوع</button>

      <h2 className="page-title">🏬 فرع {branchName}</h2>

      <div className="cards-container">
        <div
          className="card"
          onClick={() => navigate(`/shops/${branchId}/inventory`)}
        >
          📋 جرد المحلات
        </div>
        <div
          className="card"
          onClick={() => navigate(`/shops/${branchId}/orders`)}
        >
          🧾 الأوردر اليومي
        </div>
        <div
          className="card"
          onClick={() => navigate(`/shops/${branchId}/receive`)}
        >
          🚚 استلام من المصنع
        </div>
      </div>
    </div>
  );
};

export default BranchMenu;
