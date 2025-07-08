import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './BranchMenu.css';

const BranchMenu = () => {
  const navigate = useNavigate();
  const { branchId } = useParams();

  const branchName = branchId === 'barkasaba' ? 'بركة السبع' : 'قويسنا';

  return (
    <div className="branch-menu-container">
      <button
        onClick={() => navigate(-1)}
        style={{
          margin: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        ← رجوع
      </button>

      <h2>فرع {branchName}</h2>

      <div className="branch-buttons">
        <button onClick={() => navigate(`/shops/${branchId}/inventory`)}>
          جرد المحلات
        </button>
        <button onClick={() => navigate(`/shops/${branchId}/orders`)}>
          الأوردر اليومي
        </button>
        <button onClick={() => navigate(`/shops/${branchId}/receive`)}>
          استلام من المصنع
        </button>
      </div>
    </div>
  );
};

export default BranchMenu;

