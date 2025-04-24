import React, { useEffect, useMemo, useState } from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import DataLoader from "./DataLoader";
import NoData from "./NoData";
import { GridDefaultValues } from "../../utils/constants";
import { checkEmptyVal } from "../../utils/common";

const GridList = ({
  columns,
  data,
  fetchData,
  pageCount: controlledPageCount,
  totalInfo,
  pageSizeList = [],
  loading,
  noData,
  containerClassName,
  defaultPs,
  cellclassName,
  isShowNoData = true,
  isshowHeader = true,
  isColumnParentDiv = true,
  pagingNavigationArrows = false,
  dataloaderParentDiv = true,
  noDataParentDiv = true,
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
      initialState: {
        pageIndex: GridDefaultValues.pi,
        pageSize: defaultPs ? defaultPs : GridDefaultValues.ps,
      },
      manualPagination: true,
      pageCount: controlledPageCount,
      autoResetSelectedRows: false,
      autoResetPage: false,
    },
    useSortBy,
    usePagination
  );

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
      {data.length > 0 && isshowHeader && (
        <div className="row">
          <div className="col">
            <div className="woo-filter-bar p-3 d-flex flex-wrap justify-content-between box-shadow rounded">
              <div className="d-flex flex-wrap font-small font-500">
                {totalInfo?.count ? totalInfo.count : 0}{" "}
                {totalInfo?.text ? totalInfo.text : " records"} available
              </div>
              <div className="d-flex font-small font-500">
                Showing {pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, totalInfo?.count)}
              </div>
            </div>
          </div>
        </div>
      )}
      <div {...getTableProps()}>
        {loading ? (
          dataloaderParentDiv ? (
            <div className="col bg-white d-flex flex-center min-h-200 rounded box-shadow">
              <DataLoader></DataLoader>
            </div>
          ) : (
            <div className="col d-flex flex-center min-h-200">
              <DataLoader></DataLoader>
            </div>
          )
        ) : data.length === 0 && isShowNoData ? (
          dataloaderParentDiv ? (
            <div className="col bg-white d-flex flex-center min-h-200 rounded box-shadow">
              <NoData message={noData}></NoData>
            </div>
          ) : (
            <div className="col d-flex flex-center min-h-200">
              <NoData message={noData}></NoData>
            </div>
          )
        ) : (
          <div
            className={`${
              checkEmptyVal(containerClassName)
                ? "row row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-1 g-4 min-h-200"
                : containerClassName
            }`}
          >
            {page.map((row, tridx) => {
              prepareRow(row);
              return (
                <div
                  className={`${
                    checkEmptyVal(cellclassName) ? "col" : cellclassName
                  }`}
                  {...row.getRowProps()}
                  key={"tr-" + tridx}
                  // style={{
                  //   cursor: "pointer",
                  //   backgroundColor:
                  //     selectedRow === index ? "#f0f0f0" : "transparent",
                  // }}
                >
                  {isColumnParentDiv
                    ? row.cells.map((cell, tdidx) => (
                        <div
                          {...cell.getCellProps()}
                          className={cell.column.className}
                          key={"td-" + tdidx}
                        >
                          {cell.render("Cell")}
                        </div>
                      ))
                    : row.cells.map((cell, tdidx) => (
                        <span key={"td-" + tdidx}>{cell.render("Cell")}</span>
                      ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <>
          {pagingNavigationArrows ? (
            data.length > pageSize && (
              <nav aria-label="Page navigation example">
                <ul className="pagination pagination-dotted-active d-flex flex-wrap justify-content-center mt-50 mb-10">
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
                </ul>
              </nav>
            )
          ) : (
            <div className="row my-20">
              <div className="col">
                <div className="woo-filter-bar p-4 d-flex flex-wrap justify-content-center box-shadow rounded">
                  <nav aria-label="Page navigation example">
                    <ul className="pagination pagination-dotted-active flex-end">
                      <li className="page-item mx-2">
                        <button
                          onClick={() => gotoPage(0)}
                          disabled={!canPreviousPage}
                          className="page-link"
                        >
                          First
                        </button>
                      </li>
                      <li className="page-item mx-2">
                        <button
                          onClick={() => previousPage()}
                          disabled={!canPreviousPage}
                          className="page-link w-100"
                        >
                          Previous
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

                      <li className="page-item mx-2">
                        <button
                          onClick={() => nextPage()}
                          disabled={!canNextPage}
                          className="page-link"
                        >
                          Next
                        </button>
                      </li>
                      <li className="page-item mx-2">
                        <button
                          onClick={() => gotoPage(pageOptions.length - 1)}
                          disabled={!canNextPage}
                          className="page-link"
                        >
                          Last
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default GridList;
