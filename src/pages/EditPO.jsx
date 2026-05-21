import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaArrowLeft,
  FaUserTie,
  FaBarcode,
  FaTrashAlt
} from "react-icons/fa";
import { db } from "../firebase/firebase";

const EditPO = () => {
  // =========================================
  // PARAMS & ROUTING
  // =========================================
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================================
  // SYSTEM MATRIX STATES
  // =========================================
  const [loading, setLoading] = useState(true);
  const [poData, setPoData] = useState(null);
  const [vendors, setVendors] = useState([]);

  // =========================================
  // INITIALIZATION
  // =========================================
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([fetchPO(), fetchVendors()]);
    } catch (error) {
      console.error("Data pipeline load exception:", error);
    }
  };

  const fetchPO = async () => {
    try {
      const docRef = doc(db, "purchaseOrders", id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setPoData({
          ...data,
          vendorName: data.vendorData?.vendorName || data.vendorName || "",
          vendorPhone: data.vendorData?.vendorPhone || data.vendorPhone || "",
          vendorGST: data.vendorData?.vendorGST || data.vendorGST || "",
          vendorAddress: data.vendorData?.vendorAddress || data.vendorAddress || "",
        });
      }
    } catch (error) {
      console.error("Error reading order register item:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const snapshot = await getDocs(collection(db, "vendors"));
      const vendorsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVendors(vendorsList);
    } catch (error) {
      console.error("Error parsing vendor mapping index:", error);
    }
  };

  // =========================================
  // STATE HANDLING MATRIX
  // =========================================
  const handleChange = (field, value) => {
    setPoData({
      ...poData,
      [field]: value
    });
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...poData.products];
    updated[index][field] = value;

    const qty = Number(updated[index].qty || 0);
    const unitPrice = Number(updated[index].unitPrice || 0);
    const taxable = qty * unitPrice;

    updated[index].taxableAmount = taxable;
    updated[index].cgstAmount = (taxable * Number(updated[index].cgstRate || 0)) / 100;
    updated[index].igstAmount = (taxable * Number(updated[index].igstRate || 0)) / 100;

    setPoData({
      ...poData,
      products: updated
    });
  };

  const addProduct = () => {
    setPoData({
      ...poData,
      products: [
        ...poData.products,
        {
          product: "",
          model: "",
          hsn: "",
          qty: 1,
          unitPrice: 0,
          taxableAmount: 0,
          cgstRate: 9,
          cgstAmount: 0,
          igstRate: 18,
          igstAmount: 0
        }
      ]
    });
  };

  const removeProduct = (index) => {
    if (poData.products.length === 1) return;
    const updated = [...poData.products];
    updated.splice(index, 1);
    setPoData({
      ...poData,
      products: updated
    });
  };

  // =========================================
  // COMMIT TRANSACTION (UPDATE)
  // =========================================
  const updatePO = async () => {
    try {
      // DUPLICATE MANIFEST CHECK
      const snapshot = await getDocs(collection(db, "purchaseOrders"));
      const duplicate = snapshot.docs.find((item) => {
        const data = item.data();
        return data.poNumber === poData.poNumber && item.id !== id;
      });

      if (duplicate) {
        alert("Operation aborted: PO Number identity index conflict.");
        return;
      }

      // TALLY MATRIX RE-CALCULATION
      const subtotal = poData.products.reduce((acc, item) => acc + Number(item.taxableAmount || 0), 0);
      const totalCGST = poData.products.reduce((acc, item) => acc + Number(item.cgstAmount || 0), 0);
      const totalIGST = poData.products.reduce((acc, item) => acc + Number(item.igstAmount || 0), 0);
      const grandTotal = subtotal + totalCGST + totalIGST;

      await updateDoc(doc(db, "purchaseOrders", id), {
        ...poData,
        subtotal,
        totalCGST,
        totalIGST,
        grandTotal,
        vendorData: {
          vendorName: poData.vendorName || "",
          vendorPhone: poData.vendorPhone || "",
          vendorGST: poData.vendorGST || "",
          vendorAddress: poData.vendorAddress || "",
        },
        updatedAt: new Date()
      });

      alert("System Registry Confirmed: Purchase Order variables finalized.");
      navigate("/history");
    } catch (error) {
      console.error(error);
      alert("Database error: Transaction commit failed.");
    }
  };

  // =========================================
  // PURGE TRANSACTION (DELETE)
  // =========================================
  const deletePO = async () => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this Purchase Order?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "purchaseOrders", id));
      alert("Purchase Order registry trace purged.");
      navigate("/history");
    } catch (error) {
      console.error(error);
    }
  };

  // =========================================
  // RUNTIME LOADING STAGE
  // =========================================
  if (loading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-slate-950 text-white ml-[250px]">
        <div className="w-14 h-14 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Opening Avionics Editor Node...
        </p>
      </div>
    );
  }

  if (!poData) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-slate-50 p-6 ml-[250px] text-slate-700">
        <div className="text-3xl font-bold">PO not found</div>
        <p className="text-sm text-slate-500">The requested purchase order could not be loaded.</p>
        <button
          onClick={() => navigate("/history")}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go back to History
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* HEADER OPERATIONS CONSOLE BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none"></div>
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-1">
            Modification Stage
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit Purchase Order</h1>
          <p className="text-slate-400 text-sm mt-0.5">Override global database logging fields securely.</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => navigate("/history")}
            className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-semibold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>
          <button
            onClick={updatePO}
            className="flex-1 md:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg shadow-emerald-950/20 border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
          >
            <FaSave className="text-xs" /> Save Changes
          </button>
          <button
            onClick={deletePO}
            className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold px-4 py-3 rounded-xl border border-rose-500/30 transition-all flex items-center justify-center gap-2"
          >
            <FaTrash className="text-xs" /> Delete Manifest
          </button>
        </div>
      </div>

      {/* CORE WORKFLOW ENTRY BLOCK */}
      <div className="space-y-6">
        
        {/* PARAMS INPUT GRID PANEL */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FaUserTie className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Identity Mapping parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">PO Registry Code</label>
              <input
                type="text"
                value={poData.poNumber || ""}
                onChange={(e) => handleChange("poNumber", e.target.value)}
                placeholder="PO Identification Index"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono font-bold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Tracking Reference ID</label>
              <input
                type="text"
                value={poData.referenceNo || ""}
                onChange={(e) => handleChange("referenceNo", e.target.value)}
                placeholder="Reference Identifier"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Vendor Terminal Mapping</label>
              <select
                value={poData.vendorId || ""}
                onChange={(e) => {
                  const selectedVendor = vendors.find((v) => v.id === e.target.value);
                  if (selectedVendor) {
                    setPoData({
                      ...poData,
                      vendorId: selectedVendor.id,
                      vendorName: selectedVendor.vendorName || "",
                      vendorPhone: selectedVendor.vendorPhone || "",
                      vendorGST: selectedVendor.vendorGST || "",
                      vendorAddress: selectedVendor.vendorAddress || "",
                      vendorData: {
                        vendorName: selectedVendor.vendorName || "",
                        vendorPhone: selectedVendor.vendorPhone || "",
                        vendorGST: selectedVendor.vendorGST || "",
                        vendorAddress: selectedVendor.vendorAddress || "",
                      }
                    });
                  }
                }}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              >
                <option value="">Link Registry Vendor Profile</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendorName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Document Execution Date</label>
              <input
                type="date"
                value={poData.templateDate || ""}
                onChange={(e) => handleChange("templateDate", e.target.value)}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Supplier Designation Name</label>
              <input
                type="text"
                value={poData.vendorName || ""}
                onChange={(e) => handleChange("vendorName", e.target.value)}
                placeholder="Corporate Handle"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Secure Contact Line</label>
              <input
                type="text"
                value={poData.vendorPhone || ""}
                onChange={(e) => handleChange("vendorPhone", e.target.value)}
                placeholder="Secure Line"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Corporate GSTIN Code</label>
              <input
                type="text"
                value={poData.vendorGST || ""}
                onChange={(e) => handleChange("vendorGST", e.target.value)}
                placeholder="33XXXXXXXXXXXXX"
                className="w-full md:w-1/3 border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono uppercase tracking-widest outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Registered Vault Headquarters Address</label>
            <textarea
              value={poData.vendorAddress || ""}
              onChange={(e) => handleChange("vendorAddress", e.target.value)}
              placeholder="Physical Site Dispatch Parameters"
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 h-24 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* LEDGER COMPONENT DISPATCH LAYER TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <div className="flex items-center gap-2">
              <FaBarcode className="text-slate-400 text-sm" />
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Component Manifest Mapping</h3>
            </div>
            <button
              onClick={addProduct}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-700 shadow transition-all flex items-center gap-1.5"
            >
              <FaPlus className="text-[10px]" /> Append Item Vector
            </button>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1300px]">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 bg-slate-50">
                  <th className="p-2.5 pl-4 w-[18%]">Product Line</th>
                  <th className="p-2.5 w-[14%]">Model Specification</th>
                  <th className="p-2.5 w-[10%]">HSN Index</th>
                  <th className="p-2.5 w-[7%] text-center">Qty</th>
                  <th className="p-2.5 w-[12%]">Rate Base (₹)</th>
                  <th className="p-2.5 w-[12%]">Taxable Allocation (₹)</th>
                  <th className="p-2.5 w-[7%] text-center">CGST %</th>
                  <th className="p-2.5 w-[10%]">CGST Amt (₹)</th>
                  <th className="p-2.5 w-[7%] text-center">IGST %</th>
                  <th className="p-2.5 w-[10%]">IGST Amt (₹)</th>
                  <th className="p-2.5 text-center pr-4">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {poData.products?.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-2 pl-4">
                      <input
                        type="text"
                        value={item.product}
                        onChange={(e) => handleProductChange(index, "product", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-2 py-1.5 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.model}
                        onChange={(e) => handleProductChange(index, "model", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-2 py-1.5 focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.hsn}
                        onChange={(e) => handleProductChange(index, "hsn", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-2 py-1.5 text-center font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleProductChange(index, "qty", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-1 py-1.5 text-center font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleProductChange(index, "unitPrice", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-2 py-1.5 font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.taxableAmount}
                        readOnly
                        className="w-full border border-slate-200/40 bg-slate-100/70 rounded px-2 py-1.5 font-mono font-bold text-slate-500 outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.cgstRate}
                        onChange={(e) => handleProductChange(index, "cgstRate", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-1 py-1.5 text-center font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.cgstAmount}
                        readOnly
                        className="w-full border border-slate-200/40 bg-slate-100/70 rounded px-2 py-1.5 font-mono text-slate-500 outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.igstRate}
                        onChange={(e) => handleProductChange(index, "igstRate", e.target.value)}
                        className="w-full bg-transparent border border-slate-200/60 rounded px-1 py-1.5 text-center font-mono focus:border-blue-500 focus:bg-white outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.igstAmount}
                        readOnly
                        className="w-full border border-slate-200/40 bg-slate-100/70 rounded px-2 py-1.5 font-mono text-slate-500 outline-none"
                      />
                    </td>
                    <td className="p-2 text-center pr-4">
                      <button
                        onClick={() => removeProduct(index)}
                        disabled={poData.products.length === 1}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded bg-slate-50 hover:bg-rose-50 border border-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

export default EditPO;