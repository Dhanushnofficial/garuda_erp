import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { collection, getDocs } from "firebase/firestore";
import {
  FaFileInvoice,
  FaTruck,
  FaUndo,
  FaTools,
  FaUsers,
  FaBoxOpen,
  FaWarehouse,
  FaShieldAlt,
  FaNetworkWired,
  FaRegCheckCircle,
  FaArrowRight
} from "react-icons/fa";
import { db } from "../firebase/firebase";

const Dashboard = () => {
  const navigate = useNavigate();

  // =====================================
  // STATES
  // =====================================
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    totalPO: 0,
    totalDC: 0,
    totalRDC: 0,
    totalSDC: 0,
    totalVendors: 0,
    totalItems: 0,
    totalPackingChecklist: 0,
    recentGatePass: "",
    recentDC: "",
    recentRDC: "",
    recentSDC: "",
  });

  // Dynamic 10-day trend states processed from real dates
  const [poTrend, setPoTrend] = useState([]);
  const [dcTrend, setDcTrend] = useState([]);
  const [rdcTrend, setRdcTrend] = useState([]);
  const [sdcTrend, setSdcTrend] = useState([]);

  // =====================================
  // LOAD ON MOUNT
  // =====================================
  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================
  // FETCH & PROCESS DYNAMIC TRENDS BY DATE
  // =====================================
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      
      const [
        poSnapshot,
        dcSnapshot,
        rdcSnapshot,
        sdcSnapshot,
        vendorSnapshot,
        itemSnapshot,
        packingSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "purchaseOrders")),
        getDocs(collection(db, "deliveryChallans")),
        getDocs(collection(db, "rdcDocuments")),
        getDocs(collection(db, "sdcDocuments")),
        getDocs(collection(db, "vendors")),
        getDocs(collection(db, "listOfItems")),
        getDocs(collection(db, "packingChecklist")),
      ]);

      const poData = poSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const dcData = dcSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const rdcData = rdcSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sdcData = sdcSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Helper: Generate structured timeline for the last 10 days
      const generateDateRange = () => {
        const dates = [];
        const options = { month: "short", day: "numeric", year: "numeric" };
        for (let i = 9; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dates.push({
            dateString: d.toLocaleDateString("en-US", options),
            isToday: i === 0
          });
        }
        return dates;
      };

      // Helper: Map data array into historical dates for last 10 days
      const computeTrendData = (dataArray) => {
        const structuralTimeline = generateDateRange();
        
        // Count frequencies grouped by localized strings
        const dateCounts = {};
        dataArray.forEach((item) => {
          if (item.createdAt?.seconds) {
            const timestamp = new Date(item.createdAt.seconds * 1000);
            const formatted = timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            dateCounts[formatted] = (dateCounts[formatted] || 0) + 1;
          }
        });

        // Map back to chronological structure (10 intervals)
        return structuralTimeline.map((day) => ({
          value: dateCounts[day.dateString] || 0,
          date: day.isToday ? `${day.dateString} (Live)` : day.dateString
        }));
      };

      // Set state trends dynamically from document timestamps
      setPoTrend(computeTrendData(poData));
      setDcTrend(computeTrendData(dcData));
      setRdcTrend(computeTrendData(rdcData));
      setSdcTrend(computeTrendData(sdcData));

      const sortByDate = (data) => {
        return [...data].sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
      };

      const sortedPO = sortByDate(poData);
      const sortedDC = sortByDate(dcData);
      const sortedRDC = sortByDate(rdcData);
      const sortedSDC = sortByDate(sdcData);

      const allGatePass = [...dcData, ...rdcData, ...sdcData];
      const sortedGatePass = sortByDate(allGatePass);

      setDashboard({
        totalPO: poData.length,
        totalDC: dcData.length,
        totalRDC: rdcData.length,
        totalSDC: sdcData.length,
        totalVendors: vendorSnapshot.size || 0,
        totalItems: itemSnapshot.size || 0,
        totalPackingChecklist: packingSnapshot.size || 0,
        recentGatePass: sortedGatePass[0]?.gatePassNo || "No Gate Pass",
        recentDC: sortedDC[0]?.poNumber || sortedDC[0]?.dcNumber || "No DC", 
        recentRDC: sortedRDC[0]?.rdcNumber || "No RDC",
        recentSDC: sortedSDC[0]?.sdcNumber || sortedSDC[0]?.challanNo || "No SDC",
      });

      setLoading(false);
    } catch (error) {
      console.error("Dashboard database sync error:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-slate-950 text-white ml-[250px]">
        <div className="w-14 h-14 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Syncing Avionics Telemetry...
        </p>
      </div>
    );
  }

  const globalMax = Math.max(dashboard.totalPO, dashboard.totalDC, dashboard.totalRDC, dashboard.totalSDC, 5);

  return (
    <div className="min-h-screen bg-[#EEF2F7] p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 xl:p-8 shadow-xl mb-8 border border-slate-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20">
                Enterprise Logistics Engine
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Avionics Stream
              </span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight">
              Garuda ERP <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Precision Aerospace Logistics and Automated Inventory Intelligence Hub. Real-time insights grouped by historical metrics.
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              <div onClick={() => navigate("/history")} className="cursor-pointer hover:bg-slate-800 bg-slate-800/60 backdrop-blur-md px-3.5 py-2 rounded-xl text-slate-300 font-medium text-xs border border-slate-700/50 shadow-sm flex items-center gap-2 transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                Recent Record: <span className="text-white font-mono font-bold">{dashboard.recentDC}</span>
              </div>
              <div onClick={() => navigate("/rdc/analyze")} className="cursor-pointer hover:bg-slate-800 bg-slate-800/60 backdrop-blur-md px-3.5 py-2 rounded-xl text-slate-300 font-medium text-xs border border-slate-700/50 shadow-sm flex items-center gap-2 transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Recent RDC: <span className="text-white font-mono font-bold">{dashboard.recentRDC}</span>
              </div>
              <div onClick={() => navigate("/sdc/analyze")} className="cursor-pointer hover:bg-slate-800 bg-slate-800/60 backdrop-blur-md px-3.5 py-2 rounded-xl text-slate-300 font-medium text-xs border border-slate-700/50 shadow-sm flex items-center gap-2 transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Recent SDC: <span className="text-white font-mono font-bold">{dashboard.recentSDC}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 p-5 min-w-[280px] w-full lg:w-auto shadow-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Active Airfield Gate Pass
            </p>
            <h1 className="text-2xl font-mono font-bold text-emerald-400 mt-1 tracking-wide">
              {dashboard.recentGatePass}
            </h1>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-800 pt-3">
              <FaShieldAlt className="text-emerald-500 text-sm" />
              <span>Security Clearance Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* PRIMARY CORE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Purchase Orders"
          value={dashboard.totalPO}
          description="Inbound inventory requirements & financial procurement logs"
          gradient="from-blue-500 to-indigo-600"
          icon={<FaFileInvoice />}
          tagColor="text-blue-600 bg-blue-50"
          onClick={() => navigate("/history")}
        />
        <Card
          title="Delivery Challans"
          value={dashboard.totalDC}
          description="Outbound dispatch documents tracking material handovers"
          gradient="from-emerald-500 to-teal-600"
          icon={<FaTruck />}
          tagColor="text-emerald-600 bg-emerald-50"
          onClick={() => navigate("/history")}
        />
        <Card
          title="RDC Documents"
          value={dashboard.totalRDC}
          description="Returnable Delivery Challans checking client/field turnarounds"
          gradient="from-amber-500 to-orange-600"
          icon={<FaUndo />}
          tagColor="text-amber-600 bg-amber-50"
          onClick={() => navigate("/rdc/history")}
        />
        <Card
          title="SDC Documents"
          value={dashboard.totalSDC}
          description="Supplier Delivery Challans tracking repairs & incoming assemblies"
          gradient="from-purple-500 to-fuchsia-600"
          icon={<FaTools />}
          tagColor="text-purple-600 bg-purple-50"
          onClick={() => navigate("/sdc/history")}
        />
      </div>

      {/* GRAPH WORKSPACE INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* GRAPH 1 */}
        <div 
          onClick={() => navigate("/po-registry")}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-300 group"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
                  <FaFileInvoice />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800 tracking-tight">PO Volume Trend Line</h3>
                    <FaArrowRight className="text-xs text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">10-day timeline analysis for incoming Purchase Orders</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">
                Total: {dashboard.totalPO}
              </span>
            </div>
            <div className="pt-2">
              <LineChart chartData={poTrend} color="#2563EB" gradientId="poGrad" categoryLabel="Purchase Orders" />
            </div>
          </div>
        </div>

        {/* GRAPH 2 */}
        <div 
          onClick={() => navigate("/dc/analyze")}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all duration-300 group"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm">
                  <FaTruck />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800 tracking-tight">DC Transport Trend Line</h3>
                    <FaArrowRight className="text-xs text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">10-day real-time outbound dispatch transaction map</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg">
                Total: {dashboard.totalDC}
              </span>
            </div>
            <div className="pt-2">
              <LineChart chartData={dcTrend} color="#10B981" gradientId="dcGrad" categoryLabel="Delivery Challans" />
            </div>
          </div>
        </div>

        {/* GRAPH 3 */}
        <div 
          onClick={() => navigate("/rdc/analyze")}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between cursor-pointer hover:border-amber-400 hover:shadow-md transition-all duration-300 group"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg text-sm">
                  <FaUndo />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800 tracking-tight">RDC Returnable Material Matrix</h3>
                    <FaArrowRight className="text-xs text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">10-day circulatory operations tracker for airfield items</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg">
                Total: {dashboard.totalRDC}
              </span>
            </div>
            <div className="pt-2">
              <LineChart chartData={rdcTrend} color="#F59E0B" gradientId="rdcGrad" categoryLabel="RDC Documents" />
            </div>
          </div>
        </div>

        {/* GRAPH 4 */}
        <div 
          onClick={() => navigate("/sdc/analyze")}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between cursor-pointer hover:border-purple-400 hover:shadow-md transition-all duration-300 group"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg text-sm">
                  <FaTools />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800 tracking-tight">SDC Inbound Supplier Ledger</h3>
                    <FaArrowRight className="text-xs text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">10-day matrix tracking supplier configurations & repairs</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg">
                Total: {dashboard.totalSDC}
              </span>
            </div>
            <div className="pt-2">
              <LineChart chartData={sdcTrend} color="#8B5CF6" gradientId="sdcGrad" categoryLabel="SDC Documents" />
            </div>
          </div>
        </div>

      </div>

      {/* ALLOCATION MATRIX BREAKDOWN FIELD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
            <FaNetworkWired className="text-slate-400 text-sm" />
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Distribution Allocation Flow Ledger</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => navigate("/history")} className="cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-all"><MiniProgressBar title="PO Volume Allocation" value={dashboard.totalPO} max={globalMax} color="bg-blue-500" /></div>
            <div onClick={() => navigate("/dc/history")} className="cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-all"><MiniProgressBar title="DC Transport Share" value={dashboard.totalDC} max={globalMax} color="bg-emerald-500" /></div>
            <div onClick={() => navigate("/rdc/history")} className="cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-all"><MiniProgressBar title="RDC Turnaround Matrix" value={dashboard.totalRDC} max={globalMax} color="bg-amber-500" /></div>
            <div onClick={() => navigate("/sdc/history")} className="cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-all"><MiniProgressBar title="SDC Supplier Inbound" value={dashboard.totalSDC} max={globalMax} color="bg-purple-500" /></div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-500 font-medium">
            <div>Precision Aerospace Synchronization Matrix Verified Normal. Click components to access individual data layers.</div>
            <div className="flex gap-4 font-mono">
              <div>System Efficiency: <span className="text-slate-800 font-bold">99.84%</span></div>
              <div className="flex items-center gap-1">Buffer Status: <span className="text-emerald-600 font-bold flex items-center gap-1"><FaRegCheckCircle /> Stable</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY MASTER DATA METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <InfoCard
          title="Active Registered Vendors"
          value={dashboard.totalVendors}
          icon={<FaUsers />}
          themeColor="blue"
        />
        <InfoCard
          title="Cataloged Inventory Items"
          value={dashboard.totalItems}
          icon={<FaBoxOpen />}
          themeColor="emerald"
        />
        <InfoCard
          title="Completed Packing Checklists"
          value={dashboard.totalPackingChecklist}
          icon={<FaWarehouse />}
          themeColor="purple"
        />
      </div>

    </div>
  );
};

// =====================================
// NATIVE VECTOR LINE CHART
// =====================================
const LineChart = ({ chartData, color, gradientId, categoryLabel }) => {
  const width = 550; // Increased width slightly to hold 10 labels comfortably
  const height = 160;
  const padding = 35;

  const [hoveredNode, setHoveredNode] = useState(null);

  if (!chartData || chartData.length === 0) return null;

  const maxVal = Math.max(...chartData.map((d) => d.value), 1);
  const chartCeiling = maxVal * 1.25;

  const points = chartData.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / (chartData.length - 1);
    const y = height - padding - (item.value / chartCeiling) * (height - padding * 2);
    
    // Grabs just the day and month (e.g., "May 19") for the layout
    const cleanLabel = item.date.split(",")[0] || item.date;
    return { x, y, label: cleanLabel, value: item.value, date: item.date };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="relative w-full overflow-visible">
      {hoveredNode && (
        <div 
          className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-xl p-2.5 shadow-xl border border-slate-700 text-xs font-sans transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
          style={{ 
            left: `${(hoveredNode.x / width) * 100}%`, 
            top: `${(hoveredNode.y / height) * 100 - 4}%` 
          }}
        >
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">{categoryLabel}</div>
          <div className="font-mono font-black text-sm text-white flex items-center gap-1.5">
            <span>Count:</span> 
            <span style={{ color: color }}>{hoveredNode.value}</span>
          </div>
          <div className="mt-1 pt-1 border-t border-slate-800 text-[11px] font-medium text-slate-300 font-mono">
            📆 {hoveredNode.date}
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((ratio, i) => {
          const yPos = padding + ratio * (height - padding * 2);
          const gridVal = Math.round(chartCeiling * (1 - ratio));
          return (
            <g key={i}>
              <line x1={padding} y1={yPos} x2={width - padding} y2={yPos} stroke="#F1F5F9" strokeWidth="1.5" />
              <text x={padding - 10} y={yPos + 3.5} textAnchor="end" className="text-[10px] fill-slate-400 font-mono font-bold">{gridVal}</text>
            </g>
          );
        })}

        <path d={areaD} fill={`url(#${gradientId})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => {
          // Render lower labels selectively or split them up to avoid layout clutter
          const shouldShowLabel = i % 2 === 0 || i === points.length - 1;

          return (
            <g 
              key={i} 
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredNode(p)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <line 
                x1={p.x} 
                y1={height - padding} 
                x2={p.x} 
                y2={p.y} 
                stroke={color} 
                strokeWidth="1.25" 
                strokeDasharray="3 3" 
                className="opacity-20 group-hover:opacity-100 transition-opacity" 
              />
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredNode?.date === p.date ? "6.5" : "4.5"} 
                className="fill-white transition-all duration-150 shadow-sm" 
                stroke={color} 
                strokeWidth={hoveredNode?.date === p.date ? "3.5" : "2.5"} 
              />
              <circle cx={p.x} cy={p.y} r="1.5" fill={color} />
              
              <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[9px] font-mono font-extrabold fill-slate-700 hidden group-hover:block">
                {p.value}
              </text>
              
              {shouldShowLabel && (
                <text x={p.x} y={height - padding + 16} textAnchor="middle" className="text-[9px] font-bold fill-slate-400 tracking-wider font-mono">
                  {p.label.replace(" (Live)", "")}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// =====================================
// PROGRESS METRIC BARS
// =====================================
const MiniProgressBar = ({ title, value, max, color }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between text-xs font-semibold text-slate-600">
        <span className="truncate pr-2">{title}</span>
        <span className="font-mono font-bold text-slate-900">{value}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${Math.max(4, percentage)}%` }}></div>
      </div>
    </div>
  );
};

// =====================================
// PRIMARY CORE CARDS
// =====================================
const Card = ({ title, value, description, gradient, icon, tagColor, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-slate-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between"
  >
    <div>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight transition-transform group-hover:scale-105 duration-200">
            {value}
          </h2>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl shadow-md transform group-hover:rotate-6 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <p className="text-slate-400 text-xs font-medium mt-3 leading-relaxed">
        {description}
      </p>
    </div>
    
    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${tagColor}`}>
        ● Live View
      </span>
      <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-800 flex items-center gap-1 transition-colors">
        Manage <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
      </span>
    </div>
  </div>
);

// =====================================
// SECONDARY INFO CARDS
// =====================================
const colorThemes = {
  blue: { text: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  emerald: { text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  purple: { text: "text-purple-600", bg: "bg-purple-50 border-purple-100" }
};

const InfoCard = ({ title, value, icon, themeColor = "blue" }) => {
  const selectedTheme = colorThemes[themeColor] || colorThemes.blue;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className={`text-3xl font-black ${selectedTheme.text} tracking-tight`}>
          {value}
        </h3>
      </div>
      <div className={`w-12 h-12 rounded-xl border ${selectedTheme.bg} ${selectedTheme.text} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  );
};

export default Dashboard;