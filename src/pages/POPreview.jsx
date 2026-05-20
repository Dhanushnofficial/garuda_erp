import React, { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPrint, FaEye } from "react-icons/fa";
import { db } from "../firebase/firebase";
import logo from "../assets/logo_1.png";

const POPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================
  // FETCH MANIFEST RECONNAISSANCE
  // =========================================
  useEffect(() => {
    const fetchPO = async () => {
      try {
        setLoading(true);
        // 🎯 FIXED: Corrected target collection routing to purchaseOrders
        const docRef = doc(db, "purchaseOrders", id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setPoData({
            ...data,
            vendorCompany: data.vendorData?.vendorCompany || "—",
            vendorName: data.vendorData?.vendorName || data.vendorName || "",
            vendorPhone: data.vendorData?.vendorPhone || data.vendorPhone || "",
            vendorMail: data.vendorData?.venderMail || data.vendorData?.vendorEmail || data.vendorEmail || "",
            vendorGST: data.vendorData?.vendorGST || data.vendorGST || "",
            vendorAddress: data.vendorData?.vendorAddress || data.vendorAddress || "",
          });
        }
      } catch (error) {
        console.error("Document fetching failure:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPO();
    }
  }, [id]);

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${date.getFullYear()}`;
  };

  // =========================================
  // PRINT PLATFORM ENGINE
  // =========================================
  const handlePrint = () => {
    window.print();
  };

  // =========================================
  // LOADING UTILITY STATES
  // =========================================
  if (loading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-slate-950 text-white ml-[250px]">
        <div className="w-14 h-14 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Retrieving Airframe Archive...
        </p>
      </div>
    );
  }

  if (!poData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 ml-[250px] text-slate-500">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Manifest File Missing</h2>
        <p className="text-sm text-slate-400 mb-6">The requested Purchase Order database mapping index could not be resolved.</p>
        <button onClick={() => navigate("/history")} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-semibold">
          Return to History
        </button>
      </div>
    );
  }

  const templateConfig = poData.template || {};
  const shipToLines = Array.isArray(templateConfig.shipTo) ? templateConfig.shipTo : [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white print:m-0 print:p-0 print:bg-white">
      
      {/* INJECT MEDIA PRINTER INSTRUCTION COMPILER TARGET */}
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
            width: 210mm;
            min-height: 297mm;
            padding: 12mm !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
          .no-print-terminal {
            display: none !important;
          }
        }
      `}</style>

      {/* TOP CONTROL TERMINAL INTERACTION BAR */}
      <div className="no-print-terminal flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none"></div>
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-1">
            Verification Output
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Order Verification View</h1>
          <p className="text-slate-400 text-sm mt-0.5">Auditing internal purchasing ledger values before printing execution.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => navigate("/history")}
            className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-sm font-semibold px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-950/20 border border-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <FaPrint /> Print Document Manifest
          </button>
        </div>
      </div>

      {/* CANVAS SECTION CRADLE LAYER */}
      <div className="space-y-4">
        <div className="no-print-terminal flex items-center gap-2 pl-2 text-slate-400">
          <FaEye className="text-sm" />
          <span className="font-bold text-xs uppercase tracking-widest">Live Dynamic Sheet Engine (A4 Emulation)</span>
        </div>

        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-inner overflow-x-auto flex justify-center print:p-0 print:bg-white print:border-none">
          
          {/* THE ENGINE VECTOR PRINT CANVAS TARGET */}
          <div
            id="print-area-target"
            ref={printRef}
            className="bg-white shadow-2xl shrink-0 p-12 flex flex-col justify-between rounded-sm print:shadow-none"
            style={{
              width: "210mm",
              minHeight: "297mm",
              boxSizing: "border-box",
              fontFamily: "Inter, system-ui, sans-serif"
            }}
          >
            <div>
              {/* BRANDING MANIFEST LOGO & REGISTRY HEADING LAYER */}
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-4">
                <div>
                  <img src={templateConfig.logo || logo} alt="Brand Token Reference" className="h-28 w-auto object-contain max-w-[200px]" />
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-black text-slate-700 tracking-tight uppercase m-0">
                    {templateConfig.documentTitle || "PURCHASE ORDER"}
                  </h2>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600 font-semibold">
                    <p><b className="text-slate-400 font-bold">{templateConfig.poLabel || "PO Number"}</b> <span className="font-mono text-xs">{poData.poNumber}</span></p>
                    <p><b className="text-slate-400 font-bold">{templateConfig.dateLabel || "Date"}</b> <span className="font-mono text-xs">{poData.templateDate || (poData.createdAt?.seconds ? formatDate(new Date(poData.createdAt.seconds * 1000).toISOString()) : "—")}</span></p>
                    <p><b className="text-slate-400 font-bold">Reference:</b> <span className="font-mono text-xs">{poData.referenceNo || "—"}</span></p>
                  </div>
                </div>
              </div>

              {/* ROUTING ALLOCATION CRADLES */}
              <div className="grid grid-cols-2 gap-12 mt-8 text-sm">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-500 uppercase tracking-widest text-xs border-b-2 pb-1.5 border-slate-100">
                    {templateConfig.soldToTitle || "SOLD TO"}
                  </h4>
                  <div className="leading-relaxed font-medium text-slate-600 space-y-1">
                    <p className="font-black text-slate-900 text-lg mb-1">{poData.vendorCompany || "—"}</p>
                    <p className="text-slate-800">{poData.vendorName}</p>
                    <p className="font-mono">{poData.vendorPhone}</p>
                    <p>{poData.vendorMail}</p>
                    <p className="font-mono font-bold text-slate-900 text-xs mt-1">{poData.vendorGST && `GSTIN: ${poData.vendorGST}`}</p>
                    <p className="mt-1.5 text-slate-500 italic leading-normal">{poData.vendorAddress}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-500 uppercase tracking-widest text-xs border-b-2 pb-1.5 border-slate-100">
                    {templateConfig.shipTitle || "SHIP TO"}
                  </h4>
                  <div className="leading-relaxed font-medium text-slate-800 space-y-1">
                    {shipToLines.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* FIXED BOUNDED GRID ARCHITECTURE TABLE */}
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
                  {poData.products?.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="p-2 pl-3 font-bold text-slate-900 break-words line-clamp-2">{item.product || "—"}</td>
                      <td className="p-2 break-words">{item.model || "—"}</td>
                      <td className="p-2 text-center font-mono text-slate-500">{item.hsn || "—"}</td>
                      <td className="p-2 text-center font-mono text-xs">{item.qty}</td>
                      <td className="p-2 text-right font-mono">₹{Number(item.unitPrice || 0).toFixed(2)}</td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">₹{Number(item.taxableAmount || 0).toFixed(2)}</td>
                      <td className="p-2 text-center font-mono text-slate-500">{Number(item.cgstRate || 0).toFixed(0)}%</td>
                      <td className="p-2 text-right font-mono text-slate-600">₹{Number(item.cgstAmount || 0).toFixed(2)}</td>
                      <td className="p-2 text-center font-mono text-slate-500">{Number(item.igstRate || 0).toFixed(0)}%</td>
                      <td className="p-2 text-right font-mono text-slate-600 pr-3">₹{Number(item.igstAmount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              {/* BALANCE SUMMARY COMPILATION TRACKS */}
              <div className="flex justify-end mt-2 border-t-2 border-slate-100 pt-6">
                <div className="w-80 text-xs space-y-3 font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Operational Subtotal</span>
                    <span className="font-mono text-slate-900 text-sm">₹{Number(poData.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total System CGST</span>
                    <span className="font-mono text-slate-700 text-sm">₹{Number(poData.totalCGST || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total System IGST</span>
                    <span className="font-mono text-slate-700 text-sm">₹{Number(poData.totalIGST || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-slate-300 pt-4 text-lg font-black text-slate-900">
                    <span>Grand Total</span>
                    <span className="font-mono text-emerald-600 text-xl">₹{Number(poData.grandTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* COMPLIANCE CLAUSES & LEGAL ATTESTATION LAYER */}
              <div className="flex justify-between items-end mt-3 pt-6 border-t border-slate-200 min-h-[120px]">
                <div className="max-w-[60%]">
                  <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-2">
                    {templateConfig.termsTitle || "Terms & Conditions"}
                  </h5>
                  <ul className="list-disc pl-5 text-[10px] text-slate-600 space-y-1.5 leading-relaxed font-medium">
                    {templateConfig.terms?.map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-center space-y-3">
                  {templateConfig.signatureText && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{templateConfig.signatureText}</p>
                  )}
                  {templateConfig.signatureImage && (
                    <img src={templateConfig.signatureImage} alt="Validation Matrix Seal" className="h-12 w-auto object-contain mx-auto" />
                  )}
                  <div className="border-t-2 border-slate-400 w-44 pt-2 text-[10px] font-bold text-slate-800 tracking-wide">
                    {templateConfig.signatureLabel || "Authorized Signature"}
                  </div>
                </div>
              </div>

              {/* RUNTIME SYSTEM REGULATION RECONCILIATION FOOTER BLOCK */}
              <div className="mt-2 border-t border-slate-200 pt-2 text-center space-y-2 text-slate-500 text-[10px] font-semibold tracking-wide">
                <h6 className="font-bold text-slate-800 text-xs m-0 mb-1">{templateConfig.footerTitle}</h6>
                <div className="flex justify-center flex-wrap leading-relaxed">
                  {templateConfig.footerDetails?.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                {templateConfig.footerNote && <p className="text-slate-400 italic mt-1 text-[9px] font-normal">{templateConfig.footerNote}</p>}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default POPreview;