import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaTrashAlt,
  FaSave,
  FaClipboardList,
  FaBarcode
} from "react-icons/fa";
import { db } from "../../../firebase/firebase";

const ChecklistEdit = () => {
  // =========================
  // PARAMS & ROUTING
  // =========================
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // SYSTEM OPERATION STATES
  // =========================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    loiNumber: "",
    challanNumber: "",
    date: "",
    packedBy: "",
    inspectedBy: "",
    items: [],
  });

  // =========================
  // INITIALIZATION PIPELINE
  // =========================
  useEffect(() => {
    if (id) {
      fetchChecklist();
    }
  }, [id]);

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "listOfItems", id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setFormData({
          loiNumber: data?.loiNumber || "",
          challanNumber: data?.challanNumber || "",
          date: data?.date || "",
          packedBy: data?.packedBy || "",
          inspectedBy: data?.inspectedBy || "",
          items: data?.items || [],
        });
      } else {
        setNotFound(true);
      }
      setLoading(false);
    } catch (error) {
      console.error("Telemetry fetch loop exception:", error);
      setLoading(false);
    }
  };

  if (!loading && notFound) {
    return (
      <div className="min-h-screen bg-slate-50 ml-[250px] flex flex-col justify-center items-center text-slate-500 px-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Manifest File Missing</h2>
        <p className="text-sm text-slate-400 mb-6 text-center max-w-md">The requested List of Items registry profile could not be resolved.</p>
        <button onClick={() => navigate("/dc/checklist-history")} className="bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-semibold">
          Return to History
        </button>
      </div>
    );
  }

  // =========================
  // STATE HANDLING MATRIX
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: "",
          serialNumber: "",
          quantity: "",
          boxes: "",
        },
      ],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // =========================
  // TRANSACTION COMMIT WORK
  // =========================
  const updateChecklist = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, "listOfItems", id), {
        ...formData,
        totalItems: formData.items.length,
        updatedAt: new Date(),
      });

      alert("System Registry Confirmed: Quality checksheet parameters modified.");
      navigate("/dc/checklist-history");
    } catch (error) {
      console.error("Database transaction save failure:", error);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // SYSTEM RUNTIME LOADING STAGE
  // =========================
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col gap-4 items-center justify-center bg-slate-950 text-white z-[9999] ml-[250px]">
        <div className="w-14 h-14 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Opening Inspection Node Editor...
        </p>
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
            onClick={() => navigate("/dc/checklist-history")}
            className="w-11 h-11 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 flex items-center justify-center shadow-inner transition-colors active:scale-95"
            title="Return to Checklist Registry"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <span className="px-2.5 py-1 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-1">
              Audit Operations
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit List of Items Checklist</h1>
            <p className="text-slate-400 text-sm mt-0.5">Override verified quality checkpoint rows and tracking variables securely.</p>
          </div>
        </div>

        <button
          onClick={updateChecklist}
          disabled={saving}
          className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-5 py-3.5 rounded-xl shadow-lg shadow-emerald-950/20 border border-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FaSave className="text-xs" /> 
          {saving ? "Updating Record..." : "Update Checks Manifest"}
        </button>
      </div>

      {/* CORE WORKFLOW ENTRY BLOCKS */}
      <div className="space-y-6">
        
        {/* PARAMS INPUT GRID PANEL */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FaClipboardList className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Verification Audit Seals</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">LOI Number ID</label>
              <input
                type="text"
                name="loiNumber"
                value={formData.loiNumber}
                onChange={handleChange}
                placeholder="LOI-XXXXX"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono font-bold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Challan Reference No</label>
              <input
                type="text"
                name="challanNumber"
                value={formData.challanNumber}
                onChange={handleChange}
                placeholder="DC-XXXXX"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono font-bold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Inspection Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Packed By Technician</label>
              <input
                type="text"
                name="packedBy"
                value={formData.packedBy}
                onChange={handleChange}
                placeholder="Operator Signature"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Quality Inspected By</label>
              <input
                type="text"
                name="inspectedBy"
                value={formData.inspectedBy}
                onChange={handleChange}
                placeholder="Auditor Signature"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>
        </div>

        {/* COMPONENT QUALITY CHECKLIST DATA GRID TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <div className="flex items-center gap-2">
              <FaBarcode className="text-slate-400 text-sm" />
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Item Allocation Matrix Rows</h3>
            </div>
            <button
              onClick={addItem}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-700 shadow transition-all flex items-center gap-1.5"
            >
              <FaPlus className="text-[10px]" /> Append Checklist Item
            </button>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px] table-fixed">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 bg-slate-50">
                  <th className="p-3 pl-4 w-[40%]">Component Description Spec</th>
                  <th className="p-3 text-center w-[20%]">Trace Serial String</th>
                  <th className="p-3 text-center w-[15%]">Allocated Qty</th>
                  <th className="p-3 text-center w-[15%]">Container Boxes</th>
                  <th className="p-3 text-center pr-4 w-[10%]">Purge Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {formData.items?.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-2 pl-4">
                      <input
                        type="text"
                        value={item?.description || ""}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="Component nomenclature variant..."
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item?.serialNumber || ""}
                        onChange={(e) => handleItemChange(index, "serialNumber", e.target.value)}
                        placeholder="S/N Variant Tag"
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center font-mono text-slate-600 focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item?.quantity || ""}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item?.boxes || ""}
                        onChange={(e) => handleItemChange(index, "boxes", e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2 text-center pr-4">
                      <button
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
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

export default ChecklistEdit;