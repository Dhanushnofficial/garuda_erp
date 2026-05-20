import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { 
  FaArrowLeft, 
  FaPlus, 
  FaTrashAlt, 
  FaSave, 
  FaFileInvoice, 
  FaBarcode 
} from "react-icons/fa";
import { db } from "../../firebase/firebase";

const RDCEdit = () => {
  // =====================================
  // PARAMS & ROUTING
  // =====================================
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================
  // SYSTEM OPERATION STATES
  // =====================================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    rdcNumber: "",
    rdcDate: "",
    fromAddress: "",
    toAddress: "",
    gatePassNo: "",
    modeOfDispatch: "",
    vehicleNo: "",
    returnDate: "",
    requestBy: "",
    employeePilot: "",
    mailDate: "",
    issuedBy: "",
    checkedBy: "",
  });
  const [items, setItems] = useState([]);

  // =====================================
  // INITIALIZATION PIPELINE
  // =====================================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "rdcDocuments", id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setFormData({
          rdcNumber: data.rdcNumber || "",
          rdcDate: data.rdcDate || "",
          fromAddress: data.fromAddress || "",
          toAddress: data.toAddress || "",
          gatePassNo: data.gatePassNo || "",
          modeOfDispatch: data.modeOfDispatch || "",
          vehicleNo: data.vehicleNo || "",
          returnDate: data.returnDate || "",
          requestBy: data.requestBy || "",
          employeePilot: data.employeePilot || "",
          mailDate: data.mailDate || "",
          issuedBy: data.issuedBy || "",
          checkedBy: data.checkedBy || "",
        });
        setItems(data.items || []);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    } catch (error) {
      console.error("Telemetry streaming pull exception:", error);
      setLoading(false);
    }
  };

  // =====================================
  // STATE HANDLING MATRIX
  // =====================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: "",
        uom: "Nos",
      },
    ]);
  };

  const deleteRow = (index) => {
    if (items.length === 1) return;
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // =====================================
  // TRANSACTION COMMIT WORK
  // =====================================
  const updateRDC = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, "rdcDocuments", id);

      await updateDoc(docRef, {
        ...formData,
        items,
        updatedAt: new Date(),
      });

      alert("System Registry Confirmed: Returnable Delivery Challan variables committed.");
      navigate("/rdc/history");
    } catch (error) {
      console.error("Database connection write transaction failed:", error);
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // SYSTEM RUNTIME LOADING STAGE
  // =====================================
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col gap-4 items-center justify-center bg-slate-950 text-white z-[9999] ml-[250px]">
        <div className="w-14 h-14 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Opening Loop Manifest Editor...
        </p>
      </div>
    );
  }

  if (!loading && notFound) {
    return (
      <div className="min-h-screen bg-slate-50 ml-[250px] flex flex-col justify-center items-center px-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Manifest File Missing</h2>
        <p className="text-sm text-slate-500 mb-6 text-center max-w-lg">The requested RDC record could not be found. Please verify the link or return to history.</p>
        <button onClick={() => navigate("/rdc/history")} className="bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-semibold">
          Return to History
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* HEADER OPERATIONS CONSOLE BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none"></div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/rdc/history")}
            className="w-11 h-11 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 flex items-center justify-center shadow-inner transition-colors active:scale-95"
            title="Return to RDC Manifest"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <span className="px-2.5 py-1 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-1">
              Modification Stage
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit Returnable Delivery Challan</h1>
            <p className="text-slate-400 text-sm mt-1">Override loop tracking log fields and component parameters securely.</p>
          </div>
        </div>

        <button
          onClick={updateRDC}
          disabled={saving}
          className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-5 py-3.5 rounded-xl shadow-lg shadow-emerald-950/20 border border-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FaSave className="text-xs" /> 
          {saving ? "Updating Record..." : "Update RDC Schema"}
        </button>
      </div>

      {/* CORE WORKFLOW ENTRY BLOCKS */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-8">
        
        {/* PARAMS CONTROL SYSTEM INPUTS GRID */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FaFileInvoice className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Logistics Loop Parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { id: "rdcNumber", title: "RDC Registry Identifier", mono: true, bold: true },
              { id: "rdcDate", title: "Challan Output Date", type: "date" },
              { id: "gatePassNo", title: "Security Gate Pass No", mono: true },
              { id: "modeOfDispatch", title: "Mode of Dispatch" },
              { id: "vehicleNo", title: "Carrier Vehicle Code", mono: true },
              { id: "returnDate", title: "Expected Return Date", type: "date" },
              { id: "requestBy", title: "Requesting Authority" },
              { id: "employeePilot", title: "Assigned Employee / Pilot" },
              { id: "mailDate", title: "System Mail Notification Date", type: "date" },
              { id: "issuedBy", title: "Authorized Issuing Officer" },
              { id: "checkedBy", title: "Inspected Checking Officer" },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">
                  {field.title}
                </label>
                <input
                  type={field.type || "text"}
                  name={field.id}
                  value={formData[field.id]}
                  onChange={handleChange}
                  className={`w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 ${
                    field.mono ? "font-mono" : ""
                  } ${field.bold ? "font-bold" : ""}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* GEOGRAPHIC ROUTING BUFFER ADDR FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Origin (From Address) Parameters</label>
            <textarea
              rows={4}
              name="fromAddress"
              value={formData.fromAddress}
              onChange={handleChange}
              placeholder="Physical originating warehouse coordinates..."
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 h-28 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 resize-none leading-relaxed font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Destination (To Address) Parameters</label>
            <textarea
              rows={4}
              name="toAddress"
              value={formData.toAddress}
              onChange={handleChange}
              placeholder="Target destination facility coordinates..."
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 h-28 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 resize-none leading-relaxed font-medium"
            />
          </div>
        </div>

        {/* LEDGER COMPONENT ALLOCATIONS DATA TABLE */}
        <div className="border border-slate-200/60 rounded-2xl overflow-hidden mt-4">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
            <div className="flex items-center gap-2">
              <FaBarcode className="text-slate-400 text-sm" />
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Avionics Hardware Allocations Ledger</h3>
            </div>
            <button
              onClick={addRow}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-700 shadow-sm transition-all flex items-center gap-1.5"
            >
              <FaPlus className="text-[10px]" /> Append Ledger Row
            </button>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px] table-fixed">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 bg-slate-50/60">
                  <th className="p-3 pl-4 w-[10%] text-center">Index</th>
                  <th className="p-3 w-[55%]">Component Variant Nomenclature Description</th>
                  <th className="p-3 text-center w-[12%]">Quantity</th>
                  <th className="p-3 text-center w-[13%]">UOM Scale</th>
                  <th className="p-3 text-center pr-4 w-[10%]">Purge Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-2 text-center font-mono font-bold text-slate-400 text-sm">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="Component Spec parameters..."
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center font-mono text-sm focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={item.uom}
                        onChange={(e) => handleItemChange(index, "uom", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center font-medium focus:border-blue-500 focus:bg-white outline-none"
                      >
                        <option value="Nos">Nos</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Box">Box</option>
                      </select>
                    </td>
                    <td className="p-2 text-center pr-4">
                      <button
                        onClick={() => deleteRow(index)}
                        disabled={items.length === 1}
                        className="w-10 h-10 text-slate-400 hover:text-rose-600 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-100 flex items-center justify-center mx-auto transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default RDCEdit;