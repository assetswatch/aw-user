import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  DataLoader,
  Grid,
  ModalView,
} from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  GetUserCookieValues,
  replacePlaceHolders,
  setSelectDefaultVal,
} from "../../../utils/common";
import DateControl from "../../../components/common/DateControl";
import moment from "moment";
import {
  ApiUrls,
  AppMessages,
  UserCookie,
  API_ACTION_STATUS,
  GridDefaultValues,
  SessionStorageKeys,
  ValidationMessages,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
// import { useGetDocumentTypesGateway } from "../../../hooks/useGetDocumentTypesGateway";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { Toast } from "../../../components/common/ToastView";
import { routeNames } from "../../../routes/routes";
import { addSessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { useNavigate } from "react-router-dom";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { useProfileTypesGateway } from "../../../hooks/useProfileTypesGateway";
import PdfViewer from "../../../components/common/PdfViewer";

const MyDocuments = memo(() => {
  let $ = window.$;

  let formErrors = {};
  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  // const { documentTypesList } = useGetDocumentTypesGateway("");

  //Grid
  const [documentsData, setDocumentsData] = useState([]);
  const [documentfilesData, setDocumentfilesData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedGridRow, setSelectedGridRow] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [viewerModalShow, setViewerModalShow] = useState(false);
  const [documentDetails, setDocumentDetails] = useState({});
  const [fileUrl, setFileUrl] = useState(null);

  //Modal
  const [modalDeleteConfirmShow, setModalDeleteConfirmShow] = useState(false);
  const [modalDeleteConfirmContent, setModalDeleteConfirmContent] = useState(
    AppMessages.DeleteDocumentMessage
  );
  const [editFolderModalShow, seteditFolderModalShow] = useState(false);
  function setInitialEditFolderFormData() {
    return {
      txtname: "",
    };
  }
  const [editFolderFormData, setEditFolderFormData] = useState(
    setInitialEditFolderFormData()
  );
  let formEditFolderErrors = {};
  const [editFolderErrors, setEditFolderErrors] = useState({});

  const [shareFolderModalShow, setshareFolderModalShow] = useState(false);
  function setInitialShareFolderFormData() {
    return {
      txtcomments: "",
      lblfolder: "",
      ddljoinedusers: "",
    };
  }
  const [shareFolderFormData, setShareFolderFormData] = useState(
    setInitialShareFolderFormData()
  );
  let formShareFolderErrors = {};
  const [shareFolderErrors, setShareFolderErrors] = useState({});
  let { profileTypesList } = useProfileTypesGateway();
  const [selectedProfileType, setSelectedProfileType] = useState(null);
  const [joinedUsersData, setJoinedUsersData] = useState([]);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);

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
    setSearchInitialFormData
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
              if (item.IsFolder === 1 && item.Documents) {
                item.Documents.forEach((d, di) => {
                  rowid = rowid + 1;
                  result.push({ ...d, rowid: rowid });
                  data[i].Documents[di].rowid = rowid;
                });
              } else {
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
                  onClick={(e) => {
                    row.toggleRowExpanded(!row.isExpanded);
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
          {
            text: "Edit",
            onclick: (e, row) => onEdit(e, row),
          },
          {
            text: "Share",
            onclick: (e, row) => onShare(e, row),
          },
          {
            text: "Delete",
            onclick: (e, row) => onDeleteConfirmModalShow(e, row),
          },
        ],
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
    if (fetchId === fetchIdRef.current) {
      getDocuments({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  //Grid actions

  const onView = (e, row, isexpand = false) => {
    e.preventDefault();
    if (row.original?.IsFolder == 1 && isexpand == false) {
      addSessionStorageItem(
        SessionStorageKeys.ViewEditDocfolderId,
        row.original.Id
      );
      navigate(routeNames.agentfolderdocuments.path);
    } else if (row.original?.IsFolder == 1 && isexpand) {
    } else {
      addSessionStorageItem(
        SessionStorageKeys.ViewEditDocumentId,
        row.original.Id
      );
      navigate(routeNames.agentviewdocument.path);
    }
  };

  const onEdit = (e, row) => {
    e.preventDefault();
    if (row.original.IsFolder == 1) {
      onEditModalShow(e, row);
    } else {
      addSessionStorageItem(
        SessionStorageKeys.ViewEditDocumentId,
        row.original.Id
      );
      navigate(routeNames.agenteditdocument.path);
    }
  };

  const onUpdateFolder = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (Object.keys(formEditFolderErrors).length === 0) {
      setEditFolderErrors({});
      apiReqResLoader("btnupdatefolder", "Updating", API_ACTION_STATUS.START);

      let isapimethoderr = false;

      let objBodyParams = {
        ParentFolderId: 0,
        FolderId: parseInt(selectedGridRow?.original?.Id),
        AccountId: accountid,
        ProfileId: profileid,
        Name: editFolderFormData.txtname,
        StorageTypeId: 1,
        StorageFolderId: selectedGridRow?.original?.StorageFileId,
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.addDocumentFolder}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status === 1) {
              getDocuments({});
              Toast.success(objResponse.Data.Message);
              onEditModalClose();
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.addDocumentFolder}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnupdatefolder",
            "Update",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      $(`[name=${Object.keys(formEditFolderErrors)[0]}]`).focus();
      setEditFolderErrors(formEditFolderErrors);
    }
  };

  const onShare = (e, row) => {
    e.preventDefault();
    if (row.original.IsFolder == 1) {
      onShareModalShow(e, row);
    } else {
      addSessionStorageItem(
        SessionStorageKeys.ViewEditDocumentId,
        row.original.Id
      );
      navigate(routeNames.agentsharedocument.path);
    }
  };

  const onShareFolder = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedJoinedUser)) {
      formShareFolderErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

    if (checkEmptyVal(selectedProfileType)) {
      formShareFolderErrors["ddlprofiletype"] =
        ValidationMessages.ProfiletypeReq;
    }

    if (Object.keys(formShareFolderErrors).length === 0) {
      setShareFolderErrors({});
      apiReqResLoader("btnsharefolder", "Sharing", API_ACTION_STATUS.START);

      let isapimethoderr = false;
      let objBodyParams = {
        FolderId: parseInt(selectedGridRow?.original?.Id),
        DocumentId: 0,
        SenderId: profileid,
        ReceiverIds: selectedJoinedUser,
        Comments: shareFolderFormData.txtcomments,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.shareDocument}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status === 1) {
              Toast.success(objResponse.Data.Message);
              onShareFolderModalClose();
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.shareDocument}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnsharefolder",
            "Share",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      $(`[name=${Object.keys(formShareFolderErrors)[0]}]`).focus();
      setShareFolderErrors(formShareFolderErrors);
    }
  };

  const onDelete = (e) => {
    e.preventDefault();

    apiReqResLoader("btndelete", "Deleting", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = {
      ProfileId: parseInt(
        GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
      ),
      AccountId: parseInt(
        GetUserCookieValues(UserCookie.AccountId, loggedinUser)
      ),
      Id: parseInt(selectedGridRow?.original?.Id),
      IsFolder: parseInt(selectedGridRow?.original?.IsFolder),
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.deleteDocument}`, objBodyParams)
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
        console.error(`"API :: ${ApiUrls.deleteDocument}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("btndelete", "Yes", API_ACTION_STATUS.COMPLETED);
      });
  };

  const handleNameClick = (e, row) => {
    // e.preventDefault();
    // e.stopPropagation();
    // if (row.original.IsFolder === 0 || checkEmptyVal(row.original.IsFolder)) {
    //   setSelectedGridRow(row);
    //   setCurrentIndex(row.original?.rowid);
    //   setViewerModalShow(true);
    //   setFileUrl(null);
    // }
  };

  const onGridDoubleClick = (row) => {
    if (row.original.IsFolder === 0 || checkEmptyVal(row.original.IsFolder)) {
      setSelectedGridRow(row);
      setCurrentIndex(row.original?.rowid);
      setViewerModalShow(true);
      setFileUrl(null);
    }
  };

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

  //Grid actions

  //Edit Folder Modal actions

  const onEditModalClose = () => {
    seteditFolderModalShow(false);
    setSelectedGridRow(null);
    setEditFolderFormData(setInitialEditFolderFormData());
    setEditFolderErrors({});
    formEditFolderErrors = {};
    apiReqResLoader(
      "btnupdatefolder",
      "Update",
      API_ACTION_STATUS.COMPLETED,
      false
    );
  };

  const onEditModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setEditFolderFormData({ txtname: row.original.Name });
    setEditFolderErrors({});
    formEditFolderErrors = {};
    seteditFolderModalShow(true);
  };

  const handleEditFolderInputChange = (e) => {
    const { name, value } = e?.target;
    setEditFolderFormData({
      ...editFolderFormData,
      [name]: value,
    });
  };

  //Edit Folder Modal actions

  //Share Folder Modal actions

  const getJoinedUsers = (profileTypeId) => {
    let objParams = {
      keyword: "",
      inviterid: profileid,
      InviterProfileTypeId: config.userProfileTypes.Agent,
      InviteeProfileTypeId: parseInt(profileTypeId),
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getDdlJoinedUserConnections}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          let data = objResponse.Data.map((item) => ({
            label: (
              <div className="flex items-center">
                <div className="w-40px h-40px mr-10 flex-shrink-0">
                  <img
                    alt=""
                    src={item.PicPath}
                    className="rounded cur-pointer w-40px"
                  />
                </div>
                <div>
                  <span className="text-primary lh-1 d-block">
                    {item.FirstName + " " + item.LastName}
                  </span>
                  <span className="small text-light">{item.ProfileType}</span>
                </div>
              </div>
            ),
            value: item.ProfileId,
            customlabel: item.FirstName + " " + item.LastName,
          }));
          setJoinedUsersData(data);
        } else {
          setJoinedUsersData([]);
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getDdlJoinedUserConnections}, Error ::" ${err}`
        );
        setJoinedUsersData([]);
      })
      .finally(() => {
        setSelectedJoinedUser(null);
      });
  };

  const onShareFolderModalClose = () => {
    setshareFolderModalShow(false);
    setSelectedGridRow(null);
    setSelectedProfileType(null);
    setSelectedJoinedUser(null);
    setShareFolderFormData(setInitialShareFolderFormData());
    setShareFolderErrors({});
    apiReqResLoader("btnshare", "Sharing", API_ACTION_STATUS.COMPLETED, false);
  };

  const onShareModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setShareFolderFormData({
      ...shareFolderFormData,
      lblfolder: `Folder: ${row.original.Name}`,
    });
    setshareFolderModalShow(true);
  };

  const handleShareFolderInputChange = (e) => {
    const { name, value } = e?.target;
    setShareFolderFormData({
      ...shareFolderFormData,
      [name]: value,
    });
  };

  const handleProfileTypeChange = (e) => {
    setSelectedProfileType(e?.value);
    setSelectedJoinedUser(null);
    setJoinedUsersData([]);

    if (e == null || e == undefined || e == "") {
      return;
    }

    getJoinedUsers(e?.value);
  };

  const handleJoindUserChange = (e) => {
    setSelectedJoinedUser(
      e.reduce((acc, curr, index) => {
        return index === 0 ? curr.value : acc + "," + curr.value;
      }, "")
    );
  };

  //Share Folder Modal actions

  //Delete confirmation Modal actions

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

  //Delete confirmation Modal actions

  return (
    <>
      <div className="woo-filter-bar full-row p-3 grid-search bo-0">
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
                      onChange={(dt) => onDateChange(dt, "txtfromdate")}
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

      {/*============== Grid Start ==============*/}
      <div className="row rounded">
        <div className="col">
          <div className="dashboard-panel bo-top bg-white rounded overflow-hidden w-100 box-shadow-top">
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
            />
          </div>
        </div>
      </div>
      {/*============== Grid End ==============*/}

      {/*============== Edi Folder Modal Start ==============*/}
      {editFolderModalShow && (
        <>
          <ModalView
            title={AppMessages.EditFolderModalTitle}
            content={
              <>
                <div className="row">
                  <div className="col-12 mb-15">
                    <InputControl
                      lblClass="mb-0 lbl-req-field"
                      name="txtname"
                      ctlType={formCtrlTypes.name}
                      required={true}
                      onChange={handleEditFolderInputChange}
                      value={editFolderFormData.txtname}
                      errors={editFolderErrors}
                      formErrors={formEditFolderErrors}
                      isFocus={true}
                    ></InputControl>
                  </div>
                </div>
              </>
            }
            onClose={onEditModalClose}
            actions={[
              {
                id: "btnupdatefolder",
                text: "Update",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onUpdateFolder(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onEditModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Edit Folder Modal End ==============*/}

      {/*============== Share Modal Start ==============*/}
      {shareFolderModalShow && (
        <>
          <ModalView
            title={AppMessages.ShareFolderModalTitle}
            content={
              <>
                <div className="row">
                  <div className="col-12 mb-10">
                    <span name="lblfolder" className="font-general font-500">
                      {shareFolderFormData.lblfolder}
                    </span>
                  </div>
                  <div className="col-12 mb-15">
                    <AsyncSelect
                      placeHolder={
                        profileTypesList.length <= 0 &&
                        selectedProfileType == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlDefaultSelect
                      }
                      noData={
                        profileTypesList.length <= 0 &&
                        selectedProfileType == null
                          ? AppMessages.DdLLoading
                          : AppMessages.NoProfileTypes
                      }
                      options={profileTypesList}
                      onChange={(e) => {
                        handleProfileTypeChange(e);
                      }}
                      dataKey="ProfileTypeId"
                      dataVal="ProfileType"
                      value={selectedProfileType}
                      name="ddlprofiletype"
                      lbl={formCtrlTypes.profiletype}
                      lblText="Profile type"
                      lblClass="mb-0 lbl-req-field"
                      required={true}
                      errors={shareFolderErrors}
                      formErrors={formShareFolderErrors}
                      tabIndex={1}
                      isSearchable={false}
                    ></AsyncSelect>
                  </div>
                  <div className="col-12 mb-15">
                    <AsyncSelect
                      placeHolder={
                        selectedJoinedUser == null ||
                        Object.keys(selectedJoinedUser).length === 0
                          ? AppMessages.DdlDefaultSelect
                          : joinedUsersData.length <= 0 &&
                            selectedProfileType == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlDefaultSelect
                      }
                      noData={
                        selectedJoinedUser == null ||
                        Object.keys(selectedJoinedUser).length === 0
                          ? AppMessages.NoUsers
                          : joinedUsersData.length <= 0 &&
                            selectedProfileType == null &&
                            selectedProfileType != null
                          ? AppMessages.DdLLoading
                          : AppMessages.NoUsers
                      }
                      options={joinedUsersData}
                      onChange={(e) => {
                        handleJoindUserChange(e);
                      }}
                      value={selectedJoinedUser}
                      name="ddljoinedusers"
                      lblText="Users"
                      lbl={formCtrlTypes.users}
                      lblClass="mb-0 lbl-req-field"
                      required={true}
                      errors={shareFolderErrors}
                      formErrors={formShareFolderErrors}
                      isMulti={true}
                      isRenderOptions={false}
                      tabIndex={2}
                    ></AsyncSelect>
                  </div>
                  <div className="col-12 mb-0">
                    <TextAreaControl
                      lblClass="mb-0"
                      name={`txtcomments`}
                      ctlType={formCtrlTypes.comments}
                      onChange={handleShareFolderInputChange}
                      value={shareFolderFormData.txtcomments}
                      required={false}
                      errors={shareFolderErrors}
                      formErrors={formShareFolderErrors}
                      rows={3}
                      tabIndex={3}
                    ></TextAreaControl>
                  </div>
                </div>
              </>
            }
            onClose={onShareFolderModalClose}
            actions={[
              {
                id: "btnsharefolder",
                text: "Share",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onShareFolder(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onShareFolderModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Share Modal End ==============*/}

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
    </>
  );
});

export default MyDocuments;
