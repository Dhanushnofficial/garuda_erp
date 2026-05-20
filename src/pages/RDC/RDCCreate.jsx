import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaFileInvoice, 
  FaTruck, 
  FaUserCheck, 
  FaUserAlt,
  FaBoxOpen, 
  FaEye 
} from "react-icons/fa";

import { db } from "../../firebase/firebase";
import logo from "../../assets/Dc_logo.png";

const CreateRDC = () => {
  // =====================================
  // REF
  // =====================================
  const pdfRef = useRef();

  // =====================================
  // STATES
  // =====================================
  const [saving, setSaving] = useState(false);
  const [rdcNumber, setRdcNumber] = useState("");

  // =====================================
  // FORM DATA (Matched to your RDC Template)
  // =====================================
  const [formData, setFormData] = useState({
    rdcDate: "",
    fromAddress: "Garuda Aerospace(ops), R5XV+6VX,\nThazhambur, Tamil Nadu 600130",
    toAddress: "",
    requestBy: "",
    employeePilot: "",
    mailDate: "",
    gatePassNo: "",
    modeOfDispatch: "By Hand",
    vehicleNo: "",
    returnDate: "",
    issuedBy: "",
    checkedBy: "",
    receivedBy: "",
    qualityCheckBy: ""
  });

  // =====================================
  // DYNAMIC ITEMS (Table Rows)
  // =====================================
  const [items, setItems] = useState([
    { description: "", quantity: "", uom: "Nos" },
  ]);

  // =====================================
  // GENERATE NUMBER ON MOUNT
  // =====================================
  useEffect(() => {
    generateRDC();
  }, []);

  // =====================================
  // GENERATE RDC NUMBER + GATE PASS
  // =====================================
  const generateRDC = async () => {
    try {
      // 1. Fetch RDC Documents to calculate next RDC Number
      const rdcSnapshot = await getDocs(collection(db, "rdcDocuments"));
      const count = rdcSnapshot.docs.length + 1;
      const newRDCNumber = `GA/D/26-27/RDC/${String(count).padStart(3, "0")}`;
      setRdcNumber(newRDCNumber);

      // 2. Fetch and track maximum gate pass configuration
      let maxGatePass = 160;

      const dcSnapshot = await getDocs(collection(db, "deliveryChallans"));
      dcSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.gatePassNo) {
          const match = data.gatePassNo.match(/\d+/);
          if (match) {
            const number = parseInt(match[0]);
            if (number > maxGatePass) maxGatePass = number;
          }
        }
      });

      const sdcSnapshot = await getDocs(collection(db, "sdcDocuments"));
      sdcSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.gatePassNo) {
          const match = data.gatePassNo.match(/\d+/);
          if (match) {
            const number = parseInt(match[0]);
            if (number > maxGatePass) maxGatePass = number;
          }
        }
      });

      rdcSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.gatePassNo) {
          const match = data.gatePassNo.match(/\d+/);
          if (match) {
            const number = parseInt(match[0]);
            if (number > maxGatePass) maxGatePass = number;
          }
        }
      });

      const nextGatePass = `D-${maxGatePass + 1}`;
      setFormData((prev) => ({ ...prev, gatePassNo: nextGatePass }));
    } catch (error) {
      console.error("Error building auto numbers:", error);
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${date.getFullYear()}`;
  };

  // =====================================
  // INPUT HANDLERS
  // =====================================
  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addRow = () => {
    setItems([...items, { description: "", quantity: "", uom: "Nos" }]);
  };

  const deleteRow = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // =====================================
  // SAVE TO FIRESTORE & EXPORT
  // =====================================
  const saveRDC = async () => {
    try {
      setSaving(true);
      await addDoc(collection(db, "rdcDocuments"), {
        rdcNumber,
        ...formData,
        items,
        createdAt: new Date(),
      });

      const canvas = await html2canvas(pdfRef.current, {
        scale: 3,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${rdcNumber.replace(/\//g, "-")}.pdf`);
      alert("RDC Saved and Exported Successfully!");
    } catch (error) {
      console.error("Error processing save sequence:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#EEF2F7] min-h-screen text-slate-800 flex flex-col" style={{ marginLeft: "250px" }}>
      
      {/* ACTION TOPBAR (Matching Premium Preview Header Structure) */}
      <header className="sticky top-0 z-30 bg-white/90 border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0B1F3A] flex items-center justify-center text-white shadow-md shadow-slate-900/20">
            <FaFileInvoice className="text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B1F3A] leading-tight">Create Returnable Delivery Challan</h1>
            <p className="text-xs text-slate-500 font-medium">
              Generating Live Record: <span className="font-mono text-blue-600 font-semibold">{rdcNumber || "Calculating..."}</span>
            </p>
          </div>
        </div>
        
        <button
          onClick={saveRDC}
          disabled={saving}
          className="rounded-xl bg-[#0B1F3A] hover:bg-[#163B69] disabled:bg-slate-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all flex items-center gap-2 active:scale-[0.98]"
        >
          <FaSave className={saving ? 'animate-pulse' : ''} />
          {saving ? "Processing..." : "Save & Export PDF"}
        </button>
      </header>

      {/* CORE CONTENT LAYOUT (FULL FORM FIRST) */}
      <main className="p-8 space-y-8 max-w-[1200px] w-full mx-auto flex-1">
        
        {/* ===================================== */}
        {/* UPPER FORM BLOCKS                     */}
        {/* ===================================== */}
        
        {/* CARD 1: LOGISTICS PARAMETERS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <FaTruck className="text-[#0B1F3A] text-lg" />
            <h2 className="text-base font-bold text-[#0B1F3A]">1. Document & Dispatch Parameters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">RDC Date</label>
              <input
                type="date"
                name="rdcDate"
                value={formData.rdcDate}
                onChange={handleInput}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Gate Pass No</label>
              <input
                type="text"
                name="gatePassNo"
                value={formData.gatePassNo}
                onChange={handleInput}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition font-mono text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mode of Dispatch</label>
              <input
                type="text"
                name="modeOfDispatch"
                value={formData.modeOfDispatch}
                onChange={handleInput}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Vehicle No</label>
              <input
                type="text"
                name="vehicleNo"
                value={formData.vehicleNo}
                onChange={handleInput}
                placeholder="e.g. TN-12-AB-1234"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expected Return Date</label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInput}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: ADDRESS MANAGEMENT */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <FaUserCheck className="text-[#0B1F3A] text-lg" />
            <h2 className="text-base font-bold text-[#0B1F3A]">2. Origin & Destination Addresses</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">From Address</label>
              <textarea
                rows={3}
                name="fromAddress"
                value={formData.fromAddress}
                onChange={handleInput}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition resize-none leading-relaxed"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">To (Recipient Address)</label>
              <textarea
                rows={3}
                name="toAddress"
                value={formData.toAddress}
                onChange={handleInput}
                placeholder="Enter Recipient's Full Delivery Address with Contact Info..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        {/* CARD 3: OPERATIONAL STAFF & AUTHORIZATIONS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <FaUserAlt className="text-[#0B1F3A] text-lg" />
            <h2 className="text-base font-bold text-[#0B1F3A]">3. Operations Personnel Sign-Offs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Request By</label>
              <input
                type="text"
                name="requestBy"
                value={formData.requestBy}
                onChange={handleInput}
                placeholder="e.g. Vijay Kamesh"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Employee / Pilot</label>
              <input
                type="text"
                name="employeePilot"
                value={formData.employeePilot}
                onChange={handleInput}
                placeholder="e.g. Ahmad Raza"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mail Date Approval</label>
              <input
                type="date"
                name="mailDate"
                value={formData.mailDate}
                onChange={handleInput}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Issued By</label>
              <input
                type="text"
                name="issuedBy"
                value={formData.issuedBy}
                onChange={handleInput}
                placeholder="Officer Name"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Checked By</label>
              <input
                type="text"
                name="checkedBy"
                value={formData.checkedBy}
                onChange={handleInput}
                placeholder="Supervisor Name"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Received By</label>
              <input
                type="text"
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleInput}
                placeholder="Consignee Name"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Quality Check By</label>
              <input
                type="text"
                name="qualityCheckBy"
                value={formData.qualityCheckBy}
                onChange={handleInput}
                placeholder="QC Tech Name"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-sm outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* CARD 4: DESCRIPTION OF GOODS MATRIX MANIFEST */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <FaBoxOpen className="text-[#0B1F3A] text-lg" />
              <h2 className="text-base font-bold text-[#0B1F3A]">4. Description of Goods Manifest</h2>
            </div>
            <button
              onClick={addRow}
              className="bg-slate-100 hover:bg-slate-200 text-[#0B1F3A] border border-slate-200 px-4 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition"
            >
              <FaPlus className="text-[10px]" /> Add Item Row
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-stretch gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative group">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 sm:hidden">Description of Goods</label>
                  <input
                    type="text"
                    placeholder="e.g. Mavic 3T Drone"
                    value={item.description}
                    onChange={(e) => handleItem(index, "description", e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none transition"
                  />
                </div>
                <div className="w-full sm:w-28">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 sm:hidden">Qty</label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleItem(index, "quantity", e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none transition"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 sm:hidden">UoM</label>
                  <select
                    value={item.uom}
                    onChange={(e) => handleItem(index, "uom", e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none transition"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
                {items.length > 1 && (
                  <button
                    onClick={() => deleteRow(index)}
                    className="text-slate-400 hover:text-red-500 transition flex items-center justify-center px-1"
                    title="Remove item row"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===================================== */}
        {/* LIVE PREVIEW SECTION (BOTTOM CANVAS)   */}
        {/* ===================================== */}
        <div className="pt-6 border-t border-slate-300">
          <div className="flex items-center gap-2 text-slate-500 px-2 mb-4 text-xs font-semibold uppercase tracking-wider">
            <FaEye />
            <span>Official RDC Dimension Paper Live-View Stage</span>
          </div>

          <div className="bg-[#D1D5DB] p-8 rounded-[40px] border border-slate-300 overflow-x-auto flex justify-center shadow-inner">
            <div
              ref={pdfRef}
              className="bg-white shadow-2xl"
              style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "18px 20px",
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              {/* BRAND IMAGE BANNER CELL */}
              <div className="border border-black">
                <div className="flex justify-center py-4">
                  <img src={logo} alt="Garuda Aerospace" className="max-w-[220px] object-contain" />
                </div>
              </div>

              {/* BRAND NAME TITLE BAR HEADER */}
              <div className="border-x border-b border-black text-center font-bold text-[14px] uppercase tracking-wide py-1.5 bg-slate-50">
                Returnable Delivery Challan
              </div>

              {/* ASSIGNED ADDRESS INFRASTRUCTURE SCHEME ROW GRID */}
              <table className="w-full border-collapse text-[12px] table-fixed">
                <tbody>
                  <tr>
                    {/* FROM ZONE */}
                    <td className="border-l border-b border-r border-black align-top p-2.5 w-[50%] leading-5">
                      <span className="font-bold block uppercase text-[10px] text-slate-400 tracking-wider">FROM,</span>
                      <div className="whitespace-pre-line text-slate-900 font-medium pl-1 mt-0.5">
                        {formData.fromAddress || "—"}
                      </div>
                    </td>
                    {/* RDC NUMBER PARAMETER BLOCK */}
                    <td className="border-b border-r border-black font-bold p-1.5 w-[22%] bg-slate-50/50 align-middle">RDC No.</td>
                    <td className="border-b border-r border-black p-1.5 font-mono font-bold text-slate-900 align-middle break-all">
                      {rdcNumber || "—"}
                    </td>
                  </tr>
                  <tr>
                    {/* TO RECIPIENT ZONE */}
                    <td rowSpan="2" className="border-l border-b border-r border-black align-top p-2.5 leading-5">
                      <span className="font-bold block uppercase text-[10px] text-slate-400 tracking-wider">TO,</span>
                      <div className="whitespace-pre-line text-slate-900 font-medium pl-1 mt-0.5">
                        {formData.toAddress || "—"}
                      </div>
                    </td>
                    <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">RDC Date:</td>
                    <td className="border-b border-r border-black p-1.5 text-slate-800">{formatDate(formData.rdcDate) || "—"}</td>
                  </tr>
                  <tr>
                    <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Gate Pass No.</td>
                    <td className="border-b border-r border-black p-1.5 text-slate-800 font-mono">{formData.gatePassNo || "—"}</td>
                  </tr>
                  <tr>
                    {/* WORK REQUEST INTERNAL INFOTABLE CELL */}
                    <td className="p-0 border-l border-b border-r border-black align-top">
                      <table className="w-full border-collapse text-[11px]">
                        <tbody>
                          <tr className="border-b border-black">
                            <td className="p-1.5 font-bold w-[35%] bg-slate-50/40">Request By</td>
                            <td className="p-1.5 text-slate-900">{formData.requestBy || "—"}</td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="p-1.5 font-bold bg-slate-50/40">Employee/Pilot</td>
                            <td className="p-1.5 text-slate-900">{formData.employeePilot || "—"}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-bold bg-slate-50/40">Mail Date</td>
                            <td className="p-1.5 text-slate-900">{formatDate(formData.mailDate) || "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td className="p-0 border-b border-r border-black align-top col-span-2" colSpan="2">
                      <table className="w-full border-collapse text-[11px]">
                        <tbody>
                          <tr className="border-b border-black">
                            <td className="p-1.5 font-bold w-[44%] bg-slate-50/40">Mode of Dispatch</td>
                            <td className="p-1.5 text-slate-900">{formData.modeOfDispatch || "—"}</td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="p-1.5 font-bold bg-slate-50/40">Vehicle No</td>
                            <td className="p-1.5 text-slate-900 font-mono">{formData.vehicleNo || "—"}</td>
                          </tr>
                          <tr>
                            <td className="p-1.5 font-bold bg-slate-50/40">Return Date</td>
                            <td className="p-1.5 text-slate-900">{formatDate(formData.returnDate) || "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* CORE DYNAMIC PRODUCTS MANIFEST TABLE DATA WORKSPACE */}
              <table className="w-full border-collapse text-[12px] mt-4 table-fixed">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-black p-1.5 text-center font-bold w-[8%]">S.No</th>
                    <th className="border border-black p-1.5 text-left font-bold w-[62%]">Description of Goods</th>
                    <th className="border border-black p-1.5 text-center font-bold w-[15%]">Qty</th>
                    <th className="border border-black p-1.5 text-center font-bold w-[15%]">UoM</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-black p-1.5 text-center h-[28px] text-slate-700">{index + 1}</td>
                      <td className="border border-black p-1.5 pl-3 text-slate-900 break-words">{item.description || "—"}</td>
                      <td className="border border-black p-1.5 text-center font-medium text-slate-900">{item.quantity || "—"}</td>
                      <td className="border border-black p-1.5 text-center text-slate-600">{item.uom}</td>
                    </tr>
                  ))}
                  {/* Padding structure if items count is low to retain consistent visual layout structure height */}
                  {Array.from({
                    length: Math.max(0, 14 - items.length),
                  }).map((_, emptyIdx) => (
                    <tr key={`empty-${emptyIdx}`}>
                      <td className="border border-black h-[28px] text-center">&nbsp;</td>
                      <td className="border border-black">&nbsp;</td>
                      <td className="border border-black">&nbsp;</td>
                      <td className="border border-black">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* AUTHORIZATION PERSONNEL COMPARTMENTS SIGN BLOCK */}
              <table className="w-full border-collapse text-[11px] mt-4 table-fixed">
                <tbody>
                  <tr>
                    <td className="border border-black p-2 w-[25%] h-14 align-top">
                      <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Issued by:</span>
                      <div className="font-bold text-slate-800 text-center mt-3 truncate px-1">{formData.issuedBy}</div>
                    </td>
                    <td className="border-t border-b border-r border-black p-2 w-[25%] align-top">
                      <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Checked by:</span>
                      <div className="font-bold text-slate-800 text-center mt-3 truncate px-1">{formData.checkedBy}</div>
                    </td>
                    <td className="border-t border-b border-r border-black p-2 w-[25%] align-top">
                      <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Received by:</span>
                      <div className="font-bold text-slate-800 text-center mt-3 truncate px-1">{formData.receivedBy}</div>
                    </td>
                    <td className="border-t border-b border-r border-black p-2 w-[25%] align-top">
                      <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Quality check by:</span>
                      <div className="font-bold text-slate-800 text-center mt-3 truncate px-1">{formData.qualityCheckBy}</div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" className="border-l border-b border-r border-black p-2 h-14 align-top">
                      <span className="italic text-slate-400 text-[10px]">Notes / Special Operations Instructions:</span>
                    </td>
                    <td colSpan="2" className="border-b border-r border-black p-2 text-center align-top relative">
                      <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide">For Garuda Aerospace Private .Limited</span>
                      <div className="text-[11px] text-slate-400 mt-6 font-serif font-bold uppercase tracking-wider">Authorized Signatory</div>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default CreateRDC;