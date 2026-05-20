import React, {
  useEffect,
  useState
} from "react";

import {
  collection,
  getDocs
} from "firebase/firestore";

import {
  FaPrint,
  FaFilePdf
} from "react-icons/fa";

import html2canvas from "html2canvas";

import jsPDF from "jspdf";

import { db } from "../../firebase/firebase";

import logo from "../../assets/Dc_logo.png";

const CombinedDCExport = () => {

  const [loading,
    setLoading] =
    useState(true);

  const [allData,
    setAllData] =
    useState([]);

  // =========================================
  // FETCH
  // =========================================

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData =
    async () => {

      try {

        setLoading(true);

        // =====================
        // FIREBASE
        // =====================

        const dcSnap =
          await getDocs(
            collection(
              db,
              "deliveryChallans"
            )
          );

        const loiSnap =
          await getDocs(
            collection(
              db,
              "listOfItems"
            )
          );

        const packingSnap =
          await getDocs(
            collection(
              db,
              "packingChecklist"
            )
          );

        // =====================
        // ARRAY
        // =====================

        const dcList =
          dcSnap.docs.map(
            (doc) => ({

              id: doc.id,

              ...doc.data(),

            })
          );

        const loiList =
          loiSnap.docs.map(
            (doc) => ({

              id: doc.id,

              ...doc.data(),

            })
          );

        const packingList =
          packingSnap.docs.map(
            (doc) => ({

              id: doc.id,

              ...doc.data(),

            })
          );

        // =====================
        // COMBINE
        // =====================

        const combined =
          dcList.map(
            (dc) => {

              const loi =
                loiList.find(
                  (item) =>

                    item.challanNumber ===
                    dc.challanNumber

                );

              const packing =
                packingList.find(
                  (item) =>

                    item.dispatchDate ===
                    dc.date

                );

              return {

                ...dc,

                loi:
                  loi || null,

                packing:
                  packing || null,

              };

            }
          );

        setAllData(
          combined
        );

        setLoading(false);

      } catch (error) {

        console.log(error);

        setLoading(false);

      }

    };

  // =========================================
  // DOWNLOAD PDF
  // =========================================

  const downloadPDF =
    async (index) => {

      try {

        const pages =
          document.querySelectorAll(
            `.pdf-page-${index}`
          );

        const pdf =
          new jsPDF(
            "p",
            "mm",
            "a4"
          );

        for (
          let i = 0;
          i < pages.length;
          i++
        ) {

          const canvas =
            await html2canvas(
              pages[i],
              {
                scale: 2,
                useCORS: true,
                backgroundColor:
                  "#ffffff",
              }
            );

          const imgData =
            canvas.toDataURL(
              "image/jpeg",
              1.0
            );

          const imgWidth =
            210;

          const imgHeight =
            (
              canvas.height *
              imgWidth
            ) / canvas.width;

          if (i !== 0) {

            pdf.addPage();

          }

          pdf.addImage(
            imgData,
            "JPEG",
            0,
            0,
            imgWidth,
            imgHeight
          );

        }

        pdf.save(
          `${allData[index]?.dcNumber}-Combined.pdf`
        );

      } catch (error) {

        console.log(error);

      }

    };

  // =========================================
  // PRINT
  // =========================================

  const handlePrint =
    (index) => {

      const content =
        document.getElementById(
          `print-${index}`
        ).innerHTML;

      const printWindow =
        window.open(
          "",
          "",
          "width=1200,height=800"
        );

      printWindow.document.write(`

        <html>

          <head>

            <title>
              Combined Document
            </title>

            <style>

              body {

                margin: 0;

                padding: 0;

                background: white;

              }

              @page {

                size: A4;

                margin: 0;

              }

            </style>

          </head>

          <body>

            ${content}

          </body>

        </html>

      `);

      printWindow.document.close();

      printWindow.focus();

      printWindow.print();

    };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div
        className="fixed inset-0 flex items-center justify-center bg-white"
        style={{
          marginLeft: "250px",
        }}
      >

        <div className="flex flex-col items-center">

          <div className="w-24 h-24 border-[8px] border-[#0B1F3A] border-t-transparent rounded-full animate-spin"></div>

          <h1 className="mt-6 text-2xl font-bold text-[#0B1F3A]">

            Loading Combined Files...

          </h1>

        </div>

      </div>

    );

  }

  return (

    <div
      className="bg-[#ECECEC] min-h-screen p-6"
      style={{
        marginLeft: "250px",
      }}
    >

      {/* ========================================= */}
      {/* TOP */}
      {/* ========================================= */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold text-[#0B1F3A]">

          Combined Documents

        </h1>

      </div>

      {/* ========================================= */}
      {/* TABLE */}
      {/* ========================================= */}

      <div className="bg-white rounded-[30px] overflow-hidden shadow-xl">

        <table className="w-full">

          <thead className="bg-[#0B1F3A] text-white">

            <tr>

              <th className="p-5 text-left">

                DC Number

              </th>

              <th className="p-5 text-left">

                Date

              </th>

              <th className="p-5 text-left">

                Customer

              </th>

              <th className="p-5 text-center">

                Actions

              </th>

            </tr>

          </thead>

          <tbody>

            {allData.map(
              (
                data,
                index
              ) => (

                <tr
                  key={index}
                  className="border-b"
                >

                  <td className="p-5 font-bold">

                    {data.dcNumber}

                  </td>

                  <td className="p-5">

                    {data.date}

                  </td>

                  <td className="p-5">

                    {data.shipTo}

                  </td>

                  {/* ACTION */}

                  <td className="p-5">

                    <div className="flex justify-center gap-3">

                      {/* PDF */}

                      <button
                        onClick={() =>
                          downloadPDF(
                            index
                          )
                        }
                        className="w-12 h-12 rounded-2xl bg-red-100 hover:bg-red-200 flex items-center justify-center"
                      >

                        <FaFilePdf className="text-red-700" />

                      </button>

                      {/* PRINT */}

                      <button
                        onClick={() =>
                          handlePrint(
                            index
                          )
                        }
                        className="w-12 h-12 rounded-2xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center"
                      >

                        <FaPrint className="text-blue-700" />

                      </button>

                    </div>

                    {/* ========================================= */}
                    {/* HIDDEN PRINT AREA */}
                    {/* ========================================= */}

                    <div
                      id={`print-${index}`}
                      style={{
                        position:
                          "absolute",
                        left:
                          "-9999px",
                        top: 0,
                        width:
                          "794px",
                        background:
                          "#fff",
                      }}
                    >

                      {/* ========================================= */}
                      {/* PAGE 1 */}
                      {/* DELIVERY CHALLAN */}
                      {/* ========================================= */}

                      <div
                        className={`pdf-page-${index}`}
                        style={{
                          width:
                            "794px",
                          minHeight:
                            "1123px",
                          padding:
                            "30px",
                          background:
                            "#fff",
                          position:
                            "relative",
                          fontFamily:
                            "Times New Roman",
                          boxSizing:
                            "border-box",
                        }}
                      >

                        {/* WATERMARK */}

                        <div
                          style={{
                            position:
                              "absolute",
                            top:
                              "300px",
                            left:
                              "50%",
                            transform:
                              "translateX(-50%)",
                            opacity:
                              0.05,
                            fontSize:
                              "180px",
                            fontWeight:
                              "bold",
                          }}
                        >

                          Garuda

                        </div>

                        {/* LOGO */}

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "flex-end",
                          }}
                        >

                          <img
                            src={logo}
                            alt=""
                            style={{
                              width:
                                "220px",
                            }}
                          />

                        </div>

                        {/* TITLE */}

                        <h1
                          style={{
                            textAlign:
                              "center",
                            fontSize:
                              "34px",
                            fontWeight:
                              "bold",
                            textDecoration:
                              "underline",
                            marginTop:
                              "10px",
                          }}
                        >

                          DELIVERY CHALLAN

                        </h1>

                        {/* TOP TABLE */}

                        <table
                          style={{
                            width:
                              "100%",
                            borderCollapse:
                              "collapse",
                            marginTop:
                              "30px",
                            fontSize:
                              "14px",
                          }}
                        >

                          <tbody>

                            <tr>

                              {/* LEFT */}

                              <td
                                style={{
                                  width:
                                    "50%",
                                  border:
                                    "1px solid black",
                                  padding:
                                    "10px",
                                  verticalAlign:
                                    "top",
                                }}
                              >

                                <div
                                  style={{
                                    fontWeight:
                                      "bold",
                                    textDecoration:
                                      "underline",
                                    marginBottom:
                                      "10px",
                                  }}
                                >

                                  Ship To

                                </div>

                                <div
                                  style={{
                                    whiteSpace:
                                      "pre-line",
                                    lineHeight:
                                      "1.7",
                                  }}
                                >

                                  {data.shipTo}

                                </div>

                              </td>

                              {/* RIGHT */}

                              <td
                                style={{
                                  width:
                                    "50%",
                                  padding:
                                    0,
                                }}
                              >

                                <table
                                  style={{
                                    width:
                                      "100%",
                                    borderCollapse:
                                      "collapse",
                                  }}
                                >

                                  <tbody>

                                    {[
                                      ["Date", data.date],
                                      ["Challan No.", data.dcNumber],
                                      ["Invoice No.", data.invoiceNumber],
                                      ["Invoice Date", data.invoiceDate],
                                      ["Mode Of Dispatch", data.dispatchMode],
                                      ["Transporter Name", data.transporter],
                                      ["Gate Pass No.", data.gatePassNo],
                                    ].map((row, i) => (

                                      <tr key={i}>

                                        <td
                                          style={{
                                            border:
                                              "1px solid black",
                                            padding:
                                              "8px",
                                            fontWeight:
                                              "bold",
                                            width:
                                              "45%",
                                          }}
                                        >

                                          {row[0]}

                                        </td>

                                        <td
                                          style={{
                                            border:
                                              "1px solid black",
                                            padding:
                                              "8px",
                                          }}
                                        >

                                          {row[1]}

                                        </td>

                                      </tr>

                                    ))}

                                  </tbody>

                                </table>

                              </td>

                            </tr>

                          </tbody>

                        </table>

                        {/* PRODUCTS */}

                        <table
                          style={{
                            width:
                              "100%",
                            borderCollapse:
                              "collapse",
                            marginTop:
                              "35px",
                            fontSize:
                              "14px",
                          }}
                        >

                          <thead>

                            <tr
                              style={{
                                background:
                                  "#E5E7EB",
                              }}
                            >

                              <th style={{
                                border:
                                  "1px solid black",
                                padding:
                                  "10px",
                              }}>

                                S. No

                              </th>

                              <th style={{
                                border:
                                  "1px solid black",
                                padding:
                                  "10px",
                              }}>

                                Description Of Goods

                              </th>

                              <th style={{
                                border:
                                  "1px solid black",
                                padding:
                                  "10px",
                              }}>

                                Quantity

                              </th>

                            </tr>

                          </thead>

                          <tbody>

                            {data.items?.map(
                              (
                                item,
                                i
                              ) => (

                                <tr key={i}>

                                  <td
                                    style={{
                                      border:
                                        "1px solid black",
                                      padding:
                                        "10px",
                                      textAlign:
                                        "center",
                                    }}
                                  >

                                    {i + 1}

                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid black",
                                      padding:
                                        "10px",
                                    }}
                                  >

                                    {item.description}

                                  </td>

                                  <td
                                    style={{
                                      border:
                                        "1px solid black",
                                      padding:
                                        "10px",
                                      textAlign:
                                        "center",
                                    }}
                                  >

                                    {item.quantity} Nos

                                  </td>

                                </tr>

                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    </div>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default CombinedDCExport;