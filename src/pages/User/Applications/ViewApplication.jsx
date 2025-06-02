import React, { useState, useEffect, useRef } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  convertImageToBase64,
  getCityStateCountryZipFormat,
  GetUserCookieValues,
  replacePlaceHolders,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  ApiUrls,
  UserCookie,
  SessionStorageKeys,
  AppMessages,
  API_ACTION_STATUS,
  ValidationMessages,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { Toast } from "../../../components/common/ToastView";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import PdfViewer from "../../../components/common/PdfViewer";
import DataLoader from "../../../components/common/DataLoader";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { formCtrlTypes } from "../../../utils/formvalidation";
import InputControl from "../../../components/common/InputControl";
import {
  Grid,
  LazyImage,
  ModalView,
} from "../../../components/common/LazyComponents";
import { useGetBgvPackagesGateway } from "../../../hooks/useGetBgvPackagesGateway";

const ViewApplication = () => {
  let $ = window.$;
  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let applicationId = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewApplicationId, 0)
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

  const [isDataLoading, setIsDataLoading] = useState(true);
  const { bgvPackagesList } = useGetBgvPackagesGateway("", 1);
  const [applicationDetails, setApplicationDetails] = useState({});
  const [selectedGridRow, setSelectedGridRow] = useState(null);
  function setInitialSendApplicationFormData() {
    return {
      txtmessage: "",
      ddljoinedusers: "",
    };
  }

  const [sendApplicationFormData, setSendApplicationFormData] = useState(
    setInitialSendApplicationFormData()
  );

  let formSendApplicationErrors = {};
  const [sendApplicationErrors, setSendApplicationErrors] = useState({});
  const [selectedProfileType, setSelectedProfileType] = useState(
    parseInt(config.userProfileTypes.Tenant)
  );
  const [joinedUsersData, setJoinedUsersData] = useState([]);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);

  const [
    modalUnsendApplicationConfirmShow,
    setModalUnsendApplicationConfirmShow,
  ] = useState(false);
  const [modalUnsendConfirmContent, setModalUnsendConfirmContent] = useState(
    AppMessages.UnsendApplicationToUserMessage
  );

  useEffect(() => {
    getApplicationDetails();
    getJoinedUsers();
  }, []);

  const getJoinedUsers = async () => {
    let objParams = {
      keyword: "",
      inviterid: profileid,
      InviterProfileTypeId: loggedinprofiletypeid,
      InviteeProfileTypeId: parseInt(config.userProfileTypes.Tenant),
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

  const getApplicationDetails = async () => {
    if (applicationId > 0) {
      let isapimethoderr = false;
      let objParams = {
        ApplicationId: applicationId,
      };
      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getApplicationDetails}`,
        objParams
      )
        .then(async (response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setApplicationDetails(objResponse.Data);
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.getApplicationDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          setIsDataLoading(false);
        });
    } else {
      navigateToApplications();
    }
  };

  //PdfViewer

  const handleSendApplicationInputChange = (e) => {
    const { name, value } = e?.target;
    setSendApplicationFormData({
      ...sendApplicationFormData,
      [name]: value,
    });
  };

  const handleJoinedUserChange = (e) => {
    setSelectedJoinedUser(
      e.reduce((acc, curr, index) => {
        return index === 0 ? curr.value : acc + "," + curr.value;
      }, "")
    );
  };

  const onSendApplication = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedJoinedUser)) {
      formSendApplicationErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

    if (Object.keys(formSendApplicationErrors).length === 0) {
      setSendApplicationErrors({});
      apiReqResLoader("btnsend", "Sending", API_ACTION_STATUS.START);

      let isapimethoderr = false;
      let objBodyParams = new FormData();

      let selectedUsers = selectedJoinedUser
        .toString()
        .split(",")
        .map((u) => u.trim());
      for (let i = 0; i <= selectedUsers.length - 1; i++) {
        let idx = i;
        objBodyParams.append(
          `Profiles[${i}].ProfileId`,
          parseInt(selectedUsers[idx])
        );
      }
      objBodyParams.append("ApplicationId", parseInt(applicationId));
      objBodyParams.append("Message", sendApplicationFormData.txtmessage);

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.sendApplication}`,
        objBodyParams,
        {
          "Content-Type": "multipart/form-data",
        }
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status === 1) {
              Toast.success(objResponse.Data.Message);
              setSelectedJoinedUser(null);
              setSendApplicationFormData(setInitialSendApplicationFormData());
              getApplicationDetails();
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.sendApplication}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnsend", "Send", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formSendApplicationErrors)[0]}]`).focus();
      setSendApplicationErrors(formSendApplicationErrors);
    }
  };

  //Setup Grid.
  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "",
        className: "w-400px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <div className="row px-5">
            <div className="col-auto px-0">
              <LazyImage
                className="rounded cur-pointer w-50px mx-1"
                src={row.original.PicPath}
                alt={
                  checkEmptyVal(row.original.CompanyName)
                    ? row.original.FirstName + " " + row.original.LastName
                    : row.original.CompanyName
                }
                placeHolderClass="pos-absolute w-50px min-h-50 fl-l"
              ></LazyImage>
            </div>
            <div className="col property-info flex v-center pb-0 min-h-50 px-5">
              <h5 className="text-secondary">
                {checkEmptyVal(row.original.CompanyName)
                  ? row.original.FirstName + " " + row.original.LastName
                  : row.original.CompanyName}
                <div className="mt-0 py-0 small text-light">
                  {row.original?.ProfileType}
                </div>
              </h5>
            </div>
          </div>
        ),
      },
      {
        Header: "Application#",
        accessor: "ApplicationNumber",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Contact Information",
        accessor: "",
        className: "w-400px",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <div className="property-info d-table">
              <div>
                <i className="icon icon-envelope text-secondary font-general position-relative me-1 t-1"></i>{" "}
                {row.original.Email}
              </div>
              <div>
                <i className="icon icon-screen-smartphone text-secondary font-general position-relative me-1 t-1"></i>{" "}
                {row.original.MobileNo}
              </div>
            </div>
          </>
        ),
      },
      // {
      //   Header: "Email Id",
      //   accessor: "Email",
      //   disableSortBy: true,
      //   className: "w-300px",
      // },
      // {
      //   Header: "Phone",
      //   accessor: "MobileNo",
      //   disableSortBy: true,
      //   className: "w-200px",
      // },
      {
        Header: "Sent On",
        accessor: "SentDateDisplay",
        className: "w-250px",
      },
      {
        Header: "Actions",
        showActionMenu: false,
        className: `w-50px gr-action`,
        Cell: ({ row }) => (
          <a
            className="pr-10"
            onClick={(e) => onUnsendApplicationModalShow(e, row)}
          >
            <i className="fas fa-trash pe-2 text-error font-general" />
          </a>
        ),
      },
    ],
    []
  );

  const onUnsend = (e) => {
    e.preventDefault();

    apiReqResLoader("btndelete", "Deleting", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = {
      ApplicationId: parseInt(selectedGridRow?.original?.ApplicationId),
      ProfileId: parseInt(selectedGridRow?.original?.ProfileId),
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.unSendApplication}`, objBodyParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          Toast.success(objResponse.Data.Message);
          if (objResponse.Data.Status == 1) {
            getApplicationDetails({});
            onUnsendApplicationModalClose();
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(`"API :: ${ApiUrls.unSendApplication}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("btndelete", "Yes", API_ACTION_STATUS.COMPLETED);
      });
  };

  //Grid actions

  const onUnsendApplicationModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalUnsendConfirmContent(
      replacePlaceHolders(modalUnsendConfirmContent, {
        name: `${row?.original?.FirstName} ${row?.original?.LastName}`,
      })
    );
    setModalUnsendApplicationConfirmShow(true);
  };

  const onUnsendApplicationModalClose = () => {
    setModalUnsendApplicationConfirmShow(false);
    setSelectedGridRow(null);
    setModalUnsendConfirmContent(AppMessages.UnsendApplicationToUserMessage);
  };

  //Grid actions

  const navigateToApplications = () => {
    navigate(routeNames.applications.path);
  };

  const onCancel = (e) => {
    e.preventDefault();
    navigateToApplications();
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-md-12 col-lg-10 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <div className="row">
                <div className="col-8 d-flex flex-ai-t flex-jc-l text-start mb-2">
                  <h6 className="mb-2 down-line pb-10">
                    Application#: {applicationDetails?.MasterApplicationNumber}
                  </h6>
                </div>
                <div className="col-4 d-flex flex-ai-t flex-jc-r text-end pt-15">
                  <button
                    type="button"
                    className="btn btn-glow px-0 rounded-circle text-primary lh-1 d-flex flex-center"
                    onClick={onCancel}
                  >
                    <i className="icons font-18 icon-arrow-left-circle text-primary me-1"></i>
                    <span className="font-general">Back</span>
                  </button>
                </div>
              </div>
              <div className="row">
                <div className={`${"col-md-6 col-lg-4 col-xl-4 mb-15"}`}>
                  <span className="font-500 font-general">
                    Application Type : {applicationDetails?.ApplicationType}
                  </span>
                </div>
                <div
                  className={`${"col-md-6 col-lg-4 col-xl-4 mb-15 text-md-end"}`}
                >
                  <span className="font-500 font-general">
                    Created On : {applicationDetails?.CreatedDateDisplay}
                  </span>
                </div>
                {applicationDetails?.Status > 0 && (
                  <div className="col-md-12 col-lg-4 col-xl-4 mb-15 text-md-end">
                    <span
                      className={`${
                        applicationDetails?.Status == 3
                          ? "text-success"
                          : "text-danger"
                      } font-500 font-general`}
                    >
                      Status : {applicationDetails?.StatusDisplay}
                    </span>
                  </div>
                )}
              </div>

              <div className="row mt-20">
                <div className={`col-md-6 mb-30`}>
                  <h6 className="mb-3 down-line pb-10 px-0">
                    Property Information
                  </h6>
                  <table className="w-100 items-list bg-transparent tbl-grid">
                    <tbody role="rowgroup">
                      <tr role="row" className="bo-b-0">
                        <td className="w-100 px-0 py-0">
                          <div className="gap-10">
                            <LazyImage
                              className="rounded box-shadow cur-pointer w-120px"
                              onClick={() => {}}
                              src={applicationDetails?.AssetImagePath}
                              alt={""}
                              placeHolderClass="pos-absolute w-50px min-h-100 fl-l"
                            ></LazyImage>
                            <div className="property-info d-table text-left">
                              <a href="#" onClick={() => {}}>
                                <span className="text-primary mb-1 font-500">
                                  {applicationDetails?.AssetAddressOne}
                                </span>
                              </a>
                              {!checkEmptyVal(
                                applicationDetails?.AssetAddressTwo
                              ) && (
                                <div className="py-0">
                                  {applicationDetails?.AssetAddressTwo}
                                </div>
                              )}
                              <div className="py-0">
                                {getCityStateCountryZipFormat(
                                  applicationDetails,
                                  true,
                                  [
                                    "AssetCity",
                                    "AssetStateShortName",
                                    "AssetState",
                                    "AssetCountryShortName",
                                    "AssetCountry",
                                    "AssetZip",
                                  ]
                                )}
                              </div>
                              <div className="price">
                                <span className="text-primary">
                                  {applicationDetails?.AssetPriceDisplay}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className={`col-md-6 mb-30`}>
                  <h6 className="mb-3 down-line pb-10 px-0">
                    BGV Package Information
                  </h6>

                  {bgvPackagesList?.length > 0 &&
                    bgvPackagesList.map((p, i) => {
                      return (
                        <div key={`p-${i}`}>
                          <span className="font-general font-500">
                            Package: {p.PackageName}
                          </span>
                          <ul className="disc-list mt-1 ml-30">
                            {bgvPackagesList[0]?.ReportTypes.map(
                              (report, index) => (
                                <li key={index} className="pb-2">
                                  <span className="font-general font-500">
                                    1 {report.ReportType}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                          <div className="mt-1 font-general font-500">
                            Package Cost: {p.PackageCostDisplay}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {applicationDetails?.ProfileId == profileid && (
                <form noValidate>
                  <div className="container-fluid mt-10 pb-30">
                    <div className="row">
                      <hr className="w-100 text-primary mb-20 px-0 mx-0"></hr>
                      <h6 className="mb-3 down-line pb-10 px-0">
                        Send Application
                      </h6>
                      <div className="col px-0">
                        <div className="row">
                          <div className="col-md-6 mb-15">
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
                                handleJoinedUserChange(e);
                              }}
                              value={selectedJoinedUser}
                              name="ddljoinedusers"
                              lblText="Users"
                              lbl={formCtrlTypes.users}
                              lblClass="mb-0 lbl-req-field"
                              required={true}
                              errors={sendApplicationErrors}
                              formErrors={formSendApplicationErrors}
                              isMulti={true}
                              isRenderOptions={false}
                              tabIndex={1}
                            ></AsyncSelect>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0"
                              name={`txtmessage`}
                              ctlType={formCtrlTypes.message}
                              onChange={handleSendApplicationInputChange}
                              value={sendApplicationFormData.txtmessage}
                              required={false}
                              errors={sendApplicationErrors}
                              formErrors={formSendApplicationErrors}
                              tabIndex={2}
                            ></InputControl>
                          </div>
                        </div>
                        <div className="row form-action d-flex flex-end mt-20">
                          <div
                            className="col-md-6 form-error"
                            id="form-error"
                          ></div>
                          <div className="col-md-6">
                            <button
                              className="btn btn-secondary"
                              id="btncancel"
                              onClick={onCancel}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary"
                              id="btnsend"
                              onClick={onSendApplication}
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/*============== Sent Application users grid ==============*/}
              {applicationDetails?.SentProfiles?.length > 0 && (
                <>
                  <div className="container-fluid">
                    <div className="row">
                      <hr className="w-100 text-primary mb-20 px-0 mx-0"></hr>
                      <h6 className="mb-3 down-line pb-10 px-0 mx-0">
                        Sent Application: Users List
                      </h6>
                      <div className="col px-0 mx-0">
                        <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 box-shadow">
                          <Grid
                            columns={columns.filter((c) => {
                              return applicationDetails?.ProfileId == profileid
                                ? 1 == 1
                                : c.Header !== "Actions";
                            })}
                            data={applicationDetails.SentProfiles}
                            fetchData={() => {}}
                            loading={isDataLoading}
                            pageCount={applicationDetails?.SentProfiles?.length}
                            totalInfo={{
                              text: "Total Users",
                              count: applicationDetails?.SentProfiles?.length,
                            }}
                            noData={AppMessages.NoUsers}
                            rowHover={true}
                            showPaging={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/*============== Sent Application users grid ==============*/}

      {/*============== Unsend Application Confirmation Modal Start ==============*/}
      {modalUnsendApplicationConfirmShow && (
        <>
          <ModalView
            title={AppMessages.DeleteConfirmationTitle}
            content={modalUnsendConfirmContent}
            onClose={onUnsendApplicationModalClose}
            actions={[
              {
                id: "btndelete",
                text: "Yes",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onUnsend(e),
              },
              {
                text: "No",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onUnsendApplicationModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Unsend Application Confirmation Modal End ==============*/}
    </>
  );
};

export default ViewApplication;
