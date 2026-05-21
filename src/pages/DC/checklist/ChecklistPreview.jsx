import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { FaArrowLeft, FaPrint, FaEye } from "react-icons/fa";
import { db } from "../../../firebase/firebase";
import logo from "../../../assets/logo_1.png";
import logo_watermark from "../../../assets/logo_watermark.png";

const ChecklistPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // =========================
  // INITIALIZATION PIPELINE
  // =========================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "listOfItems", id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        setData({
          id: snapshot.id,
          ...snapshot.data()
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("LOI checksheet telemetry pull failure:", error);
      setLoading(false);
    }
  };

  // =========================================
  // SECURE NATIVE MULTI-PAGE PRINT ENGINE
  // =========================================
  const handlePrint = () => {
    const originalTitle = document.title;
    const safeFileName = data?.loiNumber ? data.loiNumber.replace(/\//g, "-") : "List-Of-Items";
    
    document.title = safeFileName;
    window.print();
    document.title = originalTitle;
  };

  // =========================
  // SYSTEM RUNTIME LOADING STAGE
  // =========================
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col gap-4 items-center justify-center bg-slate-950 text-white z-[9999] ml-[250px]">
        <div className="w-14 h-14 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Opening Quality Checksheet view...
        </p>
      </div>
    );
  }

  // =========================
  // NO DATA FALLBACK WRAPPER
  // =========================
  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 ml-[250px] flex flex-col justify-center items-center text-slate-500">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Manifest Index Missing</h2>
        <p className="text-sm text-slate-400 mb-6">The requested List of Items registry profile could not be resolved.</p>
        <button onClick={() => navigate("/dc/checklist-history")} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow">
          Return to History
        </button>
      </div>
    );
  }

  return (
    <>
      {/* SYSTEM BROWSER PAGE-BREAK INSTRUCTION COMPILER */}
      <style>
        {`
        @page {
          size: A4;
          margin: 10mm;
        }
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
        `}
      </style>

      <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white print:m-0 print:p-0 print:bg-white print:ml-0">
        
        {/* TACTICAL FLOATING CONTROL BANNER (HIDDEN ON PRINT) */}
        <div className="no-print-terminal flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none"></div>
          <div>
            <span className="px-2.5 py-1 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-1">
              Verification Output
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Checklist Preview Terminal</h1>
            <p className="text-slate-400 text-sm mt-1">Auditing quality assurance item records before printing execution.</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => navigate("/dc/checklist-history")}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-semibold px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <FaArrowLeft className="text-xs" /> Back
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-950/20 border border-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <FaPrint className="text-xs" /> Print Document Manifest
            </button>
          </div>
        </div>

        {/* CANVAS LAYOUT SECTION CRADLE CONTAINER */}
        <div className="space-y-4 print:p-0 print:m-0">
          <div className="no-print-terminal flex items-center gap-2 pl-2 text-slate-400">
            <FaEye className="text-sm" />
            <span className="font-bold text-xs uppercase tracking-widest">Live Dynamic Sheet Engine (Continuous Flow Layout)</span>
          </div>

          <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-inner overflow-x-auto flex justify-center print:bg-white print:p-0 print:border-none print:shadow-none">
            
            {/* REAL-TIME HARDCOPY CANVAS WORKSPACE SHEET */}
            <div
              id="print-area-target"
              ref={pageRef}
              className="bg-white shadow-2xl shrink-0 p-12 flex flex-col justify-between rounded-sm relative selection:bg-transparent print:shadow-none print:p-0"
              style={{
                width: "210mm",
                minHeight: "297mm",
                boxSizing: "border-box",
                fontFamily: "'Times New Roman', Times, serif",
                color: "#0f172a"
              }}
            >
              {/* INLINE WATERMARK LAYER BACKGROUND */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.7] pointer-events-none select-none print:opacity-[0.02]">
                <img src={logo_watermark} alt="Watermark Core Reference" className="w-[480px] object-contain" />
              </div>

              {/* DYNAMIC FLOW CONTAINER CONTROLS */}
              <div className="w-full flex flex-col h-full justify-between">
                
                <div>
                  {/* TOP HEADER COMPONENT BLOCK */}
                  <div className="flex relative z-10 border-b border-slate-100 pb-2" style={{justifyContent:'center'}}>
                    <div />
                    <img src={logo} alt="Garuda Brand Logo" className="h-16 w-auto object-contain max-w-[220px]" />
                  </div>

                  {/* SHEET MASTER MANIFEST HEADER TITLE */}
                  <h2 className="text-center text-2xl font-bold tracking-wide underline mt-4 text-slate-900">
                    LIST OF ITEMS
                  </h2>

                  {/* ROUTING SPECIFICS PARAMETERS MAP CELLS */}
                  <div className="mt-6 relative z-10">
                    <table className="w-full border-collapse table-fixed text-[13px] border border-slate-950" style={{ border: "1px solid #000" }}>
                      <tbody>
                        <tr className="flex divide-x divide-slate-950">
                          <td className="p-3 w-1/2 align-top leading-relaxed space-y-2">
                            <p className="text-slate-800 font-medium"><b className="text-slate-900 font-bold">Inspection Date:</b> {data?.date || "—"}</p>
                            <p className="text-slate-800 font-medium"><b className="text-slate-900 font-bold">Challan Number:</b> <span className="font-mono uppercase tracking-wide">{data?.challanNumber || "—"}</span></p>
                          </td>
                          <td className="p-3 w-1/2 align-top leading-relaxed space-y-2" style={{ borderLeft: "1px solid #000" }}>
                            <p className="text-slate-800 font-medium"><b className="text-slate-900 font-bold">LOI Reference No:</b> <span className="font-mono font-bold text-slate-900">{data?.loiNumber || "—"}</span></p>
                            <p className="text-slate-800 font-medium"><b className="text-slate-900 font-bold">System Status:</b> <span className="text-xs uppercase tracking-wider font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">Verified Audit</span></p>
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
                          <th className="border-b border-slate-950 p-2 w-[15%]" style={{ borderBottom: "1px solid #000" }}>SerialNumber</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-950 font-medium text-slate-800">
                        {data?.items?.map((item, index) => (
                          <tr key={index} className="align-middle print:break-inside-avoid">
                            <td className="border-r border-b border-slate-950 p-2.5 text-center font-mono" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>{index + 1}</td>
                            <td className="border-r border-b border-slate-950 p-2.5 break-words font-bold text-slate-900" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>{item?.description || "—"}</td>
                            <td className="border-r border-b border-slate-950 p-2.5 text-center font-mono" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>
                              {item?.quantity} <span className="font-sans text-xs text-slate-500 font-semibold">Nos</span>
                            </td>
                            <td className="border-r border-b border-slate-950 p-2.5 text-center font-mono" style={{ borderRight: "1px solid #000", borderBottom: "1px solid #000" }}>
                              {item?.boxes} <span className="font-sans text-xs text-slate-500 font-semibold">Boxes</span>
                            </td>
                            <td className="border-b border-slate-950 p-2.5 text-center font-mono" style={{ borderBottom: "1px solid #000" }}>{item?.serialNumber || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* DYNAMIC SYSTEM METRICS BASEMENT GRID (FORCED MULTI-PAGE BREAK PROTECTION) */}
                <div className="relative z-10 space-y-8 mt-12 print:break-inside-avoid">
                  <div className="grid grid-cols-2 gap-8 items-end">
                    
                    {/* CORPORATE BRAND MANIFEST ATTESTATION SEALS LEFTSIDE */}
                    <div className="space-y-6 pb-2">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-base uppercase tracking-wide">For Garuda Aerospace Private .</p>
                        <p className="text-xs font-medium text-slate-400 italic">Electronic Loop Validation System</p>
                      </div>
                      <div className="text-center inline-block border-t border-slate-950 w-44 pt-0.5 text-xs font-bold text-slate-800 tracking-wide" style={{ borderTop: "1px solid #000" }}>
                        Authorized Signatory
                      </div>
                    </div>

                    {/* AUTH SECURE CLEARANCE BOX BLOCKS RIGHTSIDE */}
                    <div className="space-y-4">
                      {/* Packed By Verification Block */}
                      <table className="w-full border-collapse text-[11px] font-medium border border-slate-950" style={{ border: "1px solid #000" }}>
                        <tbody className="divide-y divide-slate-950">
                          <tr style={{ borderBottom: "1px solid #000" }}>
                            <td colSpan={2} className="p-1.5 font-bold text-slate-900 bg-slate-100 uppercase text-[10px] tracking-wide">Packed Operations Verify</td>
                          </tr>
                          <tr className="flex divide-x divide-slate-950" style={{ borderBottom: "1px solid #000" }}>
                            <td className="p-1.5 w-4/12" style={{ borderRight: "1px solid #000" }}>Log Name</td>
                            <td className="p-1.5 w-8/12 font-bold text-slate-800">{data?.packedBy || "—"}</td>
                          </tr>
                          <tr className="flex divide-x divide-slate-950">
                            <td className="p-1.5 w-4/12 h-8 flex items-center" style={{ borderRight: "1px solid #000" }}>Signature</td>
                            <td className="p-1.5 w-8/12 h-8 font-mono text-slate-400 italic flex items-center">{data?.packedSignature || "—"}</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Inspected By Verification Block */}
                      <table className="w-full border-collapse text-[11px] font-medium border border-slate-950" style={{ border: "1px solid #000" }}>
                        <tbody className="divide-y divide-slate-950">
                          <tr style={{ borderBottom: "1px solid #000" }}>
                            <td colSpan={2} className="p-1.5 font-bold text-slate-900 bg-slate-100 uppercase text-[10px] tracking-wide">Quality Inspection Verify</td>
                          </tr>
                          <tr className="flex divide-x divide-slate-950" style={{ borderBottom: "1px solid #000" }}>
                            <td className="p-1.5 w-4/12" style={{ borderRight: "1px solid #000" }}>Log Name</td>
                            <td className="p-1.5 w-8/12 font-bold text-slate-800">{data?.inspectedBy || "—"}</td>
                          </tr>
                          <tr className="flex divide-x divide-slate-950">
                            <td className="p-1.5 w-4/12 h-8 flex items-center" style={{ borderRight: "1px solid #000" }}>Signature</td>
                            <td className="p-1.5 w-8/12 h-8 font-mono text-slate-400 italic flex items-center">{data?.inspectedSignature || "—"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* CORE BASE INFRASTRUCTURE FOOTER BLOCK BRAND LAYER */}
                  <div className="border-t border-slate-300 pt-3 flex justify-between text-[11px] font-medium text-slate-500 font-sans tracking-wide leading-relaxed print:mt-16" style={{ borderTop: "1px solid #cbd5e1" }}>
                    <div>
                      <p className="font-bold text-slate-800 text-xs mb-0.5">Registered Office:</p>
                      <p>Garuda Aerospace Private .</p>
                      <p>24, 46, KB Dasan Rd, Seetammal Colony,</p>
                      <p>Alwarpet, Chennai, Tamil Nadu 600018.</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs mb-0.5">Operations Center:</p>
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
    </>
  );
};

export default ChecklistPreview;