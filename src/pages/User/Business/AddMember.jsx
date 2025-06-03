import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import {
  apiReqResLoader,
  checkEmptyVal,
  debounce,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppConstants,
  AppMessages,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import { axiosPost } from "../../../helpers/axiosHelper";
import { routeNames } from "../../../routes/routes";
import { formCtrlTypes, Regex } from "../../../utils/formvalidation";
import TextAreaControl from "../../../components/common/TextAreaControl";
import GoBackPanel from "../../../components/common/GoBackPanel";
import AsyncRemoteSelect from "../../../components/common/AsyncRemoteSelect";
import { Toast } from "../../../components/common/ToastView";
import InputControl from "../../../components/common/InputControl";
import { useUserProfileAccountTypesGateway } from "../../../hooks/useUserProfileAccountTypesGateway";
import AsyncSelect from "../../../components/common/AsyncSelect";

const AddMember = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let profiletypeid = parseInt(
    GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
  );

  let { profileAccountTypes } = useUserProfileAccountTypesGateway();

  let formSendInvitaionErrors = {};
  const [sendInvitationErrors, setSendInvitationErrors] = useState({});
  const [selectedUsersProfile, setSelectedUsersProfile] = useState(null);
  const [inputProfileValue, setInputProfileValue] = useState("");
  function setInitialSendInvitationFormData() {
    return {
      txtmessage: "",
      txtfirstname: "",
      txtlastname: "",
      txtmobile: "",
      ddlprofileaccounttype: null,
    };
  }

  const [sendInvitationFormData, setSendInvitationFormData] = useState(
    setInitialSendInvitationFormData()
  );

  const getUsersProfiles = async (searchValue) => {
    if (checkEmptyVal(searchValue)) return [];
    let objParams = {
      AccountId: accountid,
      ProfileId: profileid,
      ProfileTypeId: parseInt(0),
      Keyword: searchValue,
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getDdlUsersProfiles}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          return objResponse.Data.map((item) => ({
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
        } else {
          return [];
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getDdlUsersProfiles}, Error ::" ${err}`
        );
        return [];
      });
  };

  const usersProfilesOptions = useCallback(
    debounce((inputval, callback) => {
      if (inputval?.length >= AppConstants.DdlSearchMinLength) {
        getUsersProfiles(inputval).then((options) => {
          callback && callback(options);
        });
      } else {
        callback && callback([]);
      }
    }, AppConstants.DebounceDelay),
    []
  );

  const handleDdlUsersProfilesChange = () => {
    usersProfilesOptions();
  };

  const handleInputProfileChange = (newValue, actionMeta) => {
    if (
      actionMeta.action !== "menu-close" &&
      actionMeta.action !== "input-blur"
    ) {
      setInputProfileValue(newValue);
    }
  };

  const handleSendInvitationInputChange = (e) => {
    const { name, value } = e?.target;
    setSendInvitationFormData({
      ...sendInvitationFormData,
      [name]: value,
    });
  };

  const ddlChange = (e, name) => {
    setSendInvitationFormData({
      ...sendInvitationFormData,
      [name]: e?.value,
    });
  };

  const onSendInvitation = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      checkEmptyVal(selectedUsersProfile) &&
      checkEmptyVal(inputProfileValue)
    ) {
      formSendInvitaionErrors["ddlusersprofiles"] = ValidationMessages.UserReq;
    } else if (
      !checkEmptyVal(inputProfileValue) &&
      !Regex.email.pattern.test(inputProfileValue)
    ) {
      formSendInvitaionErrors["ddlusersprofiles"] =
        ValidationMessages.EmailInvalid;
    }

    if (checkEmptyVal(sendInvitationFormData.ddlprofileaccounttype)) {
      formSendInvitaionErrors["ddlprofileaccounttype"] =
        ValidationMessages.AccountTypeReq;
    }

    if (Object.keys(formSendInvitaionErrors).length === 0) {
      setSendInvitationErrors({});
      apiReqResLoader("btnsendinvitation", "Sending", API_ACTION_STATUS.START);

      let isapimethoderr = false;
      let objBodyParams = {
        InviterId: profileid,
        InviteeId: parseInt(setSelectDefaultVal(selectedUsersProfile)),
        ConnectionForProfileTypeId: parseInt(0),
        Email: inputProfileValue.trim(),
        Message: sendInvitationFormData.txtmessage,
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.createUserConnection}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Id > 0) {
              if (objResponse.Data.Status === 200) {
                Toast.success(objResponse.Data.Message);
                navigateToBusinessMembers();
              } else {
                Toast.info(objResponse.Data.Message);
              }
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.createConnection}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnsendinvitation",
            "Send",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      $(`[name=${Object.keys(formSendInvitaionErrors)[0]}]`).focus();
      setSendInvitationErrors(formSendInvitaionErrors);
    }
  };

  const onSave = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();

    apiReqResLoader("btnSave", "Saving...", API_ACTION_STATUS.START);
    navigateToBusiness();
    apiReqResLoader("btnSave", "Save", API_ACTION_STATUS.COMPLETED);
  };

  const navigateToSettings = () => {
    navigate(routeNames.settings.path);
  };

  const navigateToBusiness = () => {
    navigate(routeNames.businesses.path);
  };

  const navigateToBusinessMembers = () => {
    navigate(routeNames.businessmembers.path);
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
                        onClick={navigateToBusiness}
                      >
                        Business
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span
                        className="font-general font-500 cur-pointer"
                        onClick={navigateToBusinessMembers}
                      >
                        Members
                      </span>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Add Member
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-md-11 col-lg-8 col-xl-6 shadow">
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded">
                  <div className="row row-cols-1 g-4 flex-center">
                    <div className="col">
                      <form noValidate>
                        <div className="row">
                          <div className="d-flex w-100">
                            <div className="flex-grow-1">
                              <h6 className="mb-3 down-line pb-10 px-0 font-16">
                                Add Member
                              </h6>
                            </div>
                            <GoBackPanel
                              clickAction={navigateToBusinessMembers}
                              isformBack={true}
                            />
                          </div>
                          <div className="col-12 mb-15">
                            <AsyncRemoteSelect
                              placeHolder={AppMessages.DdlTypetoSearch}
                              noData={AppMessages.NoUsers}
                              loadOptions={usersProfilesOptions}
                              handleInputChange={(e, val) => {
                                handleInputProfileChange(e, val);
                                handleDdlUsersProfilesChange(
                                  e,
                                  val.prevInputValue
                                );
                              }}
                              onChange={(option) => {
                                setSelectedUsersProfile(option);
                                //setInputProfileValue(option ? option.customlabel : "");
                              }}
                              onBlur={() => {
                                setInputProfileValue(inputProfileValue);
                              }}
                              inputValue={inputProfileValue}
                              value={selectedUsersProfile}
                              name="ddlusersprofiles"
                              lblText={`Users: `}
                              lblClass="mb-0 lbl-req-field"
                              required={true}
                              errors={sendInvitationErrors}
                              formErrors={formSendInvitaionErrors}
                              isClearable={true}
                              tabIndex={1}
                            ></AsyncRemoteSelect>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtfirstname"
                              ctlType={formCtrlTypes.fname}
                              required={true}
                              onChange={handleSendInvitationInputChange}
                              value={sendInvitationFormData.txtfirstname}
                              errors={sendInvitationErrors}
                              formErrors={formSendInvitaionErrors}
                              tabIndex={2}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtlastname"
                              ctlType={formCtrlTypes.lname}
                              required={true}
                              onChange={handleSendInvitationInputChange}
                              value={sendInvitationFormData.txtlastname}
                              errors={sendInvitationErrors}
                              formErrors={formSendInvitaionErrors}
                              tabIndex={3}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtmobile"
                              ctlType={formCtrlTypes.mobile}
                              required={true}
                              onChange={handleSendInvitationInputChange}
                              value={sendInvitationFormData.txtmobile}
                              errors={sendInvitationErrors}
                              formErrors={formSendInvitaionErrors}
                              tabIndex={4}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <AsyncSelect
                              placeHolder={
                                profileAccountTypes.length <= 0 &&
                                sendInvitationFormData.ddlprofileaccounttype ==
                                  null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlDefaultSelect
                              }
                              noData={
                                profileAccountTypes.length <= 0 &&
                                sendInvitationFormData.ddlprofileaccounttype ==
                                  null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlNoData
                              }
                              options={profileAccountTypes}
                              dataKey="Id"
                              dataVal="Type"
                              onChange={(e) =>
                                ddlChange(e, "ddlprofileaccounttype")
                              }
                              value={
                                sendInvitationFormData.ddlprofileaccounttype
                              }
                              name="ddlprofileaccounttype"
                              lblClass="mb-0 lbl-req-field"
                              lblText="Account type:"
                              className="ddlborder"
                              isClearable={false}
                              isSearchCtl={true}
                              required={true}
                              errors={sendInvitationErrors}
                              formErrors={formSendInvitaionErrors}
                            ></AsyncSelect>
                          </div>
                          <div className="col-12 mb-0">
                            <TextAreaControl
                              lblClass="mb-0 lbl-req-field"
                              name={`txtmessage`}
                              ctlType={formCtrlTypes.message}
                              onChange={handleSendInvitationInputChange}
                              value={sendInvitationFormData.txtmessage}
                              required={true}
                              errors={sendInvitationErrors}
                              formErrors={formSendInvitaionErrors}
                              rows={3}
                              tabIndex={6}
                            ></TextAreaControl>
                          </div>
                        </div>
                      </form>

                      <div className="row form-action flex-center mx-0 mt-30">
                        <div
                          className="col-md-4 px-0 form-error"
                          id="form-error"
                        ></div>
                        <div className="col-md-8 px-0">
                          <button
                            className="btn btn-secondary"
                            id="btnCancel"
                            onClick={navigateToBusinessMembers}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary"
                            id="btnSendinvitation"
                            onClick={onSendInvitation}
                          >
                            Send
                          </button>
                        </div>
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

export default AddMember;
