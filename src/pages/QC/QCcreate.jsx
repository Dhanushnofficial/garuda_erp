import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import {
  FaPlus,
  FaTrash,
  FaSave,
} from "react-icons/fa";

import html2pdf from "html2pdf.js";

import { db } from "../../firebase/firebase";

const QCcreate = () => {

  // ======================================================
  // DATE
  // ======================================================

  const getTodayDate = () => {
    return new Date()
      .toISOString()
      .split("T")[0];
  };

  // ======================================================
  // QC NUMBER
  // ======================================================

  const [qcNumber, setQcNumber] =
    useState("");

  // ======================================================
  // FORM DATA
  // ======================================================

  const [formData, setFormData] =
    useState({
      vendorName: "",
      invoiceNo: "",
      invoiceDate: getTodayDate(),
      vehicleNo: "",
      storeLocation: "",
    });

  // ======================================================
  // SIGNATURES
  // ======================================================

  const [signatures, setSignatures] =
    useState({
      inspectedBy: {
        name: "SUBASH",
        date: getTodayDate(),
      },

      verifiedBy: {
        name: "ROHITH",
        date: getTodayDate(),
      },

      storeIncharge: {
        name: "ARSHAD",
        date: getTodayDate(),
      },

      approvedBy: {
        name: "PRETHIVI",
        date: getTodayDate(),
      },
    });

  // ======================================================
  // ROWS
  // ======================================================


const [rows, setRows] = useState([
  {
    partNo: "",
    description: "",
    uom: "NOS",
    qty: "",
    recdQty: "",
    inspQty: "",
    accQty: "",
    rejQty: 0,
    status: "Pass",
    remarks: "GOOD",
  },
]);
  // ======================================================
  // GENERATE QC NUMBER
  // ======================================================

  useEffect(() => {
    generateQCNumber();
  }, []);

  const generateQCNumber =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "qcReports"
            )
          );

        const count =
          snapshot.size + 1;

        const year =
          new Date().getFullYear();

        const formatted =
          String(count).padStart(
            4,
            "0"
          );

        setQcNumber(
          `GAL/QC/${year}/${formatted}`
        );

      } catch (error) {
        console.log(error);
      }
    };

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // ======================================================
// DOWNLOAD PDF
// ======================================================

const downloadPDF = () => {

  const element =
    document.getElementById(
      "qc-preview"
    );

  if (!element) {
    alert("Preview not found");
    return;
  }

  const options = {

    margin: 0,

    filename:
      `${qcNumber}.pdf`,

    image: {
      type: "jpeg",
      quality: 1,
    },

    html2canvas: {
      scale: 3,
      useCORS: true,
      scrollY: 0,
    },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };

  html2pdf()
    .set(options)
    .from(element)
    .save();
};

  // ======================================================
  // SIGNATURE CHANGE
  // ======================================================

  const handleSignatureChange = (
    role,
    field,
    value
  ) => {

    setSignatures({
      ...signatures,

      [role]: {
        ...signatures[role],
        [field]: value,
      },
    });
  };

  // ======================================================
  // ROW CHANGE
  // ======================================================

