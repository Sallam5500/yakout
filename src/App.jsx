// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* الصفحات العامة */
import Login                            from "./Pages/Login";
import Home                             from "./Pages/Home";
import Store                            from "./Pages/Store";
import Factory                          from "./Pages/Factory";
import Shops                            from "./Pages/Shops";
import BranchMenu                       from "./Pages/BranchMenu";
import InventoryPage                    from "./Pages/InventoryPage";
import OrdersPage                       from "./Pages/OrdersPage";
import BranchReceive                    from "./Pages/BranchReceive";
import SeedStockData                    from "./SeedStockData";

/* المخزن الرئيسى */
import StockPage                        from "./Pages/StockPage";
import ExportPage                       from "./Pages/ExportPage";
import MainSummary                      from "./Pages/MainSummary";

/* المخازن الداخلية */
import InternalStore                    from "./Pages/InternalStore";
import StreetStore                      from "./Pages/StreetStore";
import Rooms                            from "./Pages/Rooms";
import StreetOut                        from "./Pages/StreetOut";
import RoomsOut                         from "./Pages/RoomsOut";
import StreetStockSummary               from "./Pages/StreetStockSummary";

/* المصنع المتنوع */
import Employees                        from "./Pages/Employees";
import RequiredItems                    from "./Pages/RequiredItems";
import TruckMenu                        from "./Pages/TruckMenu";
import TruckLoadingPage                 from "./Pages/TruckLoadingPage";
import IncomingGoods                    from "./Pages/IncomingGoods";

/* أوامر الإنتاج */
import OrdersMenu                       from "./Pages/OrdersMenu";
import OrdersReport                     from "./Pages/OrdersReport";
import OrderListPageTemp                from "./Pages/OrderListPageTemp"; // ★ الصفحة الموحدة

/* النظافة والصيانة */
import CleaningAndMaintenanceMain       from "./Pages/CleaningAndMaintenanceMain";
import Cleaning                         from "./Pages/Cleaning";
import MaintenanceInternal              from "./Pages/MaintenanceInternal";
import MaintenanceExternal              from "./Pages/MaintenanceExternal";

import "./GlobalStyles.css";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* تسجيل الدخول */}
        <Route path="/" element={<Login />} />

        {/* الرئيسية */}
        <Route path="/home" element={<Home />} />

        {/* المخزن الرئيسى */}
        <Route path="/store" element={<Store />} />
        <Route path="/store/stock"   element={<StockPage />} />
        <Route path="/store/exports" element={<ExportPage />} />
        <Route path="/store/summary" element={<MainSummary />} />

        {/* المصنع */}
        <Route path="/factory" element={<Factory />} />
        <Route path="/factory/internal-store" element={<InternalStore />} />

        {/* مخزن الشارع / الغرف */}
        <Route path="/internal-store/street-store" element={<StreetStore />} />
        <Route path="/internal-store/rooms"        element={<Rooms />} />
        <Route path="/internal-store/street-out"  element={<StreetOut />} />
        <Route path="/internal-store/rooms-out"   element={<RoomsOut />} />
        <Route path="/street-stock-summary"       element={<StreetStockSummary />} />

        {/* المصنع الفرعى */}
        <Route path="/factory/employees"       element={<Employees />} />
        <Route path="/factory/required-items" element={<RequiredItems />} />
        <Route path="/factory/truck-loading"   element={<TruckMenu />} />
        <Route path="/factory/truck-loading/:branch" element={<TruckLoadingPage />} />
        <Route path="/factory/incoming" element={<IncomingGoods />} />

        {/* أوامر الإنتاج */}
        <Route path="/factory/orders"            element={<OrdersMenu />} />
        <Route path="/factory/orders/report"     element={<OrdersReport />} />

        {/* أقسام الأوردرات (تستخدم الصفحة الموحدة) */}
        <Route path="/factory/orders/eastern" element={<OrderListPageTemp collectionName="orders-eastern" title="🍬 أوردرات الحلويات الشرقية" />} />
        <Route path="/factory/orders/torte"   element={<OrderListPageTemp collectionName="orders-torte"   title="🎂 أوردرات التورت" />} />
        <Route path="/factory/orders/gateau"  element={<OrderListPageTemp collectionName="orders-gateau"  title="🍰 أوردرات الجاتوه" />} />
        <Route path="/factory/orders/cuts"    element={<OrderListPageTemp collectionName="orders-cuts"    title="🔪 أوردرات التقطيعات" />} />
        <Route path="/factory/orders/mousse"  element={<OrderListPageTemp collectionName="orders-mousse"  title="🍧 أوردرات الموس" />} />
        <Route path="/factory/orders/french-mousse" element={<OrderListPageTemp collectionName="orders-french-mousse" title="🍮 أوردرات الموس الفرنسى" />} />

        {/* النظافة والصيانة */}
        <Route path="/factory/cleaning-maintenance" element={<CleaningAndMaintenanceMain />} />
        <Route path="/cleaning"              element={<Cleaning />} />
        <Route path="/maintenance-internal"  element={<MaintenanceInternal />} />
        <Route path="/maintenance-external"  element={<MaintenanceExternal />} />

        {/* المحلات */}
        <Route path="/shops" element={<Shops />} />
        <Route path="/shops/:branchId"             element={<BranchMenu />} />
        <Route path="/shops/:branchId/inventory"   element={<InventoryPage />} />
        <Route path="/shops/:branchId/orders"      element={<OrdersPage />} />
        <Route path="/shops/:branchId/receive"     element={<BranchReceive />} />

        {/* Seeder لا تزيله لو محتاجه */}
        <Route path="/seed" element={<SeedStockData />} />
      </Routes>
    </Router>
  );
}
