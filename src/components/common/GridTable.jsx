import React, { useEffect, useState } from "react";
import { useTable, usePagination, useSortBy, useExpanded } from "react-table";
import DataLoader from "./DataLoader";
import NoData from "./NoData";
import GridActionMenu, { GridDocActionMenu } from "./GridActionMenu";
import { GridDefaultValues } from "../../utils/constants";
import { checkEmptyVal, checkObjNullorEmpty } from "../../utils/common";

const GridTable = ({
  columns,
  data,
  fetchData,
  pageCount: controlledPageCount,
  totalInfo,
  pageSizeList = [],
  actionProps,
  loading,
  noData,
  showPaging = true,
  headerClass = "box-shadow",
  getSubRows,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      getSubRows: getSubRows,
      initialState: {
        pageIndex: GridDefaultValues.pi,
        pageSize: GridDefaultValues.ps,
      },
      manualPagination: true,
      pageCount: controlledPageCount,
      autoResetSelectedRows: false,
      autoResetPage: false,
    },
    useSortBy,
    useExpanded,
    usePagination
  );

  const [expandedRows, setExpandedRows] = useState({});
  const handleRowToggle = (row) => {
    const newExpandedRows = { ...expandedRows };
    if (row.isExpanded) {
      delete newExpandedRows[row.id];
    } else {
      newExpandedRows[row.id] = true;
    }
    setExpandedRows(newExpandedRows);
    row.toggleRowExpanded(!row.isExpanded);
  };

  const renderPageNumbers = () => {
    const totalNumbers = 5;
    const pages = [];
    const startPage = Math.max(0, pageIndex - Math.floor(totalNumbers / 2));
    const endPage = Math.min(pageCount, startPage + totalNumbers);

    for (let i = startPage; i < endPage; i++) {
      pages.push(i);
    }

    if (endPage < pageCount) {
      pages.push("...");
    }

    return pages;
  };

  let visiblePageNumbers = renderPageNumbers();

  useEffect(() => {
    fetchData({ pageIndex, pageSize });
  }, [fetchData, pageIndex, pageSize]);

  return (
    <>
      <div className="overflow-x-scroll">
        <table
          className="w-100 items-list bg-transparent tbl-grid"
          {...getTableProps()}
        >
          <thead>
            {headerGroups.map((headerGroup, hidx) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className={`bg-white ${headerClass}`}
                key={"th-" + hidx}
              >
                {headerGroup.headers.map((column, thcidx) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={"thc-" + thcidx}
                    className={column.className}
                  >
                    {column.render("Header")}
                    <span>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <i className="fas fa-arrow-up-short-wide pl-5 text-primary"></i>
                        ) : (
                          <i className="fas fa-arrow-down-short-wide pl-5 text-primary"></i>
                        )
                      ) : (
                        ""
                      )}
                    </span>
                  </th>
                ))}
                {actionProps?.isActions == true && <th>Action</th>}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {loading ? (
              <tr>
                <td
                  colSpan={headerGroups[0]?.headers?.length + 1}
                  style={{
                    position: "relative",
                  }}
                >
                  <DataLoader></DataLoader>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={headerGroups[0]?.headers?.length + 1}
                  style={{
                    position: "relative",
                  }}
                >
                  <NoData className="py-50" message={noData}></NoData>
                </td>
              </tr>
            ) : (
              page.map((row, tridx) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    key={"tr-" + tridx}
                    className={
                      row.id.toString().indexOf(".") != -1
                        ? "subrow expanded"
                        : ""
                    }
                    //onClick={() => handleRowToggle(row)}
                  >
                    {row.cells.map((cell, tdidx) => (
                      <td
                        {...cell.getCellProps()}
                        className={cell.column.className}
                        key={"td-" + tdidx}
                      >
                        {cell.column.id === "Actions" &&
                        checkEmptyVal(cell.column.showActionMenu) ? (
                          <>
                            {cell.column.isDocActionMenu ? (
                              <GridDocActionMenu
                                row={row}
                                actions={cell.column.actions}
                              />
                            ) : (
                              <GridActionMenu
                                row={row}
                                actions={cell.column.actions}
                              />
                            )}
                          </>
                        ) : (
                          cell.render("Cell")
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPaging && data.length > 0 && (
        <div className="container">
          <div className="row my-4 pb-20 pt-10 flex-center">
            <div className="col-sm-12 col-md-4 col-lg-3 col-xl-3 font-small font-500">
              {totalInfo?.text ? totalInfo.text : "Total Records"} :
              <span className="pl-5">
                {totalInfo?.count ? totalInfo.count : 0}
              </span>
            </div>
            <div className="col-sm-12 col-md-4 col-lg-3 col-xl-3 font-small font-500 div-pinfo d-flex flex-center ">
              Page
              <span className="pl-5">
                {pageIndex + 1} of {pageOptions.length}
              </span>
            </div>
            <div className="col-sm-12 col-md-4 col-lg-3 col-xl-3 div-ps d-flex flex-center font-small font-400">
              Page Size :
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="form-select form-select-ps ml-10"
              >
                {[10, 20, 30, 40, 50, 100, ...pageSizeList].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-12 col-md-12 col-lg-3 col-xl-3 div-paging">
              {" "}
              <nav aria-label="Page navigation example">
                <ul className="pagination pagination-dotted-active flex-end">
                  <li className="page-item">
                    <button
                      onClick={() => gotoPage(0)}
                      disabled={!canPreviousPage}
                      className="page-link mx-0 pn"
                    >
                      <i className="fa fa-angles-left"></i>
                    </button>
                  </li>
                  <li className="page-item">
                    <button
                      onClick={() => previousPage()}
                      disabled={!canPreviousPage}
                      className="page-link mx-0 pn w-100"
                    >
                      <i className="fa fa-angle-left"></i>
                    </button>
                  </li>
                  {visiblePageNumbers.map((pageNum, i) =>
                    pageNum === "..." ? (
                      <li className={`page-item`} key={`pn-${i}`}>
                        <a
                          onClick={() =>
                            gotoPage(
                              visiblePageNumbers[
                                visiblePageNumbers.length - 2
                              ] + 1
                            )
                          }
                          className={`page-link ${
                            pageIndex == pageNum ? `box-shadow` : ``
                          } `}
                        >
                          {"..."}
                        </a>
                      </li>
                    ) : (
                      <li
                        className={`page-item ${
                          pageIndex == pageNum ? `active btn-glow` : ``
                        } `}
                        key={`pn-${i}`}
                        id={`pn-${pageNum}`}
                      >
                        <a
                          onClick={() => gotoPage(pageNum)}
                          className={`page-link ${
                            pageIndex == pageNum ? `box-shadow` : ``
                          } `}
                        >
                          {pageNum + 1}
                        </a>
                      </li>
                    )
                  )}

                  <li className="page-item">
                    <button
                      onClick={() => nextPage()}
                      disabled={!canNextPage}
                      className="page-link mx-0 pn w-100"
                    >
                      <i className="fa fa-angle-right"></i>
                    </button>
                  </li>
                  <li className="page-item">
                    <button
                      onClick={() => gotoPage(pageOptions.length - 1)}
                      disabled={!canNextPage}
                      className="page-link mx-0 pn"
                    >
                      <i className="fa fa-angles-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GridTable;
