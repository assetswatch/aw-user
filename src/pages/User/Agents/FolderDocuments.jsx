import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  DataLoader,
  FilesUploadProgressView,
  Grid,
  ModalView,
} from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  formatBytes,
  GetUserCookieValues,
  replacePlaceHolders,
  SetPageLoaderNavLinks,
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
  UploadProgressState,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
// import { useGetDocumentTypesGateway } from "../../../hooks/useGetDocumentTypesGateway";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { Toast } from "../../../components/common/ToastView";
import { routeNames } from "../../../routes/routes";
import {
  addSessionStorageItem,
  getsessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import { useNavigate } from "react-router-dom";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { useProfileTypesGateway } from "../../../hooks/useProfileTypesGateway";
import PdfViewer from "../../../components/common/PdfViewer";
import { useDropzone } from "react-dropzone";

const FolderDocuments = memo(() => {
  let $ = window.$;

  let formErrors = {};
  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  let folderid = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewEditDocfolderId, 0)
  );

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  // const { documentTypesList } = useGetDocumentTypesGateway("");

  //Grid
  const [documentsData, setDocumentsData] = useState([]);
  const [folderDetails, setFolderDetails] = useState({});
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
    if (folderid > 0) {
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
            // parseInt(
            //   setSelectDefaultVal(searchFormData.ddldocumenttype)
            // ),
          };
        }

        return axiosPost(
          `${config.apiBaseUrl}${ApiUrls.getFolderDocuments}`,
          objParams
        )
          .then((response) => {
            let objResponse = response.data;
            if (objResponse.StatusCode === 200) {
              setTotalCount(objResponse.Data.TotalCount);
              setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
              setFolderDetails(objResponse.Data.FolderDetails);
              setDocumentsData(objResponse.Data.Documents);
            } else {
              isapimethoderr = true;
              setFolderDetails({});
              setDocumentsData([]);
              setPageCount(0);
            }
          })
          .catch((err) => {
            isapimethoderr = true;
            setFolderDetails({});
            setDocumentsData([]);
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
    } else {
      navigateToDocuments();
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

  const onView = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(
      SessionStorageKeys.ViewEditDocumentId,
      row.original.Id
    );
    navigate(routeNames.agentviewdocument.path);
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

  // const handleNameClick = (e, row) => {
  //   if (row.original.IsFolder === 0 || checkEmptyVal(row.original.IsFolder)) {
  //     setSelectedGridRow(row);
  //     setCurrentIndex(row.index);
  //     setViewerModalShow(true);
  //     setFileUrl(null);
  //   }
  // };

  const onGridDoubleClick = (row) => {
    if (row.original.IsFolder === 0 || checkEmptyVal(row.original.IsFolder)) {
      setSelectedGridRow(row);
      setCurrentIndex(row.index);
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
      currentIndex > 0 ? currentIndex - 1 : documentsData.length - 1;
    setCurrentIndex(newIndex);
  };

  // Navigate to next file
  const handleNext = () => {
    setFileUrl(null);
    const newIndex =
      currentIndex < documentsData.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    if (currentIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    if (currentIndex != null) {
      getDocumentDetails(documentsData[currentIndex].Id);
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
      lblfolder: `Folder: ${row.original.Title}`,
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

  //Files upload
  let formAddFileErrors = {};
  const [addFileErrors, setAddFileErrors] = useState({});
  const [fileUploadModalShow, setFileUploadModalShow] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({});
  const [uploadState, setUploadState] = useState(
    UploadProgressState.NotStarted
  );

  const onFileUpload = (e) => {
    e.preventDefault();
    setFileUploadModalShow(true);
  };

  const onFileUploadModalClose = () => {
    setFileUploadModalShow(false);
    setFiles([]);
    setAddFileErrors({});
    formAddFileErrors = {};
    apiReqResLoader("btnupload", "Upload", API_ACTION_STATUS.COMPLETED, false);
  };

  const onDrop = (acceptedFiles) => {
    // setFiles((prevFiles) => [...acceptedFiles, ...prevFiles]);
    const selectedFiles = acceptedFiles.map((file) => ({
      file,
      status: UploadProgressState.NotStarted,
    }));
    setFiles((prevFiles) => [...selectedFiles, ...prevFiles]);
  };

  const onDropRejected = (rejectedFiles) => {
    Toast.error("Some files were rejected. Please upload valid files.");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: true,
  });

  const removeUploadedFile = (id) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== id));
  };

  const onUploadFiles = async () => {
    let notstartedfiles = files.filter(
      (obj) => obj.status == UploadProgressState.NotStarted
    );

    if (notstartedfiles.length === 0) {
      formAddFileErrors["filesupload"] = ValidationMessages.UploadFileReq;
    }

    if (Object.keys(formAddFileErrors).length === 0) {
      setAddFileErrors({});
      setUploadState(UploadProgressState.Started);
      apiReqResLoader("btnupload", "Uploading", API_ACTION_STATUS.START, false);

      let isapimethoderr = false;
      const uploadPromises = notstartedfiles.map((file, i) => {
        setFiles((prevFiles) =>
          prevFiles.map((f, idx) =>
            i === idx ? { ...f, status: UploadProgressState.Started } : f
          )
        );
        let objBodyParams = new FormData();
        objBodyParams.append("ProfileId", profileid);
        objBodyParams.append("AccountId", accountid);
        objBodyParams.append("FolderId", folderid);
        objBodyParams.append("FolderName", "");
        objBodyParams.append("DocumentTypeId", 0);
        objBodyParams.append("StorageTypeId", 1);
        objBodyParams.append("StorageDocumentId", "");
        if (file) objBodyParams.append("File", file.file);
        return axiosPost(
          `${config.apiBaseUrl}${ApiUrls.addDocument}?r=$`,
          objBodyParams,
          {
            "Content-Type": "multipart/form-data",
          }
        )
          .then((response) => {
            let objResponse = response.data;
            if (objResponse.StatusCode === 200) {
              if (objResponse.Data.Status === 1) {
                //Toast.success(objResponse.Data.Message);
              } else {
                //Toast.error(objResponse.Data.Message);
              }
            } else {
              isapimethoderr = true;
            }
          })
          .catch((err) => {
            isapimethoderr = true;
            console.error(`"API :: ${ApiUrls.addDocument}, Error ::" ${err}`);
          })
          .finally(() => {
            if (isapimethoderr == true) {
              //Toast.error(AppMessages.SomeProblem);
            }
            setFiles((prevFiles) =>
              prevFiles.map((f, idx) =>
                i === idx ? { ...f, status: UploadProgressState.Completed } : f
              )
            );
          });
      });

      try {
        Promise.all(uploadPromises).then(() => {
          apiReqResLoader(
            "btnupload",
            "Upload",
            API_ACTION_STATUS.COMPLETED,
            false
          );
          Toast.success(AppMessages.UploadDocumentSuccess);
          setUploadStatus(
            files.reduce((acc, file) => {
              acc[file.name] = "Uploaded";
              return acc;
            }, {})
          );
          setUploadState(UploadProgressState.Completed);
          getDocuments({});
        });
      } catch (error) {
        setUploadStatus(
          files.reduce((acc, file) => {
            acc[file.name] = "Failed";
            return acc;
          }, {})
        );
      }
    } else {
      setAddFileErrors(formAddFileErrors);
    }
  };

  //Files Upload

  const navigateToDocuments = () => {
    navigate(routeNames.agentdocuments.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-6">
                  <h5 className="mb-4 down-line">
                    {folderDetails ? folderDetails.Name : "My Documents"}
                  </h5>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10">
                  <button
                    className="btn btn-primary btn-mini btn-glow shadow rounded"
                    type="button"
                    onClick={navigateToDocuments}
                  >
                    <i className="icons icon-arrow-left-circle position-relative me-2 t-2"></i>
                    Back
                  </button>
                </div>
              </div>
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
                            <button
                              className="btn btn-primary btn-mini btn-glow shadow rounded"
                              type="button"
                              onClick={onFileUpload}
                            >
                              <i className="fa fa-cloud-upload font-18 position-relative me-2 t-1 pl-5"></i>{" "}
                              Upload Files
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
                    />
                  </div>
                </div>
              </div>
              {/*============== Grid End ==============*/}
            </div>
          </div>
        </div>
      </div>

      {/*============== File Upload Modal Start ==============*/}
      {fileUploadModalShow && (
        <>
          <FilesUploadProgressView
            content={
              <>
                <div
                  className="row"
                  {...getRootProps()}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="col-12 mb-0 flex flex-center">
                    <input
                      type="file"
                      name="filesupload"
                      id="filesupload"
                      className="d-none"
                      multiple
                      //onChange={handleFileChange}
                      {...getInputProps()}
                    />
                    <label
                      className="fileupload_label border-dash border-1x border-light rounded font-16 p-10 w-350px"
                      htmlFor="filesupload"
                    >
                      <i
                        className="fa fa-cloud-upload mb-10 upload-icon d-flex flex-center"
                        aria-hidden="true"
                      ></i>
                      <p className="p-0 m-0">Drag & drop files here</p>
                      <p className="font-general text-light">
                        or click to select files
                      </p>
                    </label>
                  </div>
                  {Object.keys(addFileErrors).length > 0 && (
                    <div className="err-invalid flex flex-center">
                      Please select files to upload.
                    </div>
                  )}
                  {files && files.length > 0 ? (
                    <hr className="w-100 text-primary my-20" />
                  ) : (
                    isDragActive && <div className="row min-h-150"></div>
                  )}
                  <ul
                    className="cscrollbar"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    {Array.from(files).map((file, idx) => (
                      <li className="row" key={`${idx}`} name={`f-${idx}`}>
                        <div className="col px-20">
                          <div className="name">{file.file.name}</div>
                          <div className="name">
                            {formatBytes(file.file.size)}
                          </div>
                        </div>
                        <div className="col-auto pt-10">
                          {file.status == UploadProgressState.NotStarted && (
                            <i
                              className="icons icon-close font-16 pt-10 text-error cur-pointer"
                              onClick={() => removeUploadedFile(idx)}
                            ></i>
                          )}
                          {file.status == UploadProgressState.Started && (
                            <i className="icons icon-clock font-16 pt-10 text-primary"></i>
                          )}
                          {file.status == UploadProgressState.Completed && (
                            <i className="icons icon-check font-16 pt-10 text-primary"></i>
                          )}
                        </div>
                        {file.status == UploadProgressState.NotStarted && (
                          <hr className="w-100 text-light my-10 hrl" />
                        )}
                        {file.status == UploadProgressState.Started && (
                          <div className="processing">
                            <div className="continuous"></div>
                          </div>
                        )}
                        {file.status == UploadProgressState.Completed && (
                          <hr className="w-100 text-primary my-10 hrl" />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            }
            onClose={
              uploadState == UploadProgressState.Started
                ? ""
                : onFileUploadModalClose
            }
            actions={[
              {
                id: "btnupload",
                text: "Upload",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onUploadFiles(e),
              },
            ]}
          ></FilesUploadProgressView>
        </>
      )}
      {/*============== File Upload Modal End ==============*/}

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
        <div id="modal" className="modal-fullview show">
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
                currentIndex == documentsData.length - 1
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

export default FolderDocuments;
