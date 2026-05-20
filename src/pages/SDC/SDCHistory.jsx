import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFileInvoice,
  FaPlus,
  FaTruck,
  FaBoxOpen,
} from "react-icons/fa";
import { db } from "../../firebase/firebase";

const SDCHistory = () => {
  // =====================================
  // STATES
  // =====================================
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // =====================================
  // FETCH DATA
  // =====================================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "sdcDocuments"),
        orderBy("serverTime", "desc")
      );

      const snapshot = await getDocs(q);

      const temp = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setData(temp);
      setFilteredData(temp);
    } catch (error) {
      console.error("Firestore Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // SEARCH FILTER
  // =====================================
  useEffect(() => {
    const searchText = search.toLowerCase();

    const result = data.filter((item) => {
      const sdcNumber = String(item?.sdcNumber || "").toLowerCase();
      const invoiceNo = String(item?.invoiceNo || "").toLowerCase();
      const date = String(item?.date || "").toLowerCase();

      return (
        sdcNumber.includes(searchText) ||
        invoiceNo.includes(searchText) ||
        date.includes(searchText)
      );
    });

    setFilteredData(result);
  }, [search, data]);

  // =====================================
  // DELETE RECORD
  // =====================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this Supplier Delivery Challan (SDC)?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "sdcDocuments", id));

      setData((prev) => prev.filter((item) => item.id !== id));

      setFilteredData((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  // =====================================
  // LOADING SCREEN
  // =====================================
  if (loading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-slate-950 text-white ml-[250px]">
        <div className="w-14 h-14 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>

        <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Accessing Active SDC Registers...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* ========================================= */}
      {/* TOP HEADER */}
      {/* ========================================= */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1 relative overflow-hidden rounded-3xl bg-slate-900 p-6 xl:p-8 shadow-xl border border-slate-800">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/20 blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
              <FaFileInvoice className="text-2xl" />
            </div>

            <div>
              <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">
                Inbound Logistics
              </span>

              <h1 className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
                SDC History Manifest
              </h1>

              <p className="text-slate-400 text-sm mt-1">
                Audit, track, and manage incoming Supplier Delivery Challan
                operations.
              </p>
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="w-full lg:w-[280px] bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Active Logs
            </p>

            <h2 className="text-4xl font-black text-slate-800 tracking-tight transition-transform group-hover:scale-105 duration-200">
              {filteredData.length}
            </h2>

            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              + Data Verified
            </span>
          </div>

          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xl shadow-inner group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
            <FaTruck />
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* SEARCH */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:flex-1 max-w-xl">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

          <input
            type="text"
            placeholder="Search SDC Number / Invoice Index / Timestamp Date"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
          />
        </div>

        <div className="w-full sm:w-auto">
          <Link
            to="/sdc/create"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-5 py-3.5 shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-95"
          >
            <FaPlus className="text-xs" />
            Create Supplier Challan
          </Link>
        </div>
      </div>

      {/* ========================================= */}
      {/* TABLE */}
      {/* ========================================= */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="bg-slate-900 text-slate-300 border-b border-slate-800 px-6 py-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            Active SDC Records
          </h3>

          <p className="text-slate-400 text-xs mt-0.5">
            Natively logged supplier parameters
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse table-fixed text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-200/60 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 pl-6 font-semibold w-[20%]">
                  SDC Axis Index
                </th>

                <th className="p-4 font-semibold w-[18%]">
                  Logging Date
                </th>

                <th className="p-4 font-semibold w-[20%]">
                  Invoice Number
                </th>

                <th className="p-4 font-semibold w-[20%]">
                  Mode Of Dispatch
                </th>

                <th className="p-4 text-center font-semibold w-[12%]">
                  Batch Volume
                </th>

                <th className="p-4 pr-6 text-center font-semibold w-[10%]">
                  Operations Grid
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="group hover:bg-slate-50/60 transition-colors duration-150"
                  >
                    <td className="p-4 pl-6">
                      <div className="font-mono font-bold text-slate-900 text-sm tracking-wide truncate">
                        {item?.sdcNumber || "—"}
                      </div>
                    </td>

                    <td className="p-4 text-slate-500 font-mono font-medium truncate">
                      {item?.date || "—"}
                    </td>

                    <td className="p-4 text-slate-600 truncate">
                      {item?.invoiceNo || "—"}
                    </td>

                    <td className="p-4 text-slate-600 truncate">
                      {item?.modeOfDispatch || "—"}
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 font-bold text-xs font-mono">
                        {Array.isArray(item?.items)
                          ? item.items.length
                          : 0}{" "}
                        items
                      </span>
                    </td>

                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/sdc/preview/${item.id}`}
                          className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200/50 hover:border-blue-200 flex items-center justify-center transition-all shadow-sm"
                        >
                          <FaEye className="text-sm" />
                        </Link>

                        <Link
                          to={`/sdc/edit/${item.id}`}
                          className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 border border-slate-200/50 hover:border-amber-200 flex items-center justify-center transition-all shadow-sm"
                        >
                          <FaEdit className="text-sm" />
                        </Link>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-9 h-9 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/50 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-0">
                    <div className="bg-white p-16 text-center border-t border-slate-100 shadow-inner">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <FaBoxOpen className="text-3xl" />
                      </div>

                      <h4 className="text-xl font-bold text-slate-800 tracking-tight">
                        Zero Registry Index Matches
                      </h4>

                      <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                        No service challans match your filter tracking
                        variables.
                      </p>

                      <div className="mt-6">
                        <button
                          onClick={() => setSearch("")}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                        >
                          Reset Filters Matrix
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SDCHistory;