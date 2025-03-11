import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  GridDefaultValues,
  UserCookie,
  SessionStorageKeys,
} from "../../../utils/constants";
import { useLocation, useNavigate } from "react-router-dom";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  replacePlaceHolders,
} from "../../../utils/common";
import {
  addSessionStorageItem,
  deletesessionStorageItem,
  getsessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import {
  Grid,
  FoldersBreadCrumb,
} from "../../../components/common/LazyComponents";
import moment from "moment";
import DateControl from "../../../components/common/DateControl";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import { Toast } from "../../../components/common/ToastView";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import PdfViewer from "../../../components/common/PdfViewer";

const SharedFolders = () => {
  let $ = window.$;
  const location = useLocation();
  const navigate = useNavigate();
  const { loggedinUser } = useAuth();

  let folderid = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewSharedDocfolderId, 0)
  );

  let rootfolderid = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewSharedDocRootfolderId, 0)
  );

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let loggedinprofiletypeid = parseInt(
    GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
  );

  let formErrors = {};
  const [reloadKey, setReloadKey] = useState(new Date().toLocaleTimeString());
  const [foldersHierarchyData, setFoldersHierarchyData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [documentsData, setDocumentsData] = useState([]);
  const [documentfilesData, setDocumentfilesData] = useState([]);
  const [fileUrl, setFileUrl] = useState(null);
  const [selectedGridRow, setSelectedGridRow] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [viewerModalShow, setViewerModalShow] = useState(false);
  const [documentDetails, setDocumentDetails] = useState({});

  useEffect(() => {
    folderid = parseInt(
      getsessionStorageItem(SessionStorageKeys.ViewSharedDocfolderId, 0)
    );
    getFoldersHierarchy();
    //getDocuments({});
    setSearchFormData(setSearchInitialFormData);
  }, [reloadKey]);

  useEffect(() => {
    return () => {
      //deletesessionStorageItem(SessionStorageKeys.ViewSharedDocfolderId);
    };
  }, []);

  useEffect(() => {
    if (currentIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    if (currentIndex != null) {
      getDocumentDetails(documentfilesData[currentIndex].Id);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [currentIndex]);

  const closeFullScreen = () => {
    setCurrentIndex(null);
    setSelectedGridRow(null);
    setViewerModalShow(false);
    setFileUrl(null);
  };

  // Navigate to previous file
  const handlePrevious = () => {
    setFileUrl(null);
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : documentfilesData.length - 1;
    setCurrentIndex(newIndex);
  };

  // Navigate to next file
  const handleNext = () => {
    setFileUrl(null);
    const newIndex =
      currentIndex < documentfilesData.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
  };

  const getDocumentDetails = async (id) => {
    if (id > 0) {
      let objParams = {
        DocumentId: parseInt(id),
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getDocumentDetails}`, objParams)
        .then(async (response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setDocumentDetails(objResponse.Data);
            const fresponse = await fetchPost(
              `${config.apiBaseUrl}${ApiUrls.getDocumentFile}`,
              {
                StorageDocumentId: objResponse.Data.StorageDocumentId,
              }
            );
            if (fresponse.ok) {
              const blob = await fresponse.blob();
              const url = URL.createObjectURL(blob);
              setFileUrl(url);
            }
          } else {
          }
        })
        .catch((err) => {
          console.error(
            `"API :: ${ApiUrls.getDocumentDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {
          setIsDataLoading(false);
        });
    }
  };

  const getFoldersHierarchy = () => {
    if (folderid > 0) {
      // apiReqResLoader("x");
      let isapimethoderr = false;
      let objParams = {};
      objParams = {
        rootfolderid: rootfolderid,
        folderid: folderid,
        profileid: profileid,
      };

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getDocumentFoldersHierarchy}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setFoldersHierarchyData(objResponse.Data);
          } else {
            isapimethoderr = true;
            setFoldersHierarchyData([]);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setFoldersHierarchyData([]);
          console.error(
            `"API :: ${ApiUrls.getDocumentFoldersHierarchy}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr === true) {
            Toast.error(AppMessages.SomeProblem);
          }
          // apiReqResLoader("x", "", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      setFoldersHierarchyData([]);
    }
  };

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: moment().subtract(3, "month"),
      txttodate: moment(),
      ddldocumenttype: 0,
    };
  };

  const [searchFormData, setSearchFormData] = useState(
    setSearchInitialFormData()
  );

  //Set search formdata

  //Search ddl controls changes
  const ddlChange = (e, name) => {
    setSearchFormData({
      ...searchFormData,
      [name]: e?.value,
    });
  };

  //Search Date control change
  const onDateChange = (newDate, name) => {
    setSearchFormData({
      ...searchFormData,
      [name]: newDate,
    });
  };

  //Input change
  const handleChange = (e) => {
    const { name, value } = e?.target;
    setSearchFormData({
      ...searchFormData,
      [name]: value,
    });
  };

  //Set search formdata

  // Search events

  const onSearch = (e) => {
    e.preventDefault();
    getDocuments({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData);
    getDocuments({ isShowall: true });
  };

  // Search events

  //Get documents list
  const getDocuments = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps,
    isSearch = false,
    isShowall = false,
  }) => {
    let errctl = "#search-val-err-message";
    $(errctl).html("");

    //Add date error to form errors.
    delete formErrors["date"];
    if (!isShowall) {
      let dateCheck = checkStartEndDateGreater(
        searchFormData.txtfromdate,
        searchFormData.txttodate
      );

      if (!checkEmptyVal(dateCheck)) {
        formErrors["date"] = dateCheck;
      }
    }

    //Validation check
    if (Object.keys(formErrors).length > 0) {
      $(errctl).html(formErrors[Object.keys(formErrors)[0]]);
    } else {
      //show loader if search actions.
      if (isSearch || isShowall) {
        apiReqResLoader("x");
      }
      setIsDataLoading(true);
      let isapimethoderr = false;
      let objParams = {};
      objParams = {
        keyword: "",
        accountid: accountid,
        profileid: profileid,
        folderid: folderid,
        documenttypeid: 0,
        fromdate: setSearchInitialFormData.txtfromdate,
        todate: setSearchInitialFormData.txttodate,
        pi: parseInt(pi),
        ps: parseInt(ps),
      };

      if (!isShowall) {
        objParams = {
          ...objParams,
          keyword: searchFormData.txtkeyword,
          fromdate: searchFormData.txtfromdate,
          todate: searchFormData.txttodate,
          documenttypeid: 0,
          isshared: 1,
          // parseInt(
          //   setSelectDefaultVal(searchFormData.ddldocumenttype)
          // ),
        };
      }

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getDocumentsList}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            //setDocumentsData(objResponse.Data.Folders);
            let result = [];
            let data = [];
            let rowid = -1;
            objResponse.Data.Folders.forEach((item, i) => {
              data.push(item);
              // Recursively flatten children
              if (item.IsFolder === 0) {
                rowid = rowid + 1;
                result.push({ ...item, rowid: rowid });
                data[i].rowid = rowid;
              }
            });
            setDocumentfilesData(result);
            setDocumentsData(data);
          } else {
            isapimethoderr = true;
            setDocumentsData([]);
            setDocumentfilesData([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setDocumentsData([]);
          setDocumentfilesData([]);
          setPageCount(0);
          console.error(
            `"API :: ${ApiUrls.getDocumentsList}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr === true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          if (isSearch || isShowall) {
            apiReqResLoader("x", "", API_ACTION_STATUS.COMPLETED);
          }
          setIsDataLoading(false);
        });
    }
  };

  //Setup Grid.
  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "",
        className: "w-450px",
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <>
              {row.original.IsFolder === 1 ? (
                <div
                  style={{ paddingLeft: `${row.depth * 30}px` }}
                  className="gr-link"
                  onDoubleClick={(e) => {
                    //row.toggleRowExpanded(!row.isExpanded);
                    onGridDoubleClick(row);
                  }}
                >
                  <span className="gr-txt-14-b">
                    <i
                      className={`${
                        !row.isExpanded ? "fa fa-folder" : "far fa-folder-open"
                      } gr-icon`}
                    ></i>
                    {row.original.Name}
                  </span>
                </div>
              ) : (
                <div
                  style={{ paddingLeft: `${row.depth * 30}px` }}
                  className="gr-link"
                  onClick={(e) => onGridDoubleClick(row)}
                >
                  <span className="gr-txt-14-b">
                    <i className={`far fa-file-lines gr-icon`}></i>
                    {row.original.Name}
                  </span>
                </div>
              )}
            </>
          );
        },
      },
      {
        Header: "File Size",
        accessor: "Size",
        className: "w-180px",
      },
      {
        Header: "Last Modified On",
        accessor: "ModifiedDateDisplay",
        className: "w-250px",
      },
      {
        Header: "Actions",
        className: "w-180px",
        isDocActionMenu: true,
        actions: [
          {
            text: "View",
            onclick: (e, row) => onView(e, row),
          },
        ],
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    ({ pageIndex, pageSize }) => {
      const fetchId = ++fetchIdRef.current;
      if (fetchId === fetchIdRef.current) {
        getDocuments({ pi: pageIndex, ps: pageSize });
      }
    },
    [reloadKey]
  );

  //Setup Grid.

  //Grid actions

  const onView = (e, row, isexpand = false) => {
    e.preventDefault();
    if (row.original.IsFolder === 0 || checkEmptyVal(row.original.IsFolder)) {
      addSessionStorageItem(
        SessionStorageKeys.ViewEditDocumentId,
        row.original.Id
      );
      navigate(routeNames.viewdocument.path);
    } else {
      addSessionStorageItem(
        SessionStorageKeys.ViewSharedDocfolderId,
        row.original.Id
      );
      setReloadKey((p) => p + 1);
    }
  };

  const onGridDoubleClick = (row) => {
    if (row.original.IsFolder === 0 || checkEmptyVal(row.original.IsFolder)) {
      setSelectedGridRow(row);
      setCurrentIndex(row.original?.rowid);
      setViewerModalShow(true);
      setFileUrl(null);
    } else {
      addSessionStorageItem(
        SessionStorageKeys.ViewSharedDocfolderId,
        row.original.Id
      );
      setReloadKey((p) => p + 1);
    }
  };

  //Grid actions

  const onFolderHierarchyFolderClick = (e, folderid) => {
    e.preventDefault();
    e.stopPropagation();
    if (folderid > 0) {
      addSessionStorageItem(SessionStorageKeys.ViewSharedDocfolderId, folderid);
      setReloadKey((p) => p + 1);
    } else {
      deletesessionStorageItem(SessionStorageKeys.ViewSharedDocfolderId);
      navigate(routeNames.shareddocuments.path);
    }
  };

  const navigateToMyDocuments = (e) => {
    navigate(routeNames.mydocuments.path);
  };

  return (
    <div key={reloadKey}>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-8">
                  <FoldersBreadCrumb
                    folders={foldersHierarchyData}
                    // currentFolderId={folderid}
                    title="Shared Documents"
                    onFolderHierarchyFolderClick={onFolderHierarchyFolderClick}
                  ></FoldersBreadCrumb>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li onClick={navigateToMyDocuments}>My Documents</li>
                  <li className="active">Shared Documents</li>
                </ul>
              </div>
              <div className="tab-element">
                {/*============== Search Start ==============*/}
                <div className="woo-filter-bar full-row px-3 py-4 box-shadow grid-search rounded">
                  <div className="container-fluid v-center">
                    <div className="row">
                      <div className="col px-0">
                        <form noValidate>
                          <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                            <div className="col-lg-4 col-xl-3 col-md-4">
                              <InputControl
                                lblClass="mb-0"
                                lblText="Search Name"
                                name="txtkeyword"
                                ctlType={formCtrlTypes.searchkeyword}
                                value={searchFormData.txtkeyword}
                                onChange={handleChange}
                                formErrors={formErrors}
                              ></InputControl>
                            </div>
                            {/* <div className="col-lg-3 col-xl-2 col-md-4">
                    <AsyncSelect
                      placeHolder={
                        documentTypesList.length <= 0 &&
                        searchFormData.ddldocumenttype == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlDefaultSelect
                      }
                      noData={
                        documentTypesList.length <= 0 &&
                        searchFormData.ddldocumenttype == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlNoData
                      }
                      options={documentTypesList}
                      dataKey="DocumentTypeId"
                      dataVal="DocumentType"
                      onChange={(e) => ddlChange(e, "ddldocumenttype")}
                      value={searchFormData.ddldocumenttype}
                      name="ddldocumenttype"
                      lbl={formCtrlTypes.documenttype}
                      lblClass="mb-0"
                      lblText="Document type"
                      className="ddlborder"
                      isClearable={true}
                      isSearchCtl={true}
                      formErrors={formErrors}
                    ></AsyncSelect>
                  </div> */}
                            <div className="col-lg-3 col-xl-2 col-md-4">
                              <DateControl
                                lblClass="mb-0"
                                lblText="Start date"
                                name="txtfromdate"
                                required={false}
                                onChange={(dt) =>
                                  onDateChange(dt, "txtfromdate")
                                }
                                value={searchFormData.txtfromdate}
                                isTime={false}
                              ></DateControl>
                            </div>
                            <div className="col-lg-3 col-xl-2 col-md-4">
                              <DateControl
                                lblClass="mb-0"
                                lblText="End date"
                                name="txttodate"
                                required={false}
                                onChange={(dt) => onDateChange(dt, "txttodate")}
                                value={searchFormData.txttodate}
                                isTime={false}
                                objProps={{
                                  checkVal: searchFormData.txtfromdate,
                                }}
                              ></DateControl>
                            </div>
                            <div className="col-lg-6 col-xl-5 col-md-7 grid-search-action">
                              <label
                                className="mb-0 form-error w-100"
                                id="search-val-err-message"
                              ></label>
                              <button
                                className="btn btn-primary w- 100"
                                value="Search"
                                name="btnsearch"
                                type="button"
                                onClick={onSearch}
                              >
                                Search
                              </button>
                              <button
                                className="btn btn-primary w- 100"
                                value="Show all"
                                name="btnshowall"
                                type="button"
                                onClick={onShowAll}
                              >
                                Show All
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                {/*============== Search End ==============*/}

                {/*============== Grid Start ==============*/}
                <div className="row rounded">
                  <div className="col">
                    <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 box-shadow">
                      <Grid
                        columns={columns}
                        data={documentsData}
                        loading={isDataLoading}
                        fetchData={fetchData}
                        pageCount={pageCount}
                        totalInfo={{
                          text: "Total Documents",
                          count: totalCount,
                        }}
                        noData={AppMessages.NoDocuments}
                        getSubRows={(row) => {
                          return row.Documents || [];
                        }}
                        onRowDoubleClick={onGridDoubleClick}
                        rowHover={true}
                        trClass="cur-pointer"
                      />
                    </div>
                  </div>
                </div>
                {/*============== Grid End ==============*/}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*==============FileViewer Modal Start ==============*/}
      {viewerModalShow && (
        <div id="modal" className="modal-fullview">
          <div className="header">
            <span className="text-white font-16 font-500">
              {documentDetails?.Name}.{documentDetails?.Extension}
            </span>
            <div>
              <button
                onClick={closeFullScreen}
                className="btn text-white btn-mini pr-10 flex flex-center"
              >
                <i className="fa fa-times-circle font-22" />
              </button>
            </div>
          </div>
          <div className="content">
            <button
              className="nav-btn left"
              onClick={handlePrevious}
              disabled={currentIndex === null || currentIndex === 0}
            >
              <i className="fa fa-chevron-left font-16" />
            </button>
            <div className="viewer">
              {fileUrl ? (
                documentDetails.Extension === "pdf" ? (
                  <PdfViewer
                    file={fileUrl}
                    cssclass="bg-white w-800px"
                    showThumbnail={false}
                  ></PdfViewer>
                ) : (
                  <img
                    src={fileUrl}
                    className="bg-light border rounded max-h-600"
                  ></img>
                )
              ) : (
                <div className={`flex flex-center py-50`}>
                  <div className="data-loader"></div>
                </div>
              )}
            </div>
            <button
              className="nav-btn right"
              onClick={handleNext}
              disabled={
                currentIndex === null ||
                currentIndex == documentfilesData.length - 1
              }
            >
              <i className="fa fa-chevron-right font-16" />
            </button>
          </div>
        </div>
      )}
      {/*==============FileViewer Modal End ==============*/}
    </div>
  );
};

export default SharedFolders;
