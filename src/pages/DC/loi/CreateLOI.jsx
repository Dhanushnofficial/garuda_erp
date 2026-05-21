import React, { useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import logo from "../../../assets/Dc_logo.png";
import logo_watermark from "../../../assets/logo_watermark.png";
import {
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaFileInvoice,
  FaBoxes,
  FaBarcode,
  FaEye
} from "react-icons/fa";

const CreatePackingChecklist = () => {
  // =========================
  // AUTOMATED IDENTIFIERS
  // =========================
  const [checklistNumber, setChecklistNumber] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================
  // DOCUMENT FIELD DATA
  // =========================
  const [formData, setFormData] = useState({
    dispatchDate: new Date().toISOString().split("T")[0],
    packingPerson: "",
    checkingPerson: "",
    salesSignature: "",
    customerSignature: "",
  });

  // =========================
  // ALLOCATED PRODUCTS BATCH
  // =========================
  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      boxes: 1,
      serialNumber: "",
    },
  ]);

  // =========================
  // INITIALIZATION PIPELINE
  // =========================
  useEffect(() => {
    generateNumber();
  }, []);

  const getFiscalYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    return `${String(startYear).slice(-2)}-${String(startYear + 1).slice(-2)}`;
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${date.getFullYear()}`;
  };

  const generateNumber = async () => {
    try {
      const snapshot = await getDocs(collection(db, "packingChecklist"));
      const count = snapshot.docs.length + 1;
      setChecklistNumber(`GA/PCL/${getFiscalYear()}/${String(count).padStart(3, "0")}`);
    } catch (error) {
      console.error("Automated registry index anomaly:", error);
    }
  };

  const handleInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        boxes: 1,
        serialNumber: "",
      },
    ]);
  };

  const removeRow = (index) => {
    if (items.length === 1) return;
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // =========================================
  // SECURE NATIVE MULTI-PAGE PRINT ENGINE
  // =========================================
  const executePrintAndSave = async () => {
    try {
      setSaving(true);

      // Cache the existing tab title string
      const originalTitle = document.title;

      // Format the checklist number into a filesystem-safe filename layout
      const safeFileName = checklistNumber ? checklistNumber.replace(/\//g, "-") : "Packing-Checklist";

      // Dynamically override tab title right before window initialization
      document.title = safeFileName;

      // Trigger standard system printer layout engine split
      window.print();

      // Restore original system tab title string gracefully after dialog closure
      document.title = originalTitle;

      // Commit fields directly to backend collection archive
      await addDoc(collection(db, "packingChecklist"), {
        checklistNumber,
        ...formData,
        items,
        totalItems: items.length,
        createdAt: new Date(),
      });

      alert("System Registry Confirmed: Packing Checklist successfully committed.");
    } catch (error) {
      console.error("Database connection write transaction exception:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white print:m-0 print:p-0 print:bg-white print:ml-0">
      
      {/* INJECT SYSTEM BROWSER PAGE-BREAK INSTRUCTION COMPILER */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area-target, #print-area-target * {
            visibility: visible;
          }
          #print-area-target {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print-terminal {
            display: none !important;
          }
        }
      `}</style>

      {/* TACTICAL FLOATING CONTROL BANNER (HIDDEN ON PRINT) */}
      <div className="no-print-terminal fixed top-0 left-[250px] right-0 z-20 bg-slate-900 border-b border-slate-800 shadow-xl px-6 py-5 xl:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
              <FaBoxes className="text-xl" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-0.5">
                Cargo Control Unit
              </span>
              <h1 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight">Create Packing Checklist</h1>
            </div>
          </div>
          <button
            onClick={executePrintAndSave}
            disabled={saving}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-950/20 border border-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <FaSave className="text-xs" /> {saving ? "Processing..." : "Compile & Commit Document"}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TOP WORKSPACE: DATA ENTRY WORKSTATION (HIDDEN ON PRINT) */}
      {/* ============================================================== */}
      <div className="no-print-terminal space-y-6 mb-10 pt-28">
        
        {/* PANEL ROW 1: CONTROLS SPECIFICS */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FaFileInvoice className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Manifest Parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Date of Dispatch</label>
              <input
                type="date"
                name="dispatchDate"
                value={formData.dispatchDate}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Checklist Registry Code</label>
              <input
                type="text"
                value={checklistNumber}
                readOnly
                className="w-full border border-slate-200 bg-slate-100/70 text-slate-500 rounded-xl px-4 py-3 text-sm font-mono font-bold outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Packing Technician</label>
              <input
                type="text"
                name="packingPerson"
                placeholder="Log Operator Profile Name"
                value={formData.packingPerson}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Checking Supervisor</label>
              <input
                type="text"
                name="checkingPerson"
                placeholder="Log Auditor Profile Name"
                value={formData.checkingPerson}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>
        </div>

        {/* PANEL ROW 2: ALLOCATED ITEMS TABLE LIST */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <div className="flex items-center gap-2">
              <FaBarcode className="text-slate-400 text-sm" />
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Inventory Allocations Registry</h3>
            </div>
            <button
              onClick={addRow}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-700 shadow transition-all flex items-center gap-1.5"
            >
              <FaPlus className="text-[10px]" /> Append Packing Item
            </button>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px] table-fixed">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 bg-slate-50">
                  <th className="p-3 pl-4 w-[45%]">Product Variant Description</th>
                  <th className="p-3 text-center w-[15%]">Quantity</th>
                  <th className="p-3 text-center w-[15%]">No of Boxes</th>
                  <th className="p-3 text-center w-[15%]">Serial Number</th>
                  <th className="p-3 text-center pr-4 w-[10%]">Purge Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-2 pl-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItem(index, "description", e.target.value)}
                        placeholder="Component specifications nomenclature..."
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItem(index, "quantity", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center font-mono text-sm focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.boxes}
                        onChange={(e) => handleItem(index, "boxes", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center font-mono text-sm focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.serialNumber}
                        onChange={(e) => handleItem(index, "serialNumber", e.target.value)}
                        placeholder="S/N Code Variant"
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 font-mono text-center focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2 text-center pr-4">
                      <button
                        onClick={() => removeRow(index)}
                        disabled={items.length === 1}
                        className="w-10 h-10 text-slate-400 hover:text-rose-600 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-100 flex items-center justify-center mx-auto transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM WORKSPACE: FLUID MULTI-PAGE PRINT CANVAS LAYOUT */}
      {/* ============================================================== */}
      <div className="space-y-4 print:p-0 print:m-0">
        <div className="no-print-terminal flex items-center gap-2 pl-2 text-slate-400">
          <FaEye className="text-sm" />
          <span className="font-bold text-xs uppercase tracking-widest">Live Dynamic Sheet Engine (Continuous Flow Layout)</span>
        </div>

        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-inner overflow-x-auto flex justify-center print:bg-white print:p-0 print:border-none print:shadow-none">
          <div
            id="print-area-target"
            className="bg-white shadow-2xl shrink-0 p-12 flex flex-col justify-between rounded-sm relative selection:bg-transparent print:shadow-none print:p-0"
            style={{
              width: "210mm",
              minHeight: "297mm",
              boxSizing: "border-box",
              fontFamily: "'Times New Roman', Times, serif",
              color: "#0f172a"
            }}
          >
            {/* INLINE WATERMARK LAYER CONTAINER */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.7] pointer-events-none select-none print:opacity-[0.02]">
              <img src={logo_watermark} alt="Watermark Base Reference" className="w-[480px] object-contain" />
            </div>

            {/* DYNAMIC FLOW CONTAINER */}
            <div className="w-full flex flex-col h-full justify-between">
              
              <div>
                {/* TOP HEADER COMPONENT BLOCK */}
                <div className="flex  relative z-10 border-b border-slate-100 pb-2" style={{justifyContent:'center'}}>
                  <div />
                  <img src={logo} alt="Garuda Logo Token" className="h-16 w-auto object-contain max-w-[220px]" />
                </div>

                {/* SHEET MASTER MANIFEST HEADER TITLE */}
                <h2 className="text-center text-2xl font-bold tracking-wide underline mt-4 text-slate-900">
                  PACKING CHECKLIST
                </h2>

                {/* ROUTING SPECIFICS PARAMETERS MAP CELLS */}
                <div className="mt-6 relative z-10">
                  <table className="w-full border-collapse table-fixed text-[13px] border border-slate-950" style={{ border: "1px solid #000" }}>
                    <tbody>
                      <tr className="flex divide-x divide-slate-950">
                        <td className="p-3 w-1/2 align-top leading-relaxed space-y-2">
                          <p className="text-slate-800 font-medium"><b className="text-slate-900 font-bold">Date of Dispatch:</b> {formatDate(formData.dispatchDate) || "—"}</p>
                          <p className="text-slate-800 font-medium"><b className="text-slate-900 font-bold">Challan Number:</b> <span className="font-mono uppercase tracking-wide">{formData.challanNumber || "—"}</span></p>
                        </td>
                        <td className="p-3 w-1/2 align-top leading-relaxed space-y-2" style={{ borderLeft: "1px solid #000" }}>
                          <p className="text-slate-800 font-medium"><b className="text-slate-900 font-bold">Checklist Reference No:</b> <span className="font-mono font-bold text-slate-900">{checklistNumber || "Generating..."}</span></p>
                          <p className="text-slate-800 font-medium"><b className="text-slate-900 font-bold">System Status:</b> <span className="text-xs uppercase tracking-wider font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">Active Cargo verification</span></p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ANTI-OVERFLOW SYSTEMS/GOODS LEDGER GRID TABLE */}
                <div className="mt-8 relative z-10">
                  <table className="w-full table-fixed border-collapse text-[13px] border border-slate-950" style={{ border: "1px solid #000" }}>
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-900 text-center">
                        <th className="border-r border-b border-slate-950 p-2 w-[10%]" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>S No</th>
                        <th className="border-r border-b border-slate-950 p-2 text-left w-[45%]" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>Description of Goods</th>
                        <th className="border-r border-b border-slate-950 p-2 w-[15%]" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>Quantity</th>
                        <th className="border-r border-b border-slate-950 p-2 w-[15%]" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>No of Boxes</th>
                        <th className="border-b border-slate-950 p-2 w-[15%]" style={{ borderBottom: "1px solid #000" }}>Serial Number</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-950 font-medium text-slate-800">
                      {items.map((item, index) => (
                        <tr key={index} className="align-middle print:break-inside-avoid">
                          <td className="border-r border-b border-slate-950 p-2.5 text-center font-mono" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>{index + 1}</td>
                          <td className="border-r border-b border-slate-950 p-2.5 break-words font-bold text-slate-900" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>{item.description || "—"}</td>
                          <td className="border-r border-b border-slate-950 p-2.5 text-center font-mono" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>
                            {item.quantity} <span className="font-sans text-xs text-slate-500 font-semibold">Nos</span>
                          </td>
                          <td className="border-r border-b border-slate-950 p-2.5 text-center font-mono" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>
                            {item.boxes} <span className="font-sans text-xs text-slate-500 font-semibold">Piece</span>
                          </td>
                          <td className="border-b border-slate-950 p-2.5 text-center font-mono" style={{ borderBottom: "1px solid #000" }}>{item.serialNumber || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CORPORATE VERIFICATION DISPATCH FOOTER MATRIX (FORCED MULTI-PAGE BREAK PROTECTION) */}
              <div className="relative z-10 space-y-8 mt-16 print:break-inside-avoid">
                <div>
                  <table className="w-full border-collapse text-[12px] font-medium border border-slate-950" style={{ border: "1px solid #000" }}>
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-950 text-left">
                        <th className="border-r border-b border-slate-950 p-2 w-1/4" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>Packing Operations Name & Sign</th>
                        <th className="border-r border-b border-slate-950 p-2 w-1/4" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>Quality Checking Name & Sign</th>
                        <th className="border-r border-b border-slate-950 p-2 w-1/4" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>Sales Team Verification Sign</th>
                        <th className="border-b border-slate-950 p-2 w-1/4" style={{ borderBottom: "1px solid #000" }}>Customer Acknowledgment Name & Sign</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="divide-x divide-slate-950 h-24 align-top">
                        <td className="p-2 break-words font-bold text-slate-900" style={{ borderRight: "1px solid #000" }}>{formData.packingPerson || "—"}</td>
                        <td className="p-2 break-words font-bold text-slate-900" style={{ borderRight: "1px solid #000" }}>{formData.checkingPerson || "—"}</td>
                        <td className="p-2 font-mono text-slate-400 italic" style={{ borderRight: "1px solid #000" }}>{formData.salesSignature || ""}</td>
                        <td className="p-2 font-mono text-slate-400 italic">{formData.customerSignature || ""}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* CORPORATE LEGAL UNDERLINE SEAL ATTRIBUTION */}
                <div className="flex justify-between items-end pt-2 max-w-full">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-xs uppercase tracking-wide">For Garuda Aerospace Private .</p>
                    <p className="text-[11px] font-medium text-slate-400 italic">Secure Internal Logistics System Token</p>
                  </div>
                  <div className="text-center inline-block border-t border-slate-950 w-44 pt-0.5 text-xs font-bold text-slate-800 tracking-wide" style={{ borderTop: "1px solid #000" }}>
                    Authorized Signatory
                  </div>
                </div>

                {/* CORE BASE INFRASTRUCTURE FOOTER BLOCK BRAND LAYER */}
                <div className="border-t border-slate-300 pt-3 flex justify-between text-[9px] font-medium text-slate-500 font-sans tracking-wide leading-relaxed print:mt-16" style={{ borderTop: "1px solid #cbd5e1" }}>
                  <div>
                    <p className="font-bold text-slate-800">Registered Office:</p>
                    <p>Garuda Aerospace Private .</p>
                    <p>24, 46, KB Dasan Rd, Seetammal Colony,</p>
                    <p>Alwarpet, Chennai, Tamil Nadu 600018.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Operations Center:</p>
                    <p>Agni College of Technology Campus,</p>
                    <p>OMR, Thazhambur,</p>
                    <p>Chennai, Tamil Nadu 600130.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-slate-700">+91 9707600600 | +91 7788868884</p>
                    <p>business@garudaaerospace.com</p>
                    <p>info@garudaaerospace.com</p>
                    <p className="font-mono">www.garudaaerospace.com</p>
                  </div>
                </div>
              </div>
              
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default CreatePackingChecklist;