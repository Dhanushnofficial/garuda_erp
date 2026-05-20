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
  LineChart,
  Line,
  BarChart,
  Bar
} from "recharts";
import {
  FaUndoAlt,
  FaPlane,
  FaUserCheck,
  FaBoxes,
  FaCalendarAlt,
  FaSearch,
  FaTable,
  FaMapMarkerAlt,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const COLORS = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899"];

const AnalyzeRDC = () => {
  const [loading, setLoading] = useState(true);
  const [allRdcs, setAllRdcs] = useState([]);
  const [filteredRdcs, setFilteredRdcs] = useState([]);
  const [updatingId, setUpdatingId] = useState(null); // Tracks active button submission loaders

  // Control Filters
  const [dateRange, setDateRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Metrics Stats
  const [stats, setStats] = useState({
    totalRdc: 0,
    activeOutside: 0,
    returnedToHub: 0,
    totalDronesShipped: 0,
    uniqueModelsCount: 0
  });

  // Charting Buckets
  const [timelineData, setTimelineData] = useState([]);
  const [pilotData, setPilotData] = useState([]);
  const [modelDistribution, setModelDistribution] = useState([]);

  // Base Path Configuration String Target
  const targetCollection = "rdcDocuments";

  const fetchRdcData = async () => {
    try {
      setLoading(true);
      console.log("Attempting connection to Firestore collection:", targetCollection);
      const snapshot = await getDocs(collection(db, targetCollection));
      
      console.log("Total documents fetched from Firestore:", snapshot.size);

      const processed = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          rdcNumber: data.rdcNumber || "N/A",
          rdcDate: data.rdcDate || "",
          employeePilot: data.employeePilot || "—",
          requestBy: data.requestBy || "—",
          issuedBy: data.issuedBy || "—",
          checkedBy: data.checkedBy || "—",
          gatePassNo: data.gatePassNo || "N/A",
          toAddress: data.toAddress || "—",
          returnDate: data.returnDate || "",
          approvalStatus: data.approvalStatus || "Pending", // Custom tracking label fallback
          itemsArray: data.items || [], 
          createdAt: data.createdAt
        };
      });

      setAllRdcs(processed);
      setFilteredRdcs(processed);
    } catch (error) {
      console.error("Critical Firebase fetching error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRdcData();
  }, []);

  // Database Processing Status Mutator
  const handleUpdateStatus = async (docId, targetStatus) => {
    try {
      setUpdatingId(docId);
      const docReference = doc(db, targetCollection, docId);

      const updatePayload = {
        approvalStatus: targetStatus
      };

      // Smart Assistant Logic: If a user marks an active assignment as completed,
      // generate a fresh standard timestamp if one is not present.
      if (targetStatus === "Completed") {
        const timestampString = new Date().toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }) + " UTC+5:30";
        
        updatePayload.returnDate = timestampString;
      }

      await updateDoc(docReference, updatePayload);

      // Instantly optimize local component state maps without doing a full collection reload pull
      setAllRdcs(prev =>
        prev.map(item =>
          item.id === docId
            ? { ...item, ...updatePayload }
            : item
        )
      );
    } catch (err) {
      console.error("Failed status mutation request payload:", err);
      alert("Database error: Could not process state alteration.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter Computation Engine
  useEffect(() => {
    let output = [...allRdcs];

    // 1. Status Filter Logic
    if (statusFilter === "active") {
      output = output.filter(r => !r.returnDate || r.returnDate.trim() === "");
    } else if (statusFilter === "returned") {
      output = output.filter(r => r.returnDate && r.returnDate.trim() !== "");
    }

    // 2. Date Window Filters
    const now = new Date();
    if (dateRange === "30days") {
      const thirtyDaysAgo = new Date().setDate(now.getDate() - 30);
      output = output.filter(r => {
        const d = r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000) : new Date(r.rdcDate);
        return d >= thirtyDaysAgo;
      });
    } else if (dateRange === "6months") {
      const sixMonthsAgo = new Date().setMonth(now.getMonth() - 6);
      output = output.filter(r => {
        const d = r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000) : new Date(r.rdcDate);
        return d >= sixMonthsAgo;
      });
    }

    // 3. Search Filter Matcher
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      output = output.filter(r => 
        r.rdcNumber.toLowerCase().includes(q) ||
        r.employeePilot.toLowerCase().includes(q) ||
        r.requestBy.toLowerCase().includes(q) ||
        r.toAddress.toLowerCase().includes(q) ||
        r.gatePassNo.toLowerCase().includes(q)
      );
    }

    setFilteredRdcs(output);

    // Operational Analytics Calculations
    let activeOut = 0;
    let returnedIn = 0;
    let crossDroneQty = 0;
    const pilotsMap = {};
    const modelsMap = {};
    const monthlyMap = {};

    output.forEach(rdc => {
      if (!rdc.returnDate || rdc.returnDate.trim() === "") {
        activeOut += 1;
      } else {
        returnedIn += 1;
      }

      if (rdc.employeePilot && rdc.employeePilot !== "—") {
        pilotsMap[rdc.employeePilot] = (pilotsMap[rdc.employeePilot] || 0) + 1;
      }

      if (rdc.itemsArray && Array.isArray(rdc.itemsArray)) {
        rdc.itemsArray.forEach(item => {
          const qty = Number(item.quantity || 0);
          crossDroneQty += qty;

          if (item.description) {
            modelsMap[item.description] = (modelsMap[item.description] || 0) + qty;
          }
        });
      }

      let dateObj = rdc.createdAt?.seconds ? new Date(rdc.createdAt.seconds * 1000) : new Date(rdc.rdcDate);
      if (!isNaN(dateObj.getTime())) {
        const monthKey = dateObj.toLocaleString("default", { month: "short", year: "2-digit" });
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { month: monthKey, "Challans Issued": 0 };
        }
        monthlyMap[monthKey]["Challans Issued"] += 1;
      }
    });

    setStats({
      totalRdc: output.length,
      activeOutside: activeOut,
      returnedToHub: returnedIn,
      totalDronesShipped: crossDroneQty,
      uniqueModelsCount: Object.keys(modelsMap).length
    });

    setPilotData(Object.keys(pilotsMap).map(name => ({ name, Deployments: pilotsMap[name] })));
    setModelDistribution(Object.keys(modelsMap).map(model => ({ name: model, value: modelsMap[model] })));
    
    const sortedTimeline = Object.values(monthlyMap).sort((a, b) => new Date(a.month + " 01") - new Date(b.month + " 01"));
    setTimelineData(sortedTimeline.length > 0 ? sortedTimeline : []);

  }, [allRdcs, dateRange, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center ml-[250px]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm tracking-wide">Connecting Dashboard Data Matrix Layers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border-b border-slate-800 shadow-xl p-6 mb-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FaUndoAlt className="text-xl" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 text-xs font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 rounded border border-emerald-500/20 inline-block mb-0.5">
              Asset Control Logistics
            </span>
            <h1 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight">Returnable DC Analytics</h1>
          </div>
        </div>
      </div>

      {/* FILTER PANEL CONTROLS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-xs">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search Pilot, RDC No, Destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors focus:border-emerald-500 focus:bg-white"
          />
        </div>

        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <FaHourglassHalf className="text-slate-400 text-xs mr-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none py-1.5 cursor-pointer"
          >
            <option value="all">All Deployment Statuses</option>
            <option value="active">Active In Field (Pending Return)</option>
            <option value="returned">Successfully Returned back to Hub</option>
          </select>
        </div>

        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <FaCalendarAlt className="text-slate-400 text-xs mr-2" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none py-1.5 cursor-pointer"
          >
            <option value="all">All Historical Timelines</option>
            <option value="30days">Last 30 Calendar Days</option>
            <option value="6months">Last 6 Business Months</option>
          </select>
        </div>
      </div>

      {/* CORE KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total RDCs</p>
            <h3 className="text-2xl font-black text-slate-990 font-mono">{stats.totalRdc}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center text-md"><FaTable /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Active in Field</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.activeOutside}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-md"><FaHourglassHalf /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Returned Ok</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.returnedToHub}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-md"><FaUndoAlt /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Units Shipped</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.totalDronesShipped} <span className="text-xs font-sans text-slate-400">Nos</span></h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-md"><FaPlane /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Unique Models</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.uniqueModelsCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-md"><FaBoxes /></div>
        </div>
      </div>

      {/* CHARTS WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* PIE CHART */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Model Manifest Share</h3>
          <div className="w-full h-[200px] flex items-center justify-center">
            {modelDistribution.length === 0 ? (
              <p className="text-xs italic text-slate-400">No active cargo records tracked</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={modelDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3}>
                    {modelDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2 text-[10px] font-bold text-slate-600">
            {modelDistribution.map((model, i) => (
              <span key={model.name} className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                {model.name} ({model.value})
              </span>
            ))}
          </div>
        </div>

        {/* BAR CHART */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Pilot Operations Assignment Loads</h3>
          <div className="w-full h-[240px]">
            {pilotData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs italic text-slate-400">No active workflows found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pilotData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="Deployments" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* REGISTRY DATA LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Live Returnable Registry ({filteredRdcs.length} records)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                <th className="p-4 pl-6">RDC Reference ID</th>
                <th className="p-4">Assigned Pilot</th>
                <th className="p-4">Target Drop Location</th>
                <th className="p-4 text-center">Field Status</th>
                <th className="p-4 text-center">Approval Status</th>
                <th className="p-4 text-center pr-6">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {filteredRdcs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 italic">No matching RDC manifests found.</td>
                </tr>
              ) : (
                filteredRdcs.map((rdc) => {
                  const isActive = !rdc.returnDate || rdc.returnDate.trim() === "";
                  const isActionDisabled = updatingId === rdc.id;
                  
                  return (
                    <tr key={rdc.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-900">
                        {rdc.rdcNumber}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">{rdc.rdcDate}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <FaUserCheck className="text-slate-400 text-[10px]" /> {rdc.employeePilot}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-500" title={rdc.toAddress}>
                        <span className="inline-flex items-center gap-1"><FaMapMarkerAlt className="text-slate-300 shrink-0" /> {rdc.toAddress}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                          isActive ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"
                        }`}>
                          {isActive ? "In Field" : "Returned"}
                        </span>
                      </td>
                      
                      {/* Live Database Approval Status State Column */}
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${
                          rdc.approvalStatus === "Completed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" :
                          rdc.approvalStatus === "Rejected" ? "bg-rose-50 border-rose-200 text-rose-600" :
                          "bg-slate-100 border-slate-200 text-slate-500"
                        }`}>
                          {rdc.approvalStatus}
                        </span>
                      </td>

                      {/* Interactive Field Status Action Management Controls */}
                      <td className="p-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(rdc.id, "Completed")}
                            disabled={isActionDisabled || rdc.approvalStatus === "Completed"}
                            className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-bold transition-all shadow-sm ${
                              rdc.approvalStatus === "Completed"
                                ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed shadow-none"
                                : "bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 active:scale-95"
                            }`}
                            title="Mark as Completed"
                          >
                            <FaCheckCircle className="text-xs" /> Complete
                          </button>
                          
                          <button
                            onClick={() => handleUpdateStatus(rdc.id, "Rejected")}
                            disabled={isActionDisabled || rdc.approvalStatus === "Rejected"}
                            className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-bold transition-all shadow-sm ${
                              rdc.approvalStatus === "Rejected"
                                ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed shadow-none"
                                : "bg-white border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-95"
                            }`}
                            title="Mark as Rejected"
                          >
                            <FaTimesCircle className="text-xs" /> Reject
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

export default AnalyzeRDC;