import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FaPlus, 
  FaTrashAlt, 
  FaSave, 
  FaArrowLeft, 
  FaShippingFast, 
  FaBarcode 
} from "react-icons/fa";
import { db } from "../../../firebase/firebase";

const EditDC = () => {
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
  const [formData, setFormData] = useState({
    dcNumber: "",
    date: "",
    invoiceNumber: "",
    invoiceDate: "",
    shipTo: "",
    pocName: "",
    gstin: "",
    modeOfDispatch: "",
    transporterName: "",
    gatePassNo: "",
    purchaseOrder: "",
    estimateSheet: "",
    invoice: "",
    paymentReceived: "",
    packedBy: "",
    inspectedBy: "",
  });
  const [products, setProducts] = useState([]);

  // =========================
  // INITIALIZATION PIPELINE
  // =========================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "deliveryChallans", id);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        setFormData({
          dcNumber: data.dcNumber || "",
          date: data.date || "",
          invoiceNumber: data.invoiceNumber || "",
          invoiceDate: data.invoiceDate || "",
          shipTo: data.shipTo || "",
          pocName: data.pocName || "",
          gstin: data.gstin || "",
          modeOfDispatch: data.modeOfDispatch || "",
          transporterName: data.transporterName || "",
          gatePassNo: data.gatePassNo || "",
          purchaseOrder: data.purchaseOrder || "",
          estimateSheet: data.estimateSheet || "",
          invoice: data.invoice || "",
          paymentReceived: data.paymentReceived || "",
          packedBy: data.packedBy || "",
          inspectedBy: data.inspectedBy || "",
        });
        setProducts(data.products || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Delivery Challan telemetry pull failure:", error);
      setLoading(false);
    }
  };

  // =========================
  // STATE CHANGE UTILITIES
  // =========================
  const handleInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        description: "",
        quantity: 1,
        unit: "Nos",
      },
    ]);
  };

  const removeProduct = (index) => {
    if (products.length === 1) return;
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  // =========================
  // TRANSACTION COMMIT WORK
  // =========================
  const updateDC = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, "deliveryChallans", id);

      await updateDoc(docRef, {
        ...formData,
        products,
        updatedAt: new Date(),
      });

      alert("System Registry Confirmed: Delivery Challan parameters updated successfully.");
      setSaving(false);
      navigate("/dc/history");
    } catch (error) {
      console.error("Database connection write transaction exception:", error);
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
          Opening Shipping Editor Node...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* HEADER OPERATIONS CONSOLE BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none"></div>
        <div>
          <span className="px-2.5 py-1 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-1">
            Modification Stage
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit Delivery Challan</h1>
          <p className="text-slate-400 text-sm mt-1">Override dispatch log sheets and freight parameters securely.</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => navigate("/dc/history")}
            className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-semibold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>
          <button
            onClick={updateDC}
            disabled={saving}
            className="flex-1 md:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg shadow-emerald-950/20 border border-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaSave className="text-xs" /> {saving ? "Saving Matrices..." : "Update DC Parameters"}
          </button>
        </div>
      </div>

      {/* CORE WORKFLOW INPUT STATIONS */}
      <div className="space-y-6 mb-8">
        
        {/* PARAMS INPUT GRID PANEL */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FaShippingFast className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Logistics Routing Parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Challan Registry Code</label>
              <input
                type="text"
                name="dcNumber"
                value={formData.dcNumber}
                onChange={handleInput}
                placeholder="DC Identification Index"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono font-bold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Challan Output Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Invoice Reference ID</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInput}
                placeholder="Linked Invoice Number"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Mode of Dispatch</label>
              <input
                type="text"
                name="modeOfDispatch"
                value={formData.modeOfDispatch}
                onChange={handleInput}
                placeholder="e.g. Air / Surface Cargo"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Carrier Transporter Handle</label>
              <input
                type="text"
                name="transporterName"
                value={formData.transporterName}
                onChange={handleInput}
                placeholder="Transporter Agency Title"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Security Gate Pass Code</label>
              <input
                type="text"
                name="gatePassNo"
                value={formData.gatePassNo}
                onChange={handleInput}
                placeholder="Gate Clearance Pass Index"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Consignee Ship To Profile Parameters</label>
            <textarea
              rows={10}
              name="shipTo"
              value={formData.shipTo}
              onChange={handleInput}
              placeholder="Physical client facility delivery coordinates..."
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 h-28 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 resize-none leading-relaxed font-medium"
            />
          </div>
        </div>

        {/* LEDGER COMPONENT ALLOCATIONS DATA TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <div className="flex items-center gap-2">
              <FaBarcode className="text-slate-400 text-sm" />
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Cargo Item Allocation Registry</h3>
            </div>
            <button
              onClick={addProduct}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-700 shadow transition-all flex items-center gap-1.5"
            >
              <FaPlus className="text-[10px]" /> Append Cargo Item
            </button>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 bg-slate-50">
                  <th className="p-3 pl-4 w-[60%]">Product Variant Description</th>
                  <th className="p-3 w-[15%] text-center">Quantity</th>
                  <th className="p-3 w-[15%] text-center">Unit Type</th>
                  <th className="p-3 text-center pr-4 w-[10%]">Purge Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {products.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-2 pl-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleProduct(index, "description", e.target.value)}
                        placeholder="Component Spec nomenclature..."
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleProduct(index, "quantity", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center font-mono text-sm focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleProduct(index, "unit", e.target.value)}
                        placeholder="e.g. Nos / Sets"
                        className="w-full bg-transparent border border-slate-200/60 rounded px-3 py-2 text-center focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2 text-center pr-4">
                      <button
                        onClick={() => removeProduct(index)}
                        disabled={products.length === 1}
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

export default EditDC;