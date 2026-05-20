import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaTrash,
  FaSearch,
  FaFileInvoice,
  FaEdit,
  FaPlus,
  FaBoxOpen,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { db } from "../firebase/firebase";

const History = () => {
  // =========================================
  // STATES
  // =========================================
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination States (6 Items Per Page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // =========================================
  // FETCH
  // =========================================
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "purchaseOrders"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        // Convert Firestore Timestamp to JS Date Object if it exists
        const formattedDate = docData.createdAt?.seconds 
          ? new Date(docData.createdAt.seconds * 1000) 
          : null;

        return {
          id: doc.id,
          ...docData,
          jsDate: formattedDate, // Used for internal date filtering
        };
      });

      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // =========================================
  // FILTERING EFFECT (Search + Date Range)
  // =========================================
  useEffect(() => {
    let targetData = [...orders];

    // 1. Text Search Filter (PO Number, Reference, Vendor Name)
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      targetData = targetData.filter(
        (item) =>
          item.poNumber?.toLowerCase().includes(searchLower) ||
          item.referenceNo?.toLowerCase().includes(searchLower) ||
          item.vendorData?.vendorName?.toLowerCase().includes(searchLower)
      );
    }

    // 2. Date Range Filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      targetData = targetData.filter((item) => item.jsDate && item.jsDate >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      targetData = targetData.filter((item) => item.jsDate && item.jsDate <= end);
    }

    setFilteredOrders(targetData);
    setCurrentPage(1); // Reset to page 1 whenever filters change
  }, [search, startDate, endDate, orders]);

  // =========================================
  // PAGINATION COMPUTATION
  // =========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrdersSlice = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // =========================================
  // ACTIONS: DELETE DATA ROW
  // =========================================
  const deletePO = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Purchase Order?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "purchaseOrders", id));
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  // Reset all control states
  const resetFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  // =========================================
  // LOADING STATE
  // =========================================
  if (loading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-slate-950 text-white ml-[250px]">
        <div className="w-14 h-14 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Accessing Secure Flight Archives...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* TOP HEADER SUMMARY BAR */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1 relative overflow-hidden rounded-3xl bg-slate-900 p-6 xl:p-8 shadow-xl border border-slate-800">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/20 blur-[80px] pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
              <FaFileInvoice className="text-2xl" />
            </div>
            <div>
              <span className="text-[12px] font-bold text-blue-400 tracking-widest uppercase">System logs</span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
                Purchase Order Registry
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Verify, trace, and manage global supply requests.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[280px] bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Filtered Records</p>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight transition-transform group-hover:scale-105 duration-200">
              {filteredOrders.length}
            </h2>
            <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              of {orders.length} total entries
            </span>
          </div>
          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xl shadow-inner group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
            <FaFileInvoice />
          </div>
        </div>
      </div>

      {/* FILTER CONTROL SECTION (Text Search + Dates) */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 mb-8 flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between w-full">
          
          {/* Dynamic Search Vector Block */}
          <div className="relative w-full xl:flex-1 max-w-xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search PO ID / Vendor Handle / System Reference"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200/70 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Date Picker Configurations */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-2 flex items-center gap-1">
                <FaCalendarAlt /> From:
              </span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
              />
            </div>

            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-2 flex items-center gap-1">
                <FaCalendarAlt /> To:
              </span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
              />
            </div>

            {(startDate || endDate || search) && (
              <button 
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 px-3 py-2 rounded-xl transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Navigation Action */}
          <div className="w-full xl:w-auto">
            <Link
              to="/create"
              className="w-full xl:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-5 py-3.5 shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-95"
            >
              <FaPlus className="text-[12px]" />
              Create Purchase Order
            </Link>
          </div>

        </div>
      </div>

      {/* RECORDS DATA GRID MATRIX TABLE */}
      {currentOrdersSlice.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[12px] font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6 font-semibold">PO Axis Index</th>
                  <th className="p-4 font-semibold">Contracted Vendor</th>
                  <th className="p-4 font-semibold">System Reference</th>
                  <th className="p-4 font-semibold">Financial Valuation</th>
                  <th className="p-4 text-center font-semibold">Batch Volume</th>
                  <th className="p-4 pr-6 text-center font-semibold">Operations Grid</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {currentOrdersSlice.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group hover:bg-slate-50/60 transition-colors duration-150"
                  >
                    {/* Index Entry */}
                    <td className="p-4 pl-6">
                      <div className="font-mono font-bold text-slate-900 text-sm tracking-wide">
                        {item.poNumber || "N/A"}
                      </div>
                      {item.jsDate && (
                        <span className="text-[10px] text-slate-400 block font-sans font-medium mt-0.5">
                          {item.jsDate.toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </td>

                    {/* Associated Vendor Identification */}
                    <td className="p-4 text-sm font-semibold text-slate-700">
                      {item.vendorData?.vendorName || "Unassigned Vendor"}
                    </td>

                    {/* System Reference String Mapping */}
                    <td className="p-4 text-sm text-slate-500 font-mono">
                      {item.referenceNo || "—"}
                    </td>

                    {/* Total Budget Computation View */}
                    <td className="p-4">
                      <div className="font-mono font-bold text-emerald-600 text-sm">
                        ₹{Number(item.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* Item Count Tags */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[12px] font-bold">
                        {item.products?.length || 0} Components
                      </span>
                    </td>

                    {/* Interactive Operational Triggers */}
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/po/preview/${item.id}`}
                          title="Preview document"
                          className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200/50 hover:border-blue-200 flex items-center justify-center transition-all shadow-sm"
                        >
                          <FaEye className="text-sm" />
                        </Link>

                        <Link
                          to={`/po/edit/${item.id}`}
                          title="Modify variables"
                          className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-600 border border-slate-200/50 hover:border-amber-200 flex items-center justify-center transition-all shadow-sm"
                        >
                          <FaEdit className="text-sm" />
                        </Link>

                        <button
                          onClick={() => deletePO(item.id)}
                          title="Purge record"
                          className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/50 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
                        >
                          <FaTrash className="text-[12px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DYNAMIC PAGINATION CONTROLS BAR */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="text-xs font-semibold text-slate-500">
                Showing <span className="text-slate-800">{indexOfFirstItem + 1}</span> to{" "}
                <span className="text-slate-800">
                  {indexOfLastItem > filteredOrders.length ? filteredOrders.length : indexOfLastItem}
                </span>{" "}
                of <span className="text-slate-800">{filteredOrders.length}</span> records
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Prev Trigger */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all text-xs flex items-center justify-center"
                >
                  <FaChevronLeft />
                </button>

                {/* Page Number Sequence */}
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[32px] h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Next Trigger */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all text-xs flex items-center justify-center"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EMPTY RESULT PLACEHOLDER */}
      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center max-w-2xl mx-auto mt-6 shadow-inner">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FaBoxOpen className="text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Zero Registry Index Matches</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            No orders match your query metrics or range parameters. Clear conditions or assemble a fresh profile.
          </p>
          <div className="mt-6">
            <button
              onClick={resetFilters}
              className="text-[12px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default History;