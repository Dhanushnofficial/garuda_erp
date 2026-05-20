import React, { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPrint, FaDownload, FaEye, FaFileInvoice } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { db } from "../../firebase/firebase";
import logo from "../../assets/Dc_logo.png";

const SDCPreview = () => {
  // =====================================
  // PARAMS & REFS
  // =====================================
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfRef = useRef();

  // =====================================
  // STATES
  // =====================================
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // =====================================
  // PRINT STYLE INJECTION
  // =====================================
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        html, body {
          width: 210mm;
          height: auto;
          background: white !important;
          overflow: visible !important;
        }
        body * {
          visibility: hidden;
        }
        #print-area, #print-area * {
          visibility: visible;
        }
        #print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 210mm;
          min-height: 297mm;
          background: white;
          margin: 0 !important;
          padding: 18px 20px !important;
          overflow: visible !important;
        }
        .print-hide {
          display: none !important;
        }
        @page {
          size: A4;
          margin: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // =====================================
  // DATA FETCHING
  // =====================================
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const docRef = doc(db, "sdcDocuments", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setData(snapshot.data());
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching SDC document:", error);
      setLoading(false);
    }
  };

  // =====================================
  // EXPORT PDF
  // =====================================
  const downloadPDF = async () => {
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 3,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data?.sdcNumber?.replace(/\//g, "-") || "SDC-Document"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // =====================================
  // WINDOW PRINT TRIGGER
  // =====================================
  const handlePrint = () => {
    window.print();
  };

  // =====================================
  // LOADING STATE SPLASH SCREEN
  // =====================================
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-[9999]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-md"></div>
          <h1 className="mt-6 text-xl font-bold text-slate-800 tracking-wide">Retrieving SDC Manifest...</h1>
          <p className="text-sm text-slate-400 mt-1">Please hold on a moment.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 ml-[250px] flex flex-col justify-center items-center px-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Manifest File Missing</h2>
        <p className="text-sm text-slate-500 mb-6 text-center max-w-lg">The Service Delivery Challan record could not be loaded. It may no longer exist or the link is invalid.</p>
        <button onClick={() => navigate("/sdc/history")} className="bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-semibold">
          Return to History
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col" style={{ marginLeft: "250px" }}>
      
      {/* STICKY UTILITY ACTIONS TOPBAR */}
      <header className="print-hide sticky top-0 z-30 bg-white/90 border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/sdc/history")}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors border border-slate-200"
            title="Return to SDC Logs"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FaFileInvoice className="text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">SDC Preview</h1>
              <p className="text-xs text-slate-500 font-medium">Service Delivery Challan: <span className="font-mono text-blue-600 font-semibold">{data?.sdcNumber}</span></p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 text-sm font-semibold transition-all active:scale-[0.98]"
          >
            <FaPrint className="text-slate-500" />
            Print Document
          </button>
          <button
            onClick={downloadPDF}
            className="bg-slate-950 hover:bg-slate-850 text-white px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 text-sm font-semibold transition-all active:scale-[0.98]"
          >
            <FaDownload />
            Download PDF
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE WINDOW */}
      <main className="p-8 flex-1 flex flex-col items-center space-y-4">
        
        {/* CONTEXT EYE-CATCHER STAMP LABEL */}
        <div className="print-hide flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider self-start max-w-[210mm] mx-auto w-full px-2">
          <FaEye />
          <span>Official Paper Dimension Print Schematic</span>
        </div>

        {/* CONTRAST BACKGROUND CANVAS CONTAINER */}
        <div className="print-hide-container bg-slate-400/40 border border-slate-300/60 p-8 rounded-[32px] w-full max-w-[250mm] flex justify-center shadow-inner overflow-x-auto">
          
          {/* STATIC PREVIEW CANVAS TARGET (A4 PAGE MOCKUP) */}
          <div
              id="print-area"
              ref={pdfRef}
              className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.18)] printable-node flex flex-col"
              style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "20px 24px",
                fontFamily: "'Times New Roman', Times, serif",
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
                      {data?.fromAddress || "—"}
                    </div>
                    <div className="mt-4">
                      <span className="font-bold block uppercase text-[10px] text-slate-400 tracking-wider">Ship To:</span>
                      <div className="whitespace-pre-line text-slate-900 font-medium pl-1 mt-0.5">
                        {data?.shipTo || "—"}
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-r border-black font-bold p-1.5 w-[22%] bg-slate-50/50">Date:</td>
                  <td className="border-b border-r border-black p-1.5 text-slate-800">{data?.date || "—"}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Challan No:</td>
                  <td className="border-b border-r border-black p-1.5 font-mono font-bold text-slate-900">{data?.sdcNumber || "—"}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Challan Type:</td>
                  <td className="border-b border-r border-black p-1.5 text-slate-800">{data?.challanType || "—"}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Invoice No:</td>
                  <td className="border-b border-r border-black p-1.5 text-slate-800">{data?.invoiceNo || "—"}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Dispatch Mode:</td>
                  <td className="border-b border-r border-black p-1.5 text-slate-800">{data?.modeOfDispatch || "—"}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Gate Pass No:</td>
                  <td className="border-b border-r border-black p-1.5 font-mono text-slate-800">{data?.gatePassNo || "—"}</td>
                </tr>
                <tr>
                  <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50/50">Transporter Name:</td>
                  <td className="border-b border-r border-black p-1.5 text-slate-800">{data?.transporterName || "—"}</td>
                </tr>
              </tbody>
            </table>


            {/* DYNAMIC PRODUCTS DESCRIPTIVE LOG MANIFEST */}
            {/* BODY CONTENT WRAPPER */}
