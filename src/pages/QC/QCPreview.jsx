import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useParams,
} from "react-router-dom";

import {
  FaPrint,
} from "react-icons/fa";

import { db } from "../../firebase/firebase";

const QCPreview = () => {

  const { id } = useParams();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const printRef = useRef();

  // =====================================================
  // FETCH QC
  // =====================================================

  useEffect(() => {
    fetchQC();
  }, []);

  const fetchQC = async () => {

    try {

      const docRef = doc(
        db,
        "qcReports",
        id
      );

      const snapshot =
        await getDoc(docRef);

      if (snapshot.exists()) {

        setData({
          id: snapshot.id,
          ...snapshot.data(),
        });
      }

      setLoading(false);

    } catch (error) {

      console.log(error);

      setLoading(false);
    }
  };

  // =====================================================
  // PRINT
  // =====================================================

  const handlePrint = () => {
    window.print();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="h-screen flex justify-center items-center bg-slate-950">

        <h1 className="text-white text-2xl font-black">
          Loading QC...
        </h1>

      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const rows = data?.rows || [];

  // =====================================================
  // TOTALS
  // =====================================================

  const totalQty =
    rows.reduce(
      (acc, item) =>
        acc +
        Number(item.qty || 0),
      0
    );

  const totalRecd =
    rows.reduce(
      (acc, item) =>
        acc +
        Number(item.recdQty || 0),
      0
    );

  const totalInsp =
    rows.reduce(
      (acc, item) =>
        acc +
        Number(item.inspQty || 0),
      0
    );

  const totalAcc =
    rows.reduce(
      (acc, item) =>
        acc +
        Number(item.accQty || 0),
      0
    );

  const totalRej =
    rows.reduce(
      (acc, item) =>
        acc +
        Number(item.rejQty || 0),
      0
    );

  // =====================================================
  // DYNAMIC EMPTY ROWS
  // =====================================================

  const descriptionLength =
    rows.reduce(
      (acc, row) =>
        acc +
        (
          row.description || ""
        ).length,
      0
    );

  let emptyRows = 6;

  if (descriptionLength > 150) {
    emptyRows = 4;
  }

  if (descriptionLength > 300) {
    emptyRows = 2;
  }

  if (rows.length > 5) {
    emptyRows = 1;
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="bg-slate-300 min-h-screen py-8 px-4 print:bg-white">

      {/* =====================================================
          PRINT BUTTON
      ===================================================== */}

      <div className="flex justify-end mb-5 print:hidden">

        <button
          onClick={handlePrint}
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-3 font-bold shadow-xl"
        >

          <FaPrint />

          Print QC

        </button>

      </div>

      {/* =====================================================
          PAGE
      ===================================================== */}

      <div
        ref={printRef}
        className="qc-print-area bg-white mx-auto shadow-2xl"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "6mm",
          boxSizing: "border-box",
        }}
      >


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="bg-[#071633] text-white rounded-t-2xl overflow-hidden">

          <div className="py-2 text-center">

            <h1 className="text-[25px] font-black tracking-wide">
              INCOMING INSPECTION REPORT
            </h1>

            <p className="text-sm mt-1 tracking-widest">
              QUALITY CONTROL FORM
            </p>

          </div>

        </div>

        {/* =====================================================
            SECTION 1
        ===================================================== */}

        <div className="border border-blue-900 border-t-0">

          <div className="bg-slate-700 text-white text-center py-3 font-black text-[15px]">
            1 | VENDOR & PURCHASE ORDER DETAILS
          </div>

          <div className="grid grid-cols-2">

            {/* LEFT */}

            <div className="border-r border-blue-900">

              <div className="flex border-b border-blue-900 min-h-[52px]">

                <div className="w-52 bg-slate-100 border-r border-blue-900 p-3 font-bold flex items-center">
                  Vendor Name
                </div>

                <div className="flex-1 p-3 break-all flex items-center">
                  {data?.formData?.vendorName}
                </div>

              </div>

              <div className="flex border-b border-blue-900 min-h-[52px]">

                <div className="w-52 bg-slate-100 border-r border-blue-900 p-3 font-bold flex items-center">
                  Invoice No
                </div>

                <div className="flex-1 p-3 break-all flex items-center">
                  {data?.formData?.invoiceNo}
                </div>

              </div>

              <div className="flex min-h-[52px]">

                <div className="w-52 bg-slate-100 border-r border-blue-900 p-3 font-bold flex items-center">
                  Vehicle No
                </div>

                <div className="flex-1 p-3 break-all flex items-center">
                  {data?.formData?.vehicleNo}
                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div>

              <div className="flex border-b border-blue-900 min-h-[52px]">

                <div className="w-40 bg-slate-100 border-r border-blue-900 p-3 font-bold flex items-center">
                  Invoice Date
                </div>

                <div className="flex-1 p-3 flex items-center">
                  {data?.formData?.invoiceDate}
                </div>

              </div>

              <div className="flex min-h-[155px]">

                <div className="w-40 bg-slate-100 border-r border-blue-900 p-3 font-bold flex items-center">
                  Store Location
                </div>

                <div className="flex-1 p-3 whitespace-pre-wrap break-words text-sm leading-7">
                  {data?.formData?.storeLocation}
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            SECTION 2
        ===================================================== */}

        <div className="mt-5">

          <div className="bg-[#071633] border-t-4 border-orange-400 text-white text-center py-3 font-black text-[15px]">
            2 | ITEM DETAILS & INSPECTION FINDINGS
          </div>

          <table
            className="w-full"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              tableLayout: "fixed",
            }}
          >

            <thead>

              <tr className="bg-slate-700 text-white text-[10px]">

                <th className="border border-blue-900 p-2 w-[5%]">
                  S.No
                </th>

                <th className="border border-blue-900 p-2 w-[10%]">
                  Part No
                </th>

                <th className="border border-blue-900 p-2 w-[18%]">
                  Description
                </th>

                <th className="border border-blue-900 p-2 w-[8%]">
                  UOM
                </th>

                <th className="border border-blue-900 p-2 w-[7%]">
                  Qty
                </th>

                <th className="border border-blue-900 p-2 w-[7%]">
                  Recd
                </th>

                <th className="border border-blue-900 p-2 w-[7%]">
                  Insp
                </th>

                <th className="border border-blue-900 p-2 w-[7%]">
                  Acc
                </th>

                <th className="border border-blue-900 p-2 w-[7%]">
                  Rej
                </th>

                <th className="border border-blue-900 p-2 w-[9%]">
                  Status
                </th>

                <th className="border border-blue-900 p-2 w-[15%]">
                  Remarks
                </th>

              </tr>

            </thead>

            <tbody>

              {/* DATA ROWS */}

              {rows.map((row, index) => (

                <tr key={index}>

                  <td className="border border-blue-900 p-2 text-center text-[10px]">
                    {index + 1}
                  </td>

                  <td className="border border-blue-900 p-2 text-[10px] break-all">
                    {row.partNo}
                  </td>

                  <td className="border border-blue-900 p-2 text-[10px] leading-5 break-words">
                    {row.description}
                  </td>

                  <td className="border border-blue-900 p-2 text-center text-[10px]">
                    {row.uom}
                  </td>

                  <td className="border border-blue-900 p-2 text-center text-[10px]">
                    {row.qty}
                  </td>

                  <td className="border border-blue-900 p-2 text-center text-[10px]">
                    {row.recdQty}
                  </td>

                  <td className="border border-blue-900 p-2 text-center text-[10px]">
                    {row.inspQty}
                  </td>

                  <td className="border border-blue-900 p-2 text-center text-[10px]">
                    {row.accQty}
                  </td>

                  <td className="border border-blue-900 p-2 text-center text-[10px]">
                    {row.rejQty}
                  </td>

                  <td className="border border-blue-900 p-2 text-center text-[10px] font-bold">
                    {row.status}
                  </td>

                  <td className="border border-blue-900 p-2 text-[10px] break-words">
                    {row.remarks}
                  </td>

                </tr>

              ))}

              {/* EMPTY ROWS */}

              {Array.from({
                length:
                  rows.length < emptyRows
                    ? 0 -
                      rows.length
                    : 0,
              }).map((_, index) => (

                <tr
                  key={index}
                  className="h-[31px]"
                >

                  <td className="border border-blue-900"></td>
                  <td className="border border-blue-900"></td>
                  <td className="border border-blue-900"></td>
                  <td className="border border-blue-900"></td>
                  <td className="border border-blue-900"></td>
                  <td className="border border-blue-900"></td>
                  <td className="border border-blue-900"></td>
                  <td className="border border-blue-900"></td>
                  <td className="border border-blue-900"></td>
                  <td className="border border-blue-900"></td>
                  <td className="border border-blue-900"></td>

                </tr>

              ))}

              {/* TOTALS */}

              <tr className="bg-slate-100 font-bold text-[10px]">

                <td
                  colSpan={4}
                  className="border border-blue-900 p-3 text-center"
                >
                  TOTALS
                </td>

                <td className="border border-blue-900 text-center">
                  {totalQty}
                </td>

                <td className="border border-blue-900 text-center">
                  {totalRecd}
                </td>

                <td className="border border-blue-900 text-center">
                  {totalInsp}
                </td>

                <td className="border border-blue-900 text-center">
                  {totalAcc}
                </td>

                <td className="border border-blue-900 text-center">
                  {totalRej}
                </td>

                <td className="border border-blue-900"></td>

                <td className="border border-blue-900"></td>

              </tr>

            </tbody>

          </table>

        </div>

        {/* =====================================================
            SIGN SECTION
        ===================================================== */}

        <div
          className="mt-5"
          style={{
            pageBreakInside: "avoid",
          }}
        >

          <div className="bg-[#071633] border-t-4 border-orange-400 text-white text-center py-3 font-black text-[15px]">
            3 | AUTHORISATION & SIGN-OFF
          </div>

          <div className="grid grid-cols-4 border border-blue-900 border-t-0">

            {[
              {
                title: "INSPECTED BY",
                data:
                  data?.signatures
                    ?.inspectedBy,
              },

              {
                title: "VERIFIED BY",
                data:
                  data?.signatures
                    ?.verifiedBy,
              },

              {
                title: "STORE INCHARGE",
                data:
                  data?.signatures
                    ?.storeIncharge,
              },

              {
                title: "APPROVED BY",
                data:
                  data?.signatures
                    ?.approvedBy,
              },
            ].map((item, index) => (

              <div
                key={index}
                className="border-r border-blue-900 last:border-r-0"
              >

                <div className="bg-slate-100 border-b border-blue-900 py-3 text-center">

                  <h2 className="font-black text-blue-900 text-[14px]">
                    {item.title}
                  </h2>

                </div>

                <div className="p-4 min-h-[170px] flex flex-col justify-end">

                  <div className="mb-6">

                    <div className="h-12 border-b border-slate-500"></div>

                    <p className="text-center text-xs text-slate-500 mt-2 font-bold">
                      Signature
                    </p>

                  </div>

                  <div className="mb-3 text-sm">

                    <span className="font-black">
                      Name:
                    </span>

                    <span className="ml-2">
                      {item.data?.name}
                    </span>

                  </div>

                  <div className="text-sm">

                    <span className="font-black">
                      Date:
                    </span>

                    <span className="ml-2">
                      {item.data?.date}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* =====================================================
          PRINT CSS
      ===================================================== */}

      <style>

        {`
          @media print {

            body * {
              visibility: hidden;
            }

            .qc-print-area,
            .qc-print-area * {
              visibility: visible;
            }

            .qc-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 auto !important;
              box-shadow: none !important;
            }

            .print\\:hidden {
              display: none !important;
            }

            body,
            html {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            @page {
              size: A4;
              margin: 6mm;
            }
          }
        `}

      </style>

    </div>
  );
};

export default QCPreview;