import React from "react";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

// =========================
// SIDEBAR
// =========================

import Sidebar from "./components/Sidebar";

// =========================
// PO PAGES
// =========================

import Dashboard from "./pages/Dashboard";

import CreatePO from "./pages/CreatePO";

import History from "./pages/History";

import EditPO from "./pages/EditPO";

import TemplateSettings from "./pages/TemplateSettings";

import Vendors from "./pages/Vendors";

import POPreview from "./pages/POPreview";

import PurchaseOrderRegistry from "./pages/PurchaseOrderRegistry";

// =========================
// DC PAGES
// =========================

import CreateDC from "./pages/DC/dc/CreateDC";

import HistoryDC from "./pages/DC/dc/DCHistory";

import DCPreview from "./pages/DC/dc/DCPreview";

import EditDC from "./pages/DC/dc/EditDC";

// =========================
// CHECKLIST PAGES
// =========================

import CreateChecklist from "./pages/DC/checklist/CreateChecklist";

import ChecklistHistory from "./pages/DC/checklist/ChecklistHistory";

import ChecklistEdit from "./pages/DC/checklist/ChecklistEdit";

import ChecklistPreview from "./pages/DC/checklist/ChecklistPreview";

// =========================
// LOI / PACKING CHECKLIST
// =========================

import CreateLOI from "./pages/DC/loi/CreateLOI";

import PLHistory from "./pages/DC/loi/PLHistory";

import PLPreview from "./pages/DC/loi/PLPreview";

import EditPackingChecklist from "./pages/DC/loi/EditPackingChecklist";


import AnalyzeDC from "./pages/DC/AnalyzeDC";

//  ========================
// RDC PAGES
// =========================

import RDCCreate from "./pages/RDC/RDCCreate";

import RDCHistory from "./pages/RDC/RDCHistory";

import RDCPreview from "./pages/RDC/RDCPreview";

import EditRDC from "./pages/RDC/RDCEdit";

import AnalyzeRDC from "./pages/RDC/AnalyzeRDC";

// =========================
// SDC PAGES
// =========================

import SDCCreate from "./pages/SDC/SDCCreate";

import SDCHistory from "./pages/SDC/SDCHistory";

import SDCEdit from "./pages/SDC/SDCEdit";

import SDCPreview from "./pages/SDC/SDCPreview";

import AnalyzeSDC from "./pages/SDC/AnalyzeSDC";

// QC PAGES

import CreateQC from "./pages/QC/QCcreate";

// import QCHistory from "./pages/QC/QCHistory";
// =========================
// COMBINED EXPORT
// =========================

import CombinedDCExport from "./pages/DC/CombinedDCExport";

function App() {

  return (

    <BrowserRouter>

      <div
        style={{
          display: "flex",
        }}
      >

        {/* ========================= */}
        {/* SIDEBAR */}
        {/* ========================= */}

        <Sidebar />

        {/* ========================= */}
        {/* MAIN */}
        {/* ========================= */}

        <div className="flex-1 bg-gray-100 min-h-screen">

          <Routes>

            {/* ========================= */}
            {/* DASHBOARD */}
            {/* ========================= */}

            <Route
              path="/"
              element={<Dashboard />}
            />

            {/* ========================= */}
            {/* PO */}
            {/* ========================= */}

            <Route
              path="/create"
              element={<CreatePO />}
            />

            <Route
              path="/history"
              element={<History />}
            />

            <Route
              path="/po/edit/:id"
              element={<EditPO />}
            />

            <Route
              path="/po/preview/:id"
              element={<POPreview />}
            />

            <Route
              path="/po-registry"
              element={<PurchaseOrderRegistry />}
            />

            {/* ========================= */}
            {/* TEMPLATE */}
            {/* ========================= */}

            <Route
              path="/template-settings"
              element={<TemplateSettings />}
            />

            {/* ========================= */}
            {/* VENDORS */}
            {/* ========================= */}

            <Route
              path="/vendors"
              element={<Vendors />}
            />

            {/* ========================= */}
            {/* DELIVERY CHALLAN */}
            {/* ========================= */}

            <Route
              path="/dc/create"
              element={<CreateDC />}
            />

            <Route
              path="/dc/history"
              element={<HistoryDC />}
            />

            <Route
              path="/dc/preview/:id"
              element={<DCPreview />}
            />

            <Route
              path="/dc/edit/:id"
              element={<EditDC />}
            />

            {/* ========================= */}
            {/* CHECKLIST */}
            {/* ========================= */}

            <Route
              path="/dc/checklist"
              element={<CreateChecklist />}
            />

            <Route
              path="/dc/checklist-history"
              element={<ChecklistHistory />}
            />

            <Route
              path="/dc/checklist-edit/:id"
              element={<ChecklistEdit />}
            />

            <Route
              path="/dc/checklist-preview/:id"
              element={<ChecklistPreview />}
            />

            {/* ========================= */}
            {/* PACKING CHECKLIST */}
            {/* ========================= */}

            <Route
              path="/dc/packing-checklist"
              element={<CreateLOI />}
            />

            <Route
              path="/dc/packing-history"
              element={<PLHistory />}
            />

            <Route
              path="/dc/packing-preview/:id"
              element={<PLPreview />}
            />

            <Route
              path="/dc/packing-edit/:id"
              element={<EditPackingChecklist />}
            />

            {/* ========================= */}
            {/* COMBINED EXPORT */}
            {/* ========================= */}

            <Route
              path="/dc/combined-export"
              element={<CombinedDCExport />}
            />

            <Route
              path="/dc/analyze"
              element={<AnalyzeDC />}
            />

            {/* ========================= */}
            <Route
              path="/rdc/create"
              element={<RDCCreate />} 
            />

            <Route
              path="/rdc/history"
              element={<RDCHistory />} 
            />

            <Route
              path="/rdc/preview/:id"
              element={<RDCPreview />} 
            />

            <Route
              path="/rdc/edit/:id"
              element={<EditRDC />} 
            />

            <Route
              path="/rdc/analyze"
              element={<AnalyzeRDC />} 
            />

            {/* ========================= */}
            {/* SDC */}
            {/* ========================= */}

            <Route
              path="/sdc/create"
              element={<SDCCreate />} 
            />

            <Route
              path="/sdc/history"
              element={<SDCHistory />} 
            />

            <Route
              path="/sdc/edit/:id"
              element={<SDCEdit />} 
            />

            <Route
              path="/sdc/preview/:id"
              element={<SDCPreview />} 
            />

            <Route
              path="/sdc/analyze"
              element={<AnalyzeSDC />} 
            />

              {/* ========================= */}
              {/* QC */}
              {/* ========================= */}
              
              <Route
                path="/qc/create"
                element={<CreateQC />} 
              />

          </Routes>

        </div>

      </div>

    </BrowserRouter>

  );

}

export default App;