import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import { db } from "../../firebase/firebase";
import logo from "../../assets/logo_1.png";
import logo_watermark from '../../assets/logo_watermark.png'

const RDCPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "rdcDocuments", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setData({ id: snapshot.id, ...snapshot.data() });
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

  if (loading) return <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]"><div className="w-16 h-16 border-[5px] border-[#0B1F3A] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">No Data Found</div>;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#E5E7EB] p-6 ml-[250px]">
        {/* TOP CONTROLS */}
        <div className="no-print flex justify-between items-center mb-6">
          <button onClick={() => navigate("/rdc/history")} className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center">
            <FaArrowLeft className="text-[#0B1F3A]" />
          </button>
          <button onClick={handlePrint} className="bg-[#0B1F3A] text-white px-8 py-4 rounded-2xl shadow-lg flex items-center gap-3">
            <FaPrint /> Print RDC
          </button>
        </div>

        
        {/* PRINT CANVAS */}
        <div
          id="print-area"
          className="bg-white mx-auto shadow-xl relative overflow-hidden"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "10mm",
            fontFamily: "Times New Roman",
          }}
        >

          {/* WATERMARK */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <img
              src={logo_watermark}
              alt="Watermark"
              style={{
                width: "480px",
                opacity: 0.7,
                objectFit: "contain",
              }}
            />
          </div>

          {/* CONTENT */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              minHeight: "277mm",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >

            {/* TOP CONTENT */}
            <div>

              {/* LOGO */}
              <div className="flex justify-center mb-2">
                <img
                  src={logo}
                  alt="Logo"
                  style={{ height: "70px", width: "150px" }}
                />
              </div>

              {/* TITLE */}
              <h2 className="text-center text-2xl font-bold underline uppercase">
                Returnable Delivery Challan
              </h2>

              {/* RDC DETAILS */}
              <table className="mt-8 w-full border border-black border-collapse text-[13px]">
                <tbody>
                  <tr>
                    <td className="border border-black p-3 w-1/2 align-top">
                      <p className="font-bold underline">FROM,</p>

                      <p className="whitespace-pre-line mt-2 font-medium">
                        {data.fromAddress}
                      </p>

                      <p className="font-bold underline mt-4">TO,</p>

                      <p className="whitespace-pre-line mt-2 font-medium">
                        {data.toAddress}
                      </p>
                    </td>

                    <td className="border border-black p-0 w-1/2">
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr>
                            <td className="border border-black p-2 font-bold">
                              RDC No.
                            </td>

                            <td className="border border-black p-2">
                              {data.rdcNumber}
                            </td>
                          </tr>

                          <tr>
                            <td className="border border-black p-2 font-bold">
                              RDC Date
                            </td>

                            <td className="border border-black p-2">
                              {data.rdcDate}
                            </td>
                          </tr>

                          <tr>
                            <td className="border border-black p-2 font-bold">
                              Gate Pass No
                            </td>

                            <td className="border border-black p-2">
                              {data.gatePassNo}
                            </td>
                          </tr>

                          <tr>
                            <td className="border border-black p-2 font-bold">
                              Vehicle No
                            </td>

                            <td className="border border-black p-2">
                              {data.vehicleNo}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* PRODUCTS */}
              <table className="mt-6 w-full border border-black border-collapse text-[13px]">
                <thead>
                  <tr className="bg-gray-100 font-bold">
                    <th className="border border-black p-2 w-[10%]">S.No</th>

                    <th className="border border-black p-2 text-left">
                      Description of Goods
                    </th>

                    <th className="border border-black p-2 w-[15%]">Qty</th>

                    <th className="border border-black p-2 w-[15%]">UoM</th>
                  </tr>
                </thead>

                <tbody>
                  {data.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-black p-2 text-center">
                        {index + 1}
                      </td>

                      <td className="border border-black p-2">
                        {item.description}
                      </td>

                      <td className="border border-black p-2 text-center">
                        {item.quantity}
                      </td>

                      <td className="border border-black p-2 text-center">
                        {item.uom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="pt-8">

              {/* SIGNATURES */}
              <div className="grid grid-cols-2 gap-4 text-[12px] font-bold mb-10">
                <div className="border border-black p-2">
                  Issued by: {data.issuedBy}
                </div>

                <div className="border border-black p-2">
                  Checked by: {data.checkedBy}
                </div>

                <div className="border border-black p-2">
                  Received by:
                </div>

                <div className="border border-black p-2 text-center">
                  <p className="mt-8 italic">Authorized Signatory</p>
                </div>
              </div>

              {/* COMPANY FOOTER */}
              <div className="border-t border-slate-300 pt-4 flex justify-between text-[10px] text-slate-500">
                <div>
                  <p className="font-bold text-slate-800">
                    Registered Office:
                  </p>

                  <p>
                    Garuda Aerospace Private . | Alwarpet, Chennai, Tamil Nadu 600018.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-800">
                    Operations Center:
                  </p>

                  <p>
                    Agni College of Technology, OMR, Thazhambur, Chennai 600130.
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-800">
                    +91 9707600600 | +91 7788868884
                  </p>

                  <p>
                    business@garudaaerospace.com | www.garudaaerospace.com
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RDCPreview;