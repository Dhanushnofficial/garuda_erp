import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle, FaBoxes, FaSearch, FaChartPie, FaChartBar, FaChevronLeft, FaChevronRight, FaFilter } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Legend, Bar } from "recharts";
import { db } from "../../firebase/firebase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const QCAnalyze = () => {
  const [loading, setLoading] = useState(true);
  const [qcData, setQcData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;


  // ======================================================
// EXPORT EXCEL
// ======================================================

const exportToExcel = () => {

  const exportData = [];

  qcData.forEach((report) => {

    report.rows?.forEach((row, index) => {

      exportData.push({

        "QC Number":
          report.qcNumber,

        "Vendor Name":
          report.formData
            ?.vendorName,

        "Invoice No":
          report.formData
            ?.invoiceNo,

        "Invoice Date":
          report.formData
            ?.invoiceDate,

        "Vehicle No":
          report.formData
            ?.vehicleNo,

        "Store Location":
          report.formData
            ?.storeLocation,

        "Part No":
          row.partNo,

        Description:
          row.description,

        UOM:
          row.uom,

        Qty:
          row.qty,

        "Received Qty":
          row.recdQty,

        "Inspection Qty":
          row.inspQty,

        "Accepted Qty":
          row.accQty,

        "Rejected Qty":
          row.rejQty,

        Status:
          row.status,

        Remarks:
          row.remarks,

        "Inspected By":
          report.signatures
            ?.inspectedBy
            ?.name,

        "Verified By":
          report.signatures
            ?.verifiedBy
            ?.name,

        "Store Incharge":
          report.signatures
            ?.storeIncharge
            ?.name,

        "Approved By":
          report.signatures
            ?.approvedBy
            ?.name,

      });

    });

  });

  // CREATE WORKSHEET

  const worksheet =
    XLSX.utils.json_to_sheet(
      exportData
    );

  // COLUMN WIDTH

  worksheet["!cols"] = [

    { wch: 18 },
    { wch: 25 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 30 },
    { wch: 18 },
    { wch: 35 },
    { wch: 12 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },

  ];

  // WORKBOOK

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "QC Reports"
  );

  // BUFFER

  const excelBuffer =
    XLSX.write(workbook, {

      bookType: "xlsx",
      type: "array",

    });

  const fileData =
    new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

  saveAs(
    fileData,
    `QC_Reports.xlsx`
  );
};
  useEffect(() => {
    const fetchQCData = async () => {
      try {
        const q = query(collection(db, "qcReports"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setQcData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQCData();
  }, []);

  // Memoized calculations to keep dashboard fast
  const { filteredData, stats, pieData, monthlyData } = useMemo(() => {
    const filtered = qcData.filter((item) =>
      item?.qcNumber?.toLowerCase().includes(search.toLowerCase()) ||
      item?.formData?.vendorName?.toLowerCase().includes(search.toLowerCase())
    );

    let totalAcc = 0, totalRej = 0, totalQ = 0;
    const monthlyMap = {};

    qcData.forEach((report) => {
      const month = report.createdAt?.toDate?.()?.toLocaleDateString("en-US", { month: "short" }) || "Unknown";
      if (!monthlyMap[month]) monthlyMap[month] = { month, accepted: 0, rejected: 0 };
      
      report.rows?.forEach((row) => {
        const acc = Number(row.accQty || 0);
        const rej = Number(row.rejQty || 0);
        totalAcc += acc; totalRej += rej; totalQ += (Number(row.qty || 0));
        monthlyMap[month].accepted += acc;
        monthlyMap[month].rejected += rej;
      });
    });

    return {
      filteredData: filtered,
      stats: { totalAcc, totalRej, totalQ, totalReports: qcData.length },
      pieData: [{ name: "Accepted", value: totalAcc }, { name: "Rejected", value: totalRej }],
      monthlyData: Object.values(monthlyMap)
    };
  }, [qcData, search]);

  if (loading) return <div className="h-screen flex justify-center items-center bg-slate-50 text-xl font-bold text-slate-400">Initializing Analytics Engine...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 ml-[250px]">
      {/* Analytics Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">QC Intelligence Hub</h1>
        <p className="text-slate-500">Real-time performance tracking and inspection insights.</p>
      </header>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Reports", val: stats.totalReports, icon: FaClipboardCheck, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Accepted Items", val: stats.totalAcc, icon: FaCheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Rejected Items", val: stats.totalRej, icon: FaTimesCircle, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Total Volume", val: stats.totalQ, icon: FaBoxes, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`text-2xl ${card.color}`} />
            </div>
            <p className="text-sm font-semibold text-slate-400">{card.label}</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">{card.val}</h2>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Yield Ratio</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={i === 0 ? "#10b981" : "#f43f5e"} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Monthly Trend Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} />
              <YAxis axisLine={false} />
              <Tooltip />
              <Bar dataKey="accepted" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejected" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <button
        onClick={exportToExcel}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-3"
      >

        Export Excel Sheet

      </button>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold">Inspection Records</h3>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
            <FaSearch className="text-slate-400" />
            <input className="bg-transparent outline-none text-sm" placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-6">QC ID</th>
              <th className="p-6">Vendor</th>
              <th className="p-6">Accepted</th>
              <th className="p-6">Rejected</th>
              <th className="p-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.slice((currentPage-1)*rowsPerPage, currentPage*rowsPerPage).map((item) => (
              <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-6 font-bold text-blue-600">{item.qcNumber}</td>
                <td className="p-6">{item.formData?.vendorName}</td>
                <td className="p-6 text-emerald-600 font-bold">{item.rows?.reduce((a, b) => a + Number(b.accQty), 0)}</td>
                <td className="p-6 text-rose-600 font-bold">{item.rows?.reduce((a, b) => a + Number(b.rejQty), 0)}</td>
                <td className="p-6"><span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">PROCESSED</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-6 flex justify-between items-center border-t border-slate-100">
           <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="text-sm font-bold flex items-center gap-2"><FaChevronLeft /> Prev</button>
           <span className="text-sm text-slate-400">Page {currentPage}</span>
           <button onClick={() => setCurrentPage(prev => prev + 1)} className="text-sm font-bold flex items-center gap-2">Next <FaChevronRight /></button>
        </div>
      </div>
    </div>
  );
};

export default QCAnalyze;