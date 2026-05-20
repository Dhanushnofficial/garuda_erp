import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaFileInvoiceDollar, 
  FaTruck, 
  FaBuilding,
  FaUserCheck, 
  FaBoxOpen, 
  FaEye 
} from "react-icons/fa";

import { db } from "../../firebase/firebase";
import logo from "../../assets/Dc_logo.png";

const CreateSDC = () => {
  const pdfRef = useRef();
  const [saving, setSaving] = useState(false);
  const [sdcNumber, setSdcNumber] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    challanType: "Paid",
    customChallanType: "",
    gatePassNo: "",
    fromAddress: "Garuda Aerospace Limited,\nThird Floor, Agni Business Centre\nNo.24/46, K B Dasan Road,\nAlwarpet, Chennai - 600018\nCIN: U74900TN2015PTC102474\nGSTIN/UIN: 33AAGCG1621A1ZG",
    shipTo: "", 
    modeOfDispatch: "Courier",
    transporterName: "DTDC",
    invoice: "Yes",
    invoiceNo: "",
    paymentReceived: "Yes",
    inwardProof: "Yes",
    mailProof: "Yes",
    warranty: "No",
    insurance: "—",
    packedBy: "",
    verifiedBy: "",
    approvalStatus: "Pending"
  });

  const [items, setItems] = useState([
    { description: "", quantity: "", uom: "Nos" },
  ]);

  useEffect(() => {
    generateSDCNumbers();
  }, []);

  const generateSDCNumbers = async () => {
    try {
      const sdcSnapshot = await getDocs(collection(db, "sdcDocuments"));
      const count = sdcSnapshot.docs.length + 1;
      const newSDCNumber = `GA/D/25-26/SDC/${String(count).padStart(3, "0")}`;
      setSdcNumber(newSDCNumber);

      let maxGatePass = 162; 

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

      const rdcSnapshot = await getDocs(collection(db, "rdcDocuments"));
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
      console.error("Error evaluating synchronized tracking indexes:", error);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${date.getFullYear()}`;
  };

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

 const saveAndDownloadSDC = async () => {
  try {
    setSaving(true);

    const timestampStr =
      new Date().toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " UTC+5:30";

    // FINAL CHALLAN TYPE
    const finalChallanType =
      formData.challanType === "Other"
        ? formData.customChallanType.trim()
        : formData.challanType;

    // VALIDATION
    if (!finalChallanType) {
      alert("Please enter Challan Type");
      setSaving(false);
      return;
    }

    // FIREBASE SAVE
    await addDoc(collection(db, "sdcDocuments"), {
      ...formData,

      sdcNumber,

      // SAVE FINAL VALUE ONLY
      challanType: finalChallanType,

      items,

      createdAtString: timestampStr,
      serverTime: serverTimestamp(),
    });

    // PDF EXPORT
    const canvas = await html2canvas(pdfRef.current, {
      scale: 3,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    pdf.save(`${sdcNumber.replace(/\//g, "-")}.pdf`);

    alert("SDC Saved and Downloaded Successfully!");
  } catch (error) {
    console.error("Critical execution abort in save pipeline:", error);
  } finally {
    setSaving(false);
  }
};
  return (
    <div className="bg-[#EEF2F7] min-h-screen text-slate-800 flex flex-col" style={{ marginLeft: "250px" }}>
      
      {/* ACTION TOPBAR MODULE BANNER */}
      <header className="sticky top-0 z-30 bg-white/90 border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0B1F3A] flex items-center justify-center text-white shadow-md shadow-slate-900/20">
            <FaFileInvoiceDollar className="text-xl text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B1F3A] leading-tight">Create Service Delivery Challan</h1>
            <p className="text-xs text-slate-500 font-medium">
              Generating Live Record: <span className="font-mono text-blue-600 font-semibold">{sdcNumber || "Calculating..."}</span>
            </p>
          </div>
        </div>
        
        <button
          onClick={saveAndDownloadSDC}
          disabled={saving}
          className="rounded-xl bg-[#0B1F3A] hover:bg-[#163B69] disabled:bg-slate-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all flex items-center gap-2 active:scale-[0.98]"
        >
          <FaSave className={saving ? 'animate-pulse' : ''} />
          {saving ? "Processing File..." : "Save & Download PDF"}
        </button>
      </header>

      {/* CORE INPUT CONTAINER STAGE */}
      <main className="p-8 space-y-8 max-w-[1200px] w-full mx-auto flex-1">
        
        {/* CARD 1: DOCUMENT & LOGISTICS DISPATCH INTERFACES */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <FaTruck className="text-[#0B1F3A] text-lg" />
            <h2 className="text-base font-bold text-[#0B1F3A]">1. Document & Dispatch Parameters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">SDC Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInput}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Gate Pass No (Auto-Calculated)</label>
              <input
                type="text"
                name="gatePassNo"
                value={formData.gatePassNo}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 text-blue-600 font-mono rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-not-allowed"
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
            {/* Challan Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Challan Type
              </label>

              <select
                name="challanType"
                value={formData.challanType}
                onChange={handleInput}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition font-medium"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Free of Cost">Free of Cost</option>
                <option value="Replacement">Replacement</option>
                <option value="Demo">Demo</option>
                <option value="Other">Other</option>
              </select>

              {/* CUSTOM INPUT */}
              {formData.challanType === "Other" && (
                <input
                  type="text"
                  name="customChallanType"
                  placeholder="Enter Challan Type"
                  value={formData.customChallanType || ""}
                  onChange={handleInput}
                  className="w-full mt-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition font-medium"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Transporter Name</label>
              <input
                type="text"
                name="transporterName"
                value={formData.transporterName}
                onChange={handleInput}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Invoice Reference No</label>
              <input
                type="text"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleInput}
                placeholder="Leave blank if none"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: ADDRESS LOGISTICS CONTEXT FIELDS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <FaBuilding className="text-[#0B1F3A] text-lg" />
            <h2 className="text-base font-bold text-[#0B1F3A]">2. Origin & Destination Addresses</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">From Address</label>
              <textarea
                rows={4}
                name="fromAddress"
                value={formData.fromAddress}
                onChange={handleInput}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition resize-none leading-relaxed"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ship To (Recipient Address)</label>
              <textarea
                rows={4}
                name="shipTo"
                value={formData.shipTo}
                onChange={handleInput}
                placeholder="Enter Recipient's Full Delivery Address with Contact Info..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        {/* CARD 3: CARGO MANIFEST MATRIX ROW MANAGEMENT */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <FaBoxOpen className="text-[#0B1F3A] text-lg" />
              <h2 className="text-base font-bold text-[#0B1F3A]">3. Description of Goods Manifest</h2>
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
                    placeholder="e.g. DJI Drone Service / Payload Calibration"
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
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-center outline-none transition"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 sm:hidden">UoM</label>
                  <input
                    type="text"
                    placeholder="Nos"
                    value={item.uom}
                    onChange={(e) => handleItem(index, "uom", e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-center outline-none transition"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    onClick={() => deleteRow(index)}
                    className="text-slate-400 hover:text-red-500 transition flex items-center justify-center px-1"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CARD 4: OPERATIONS AUDITING & PROOF CHECK MATRIX */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <FaUserCheck className="text-[#0B1F3A] text-lg" />
            <h2 className="text-base font-bold text-[#0B1F3A]">4. Operations Verification & Checks</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Packed By</label>
              <input type="text" name="packedBy" value={formData.packedBy} onChange={handleInput} placeholder="Officer Name" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Verified By</label>
              <input type="text" name="verifiedBy" value={formData.verifiedBy} onChange={handleInput} placeholder="Supervisor Name" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Invoice Attached</label>
              <input type="text" name="invoice" value={formData.invoice} onChange={handleInput} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Payment Received</label>
              <input type="text" name="paymentReceived" value={formData.paymentReceived} onChange={handleInput} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Inward Proof</label>
              <input type="text" name="inwardProof" value={formData.inwardProof} onChange={handleInput} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mail Proof</label>
              <input type="text" name="mailProof" value={formData.mailProof} onChange={handleInput} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Under Warranty</label>
              <input type="text" name="warranty" value={formData.warranty} onChange={handleInput} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Insurance Status</label>
              <input type="text" name="insurance" value={formData.insurance} onChange={handleInput} placeholder="e.g. Covered" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MATCHED SDC PREVIEW CANVAS STAGE                          */}
        {/* ========================================================= */}
        <div className="pt-6 border-t border-slate-300">
          <div className="flex items-center gap-2 text-slate-500 px-2 mb-4 text-xs font-semibold uppercase tracking-wider">
            <FaEye />
            <span>Official Paper Dimension Print Schematic</span>
          </div>

          <div className="bg-slate-400/40 border border-slate-300/60 p-8 rounded-[32px] w-full max-w-[250mm] mx-auto flex justify-center shadow-inner overflow-x-auto">
            <div
              ref={pdfRef}
              className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
              style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "20px 24px",
                fontFamily: "'Times New Roman', Times, serif",
                display: "flex",          // Fixed layout: Enabled Flexbox positioning
                flexDirection: "column",  // Fixed layout: Linear stack flow
              }}
            >
              {/* CORPORATE BRAND LOGO BLOCK */}
              <div className="border border-black">
                <div className="flex justify-center py-4">
                  <img src={logo} alt="Garuda Aerospace" className="max-w-[220px] object-contain" />
                </div>
              </div>

              {/* CHALLAN TITLE ASSIGNMENT */}
              <div className="border-x border-b border-black text-center font-bold text-[14px] uppercase tracking-wide py-1.5 bg-slate-50">
                Service Delivery Challan
              </div>

              {/* TOP METADATA & ROUTING SUB-TABLE MATRIX */}
              <table className="w-full border-collapse text-[12px] table-fixed">
                <tbody>
                  <tr>
                    <td rowSpan="7" className="border-l border-b border-r border-black align-top p-2.5 w-[43%] leading-5">
                      <span className="font-bold block uppercase text-[10px] text-slate-400 tracking-wider">From:</span>
                      <div className="whitespace-pre-line text-slate-900 font-medium pl-1 mt-0.5">
                        {formData.fromAddress || "—"}
                      </div>
                      <div className="mt-4">
                        <span className="font-bold block uppercase text-[10px] text-slate-400 tracking-wider">Ship To:</span>
                        <div className="whitespace-pre-line text-slate-900 font-medium pl-1 mt-0.5">
                          {formData.shipTo || "—"}
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-r border-black font-bold p-1.5 w-[22%] bg-slate-50/50">Date:</td>
                    <td className="border-b border-r border-black p-1.5 text-slate-800">{formatDate(formData.date)}</td>
                  </tr>
                  <tr>
                    <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Challan No:</td>
                    <td className="border-b border-r border-black p-1.5 font-mono font-bold text-slate-900">{sdcNumber || "—"}</td>
                  </tr>
                  <tr>
                    <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Challan Type:</td>
                    <td className="border-b border-r border-black p-1.5 text-slate-800">{formData.challanType === "Other"
                      ? formData.customChallanType || "—"
                      : formData.challanType}</td>
                  </tr>
                  <tr>
                    <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Invoice No:</td>
                    <td className="border-b border-r border-black p-1.5 text-slate-800">{formData.invoiceNo || "—"}</td>
                  </tr>
                  <tr>
                    <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Dispatch Mode:</td>
                    <td className="border-b border-r border-black p-1.5 text-slate-800">{formData.modeOfDispatch || "—"}</td>
                  </tr>
                  <tr>
                    <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Gate Pass No:</td>
                    <td className="border-b border-r border-black p-1.5 font-mono text-slate-800">{formData.gatePassNo || "—"}</td>
                  </tr>
                  <tr>
                    <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Transporter Name:</td>
                    <td className="border-b border-r border-black p-1.5 text-slate-800">{formData.transporterName || "—"}</td>
                  </tr>
                </tbody>
              </table>

              {/* DYNAMIC PRODUCTS DESCRIPTIVE LOG MANIFEST */}
              <table className="w-full border-collapse mt-4 text-[12px] table-fixed">
                <thead>
                  <tr className="bg-slate-50 text-slate-900">
                    <th className="border border-black p-1.5 text-center font-bold w-[8%]">S.No</th>
                    <th className="border border-black p-1.5 text-left font-bold w-[62%]">Description of Goods</th>
                    <th className="border border-black p-1.5 text-center font-bold w-[15%]">Qty</th>
                    <th className="border border-black p-1.5 text-center font-bold w-[15%]">UOM</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-black text-center h-[28px] text-slate-700">{index + 1}</td>
                      <td className="border border-black pl-3 text-slate-900 break-words">{item.description || "—"}</td>
                      <td className="border border-black text-center font-medium text-slate-900">{item.quantity || "—"}</td>
                      <td className="border border-black text-center text-slate-600">{item.uom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* LOWER SIGNATURES BLOCK - STAYS SOLID ON BOTTOM LAYOUT PATH */}
              <div className="grid grid-cols-2 gap-0 mt-4" style={{ marginTop: "auto" }}>
                
                {/* LOWER LEFT COMPARTMENT: REGULATORY VERIFICATION METRICS */}
                <table className="w-full border-collapse text-[11px] table-fixed">
                  <tbody>
                    {[
                      ["Under Warranty", formData.warranty],
                      ["Inward Proof", formData.inwardProof],
                      ["Invoice", formData.invoice],
                      ["Payment Received", formData.paymentReceived],
                      ["Insurance", formData.insurance],
                      ["Mail Proof", formData.mailProof],
                    ].map((row, index) => (
                      <tr key={index}>
                        <td className="border border-black p-1.5 font-bold bg-slate-50/40 w-[60%]">{row[0]}</td>
                        <td className="border-t border-b border-r border-black text-center font-medium text-slate-800">{row[1] || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* LOWER RIGHT COMPARTMENT: INTERNAL STAFF SIGN-OFF WORKSPACES */}
                <table className="w-full border-collapse text-[11px] table-fixed">
                  <tbody>
                    <tr>
                      <td className="border-t border-b border-r border-black text-center font-bold p-1 bg-slate-50/40 w-[50%]">Packed By</td>
                      <td className="border-t border-b border-r border-black text-center font-bold p-1 bg-slate-50/40 w-[50%]">Signature</td>
                    </tr>
                    <tr>
                      <td className="border-b border-r border-black text-center font-medium text-slate-900 h-[38px] px-1 truncate">
                        {formData.packedBy || "—"}
                      </td>
                      <td className="border-b border-r border-black">&nbsp;</td>
                    </tr>
                    <tr>
                      <td className="border-b border-r border-black text-center font-bold p-1 bg-slate-50/40">Verified By</td>
                      <td className="border-b border-r border-black text-center font-bold p-1 bg-slate-50/40">Signature</td>
                    </tr>
                    <tr>
                      <td className="border-b border-r border-black text-center font-medium text-slate-900 h-[38px] px-1 truncate">
                        {formData.verifiedBy || "—"}
                      </td>
                      <td className="border-b border-r border-black">&nbsp;</td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="border-b border-r border-black text-center font-bold p-1 uppercase text-[10px] tracking-wide">
                        For Garuda Aerospace Private Limited
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="border-b border-r border-black text-center h-[65px] align-bottom pb-2 font-bold text-[11px] text-slate-400 tracking-wider uppercase">
                        Authorized Signatory
                      </td>
                    </tr>
                  </tbody>
                </table>

              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default CreateSDC;