import React, { useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { 
  FaPlus, 
  FaTrashAlt, 
  FaSave, 
  FaFileInvoice, 
  FaTruck, 
  FaBarcode,
  FaUserCheck,
  FaEye
} from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import logo from "../../../assets/Dc_logo.png";

const CreateDC = () => {
  // =========================
  // AUTOMATED IDENTIFIERS
  // =========================
  const [dcNumber, setDcNumber] = useState("");
  const [gatePassNo, setGatePassNo] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================
  // DOCUMENT FIELD DATA
  // =========================
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    invoiceDate: "",
    shipTo: "",
    pocName: "",
    gstin: "",
    modeOfDispatch: "By Hand",
    transporterName: "Self",
    gatePassNo: "",
    packedBy: "",
    packedSignature: "",
    inspectedBy: "",
    inspectedSignature: "",
    purchaseOrder: "Yes",
    estimateSheet: "-",
    invoice: "Yes",
    paymentReceived: "100% Payment Received",
  });

  // =========================
  // ALLOCATED PRODUCTS BATCH
  // =========================
  const [products, setProducts] = useState([
    {
      description: "",
      quantity: 1,
      unit: "Nos",
    },
  ]);

  // =========================
  // INITIALIZATION PIPELINE
  // =========================
  useEffect(() => {
    generateDCNumber();
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

  const generateDCNumber = async () => {
    try {
      const dcSnapshot = await getDocs(collection(db, "deliveryChallans"));
      const dcCount = dcSnapshot.docs.length + 1;
      const newDCNumber = `GA/DC/${getFiscalYear()}/${String(dcCount).padStart(3, "0")}`;
      setDcNumber(newDCNumber);

      let maxGatePass = 160;

      const evaluateMaxGatePass = (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.gatePassNo) {
            const match = data.gatePassNo.match(/\d+/);
            if (match) {
              const number = parseInt(match[0], 10);
              if (number > maxGatePass) maxGatePass = number;
            }
          }
        });
      };

      evaluateMaxGatePass(dcSnapshot);

      const rdcSnapshot = await getDocs(collection(db, "rdcDocuments"));
      evaluateMaxGatePass(rdcSnapshot);

      const sdcSnapshot = await getDocs(collection(db, "sdcDocuments"));
      evaluateMaxGatePass(sdcSnapshot);

      const nextGatePass = `D-${String(maxGatePass + 1).padStart(3, "0")}`;
      setGatePassNo(nextGatePass);

      setFormData((prev) => ({
        ...prev,
        gatePassNo: nextGatePass,
      }));
    } catch (error) {
      console.error("Automated vector calculation anomaly:", error);
    }
  };

  const handleInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addRow = () => {
    setProducts([
      ...products,
      {
        description: "",
        quantity: 1,
        unit: "Nos",
      },
    ]);
  };

  const removeRow = (index) => {
    if (products.length === 1) return;
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  // =========================================
  // SECURE NATIVE MULTI-PAGE PRINT ENGINE
  // =========================================
  const executePrintAndSave = async () => {
    try {
      setSaving(true);

      // Cache the existing tab title string
      const originalTitle = document.title;

      // Format the Challan number into a filesystem-safe filename layout
      // e.g., GA/DC/26-27/004 becomes GA-DC-26-27-004
      const safeFileName = dcNumber ? dcNumber.replace(/\//g, "-") : "Delivery-Challan";

      // Dynamically override tab title right before window initialization
      document.title = safeFileName;

      // Trigger standard system printer layout engine split
      window.print();

      // Restore original system tab title string gracefully after dialog closure
      document.title = originalTitle;

      // Commit fields directly to backend collection archive
      await addDoc(collection(db, "deliveryChallans"), {
        dcNumber,
        ...formData,
        products,
        createdAt: new Date(),
      });

      alert("System Registry Confirmed: Delivery Challan successfully committed.");
    } catch (error) {
      console.error("Database compilation fault exception:", error);
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
              <FaFileInvoice className="text-xl" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-0.5">
                Logistics Unit
              </span>
              <h1 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight">Create Delivery Challan</h1>
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
        
        {/* PANEL ROW 1: DISPATCH METRICS */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FaTruck className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Logistics Dispatch Metrics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Challan Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Invoice Number Reference</label>
              <input
                type="text"
                name="invoiceNumber"
                placeholder="Enter Invoice Index Code"
                value={formData.invoiceNumber}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Invoice Origin Date</label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Consignee Shipping Target (Ship To)</label>
            <textarea
              rows={3}
              name="shipTo"
              placeholder="Enter full geographic destination coordinates..."
              value={formData.shipTo}
              onChange={handleInput}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 h-24 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 resize-none leading-relaxed font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">POC Contact Identity</label>
              <input
                type="text"
                name="pocName"
                placeholder="Name & Contact Secure Line"
                value={formData.pocName}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Corporate GSTIN / UIN Code</label>
              <input
                type="text"
                name="gstin"
                placeholder="33AAGCG1621A1ZG"
                value={formData.gstin}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono uppercase tracking-widest outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Mode of Transit Dispatch</label>
              <select
                name="modeOfDispatch"
                value={formData.modeOfDispatch}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              >
                <option value="By Hand">By Hand</option>
                <option value="Courier">Courier</option>
                <option value="Transport">Transport</option>
                <option value="Air Cargo">Air Cargo</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Carrier Transporter Handle</label>
              <input
                type="text"
                name="transporterName"
                placeholder="Enter Transporter Corporate Name"
                value={formData.transporterName}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Gate Pass Registry Number</label>
              <input
                type="text"
                name="gatePassNo"
                placeholder="Automated Gate Code"
                value={formData.gatePassNo}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono font-bold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>
        </div>

        {/* PANEL ROW 2: ACCOUNTING VERIFICATION CHECKS */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FaUserCheck className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Compliance Registry Auditing</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Purchase Order Linked</label>
              <select
                name="purchaseOrder"
                value={formData.purchaseOrder}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Estimate Sheet Logged</label>
              <select
                name="estimateSheet"
                value={formData.estimateSheet}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              >
                <option value="-">—</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Invoice Hardcopy Attached</label>
              <select
                name="invoice"
                value={formData.invoice}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Payment Liquidity Status</label>
              <select
                name="paymentReceived"
                value={formData.paymentReceived}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              >
                <option value="100% Payment Received">100% Payment Received</option>
                <option value="Partial Payment">Partial Payment</option>
                <option value="Pending">Pending Flags</option>
                <option value="Advance Paid">Advance Paid</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Packed By Technician</label>
              <input
                type="text"
                name="packedBy"
                placeholder="Log Operator Profile Name"
                value={formData.packedBy}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Inspected By Supervisor</label>
              <input
                type="text"
                name="inspectedBy"
                placeholder="Log Auditor Profile Name"
                value={formData.inspectedBy}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>
        </div>

        {/* PANEL ROW 3: DISPATCH CARGO LIST */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <div className="flex items-center gap-2">
              <FaBarcode className="text-slate-400 text-sm" />
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Cargo Item Allocation Registry</h3>
            </div>
            <button
              onClick={addRow}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-700 shadow transition-all flex items-center gap-1.5"
            >
              <FaPlus className="text-[10px]" /> Append Cargo Item
            </button>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px] table-fixed">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 bg-slate-50">
                  <th className="p-3 pl-4 w-[60%]">Product Variant Description</th>
                  <th className="p-3 text-center w-[15%]">Quantity</th>
                  <th className="p-3 text-center w-[15%]">Unit Type</th>
                  <th className="p-3 text-center pr-4 w-[10%]">Purge Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {products.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-2 pl-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleProduct(index, "description", e.target.value)}
                        placeholder="Component description specifications..."
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleProduct(index, "quantity", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center font-mono text-sm focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleProduct(index, "unit", e.target.value)}
                        placeholder="e.g. Nos / Sets"
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2 text-center pr-4">
                      <button
                        onClick={() => removeRow(index)}
                        disabled={products.length === 1}
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
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none print:opacity-[0.02]">
              <img src={logo} alt="Watermark Master Map" className="w-[480px] object-contain" />
            </div>

            {/* DYNAMIC FLOW CONTAINER */}
            <div className="w-full flex flex-col h-full justify-between">
              
              <div>
                {/* TOP HEADER COMPONENT BLOCK */}
                <div className="flex justify-between items-start relative z-10 border-b border-slate-100 pb-4">
                  <div />
                  <img src={logo} alt="Garuda Logo Token" className="h-16 w-auto object-contain max-w-[220px]" />
                </div>

                {/* SHEET MASTER MANIFEST HEADER TITLE */}
                <h2 className="text-center text-2xl font-bold tracking-wide underline mt-4 text-slate-900">
                  DELIVERY CHALLAN
                </h2>

                {/* ROUTING SPECIFICS CELL BLOCKS METRICS */}
                <div className="mt-6 relative z-10">
                  <table className="w-full border-collapse table-fixed text-[13px] border border-slate-950">
                    <tbody>
                      <tr>
                        {/* DESTINATION SHIP TO ALLOCATION CELL BLOCK */}
                        <td className="border-r border-slate-950 p-3 align-top w-1/2 leading-relaxed">
                          <h4 className="font-bold underline uppercase tracking-wide text-xs mb-1.5 text-slate-900">Ship To Receiver:</h4>
                          <p className="whitespace-pre-line font-medium text-slate-800 break-words">{formData.shipTo || "—"}</p>
                          
                          <div className="mt-4 space-y-1 text-[12px] font-medium text-slate-700">
                            <p><b className="text-slate-900 font-bold">POC Details:</b> {formData.pocName || "—"}</p>
                            <p><b className="text-slate-900 font-bold">GSTIN/UIN:</b> <span className="font-mono uppercase tracking-wide">{formData.gstin || "—"}</span></p>
                          </div>
                        </td>

                        {/* SERIAL REFERENCE TRANSLATION CELL CODES GRID */}
                        <td className="p-0 w-1/2 align-top">
                          <table className="w-full border-collapse text-[12px] font-medium">
                            <tbody className="divide-y divide-slate-950">
                              <tr className="grid grid-cols-12 divide-x divide-slate-950">
                                <td className="col-span-5 p-2 font-bold text-slate-900 bg-slate-50/50">Challan Date</td>
                                <td className="col-span-7 p-2 font-mono text-slate-800">{formatDate(formData.date) || "—"}</td>
                              </tr>
                              <tr className="grid grid-cols-12 divide-x divide-slate-950">
                                <td className="col-span-5 p-2 font-bold text-slate-900 bg-slate-50/50">Challan No.</td>
                                <td className="col-span-7 p-2 font-mono font-bold text-slate-900">{dcNumber || "Generating..."}</td>
                              </tr>
                              <tr className="grid grid-cols-12 divide-x divide-slate-950">
                                <td className="col-span-5 p-2 font-bold text-slate-900 bg-slate-50/50">Invoice Ref No.</td>
                                <td className="col-span-7 p-2 font-mono text-slate-800">{formData.invoiceNumber || "—"}</td>
                              </tr>
                              <tr className="grid grid-cols-12 divide-x divide-slate-950">
                                <td className="col-span-5 p-2 font-bold text-slate-900 bg-slate-50/50">Invoice Date</td>
                                <td className="col-span-7 p-2 font-mono text-slate-800">{formatDate(formData.invoiceDate) || "—"}</td>
                              </tr>
                              <tr className="grid grid-cols-12 divide-x divide-slate-950">
                                <td className="col-span-5 p-2 font-bold text-slate-900 bg-slate-50/50">Transit Mode</td>
                                <td className="col-span-7 p-2 text-slate-800">{formData.modeOfDispatch || "—"}</td>
                              </tr>
                              <tr className="grid grid-cols-12 divide-x divide-slate-950">
                                <td className="col-span-5 p-2 font-bold text-slate-900 bg-slate-50/50">Carrier Handle</td>
                                <td className="col-span-7 p-2 text-slate-800 truncate">{formData.transporterName || "—"}</td>
                              </tr>
                              <tr className="grid grid-cols-12 divide-x divide-slate-950">
                                <td className="col-span-5 p-2 font-bold text-slate-900 bg-slate-50/50 border-b-0">Gate Pass No</td>
                                <td className="col-span-7 p-2 font-mono font-bold text-slate-900 border-b-0">{formData.gatePassNo || "—"}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* CARGO HARDWARE GRID MANIFEST TABLE */}
                <div className="mt-8 relative z-10">
                  <table className="w-full table-fixed border-collapse text-[13px] border border-slate-950">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-900 text-center">
                        <th className="border border-slate-950 p-2 w-[10%]">S. No</th>
                        <th className="border border-slate-950 p-2 text-left w-[65%]">Description of Systems / Goods</th>
                        <th className="border border-slate-950 p-2 w-[25%]">Allocation Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-950 font-medium text-slate-800">
                      {products.map((item, index) => (
                        <tr key={index} className="align-middle print:break-inside-avoid">
                          <td className="border border-slate-950 p-2.5 text-center font-mono">{index + 1}</td>
                          <td className="border border-slate-950 p-2.5 break-words font-bold text-slate-900">{item.description || "—"}</td>
                          <td className="border border-slate-950 p-2.5 text-center font-mono">
                            {item.quantity} <span className="font-sans text-xs text-slate-500 font-semibold">{item.unit}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DYNAMIC SYSTEM METRICS BASEMENT GRID */}
              <div className="relative z-10 space-y-8 mt-12 print:break-inside-avoid">
                <div className="grid grid-cols-2 gap-8 items-start">
                  
                  {/* ACCOUNT AUDITING LEDGER FIELDS LEFTSIDE */}
                  <div className="space-y-4">
                    <table className="w-full border-collapse text-[12px] font-medium border border-slate-950">
                      <tbody className="divide-y divide-slate-950">
                        <tr className="flex divide-x divide-slate-950">
                          <td className="p-2 font-bold text-slate-900 bg-slate-50 w-7/12">Purchase Order Verification</td>
                          <td className="p-2 text-center text-slate-800 font-bold w-5/12">{formData.purchaseOrder}</td>
                        </tr>
                        <tr className="flex divide-x divide-slate-950">
                          <td className="p-2 font-bold text-slate-900 bg-slate-50 w-7/12">Estimate Sheet Checked</td>
                          <td className="p-2 text-center text-slate-800 font-bold w-5/12">{formData.estimateSheet}</td>
                        </tr>
                        <tr className="flex divide-x divide-slate-950">
                          <td className="p-2 font-bold text-slate-900 bg-slate-50 w-7/12">Tax Invoice Accompanying</td>
                          <td className="p-2 text-center text-slate-800 font-bold w-5/12">{formData.invoice}</td>
                        </tr>
                        <tr className="flex divide-x divide-slate-950">
                          <td className="p-2 font-bold text-slate-900 bg-slate-50 w-7/12">Liquidity Payment Status</td>
                          <td className="p-2 text-center text-slate-800 font-bold text-[11px] w-5/12 truncate">{formData.paymentReceived}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* RECEIVER ATTRIBUTION CONSOLE SEAL CONTAINER */}
                    <div className="border border-slate-950 rounded-sm p-3 text-[11px] font-medium text-slate-500 leading-normal flex flex-col justify-between bg-slate-50/20 min-h-[96px]">
                      <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Consignee Receipt Acknowledgment:</p>
                      <p className="italic text-slate-400">Received by: Name / Signature / Company Stamp Seal Here</p>
                      <div className="border-t border-dashed border-slate-300 w-full pt-0.5 text-[10px] font-mono text-right">DATE STAMP MATRIX</div>
                    </div>
                  </div>

                  {/* AUTH SECURE CLEARANCE BOX BLOCKS RIGHTSIDE */}
                  <div className="space-y-4">
                    {/* Packed By Verification Block */}
                    <table className="w-full border-collapse text-[11px] font-medium border border-slate-950">
                      <tbody className="divide-y divide-slate-950">
                        <tr>
                          <td colSpan={2} className="p-1.5 font-bold text-slate-900 bg-slate-100 uppercase text-[10px] tracking-wide">Packed Operations Verify</td>
                        </tr>
                        <tr className="flex divide-x divide-slate-950">
                          <td className="p-1.5 w-4/12">Log Name</td>
                          <td className="p-1.5 w-8/12 font-bold text-slate-800">{formData.packedBy || "—"}</td>
                        </tr>
                        <tr className="flex divide-x divide-slate-950">
                          <td className="p-1.5 w-4/12 h-8 flex items-center">Signature</td>
                          <td className="p-1.5 w-8/12 h-8 font-mono text-slate-400 italic flex items-center">{formData.packedSignature || "—"}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Inspected By Verification Block */}
                    <table className="w-full border-collapse text-[11px] font-medium border border-slate-950">
                      <tbody className="divide-y divide-slate-950">
                        <tr>
                          <td colSpan={2} className="p-1.5 font-bold text-slate-900 bg-slate-100 uppercase text-[10px] tracking-wide">Quality Inspection Verify</td>
                        </tr>
                        <tr className="flex divide-x divide-slate-950">
                          <td className="p-1.5 w-4/12">Log Name</td>
                          <td className="p-1.5 w-8/12 font-bold text-slate-800">{formData.inspectedBy || "—"}</td>
                        </tr>
                        <tr className="flex divide-x divide-slate-950">
                          <td className="p-1.5 w-4/12 h-8 flex items-center">Signature</td>
                          <td className="p-1.5 w-8/12 h-8 font-mono text-slate-400 italic flex items-center">{formData.inspectedSignature || "—"}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* CORPORATE MANIFEST ATTESTATION UNDERLINE LAYER */}
                    <div className="text-right pt-1 space-y-6">
                      <p className="font-bold text-slate-900 text-xs uppercase tracking-wide">For Garuda Aerospace Private .Limited.</p>
                      <div className="text-center inline-block border-t border-slate-950 w-44 pt-0.5 text-xs font-bold text-slate-800 tracking-wide">
                        Authorized Signatory
                      </div>
                    </div>
                  </div>
                </div>

                {/* CORE BASE INFRASTRUCTURE FOOTER BLOCK BRAND LAYER */}
                <div className="border-t border-slate-300 pt-3 flex justify-between text-[9px] font-medium text-slate-500 font-sans tracking-wide leading-relaxed print:mt-16">
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

export default CreateDC;