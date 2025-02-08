import React, { useState, useEffect } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
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
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { Toast } from "../../../components/common/ToastView";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import PdfViewer from "../../../components/common/PdfViewer";
import DataLoader from "../../../components/common/DataLoader";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { formCtrlTypes } from "../../../utils/formvalidation";
import TextAreaControl from "../../../components/common/TextAreaControl";
import InputControl from "../../../components/common/InputControl";
import {
  Grid,
  LazyImage,
  ModalView,
} from "../../../components/common/LazyComponents";

const ViewInvoice = () => {
  let $ = window.$;
  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let inoviceId = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewInvoiceId, 0)
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
  const [invoiceDetails, setInvoiceDetails] = useState({});
  const [selectedGridRow, setSelectedGridRow] = useState(null);
  function setInitialSendInvoiceFormData() {
    return {
      txtcomments: "",
      lblinvoicenumber: "",
      ddljoinedusers: "",
    };
  }

  const [sendInvoiceFormData, setSendInvoiceFormData] = useState(
    setInitialSendInvoiceFormData()
  );

  let formSendInvoiceErrors = {};
  const [sendInvoiceErrors, setSendInvoiceErrors] = useState({});
  const [selectedProfileType, setSelectedProfileType] = useState(
    parseInt(config.userProfileTypes.Tenant)
  );
  const [joinedUsersData, setJoinedUsersData] = useState([]);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);

  const [modalUnsendInvoiceConfirmShow, setModalUnsendInvoiceConfirmShow] =
    useState(false);
  const [modalUnsendConfirmContent, setModalUnsendConfirmContent] = useState(
    AppMessages.UnsendInvoiceToUserMessage
  );

  //PdfViewer
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    getInvoiceDetails();
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

  const getInvoiceDetails = async () => {
    if (inoviceId > 0) {
      let isapimethoderr = false;
      let objParams = {
        InvoiceId: inoviceId,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoiceDetails}`, objParams)
        .then(async (response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setInvoiceDetails(objResponse.Data);
            const fresponse = await fetchPost(
              `${config.apiBaseUrl}${ApiUrls.getInvoicePdf}`,
              {
                InvoiceId: inoviceId,
              }
            );
            if (fresponse.ok) {
              const blob = await fresponse.blob();
              const url = URL.createObjectURL(blob);
              setFileUrl(url);
            } else {
              isapimethoderr = true;
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.getInvoiceDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            setFileUrl("File load Error");
            Toast.error(AppMessages.SomeProblem);
          }
          setIsDataLoading(false);
        });
    } else {
      navigateToInvoices();
    }
  };

  //PdfViewer

  const handleSendInvoiceInputChange = (e) => {
    const { name, value } = e?.target;
    setSendInvoiceFormData({
      ...sendInvoiceFormData,
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

  const onSendInvoice = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedJoinedUser)) {
      formSendInvoiceErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

    if (Object.keys(formSendInvoiceErrors).length === 0) {
      setSendInvoiceErrors({});
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
      objBodyParams.append("InvoiceId", inoviceId);
      objBodyParams.append("Comments", sendInvoiceFormData.txtcomments);

      axiosPost(`${config.apiBaseUrl}${ApiUrls.sendInvoice}`, objBodyParams, {
        "Content-Type": "multipart/form-data",
      })
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status === 1) {
              Toast.success(objResponse.Data.Message);
              setSelectedJoinedUser(null);
              setSendInvoiceFormData(setInitialSendInvoiceFormData());
              getInvoiceDetails();
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.sendInvoice}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnsend", "Send", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formSendInvoiceErrors)[0]}]`).focus();
      setSendInvoiceErrors(formSendInvoiceErrors);
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
                alt={row.original.FirstName + " " + row.original.LastName}
                placeHolderClass="pos-absolute w-50px min-h-50 fl-l"
              ></LazyImage>
            </div>
            <div className="col property-info flex v-center pb-0 min-h-50 px-5">
              <h5 className="text-secondary">
                {row.original.FirstName + " " + row.original.LastName}
              </h5>
            </div>
          </div>
        ),
      },
      {
        Header: "Email Id",
        accessor: "Email",
        disableSortBy: true,
        className: "w-300px",
      },
      {
        Header: "Phone",
        accessor: "MobileNo",
        disableSortBy: true,
        className: "w-200px",
      },

      {
        Header: "Sent On",
        accessor: "SentDateDisplay",
        className: "w-250px",
      },
      {
        Header: "Actions",
        showActionMenu: false,
        className: "w-100px gr-action",
        Cell: ({ row }) => (
          <a
            className="pr-10"
            onClick={(e) => onUnsendInvoiceModalShow(e, row)}
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
      InvoiceId: parseInt(selectedGridRow?.original?.InvoiceId),
      ProfileId: parseInt(selectedGridRow?.original?.ProfileId),
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.unsendInvoice}`, objBodyParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          Toast.success(objResponse.Data.Message);
          if (objResponse.Data.Status == 1) {
            getInvoiceDetails({});
            onUnsendInvoiceModalClose();
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(`"API :: ${ApiUrls.unsendInvoice}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("btndelete", "Yes", API_ACTION_STATUS.COMPLETED);
      });
  };

  //Grid actions

  const onUnsendInvoiceModalShow = (e, row) => {
    e.preventDefault();
    setSelectedGridRow(row);
    setModalUnsendConfirmContent(
      replacePlaceHolders(modalUnsendConfirmContent, {
        name: `${row?.original?.FirstName} ${row?.original?.LastName}`,
      })
    );
    setModalUnsendInvoiceConfirmShow(true);
  };

  const onUnsendInvoiceModalClose = () => {
    setModalUnsendInvoiceConfirmShow(false);
    setSelectedGridRow(null);
    setModalUnsendConfirmContent(AppMessages.UnsendInvoiceToUserMessage);
  };

  //Grid actions

  const navigateToInvoices = () => {
    navigate(routeNames.paymentsinvoices.path);
  };

  const onCancel = (e) => {
    e.preventDefault();
    navigateToInvoices();
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-md-12 col-lg-10 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <div className="row">
                <div className="col-md-4 col-lg-4 col-xl-4 mb-15">
                  <h6 className="mb-2 down-line pb-10">
                    Invoice#: {invoiceDetails?.InvoiceNumber}
                  </h6>
                </div>
                <div className="col-md-4 col-lg-4 col-xl-4 mb-15 text-md-center">
                  <span className="font-500 font-general">
                    Date On : {invoiceDetails?.BillDateDisplay}
                  </span>
                </div>
                <div className="col-md-4 col-lg-4 col-xl-4 mb-15 text-md-end">
                  <span className="font-500 font-general">
                    Due On : {invoiceDetails?.DueDateDisplay}
                  </span>
                </div>
              </div>
              <div className="container-fluid">
                <div className="row">
                  <div className="col px-0">
                    {fileUrl ? (
                      <div className="min-h-300">
                        <PdfViewer
                          file={fileUrl}
                          cssclass="mt-10"
                          pageWidth={config.pdfViewerWidth.Actual}
                        ></PdfViewer>
                      </div>
                    ) : (
                      <DataLoader />
                    )}
                    {!checkEmptyVal(invoiceDetails.Message) && (
                      <span className="font-500 font-general">
                        Message : {invoiceDetails?.Message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <form noValidate>
                <div className="container-fluid mt-20 pb-30">
                  <div className="row">
                    <hr className="w-100 text-primary mb-20 px-0 mx-0"></hr>
                    <h6 className="mb-3 down-line pb-10 px-0">Send Invoice</h6>
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
                            errors={sendInvoiceErrors}
                            formErrors={formSendInvoiceErrors}
                            isMulti={true}
                            isRenderOptions={false}
                            tabIndex={1}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0"
                            name={`txtcomments`}
                            ctlType={formCtrlTypes.comments}
                            onChange={handleSendInvoiceInputChange}
                            value={sendInvoiceFormData.txtcomments}
                            required={false}
                            errors={sendInvoiceErrors}
                            formErrors={formSendInvoiceErrors}
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
                            onClick={onSendInvoice}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              {/*============== Sent Invoice users grid ==============*/}
              {invoiceDetails?.SentProfiles?.length > 0 && (
                <>
                  <div className="container-fluid">
                    <div className="row">
                      <hr className="w-100 text-primary mb-20 px-0 mx-0"></hr>
                      <h6 className="mb-3 down-line pb-10 px-0 mx-0">
                        Sent Invoice: Users List
                      </h6>
                      <div className="col px-0 mx-0">
                        <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 box-shadow">
                          <Grid
                            columns={columns}
                            data={invoiceDetails.SentProfiles}
                            fetchData={() => {}}
                            loading={isDataLoading}
                            pageCount={invoiceDetails?.SentProfiles?.length}
                            totalInfo={{
                              text: "Total Users",
                              count: invoiceDetails?.SentProfiles?.length,
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
      {/*============== Sent Invoice users grid ==============*/}

      {/*============== Unsend Invoice Confirmation Modal Start ==============*/}
      {modalUnsendInvoiceConfirmShow && (
        <>
          <ModalView
            title={AppMessages.DeleteConfirmationTitle}
            content={modalUnsendConfirmContent}
            onClose={onUnsendInvoiceModalClose}
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
                onClick: (e) => onUnsendInvoiceModalClose(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Unsend Invoice Confirmation Modal End ==============*/}
    </>
  );
};

export default ViewInvoice;
