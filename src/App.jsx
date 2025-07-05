// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// الصفحات
import Login from './Pages/Login';
import Home from './Pages/Home';
import Store from './Pages/Store';
import Factory from './Pages/Factory';
import Shops from './Pages/Shops';
import BranchMenu from './Pages/BranchMenu';
import InventoryPage from './Pages/InventoryPage';
import OrdersPage from './Pages/OrdersPage';
import InternalStore from './Pages/InternalStore';
import StreetStore from './Pages/StreetStore';
import Rooms from './Pages/Rooms';
import Employees from './Pages/Employees';
import RequiredItems from './Pages/RequiredItems'; // ✅ صح هنا

const App = () => {
  return (
    <Router>
      <Routes>
        {/* صفحة تسجيل الدخول */}
        <Route path="/" element={<Login />} />

        {/* الصفحة الرئيسية */}
        <Route path="/home" element={<Home />} />

        {/* صفحات الأقسام */}
        <Route path="/store" element={<Store />} />
        <Route path="/factory" element={<Factory />} />

        {/* المحلات */}
        <Route path="/shops" element={<Shops />} />

        {/* المصنع */}
        <Route path="/factory/internal-store" element={<InternalStore />} />
        <Route path="/internal-store/street-store" element={<StreetStore />} />
        <Route path="/internal-store/rooms" element={<Rooms />} />
        <Route path="/factory/employees" element={<Employees />} />
        <Route path="/factory/required-items" element={<RequiredItems />} />

        {/* صفحات المحلات الفرعية */}
        <Route path="/shops/:branchId" element={<BranchMenu />} />
        <Route path="/shops/:branchId/inventory" element={<InventoryPage />} />
        <Route path="/shops/:branchId/orders" element={<OrdersPage />} />
      </Routes>
    </Router>
  );
};

export default App;