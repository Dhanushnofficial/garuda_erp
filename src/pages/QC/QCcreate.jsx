import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import html2pdf from "html2pdf.js";

import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

import {
  FaPlus,
  FaTrash,
  FaFileDownload,
} from "react-icons/fa";

const QCCreate = () => {

  const pdfRef = useRef();

  // ======================================================
  // QC NUMBER
  // ======================================================

  const [qcNumber, setQcNumber] = useState("");

  // ======================================================
  // FORM DATA
  // ======================================================

  const [formData, setFormData] = useState({
    vendorName: "",
    invoiceNo: "",
    invoiceDate: "",
    vehicleNo: "",
    storeLocation: "",
  });

  // ======================================================
  // TABLE ROWS
  // ======================================================

  const [rows, setRows] = useState([
    {
      partNo: "",
      description: "",
      uom: "",
      qty: "",
      recdQty: "",
      inspQty: "",
      accQty: "",
      rejQty: "",
      status: "",
      remarks: "",
    },
  ]);

  // ======================================================
  // SIGNATURES
  // ======================================================

  const [signatures, setSignatures] = useState({
    inspectedBy: {
      name: "",
      date: "",
    },

    verifiedBy: {
      name: "",
      date: "",
    },

    storeIncharge: {
      name: "",
      date: "",
    },

    approvedBy: {
      name: "",
      date: "",
    },
  });

  // ======================================================
  // GENERATE QC NUMBER
  // ======================================================

  useEffect(() => {
    generateQCNumber();
  }, []);

  const generateQCNumber = async () => {

    try {

      const snapshot = await getDocs(
        collection(db, "qcReports")
      );

      const count = snapshot.size + 1;

      const formatted = String(count).padStart(
        4,
        "0"
      );

      setQcNumber(`QC-${formatted}`);

    } catch (error) {
      console.log(error);
    }
  };

  // ======================================================
  // HANDLE FORM
  // ======================================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ======================================================
  // HANDLE ROW CHANGE
  // ======================================================

  const handleRowChange = (
    index,
    field,
    value
  ) => {

    const updatedRows = [...rows];

    updatedRows[index][field] = value;

    setRows(updatedRows);
  };

  // ======================================================
  // HANDLE SIGNATURE
  // ======================================================

  const handleSignatureChange = (
    section,
    field,
    value
  ) => {

    setSignatures({
      ...signatures,

      [section]: {
        ...signatures[section],
        [field]: value,
      },
    });
  };

  // ======================================================
  // ADD ROW
  // ======================================================

  const addRow = () => {

    setRows([
      ...rows,

      {
        partNo: "",
        description: "",
        uom: "",
        qty: "",
        recdQty: "",
        inspQty: "",
        accQty: "",
        rejQty: "",
        status: "",
        remarks: "",
      },
    ]);
  };

  // ======================================================
  // REMOVE ROW
  // ======================================================

  const removeRow = (index) => {

    if (rows.length === 1) return;

    const updatedRows = [...rows];

    updatedRows.splice(index, 1);

    setRows(updatedRows);
  };

  // ======================================================
  // TOTALS
  // ======================================================

  const totalQty = rows.reduce(
    (acc, item) => acc + Number(item.qty || 0),
    0
  );

  const totalRecd = rows.reduce(
    (acc, item) =>
      acc + Number(item.recdQty || 0),
    0
  );

  const totalInsp = rows.reduce(
    (acc, item) =>
      acc + Number(item.inspQty || 0),
    0
  );

  const totalAcc = rows.reduce(
    (acc, item) =>
      acc + Number(item.accQty || 0),
    0
  );

  const totalRej = rows.reduce(
    (acc, item) =>
      acc + Number(item.rejQty || 0),
    0
  );

  // ======================================================
  // SAVE & DOWNLOAD PDF
  // ======================================================

 // ======================================================
// SAVE & DOWNLOAD PDF
// ======================================================

const downloadPDF = async () => {

  try {

    // =========================================
    // SAVE FIREBASE
    // =========================================

    await addDoc(
      collection(db, "qcReports"),
      {
        qcNumber,

        formData,

        rows,

        signatures,

        totals: {
          totalQty,
          totalRecd,
          totalInsp,
          totalAcc,
          totalRej,
        },

        createdAt: Timestamp.now(),
      }
    );

    // =========================================
    // PDF ELEMENT
    // =========================================

    const element = pdfRef.current;

    // =========================================
    // PDF OPTIONS
    // =========================================

    const options = {

      margin: [5, 5, 5, 5],

      filename: `${qcNumber}.pdf`,

      image: {
        type: "jpeg",
        quality: 1,
      },

      html2canvas: {
  scale: 2,
  useCORS: true,
  scrollY: 0,
  letterRendering: true,
},

      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },

      // IMPORTANT

      pagebreak: {
        mode: [
          "css",
          "legacy",
        ],

        avoid: [
          ".sign-section",
          ".table-row",
        ],
      },
    };

    // =========================================
    // GENERATE PDF
    // =========================================

    await html2pdf()
      .set(options)
      .from(element)
      .save();

    // =========================================
    // NEXT QC NUMBER
    // =========================================

    generateQCNumber();

    alert(
      "QC Report Saved Successfully"
    );

  } catch (error) {

    console.log(error);

    alert(
      "Error generating PDF"
    );
  }
};

  return (
    <div className="min-h-screen bg-slate-100 p-6 ml-[250px]">

      {/* ======================================================
          TOP HEADER
      ====================================================== */}

      <div className="bg-slate-900 rounded-3xl shadow-2xl p-6 mb-8 flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-black text-white">
            QC Incoming Inspection
          </h1>

          <p className="text-slate-400 mt-2">
            Quality Control Inspection Report
          </p>

        </div>

        <button
          onClick={downloadPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3"
        >
          <FaFileDownload />

          Save & Download
        </button>

      </div>

      {/* ======================================================
          FORM SECTION
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* LEFT */}

        <div className="bg-white rounded-3xl shadow-lg border p-6">

          <h2 className="text-2xl font-black mb-6">
            Vendor Details
          </h2>

          <div className="space-y-5">

            <div>
              <label className="font-bold text-sm">
                Vendor Name
              </label>

              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 mt-2"
              />
            </div>

            <div>
              <label className="font-bold text-sm">
                Invoice No
              </label>

              <input
                type="text"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 mt-2"
              />
            </div>

            <div>
              <label className="font-bold text-sm">
                Vehicle No
              </label>

              <input
                type="text"
                name="vehicleNo"
                value={formData.vehicleNo}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 mt-2"
              />
            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="bg-white rounded-3xl shadow-lg border p-6">

          <h2 className="text-2xl font-black mb-6">
            Inspection Details
          </h2>

          <div className="space-y-5">

            <div>
              <label className="font-bold text-sm">
                Invoice Date
              </label>

              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 mt-2"
              />
            </div>

            <div>
              <label className="font-bold text-sm">
                Store Location
              </label>

              <textarea
                name="storeLocation"
                value={formData.storeLocation}
                onChange={handleChange}
                rows="5"
                className="w-full border rounded-xl p-3 mt-2 resize-none"
              />
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          ITEM TABLE
      ====================================================== */}

      <div className="bg-white rounded-3xl shadow-lg border overflow-hidden mb-8">

        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">

          <div>

            <h2 className="text-2xl font-black text-white">
              Item Inspection Details
            </h2>

            <p className="text-slate-300 text-sm mt-1">
              Add inspected materials & quantities
            </p>

          </div>

          <button
            onClick={addRow}
            className="bg-white text-slate-900 px-5 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <FaPlus />

            Add Row
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full  border-collapse">

            <thead>

              <tr className="bg-slate-800 text-white text-sm">

                <th className="border p-3">
                  S.No
                </th>

                <th className="border p-3">
                  Part No / Item Code
                </th>

                <th className="border p-3">
                  Description
                </th>

                <th className="border p-3">
                  UOM
                </th>

                <th className="border p-3">
                  Qty
                </th>

                <th className="border p-3">
                  Recd Qty
                </th>

                <th className="border p-3">
                  Insp Qty
                </th>

                <th className="border p-3">
                  Acc Qty
                </th>

                <th className="border p-3">
                  Rej Qty
                </th>

                <th className="border p-3">
                  Status
                </th>

                <th className="border p-3">
                  Remarks
                </th>

                <th className="border p-3">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {rows.map((row, index) => (

                <tr key={index}>

                  <td className="border p-2 text-center font-bold">
                    {index + 1}
                  </td>

                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.partNo}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "partNo",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.uom}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "uom",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="number"
                      value={row.qty}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "qty",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="number"
                      value={row.recdQty}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "recdQty",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="number"
                      value={row.inspQty}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "inspQty",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="number"
                      value={row.accQty}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "accQty",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="number"
                      value={row.rejQty}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "rejQty",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </td>

                  <td className="border p-2">

                    <select
                      value={row.status}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "status",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">
                        Select
                      </option>

                      <option value="Pass">
                        Pass
                      </option>

                      <option value="Fail">
                        Fail
                      </option>

                      <option value="Hold">
                        Hold
                      </option>

                    </select>

                  </td>

                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.remarks}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "remarks",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </td>

                  <td className="border p-2 text-center">

                    <button
                      onClick={() =>
                        removeRow(index)
                      }
                      className="bg-red-500 text-white p-3 rounded-xl"
                    >
                      <FaTrash />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* ======================================================
          SIGNATURE INPUTS
      ====================================================== */}

      <div className="bg-white rounded-3xl shadow-lg border p-6 mb-8">

        <h2 className="text-2xl font-black mb-6">
          Authorization Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {[
            {
              key: "inspectedBy",
              title: "Inspected By",
            },

            {
              key: "verifiedBy",
              title: "Verified By",
            },

            {
              key: "storeIncharge",
              title: "Store Incharge",
            },

            {
              key: "approvedBy",
              title: "Approved By",
            },
          ].map((item, index) => (

            <div
              key={index}
              className="border rounded-2xl p-5 bg-slate-50"
            >

              <h3 className="font-black text-lg mb-5">
                {item.title}
              </h3>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="Enter Name"
                  value={
                    signatures[item.key].name
                  }
                  onChange={(e) =>
                    handleSignatureChange(
                      item.key,
                      "name",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="date"
                  value={
                    signatures[item.key].date
                  }
                  onChange={(e) =>
                    handleSignatureChange(
                      item.key,
                      "date",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* ======================================================
          LIVE PREVIEW
      ====================================================== */}

     {/* ======================================================
    LIVE PREVIEW
====================================================== */}

<div className="bg-slate-300 rounded-3xl p-8 overflow-auto">

  <div
    ref={pdfRef}
    className="bg-white mx-auto shadow-2xl"
   style={{
  width: "190mm",
  minHeight: "297mm",
  padding: "4mm",
  overflow: "hidden",
  background: "#fff",
  boxSizing: "border-box",
}}
  >

    {/* QC NUMBER */}

    {/* <div className="flex justify-end mb-4">

      <div className="bg-slate-100 border px-4 py-2 rounded-lg font-black">
        {qcNumber}
      </div>

    </div> */}

    {/* HEADER */}

    <div className="bg-slate-900 text-white text-center py-4 rounded-t-xl">

      <h1 className="text-[22px]  font-black">
        INCOMING INSPECTION REPORT
      </h1>

      <p className="text-sm mt-2">
        QUALITY CONTROL FORM
      </p>

    </div>

    {/* ======================================================
        VENDOR DETAILS
    ====================================================== */}

    <div className="border border-blue-900 border-t-0">

      <div className="bg-slate-700 text-white text-center py-3 font-black text-[16px]">
        1 | VENDOR & PURCHASE ORDER DETAILS
      </div>

      <div className="grid grid-cols-2">

        {/* LEFT */}

        <div className="border-r border-blue-900">

          <div className="flex border-b border-blue-900">

            <div className="w-52 bg-slate-100 p-3 font-bold border-r border-blue-900">
              Vendor Name
            </div>

            <div className="flex-1 p-3 break-all">
              {formData.vendorName}
            </div>

          </div>

          <div className="flex border-b border-blue-900">

            <div className="w-52 bg-slate-100 p-3 font-bold border-r border-blue-900">
              Invoice No
            </div>

            <div className="flex-1 p-3 break-all">
              {formData.invoiceNo}
            </div>

          </div>

          <div className="flex">

            <div className="w-52 bg-slate-100 p-3 font-bold border-r border-blue-900">
              Vehicle No
            </div>

            <div className="flex-1 p-3 break-all">
              {formData.vehicleNo}
            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div>

          <div className="flex border-b border-blue-900">

            <div className="w-52 bg-slate-100 p-3 font-bold border-r border-blue-900">
              Invoice Date
            </div>

            <div className="flex-1 p-3 break-all">
              {formData.invoiceDate}
            </div>

          </div>

          <div className="flex items-stretch">

            <div className="w-52 bg-slate-100 p-3 font-bold border-r border-blue-900 flex items-center">
              Store Location
            </div>

            <div className="flex-1 p-3 break-all whitespace-normal text-[13px] leading-[20px]">
              {formData.storeLocation}
            </div>

          </div>

        </div>

      </div>

    </div>

    {/* ======================================================
        ITEM DETAILS TABLE
    ====================================================== */}

    <div className="mt-6">

      <div className="bg-slate-900 text-white py-3 text-center font-black text-[16px] border-y-4 border-orange-400">
        2 | ITEM DETAILS & INSPECTION FINDINGS
      </div>

<table
  className="w-full text-[10px]"
  style={{
    borderCollapse: "collapse",
    tableLayout: "fixed",
    width: "100%",
  }}
>

  <thead>

    <tr className="bg-slate-700 text-white text-[10px]">

      <th className="border border-blue-900 p-2 w-[4%]">
        S.No
      </th>

      <th className="border border-blue-900 p-2 w-[10%]">
        Part No
      </th>

      <th className="border border-blue-900 p-2 w-[16%]">
        Description
      </th>

      <th className="border border-blue-900 p-2 w-[6%]">
        UOM
      </th>

      <th className="border border-blue-900 p-2 w-[6%]">
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

      <th className="border border-blue-900 p-2 w-[8%]">
        Status
      </th>

      <th className="border border-blue-900 p-2 w-[12%]">
        Remarks
      </th>

    </tr>

  </thead>

  <tbody>

    {/* DYNAMIC ROWS */}

    {rows.map((row, index) => (

      <tr
        key={index}
        className="table-row"
      >

        <td className="border border-blue-900 p-2 text-center">
          {index + 1}
        </td>

        <td className="border border-blue-900 p-2 break-all">
          {row.partNo}
        </td>

        <td className="border border-blue-900 p-2 break-words">
          {row.description}
        </td>

        <td className="border border-blue-900 p-2 text-center">
          {row.uom}
        </td>

        <td className="border border-blue-900 p-2 text-center">
          {row.qty}
        </td>

        <td className="border border-blue-900 p-2 text-center">
          {row.recdQty}
        </td>

        <td className="border border-blue-900 p-2 text-center">
          {row.inspQty}
        </td>

        <td className="border border-blue-900 p-2 text-center">
          {row.accQty}
        </td>

        <td className="border border-blue-900 p-2 text-center">
          {row.rejQty}
        </td>

        <td className="border border-blue-900 p-2 text-center font-bold">
          {row.status}
        </td>

        <td className="border border-blue-900 p-2 break-words">
          {row.remarks}
        </td>

      </tr>

    ))}

    {/* EMPTY ROWS */}

    {Array.from({
      length:
        rows.length < 12
          ? 1 - rows.length
          : 0,
    }).map((_, index) => (

      <tr
        key={`empty-${index}`}
        className="h-[38px]"
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

    <tr className="bg-slate-100 font-bold">

      <td
        colSpan={4}
        className="border border-blue-900 p-3 text-center"
      >
        TOTALS
      </td>

      <td className="border border-blue-900 p-2 text-center">
        {totalQty}
      </td>

      <td className="border border-blue-900 p-2 text-center">
        {totalRecd}
      </td>

      <td className="border border-blue-900 p-2 text-center">
        {totalInsp}
      </td>

      <td className="border border-blue-900 p-2 text-center">
        {totalAcc}
      </td>

      <td className="border border-blue-900 p-2 text-center">
        {totalRej}
      </td>

      <td className="border border-blue-900"></td>

      <td className="border border-blue-900"></td>

    </tr>

  </tbody>

</table>

    </div>

    {/* ======================================================
        SIGN SECTION
    ====================================================== */}
<div>
        <div
      className="pt-10 sign-section"
      style={{
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >

      <div className="bg-slate-900 text-white py-4 text-center font-black text-[16px] border-y-4 border-orange-400">
        3 | AUTHORISATION & SIGN-OFF
      </div>

      <div className="grid grid-cols-4 border-2 border-blue-900 border-t-0">

        {[
          {
            title: "INSPECTED BY",
            data: signatures.inspectedBy,
          },

          {
            title: "VERIFIED BY",
            data: signatures.verifiedBy,
          },

          {
            title: "STORE INCHARGE",
            data: signatures.storeIncharge,
          },

          {
            title: "APPROVED BY",
            data: signatures.approvedBy,
          },
        ].map((item, index) => (

          <div
            key={index}
            className="border-r border-blue-900 last:border-r-0 min-h-[220px] flex flex-col"
          >

            <div className="bg-slate-100 border-b border-blue-900 text-center py-3">

              <h2 className="font-black text-blue-900">
                {item.title}
              </h2>

            </div>

            <div className="flex-1 flex flex-col justify-end p-5">

              <div className="mb-10">

                <div className="h-14 border-b border-slate-500"></div>

                <p className="text-center text-xs text-slate-500 mt-2 font-bold">
                  Signature
                </p>

              </div>

              <div className="mb-4 text-sm flex">

                <span className="font-black">
                  Name
                </span>
                <span className="font-black">
                  :
                </span>

                <span className="ml-2">
                  {item.data.name || "____________"}
                </span>

              </div>

              <div className="text-sm flex">

                <span className="font-black">
                  Date 
                </span>
                <span className="font-black">
                  :
                </span>


                <span className="ml-2">
                  {item.data.date || "____________"}
                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
</div>
    

  </div>

</div>

    </div>
  );
};

export default QCCreate;