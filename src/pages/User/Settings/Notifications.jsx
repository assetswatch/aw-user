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
import { Toast } from "../../../components/common/ToastView";
import { axiosPost } from "../../../helpers/axiosHelper";
import { routeNames } from "../../../routes/routes";
import GoBackPanel from "../../../components/common/GoBackPanel";

const Notifications = () => {
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

  const onNotifications = (e) => {
    e.preventDefault();
    e.stopPropagation();
    apiReqResLoader("btnSave", "Saving...");
    Toast.success("Notification settings saved successfully!");
    navigateToSettings();
    apiReqResLoader("btnSave", "Save", API_ACTION_STATUS.COMPLETED);
  };

  const navigateToSettings = () => {
    navigate(routeNames.settings.path);
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
                      <span className="font-general font-500 cur-default">
                        Notification Settings
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
                                Notification Settings
                              </h6>
                            </div>
                            <GoBackPanel
                              clickAction={navigateToSettings}
                              isformBack={true}
                            />
                          </div>
                          <div className="col-12 mt-10 mb-30">
                            <div className="custom-check-box-2">
                              <input
                                className="d-none"
                                type="checkbox"
                                id="smsnotification"
                                name="smsnotification"
                                checked={true}
                              />
                              <label htmlFor="smsnotification">
                                SMS Notification{" "}
                              </label>
                            </div>
                          </div>
                          <div className="col-12 mb-20">
                            <div className="custom-check-box-2">
                              <input
                                className="d-none"
                                type="checkbox"
                                id="emailnotification"
                                name="emailnotification"
                                checked={true}
                              />
                              <label htmlFor="emailnotification">
                                Email Notification{" "}
                              </label>
                            </div>
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
                              onClick={navigateToSettings}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary"
                              id="btnSave"
                              onClick={onNotifications}
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

export default Notifications;
