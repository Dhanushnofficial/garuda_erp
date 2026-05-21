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
  // FETCH PO DATA
  // =========================================
  useEffect(() => {
    const fetchPO = async () => {
      try {
        setLoading(true);

        const docRef = doc(db, "purchaseOrders", id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();

          setPoData({
            ...data,
            vendorCompany: data.vendorData?.vendorCompany || "—",
            vendorName: data.vendorData?.vendorName || "",
            vendorPhone: data.vendorData?.vendorPhone || "",
            vendorMail: data.vendorData?.venderMail || "",
            vendorGST: data.vendorData?.vendorGST || "",
            vendorAddress: data.vendorData?.vendorAddress || "",
          });
        }
      } catch (error) {
        console.error("PO Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPO();
    }
  }, [id]);

  // =========================================
  // FORMAT DATE
  // =========================================
  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${day}-${month}-${date.getFullYear()}`;
  };

  // =========================================
  // PRINT
  // =========================================
  const handlePrint = () => {
    window.print();
  };

  // =========================================
  // LOADING
  // =========================================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 ml-[250px]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="text-slate-300 mt-4 font-semibold tracking-widest text-sm uppercase">
            Loading Purchase Order...
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // NO DATA
  // =========================================
  if (!poData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100 ml-[250px]">
        <h2 className="text-2xl font-bold text-slate-800">
          Purchase Order Not Found
        </h2>

        <button
          onClick={() => navigate("/history")}
          className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased print:bg-white print:p-0">

      {/* PRINT CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #print-area,
          #print-area * {
            visibility: visible;
          }

          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 12mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">

        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px]"></div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20">
              Verification Output
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Order Verification View
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Auditing internal purchasing ledger values before printing execution.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() => navigate("/history")}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <FaArrowLeft />
            Back
          </button>

          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <FaPrint />
            Print Document Manifest
          </button>

        </div>
      </div>

      {/* PREVIEW */}
      <div className="space-y-4">

        <div className="no-print flex items-center gap-2 pl-2 text-slate-400">
          <FaEye className="text-sm" />

          <span className="font-bold text-xs uppercase tracking-widest">
            Live Dynamic Sheet Engine (A4 Emulation)
          </span>
        </div>

        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-inner overflow-x-auto flex justify-center print:p-0 print:bg-white">

          {/* PDF AREA */}
          <div
            id="print-area"
            ref={printRef}
            className="bg-white shadow-2xl shrink-0 p-12 rounded-sm flex flex-col justify-between print:shadow-none"
            style={{
              width: "210mm",
              minHeight: "297mm",
              boxSizing: "border-box",
              fontFamily: "Inter, sans-serif",
            }}
          >

            {/* TOP SECTION */}
            <div>

              {/* HEADER */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">

                <div>
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-24 object-contain"
                  />
                </div>

                <div className="text-right">

                  <h2 className="text-[18px] leading-none font-black text-slate-700 uppercase">
                    PURCHASE ORDER
                  </h2>

                  <div className="mt-4 space-y-1 text-[13px] font-semibold text-slate-600">

                    <p>
                      <span className="text-slate-400">
                        PO Number:
                      </span>{" "}
                      <span className="font-mono">
                        {poData.poNumber}
                      </span>
                    </p>

                    <p>
                      <span className="text-slate-400">
                        Date:
                      </span>{" "}
                      <span className="font-mono">
                        {poData.createdAt?.seconds
                          ? formatDate(
                              new Date(
                                poData.createdAt.seconds * 1000
                              ).toISOString()
                            )
                          : "—"}
                      </span>
                    </p>

                    <p>
                      <span className="text-slate-400">
                        Reference:
                      </span>{" "}
                      <span className="font-mono">
                        {poData.referenceNo || "—"}
                      </span>
                    </p>

                  </div>

                </div>

              </div>

              {/* ADDRESS SECTION */}
              <div className="grid grid-cols-2 gap-16 mt-6 text-[14px]">

                {/* VENDOR */}
                <div>

                  <h4 className="font-bold text-slate-500 uppercase tracking-[3px] text-[13px] border-b border-slate-200 pb-2">
                    VENDOR DETAILS
                  </h4>

                  <div className="leading-6 text-slate-700">

                    <p className="text-[16px] font-black text-slate-900 leading-8 mb-3">
                      {poData.vendorCompany || "—"}
                    </p>

                    <p>{poData.vendorName}</p>

                    <p>{poData.vendorPhone}</p>

                    <p>{poData.vendorMail}</p>

                    <p className="font-bold">
                      GSTIN: {poData.vendorGST}
                    </p>

                    <p className="italic text-slate-500 leading-6 mt-1">
                      {poData.vendorAddress}
                    </p>

                  </div>

                </div>

                {/* RIGHT SIDE */}
                <div >

                  {/* BILLING */}
                  <div>

                    <h4 className="font-bold text-slate-500 uppercase tracking-[3px] text-[13px] border-b border-slate-200 pb-2 ">
                      BILLING TO
                    </h4>

                    <div className="leading-7 text-slate-700">

                      <p>
                        24,46, KB Dasan Rd, Seetammal Colony,
                      </p>

                      <p>
                        Lubdhi Colony, Alwarpet,
                      </p>

                      <p>
                        Chennai, Tamil Nadu - 600018
                      </p>

                    </div>

                  </div>

                  {/* SHIP */}
                  <div>

                    <h4 className="font-bold text-slate-500 uppercase tracking-[3px] text-[12px] border-b border-slate-200 pb-2 mt-4">
                      SHIP TO
                    </h4>

                    <div className="leading-7 text-slate-700">

                      <p>Garuda Aerospace Private</p>

                      <p>Agni College Of Technology</p>

                      <p>Old Mahabalipuram Road</p>

                      <p>Thazhambur, Chennai - 600130</p>

                      <p>Tamil Nadu, India</p>

                      <p className="font-bold">
                        GSTIN : 33AAGCG1621A1ZG
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* TABLE */}
              <table className="w-full mt-10 border-collapse table-fixed">

                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">

                    <th className="p-3 text-left w-[22%]">
                      Product
                    </th>

                    <th className="p-3 text-left w-[17%]">
                      Model
                    </th>

                    <th className="p-3 text-center w-[10%]">
                      HSN
                    </th>

                    <th className="p-3 text-center w-[7%]">
                      Qty
                    </th>

                    <th className="p-3 text-right w-[11%]">
                      Price
                    </th>

                    <th className="p-3 text-right w-[12%]">
                      Taxable
                    </th>

                    <th className="p-3 text-center w-[7%]">
                      CGST
                    </th>

                    <th className="p-3 text-right w-[10%]">
                      Amt
                    </th>

                    <th className="p-3 text-center w-[7%]">
                      IGST
                    </th>

                    <th className="p-3 text-right w-[10%]">
                      Amt
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-[13px] text-slate-700">

                  {poData.products?.map((item, index) => (
                    <tr key={index}>

                      <td className="p-3 font-bold text-slate-900 leading-6">
                        {item.product || "—"}
                      </td>

                      <td className="p-3 leading-6">
                        {item.model || "—"}
                      </td>

                      <td className="p-3 text-center">
                        {item.hsn || "—"}
                      </td>

                      <td className="p-3 text-center">
                        {item.qty}
                      </td>

                      <td className="p-3 text-right">
                        ₹{Number(item.unitPrice || 0).toFixed(2)}
                      </td>

                      <td className="p-3 text-right font-bold">
                        ₹{Number(item.taxableAmount || 0).toFixed(2)}
                      </td>

                      <td className="p-3 text-center">
                        {item.cgstRate || 0}%
                      </td>

                      <td className="p-3 text-right">
                        ₹{Number(item.cgstAmount || 0).toFixed(2)}
                      </td>

                      <td className="p-3 text-center">
                        {item.igstRate || 0}%
                      </td>

                      <td className="p-3 text-right">
                        ₹{Number(item.igstAmount || 0).toFixed(2)}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            {/* FOOTER */}
            <div>

              {/* TOTALS */}
              <div className="flex justify-end mt-3 border-t border-slate-200 pt-6">

                <div className="w-[340px] space-y-2 text-[15px] font-semibold text-slate-700">

                  <div className="flex justify-between">
                    <span>Operational Subtotal</span>

                    <span className="font-mono">
                      ₹{Number(poData.subtotal || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total System CGST</span>

                    <span className="font-mono">
                      ₹{Number(poData.totalCGST || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total System IGST</span>

                    <span className="font-mono">
                      ₹{Number(poData.totalIGST || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-300 pt-3 text-[22px] font-black">

                    <span className="text-slate-900">
                      Grand Total
                    </span>

                    <span className="text-emerald-600 font-mono">
                      ₹{Number(poData.grandTotal || 0).toFixed(2)}
                    </span>

                  </div>

                </div>

              </div>

              {/* TERMS */}
              <div className="flex justify-between mt-3 border-t border-slate-200 pt-2">

                <div className="max-w-[60%]">

                  <h4 className="text-[13px] font-black uppercase tracking-wider text-slate-800 mb-4">
                    TERMS & CONDITIONS
                  </h4>

                  <ul className="space-y-3 text-[13px] text-slate-600">

                    <li>• Payment Terms: Within 30 days after delivery</li>

                    <li>• Delivery at: Chennai</li>

                    <li>• Packing: Included</li>

                    <li>• Freight & Insurance: Included</li>

                    <li>• Delivery: Four weeks Maximum</li>

                  </ul>

                </div>

                {/* SIGN */}
                <div className="text-center flex flex-col justify-end">

                  <p className="text-[11px] uppercase tracking-[3px] font-bold text-slate-400 mb-16">
                    FOR GARUDA AEROSPACE PVT LTD
                  </p>

                  <div className="border-t border-slate-400 w-[220px] pt-3 text-[13px] font-bold text-slate-800">
                    Authorized Signature
                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div className="mt-10 border-t border-slate-200 pt-5 text-center text-[12px] font-semibold text-slate-500 tracking-wide">
                inventory@garudaaerospace.com +91 98841 04280
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default POPreview;