import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaCalendarAlt,
  FaHourglassHalf,
  FaTable,
  FaPlane,
  FaBoxes,
  FaFileInvoiceDollar,
  FaUserShield,
  FaMapMarkerAlt
} from "react-icons/fa";

const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899"];

const AnalyzeSDC = () => {
  const [loading, setLoading] = useState(true);
  const [allSdcs, setAllSdcs] = useState([]);
  const [filteredSdcs, setFilteredSdcs] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  // Filter Adjustments
  const [dateRange, setDateRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Counter Panels Stats
  const [stats, setStats] = useState({
    totalSdc: 0,
    paidCount: 0,
    invoiceLinked: 0,
    totalUnitsServiced: 0,
    uniqueDescriptions: 0
  });

  // Chart Mappings
  const [typeData, setTypeData] = useState([]);
  const [verifierData, setVerifierData] = useState([]);

  // Primary Data Collections Setup
  const primaryCollection = "sdcDocuments";
  const fallbackCollections = ["sdc", "sdcLoops", "standardChallans"];

  const fetchSdcData = async () => {
    try {
      setLoading(true);
      let snapshot = null;

      // Dynamic path validation routine
      const initialFetch = await getDocs(collection(db, primaryCollection));
      if (!initialFetch.empty) {
        snapshot = initialFetch;
      } else {
        for (const path of fallbackCollections) {
          const testFetch = await getDocs(collection(db, path));
          if (!testFetch.empty) {
            snapshot = testFetch;
            console.log(`SDC Engine connected to matched path: "${path}"`);
            break;
          }
        }
      }

      if (!snapshot) {
        snapshot = initialFetch; // Defaults to layout target schema
      }

      const processed = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          sdcNumber: data.sdcNumber || "N/A",
          date: data.date || "",
          challanType: data.challanType || "Standard", // e.g. "Paid"
          gatePassNo: data.gatePassNo || "N/A",
          invoice: data.invoice || "No",
          invoiceNo: data.invoiceNo || "—",
          paymentReceived: data.paymentReceived || "No",
          packedBy: data.packedBy || "—",
          verifiedBy: data.verifiedBy || "—",
          shipTo: data.shipTo || "—",
          approvalStatus: data.approvalStatus || "Pending", // Custom tracking status row
          itemsArray: data.items || [],
          createdAt: data.createdAt
        };
      });

      setAllSdcs(processed);
      setFilteredSdcs(processed);
    } catch (error) {
      console.error("Critical error building SDC layout metrics map:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSdcData();
  }, []);

  // Database Action Processor
  const handleUpdateStatus = async (docId, targetStatus) => {
    try {
      setUpdatingId(docId);
      
      // Determine what active path is holding data to route mutations successfully
      let targetPath = primaryCollection;
      const primaryCheck = await getDocs(collection(db, primaryCollection));
      if (primaryCheck.empty) {
        for (const path of fallbackCollections) {
          const check = await getDocs(collection(db, path));
          if (!check.empty) { targetPath = path; break; }
        }
      }

      const docReference = doc(db, targetPath, docId);
      await updateDoc(docReference, { approvalStatus: targetStatus });

      // Live-update local state without resetting page loaders
      setAllSdcs(prev =>
        prev.map(item =>
          item.id === docId ? { ...item, approvalStatus: targetStatus } : item
        )
      );
    } catch (err) {
      console.error("Failed SDC mutation handler update payload execution:", err);
      alert("Database error: SDC transaction mapping failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Live filter state logic machine
  useEffect(() => {
    let output = [...allSdcs];

    // 1. Filter Type Categorization
    if (typeFilter !== "all") {
      output = output.filter(s => s.challanType === typeFilter);
    }

    // 2. Timeline Slicing Engine
    const now = new Date();
    if (dateRange === "30days") {
      const limit = new Date().setDate(now.getDate() - 30);
      output = output.filter(s => {
        const d = s.createdAt?.seconds ? new Date(s.createdAt.seconds * 1000) : new Date(s.date);
        return d >= limit;
      });
    }

    // 3. Global Regex Search Matcher
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      output = output.filter(s =>
        s.sdcNumber.toLowerCase().includes(query) ||
        s.verifiedBy.toLowerCase().includes(query) ||
        s.shipTo.toLowerCase().includes(query) ||
        s.gatePassNo.toLowerCase().includes(query)
      );
    }

    setFilteredSdcs(output);

    // Compute Metrics Arrays Aggregations
    let paid = 0;
    let invCount = 0;
    let totalQty = 0;
    const typeMap = {};
    const verifierMap = {};
    const itemsDescriptionMap = {};

    output.forEach(sdc => {
      if (sdc.challanType === "Paid" || sdc.paymentReceived === "Yes") paid += 1;
      if (sdc.invoice === "Yes") invCount += 1;

      // Group Types
      typeMap[sdc.challanType] = (typeMap[sdc.challanType] || 0) + 1;

      // Group Verification metrics loads
      if (sdc.verifiedBy && sdc.verifiedBy !== "—") {
        verifierMap[sdc.verifiedBy] = (verifierMap[sdc.verifiedBy] || 0) + 1;
      }

      // Loop Array Maps Object Structures
      if (sdc.itemsArray && Array.isArray(sdc.itemsArray)) {
        sdc.itemsArray.forEach(item => {
          const qty = Number(item.quantity || 0);
          totalQty += qty;
          if (item.description) {
            itemsDescriptionMap[item.description] = true;
          }
        });
      }
    });

    setStats({
      totalSdc: output.length,
      paidCount: paid,
      invoiceLinked: invCount,
      totalUnitsServiced: totalQty,
      uniqueDescriptions: Object.keys(itemsDescriptionMap).length
    });

    setTypeData(Object.keys(typeMap).map(type => ({ name: type, value: typeMap[type] })));
    setVerifierData(Object.keys(verifierMap).map(v => ({ name: v, Operations: verifierMap[v] })));

  }, [allSdcs, dateRange, searchQuery, typeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased">
      
      {/* HEADER BAR HERO */}
      <div className="bg-slate-900 border-b border-slate-800 shadow-xl p-6 mb-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FaFileInvoiceDollar className="text-xl" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-0.5">
              Service Execution Registry
            </span>
            <h1 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight">Standard DC Analytics</h1>
          </div>
        </div>
      </div>

      {/* FILTER CONTROL HUB */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-xs">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search SDC No, Client, Auditor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <FaBoxes className="text-slate-400 text-xs mr-2" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none py-1.5 cursor-pointer"
          >
            <option value="all">All Billing Classifications</option>
            <option value="Paid">Paid Channels</option>
            <option value="FOC">Free Of Cost (FOC)</option>
            <option value="Warranty">Warranty Support</option>
          </select>
        </div>

        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <FaCalendarAlt className="text-slate-400 text-xs mr-2" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none py-1.5 cursor-pointer"
          >
            <option value="all">Full Structural History</option>
            <option value="30days">Last 30 Dynamic Days</option>
          </select>
        </div>
      </div>

      {/* CORE STATS KPI MATRIX CONTAINER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SDCs</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.totalSdc}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center text-md"><FaTable /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Paid Transactions</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.paidCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-md"><FaFileInvoiceDollar /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Invoice Linked</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.invoiceLinked}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-md"><FaCheckCircle /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Units Delivered</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.totalUnitsServiced} <span className="text-xs font-sans text-slate-400">Nos</span></h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-md"><FaPlane /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Distinct Line Items</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.uniqueDescriptions}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-md"><FaBoxes /></div>
        </div>
      </div>

      {/* CHARTS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Challan Strategy Distribution</h3>
          <div className="w-full h-[200px] flex items-center justify-center">
            {typeData.length === 0 ? (
              <p className="text-xs italic text-slate-400">No chart categorization records</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3}>
                    {typeData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2 text-[10px] font-bold text-slate-600">
            {typeData.map((t, i) => (
              <span key={t.name} className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                {t.name} ({t.value})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Inspection & Verification Loads</h3>
          <div className="w-full h-[240px]">
            {verifierData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs italic text-slate-400">No verification tracks recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={verifierData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="Operations" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* CORE LOGS REGISTRY TABLE DISPLAY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Standard & Service Delivery Registry ({filteredSdcs.length} items)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                <th className="p-4 pl-6">SDC Reference Code</th>
                <th className="p-4">Billing Channel</th>
                <th className="p-4">Consignee Ship Address</th>
                <th className="p-4 text-center">Quality Auditor</th>
                <th className="p-4 text-center">Database Status</th>
                <th className="p-4 text-center pr-6">Action Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {filteredSdcs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 italic">No corresponding structural SDC logs resolved. Check Firestore structures.</td>
                </tr>
              ) : (
                filteredSdcs.map((sdc) => {
                  const isActionDisabled = updatingId === sdc.id;
                  return (
                    <tr key={sdc.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-900">
                        {sdc.sdcNumber}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">GP No: {sdc.gatePassNo} | Date: {sdc.date}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sdc.challanType === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-600"
                        }`}>
                          {sdc.challanType}
                        </span>
                        {sdc.invoice === "Yes" && <span className="block text-[10px] text-slate-400 mt-1">Inv: #{sdc.invoiceNo}</span>}
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-500" title={sdc.shipTo}>
                        <span className="inline-flex items-center gap-1"><FaMapMarkerAlt className="text-slate-300 shrink-0" /> {sdc.shipTo}</span>
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-800">
                        <div className="flex items-center justify-center gap-1.5">
                          <FaUserShield className="text-slate-400 text-[10px]" /> {sdc.verifiedBy}
                        </div>
                      </td>
                      
                      {/* Live State Tracker Label Column */}
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                          sdc.approvalStatus === "Completed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" :
                          sdc.approvalStatus === "Rejected" ? "bg-rose-50 border-rose-200 text-rose-600" :
                          "bg-slate-100 border-slate-200 text-slate-500"
                        }`}>
                          {sdc.approvalStatus}
                        </span>
                      </td>

                      {/* Interactive Mutators Actions */}
                      <td className="p-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(sdc.id, "Completed")}
                            disabled={isActionDisabled || sdc.approvalStatus === "Completed"}
                            className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-bold transition-all shadow-sm ${
                              sdc.approvalStatus === "Completed"
                                ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed shadow-none"
                                : "bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 active:scale-95"
                            }`}
                          >
                            <FaCheckCircle /> Complete
                          </button>
                          
                          <button
                            onClick={() => handleUpdateStatus(sdc.id, "Rejected")}
                            disabled={isActionDisabled || sdc.approvalStatus === "Rejected"}
                            className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-bold transition-all shadow-sm ${
                              sdc.approvalStatus === "Rejected"
                                ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed shadow-none"
                                : "bg-white border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-95"
                            }`}
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AnalyzeSDC;