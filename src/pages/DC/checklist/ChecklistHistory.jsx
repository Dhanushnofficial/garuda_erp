import React, { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaTrash,
  FaSearch,
  FaClipboardCheck,
  FaEdit,
  FaPlus,
  FaBoxOpen
} from "react-icons/fa";
import { db } from "../../../firebase/firebase";

const ChecklistHistory = () => {
  const navigate = useNavigate();

  // =========================
  // SYSTEM ENGINE STATES
  // =========================
  const [listData, setListData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // =========================
  // INITIALIZATION PIPELINE
  // =========================
  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // RUNTIME SEARCH FILTER ENGINE
  // =========================
  useEffect(() => {
    const filtered = listData.filter(
      (item) =>
        item?.challanNumber?.toLowerCase().includes(search.toLowerCase()) ||
        item?.loiNumber?.toLowerCase().includes(search.toLowerCase()) ||
        item?.packedBy?.toLowerCase().includes(search.toLowerCase()) ||
        item?.inspectedBy?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(filtered);
  }, [search, listData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "listOfItems"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListData(data);
      setFilteredData(data);
      setLoading(false);
    } catch (error) {
      console.error("Item directory data stream failure:", error);
      setLoading(false);
    }
  };

  // =========================
  // ACTIONS: PURGE RECORD LINE
  // =========================
  const deleteItem = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this item record?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "listOfItems", id));
      fetchData();
    } catch (error) {
      console.error("Error executing collection trace purge:", error);
    }
  };

  // =========================
  // SYSTEM RUNTIME LOADING STAGE
  // =========================
  if (loading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-slate-950 text-white ml-[250px]">
        <div className="w-14 h-14 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Accessing Material Inspection Archives...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* ========================================= */}
      {/* TOP HEADER SUMMARY BAR */}
      {/* ========================================= */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        
        {/* Main Banner Container */}
        <div className="flex-1 relative overflow-hidden rounded-3xl bg-slate-900 p-6 xl:p-8 shadow-xl border border-slate-800">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/20 blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
              <FaClipboardCheck className="text-2xl" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Inventory Quality Control</span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
                List of Items Registry
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Audit, track, and manage verified manufacturing component checksheets.
              </p>
            </div>
          </div>
        </div>

        {/* Counter Metric Card */}
        <div className="w-full lg:w-[280px] bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Checklists</p>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight transition-transform group-hover:scale-105 duration-200">
              {filteredData.length}
            </h2>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              + Verified Database Line
            </span>
          </div>
          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xl shadow-inner group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
            <FaClipboardCheck />
          </div>
        </div>

      </div>

      {/* ========================================= */}
      {/* FILTER SEARCH UTILITY SECTION */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search Input Mapping */}
        <div className="relative w-full sm:flex-1 max-w-xl">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search Challan No / LOI Number / Inspector Profile Handles"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
          />
        </div>

        {/* Create Form Route Navigation */}
        <div className="w-full sm:w-auto">
          <button
            onClick={() => navigate("/dc/checklist")}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-5 py-3.5 shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-95"
          >
            <FaPlus className="text-xs" />
            Create List of Items
          </button>
        </div>

      </div>

      {/* ========================================= */}
      {/* RECORDS DATA GRID MATRIX TABLE */}
      {/* ========================================= */}
      {filteredData.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse table-fixed text-left">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6 font-semibold w-[15%]">Challan Index</th>
                  <th className="p-4 font-semibold w-[15%]">LOI Number</th>
                  <th className="p-4 font-semibold w-[12%]">Inspection Date</th>
                  <th className="p-4 font-semibold w-[16%]">Packed By</th>
                  <th className="p-4 font-semibold w-[16%]">Inspected By</th>
                  <th className="p-4 text-center font-semibold w-[12%]">Batch Weight</th>
                  <th className="p-4 pr-6 text-center font-semibold w-[14%]">Operations Grid</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group hover:bg-slate-50/60 transition-colors duration-150"
                  >
                    {/* Challan Number */}
                    <td className="p-4 pl-6">
                      <div className="font-mono font-bold text-slate-900 text-sm tracking-wide truncate">
                        {item?.challanNumber || "—"}
                      </div>
                    </td>

                    {/* LOI Index Code */}
                    <td className="p-4">
                      <div className="font-mono font-semibold text-slate-600 truncate">
                        {item?.loiNumber || "—"}
                      </div>
                    </td>

                    {/* Inspection Date */}
                    <td className="p-4 text-slate-500 font-medium font-mono truncate">
                      {item?.date || "—"}
                    </td>

                    {/* Packed By */}
                    <td className="p-4 font-semibold text-slate-700 truncate">
                      {item?.packedBy || "—"}
                    </td>

                    {/* Inspected By */}
                    <td className="p-4 font-semibold text-slate-700 truncate">
                      {item?.inspectedBy || "—"}
                    </td>

                    {/* Component Count Badge */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 font-bold text-xs font-mono">
                        {item?.items?.length || 0} units
                      </span>
                    </td>

                    {/* Interactive Tactical Operators */}
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* PREVIEW LINK */}
                        <Link
                          to={`/dc/checklist-preview/${item.id}`}
                          title="Verify checklist variables"
                          className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200/50 hover:border-blue-200 flex items-center justify-center transition-all shadow-sm"
                        >
                          <FaEye className="text-sm" />
                        </Link>

                        {/* EDIT LINK */}
                        <Link
                          to={`/dc/checklist-edit/${item.id}`}
                          title="Modify validation logging parameters"
                          className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-600 border border-slate-200/50 hover:border-amber-200 flex items-center justify-center transition-all shadow-sm"
                        >
                          <FaEdit className="text-sm" />
                        </Link>

                        {/* PURGE BUTTON */}
                        <button
                          onClick={() => deleteItem(item.id)}
                          title="Purge validation file record"
                          className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/50 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* EMPTY RESULT CONSOLE SCREEN */}
      {/* ========================================= */}
      {filteredData.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center max-w-2xl mx-auto mt-6 shadow-inner">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FaBoxOpen className="text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Zero Registry Index Matches</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            No inspection checksheets match your query parameters. Clear terminal search strings or compile a fresh dataset.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setSearch("")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              Reset Terminal Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChecklistHistory;