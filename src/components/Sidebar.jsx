import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaPlus,
  FaHistory,
  FaCog,
  FaUsers,
  FaChevronDown,
  FaChevronUp,
  FaFileInvoice,
  FaTruck,
  FaFileAlt,
  FaClipboardList,
  FaBoxes,
} from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();

  // =========================
  // SINGLE ACTIVE DROPDOWN
  // =========================
  const [activeDropdown, setActiveDropdown] = useState("");

  // =========================
  // AUTO OPEN ACTIVE ROUTE
  // =========================
  useEffect(() => {
    if (
      location.pathname === "/create" ||
      location.pathname === "/history" ||
      location.pathname === "/template-settings" ||
      location.pathname === "/vendors" ||
      location.pathname === "/po-registry"
    ) {
      setActiveDropdown("po");
    } else if (location.pathname.includes("/dc")) {
      setActiveDropdown("dc");
    } else if (location.pathname.includes("/rdc")) {
      setActiveDropdown("rdc");
    } else if (location.pathname.includes("/sdc")) {
      setActiveDropdown("sdc");
    } else {
      setActiveDropdown("");
    }
  }, [location.pathname]);

  // =========================
  // TOGGLE FUNCTION
  // =========================
  const toggleDropdown = (menu) => {
    setActiveDropdown((prev) => (prev === menu ? "" : menu));
  };

  // =========================
  // STYLE TOKENS
  // =========================
  const activeStyle =
    "bg-blue-600 font-semibold text-white shadow-lg shadow-blue-900/30 border-l-4 border-blue-400";

  const normalStyle =
    "text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent";

  return (
    <div className="w-64 h-screen fixed top-0 left-0 bg-slate-900 border-r border-slate-800 p-5 shadow-2xl z-50 overflow-y-auto flex flex-col justify-between scrollbar-thin scrollbar-thumb-slate-800">
      
      <div>
        {/* BRAND HEADER */}
        <div className="mb-8 pb-5 border-b border-slate-800/60">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>

            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
              Avionics System
            </span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            Garuda{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              PO
            </span>
          </h1>

          <p className="text-slate-500 text-xs mt-1 font-medium">
            Enterprise Procurement ERP
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="flex flex-col gap-2.5">

          {/* DASHBOARD */}
          <Link
            to="/"
            className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all duration-150 font-medium ${
              location.pathname === "/" ? activeStyle : normalStyle
            }`}
          >
            <FaHome className="text-base shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* PO TERMINAL */}
          <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/40">
            
            <button
              onClick={() => toggleDropdown("po")}
              className="w-full flex items-center justify-between p-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-semibold"
            >
              <div className="flex items-center gap-3">
                <FaFileInvoice className="text-slate-400 text-base shrink-0" />
                <span>PO Terminal</span>
              </div>

              {activeDropdown === "po" ? (
                <FaChevronUp className="text-[10px]" />
              ) : (
                <FaChevronDown className="text-[10px]" />
              )}
            </button>

            {activeDropdown === "po" && (
              <div className="flex flex-col gap-1 p-1.5 bg-slate-950/60 border-t border-slate-900 animate-slideDown">
                
                <Link
                  to="/create"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/create"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaPlus className="shrink-0" />
                  Create fresh PO
                </Link>

                <Link
                  to="/history"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/history"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaHistory className="shrink-0" />
                  Master History
                </Link>

                <Link
                  to="/template-settings"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/template-settings"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaCog className="shrink-0" />
                  Core Template
                </Link>

                <Link
                  to="/vendors"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/vendors"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaUsers className="shrink-0" />
                  Vendor Registry
                </Link>

                <Link
                  to="/po-registry"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/po-registry"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaFileInvoice className="shrink-0" />
                  PO Analytics
                </Link>

              </div>
            )}
          </div>

          {/* DC LOGISTICS */}
          <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/40">

            <button
              onClick={() => toggleDropdown("dc")}
              className="w-full flex items-center justify-between p-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-semibold"
            >
              <div className="flex items-center gap-3">
                <FaTruck className="text-slate-400 text-base shrink-0" />
                <span>DC Logistics</span>
              </div>

              {activeDropdown === "dc" ? (
                <FaChevronUp className="text-[10px]" />
              ) : (
                <FaChevronDown className="text-[10px]" />
              )}
            </button>

            {activeDropdown === "dc" && (
              <div className="flex flex-col gap-1 p-1.5 bg-slate-950/60 border-t border-slate-900">

                <Link
                  to="/dc/history"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/dc/history"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaHistory className="shrink-0" />
                  DC History
                </Link>

                <Link
                  to="/dc/checklist-history"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/dc/checklist-history"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaClipboardList className="shrink-0" />
                  Item Checklists
                </Link>

                <Link
                  to="/dc/packing-history"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/dc/packing-history"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaBoxes className="shrink-0" />
                  Cargo Packing
                </Link>

                <Link
                  to="/dc/analyze"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/dc/analyze"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaHistory className="shrink-0" />
                  Analytics
                </Link>

              </div>
            )}
          </div>

          {/* RDC */}
          <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/40">

            <button
              onClick={() => toggleDropdown("rdc")}
              className="w-full flex items-center justify-between p-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-semibold"
            >
              <div className="flex items-center gap-3">
                <FaClipboardList className="text-slate-400 text-base shrink-0" />
                <span>RDC Loops</span>
              </div>

              {activeDropdown === "rdc" ? (
                <FaChevronUp className="text-[10px]" />
              ) : (
                <FaChevronDown className="text-[10px]" />
              )}
            </button>

            {activeDropdown === "rdc" && (
              <div className="flex flex-col gap-1 p-1.5 bg-slate-950/60 border-t border-slate-900">

                <Link
                  to="/rdc/create"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/rdc/create"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaPlus className="shrink-0" />
                  Setup Return Loop
                </Link>

                <Link
                  to="/rdc/history"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/rdc/history"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaHistory className="shrink-0" />
                  Loop Registers
                </Link>

                <Link
                  to="/rdc/analyze"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/rdc/analyze"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaHistory className="shrink-0" />
                  Analytics
                </Link>

              </div>
            )}
          </div>

          {/* SDC */}
          <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/40">

            <button
              onClick={() => toggleDropdown("sdc")}
              className="w-full flex items-center justify-between p-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-semibold"
            >
              <div className="flex items-center gap-3">
                <FaFileAlt className="text-slate-400 text-base shrink-0" />
                <span>SDC Inbound</span>
              </div>

              {activeDropdown === "sdc" ? (
                <FaChevronUp className="text-[10px]" />
              ) : (
                <FaChevronDown className="text-[10px]" />
              )}
            </button>

            {activeDropdown === "sdc" && (
              <div className="flex flex-col gap-1 p-1.5 bg-slate-950/60 border-t border-slate-900">

                <Link
                  to="/sdc/create"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/sdc/create"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaPlus className="shrink-0" />
                  Register Inbound SDC
                </Link>

                <Link
                  to="/sdc/history"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/sdc/history"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaHistory className="shrink-0" />
                  Inbound Registers
                </Link>

                <Link
                  to="/sdc/analyze"
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                    location.pathname === "/sdc/analyze"
                      ? activeStyle
                      : normalStyle
                  }`}
                >
                  <FaHistory className="shrink-0" />
                  SDC Analytics
                </Link>

              </div>
            )}
                
          </div>
          {/* QC */}
            <div className="rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/40">

            <button
              onClick={() => toggleDropdown("qc")}
              className="w-full flex items-center justify-between p-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-semibold"
            >
              <div className="flex items-center gap-3">
                <FaFileAlt className="text-slate-400 text-base shrink-0" />
                <span>QC Inspection Report</span>
              </div>

              {activeDropdown === "qc" ? (
                <FaChevronUp className="text-[10px]" />
              ) : (
                <FaChevronDown className="text-[10px]" />
              )}
            </button>

            {activeDropdown === "qc" && (
              <div className="flex flex-col gap-1 p-1.5 bg-slate-950/60 border-t border-slate-900">

                  <Link
                      to="/qc/create"
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                        location.pathname === "/qc/create"
                          ? activeStyle
                          : normalStyle
                      }`}
                    >
                      <FaPlus className="shrink-0" />
                      QC Create
                </Link>
                <Link 
                    to="/qc/history"
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                      location.pathname === "/qc/history"
                        ? activeStyle
                        : normalStyle
                    }`}
                  >
                    <FaHistory className="shrink-0" />
                    QC History
                </Link>
                <Link 
                    to="/qc/analyze"
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium ${
                      location.pathname === "/qc/analyze"
                        ? activeStyle
                        : normalStyle
                    }`}
                  >
                    <FaHistory className="shrink-0" />
                    QC Analytics
                </Link>
               

              </div>
            )}
                
            </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-8 pt-4 border-t border-slate-800/60 text-slate-500 font-medium">
        <span className="text-xs text-slate-300 tracking-wide font-semibold block">
          Garuda Aerospace
        </span>

        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
          Developed by Dhanush
        </span>
      </div>

    </div>
  );
};

export default Sidebar;