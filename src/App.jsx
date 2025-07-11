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
import RequiredItems from "./Pages/RequiredItems";
import StockPage from "./Pages/StockPage";
import ExportPage from "./Pages/ExportPage";
import TruckMenu from "./Pages/TruckMenu";
import TruckLoadingPage from "./Pages/TruckLoadingPage";
import IncomingGoods from "./Pages/IncomingGoods";
import OrdersMenu from "./Pages/OrdersMenu";
import Eastern from "./Pages/Eastern";
import Torte from "./Pages/Torte";
import Gateau from "./Pages/Gateau";
import Cuts from "./Pages/Cuts";
import Mousse from "./Pages/Mousse";
import FrenchMousse from "./Pages/FrenchMousse";
import CleaningAndMaintenanceMain from "./Pages/CleaningAndMaintenanceMain";
import Cleaning from "./Pages/Cleaning";
import MaintenanceInternal from "./Pages/MaintenanceInternal";
import MaintenanceExternal from "./Pages/MaintenanceExternal";
import RoomsOut from './Pages/RoomsOut';
import StreetOut from './Pages/StreetOut';
import BranchReceive from "./Pages/BranchReceive";
import SeedStockData from "./SeedStockData";
import './GlobalStyles.css';






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
        <Route path="/store/stock" element={<StockPage/>} />
        <Route path="/store/exports" element={<ExportPage />} />


        {/* المصنع */}
        <Route path="/factory/internal-store" element={<InternalStore />} />
        <Route path="/internal-store/street-store" element={<StreetStore />} />
        <Route path="/internal-store/rooms" element={<Rooms />} />
        <Route path="/internal-store/street-out" element={<StreetOut />} />
         <Route path="/internal-store/rooms-out" element={<RoomsOut/>} />
        <Route path="/factory/employees" element={<Employees />} />
        <Route path="/factory/required-items" element={<RequiredItems />} />
        <Route path="/factory/truck-loading" element={<TruckMenu />} />
     <Route path="/factory/truck-loading/:branch" element={<TruckLoadingPage />} />
        <Route path="/factory/incoming" element={<IncomingGoods />} />
        <Route path="/factory/orders" element={<OrdersMenu />} />
        <Route path="/factory/orders/eastern" element={<Eastern />} />
        <Route path="/factory/orders/torte" element={<Torte />} />
        <Route path="/factory/orders/gateau" element={<Gateau />} />
        <Route path="/factory/orders/cuts" element={<Cuts />} />
        <Route path="/factory/orders/mousse" element={<Mousse />} />
        <Route path="/factory/orders/french-mousse" element={<FrenchMousse />} />
        <Route path="/factory/cleaning-maintenance" element={<CleaningAndMaintenanceMain />} />
        <Route path="/cleaning" element={<Cleaning />} />
        <Route path="/maintenance-internal" element={<MaintenanceInternal />} />
        <Route path="/maintenance-external" element={<MaintenanceExternal />} />
        


        {/* صفحات المحلات الفرعية */}
        <Route path="/shops/:branchId" element={<BranchMenu />} />
        <Route path="/shops/:branchId/inventory" element={<InventoryPage />} />
        <Route path="/shops/:branchId/orders" element={<OrdersPage />} />
        <Route path="/shops/:branchId/receive" element={<BranchReceive />} />

          {/*   database */}
        <Route path="/seed" element={<SeedStockData />} />

      </Routes>
    </Router>
  );
};

export default App;