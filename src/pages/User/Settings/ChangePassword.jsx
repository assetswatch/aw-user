import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  GetCookieValues,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import AsyncSelect from "../../../components/common/AsyncSelect";
import FileControl from "../../../components/common/FileControl";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { Toast } from "../../../components/common/ToastView";
import { axiosPost } from "../../../helpers/axiosHelper";
import { routeNames } from "../../../routes/routes";
import getuuid from "../../../helpers/uuidHelper";
import GoBackPanel from "../../../components/common/GoBackPanel";

const ChangePassword = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let loggedinProfileTypeId = GetCookieValues(UserCookie.ProfileTypeId);

  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let profileTypeId = parseInt(
    GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
  );

  let formCpwdErrors = {};
  const [cpwdErrors, setCpwdErrors] = useState({});
  function setInitialFormCpwdData(pDetails) {
    return {
      txtoldpassword: "",
      txtpassword: "",
      txtconfirmpassword: "",
    };
  }

  const [formCpwdData, setFormCpwdData] = useState(
    setInitialFormCpwdData(null)
  );

  const handleCpwdChange = (e) => {
    const { name, value } = e?.target;
    setFormCpwdData({
      ...formCpwdData,
      [name]: value,
    });
  };

  const onChangePassword = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (Object.keys(formCpwdErrors).length === 0) {
      apiReqResLoader("btnSave", "Saving...");
      let errctl = "#form-error-cpwd";
      $(errctl).html("");
      setCpwdErrors({});
      let isapimethoderr = false;
      let objBodyParams = {
        accountid: accountId,
        oldpwd: formCpwdData.txtoldpassword,
        pwd: formCpwdData.txtpassword,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.changePassword}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data != null && objResponse.Data?.Status == 1) {
              Toast.success(objResponse.Data.Message);
              navigateToProfileSettings();
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.changePassword}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnSave", "Save", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formCpwdErrors)[0]}]`).focus();
      setCpwdErrors(formCpwdErrors);
    }
  };

  const navigateToSettings = () => {
    navigate(routeNames.settings.path);
  };
  const navigateToProfileSettings = () => {
    navigate(routeNames.profilesettings.path);
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
                        onClick={navigateToSettings}
                      >
                        Settings
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span
                        className="font-general font-500 cur-pointer"
                        onClick={navigateToProfileSettings}
                      >
                        Profile Settings
                      </span>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Change Password
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-md-12 col-lg-6 col-xl-5 shadow">
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded">
                  <div className="row row-cols-1 g-4 flex-center">
                    <div className="col">
                      <form noValidate>
                        <div className="row">
                          <div className="d-flex w-100">
                            <div className="flex-grow-1">
                              <h6 className="mb-3 down-line pb-10 px-0 font-16">
                                Change Password
                              </h6>
                            </div>
                            <GoBackPanel
                              clickAction={navigateToProfileSettings}
                              isformBack={true}
                            />
                          </div>
                          <div className="col-12 mb-15">
                            <InputControl
                              lblclassName="mb-0 lbl-req-field"
                              name="txtoldpassword"
                              lblText="Current password"
                              ctlType={formCtrlTypes.currentpwd}
                              required={true}
                              onChange={handleCpwdChange}
                              value={formCpwdData.txtoldpassword}
                              errors={cpwdErrors}
                              formErrors={formCpwdErrors}
                              tabIndex={1}
                            ></InputControl>
                          </div>
                          <div className="col-12 mb-15">
                            <InputControl
                              lblclassName="mb-0 lbl-req-field"
                              name="txtpassword"
                              lblText="New password"
                              ctlType={formCtrlTypes.newpwd}
                              required={true}
                              onChange={handleCpwdChange}
                              value={formCpwdData.txtpassword}
                              errors={cpwdErrors}
                              formErrors={formCpwdErrors}
                              tabIndex={2}
                            ></InputControl>
                          </div>
                          <div className="col-12 mb-15">
                            <InputControl
                              lblclassName="mb-0 lbl-req-field"
                              name="txtconfirmpassword"
                              lblText="Confirm new password"
                              ctlType={formCtrlTypes.confirmnewpwd}
                              required={true}
                              onChange={handleCpwdChange}
                              value={formCpwdData.txtconfirmpassword}
                              pwdVal={formCpwdData.txtpassword}
                              errors={cpwdErrors}
                              formErrors={formCpwdErrors}
                              objProps={{
                                pwdVal: formCpwdData.txtpassword,
                              }}
                              tabIndex={3}
                            ></InputControl>
                          </div>
                        </div>
                      </form>
                      <hr className="w-100 text-primary"></hr>

                      <div className="container-fluid">
                        <div className="row form-action flex-center">
                          <div
                            className="col-md-6 px-0 form-error"
                            id="form-error"
                          ></div>
                          <div className="col-md-6 px-0">
                            <button
                              className="btn btn-secondary"
                              id="btnCancel"
                              onClick={navigateToProfileSettings}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary"
                              id="btnSave"
                              onClick={onChangePassword}
                            >
                              Save
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
      </div>
    </>
  );
};

export default ChangePassword;
