import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { 
  FaSave, 
  FaSlidersH, 
  FaPlus, 
  FaTrashAlt, 
  FaFileSignature, 
  FaHeading, 
  FaEye 
} from "react-icons/fa";
import logo from "../assets/logo_1.png";

const TemplateSettings = () => {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState({
    // HEADER LABELS
    documentTitle: "PURCHASE ORDER",
    poLabel: "PO Number:",
    dateLabel: "Date:",
    shipTitle: "SHIP TO:",
    termsTitle: "Terms & Conditions",
    signatureLabel: "Authorized Signature",
    // PO STAMP SYSTEM CONFIGS
    poPrefix: "GA",
    poDate: new Date().toISOString().split("T")[0],
    // SHIP TO DEFAULT SCHEMAS
    shipTo: [
      "Garuda Aerospace Private .Private .",
      "Agni College Of Technology",
      "Old Mahabalipuram Road",
      "Thazhambur, Chennai - 600130",
      "Tamil Nadu, India",
      "GSTIN : 33AAGCG1621A1ZG"
    ],
    // DEFAULT TERMS
    terms: [
      "Goods once sold will not be taken back.",
      "Payment should be completed within due date.",
      "Subject to Chennai jurisdiction only.",
      "Warranty applicable as per manufacturer terms.",
      "This is computer generated Purchase Order."
    ],
    // SIGNATURE BLOCKS
    enableSignature: false,
    signatureText: "For Garuda Aerospace Private .Pvt ",
    signatureImage: "",
    // FOOTER RECONCILIATION MATRICES
    footerDetails: [
      "Garuda Aerospace Private .Private .",
      "Agni College Of Technology, Old Mahabalipuram Road, Thazhambur, Chennai - 600130, Tamil Nadu, India",
      "GSTIN: 33AAGCG1621A1ZG",
      "inventory@garudaaerospace.com",
      "+91 8056811808"
    ]
  });

  // =========================================
  // SYNCHRONIZATION HOOKS
  // =========================================
  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "settings", "template");
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setTemplate({
          documentTitle: data?.documentTitle || "PURCHASE ORDER",
          poLabel: data?.poLabel || "PO Number:",
          dateLabel: data?.dateLabel || "Date:",
          shipTitle: data?.shipTitle || "SHIP TO:",
          termsTitle: data?.termsTitle || "Terms & Conditions",
          signatureLabel: data?.signatureLabel || "Authorized Signature",
          poPrefix: data?.poPrefix || "GA",
          poDate: data?.poDate || new Date().toISOString().split("T")[0],
          shipTo: Array.isArray(data?.shipTo) ? data.shipTo : [
            "Garuda Aerospace Private .Private .",
            "Agni College Of Technology",
            "Old Mahabalipuram Road",
            "Thazhambur, Chennai - 600130",
            "Tamil Nadu, India",
            "GSTIN : 33AAGCG1621A1ZG"
          ],
          terms: Array.isArray(data?.terms) ? data.terms : [
            "Goods once sold will not be taken back.",
            "Payment should be completed within due date.",
            "Subject to Chennai jurisdiction only.",
            "Warranty applicable as per manufacturer terms.",
            "This is computer generated Purchase Order."
          ],
          enableSignature: data?.enableSignature || false,
          signatureText: data?.signatureText || "For Garuda Aerospace Private .Pvt ",
          signatureImage: data?.signatureImage || "",
          footerDetails: Array.isArray(data?.footerDetails) ? data.footerDetails : [
            "Garuda Aerospace Private .Private .",
            "Agni College Of Technology, Old Mahabalipuram Road, Thazhambur, Chennai - 600130, Tamil Nadu, India",
            "GSTIN: 33AAGCG1621A1ZG",
            "inventory@garudaaerospace.com",
            "+91 8056811808"
          ]
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Template retrieval failure:", error);
      setLoading(false);
    }
  };

  // =========================================
  // MUTATION TRIGGERS
  // =========================================
  const handleChange = (field, value) => {
    setTemplate((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange("signatureImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveTemplate = async () => {
    try {
      await setDoc(doc(db, "settings", "template"), template);
      alert("System Matrix Verified: Template settings successfully written.");
    } catch (error) {
      console.error("Database write failure:", error);
      alert("Configuration write failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 xl:p-8 ml-[250px] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* TOP CONFIGURATION INTERACTION CONTROL BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {/* Font locked to 12px via text-xs */}
            <span className="px-2.5 py-1 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 rounded border border-blue-500/20">
              System Core Configuration
            </span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight">Template Settings Workstation</h1>
          <p className="text-slate-400 text-sm mt-1">Customize global baseline variables and labels for the PDF generation engine.</p>
        </div>
        <button
          onClick={saveTemplate}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-950/20 transition-all duration-150 flex items-center gap-2 border border-blue-500/30 active:scale-95"
        >
          <FaSave className="text-sm" /> Commit Template Schema
        </button>
      </div>

      {/* CORE LOADING STATUS BAR */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 font-medium text-sm rounded-xl p-4 mb-6 flex items-center gap-3 animate-pulse">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          Synchronizing Template Node Records with Database Server...
        </div>
      )}

      {/* ============================================================== */}
      {/* WORKSPACE STATIONS: MAIN INTERACTION INPUT GRID */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-8">
        
        {/* ROW MODULE 1: GLOBAL TEXT STRINGS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            {/* Icon size adjusted slightly, text locked to 12px via text-xs */}
            <FaHeading className="text-slate-400 text-sm" />
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Dynamic Layout Structural Labels</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              {/* Labels locked to 12px via text-xs */}
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">Document Core Heading</label>
              <input
                type="text"
                value={template.documentTitle}
                onChange={(e) => handleChange("documentTitle", e.target.value)}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm font-bold tracking-wide text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                placeholder="Heading"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">PO Registry Tag Label</label>
              <input
                type="text"
                value={template.poLabel}
                onChange={(e) => handleChange("poLabel", e.target.value)}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                placeholder="PO Label"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">Timestamp Axis Label</label>
              <input
                type="text"
                value={template.dateLabel}
                onChange={(e) => handleChange("dateLabel", e.target.value)}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                placeholder="Date Label"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">Routing Heading Identifier</label>
              <input
                type="text"
                value={template.shipTitle}
                onChange={(e) => handleChange("shipTitle", e.target.value)}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                placeholder="SHIP TO Title"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">Compliance Header Identifier</label>
              <input
                type="text"
                value={template.termsTitle}
                onChange={(e) => handleChange("termsTitle", e.target.value)}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                placeholder="Terms Title"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">Attestation Underline Label</label>
              <input
                type="text"
                value={template.signatureLabel}
                onChange={(e) => handleChange("signatureLabel", e.target.value)}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                placeholder="Signature Label"
              />
            </div>
          </div>
        </div>

        {/* ROW MODULE 2: IDENTITY MATRIX SEED PARAMETERS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FaSlidersH className="text-slate-400 text-sm" />
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Default Generator Configuration Seeds</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">Auto-Generation Identity Prefix</label>
              <input
                type="text"
                value={template.poPrefix}
                onChange={(e) => handleChange("poPrefix", e.target.value)}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm font-mono tracking-wider text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                placeholder="PO Prefix"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">Baseline Processing Epoch Date</label>
              <input
                type="date"
                value={template.poDate}
                onChange={(e) => handleChange("poDate", e.target.value)}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
              />
            </div>
          </div>
        </div>

        {/* ROW MODULE 3: ROUTING SHIP DETAILS LIST ARRAY */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Default Global Delivery (SHIP TO) Parameters</h4>
            <button
              type="button"
              onClick={() => handleChange("shipTo", [...template.shipTo, ""])}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-700 shadow-sm transition-all flex items-center gap-1"
            >
              <FaPlus className="text-[10px]" /> Append Address Row
            </button>
          </div>
          <div className="space-y-3">
            {template.shipTo?.map((line, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const updated = [...template.shipTo];
                    updated[index] = e.target.value;
                    handleChange("shipTo", updated);
                  }}
                  className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...template.shipTo];
                    updated.splice(index, 1);
                    handleChange("shipTo", updated);
                  }}
                  className="p-3 text-slate-400 hover:text-rose-600 rounded-xl bg-white border border-slate-100 shadow-sm transition-colors"
                >
                  <FaTrashAlt className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ROW MODULE 4: COMPLIANCE STRINGS ARRAY */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Default Terms & Conditions Registry</h4>
            <button
              type="button"
              onClick={() => handleChange("terms", [...template.terms, ""])}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-700 shadow-sm transition-all flex items-center gap-1"
            >
              <FaPlus className="text-[10px]" /> Append Condition Line
            </button>
          </div>
          <div className="space-y-3">
            {template.terms?.map((term, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const updated = [...template.terms];
                    updated[index] = e.target.value;
                    handleChange("terms", updated);
                  }}
                  className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...template.terms];
                    updated.splice(index, 1);
                    handleChange("terms", updated);
                  }}
                  className="p-3 text-slate-400 hover:text-rose-600 rounded-xl bg-white border border-slate-100 shadow-sm transition-colors"
                >
                  <FaTrashAlt className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ROW MODULE 5: SECURITY SEALS & SIGNATURE BUFFER */}
        <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaFileSignature className="text-slate-400 text-sm" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dynamic Attestation Blocks</h4>
            </div>
            <button
              onClick={() => handleChange("enableSignature", !template.enableSignature)}
              className={`w-14 h-8 rounded-full relative transition-all duration-200 outline-none border border-transparent ${
                template.enableSignature ? "bg-emerald-500 ring-4 ring-emerald-500/10" : "bg-slate-200"
              }`}
            >
              <div className={`absolute top-0.5 w-[26px] h-[26px] bg-white rounded-full shadow-md transition-all duration-200 ${
                template.enableSignature ? "right-0.5" : "left-0.5"
              }`} />
            </button>
          </div>

          {template.enableSignature && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-slate-200/60 animate-fadeIn">
              <div className="space-y-2">
                <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">Attestation Corporate Header String</label>
                <input
                  type="text"
                  value={template.signatureText}
                  onChange={(e) => handleChange("signatureText", e.target.value)}
                  className="w-full border border-slate-200 bg-white rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                  placeholder="e.g. For Garuda Aerospace Private .Pvt "
                />
              </div>
              <div className="space-y-2">
                <label className="block font-bold text-xs text-slate-500 uppercase tracking-wide">Vector Seal Image Crypt (Base64 Binary)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer outline-none focus:border-blue-500"
                />
              </div>
              {template.signatureImage && (
                <div className="md:col-span-2 p-3 bg-white border border-slate-100 rounded-xl max-w-max shadow-sm">
                  <img src={template.signatureImage} alt="Vector Validation Node Stamp" className="h-16 object-contain" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ROW MODULE 6: COMPLIANCE FOOTER BLOCK ARR LAYOUT */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Baseline Corporate Brand Footer Distribution</h4>
            <button
              type="button"
              onClick={() => handleChange("footerDetails", [...template.footerDetails, ""])}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-700 shadow-sm transition-all flex items-center gap-1"
            >
              <FaPlus className="text-[10px]" /> Append Footer Line
            </button>
          </div>
          <div className="space-y-3">
            {template.footerDetails?.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...template.footerDetails];
                    updated[index] = e.target.value;
                    handleChange("footerDetails", updated);
                  }}
                  className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...template.footerDetails];
                    updated.splice(index, 1);
                    handleChange("footerDetails", updated);
                  }}
                  className="p-3 text-slate-400 hover:text-rose-600 rounded-xl bg-white border border-slate-100 shadow-sm transition-colors"
                >
                  <FaTrashAlt className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* BOTTOM LAYOUT WORKSPACE: LIVE PREVIEW SYSTEM CONTAINER */}
      {/* ============================================================== */}
      <div className="space-y-4 mt-10">
        <div className="flex items-center gap-2 pl-2 text-slate-400">
          <FaEye className="text-sm" />
          <span className="font-bold text-xs uppercase tracking-widest">Live Template Verification Grid Layout (A4 Scale Emulation)</span>
        </div>
        
        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-inner overflow-x-auto flex justify-center">
          
          <div
            className="bg-white shadow-2xl shrink-0 p-12 flex flex-col justify-between rounded-sm"
            style={{
              width: "210mm",
              minHeight: "297mm",
              boxSizing: "border-box",
              fontFamily: "Inter, system-ui, sans-serif"
            }}
          >
            <div>
              {/* HEADING REGISTRY DATA OVERLAY LAYER */}
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8">
                <div>
                  <img src={template.logo || logo} alt="Brand Reference Master" className="h-16 w-auto object-contain max-w-[200px]" />
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase m-0">
                    {template.documentTitle}
                  </h2>
                  {/* Text scales standardized cleanly at text-xs (12px) floor limits */}
                  <div className="mt-4 text-xs leading-relaxed text-slate-600 font-semibold">
                    <p className="mb-1"><b className="text-slate-900 font-bold">{template.poLabel}</b> <span className="font-mono text-sm">{template.poPrefix}-005</span></p>
                    <p><b className="text-slate-900 font-bold">{template.dateLabel}</b> <span className="font-mono text-sm">{template.poDate}</span></p>
                  </div>
                </div>
              </div>

              {/* ROUTING ADDR EMBED ALLOCATIONS VIEW */}
              <div className="grid grid-cols-2 gap-12 mt-8 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-500 uppercase tracking-widest text-xs border-b-2 pb-1.5 border-slate-100">
                    {template.shipTitle}
                  </h4>
                  <div className="leading-relaxed font-medium text-slate-800 space-y-1 text-xs">
                    {template.shipTo?.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 opacity-30 select-none">
                  <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs border-b-2 pb-1.5 border-slate-100">SOLD TO REGISTRY</h4>
                  <div className="leading-relaxed font-medium text-slate-400 space-y-1 text-xs">
                    <p className="font-black text-xs">SUPPLIER CORPORATE HANDLE</p>
                    <p>Primary Agent Variable</p>
                    <p className="font-mono text-xs">Contact Secure String</p>
                    <p>Authentication Mail Routing Address</p>
                  </div>
                </div>
              </div>

              {/* PLACEHOLDER DUMMY LEDGER MOCKUP TO BALANCE VISUAL WEIGHTS */}
              <div className="mt-12 bg-slate-50 border border-slate-100 rounded-xl p-4 text-center text-xs font-mono font-bold tracking-wide text-slate-400 select-none uppercase">
                * Operational Core Item Ledger Block Emulation Placeholder *
              </div>
            </div>

            <div>
              {/* CLAUSES AND VALIDATION ATTESTATION LAYER MAPPED DYNAMICALLY */}
              <div className="flex justify-between items-end border-t border-slate-200/80 mt-12 pt-6 min-h-[120px]">
                <div className="max-w-[60%]">
                  <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-2">
                    {template.termsTitle}
                  </h5>
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5 leading-relaxed font-medium">
                    {template.terms?.map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ul>
                </div>

                {template.enableSignature && (
                  <div className="text-center space-y-3 animate-fadeIn">
                    {template.signatureText && (
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{template.signatureText}</p>
                    )}
                    {template.signatureImage && (
                      <img src={template.signatureImage} alt="Live Signature Stamp Overlay" className="h-12 w-auto object-contain mx-auto" />
                    )}
                    <div className="border-t-2 border-slate-400 w-44 pt-2 text-xs font-bold text-slate-800 tracking-wide">
                      {template.signatureLabel}
                    </div>
                  </div>
                )}
              </div>

              {/* SYSTEM FOOTER DATA BRAND TRACKS RENDER */}
              <div className="mt-12 border-t border-slate-200 pt-6 text-center space-y-2 text-slate-500 text-xs font-semibold tracking-wide">
                {template.footerDetails?.map((item, index) => (
                  <p
                    key={index}
                    className={index === 0 ? "font-bold text-slate-800 text-xs m-0 mb-1 block uppercase tracking-wider" : "inline-block px-3 border-r last:border-0 border-slate-200 text-slate-400 font-medium text-xs"}
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default TemplateSettings;