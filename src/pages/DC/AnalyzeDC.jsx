import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  FaFileInvoice,
  FaClipboardList,
  FaBoxes,
  FaChartLine,
  FaDolly,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaTable,
  FaUserCog
} from "react-icons/fa";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

const AnalyzeDC = () => {
  const [loading, setLoading] = useState(true);
  const [allDocs, setAllDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  
  // Filter States
  const [dateRange, setDateRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubsystems, setActiveSubsystems] = useState({
    DC: true,
    Checklist: true,
    Packing: true
  });

  const [summaryStats, setSummaryStats] = useState({
    dcCount: 0,
    checklistCount: 0,
    packingCount: 0,
    totalItemsShipped: 0,
    totalBoxesPacked: 0
  });
  
  const [chartData, setChartData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [operatorData, setOperatorData] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const dcSnapshot = await getDocs(collection(db, "deliveryChallans"));
        const checklistSnapshot = await getDocs(collection(db, "listOfItems"));
        const packingSnapshot = await getDocs(collection(db, "packingChecklist"));

        // 1. Process Delivery Challans (Uses 'products', 'dcNumber', 'packedBy')
        const dcs = dcSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            docType: "DC",
            referenceNo: data.dcNumber || "N/A",
            dateStr: data.date || "",
            createdAtTimestamp: data.createdAt,
            operator: data.packedBy || data.inspectedBy || "—",
            itemsArray: data.products || [], // 👈 Match key schema 'products'
            ...data
          };
        });

        // 2. Process Checklists (Uses 'items', 'challanNumber'/'loiNumber', 'packedBy')
        const checklists = checklistSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            docType: "Checklist",
            referenceNo: data.loiNumber || data.challanNumber || "N/A",
            dateStr: data.date || "",
            createdAtTimestamp: data.createdAt,
            operator: data.packedBy || data.inspectedBy || "—",
            itemsArray: data.items || [], // 👈 Match key schema 'items'
            ...data
          };
        });

        // 3. Process Packing Checklists (Uses 'items', 'checklistNumber', 'packingPerson')
        const packings = packingSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            docType: "Packing",
            referenceNo: data.checklistNumber || "N/A",
            dateStr: data.dispatchDate || data.date || "",
            createdAtTimestamp: data.createdAt,
            operator: data.packingPerson || data.checkingPerson || "—",
            itemsArray: data.items || [], // 👈 Match key schema 'items'
            ...data
          };
        });

        const combined = [...dcs, ...checklists, ...packings];
        setAllDocs(combined);
        setFilteredDocs(combined);
      } catch (error) {
        console.error("Database compilation failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Compute filters and engine pipelines
  useEffect(() => {
    let processDocs = [...allDocs];

    // Toggle Subsystems
    processDocs = processDocs.filter(doc => activeSubsystems[doc.docType]);

    // Filter Timeline Window
    const now = new Date();
    if (dateRange === "30days") {
      const thirtyDaysAgo = new Date().setDate(now.getDate() - 30);
      processDocs = processDocs.filter(doc => {
        const dDate = doc.createdAtTimestamp?.seconds ? new Date(doc.createdAtTimestamp.seconds * 1000) : new Date(doc.dateStr);
        return dDate >= thirtyDaysAgo;
      });
    } else if (dateRange === "6months") {
      const sixMonthsAgo = new Date().setMonth(now.getMonth() - 6);
      processDocs = processDocs.filter(doc => {
        const dDate = doc.createdAtTimestamp?.seconds ? new Date(doc.createdAtTimestamp.seconds * 1000) : new Date(doc.dateStr);
        return dDate >= sixMonthsAgo;
      });
    }

    // Free Text Filter Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      processDocs = processDocs.filter(doc => 
        doc.referenceNo?.toLowerCase().includes(query) ||
        doc.operator?.toLowerCase().includes(query) ||
        doc.pocName?.toLowerCase().includes(query)
      );
    }

    setFilteredDocs(processDocs);

    // Operational Analytics Counters
    let itemsShipped = 0;
    let boxesPacked = 0;
    let dcs = processDocs.filter(d => d.docType === "DC");
    let checklists = processDocs.filter(d => d.docType === "Checklist");
    let packings = processDocs.filter(d => d.docType === "Packing");

    let dcLines = 0, chLines = 0, pkLines = 0;
    const operatorsMap = {};

    processDocs.forEach(doc => {
      const linesCount = doc.itemsArray?.length || 0;
      if (doc.docType === "DC") dcLines += linesCount;
      if (doc.docType === "Checklist") chLines += linesCount;
      if (doc.docType === "Packing") pkLines += linesCount;

      // Safe parse mixed types (Strings vs Numbers from DB schema output)
      if (doc.itemsArray && Array.isArray(doc.itemsArray)) {
        doc.itemsArray.forEach(item => {
          itemsShipped += Number(item.quantity || 0);
          boxesPacked += Number(item.boxes || 0);
        });
      }

      // Populate Technician Matrix Data Map
      if (doc.operator && doc.operator !== "—") {
        if (!operatorsMap[doc.operator]) {
          operatorsMap[doc.operator] = { name: doc.operator, value: 0 };
        }
        operatorsMap[doc.operator].value += 1;
      }
    });

    setSummaryStats({
      dcCount: dcs.length,
      checklistCount: checklists.length,
      packingCount: packings.length,
      totalItemsShipped: itemsShipped,
      totalBoxesPacked: boxesPacked
    });

    setChartData([
      ...(activeSubsystems.DC ? [{ name: "Delivery Challans", "Document Count": dcs.length, "Unique Product Lines": dcLines }] : []),
      ...(activeSubsystems.Checklist ? [{ name: "Standard Checklists", "Document Count": checklists.length, "Unique Product Lines": chLines }] : []),
      ...(activeSubsystems.Packing ? [{ name: "Packing Manifests", "Document Count": packings.length, "Unique Product Lines": pkLines }] : [])
    ]);

    setOperatorData(Object.values(operatorsMap));

    // Timeline Aggregation
    const monthlyMap = {};
    processDocs.forEach(doc => {
      let dateObj = doc.createdAtTimestamp?.seconds ? new Date(doc.createdAtTimestamp.seconds * 1000) : new Date(doc.dateStr);
      if (isNaN(dateObj.getTime())) return;

      const monthKey = dateObj.toLocaleString("default", { month: "short", year: "2-digit" });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, DC: 0, Checklist: 0, Packing: 0 };
      }
      monthlyMap[monthKey][doc.docType] += 1;
    });

    const sortedTimeline = Object.values(monthlyMap).sort((a, b) => new Date(a.month + " 01") - new Date(b.month + " 01"));
    setTimelineData(sortedTimeline.length > 0 ? sortedTimeline : [{ month: "No Data", DC: 0, Checklist: 0, Packing: 0 }]);

  }, [allDocs, dateRange, searchQuery, activeSubsystems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center ml-[250px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm tracking-wide">Syncing Dynamic Database Fields...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased">
      
      {/* HEADER CONTROLS */}
      <div className="bg-slate-900 border-b border-slate-800 shadow-xl p-6 mb-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20 inline-block mb-0.5">
            Operations Control Tower
          </span>
          <h1 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight">Data Analytics Dashboard</h1>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <FaFilter className="text-blue-500 text-xs" />
          <span className="uppercase tracking-wider">Dynamic Workspace Filters</span>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-4">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-xs">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search reference, customer or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
            <FaCalendarAlt className="text-slate-400 text-xs mr-2" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none py-1.5 cursor-pointer"
            >
              <option value="all">All Records</option>
              <option value="30days">Last 30 Days</option>
              <option value="6months">Last 6 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        <div onClick={() => setActiveSubsystems(p => ({...p, DC: !p.DC}))} className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer select-none transition-all ${activeSubsystems.DC ? "bg-white border-slate-200" : "bg-slate-100 opacity-50"}`}>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Core DCs</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{summaryStats.dcCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg"><FaFileInvoice /></div>
        </div>

        <div onClick={() => setActiveSubsystems(p => ({...p, Checklist: !p.Checklist}))} className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer select-none transition-all ${activeSubsystems.Checklist ? "bg-white border-slate-200" : "bg-slate-100 opacity-50"}`}>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Checklists</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{summaryStats.checklistCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg"><FaClipboardList /></div>
        </div>

        <div onClick={() => setActiveSubsystems(p => ({...p, Packing: !p.Packing}))} className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer select-none transition-all ${activeSubsystems.Packing ? "bg-white border-slate-200" : "bg-slate-100 opacity-50"}`}>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Packing Lists</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{summaryStats.packingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg"><FaBoxes /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Item Volume</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{summaryStats.totalItemsShipped} <span className="text-xs font-sans text-slate-400">Pcs</span></h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg"><FaDolly /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Boxes Packed</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono">{summaryStats.totalBoxesPacked} <span className="text-xs font-sans text-slate-400">Boxes</span></h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg"><FaBoxes /></div>
        </div>
      </div>

      {/* GRAPH GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 shadow-sm">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Volume Distribution Split</h3>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Document Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Unique Product Lines" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART FOR TECHNICIANS / OPERATORS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <FaUserCog className="text-slate-400 text-xs" />
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Technician Load Split</h3>
          </div>
          <div className="w-full h-[200px] flex items-center justify-center">
            {operatorData.length === 0 ? (
              <p className="text-slate-400 italic text-xs">No user workloads logged</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={operatorData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4}>
                    {operatorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2 text-[11px] font-semibold text-slate-600">
            {operatorData.map((op, i) => (
              <div key={op.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span>{op.name} ({op.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TREND TIMELINE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Output Timeline Velocity Trend</h3>
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              {activeSubsystems.DC && <Area type="monotone" dataKey="DC" stroke="#3b82f6" fillOpacity={0.04} fill="#3b82f6" strokeWidth={2} />}
              {activeSubsystems.Checklist && <Area type="monotone" dataKey="Checklist" stroke="#f59e0b" fillOpacity={0.04} fill="#f59e0b" strokeWidth={2} />}
              {activeSubsystems.Packing && <Area type="monotone" dataKey="Packing" stroke="#10b981" fillOpacity={0.04} fill="#10b981" strokeWidth={2} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* REGISTRY LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/60">
          <FaTable className="text-slate-400 text-xs" />
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Filtered Registry Logs ({filteredDocs.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200/60">
                <th className="p-4 pl-6">Document Type</th>
                <th className="p-4">Reference ID</th>
                <th className="p-4">Client/Target Department</th>
                <th className="p-4">Log Date</th>
                <th className="p-4">Technician Account</th>
                <th className="p-4 text-center pr-6">Unique Lines</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 italic">No logged registry matching criteria.</td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 pl-6">
                      <span className={`px-2 py-0.5 font-bold uppercase text-[10px] tracking-wide rounded border ${
                        doc.docType === "DC" ? "bg-blue-50 border-blue-200 text-blue-600" :
                        doc.docType === "Checklist" ? "bg-amber-50 border-amber-200 text-amber-600" :
                        "bg-emerald-50 border-emerald-200 text-emerald-600"
                      }`}>
                        {doc.docType === "DC" ? "Core DC" : doc.docType === "Checklist" ? "LOI Checklist" : "Packing List"}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">{doc.referenceNo}</td>
                    <td className="p-4 truncate max-w-xs font-semibold text-slate-700">{doc.pocName || "— Shipped Direct —"}</td>
                    <td className="p-4 text-slate-500">{doc.dateStr || "N/A"}</td>
                    <td className="p-4 text-slate-700 font-semibold">{doc.operator}</td>
                    <td className="p-4 text-center pr-6 font-mono font-bold text-slate-900">{doc.itemsArray?.length || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AnalyzeDC;