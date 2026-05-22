import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { FaArrowLeft, FaPrint } from "react-icons/fa";

import { db } from "../../firebase/firebase";

import logo from "../../assets/Dc_logo.png";
import logo_watermark from "../../assets/logo_watermark.png";

const RDCPreview = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const docRef = doc(db, "rdcDocuments", id);

      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        setData({
          id: snapshot.id,
          ...snapshot.data(),
        });
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, "0");

    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${day}-${month}-${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
        <div className="w-16 h-16 border-[5px] border-[#0B1F3A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">
        No Data Found
      </div>
    );
  }

  return (
    <>
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
            margin: 0;
            box-shadow: none;
          }

          .no-print {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#D1D5DB] p-8 ml-[250px]">

        {/* TOP ACTIONS */}
        <div className="no-print flex justify-between items-center mb-6">

          <button
            onClick={() => navigate("/rdc/history")}
            className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center"
          >
            <FaArrowLeft className="text-[#0B1F3A]" />
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#0B1F3A] text-white px-8 py-4 rounded-2xl shadow-lg flex items-center gap-3 font-semibold"
          >
            <FaPrint />
            Print RDC
          </button>
        </div>

        {/* PAPER */}
        <div className="overflow-x-auto flex justify-center">

          <div
            id="print-area"
            className="bg-white relative shadow-2xl overflow-hidden"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "18px 20px",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >

            {/* WATERMARK */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">

              <img
                src={logo_watermark}
                alt="Watermark"
                className="w-[480px] object-contain opacity-[0.08]"
              />
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10">

              {/* LOGO */}
              <div className="border border-black">

                <div className="flex justify-center py-4">
                  <img
                    src={logo}
                    alt="Garuda Aerospace"
                    className="max-w-[220px] object-contain"
                  />
                </div>
              </div>

              {/* TITLE */}
              <div className="border-x border-b border-black text-center font-bold text-[14px] uppercase tracking-wide py-1.5 bg-slate-50">
                RETURNABLE DELIVERY CHALLAN
              </div>

              {/* TOP TABLE */}
              <table className="w-full border-collapse text-[12px] table-fixed">

                <tbody>

                  <tr>

                    <td className="border-l border-b border-r border-black align-top p-2.5 w-[50%] leading-5">

                      <span className="font-bold block uppercase text-[10px] text-slate-400 tracking-wider">
                        FROM,
                      </span>

                      <div className="whitespace-pre-line text-slate-900 font-medium pl-1 mt-0.5">
                        {data.fromAddress || "—"}
                      </div>

                    </td>

                    <td className="border-b border-r border-black font-bold p-1.5 w-[22%] bg-slate-50">
                      RDC No.
                    </td>

                    <td className="border-b border-r border-black p-1.5 font-mono font-bold">
                      {data.rdcNumber}
                    </td>

                  </tr>

                  <tr>

                    <td
                      rowSpan="2"
                      className="border-l border-b border-r border-black align-top p-2.5 leading-5"
                    >

                      <span className="font-bold block uppercase text-[10px] text-slate-400 tracking-wider">
                        TO,
                      </span>

                      <div className="whitespace-pre-line text-slate-900 font-medium pl-1 mt-0.5">
                        {data.toAddress || "—"}
                      </div>

                    </td>

                    <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50">
                      RDC Date
                    </td>

                    <td className="border-b border-r border-black p-1.5">
                      {formatDate(data.rdcDate)}
                    </td>

                  </tr>

                  <tr>

                    <td className="border-b border-r border-black font-bold p-1.5 bg-slate-50">
                      Gate Pass No.
                    </td>

                    <td className="border-b border-r border-black p-1.5">
                      {data.gatePassNo}
                    </td>

                  </tr>

                  <tr>

                    <td className="p-0 border-l border-b border-r border-black">

                      <table className="w-full border-collapse text-[11px]">

                        <tbody>

                          <tr className="border-b border-black">

                            <td className="p-1.5 font-bold w-[35%] bg-slate-50">
                              Request By
                            </td>

                            <td className="p-1.5">
                              {data.requestBy || "—"}
                            </td>

                          </tr>

                          <tr className="border-b border-black">

                            <td className="p-1.5 font-bold bg-slate-50">
                              Employee/Pilot
                            </td>

                            <td className="p-1.5">
                              {data.employeePilot || "—"}
                            </td>

                          </tr>

                          <tr>

                            <td className="p-1.5 font-bold bg-slate-50">
                              Mail Date
                            </td>

                            <td className="p-1.5">
                              {formatDate(data.mailDate)}
                            </td>

                          </tr>

                        </tbody>

                      </table>

                    </td>

                    <td
                      colSpan="2"
                      className="p-0 border-b border-r border-black"
                    >

                      <table className="w-full border-collapse text-[11px]">

                        <tbody>

                          <tr className="border-b border-black">

                            <td className="p-1.5 font-bold w-[44%] bg-slate-50">
                              Mode of Dispatch
                            </td>

                            <td className="p-1.5">
                              {data.modeOfDispatch || "—"}
                            </td>

                          </tr>

                          <tr className="border-b border-black">

                            <td className="p-1.5 font-bold bg-slate-50">
                              Vehicle No
                            </td>

                            <td className="p-1.5">
                              {data.vehicleNo || "—"}
                            </td>

                          </tr>

                          <tr>

                            <td className="p-1.5 font-bold bg-slate-50">
                              Return Date
                            </td>

                            <td className="p-1.5">
                              {formatDate(data.returnDate)}
                            </td>

                          </tr>

                        </tbody>

                      </table>

                    </td>

                  </tr>

                </tbody>

              </table>

              {/* ITEMS TABLE */}
              <table className="w-full border-collapse text-[12px] mt-4 table-fixed">

                <thead>

                  <tr className="bg-slate-50">

                    <th className="border border-black p-1.5 text-center w-[8%]">
                      S.No
                    </th>

                    <th className="border border-black p-1.5 text-left w-[62%]">
                      Description of Goods
                    </th>

                    <th className="border border-black p-1.5 text-center w-[15%]">
                      Qty
                    </th>

                    <th className="border border-black p-1.5 text-center w-[15%]">
                      UoM
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {data.items?.map((item, index) => (

                    <tr key={index}>

                      <td className="border border-black p-1.5 text-center h-[28px]">
                        {index + 1}
                      </td>

                      <td className="border border-black p-1.5 pl-3">
                        {item.description || "—"}
                      </td>

                      <td className="border border-black p-1.5 text-center">
                        {item.quantity || "—"}
                      </td>

                      <td className="border border-black p-1.5 text-center">
                        {item.uom || "—"}
                      </td>

                    </tr>

                  ))}

                  {Array.from({
                    length: Math.max(0, 14 - (data.items?.length || 0)),
                  }).map((_, idx) => (

                    <tr key={idx}>

                      <td className="border border-black h-[28px]">&nbsp;</td>

                      <td className="border border-black">&nbsp;</td>

                      <td className="border border-black">&nbsp;</td>

                      <td className="border border-black">&nbsp;</td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {/* SIGNATURE SECTION */}
              <table className="w-full border-collapse text-[11px] mt-4 table-fixed">

                <tbody>

                  <tr>

                    <td className="border border-black p-2 w-[25%] h-14 align-top">

                      <span className="font-bold text-slate-400 block text-[9px] uppercase">
                        Issued by:
                      </span>

                      <div className="font-bold text-center mt-3">
                        {data.issuedBy}
                      </div>

                    </td>

                    <td className="border-t border-b border-r border-black p-2 w-[25%] align-top">

                      <span className="font-bold text-slate-400 block text-[9px] uppercase">
                        Checked by:
                      </span>

                      <div className="font-bold text-center mt-3">
                        {data.checkedBy}
                      </div>

                    </td>

                    <td className="border-t border-b border-r border-black p-2 w-[25%] align-top">

                      <span className="font-bold text-slate-400 block text-[9px] uppercase">
                        Received by:
                      </span>

                      <div className="font-bold text-center mt-3">
                        {data.receivedBy}
                      </div>

                    </td>

                    <td className="border-t border-b border-r border-black p-2 w-[25%] align-top">

                      <span className="font-bold text-slate-400 block text-[9px] uppercase">
                        Quality Check by:
                      </span>

                      <div className="font-bold text-center mt-3">
                        {data.qualityCheckBy}
                      </div>

                    </td>

                  </tr>

                  <tr>

                    <td
                      colSpan="2"
                      className="border-l border-b border-r border-black p-2 h-14 align-top"
                    >
                      <span className="italic text-slate-400 text-[10px]">
                        Notes / Special Operations Instructions:
                      </span>
                    </td>

                    <td
                      colSpan="2"
                      className="border-b border-r border-black p-2 text-center align-top"
                    >

                      <span className="font-bold block text-[11px] uppercase tracking-wide">
                        For Garuda Aerospace Private Limited
                      </span>

                      <div className="text-[11px] text-slate-400 mt-6 font-bold uppercase">
                        Authorized Signatory
                      </div>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default RDCPreview;