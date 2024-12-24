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
  replacePlaceHolders,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import {
  addSessionStorageItem,
  deletesessionStorageItem,
  getsessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import { Grid, ModalView } from "../../../components/common/LazyComponents";
import moment from "moment";
import DateControl from "../../../components/common/DateControl";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import { Toast } from "../../../components/common/ToastView";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import AsyncSelect from "../../../components/common/AsyncSelect";
import PdfViewer from "../../../components/common/PdfViewer";
import { useDocSharedTypesGateway } from "../../../hooks/useDocSharedTypesGateway";

const MyDocuments = () => {
  let $ = window.$;
  const location = useLocation();
  const navigate = useNavigate();
  const { loggedinUser } = useAuth();

  let folderid = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewSharedDocfolderId, 0)
  );

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let { docSharedTypes } = useDocSharedTypesGateway(true);

  let formErrors = {};
  const [reloadKey, setReloadKey] = useState(new Date().toLocaleTimeString());
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [documentsData, setDocumentsData] = useState([]);
  const [documentfilesData, setDocumentfilesData] = useState([]);
  const [selectedGridRow, setSelectedGridRow] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [viewerModalShow, setViewerModalShow] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [documentDetails, setDocumentDetails] = useState({});
  const [modalDeleteConfirmShow, setModalDeleteConfirmShow] = useState(false);
  const [modalDeleteConfirmContent, setModalDeleteConfirmContent] = useState(
    AppMessages.DeleteDocumentMessage
  );

  useEffect(() => {
    folderid = parseInt(
      getsessionStorageItem(SessionStorageKeys.ViewSharedDocfolderId, 0)
    );
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

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: moment().subtract(3, "month"),
      txttodate: moment(),
      ddlsharedtype: docSharedTypes?.[0]?.["Id"],
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
        sharedtypeid: 0,
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
          sharedtypeid: parseInt(
            setSelectDefaultVal(searchFormData.ddlsharedtype)
          ),
        };
      }

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getSharedDocuments}`,
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
            `"API :: ${ApiUrls.getSharedDocuments}, Error ::" ${err}`
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
        className: "w-350px",
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
        Header: "Share Type",
        accessor: "SharedType",
        disableSortBy: true,
        className: "w-180px",
        Cell: ({ row }) => (
          <>
            {row.depth === 0 && (
              <span
                className={`badge badge-pill gr-badge-pill nocnt text-center w-80px ${
                  row.original.SharedTypeId == config.sharedTypes.Sent
                    ? "gr-badge-pill-suc"
                    : row.original.SharedTypeId == config.sharedTypes.Received
                    ? "gr-badge-pill-error"
                    : ""
                }`}
              >
                {row.original.SharedType}
              </span>
            )}
          </>
        ),
      },
      {
        Header: "File Size",
        accessor: "Size",
        className: "w-150px",
      },
      {
        Header: "Shared Users",
        accessor: "UsersCountDisplay",
        className: "w-200px text-center",
        Cell: ({ row }) => {
          return (
            row.original.SharedTypeId == config.sharedTypes.Sent && (
              <span>{row.original.UsersCountDisplay}</span>
            )
          );
        },
      },
      {
        Header: "Shared On",
        accessor: "ModifiedDateDisplay",
        className: "w-200px",
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
          {
            text: "View Users",
            onclick: (e, row) => onViewUsers(e, row),
          },
          {
            text: "Remove",
            icssclass: "pr-12",
            onclick: (e, row) => onDeleteConfirmModalShow(e, row),
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

  const onDeleteConfirmModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalDeleteConfirmContent(
      replacePlaceHolders(modalDeleteConfirmContent, {
        name: `${row?.original?.Name}`,
      })
    );
    setModalDeleteConfirmShow(true);
  };

  const onDeleteConfirmModalClose = () => {
    setModalDeleteConfirmShow(false);
    setSelectedGridRow(null);
    apiReqResLoader(
      "btndeletedocument",
      "Yes",
      API_ACTION_STATUS.COMPLETED,
      false
    );
    setModalDeleteConfirmContent(AppMessages.DeleteDocumentMessage);
  };

  const onDelete = (e) => {
    e.preventDefault();

    apiReqResLoader("btndelete", "Removing", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = {
      ProfileId: parseInt(
        GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
      ),
      SharedId: parseInt(selectedGridRow?.original?.SharedId),
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.unshareDocument}`, objBodyParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          Toast.success(objResponse.Data.Message);
          if (objResponse.Data.Status == 1) {
            getDocuments({});
            onDeleteConfirmModalClose();
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(`"API :: ${ApiUrls.unshareDocument}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("btndelete", "Yes", API_ACTION_STATUS.COMPLETED);
      });
  };

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
      addSessionStorageItem(
        SessionStorageKeys.ViewSharedDocRootfolderId,
        row.original.Id
      );
      navigate(routeNames.sharedfolders.path);
      //setReloadKey((p) => p + 1);
    }
  };

  const onViewUsers = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(
      SessionStorageKeys.ViewSharedDocUsersSharedId,
      row.original.SharedId
    );
    addSessionStorageItem(
      SessionStorageKeys.ViewSharedDocRootfolder,
      JSON.stringify({
        Id: row.original.Id,
        Name:
          row.original.Name +
          (checkEmptyVal(row.original.Extension)
            ? ""
            : "." + row.original.Extension),
      })
    );
    navigate(routeNames.sharedusers.path);
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
      addSessionStorageItem(
        SessionStorageKeys.ViewSharedDocRootfolderId,
        row.original.Id
      );
      navigate(routeNames.sharedfolders.path);
      //setReloadKey((p) => p + 1);
    }
  };

  //Grid actions

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
                  <div className="breadcrumb">
                    <h6 className="mb-3 down-line pb-10">Shared Documents</h6>
                  </div>
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
                            <div className="col-lg-3 col-xl-3 col-md-4">
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
                            <div className="col-lg-3 col-xl-2 col-md-4">
                              <AsyncSelect
                                placeHolder={
                                  docSharedTypes.length <= 0 &&
                                  searchFormData.ddlsharedtype == null
                                    ? AppMessages.DdLLoading
                                    : AppMessages.DdlDefaultSelect
                                }
                                noData={
                                  docSharedTypes.length <= 0 &&
                                  searchFormData.ddlsharedtype == null
                                    ? AppMessages.DdLLoading
                                    : AppMessages.DdlNoData
                                }
                                options={docSharedTypes}
                                dataKey="Id"
                                dataVal="Type"
                                onChange={(e) => ddlChange(e, "ddlsharedtype")}
                                value={searchFormData.ddlsharedtype}
                                name="ddlsharedtype"
                                lbl={formCtrlTypes.sharedtype}
                                lblClass="mb-0"
                                lblText="Share type"
                                className="ddlborder"
                                isClearable={false}
                                isSearchCtl={true}
                                formErrors={formErrors}
                              ></AsyncSelect>
                            </div>
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
                            <div className="col-lg-4 col-xl-3 col-md-6 grid-search-action">
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

      {/*============== Delete Confirmation Modal Start ==============*/}
      {modalDeleteConfirmShow && (
        <>
          <ModalView
            title={AppMessages.DeleteConfirmationTitle}
            content={modalDeleteConfirmContent}
            onClose={onDeleteConfirmModalClose}
            actions={[
              {
                id: "btndelete",
                text: "Yes",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onDelete(e),
              },
              {
                text: "No",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onDeleteConfirmModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Delete Confirmation Modal End ==============*/}

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

export default MyDocuments;
