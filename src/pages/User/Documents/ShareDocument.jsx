import React, { useState, useEffect } from "react";
import {
  apiReqResLoader,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  checkEmptyVal,
  checkObjNullorEmpty,
} from "../../../utils/common";
import {
  ApiUrls,
  UserCookie,
  SessionStorageKeys,
  API_ACTION_STATUS,
  AppMessages,
  ValidationMessages,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { DataLoader } from "../../../components/common/LazyComponents";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import { Toast } from "../../../components/common/ToastView";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import AsyncSelect from "../../../components/common/AsyncSelect";
import PdfViewer from "../../../components/common/PdfViewer";
import { useProfileTypesGateway } from "../../../hooks/useProfileTypesGateway";
import InputControl from "../../../components/common/InputControl";
import GoBackPanel from "../../../components/common/GoBackPanel";

const ShareDocument = () => {
  let $ = window.$;
  const navigate = useNavigate();

  let formErrors = {};
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    txtcomments: "",
  });

  const { loggedinUser } = useAuth();

  let documentid = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewEditDocumentId, 0)
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
  const [documentDetails, setDocumentDetails] = useState({});

  let { profileTypesList } = useProfileTypesGateway();
  const [selectedProfileType, setSelectedProfileType] = useState(null);
  const [joinedUsersData, setJoinedUsersData] = useState([]);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);

  //PdfViewer
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    getDocumentDetails();
  }, []);

  const getDocumentDetails = async () => {
    if (documentid > 0) {
      let objParams = {
        DocumentId: documentid,
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
    } else {
      navigateToDocuments();
    }
  };

  //PdfViewer

  const getJoinedUsers = (profileTypeId) => {
    let objParams = {
      keyword: "",
      inviterid: profileid,
      InviterProfileTypeId: loggedinprofiletypeid,
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

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
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

  const onShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedJoinedUser)) {
      formErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

    if (checkEmptyVal(selectedProfileType)) {
      formErrors["ddlprofiletype"] = ValidationMessages.ProfiletypeReq;
    }

    if (Object.keys(formErrors).length === 0) {
      setErrors({});
      apiReqResLoader("btnshare", "Sharing", API_ACTION_STATUS.START);

      let isapimethoderr = false;
      let objBodyParams = {
        FolderId: 0,
        DocumentId: documentid,
        SenderId: profileid,
        ReceiverIds: selectedJoinedUser,
        Comments: formData.txtcomments,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.shareDocument}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status === 1) {
              Toast.success(objResponse.Data.Message);
              navigateToDocuments();
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
          apiReqResLoader("btnshare", "Share", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const navigateToDocuments = () => {
    navigate(routeNames.mydocuments.path);
  };

  const onCancel = (e) => {
    e.preventDefault();
    navigateToDocuments();
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex w-100">
                <div className="flex-grow-1">
                  <div className="breadcrumb my-1">
                    <div className="breadcrumb-item bc-fh">
                      <h6
                        className="mb-3 down-line pb-10 cur-pointer"
                        onClick={navigateToDocuments}
                      >
                        My Documents
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Share Document
                      </span>
                    </div>
                  </div>
                </div>
                <GoBackPanel clickAction={navigateToDocuments} />
              </div>
              <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                <div className="row container-fluid pb-30">
                  <ol className="breadcrumb mb-0 bg-transparent p-0 col-md-8 col-lg-8 col-xl-8 mb-15">
                    <li className="breadcrumb-item" aria-current="page">
                      {!checkObjNullorEmpty(documentDetails) && (
                        <h6 className="mb-0 down-line pb-10 higlight-font">
                          {documentDetails?.Name}.{documentDetails?.Extension}
                        </h6>
                      )}
                    </li>
                  </ol>
                  <div className="col-md-4 col-lg-4 col-xl-4 mb-15 text-lg-end px-0">
                    <span className="font-500 font-general">
                      Modified On : {documentDetails?.ModifiedDateDisplay}
                    </span>
                  </div>

                  <div className="container-fluid">
                    <div className="row">
                      <div className="col px-0">
                        {fileUrl ? (
                          <div className="min-h-300">
                            {documentDetails.Extension === "pdf" ? (
                              <PdfViewer
                                file={fileUrl}
                                cssclass="mt-10"
                              ></PdfViewer>
                            ) : (
                              <div className="flex flex-center min-h-300 max-h-600">
                                <img
                                  src={fileUrl}
                                  className="bg-light border rounded max-h-600"
                                ></img>
                              </div>
                            )}
                          </div>
                        ) : (
                          <DataLoader />
                        )}

                        <form noValidate>
                          <div className="container-fluid mt-20">
                            <div className="row">
                              <h6 className="mb-4 down-line pb-10 px-0">
                                Share Document
                              </h6>
                              <div className="col px-0">
                                <div className="row">
                                  <div className="col-md-3 mb-15">
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
                                      lblClass="mb-0 lbl-req-field"
                                      required={true}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={1}
                                      isSearchable={false}
                                    ></AsyncSelect>
                                  </div>
                                  <div className="col-md-5 mb-15">
                                    <AsyncSelect
                                      placeHolder={
                                        selectedJoinedUser == null ||
                                        Object.keys(selectedJoinedUser)
                                          .length === 0
                                          ? AppMessages.DdlDefaultSelect
                                          : joinedUsersData.length <= 0 &&
                                            selectedProfileType == null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.DdlDefaultSelect
                                      }
                                      noData={
                                        selectedJoinedUser == null ||
                                        Object.keys(selectedJoinedUser)
                                          .length === 0
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
                                      lbl={formCtrlTypes.users}
                                      lblClass="mb-0 lbl-req-field"
                                      required={true}
                                      errors={errors}
                                      formErrors={formErrors}
                                      isMulti={true}
                                      isRenderOptions={false}
                                      tabIndex={2}
                                    ></AsyncSelect>
                                  </div>
                                  <div className="col-md-4 mb-15">
                                    <InputControl
                                      lblClass="mb-0"
                                      name={`txtcomments`}
                                      ctlType={formCtrlTypes.comments}
                                      onChange={handleChange}
                                      value={formData.txtcomments}
                                      required={false}
                                      errors={errors}
                                      formErrors={formErrors}
                                      rows={2}
                                      tabIndex={3}
                                    ></InputControl>
                                  </div>
                                </div>
                                <hr className="w-100 text-primary my-20"></hr>
                                <div className="row form-action d-flex flex-end">
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
                                      id="btnshare"
                                      onClick={onShare}
                                    >
                                      Share
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareDocument;
