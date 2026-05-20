import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  FaBuilding,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaSearch,
  FaPlus,
  FaSave,
  FaEdit,
  FaTrash,
  FaIdCard
} from "react-icons/fa";

// Optional dynamic import initialization placeholder
import vendorsJson from "../data/vendors.json";

const Vendors = () => {
  // =========================
  // SYSTEM ENGINE STATES
  // =========================
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    vendorCompany: "",
    vendorName: "",
    vendorPhone: "",
    venderMail: "",
    vendorGST: "",
    vendorAddress: ""
  });

  // =========================
  // LIFECYCLE BUFFER INITS
  // =========================
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "vendors"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setVendors(data);
      setLoading(false);
    } catch (error) {
      console.error("Vendor directory streaming failure:", error);
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // =========================
  // TRANSACTION COMMIT WORK
  // =========================
  const saveVendor = async () => {
    try {
      if (!form.vendorCompany || !form.vendorName || !form.vendorPhone) {
        alert("Verification Error: Company Name, Point of Contact, and Secure Line fields are required.");
        return;
      }

      if (editId) {
        await updateDoc(doc(db, "vendors", editId), {
          ...form,
          updatedAt: new Date()
        });
        alert("Registry Modification Confirmed: Supplier profile rewritten.");
      } else {
        await addDoc(collection(db, "vendors"), {
          ...form,
          createdAt: new Date()
        });
        alert("Registry Entry Confirmed: Supplier profile initialized.");
      }

      setForm({
        vendorCompany: "",
        vendorName: "",
        vendorPhone: "",
        venderMail: "",
        vendorGST: "",
        vendorAddress: ""
      });
      setEditId(null);
      fetchVendors();
    } catch (error) {
      console.error("Transaction commit failed:", error);
    }
  };

  const editVendor = (item) => {
    setEditId(item.id);
    setForm({
      vendorCompany: item.vendorCompany || "",
      vendorName: item.vendorName || "",
      vendorPhone: item.vendorPhone || "",
      venderMail: item.venderMail || "",
      vendorGST: item.vendorGST || "",
      vendorAddress: item.vendorAddress || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteVendor = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this supplier profile?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "vendors", id));
      alert("Supplier records purged successfully.");
      fetchVendors();
    } catch (error) {
      console.error("Purge loop operation exception:", error);
    }
  };

  // =========================
  // RUNTIME SEARCH MATRIX
  // =========================
  const filteredVendors = vendors.filter(
    (item) =>
      item.vendorCompany?.toLowerCase().includes(search.toLowerCase()) ||
      item.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
      item.vendorPhone?.toLowerCase().includes(search.toLowerCase()) ||
      item.venderMail?.toLowerCase().includes(search.toLowerCase()) ||
      item.vendorAddress?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* TACTICAL HEAD REGISTRY BANNER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center mb-8 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {/* Font locked to 12px via text-xs */}
            <span className="px-2.5 py-1 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20">
              Global Supply Network
            </span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight">Vendor Management Console</h1>
          <p className="text-slate-400 text-sm mt-1">Audit, register, and update authorized external supplier terminals.</p>
        </div>
      </div>

      {/* CORE WORKSPACE ENTRY CARD PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
          <div className={`p-2 rounded-xl text-sm ${editId ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>
            {editId ? <FaEdit /> : <FaPlus />}
          </div>
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">
            {editId ? "Modify Target Supplier Variables" : "Initialize New Supplier Profile"}
          </h2>
        </div>

        {/* REGISTRATION SYSTEM INPUTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-2">
            {/* Label locked to 12px via text-xs */}
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Corporate Company Name</label>
            <input
              type="text"
              placeholder="e.g. Lakshmi Electricals"
              value={form.vendorCompany}
              onChange={(e) => handleChange("vendorCompany", e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
            />
          </div>

          <div className="space-y-2">
            {/* Label locked to 12px via text-xs */}
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Primary Point of Contact</label>
            <input
              type="text"
              placeholder="e.g. Anand Kumar"
              value={form.vendorName}
              onChange={(e) => handleChange("vendorName", e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
            />
          </div>

          <div className="space-y-2">
            {/* Label locked to 12px via text-xs */}
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Secure Communications Line</label>
            <input
              type="text"
              placeholder="e.g. +91 98450XXXXX"
              value={form.vendorPhone}
              onChange={(e) => handleChange("vendorPhone", e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
            />
          </div>

          <div className="space-y-2">
            {/* Label locked to 12px via text-xs */}
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Electronic Routing Mail</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={form.venderMail}
              onChange={(e) => handleChange("venderMail", e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
            />
          </div>

          <div className="space-y-2">
            {/* Label locked to 12px via text-xs */}
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Corporate GSTIN Identity Code</label>
            <input
              type="text"
              placeholder="33AAGCGXXXXA1ZG"
              value={form.vendorGST}
              onChange={(e) => handleChange("vendorGST", e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 font-mono uppercase tracking-widest outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
            />
          </div>

          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            {/* Label locked to 12px via text-xs */}
            <label className="block font-bold text-xs text-slate-400 uppercase tracking-wide">Headquarters Dispatch Address</label>
            <textarea
              placeholder="Physical warehouse facilities infrastructure parameters..."
              value={form.vendorAddress}
              onChange={(e) => handleChange("vendorAddress", e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 h-20 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* OPERATIONS TRIGGER BUTTON */}
        <button
          onClick={saveVendor}
          className={`mt-6 text-white text-sm font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
            editId
              ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-orange-950/10 border border-amber-500/20"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-950/10 border border-blue-500/20"
          }`}
        >
          {editId ? <FaEdit className="text-xs" /> : <FaSave className="text-xs" />}
          {editId ? "Update System Parameters" : "Commit Supplier Record"}
        </button>
      </div>

      {/* FILTER SEARCH UTILITY INPUT CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search Supplier Handle / Point of Contact / Local Telemetry"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
          />
        </div>

        <div className="text-right shrink-0">
          {/* Label locked to 12px via text-xs */}
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Live Registry Pool</span>
          <span className="font-mono font-black text-xl text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md inline-block mt-0.5">
            {filteredVendors.length} <span className="text-xs font-semibold text-slate-400 font-sans tracking-normal">Terminals Listed</span>
          </span>
        </div>
      </div>

      {/* SYSTEMATIC OUTPUT CONTROLS LOOP */}
      {loading ? (
        <div className="flex flex-col gap-3 justify-center items-center py-24 text-slate-400">
          <div className="w-10 h-10 border-4 border-t-blue-500 border-slate-200 rounded-full animate-spin"></div>
          {/* Text locked to 12px via text-xs */}
          <p className="text-xs font-bold tracking-widest uppercase">Streaming Vendor Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVendors.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col justify-between hover:shadow-md transition-shadow group relative"
            >
              <div>
                {/* CARD METADATA HEADER SECTOR */}
                <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-xl flex items-center justify-center shadow-inner group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
                      <FaBuilding />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight line-clamp-1">{item.vendorCompany}</h3>
                      {/* Text locked to 12px via text-xs */}
                      <p className="text-slate-400 text-xs font-medium mt-1 flex items-center gap-1">
                        <FaIdCard className="text-xs" /> {item.vendorName || "No Associated Agent"}
                      </p>
                    </div>
                  </div>

                  {/* OPERATIONS TRIGGER BUTTON CLUSTER */}
                  <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => editVendor(item)}
                      title="Modify variables"
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 border border-slate-100 flex items-center justify-center transition-all"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      onClick={() => deleteVendor(item.id)}
                      title="Purge profile entry"
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-100 flex items-center justify-center transition-all"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>

                {/* LOGS PARAMETERS BLOCK DATA */}
                {/* Text locked to 12px via text-xs */}
                <div className="space-y-2.5 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <FaPhone className="text-blue-500 text-xs shrink-0" />
                    <span className="font-mono">{item.vendorPhone || "—"}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <FaEnvelope className="text-emerald-500 text-xs shrink-0" />
                    <span className="truncate max-w-full font-medium" title={item.venderMail}>{item.venderMail || "—"}</span>
                  </div>

                  {/* Container uses text-xs to guarantee 12px text layout */}
                  <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-100 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-500">
                    <span className="font-sans font-bold text-slate-400 uppercase tracking-wider">GSTIN:</span>
                    <span className="font-bold tracking-wide text-slate-700 uppercase">{item.vendorGST || "UNREGISTERED"}</span>
                  </div>
                </div>
              </div>

              {/* CARD DISPATCH ADDRESS FOOTER FOOTPRINT */}
              {/* Text locked to 12px via text-xs */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
                <FaMapMarkerAlt className="text-rose-500 text-xs shrink-0 mt-0.5" />
                <p className="line-clamp-2 leading-relaxed italic" title={item.vendorAddress}>
                  {item.vendorAddress || "No geographic footprint mapped."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Vendors;