const handleRowChange = (
  index,
  field,
  value
) => {

  const updatedRows = [...rows];

  // UPDATE FIELD

  updatedRows[index][field] =
    value;

  // ====================================================
  // AUTO CALCULATION
  // ====================================================

  if (field === "qty") {

    // AUTO FILL

    updatedRows[index].recdQty =
      value;

    updatedRows[index].inspQty =
      value;

    updatedRows[index].accQty =
      value;

    updatedRows[index].rejQty =
      0;

    updatedRows[index].status =
      "Pass";

    updatedRows[index].remarks =
      "Good";
  }

  // ====================================================
  // ACCEPTED QTY CHANGE
  // ====================================================

  const inspQty = Number(
    updatedRows[index]
      .inspQty || 0
  );

  const accQty = Number(
    updatedRows[index]
      .accQty || 0
  );

  // REJECT CALCULATION

  const rejected =
    inspQty - accQty;

  updatedRows[index].rejQty =
    rejected >= 0
      ? rejected
      : 0;

  // STATUS + REMARKS

  if (
    updatedRows[index].rejQty > 0
  ) {

    updatedRows[index].status =
      "REJECTED";

    updatedRows[index].remarks =
      "REJECTED MATERIAL";

  } else {

    updatedRows[index].status =
      "Pass";

    updatedRows[index].remarks =
      "Good";
  }

  setRows(updatedRows);
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
      uom: "NOS",
      qty: "",
      recdQty: "",
      inspQty: "",
      accQty: "",
      rejQty: 0,
      status: "Pass",
      remarks: "Good",
    },

  ]);
};
  // ======================================================
  // REMOVE ROW
  // ======================================================

  const removeRow = (index) => {

    const updatedRows =
      rows.filter(
        (_, i) => i !== index
      );

    setRows(updatedRows);
  };

  // ======================================================
  // SAVE QC
  // ======================================================

  const handleSubmit =
    async () => {

      try {

        await addDoc(
          collection(
            db,
            "qcReports"
          ),

          {
            qcNumber,
            formData,
            rows,
            signatures,
            createdAt:
              Timestamp.now(),
          }
        );

        alert(
          "QC Report Saved Successfully"
        );

      } catch (error) {

        console.log(error);

        alert(
          "Error Saving QC"
        );
      }
    };

  // ======================================================
  // TOTALS
  // ======================================================

  const totalInsp = rows.reduce(
    (a, b) =>
      a +
      Number(
        b.inspQty || 0
      ),
    0
  );

  const totalAcc = rows.reduce(
    (a, b) =>
      a +
      Number(
        b.accQty || 0
      ),
    0
  );

  const totalRej = rows.reduce(
  (a, b) =>
    a +
    Number(
      b.rejQty || 0
    ),
  0
);

  // ======================================================
  // UI
  // ======================================================
  return (

<div className="min-h-screen bg-slate-100 ml-[250px] p-6">

  {/* =====================================================
      TOP FORM SECTION
  ===================================================== */}

  <div className="bg-white rounded-[30px] shadow-xl p-8 mb-8">

    {/* HEADER */}

    <div className="flex justify-between items-center mb-8">

      <div>

        <h1 className="text-[48px] font-black text-slate-800 leading-none">
          QC CREATE
        </h1>

        <p className="text-slate-500 mt-2 text-lg">
          Incoming Inspection Report
        </p>

      </div>

      <div className="bg-blue-50 border border-blue-100 px-6 py-4 rounded-2xl">

        <h2 className="text-blue-700 font-black text-[14px] mb-5">
          {qcNumber}
        </h2>
        <div className="mb-6">

  <button
    onClick={async () => {

      await handleSubmit();

      setTimeout(() => {

        downloadPDF();

      }, 1000);

    }}
    className="bg-gradient-to-r from-green-600 to-blue-700 hover:scale-[1.02] transition-all text-white px-10 py-5 rounded-2xl font-black flex items-center gap-4 shadow-2xl"
  >

    <FaSave />

    Save & Download QC Report

  </button>

</div>

      </div>

    </div>

    {/* =====================================================
        VENDOR DETAILS
    ===================================================== */}

    <div className="mb-10">

      <h2 className="text-3xl font-black text-slate-800 mb-6">
        Vendor Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <input
          type="text"
          name="vendorName"
          placeholder="Vendor Name"
          value={formData.vendorName}
          onChange={handleChange}
          className="border border-slate-200 p-5 rounded-2xl"
        />

        <input
          type="text"
          name="invoiceNo"
          placeholder="Invoice No"
          value={formData.invoiceNo}
          onChange={handleChange}
          className="border border-slate-200 p-5 rounded-2xl"
        />

        <input
          type="date"
          name="invoiceDate"
          value={formData.invoiceDate}
          onChange={handleChange}
          className="border border-slate-200 p-5 rounded-2xl"
        />

        <input
          type="text"
          name="vehicleNo"
          placeholder="Vehicle No"
          value={formData.vehicleNo}
          onChange={handleChange}
          className="border border-slate-200 p-5 rounded-2xl"
        />

      </div>

      <textarea
        name="storeLocation"
        placeholder="Store Location"
        value={formData.storeLocation}
        onChange={handleChange}
        className="border border-slate-200 p-5 rounded-2xl w-full mt-5 h-32 resize-none"
      />

    </div>

    {/* =====================================================
        ITEM TABLE
    ===================================================== */}

    <div className="mb-10">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-3xl font-black text-slate-800">
          Inspection Items
        </h2>

        <button
          onClick={addRow}
          className="bg-blue-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-black"
        >
          <FaPlus />
          Add Row
        </button>

      </div>

      <div className="overflow-auto border border-slate-200 rounded-2xl">

        <table className="w-full border-collapse">

          <thead>

            <tr className="bg-slate-800 text-white">

              <th className="border p-4">S.No</th>
              <th className="border p-4">Part No</th>
              <th className="border p-4">Description</th>
              <th className="border p-4">Qty</th>
              <th className="border p-4">Insp</th>
              <th className="border p-4">Acc</th>
              <th className="border p-4">Rej</th>
              <th className="border p-4">Status</th>
              <th className="border p-4">Delete</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((row, index) => (

              <tr key={index}>

                <td className="border p-3 text-center">
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
                    className="w-full border rounded-xl p-3"
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
                    className="w-full border rounded-xl p-3"
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
                    className="w-full border rounded-xl p-3"
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
                    className="w-full border rounded-xl p-3"
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
                    className="w-full border rounded-xl p-3"
                  />

                </td>

                <td className="border p-2">

                  <input
                    type="number"
                    value={row.rejQty}
                    readOnly
                    className="w-full border rounded-xl p-3 bg-green-50 text-green-600"
                  />

                </td>

                <td className="border p-3 text-center">

                  <span
                    className={`px-4 py-2 rounded-xl font-black ${
                      row.status === "Pass"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.status}
                  </span>

                </td>

                <td className="border p-3 text-center">

                  <button
                    onClick={() =>
                      removeRow(index)
                    }
                    className="bg-red-100 text-red-600 p-3 rounded-xl"
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

  </div>



  {/* =====================================================
      LIVE PREVIEW BOTTOM
  ===================================================== */}

  <div className="bg-slate-200 rounded-[30px] p-8 shadow-inner">

    <div
      id="qc-preview"
      className="bg-white mx-auto shadow-2xl"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm",
      }}
    >

      {/* =====================================================
          REPORT HEADER
      ===================================================== */}

      <div className="bg-[#071633] text-white text-center py-4">

        <h1 className="text-[24px] font-black">
          INCOMING INSPECTION REPORT
        </h1>

        <p className="tracking-[4px] mt-2 text-sm">
          QUALITY CONTROL FORM
        </p>

      </div>

     

      {/* =====================================================
          VENDOR TABLE
      ===================================================== */}

      <div className="border border-black">

        <div className="bg-slate-800 text-white text-center py-3 font-black text-[16px]">
          1 | VENDOR & PURCHASE ORDER DETAILS
        </div>

        <table className="w-full border-collapse">

          <tbody>

            <tr>

              <td className="border border-black p-2 font-black bg-slate-50">
                Vendor Name
              </td>

              <td className="border border-black p-2">
                {formData.vendorName}
              </td>

              <td className="border border-black p-2 font-black bg-slate-50">
                Invoice Date
              </td>

              <td className="border border-black p-2">
                {formData.invoiceDate}
              </td>

            </tr>

            <tr>

              <td className="border border-black p-2 font-black bg-slate-50">
                Invoice No
              </td>

              <td className="border border-black p-2">
                {formData.invoiceNo}
              </td>

              <td className="border border-black p-2 font-black bg-slate-50">
                Store Location
              </td>

              <td className="border border-black p-2 break-words">
                {formData.storeLocation}
              </td>

            </tr>

            <tr>

              <td className="border border-black p-2 font-black bg-slate-50">
                Vehicle No
              </td>

              <td className="border border-black p-2">
                {formData.vehicleNo}
              </td>

              

            </tr>

          </tbody>

        </table>

      </div>

      {/* =====================================================
    ITEM DETAILS SECTION
===================================================== */}

<div className="mt-8 border border-black">

  <div className="bg-[#071633] text-white text-center py-4 border-t-4 border-orange-400">

    <h2 className="text-[16px] font-black">
      2 | ITEM DETAILS & INSPECTION FINDINGS
    </h2>

  </div>

  <table className="w-full border-collapse text-[14px]">

    <thead>

      <tr className="bg-slate-700 text-white">

        <th className="border border-black p-2">S.No</th>
        <th className="border border-black p-2">Part No</th>
        <th className="border border-black p-2">Description</th>
        <th className="border border-black p-2">UOM</th>
        <th className="border border-black p-2">Qty</th>
        <th className="border border-black p-2">Recd</th>
        <th className="border border-black p-2">Insp</th>
        <th className="border border-black p-2">Acc</th>
        <th className="border border-black p-2">Rej</th>
        <th className="border border-black p-2">Status</th>
        <th className="border border-black p-2">Remarks</th>

      </tr>

    </thead>

    <tbody>

      {rows.map((row, index) => (

        <tr key={index}>

          <td className="border border-black p-2 text-center">
            {index + 1}
          </td>

          <td className="border border-black p-2">
            {row.partNo}
          </td>

          <td className="border border-black p-2 break-words">
            {row.description}
          </td>

          <td className="border border-black p-2 text-center">
            NOS
          </td>

          <td className="border border-black p-2 text-center">
            {row.qty}
          </td>

          <td className="border border-black p-2 text-center">
            {row.qty}
          </td>

          <td className="border border-black p-2 text-center">
            {row.inspQty}
          </td>

          <td className="border border-black p-2 text-center">
            {row.accQty}
          </td>

          <td className="border border-black p-2 text-center">
            {row.rejQty || 0}
          </td>

          <td className="border border-black p-2 text-center font-black">
            {row.status}
          </td>

          <td className="border border-black p-2">
            Good
          </td>

        </tr>

      ))}

      {/* BLANK ROWS */}

      {Array.from({
        length: rows.length < 10 ? 0 - rows.length : 0,
      }).map((_, index) => (

        <tr key={`blank-${index}`}>

          <td className="border border-black h-[42px]"></td>
          <td className="border border-black"></td>
          <td className="border border-black"></td>
          <td className="border border-black"></td>
          <td className="border border-black"></td>
          <td className="border border-black"></td>
          <td className="border border-black"></td>
          <td className="border border-black"></td>
          <td className="border border-black"></td>
          <td className="border border-black"></td>
          <td className="border border-black"></td>

        </tr>

      ))}

      {/* TOTALS */}

      <tr className="bg-blue-50 font-black">

        <td
          colSpan={4}
          className="border border-black p-3 text-center"
        >
          TOTALS
        </td>

        <td className="border border-black text-center">
          {rows.reduce((a, b) => a + Number(b.qty || 0), 0)}
        </td>

        <td className="border border-black text-center">
          {rows.reduce((a, b) => a + Number(b.qty || 0), 0)}
        </td>

        <td className="border border-black text-center">
          {rows.reduce((a, b) => a + Number(b.inspQty || 0), 0)}
        </td>

        <td className="border border-black text-center">
          {rows.reduce((a, b) => a + Number(b.accQty || 0), 0)}
        </td>

        <td className="border border-black text-center">
          {rows.reduce((a, b) => a + Number(b.rejQty || 0), 0)}
        </td>

        <td className="border border-black"></td>
        <td className="border border-black"></td>

      </tr>

    </tbody>

  </table>

</div>

{/* =====================================================
    AUTHORIZATION SECTION
===================================================== */}

<div className="mt-10 border border-black mb-10">

  <div className="bg-[#071633] text-white text-center py-4 border-t-4 border-orange-400">

    <h2 className="text-[16px] font-black">
      3 | AUTHORISATION & SIGN-OFF
    </h2>

  </div>

  <div className="grid grid-cols-4">

    {/* INSPECTED BY */}

    <div className="border border-black min-h-[260px] p-4">

      <h2 className="text-center text-blue-900 font-black text-[14px] mb-10">
        INSPECTED BY
      </h2>

      <div className="border-b border-slate-400 mt-16 mb-3"></div>

      <p className="text-center text-slate-500 font-black mb-5">
        Signature
      </p>

      <p className="font-black text-[14px]">
        Name:
        <span className="font-normal ml-2">
          SUBASH
        </span>
      </p>

      <p className="font-black text-[14px] mt-4">
        Date:
        <span className="font-normal ml-2">
          {formData.invoiceDate}
        </span>
      </p>

    </div>

    {/* VERIFIED BY */}

    <div className="border border-black min-h-[260px] p-4">

      <h2 className="text-center text-blue-900 font-black text-[14px] mb-10">
        VERIFIED BY
      </h2>

      <div className="border-b border-slate-400 mt-16 mb-3"></div>

      <p className="text-center text-slate-500 font-black mb-5">
        Signature
      </p>

      <p className="font-black text-[14px]">
        Name:
        <span className="font-normal ml-2">
          ROHITH
        </span>
      </p>

      <p className="font-black text-[14px] mt-4">
        Date:
        <span className="font-normal ml-2">
          {formData.invoiceDate}
        </span>
      </p>

    </div>

    {/* STORE INCHARGE */}

    <div className="border border-black min-h-[260px] p-4">

      <h2 className="text-center text-blue-900 font-black text-[14px] mb-10">
        STORE INCHARGE
      </h2>

      <div className="border-b border-slate-400 mt-16 mb-3"></div>

      <p className="text-center text-slate-500 font-black mb-5">
        Signature
      </p>

      <p className="font-black text-[14px]">
        Name:
        <span className="font-normal ml-2">
          ARSHAD
        </span>
      </p>

      <p className="font-black text-[14px] mt-4">
        Date:
        <span className="font-normal ml-2">
          {formData.invoiceDate}
        </span>
      </p>

    </div>

    {/* APPROVED BY */}

    <div className="border border-black min-h-[260px] p-4">

      <h2 className="text-center text-blue-900 font-black text-[14px] mb-10">
        APPROVED BY
      </h2>

      <div className="border-b border-slate-400 mt-16 mb-3"></div>

      <p className="text-center text-slate-500 font-black mb-5">
        Signature
      </p>

      <p className="font-black text-[14px]">
        Name:
        <span className="font-normal ml-2">
          PRETHIVI
        </span>
      </p>

      <p className="font-black text-[14px] mt-4">
        Date:
        <span className="font-normal ml-2">
          {formData.invoiceDate}
        </span>
      </p>

    </div>

  </div>

</div>

    </div>

  </div>

</div>

);

};

export default QCcreate;