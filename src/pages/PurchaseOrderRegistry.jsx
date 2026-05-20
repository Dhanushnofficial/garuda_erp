import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc, writeBatch } from "firebase/firestore";
import { 
  FaArrowLeft, 
  FaFilter, 
  FaSearch, 
  FaFileInvoiceDollar, 
  FaCoins, 
  FaCalendarAlt, 
  FaUserTag,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChartPie,
  FaChartLine,
  FaSlidersH,
  FaCheckCircle,
  FaTimesCircle,
  FaEye
} from "react-icons/fa";
import { db } from "../firebase/firebase";

const PurchaseOrderRegistry = () => {
  const navigate = useNavigate();

  // =====================================
  // STATES
  // =====================================
  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendorsMap, setVendorsMap] = useState({});
  const [activeChartTab, setActiveChartTab] = useState("TREND"); 
  const [actioningId, setActioningId] = useState(null); 
  
  // Metrics States
  const [analytics, setAnalytics] = useState({
    totalSpend: 0,
    averageValue: 0,
    pendingCount: 0,
    completedCount: 0,
    topVendor: "N/A"
  });

  // Filter & Search Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState("ALL"); 
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  // =====================================
  // INITIALIZATIONS
  // =====================================
  useEffect(() => {
    fetchRegistryData();
  }, []);

  const fetchRegistryData = async () => {
    try {
      setLoading(true);
      
      const [poSnapshot, vendorSnapshot] = await Promise.all([
        getDocs(collection(db, "purchaseOrders")),
        getDocs(collection(db, "vendors"))
      ]);

      const vMap = {};
      vendorSnapshot.docs.forEach(doc => {
        const data = doc.data();
        vMap[doc.id] = data.vendorName || data.venderName || data.name || data.vendorCompany || "Unknown Vendor";
      });
      setVendorsMap(vMap);

      const rawPOs = poSnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const totalAmount = parseFloat(data.totalAmount || data.grandTotal || data.amount || 0);
        
        // Initialize the variable correctly to eliminate your build errors
        let finalizedVendorName = "Unassigned Vendor";

        // 🎯 TARGETING THE MAP PROPERTY STRUCTURE
        if (data.vendorId && vMap[data.vendorId]) {
          finalizedVendorName = vMap[data.vendorId];
        } else if (data.vendorData && typeof data.vendorData === "object") {
          // Extracts directly out of your vendorData map layout
          finalizedVendorName = data.vendorData.vendorCompany || 
                                data.vendorData.vendorName || 
                                data.vendorData.venderName;
        } else {
          // Flat text fallback checks
          const possibleKeys = [
            "venderName", "vendorName", "vendor", "vender", 
            "vendorCompany", "supplier", "supplierName", "name"
          ];
          
          for (const key of possibleKeys) {
            if (data[key] && typeof data[key] === "string" && data[key].trim() !== "") {
              finalizedVendorName = data[key];
              break;
            }
          }
        }

        // Final security check in case the fields evaluated to null strings
        if (!finalizedVendorName) {
          finalizedVendorName = "Unassigned Vendor";
        }
        
        let status = data.status ? data.status.toUpperCase() : "PENDING";
        
        return {
          id: docSnapshot.id,
          ...data,
          totalAmount,
          vendorName: finalizedVendorName,
          status,
        };
      });

      setPurchaseOrders(rawPOs);
      calculateAnalytics(rawPOs);
      setLoading(false);
    } catch (error) {
      console.error("Error building Purchase Order Intelligence Registry:", error);
      setLoading(false);
    }
  };

  // =====================================
  // DATA SCIENCE & ANALYTICS ENGINE
  // =====================================
  const calculateAnalytics = (orders) => {
    if (orders.length === 0) {
      setAnalytics({ totalSpend: 0, averageValue: 0, pendingCount: 0, completedCount: 0, topVendor: "N/A" });
      return;
    }

    let spendSum = 0;
    let pending = 0;
    let completed = 0;
    const vendorSpendTracker = {};

    orders.forEach(order => {
      spendSum += order.totalAmount;
      
      if (order.status === "COMPLETED" || order.status === "RECEIVED" || order.status === "ACCEPTED") completed++;
      else if (order.status === "PENDING") pending++;

      if (order.vendorName && order.vendorName !== "Unassigned Vendor") {
        vendorSpendTracker[order.vendorName] = (vendorSpendTracker[order.vendorName] || 0) + order.totalAmount;
      }
    });

    let topVendorName = "N/A";
    let maxVendorSpend = -1;
    Object.keys(vendorSpendTracker).forEach(vName => {
      if (vendorSpendTracker[vName] > maxVendorSpend) {
        maxVendorSpend = vendorSpendTracker[vName];
        topVendorName = vName;
      }
    });

    if (topVendorName === "N/A" && orders.length > 0 && orders[0].vendorName) {
      topVendorName = orders[0].vendorName;
    }

    setAnalytics({
      totalSpend: spendSum,
      averageValue: spendSum / orders.length,
      pendingCount: pending,
      completedCount: completed,
      topVendor: topVendorName
    });
  };

  // =====================================
  // LIFECYCLE ACTION STATE TRANSITIONS
  // =====================================
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setActioningId(orderId);
      
      const poRef = doc(db, "purchaseOrders", orderId);
      await updateDoc(poRef, { status: newStatus });

      const updatedOrders = purchaseOrders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });

      setPurchaseOrders(updatedOrders);
      calculateAnalytics(updatedOrders);
      setActioningId(null);
    } catch (error) {
      console.error(`Failed to update status to ${newStatus}:`, error);
      setActioningId(null);
    }
  };

  // =====================================
  // FILTER, SEARCH, & SORT MANAGEMENT
  // =====================================
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getFilteredAndSortedData = () => {
    let output = [...purchaseOrders];

    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      output = output.filter(order => 
        (order.poNumber && order.poNumber.toLowerCase().includes(query)) ||
        (order.vendorName && order.vendorName.toLowerCase().includes(query)) ||
        order.id.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "ALL") {
      output = output.filter(order => order.status === statusFilter);
    }

    if (dateRangeFilter !== "ALL") {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const daysInSeconds = (dateRangeFilter === "10_DAYS" ? 10 : 30) * 24 * 60 * 60;
      
      output = output.filter(order => {
        const orderTime = order.createdAt?.seconds || 0;
        return (nowSeconds - orderTime) <= daysInSeconds;
      });
    }

    output.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === "createdAt") {
        aVal = a.createdAt?.seconds || 0;
        bVal = b.createdAt?.seconds || 0;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return output;
  };

  const processedOrders = getFilteredAndSortedData();

  const getTimelineTrendDataset = () => {
    const dates = [];
    const options = { month: "short", day: "numeric" };
    
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString("en-US", options));
    }

    const frequencyMap = {};
    processedOrders.forEach(order => {
      if (order.createdAt?.seconds) {
        const t = new Date(order.createdAt.seconds * 1000);
        const formatted = t.toLocaleDateString("en-US", options);
        frequencyMap[formatted] = (frequencyMap[formatted] || 0) + 1;
      }
    });

    return dates.map(dayLabel => ({
      label: dayLabel,
      value: frequencyMap[dayLabel] || 0
    }));
  };

  const getVendorAllocationDataset = () => {
    const tracking = {};
    processedOrders.forEach(order => {
      tracking[order.vendorName] = (tracking[order.vendorName] || 0) + order.totalAmount;
    });

    return Object.keys(tracking)
      .map(name => ({ label: name, value: tracking[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-slate-950 text-white ml-[250px]">
        <div className="w-14 h-14 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Optimizing Ledger Pipelines...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F7] p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-sm mb-3"
          >
            <FaArrowLeft /> Back to Core Operations
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Purchase Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligence Registry</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Audit deployment trends, execute inline document approvals, and run analytics operations.
          </p>
        </div>
      </div>

      {/* METRIC ANALYSIS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl text-xl"><FaFileInvoiceDollar /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procurement Spend</p>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mt-0.5">
              ₹{analytics.totalSpend.toLocaleString("en-IN")}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl text-xl"><FaCoins /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Order Value</p>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mt-0.5">
              ₹{Math.round(analytics.averageValue).toLocaleString("en-IN")}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl text-xl"><FaChartPie /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Release</p>
            <h3 className="text-xl font-black text-amber-600 tracking-tight mt-0.5">
              {analytics.pendingCount} <span className="text-xs text-slate-400 font-medium">Orders</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl text-xl"><FaUserTag /></div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Contractor</p>
            <h3 className="text-sm font-black text-slate-800 tracking-tight mt-1 truncate">
              {analytics.topVendor}
            </h3>
          </div>
        </div>
      </div>

      {/* GRAPH WORKSPACE MATRIX AREA */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-800 tracking-tight">Procurement Aggregation Workspace</h3>
            <p className="text-xs text-slate-400 mt-0.5">Visual representation of active ledger data arrays filtered below</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setActiveChartTab("TREND")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${activeChartTab === "TREND" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              <FaChartLine /> 10-Day Volume
            </button>
            <button 
              onClick={() => setActiveChartTab("VENDORS")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${activeChartTab === "VENDORS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              <FaSlidersH /> Vendor Share
            </button>
          </div>
        </div>

        <div className="w-full">
          {activeChartTab === "TREND" ? (
            <TimelineTrendGraph chartData={getTimelineTrendDataset()} />
          ) : (
            <VendorShareBarGraph chartData={getVendorAllocationDataset()} />
          )}
        </div>
      </div>

      {/* REGISTRY FILTER ENGINE WORKBENCH */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-3.5 text-slate-400 text-sm" />
            <input 
              type="text"
              placeholder="Search by PO number, supplier node, or record token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <FaFilter className="text-slate-400 text-xs" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Workflow Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Accepted/Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <FaCalendarAlt className="text-slate-400 text-xs" />
              <select 
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Logical Timelines</option>
                <option value="10_DAYS">Last 10 Days Activity</option>
                <option value="30_DAYS">Last 30 Days Activity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CORE DATA LEDGER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                <th className="p-4 pl-6 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSort("poNumber")}>
                  <div className="flex items-center gap-1.5">
                    PO Index {sortConfig.key === "poNumber" && (sortConfig.direction === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                  </div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSort("createdAt")}>
                  <div className="flex items-center gap-1.5">
                    Timestamp {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                  </div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors" onClick={() => handleSort("vendorName")}>
                  <div className="flex items-center gap-1.5">
                    Supplier Entity {sortConfig.key === "vendorName" && (sortConfig.direction === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                  </div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors text-right" onClick={() => handleSort("totalAmount")}>
                  <div className="flex items-center justify-end gap-1.5">
                    Valuation {sortConfig.key === "totalAmount" && (sortConfig.direction === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                  </div>
                </th>
                <th className="p-4 text-center">Lifecycle Status</th>
                <th className="p-4 pr-6 text-center">Action Orchestration Grid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {processedOrders.length > 0 ? (
                processedOrders.map((order) => {
                  const displayDate = order.createdAt?.seconds 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "No Timestamp";

                  const isPending = order.status === "PENDING";
                  const isCurrentlyUpdating = actioningId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {order.poNumber || `PO-${order.id.substring(0, 5).toUpperCase()}`}
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-xs">
                        {displayDate}
                      </td>
                      <td className={`p-4 font-semibold ${order.vendorName === "Unassigned Vendor" ? "text-slate-400 italic" : "text-slate-800"}`}>
                        {order.vendorName}
                      </td>
                      <td className="p-4 text-right font-mono font-extrabold text-slate-900">
                        ₹{order.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase rounded-lg tracking-wider border ${
                          order.status === "COMPLETED" || order.status === "RECEIVED" || order.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : order.status === "APPROVED"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : order.status === "REJECTED"
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {order.status === "COMPLETED" ? "ACCEPTED" : order.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          {isCurrentlyUpdating ? (
                            <div className="w-5 h-5 border-2 border-t-blue-500 border-slate-200 rounded-full animate-spin"></div>
                          ) : isPending ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md transform active:scale-95 group/btn"
                                title="Accept and Close Order"
                              >
                                <FaCheckCircle className="text-[10px] opacity-90 group-hover/btn:scale-110 transition-transform" />
                                <span>Accept</span>
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(order.id, "REJECTED")}
                                className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm transform active:scale-95 group/btn"
                                title="Reject Order Formulation"
                              >
                                <FaTimesCircle className="text-[10px] opacity-90 group-hover/btn:rotate-90 transition-transform" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => navigate(`/po/preview/${order.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                            >
                              <FaEye className="text-[10px]" /> Audit Log
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-12 text-slate-400 font-medium font-sans">
                    No procurement logs match your current filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400 font-mono px-6">
          <div>SHOWING {processedOrders.length} OF {purchaseOrders.length} RECORDS</div>
          <div>STATE INTERFACING SYNCHRONIZATION: OPERATIONAL</div>
        </div>
      </div>

    </div>
  );
};

// ==========================================
// SUB-GRAPH 1: VECTOR TIMELINE ENGINE (SVG)
// ==========================================
const TimelineTrendGraph = ({ chartData }) => {
  const width = 600;
  const height = 150;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;

  const maxVal = Math.max(...chartData.map(d => d.value), 2);
  const ceiling = Math.ceil(maxVal * 1.2);

  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i * (width - paddingLeft - paddingRight)) / (chartData.length - 1);
    const y = height - paddingBottom - (d.value / ceiling) * (height - paddingTop - paddingBottom);
    return { x, y, ...d };
  });

  const pathLine = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");
  const areaPath = `${pathLine} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[550px] h-auto overflow-visible">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((ratio, index) => {
          const yPos = paddingTop + ratio * (height - paddingTop - paddingBottom);
          const valueMark = Math.round(ceiling * (1 - ratio));
          return (
            <g key={index}>
              <line x1={paddingLeft} y1={yPos} x2={width - paddingRight} y2={yPos} stroke="#F1F5F9" strokeWidth="1.5" />
              <text x={paddingLeft - 10} y={yPos + 3.5} textAnchor="end" className="text-[10px] font-mono font-bold fill-slate-400">{valueMark}</text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#trendGrad)" />
        <path d={pathLine} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i} className="group">
            <circle cx={p.x} cy={p.y} r="4" className="fill-white stroke-blue-500 transition-all group-hover:r-5" strokeWidth="2" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] font-mono font-black fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
              {p.value}
            </text>
            <text x={p.x} y={height - 12} textAnchor="middle" className="text-[10px] font-bold fill-slate-400 font-mono">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ==========================================
// SUB-GRAPH 2: VECTOR VENDOR CHART ENGINE
// ==========================================
const VendorShareBarGraph = ({ chartData }) => {
  if (chartData.length === 0) {
    return <div className="text-center py-6 text-xs text-slate-400 font-medium font-sans">No vendor allocation data matches current workspace scopes.</div>;
  }

  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="space-y-4 py-2">
      {chartData.map((item, i) => {
        const percent = (item.value / maxVal) * 100;
        return (
          <div key={i} className="flex items-center gap-4">
            <div className="w-1/4 text-xs font-bold text-slate-600 truncate text-right">
              {item.label}
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl h-6 relative overflow-hidden border border-slate-100">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-xl transition-all duration-500" 
                style={{ width: `${Math.max(2, percent)}%` }}
              ></div>
              <span className="absolute left-3 top-1 text-[10px] font-mono font-extrabold text-slate-700">
                ₹{item.value.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PurchaseOrderRegistry;