import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { 
  FaFileInvoice, 
  FaPlus, 
  FaTrashAlt, 
  FaFileDownload, 
  FaUserTie, 
  FaBarcode,
  FaEye
} from "react-icons/fa";
import logo from "../assets/logo_1.png";

const CreatePO = () => {
  const pdfRef = useRef();

  // =========================
  // TEMPLATE STATES
  // =========================
  const [template, setTemplate] = useState(null);
  const [shipTo, setShipTo] = useState([]);
  const [templateDate, setTemplateDate] = useState("");

  // =========================
  // DOCUMENT STATES
  // =========================
  const [poNumber, setPoNumber] = useState("");
  const [referenceNo, setReferenceNo] = useState("");

  // =========================
  // VENDOR MATRIX STATES
  // =========================
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [vendorData, setVendorData] = useState({
    vendorCompany: "",
    vendorName: "",
    vendorPhone: "",
    venderMail: "",
    vendorGST: "",
    vendorAddress: "",
  });

  // =========================
  // BATCH COMPONENTS LOG
  // =========================
  const [products, setProducts] = useState([
    {
      product: "",
      model: "",
      hsn: "",
      qty: 1,
      unitPrice: 0,
      taxableAmount: 0,
      cgstRate: 9,
      cgstAmount: 0,
      igstRate: 9,
      igstAmount: 0,
    },
  ]);

  // =========================
  // ARCHIVE RECONNAISSANCE LOOPS
  // =========================
  useEffect(() => {
    fetchTemplate();
    fetchVendors();

    const interval = setInterval(() => {
      fetchTemplate();
    }, 4000); 

    return () => clearInterval(interval);
  }, []);

  const fetchTemplate = async () => {
    try {
      const docRef = doc(db, "settings", "template");
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setTemplate(data);
        setShipTo(Array.isArray(data.shipTo) ? data.shipTo : []);
        // Format date as DD-MM-YYYY (e.g., 19-05-2026)
        const currentDate = data.poDate ? new Date(data.poDate) : new Date();
        const day = String(currentDate.getDate()).padStart(2, "0");
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const year = currentDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        setTemplateDate(formattedDate);
        generatePONumber("GA");
      }
    } catch (error) {
      console.error("Template synchronization failure:", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const snapshot = await getDocs(collection(db, "vendors"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVendors(data);
    } catch (error) {
      console.error("Vendor registry pull failure:", error);
    }
  };

  const generatePONumber = async (prefix) => {
    try {
      const snapshot = await getDocs(collection(db, "purchaseOrders"));
      const count = snapshot.docs.length + 1;
      
      // Calculate fiscal year (April to March)
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const fiscalYear = currentMonth >= 4 
        ? `${currentYear % 100}-${(currentYear + 1) % 100}` 
        : `${(currentYear - 1) % 100}-${currentYear % 100}`;
      
      setPoNumber(`${prefix}/PO/${fiscalYear}/${String(count).padStart(3, "0")}`);
    } catch (error) {
      console.error("PO number generation error:", error);
    }
  };

  const handleVendorSelect = (id) => {
    setSelectedVendorId(id);
    const vendor = vendors.find((item) => item.id === id);
    if (vendor) {
      setVendorData({
        vendorCompany: vendor.vendorCompany || "",
        vendorName: vendor.vendorName || "",
        vendorPhone: vendor.vendorPhone || "",
        venderMail: vendor.venderMail || "",
        vendorGST: vendor.vendorGST || "",
        vendorAddress: vendor.vendorAddress || "",
      });
    }
  };

  // =========================
  // OPERATIONAL ROW UTILITIES
  // =========================
  const addRow = () => {
    setProducts([
      ...products,
      {
        product: "",
        model: "",
        hsn: "",
        qty: 1,
        unitPrice: 0,
        taxableAmount: 0,
        cgstRate: 9,
        cgstAmount: 0,
        igstRate: 9,
        igstAmount: 0,
      },
    ]);
  };

  const removeRow = (index) => {
    if (products.length === 1) return;
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;

    const qty = Number(updated[index].qty || 0);
    const price = Number(updated[index].unitPrice || 0);
    const cgstRate = Number(updated[index].cgstRate || 0);
    const igstRate = Number(updated[index].igstRate || 0);

    const taxable = qty * price;
    const cgstAmount = (taxable * cgstRate) / 100;
    const igstAmount = (taxable * igstRate) / 100;

    updated[index].taxableAmount = taxable;
    updated[index].cgstAmount = cgstAmount;
    updated[index].igstAmount = igstAmount;
    setProducts(updated);
  };

  // =========================
  // FINANCIAL MATH ENGINE
  // =========================
  const subtotal = products.reduce((acc, item) => acc + Number(item.taxableAmount || 0), 0);
  const totalCGST = products.reduce((acc, item) => acc + Number(item.cgstAmount || 0), 0);
  const totalIGST = products.reduce((acc, item) => acc + Number(item.igstAmount || 0), 0);
  const grandTotal = subtotal + totalCGST + totalIGST;

  // =========================
  // EXPORT ENGINE ASSEMBLY
  // =========================
  const downloadPDF = async () => {
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${poNumber}.pdf`);

      await addDoc(collection(db, "purchaseOrders"), {
        poNumber,
        referenceNo,
        vendorData,
        products,
        subtotal,
        totalCGST,
        totalIGST,
        grandTotal,
        template,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("PDF engine compiler exception:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* CONTROL BANNER INTERACTION BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20">
              Procurement Unit
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">PO Processing Terminal</h1>
          <p className="text-slate-400 text-sm mt-0.5">Assembling system purchase manifest orders natively.</p>
        </div>
        <button
          onClick={downloadPDF}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-950/20 transition-all duration-150 flex items-center gap-2 border border-emerald-500/30 active:scale-95"
        >
          <FaFileDownload className="text-base" /> Compile & Commit Document
        </button>
      </div>

      {/* ============================================================== */}
      {/* TOP WORKSPACE LAYOUT: FORM DATA PANELS */}
      {/* ============================================================== */}
      <div className="space-y-6 mb-10">
        
        {/* VENDOR METADATA PROCESSING CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FaUserTie className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Entity Verification parameters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">Target Corporate Vendor</label>
              <select
                value={selectedVendorId}
                onChange={(e) => handleVendorSelect(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium w-full outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              >
                <option value="">Choose Supplier Registry Target</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendorCompany}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">System Reference Code</label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. REF-2026-AXIS"
                className="border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono w-full outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>
        </div>

        {/* ITEMIZATION DATA BATCH ALLOCATIONS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <div className="flex items-center gap-2">
              <FaBarcode className="text-slate-400 text-sm" />
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Batch Component Allocations</h3>
            </div>
            <button
              onClick={addRow}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-700 shadow transition-all flex items-center gap-1.5"
            >
              <FaPlus className="text-[10px]" /> Add Allocation Line
            </button>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 bg-slate-50">
                  <th className="p-2.5 pl-4">Product Variant</th>
                  <th className="p-2.5">Model Specification</th>
                  <th className="p-2.5 w-28">HSN Index</th>
                  <th className="p-2.5 w-20 text-center">Qty</th>
                  <th className="p-2.5 w-36">Rate Unit (₹)</th>
                  <th className="p-2.5 w-24 text-center">CGST %</th>
                  <th className="p-2.5 w-24 text-center">IGST %</th>
                  <th className="p-2.5 text-center pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {products.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-2 pl-4">
                      <input
                        type="text"
                        value={item.product}
                        onChange={(e) => handleChange(index, "product", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-2 py-1.5 focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.model}
                        onChange={(e) => handleChange(index, "model", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-2 py-1.5 focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.hsn}
                        onChange={(e) => handleChange(index, "hsn", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-2 py-1.5 text-center font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleChange(index, "qty", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-1.5 py-1.5 text-center font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleChange(index, "unitPrice", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-2 py-1.5 font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.cgstRate}
                        onChange={(e) => handleChange(index, "cgstRate", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-1.5 py-1.5 text-center font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.igstRate}
                        onChange={(e) => handleChange(index, "igstRate", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-1.5 py-1.5 text-center font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2 text-center pr-4">
                      <button
                        onClick={() => removeRow(index)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded bg-slate-50 hover:bg-rose-50 border border-slate-100 transition-colors"
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
      {/* BOTTOM LAYOUT WORKSPACE: LIVE PREVIEW (FIXED OVERFLOW TABLE) */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pl-2 text-slate-400">
          <FaEye className="text-sm" />
          <span className="font-bold text-xs uppercase tracking-widest">Live Dynamic Sheet Engine (A4 Emulation)</span>
        </div>
        
        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-inner overflow-x-auto flex justify-center">
          
          {/* THE ENGINE VECTOR PRINT CANVAS TARGET */}
          <div
            ref={pdfRef}
            className="bg-white shadow-2xl shrink-0 p-12 flex flex-col justify-between rounded-sm"
            style={{
              width: "210mm",
              minHeight: "297mm",
              boxSizing: "border-box",
              fontFamily: "Inter, system-ui, sans-serif"
            }}
          >
            <div>
              {/* BRANDING MANIFEST LOGO & REGISTRY HEADING LAYER */}
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-2">
                <div>
                  <img src={template?.logo || logo} alt="Brand Token Reference" className="h-25 w-auto object-contain max-w-[200px]" />
                </div>
                <div className="text-right">
                  <h2 className="text-[18px] font-black text-slate-700 tracking-tight uppercase m-0">
                    {template?.documentTitle || "DELIVERY CHALLAN"}
                  </h2>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600 font-semibold">
                    <p className=""><b className="text-slate-400 font-bold">{template?.poLabel || "DC Number"}</b> <span className="font-mono fontSmall">{poNumber}</span></p>
                    <p className=""><b className="text-slate-400 font-bold">{template?.dateLabel || "Date"}</b> <span className="font-mono fontSmall">{templateDate}</span></p>
                    <p><b className="text-slate-400 font-bold">Reference:</b> <span className="font-mono fontSmall">{referenceNo || "—"}</span></p>
                  </div>
                </div>
              </div>

              {/* ROUTING ALLOCATION CRADLES */}
              <div className="grid grid-cols-2 gap-12 mt-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-500 uppercase tracking-widest text-xs border-b-2 pb-1.5 border-slate-100">
                    {template?.shipTitle || "SOLD TO"}
                  </h4>
                  <div className="leading-relaxed font-medium text-slate-600 space-y-1">
                    <p className="font-black text-slate-900 text-lg mb-1">{vendorData.vendorCompany || "—"}</p>
                    <p className="text-slate-800">{vendorData.vendorName}</p>
                    <p className="font-mono">{vendorData.vendorPhone}</p>
                    <p>{vendorData.venderMail}</p>
                    <p className="font-mono font-bold text-slate-900 text-xs mt-1">{vendorData.vendorGST && `GSTIN: ${vendorData.vendorGST}`}</p>
                    <p className="mt-1.5 text-slate-500 italic leading-normal">{vendorData.vendorAddress}</p>
                  </div>
                </div>

                
                <div className="gap-12 text-sm">
                  
                  {/* BILLING TO */}
                  <div >
                    <h4 className="font-bold text-slate-500 uppercase tracking-widest text-xs border-b-2 pb-1.5 border-slate-100">
                      BILLING TO
                    </h4>

                    <div className="leading-relaxed font-medium text-slate-700 ">
                      <p>24,46, KB Dasan Rd, Seetammal Colony,</p>
                      <p>Lubdhi Colony, Alwarpet,</p>
                      <p>Chennai, Tamil Nadu - 600018</p>
                    </div>
                  
                  </div>

                  {/* SHIP TO */}
                  <div >
                    <h4 className="font-bold text-slate-500 uppercase tracking-widest text-xs border-b-2 pb-1.5 border-slate-100 mt-4">
                      SHIP TO
                    </h4>

                    <div className="leading-relaxed font-medium text-slate-700">
                      <p>Garuda Aerospace Private</p>
                      <p>Agni College Of Technology</p>
                      <p>Old Mahabalipuram Road</p>
                      <p>Thazhambur, Chennai - 600130</p>
                      <p>Tamil Nadu, India</p>

                      <p className="font-bold text-slate-500 pt-1">
                        GSTIN : 33AAGCG1621A1ZG
                      </p>
                    </div>
                  </div>
                </div>
            </div>

              {/* FIXED OVERFLOW TABLE CONTAINER */}
              <table className="w-full table-fixed border-collapse text-[10px] mt-10">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-left uppercase tracking-wider text-[9px]">
                    <th className="p-2 rounded-l pl-3 w-[20%]">Product</th>
                    <th className="p-2 w-[16%]">Model</th>
                    <th className="p-2 text-center w-[11%]">HSN</th>
                    <th className="p-2 text-center w-[6%]">Qty</th>
                    <th className="p-2 text-right w-[11%]">Price</th>
                    <th className="p-2 text-right w-[12%]">Taxable</th>
                    <th className="p-2 text-center w-[6%]">CGST</th>
                    <th className="p-2 text-right w-[9%]">Amt</th>
                    <th className="p-2 text-center w-[6%]">IGST</th>
                    <th className="p-2 text-right rounded-r pr-3 w-[9%]">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                  {products.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="p-2 pl-3 font-bold text-slate-900 break-words line-clamp-2">{item.product || "—"}</td>
                      <td className="p-2 break-words">{item.model || "—"}</td>
                      <td className="p-2 text-center font-mono text-slate-500">{item.hsn || "—"}</td>
                      <td className="p-2 text-center font-mono text-xs">{item.qty}</td>
                      <td className="p-2 text-right font-mono">₹{Number(item.unitPrice).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">₹{Number(item.taxableAmount).toFixed(2)}</td>
                      <td className="p-2 text-center font-mono text-slate-500">{Number(item.cgstRate).toFixed(0)}%</td>
                      <td className="p-2 text-right font-mono text-slate-600">₹{Number(item.cgstAmount).toFixed(2)}</td>
                      <td className="p-2 text-center font-mono text-slate-500">{Number(item.igstRate).toFixed(0)}%</td>
                      <td className="p-2 text-right font-mono text-slate-600 pr-3">₹{Number(item.igstAmount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              {/* BALANCE SUMMARY COMPILATION TRACKS */}
              <div className="flex justify-end mt-2 border-t-2 border-slate-100 pt-3">
                <div className="w-80 text-xs space-y-3 font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Operational Subtotal</span>
                    <span className="font-mono text-slate-900 text-sm">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total System CGST</span>
                    <span className="font-mono text-slate-700 text-sm">₹{totalCGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total System IGST</span>
                    <span className="font-mono text-slate-700 text-sm">₹{totalIGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-slate-300 pt-4 text-lg font-black text-slate-900">
                    <span>Grand Total</span>
                    <span className="font-mono text-emerald-600 text-xl">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* COMPLIANCE CLAUSES & LEGAL ATTESTATION LAYER */}
              <div className="flex justify-between items-end mt-5 pt-2 border-t border-slate-200 min-h-[120px]">
                <div className="max-w-[60%]">
                  <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-2">
                    {template?.termsTitle || "Terms & Conditions"}
                  </h5>
                  <ul className="list-disc pl-5 text-[10px] text-slate-600 space-y-1.5 leading-relaxed font-medium">
                    {template?.terms?.map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-center space-y-3">
                  {template?.signatureText && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{template.signatureText}</p>
                  )}
                  {template?.signatureImage && (
                    <img src={template.signatureImage} alt="Validation Matrix Seal" className="h-12 w-auto object-contain mx-auto" />
                  )}
                  <div className="border-t-2 border-slate-400 w-44 pt-2 text-[10px] font-bold text-slate-800 tracking-wide">
                    {template?.signatureLabel || "Authorized Signature"}
                  </div>
                </div>
              </div>

              {/* RUNTIME SYSTEM REGULATION RECONCILIATION FOOTER BLOCK */}
              <div className="mt-2 border-t border-slate-200 pt-6 text-center space-y-2 text-slate-500 text-[10px] font-semibold tracking-wide">
                <h6 className="font-bold text-slate-800 text-xs m-0 mb-1">{template?.footerTitle}</h6>
                <div className="flex justify-center  flex-wrap leading-relaxed">
                  {template?.footerDetails?.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                {template?.footerNote && <p className="text-slate-400 italic mt-1 text-[9px] font-normal">{template.footerNote}</p>}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default CreatePO;