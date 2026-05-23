import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FaPlus,
  FaTrash,
  FaSave,
} from "react-icons/fa";

import { db } from "../../firebase/firebase";

const QCEdit = () => {

  // ======================================================
  // PARAMS
  // ======================================================

  const { id } = useParams();

  const navigate = useNavigate();

  // ======================================================
  // STATES
  // ======================================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [qcNumber, setQcNumber] =
    useState("");

  // ======================================================
  // FORM DATA
  // ======================================================

  const [formData, setFormData] =
    useState({
      vendorName: "",
      invoiceNo: "",
      invoiceDate: "",
      vehicleNo: "",
      storeLocation: "",
    });

  // ======================================================
  // ROWS
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

  const [signatures, setSignatures] =
    useState({
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
  // FETCH DATA
  // ======================================================

  useEffect(() => {
    fetchQC();
  }, []);

  const fetchQC = async () => {

    try {

      setLoading(true);

      const docRef = doc(
        db,
        "qcReports",
        id
      );

      const snapshot =
        await getDoc(docRef);

      if (snapshot.exists()) {

        const data =
          snapshot.data();

        setQcNumber(
          data.qcNumber || ""
        );

        setFormData(
          data.formData || {}
        );

        setRows(
          data.rows || []
        );

        setSignatures(
          data.signatures || {}
        );
      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
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

    updatedRows[index][field] =
      value;

    setRows(updatedRows);
  };

  // ======================================================
  // HANDLE SIGNATURE CHANGE
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

    if (rows.length === 1)
      return;

    const updatedRows = [...rows];

    updatedRows.splice(index, 1);

    setRows(updatedRows);
  };

  // ======================================================
  // TOTALS
  // ======================================================

  const totalQty = rows.reduce(
    (acc, item) =>
      acc +
      Number(item.qty || 0),
    0
  );

  const totalRecd = rows.reduce(
    (acc, item) =>
      acc +
      Number(item.recdQty || 0),
    0
  );

  const totalInsp = rows.reduce(
    (acc, item) =>
      acc +
      Number(item.inspQty || 0),
    0
  );

  const totalAcc = rows.reduce(
    (acc, item) =>
      acc +
      Number(item.accQty || 0),
    0
  );

  const totalRej = rows.reduce(
    (acc, item) =>
      acc +
      Number(item.rejQty || 0),
    0
  );

  // ======================================================
  // UPDATE QC
  // ======================================================

  const updateQC = async () => {

    try {

      setSaving(true);

      const docRef = doc(
        db,
        "qcReports",
        id
      );

      await updateDoc(docRef, {

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

        updatedAt:
          new Date(),
      });

      alert(
        "QC Report Updated Successfully"
      );

      navigate("/qc/history");

    } catch (error) {

      console.log(error);

      alert(
        "Update Failed"
      );

    } finally {

      setSaving(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (

      <div className="flex justify-center items-center min-h-screen bg-slate-950 ml-[250px]">

        <div className="text-center">

          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="text-white mt-5 uppercase tracking-widest text-sm">
            Loading QC Report...
          </p>

        </div>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-slate-100 p-6 ml-[250px]">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl flex justify-between items-center mb-8">

        <div>

          <p className="text-blue-400 text-xs uppercase tracking-widest font-bold">
            Quality Control
          </p>

          <h1 className="text-4xl font-black text-white mt-2">
            Edit QC Report
          </h1>

          <p className="text-slate-400 mt-2">
            Update incoming inspection report
          </p>

        </div>

        <div className="text-right">

          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-5 py-3 rounded-2xl font-black text-xl">
            {qcNumber}
          </div>

        </div>

      </div>

      {/* ======================================================
          FORM
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

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
                value={
                  formData.vendorName
                }
                onChange={
                  handleChange
                }
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
                value={
                  formData.invoiceNo
                }
                onChange={
                  handleChange
                }
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
                value={
                  formData.vehicleNo
                }
                onChange={
                  handleChange
                }
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
                value={
                  formData.invoiceDate
                }
                onChange={
                  handleChange
                }
                className="w-full border rounded-xl p-3 mt-2"
              />

            </div>

            <div>

              <label className="font-bold text-sm">
                Store Location
              </label>

              <textarea
                name="storeLocation"
                rows="5"
                value={
                  formData.storeLocation
                }
                onChange={
                  handleChange
                }
                className="w-full border rounded-xl p-3 mt-2 resize-none"
              />

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          ITEMS TABLE
      ====================================================== */}

      <div className="bg-white rounded-3xl shadow-lg border overflow-hidden mb-8">

        <div className="bg-slate-900 p-5 flex justify-between items-center">

          <div>

            <h2 className="text-2xl font-black text-white">
              Item Inspection Details
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              Update inspection materials
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

          <table className="w-full min-w-[1400px]">

            <thead>

              <tr className="bg-slate-800 text-white text-sm">

                <th className="p-4">
                  S.No
                </th>

                <th className="p-4">
                  Part No
                </th>

                <th className="p-4">
                  Description
                </th>

                <th className="p-4">
                  UOM
                </th>

                <th className="p-4">
                  Qty
                </th>

                <th className="p-4">
                  Recd Qty
                </th>

                <th className="p-4">
                  Insp Qty
                </th>

                <th className="p-4">
                  Acc Qty
                </th>

                <th className="p-4">
                  Rej Qty
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4">
                  Remarks
                </th>

                <th className="p-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {rows.map((row, index) => (

                <tr
                  key={index}
                  className="border-t"
                >

                  <td className="p-3 text-center font-bold">
                    {index + 1}
                  </td>

                  <td className="p-3">

                    <input
                      type="text"
                      value={
                        row.partNo
                      }
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

                  <td className="p-3">

                    <input
                      type="text"
                      value={
                        row.description
                      }
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

                  <td className="p-3">

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

                  <td className="p-3">

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

                  <td className="p-3">

                    <input
                      type="number"
                      value={
                        row.recdQty
                      }
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

                  <td className="p-3">

                    <input
                      type="number"
                      value={
                        row.inspQty
                      }
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

                  <td className="p-3">

                    <input
                      type="number"
                      value={
                        row.accQty
                      }
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

                  <td className="p-3">

                    <input
                      type="number"
                      value={
                        row.rejQty
                      }
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

                  <td className="p-3">

                    <select
                      value={
                        row.status
                      }
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

                  <td className="p-3">

                    <input
                      type="text"
                      value={
                        row.remarks
                      }
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

                  <td className="p-3 text-center">

                    <button
                      onClick={() =>
                        removeRow(index)
                      }
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl"
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
          SIGNATURES
      ====================================================== */}

      <div className="bg-white rounded-3xl shadow-lg border p-6 mb-8">

        <h2 className="text-2xl font-black mb-6">
          Authorization & Sign-Off
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {[
            {
              key: "inspectedBy",
              label: "Inspected By",
            },

            {
              key: "verifiedBy",
              label: "Verified By",
            },

            {
              key: "storeIncharge",
              label: "Store Incharge",
            },

            {
              key: "approvedBy",
              label: "Approved By",
            },
          ].map((section) => (

            <div
              key={section.key}
              className="border rounded-2xl p-5 bg-slate-50"
            >

              <h3 className="font-black text-lg mb-5">
                {section.label}
              </h3>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="Name"
                  value={
                    signatures[
                      section.key
                    ]?.name || ""
                  }
                  onChange={(e) =>
                    handleSignatureChange(
                      section.key,
                      "name",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

                <input
                  type="date"
                  value={
                    signatures[
                      section.key
                    ]?.date || ""
                  }
                  onChange={(e) =>
                    handleSignatureChange(
                      section.key,
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
          UPDATE BUTTON
      ====================================================== */}

      <div className="flex justify-end">

        <button
          onClick={updateQC}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg"
        >

          <FaSave />

          {saving
            ? "Updating..."
            : "Update QC Report"}

        </button>

      </div>

    </div>
  );
};

export default QCEdit;