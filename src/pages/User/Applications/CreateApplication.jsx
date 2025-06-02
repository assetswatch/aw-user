import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  SessionStorageKeys,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import config from "../../../config.json";
import { Toast } from "../../../components/common/ToastView";
import { axiosPost } from "../../../helpers/axiosHelper";
import { routeNames } from "../../../routes/routes";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { formCtrlTypes } from "../../../utils/formvalidation";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { useGetDdlInvoiceForItemsGateway } from "../../../hooks/useGetDdlInvoiceForItemsGateway";
import { useGetBgvApplicationTypesGateway } from "../../../hooks/useGetBgvApplicationTypesGateway";
import { useGetBgvPackagesGateway } from "../../../hooks/useGetBgvPackagesGateway";

const CreateApplication = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

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
  const [errors, setErrors] = useState({});

  function setInitialFormData() {
    return {
      txtmessage: "",
      ddlasset: null,
      ddlapplicationtype: null,
    };
  }
  const [formData, setFormData] = useState(setInitialFormData());

  const { invoiceForItems } = useGetDdlInvoiceForItemsGateway("", 1);
  const { bgvApplicationTypesList } = useGetBgvApplicationTypesGateway("", 1);
  const { bgvPackagesList } = useGetBgvPackagesGateway("", 1);

  const [joinedUsersData, setJoinedUsersData] = useState([]);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);

  const [showPreview, setShowPreview] = useState(false);
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  useEffect(() => {
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

  const handleChange = (e, ctlname, ctlType) => {
    if (ctlType === "ddl") {
      setFormData({
        ...formData,
        [ctlname]: e,
      });
    } else {
      const { name, value } = e?.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleJoinedUserChange = (e) => {
    if (e != null)
      setSelectedJoinedUser(
        e.reduce((acc, curr, index) => {
          return index === 0 ? curr.value : acc + "," + curr.value;
        }, "")
      );
  };

  const onPreview = (e) => {
    e.preventDefault();
    e.stopPropagation();
    apiReqResLoader("x", "x", API_ACTION_STATUS.START);

    let errctl = "#form-error";
    $(errctl).html("");

    delete formErrors["ddljoinedusers"];
    delete formErrors["ddlasset"];
    delete formErrors["ddlapplicationtype"];

    if (checkEmptyVal(formData.ddlapplicationtype)) {
      formErrors["ddlapplicationtype"] = ValidationMessages.ApplicationTypeReq;
    }

    if (checkEmptyVal(formData.ddlasset)) {
      formErrors["ddlasset"] = ValidationMessages.PropertyReq;
    }

    if (checkEmptyVal(selectedJoinedUser)) {
      formErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

    if (Object.keys(formErrors).length === 0) {
      setErrors({});
      togglePreview();
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
    $(`[name='txtdummyfocus']`).focus();
    apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
  };

  const onEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePreview();
    $(`[name='txtdummyfocus']`).focus();
  };

  const onCreate = (e) => {
    e.preventDefault();
    e.stopPropagation();

    delete formErrors["ddljoinedusers"];
    delete formErrors["ddlasset"];
    delete formErrors["ddlapplicationtype"];

    if (checkEmptyVal(formData.ddlapplicationtype)) {
      formErrors["ddlapplicationtype"] = ValidationMessages.ApplicationTypeReq;
    }

    if (checkEmptyVal(formData.ddlasset)) {
      formErrors["ddlasset"] = ValidationMessages.PropertyReq;
    }

    if (checkEmptyVal(selectedJoinedUser)) {
      formErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

    if (Object.keys(formErrors).length === 0) {
      setErrors({});
      apiReqResLoader("btnCreate", "Creating", API_ACTION_STATUS.START);
      let isapimethoderr = false;
      let objBodyParams = {
        AccountId: accountid,
        ProfileId: profileid,
        AssetId: parseInt(formData.ddlasset?.value),
        PackageId: bgvPackagesList?.[0].PackageId,
        ApplicationTypeId: parseInt(formData.ddlapplicationtype?.value),
        //Message: formData.txtmessage,
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.createApplication}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Id > 0) {
              Toast.success(objResponse.Data.Message);

              let objSendBodyParams = new FormData();
              let selectedUsers = selectedJoinedUser
                .toString()
                .split(",")
                .map((u) => u.trim());
              for (let i = 0; i <= selectedUsers.length - 1; i++) {
                let idx = i;
                objSendBodyParams.append(
                  `Profiles[${i}].ProfileId`,
                  parseInt(selectedUsers[idx])
                );
              }
              objSendBodyParams.append(
                "ApplicationId",
                parseInt(objResponse.Data.Id)
              );
              objSendBodyParams.append("Message", formData.txtmessage);

              axiosPost(
                `${config.apiBaseUrl}${ApiUrls.sendApplication}`,
                objSendBodyParams,
                {
                  "Content-Type": "multipart/form-data",
                }
              )
                .then()
                .catch((err) => {
                  console.error(
                    `"API :: ${ApiUrls.sendApplication}, Error ::" ${err}`
                  );
                })
                .finally(() => {
                  navigateToApplications();
                });
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
            `"API :: ${ApiUrls.createApplication}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnCreate", "Create", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const navigateToApplications = (e) => {
    e?.preventDefault();
    navigate(routeNames.applications.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <input
        name="txtdummyfocus"
        className="lh-0 h-0 p-0 bo-0"
        autoFocus
      ></input>
      <div className="full-row  bg-light pt-0">
        <div className="container">
          <div className="row mx-auto col-md-10 col-lg-6 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <div className="row">
                <div className="col-9">
                  <div className="breadcrumb mb-0">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-2 down-line pb-10">Applications</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Create
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-3 d-flex flex-ai-t flex-jc-r text-end pt-2">
                  <button
                    type="button"
                    className="btn btn-glow px-0 rounded-circle text-primary lh-1 d-flex flex-center"
                    onClick={
                      !showPreview ? navigateToApplications : togglePreview
                    }
                  >
                    <i className="icons font-18 icon-arrow-left-circle text-primary me-1"></i>
                    <span className="font-general">Back</span>
                  </button>
                </div>
              </div>

              <div className="row pt-20 pb-0 row-cols-1 g-4 flex-center">
                <div className="col">
                  <div style={{ display: !showPreview ? "block" : "none" }}>
                    <form noValidate>
                      <div className="row">
                        <div className="col-md-6 mb-15">
                          <AsyncSelect
                            placeHolder={
                              formData.ddlapplicationtype == null ||
                              Object.keys(formData.ddlapplicationtype)
                                .length === 0
                                ? AppMessages.DdlDefaultSelect
                                : invoiceForItems?.length <= 0 &&
                                  formData.ddlapplicationtype == null
                                ? AppMessages.DdLLoading
                                : AppMessages.DdlDefaultSelect
                            }
                            noData={
                              formData.ddlforitem == null ||
                              Object.keys(formData.ddlapplicationtype)
                                .length === 0
                                ? AppMessages.NoData
                                : invoiceForItems?.length <= 0 &&
                                  formData.ddlapplicationtype == null
                                ? AppMessages.DdLLoading
                                : AppMessages.NoData
                            }
                            options={bgvApplicationTypesList}
                            dataKey="ApplicationTypeId"
                            dataVal="ApplicationType"
                            onChange={(e) =>
                              handleChange(e, "ddlapplicationtype", "ddl")
                            }
                            value={formData.ddlapplicationtype}
                            name="ddlapplicationtype"
                            lbl={formCtrlTypes.select}
                            lblClass="mb-0 lbl-req-field"
                            lblText="Application type: "
                            className="ddlborder"
                            isClearable={false}
                            required={true}
                            errors={errors}
                            formErrors={formErrors}
                            tabIndex={1}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-6 mb-15">
                          <AsyncSelect
                            placeHolder={
                              formData.ddlasset == null ||
                              Object.keys(formData.ddlasset).length === 0
                                ? AppMessages.DdlDefaultSelect
                                : invoiceForItems?.length <= 0 &&
                                  formData.ddlasset == null
                                ? AppMessages.DdLLoading
                                : AppMessages.DdlDefaultSelect
                            }
                            noData={
                              formData.ddlforitem == null ||
                              Object.keys(formData.ddlasset).length === 0
                                ? AppMessages.NoData
                                : invoiceForItems?.length <= 0 &&
                                  formData.ddlasset == null
                                ? AppMessages.DdLLoading
                                : AppMessages.NoData
                            }
                            options={invoiceForItems}
                            dataKey="Id"
                            dataVal="Name"
                            onChange={(e) => handleChange(e, "ddlasset", "ddl")}
                            value={formData.ddlasset}
                            name="ddlasset"
                            lbl={formCtrlTypes.select}
                            lblClass="mb-0 lbl-req-field"
                            lblText="Property: "
                            className="ddlborder"
                            isClearable={false}
                            required={true}
                            errors={errors}
                            formErrors={formErrors}
                            tabIndex={2}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-12 mb-15">
                          <AsyncSelect
                            placeHolder={
                              selectedJoinedUser == null ||
                              Object.keys(selectedJoinedUser).length === 0
                                ? AppMessages.DdlDefaultSelect
                                : joinedUsersData.length <= 0
                                ? AppMessages.DdLLoading
                                : AppMessages.DdlDefaultSelect
                            }
                            noData={
                              selectedJoinedUser == null ||
                              Object.keys(selectedJoinedUser).length === 0
                                ? AppMessages.NoUsers
                                : joinedUsersData.length <= 0
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
                            errors={errors}
                            formErrors={formErrors}
                            isMulti={true}
                            isRenderOptions={false}
                            tabIndex={3}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-12 mb-30">
                          <TextAreaControl
                            lblClass="mb-0"
                            lblText="Message: "
                            name="txtmessage"
                            ctlType={formCtrlTypes.message}
                            required={false}
                            onChange={handleChange}
                            value={formData.txtmessage}
                            errors={errors}
                            formErrors={formErrors}
                            tabIndex={4}
                            rows={3}
                          ></TextAreaControl>
                        </div>
                        <div className="col-md-12 ">
                          <h6 className="text-primary col-md-6">
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
                        <div className="col-md-12 my-15">
                          <hr className="w-100 text-primary my-20"></hr>
                          <div className="row form-action d-flex flex-end mt-20">
                            <div
                              className="col-md-6 form-error"
                              id="form-error"
                            ></div>
                            <div className="col-md-6">
                              <button
                                className="btn btn-secondary"
                                id="btnCancel"
                                onClick={navigateToApplications}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn btn-primary"
                                id="btnPreview"
                                onClick={onPreview}
                              >
                                Preview
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div
                    className="row form-view"
                    id="divPreview"
                    style={{ display: showPreview ? "block" : "none" }}
                  >
                    <div className="col-md-12 mb-15">
                      <span>Application type: </span>
                      <span>{formData?.ddlapplicationtype?.label}</span>
                    </div>
                    <div className="col-md-12 mb-15">
                      <span>Property: </span>
                      <span>{formData?.ddlasset?.label}</span>
                    </div>
                    {!checkEmptyVal(selectedJoinedUser) && (
                      <div className="col-md-12 mb-15">
                        <h6 className="text-primary col-md-6">
                          Users Information
                        </h6>
                        <span>
                          {selectedJoinedUser.toString().indexOf(",") == -1 ? (
                            <span className="my-10">
                              {
                                joinedUsersData.find(
                                  (u) => u.value == selectedJoinedUser
                                )?.label
                              }
                            </span>
                          ) : (
                            selectedJoinedUser
                              .split(",")
                              .map((seluser, index) => {
                                const user = joinedUsersData.find(
                                  (u) => u.value == seluser
                                );
                                return (
                                  <div
                                    key={`seluser-${index}}`}
                                    className="my-10"
                                  >
                                    {user?.label}
                                  </div>
                                );
                              })
                          )}
                        </span>
                      </div>
                    )}
                    {formData?.txtmessage && (
                      <div className="col-md-12 mb-30">
                        <span>Message: </span>
                        <span>{formData?.txtmessage}</span>
                      </div>
                    )}
                    <div className="col-md-12 ">
                      <h6 className="text-primary col-md-6">
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
                    <div className="col-md-12 my-15">
                      <hr className="w-100 text-primary my-20"></hr>
                      <div className="row form-action d-flex flex-end mt-20">
                        <div
                          className="col-md-6 form-error"
                          id="form-error"
                        ></div>
                        <div className="col-md-6">
                          <button
                            className="btn btn-secondary"
                            id="btnEdit"
                            onClick={onEdit}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-primary"
                            id="btnCreate"
                            onClick={onCreate}
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* )} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateApplication;
