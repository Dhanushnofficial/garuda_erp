import React, {
  useEffect,
  useState,
} from "react";

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
  FaClipboardCheck,
  FaPlus,
  FaBoxes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { db } from "../../firebase/firebase";

const QCHistory = () => {

  // ======================================================
  // STATES
  // ======================================================

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [data, setData] =
    useState([]);

  const [filteredData, setFilteredData] =
    useState([]);

  // ======================================================
  // PAGINATION
  // ======================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const rowsPerPage = 10;

  // ======================================================
  // FETCH DATA
  // ======================================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    try {

      setLoading(true);

      const q = query(
        collection(db, "qcReports"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const temp = snapshot.docs.map(
        (docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })
      );

      setData(temp);

      setFilteredData(temp);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  // ======================================================
  // SEARCH
  // ======================================================

  useEffect(() => {

    const text = search.toLowerCase();

    const result = data.filter(
      (item) => {

        const qcNumber = String(
          item?.qcNumber || ""
        ).toLowerCase();

        const vendorName = String(
          item?.formData?.vendorName || ""
        ).toLowerCase();

        const invoiceNo = String(
          item?.formData?.invoiceNo || ""
        ).toLowerCase();

        return (
          qcNumber.includes(text) ||
          vendorName.includes(text) ||
          invoiceNo.includes(text)
        );
      }
    );

    setFilteredData(result);

    setCurrentPage(1);

  }, [search, data]);

  // ======================================================
  // PAGINATION LOGIC
  // ======================================================

  const totalPages = Math.ceil(
    filteredData.length / rowsPerPage
  );

  const indexOfLastRow =
    currentPage * rowsPerPage;

  const indexOfFirstRow =
    indexOfLastRow - rowsPerPage;

  const currentRows =
    filteredData.slice(
      indexOfFirstRow,
      indexOfLastRow
    );

  // ======================================================
  // PAGE HANDLERS
  // ======================================================

  const nextPage = () => {

    if (currentPage < totalPages) {

      setCurrentPage(
        currentPage + 1
      );
    }
  };

  const prevPage = () => {

    if (currentPage > 1) {

      setCurrentPage(
        currentPage - 1
      );
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this QC Report permanently?"
      );

    if (!confirmDelete) return;

    try {

      await deleteDoc(
        doc(db, "qcReports", id)
      );

      const updatedData =
        data.filter(
          (item) => item.id !== id
        );

      setData(updatedData);

      setFilteredData(updatedData);

    } catch (error) {

      console.log(error);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (

      <div className="flex justify-center items-center min-h-screen bg-slate-100 ml-[250px]">

        <div className="text-center">

          <div className="w-14 h-14 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="text-slate-500 mt-5 tracking-widest text-sm uppercase font-bold">
            Loading QC Reports...
          </p>

        </div>

      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (

    <div className="min-h-screen bg-[#eef2f7] p-6 ml-[250px]">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col xl:flex-row gap-6 mb-8">

        {/* LEFT */}

        <div className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[90px]"></div>

          <div className="relative z-10 flex items-center gap-5">

            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">

              <FaClipboardCheck className="text-4xl" />

            </div>

            <div>

              <p className="text-xs font-bold uppercase tracking-[4px] text-blue-400">
                Quality Control Department
              </p>

              <h1 className="text-5xl font-black text-white mt-2">
                QC Report Registry
              </h1>

              <p className="text-slate-400 mt-3 text-lg">
                Incoming Inspection Report Database
              </p>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="w-full xl:w-[300px] bg-white rounded-3xl shadow-lg border border-slate-200 p-6 flex justify-between items-center">

          <div>

            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Total Reports
            </p>

            <h2 className="text-5xl font-black text-slate-800 mt-2">
              {filteredData.length}
            </h2>

            <p className="text-emerald-600 text-xs mt-3 font-bold">
              QC Reports Active
            </p>

          </div>

          <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 text-4xl">

            <FaBoxes />

          </div>

        </div>

      </div>

      {/* ======================================================
          SEARCH BAR
      ====================================================== */}

      <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-5 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center">

        {/* SEARCH */}

        <div className="relative w-full lg:max-w-xl">

          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

          <input
            type="text"
            placeholder="Search QC Number / Vendor / Invoice"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-4 bg-slate-50 focus:ring-4 focus:ring-blue-500/10 outline-none"
          />

        </div>

        {/* BUTTON */}

        <Link
          to="/qc/create"
          className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white px-7 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg"
        >

          <FaPlus />

          Create QC

        </Link>

      </div>

      {/* ======================================================
          TABLE SECTION
      ====================================================== */}

      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

        {/* HEADER */}

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 border-b border-slate-800">

          <h2 className="text-white text-2xl font-black">
            QC Report Registry
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Quality Control Incoming Inspection Reports
          </p>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead>

              <tr className="bg-slate-100 text-slate-500 uppercase text-xs tracking-wider">

                <th className="p-5 text-left font-black">
                  QC Number
                </th>

                <th className="p-5 text-left font-black">
                  Vendor Name
                </th>

                <th className="p-5 text-left font-black">
                  Invoice Number
                </th>

                <th className="p-5 text-left font-black">
                  Invoice Date
                </th>

                <th className="p-5 text-center font-black">
                  Total Items
                </th>

                <th className="p-5 text-center font-black">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {currentRows.length > 0 ? (

                currentRows.map(
                  (item, index) => (

                    <tr
                      key={
                        item.id || index
                      }
                      className="border-t border-slate-200 hover:bg-slate-50 transition-all duration-200"
                    >

                      {/* QC NUMBER */}

                      <td className="p-5 font-black text-blue-700">

                        {item?.qcNumber || "-"}

                      </td>

                      {/* VENDOR */}

                      <td className="p-5 font-semibold text-slate-700">

                        {item?.formData?.vendorName || "-"}

                      </td>

                      {/* INVOICE */}

                      <td className="p-5 text-slate-600">

                        {item?.formData?.invoiceNo || "-"}

                      </td>

                      {/* DATE */}

                      <td className="p-5 text-slate-600">

                        {item?.formData?.invoiceDate || "-"}

                      </td>

                      {/* ITEMS */}

                      <td className="p-5 text-center">

                        <span className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2 rounded-xl text-xs font-bold">

                          {item?.rows?.length || 0} Items

                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="p-5">

                        <div className="flex justify-center gap-3">

                          {/* VIEW */}

                          <Link
                            to={`/qc/preview/${item.id}`}
                            className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all"
                          >

                            <FaEye />

                          </Link>

                          {/* EDIT */}

                          <Link
                            to={`/qc/edit/${item.id}`}
                            className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-all"
                          >

                            <FaEdit />

                          </Link>

                          {/* DELETE */}

                          <button
                            onClick={() =>
                              handleDelete(item.id)
                            }
                            className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all"
                          >

                            <FaTrash />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan={6}
                    className="text-center py-24"
                  >

                    <div className="flex flex-col items-center">

                      <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 text-5xl mb-6">

                        <FaClipboardCheck />

                      </div>

                      <h2 className="text-3xl font-black text-slate-700">
                        No QC Reports Found
                      </h2>

                      <p className="text-slate-400 mt-3">
                        No reports match your search.
                      </p>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* ======================================================
            PAGINATION
        ====================================================== */}

        <div className="flex flex-col md:flex-row justify-between items-center gap-5 p-6 border-t border-slate-200 bg-slate-50">

          {/* INFO */}

          <div className="text-sm font-semibold text-slate-600">

            Showing{" "}

            <span className="text-blue-600 font-black">

              {indexOfFirstRow + 1}

            </span>

            {" "}to{" "}

            <span className="text-blue-600 font-black">

              {Math.min(
                indexOfLastRow,
                filteredData.length
              )}

            </span>

            {" "}of{" "}

            <span className="text-blue-600 font-black">

              {filteredData.length}

            </span>

            {" "}Reports

          </div>

          {/* BUTTONS */}

          <div className="flex items-center gap-4">

            {/* PREVIOUS */}

            <button
              onClick={prevPage}
              disabled={
                currentPage === 1
              }
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
                currentPage === 1
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-black text-white"
              }`}
            >

              <FaChevronLeft />

              Previous

            </button>

            {/* PAGE */}

            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg">

              {currentPage}

            </div>

            {/* NEXT */}

            <button
              onClick={nextPage}
              disabled={
                currentPage === totalPages
              }
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
                currentPage === totalPages
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >

              Next

              <FaChevronRight />

            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default QCHistory;