<div className="flex flex-col flex-1">

  {/* PRODUCTS TABLE */}
  <table className="w-full border-collapse mt-4 text-[12px] table-fixed">
    <thead>
      <tr className="bg-slate-50 text-slate-900">
        <th className="border border-black p-1.5 text-center font-bold w-[8%]">
          S.No
        </th>

        <th className="border border-black p-1.5 text-left font-bold w-[62%]">
          Description of Goods
        </th>

        <th className="border border-black p-1.5 text-center font-bold w-[15%]">
          Qty
        </th>

        <th className="border border-black p-1.5 text-center font-bold w-[15%]">
          UOM
        </th>
      </tr>
    </thead>

    <tbody>
      {(data?.items || []).length > 0 ? (
        data.items.map((item, index) => (
          <tr key={index}>
            <td className="border border-black text-center py-2 align-top">
              {index + 1}
            </td>

            <td className="border border-black px-3 py-2 break-words whitespace-pre-wrap">
              {item?.description || "—"}
            </td>

            <td className="border border-black text-center py-2 align-top">
              {item?.quantity || "—"}
            </td>

            <td className="border border-black text-center py-2 align-top">
              {item?.uom || "—"}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={4}
            className="border border-black text-center py-8 text-slate-400 italic"
          >
            No Items Added
          </td>
        </tr>
      )}
    </tbody>
  </table>

  {/* AUTO PUSHER */}
  <div className="flex-1"></div>

  {/* BOTTOM SECTION */}
  <div className="grid grid-cols-2 gap-0 mt-4">

    {/* LEFT TABLE */}
    <table className="w-full border-collapse text-[11px] table-fixed">
      <tbody>
        {[
          ["Under Warranty", data?.warranty],
          ["Inward Proof", data?.inwardProof],
          ["Invoice", data?.invoice],
          ["Payment Received", data?.paymentReceived],
          ["Insurance", data?.insurance],
          ["Mail Proof", data?.mailProof],
        ].map((row, index) => (
          <tr key={index}>
            <td className="border border-black p-1.5 font-bold bg-slate-50/40 w-[60%] h-[34px]">
              {row[0]}
            </td>

            <td className="border-t border-b border-r border-black text-center h-[34px]">
              {row[1] || "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* RIGHT TABLE */}
    <table className="w-full border-collapse text-[11px] table-fixed">
      <tbody>

        <tr>
          <td className="border-t border-b border-r border-black text-center font-bold p-1 bg-slate-50/40 h-[34px]">
            Packed By
          </td>

          <td className="border-t border-b border-r border-black text-center font-bold p-1 bg-slate-50/40 h-[34px]">
            Signature
          </td>
        </tr>

        <tr>
          <td className="border-b border-r border-black text-center h-[34px]">
            {data?.packedBy || "—"}
          </td>

          <td className="border-b border-r border-black h-[34px]">
            &nbsp;
          </td>
        </tr>

        <tr>
          <td className="border-b border-r border-black text-center font-bold p-1 bg-slate-50/40 h-[34px]">
            Verified By
          </td>

          <td className="border-b border-r border-black text-center font-bold p-1 bg-slate-50/40 h-[34px]">
            Signature
          </td>
        </tr>

        <tr>
          <td className="border-b border-r border-black text-center h-[34px]">
            {data?.verifiedBy || "—"}
          </td>

          <td className="border-b border-r border-black h-[34px]">
            &nbsp;
          </td>
        </tr>

        <tr>
          <td
            colSpan="2"
            className="border-b border-r border-black text-center font-bold p-1 uppercase text-[10px] tracking-wide h-[34px]"
          >
            FOR GARUDA AEROSPACE PRIVATE LIMITED
          </td>
        </tr>

        <tr>
          <td
            colSpan="2"
            className="border-b border-r border-black text-center h-[96px] align-bottom pb-2 font-bold text-[11px] text-slate-400 tracking-wider uppercase"
          >
            AUTHORIZED SIGNATORY
          </td>
        </tr>

      </tbody>
    </table>

  </div>

</div>
            {/* LOWER FORM BLOCK CLOSURE COMPARTMENTS */}
                {/* LOWER FORM BLOCK CLOSURE COMPARTMENTS */}
           {/* LOWER FORM BLOCK CLOSURE COMPARTMENTS */}
                 </div>
        </div>

      </main>
    </div>
  );
};

export default SDCPreview;