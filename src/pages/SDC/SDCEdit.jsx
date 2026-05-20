import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { 
  FaArrowLeft, 
  FaPlus, 
  FaTrashAlt, 
  FaSave, 
  FaFileInvoice, 
  FaTruck, 
  FaUserCheck,
  FaShieldAlt,
  FaLock,
  FaBarcode 
} from "react-icons/fa";
import { db } from "../../firebase/firebase";

const SDCEdit = () => {
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

  // =====================================
  // FORM MANIFEST DATA
  // =====================================
  const [formData, setFormData] = useState({
    sdcNumber: "",
    date: "",
    fromAddress: "",
    shipTo: "",
    challanType: "",
    invoiceNo: "",
    modeOfDispatch: "",
    gatePassNo: "",
    transporterName: "",
    packedBy: "",
    verifiedBy: "",
    warranty: "",
    inwardProof: "",
    invoice: "",
    paymentReceived: "",
    insurance: "",
    mailProof: "",
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
      const docRef = doc(db, "sdcDocuments", id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setFormData({ ...data });
        setItems(data.items || []);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    } catch (error) {
      console.error("Telemetry data pull error exception:", error);
      setLoading(false);
    }
  };

  // =====================================
  // STATE HANDLING MATRIX
  // =====================================
  const handleInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItem = (index, field, value) => {
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
  const updateSDC = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, "sdcDocuments", id);

      await updateDoc(docRef, {
        ...formData,
        items,
        updatedAt: new Date(),
      });

      alert("System Registry Confirmed: Service Delivery Challan updated successfully.");
      navigate("/dc/sdc-history");
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
          Opening SDC Editor Terminal...
        </p>
      </div>
    );
  }

  if (!loading && notFound) {
    return (
      <div className="min-h-screen bg-slate-50 ml-[250px] flex flex-col justify-center items-center px-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Manifest File Missing</h2>
        <p className="text-sm text-slate-500 mb-6 text-center max-w-lg">The requested Service Delivery Challan could not be found. Please verify the link or return to history.</p>
        <button onClick={() => navigate("/sdc/history")} className="bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-semibold">
          Return to History
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 ml-[250px] font-sans antialiased text-slate-800 selection:bg-blue-500 selection:text-white">
      
      {/* HEADER OPERATIONS CONSOLE BAR */}
      <div className="fixed top-0 left-[250px] right-0 z-20 bg-slate-900 border-b border-slate-800 shadow-xl px-6 py-5 xl:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/sdc/history")}
              className="w-11 h-11 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 flex items-center justify-center shadow-inner transition-colors active:scale-95"
              title="Return to SDC History"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
              <FaFileInvoice className="text-xl" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-0.5">
                Modification Terminal
              </span>
              <h1 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight">Edit Service Delivery Challan</h1>
            </div>
          </div>

          <button
            onClick={updateSDC}
            disabled={saving}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-950/20 border border-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaSave className="text-xs" /> 
            {saving ? "Updating Parameters..." : "Update SDC Record"}
          </button>

        </div>
      </div>

      {/* CORE FORM ENTRY GRID PLACEMENT */}
      <div className="max-w-[1400px] mx-auto px-6 xl:px-10 pt-36 pb-12 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* STATION MODULE 1: DELIVERY METRICS */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <FaTruck className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Logistics Routing Metrics</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Challan Output Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Challan Billing Variant</label>
              <select
                name="challanType"
                value={formData.challanType}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              >
                <option value="">Select Challan Classification</option>
                <option value="Paid">Paid</option>
                <option value="Free">Free</option>
                <option value="Warranty">Warranty</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Invoice Reference Code</label>
              <input
                type="text"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleInput}
                placeholder="Linked Invoice Number"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Mode of Dispatch</label>
              <select
                name="modeOfDispatch"
                value={formData.modeOfDispatch}
                onChange={handleInput}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              >
                <option value="">Select Transit Mode</option>
                <option value="Courier">Courier</option>
                <option value="By Hand">By Hand</option>
                <option value="Transport">Transport</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Security Gate Pass No</label>
              <input
                type="text"
                name="gatePassNo"
                value={formData.gatePassNo}
                onChange={handleInput}
                placeholder="Gate Clearance Code"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Carrier Transporter Title</label>
              <input
                type="text"
                name="transporterName"
                value={formData.transporterName}
                onChange={handleInput}
                placeholder="Transporter Agency Name"
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>
        </div>

        {/* STATION MODULE 2: ROUTING BOUNDARY PARAMETERS */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <FaUserCheck className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Geographic Boundary Allocation</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Dispatch Origin (From Address)</label>
              <textarea
                rows={5}
                name="fromAddress"
                value={formData.fromAddress}
                onChange={handleInput}
                placeholder="Physical shipping warehouse coordinates..."
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 h-32 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Consignee Target (Ship To)</label>
              <textarea
                rows={5}
                name="shipTo"
                value={formData.shipTo}
                onChange={handleInput}
                placeholder="Destination client facility delivery coordinates..."
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 h-32 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* STATION MODULE 3: COMPLIANCE MATRIX SELECTORS */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5 xl:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <FaShieldAlt className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Quality & Compliance Validation Tracks</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ["warranty", "Under Active Warranty Coverage"],
              ["inwardProof", "Inward Processing Record Verification"],
              ["invoice", "Financial Invoice Attached"],
              ["paymentReceived", "Transaction Liquidity Settlement"],
              ["insurance", "Transit Cargo Insurance Matrix Cover"],
              ["mailProof", "Electronic Tracking Notification Mail Summary"],
            ].map((field) => (
              <div key={field[0]} className="space-y-1.5">
                <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">
                  {field[1]}
                </label>
                <select
                  name={field[0]}
                  value={formData[field[0]]}
                  onChange={handleInput}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                >
                  <option value="">Select Audit Status</option>
                  <option value="Yes">Yes / Verified Verified</option>
                  <option value="No">No / Aborted Flag</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* STATION MODULE 4: REGISTRY SECURITY SIGNATURES */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5 xl:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <FaLock className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Internal Security Clearances</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["packedBy", "Freight Packing Handler Signature"],
              ["verifiedBy", "Quality Assurance Checking Officer"],
            ].map((field) => (
              <div key={field[0]} className="space-y-1.5">
                <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">
                  {field[1]}
                </label>
                <input
                  type="text"
                  name={field[0]}
                  value={formData[field[0]]}
                  onChange={handleInput}
                  placeholder="Officer Profile Account Name"
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                />
              </div>
            ))}
          </div>
        </div>

        {/* STATION MODULE 5: COMPONENT HARDWARE LEDGER */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden xl:col-span-2">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <div className="flex items-center gap-2">
              <FaBarcode className="text-slate-400 text-sm" />
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Avionics Allocation Manifest Table</h3>
            </div>
            <button
              onClick={addRow}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-700 shadow transition-all flex items-center gap-1.5"
            >
              <FaPlus className="text-[10px]" /> Append Item Code Line
            </button>
          </div>

          <div className="p-4 space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-slate-50/60 border border-slate-200/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-white hover:border-slate-300/80 transition-all duration-150"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-slate-400 text-xs uppercase bg-slate-100 px-2 py-1 rounded">
                    Item {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full items-center">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Component part description nomenclature..."
                      value={item.description}
                      onChange={(e) => handleItem(index, "description", e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none"
                    />
                  </div>
                  
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItem(index, "quantity", e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-center font-mono text-xs focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={item.uom}
                      onChange={(e) => handleItem(index, "uom", e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded-lg px-2 py-2 text-xs font-medium focus:border-blue-500 outline-none"
                    >
                      <option value="Nos">Nos</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Box">Box</option>
                      <option value="Kg">Kg</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => deleteRow(index)}
                  disabled={items.length === 1}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl bg-slate-100 border border-slate-200/40 shadow-sm transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed mx-auto sm:mx-0"
                  title="Purge line item profile"
                >
                  <FaTrashAlt className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SDCEdit;