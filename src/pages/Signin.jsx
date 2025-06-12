import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";
import { formCtrlTypes } from "../utils/formvalidation";
import InputControl from "../components/common/InputControl";
import {
  AppDetails,
  ApiUrls,
  AppMessages,
  UserCookie,
} from "../utils/constants";
import getuuid from "../helpers/uuidHelper";
import { axiosPost } from "../helpers/axiosHelper";
import config from "../config.json";
import {
  aesCtrDecrypt,
  apiReqResLoader,
  checkEmptyVal,
  GetCookieValues,
  getKeyByValue,
  getPagesPathByLoggedinUserProfile,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  UrlWithoutParam,
} from "../utils/common";
import { useAuth } from "../contexts/AuthContext";
import OAuthLoginPanel from "../oauth/OAuthLoginPanel";
import SigninLeftPanel from "../components/common/SigninLeftPanel";

const Signin = () => {
  let $ = window.$;

  const { isAuthenticated, loggedinUser, logoutUser } = useAuth();
  const { id } = useParams();

  let formErrors = {};

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    txtemail: "",
    txtpassword: "",
    cbremme: true,
  });

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated() == true) {
      if (checkEmptyVal(id) == true) {
        let loggedinptid = parseInt(
          GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
        );
        navigate(getPagesPathByLoggedinUserProfile(loggedinptid, "profile"), {
          replace: true,
        });
      } else {
        aesCtrDecrypt(id).then((decId) => {
          let loggedinaccid = parseInt(
            GetUserCookieValues(UserCookie.AccountId, loggedinUser)
          );
          let [decaccountid, enckey, upptid] = decId.split(":");
          decaccountid = parseInt(decaccountid);
          upptid = parseInt(upptid);
          if (
            Number.isSafeInteger(decaccountid) &&
            !checkEmptyVal(enckey) &&
            Number.isSafeInteger(upptid)
          ) {
            if (loggedinaccid == decaccountid) {
              navigate(
                routeNames.createprofile.path.replace(
                  ":ProfileType",
                  getKeyByValue(config.userProfileTypes, upptid)
                )
              );
            } else {
              logoutUser();
            }
          } else {
            logoutUser();
          }
        });
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRememberMeChange = (e) => {
    setFormData({
      ...formData,
      ["cbremme"]: e.target.checked,
    });
  };

  function clearForm() {
    setFormData({
      txtemail: "",
      txtpassword: "",
    });
  }

  const onLogin = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    let errctl = "#err-message";
    $(errctl).html("");

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btnlogin", "Signing in");
      setErrors({});
      let isapimethoderr = false;
      let sessionid = `web_${getuuid()}`;
      let objBodyParams = {
        email: formData.txtemail,
        pwd: formData.txtpassword,
        devicetypeid: AppDetails.devicetypeid,
        sessionid: sessionid,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.login}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status == 1) {
              let respData = objResponse.Data;
              loginUser(respData, formData.cbremme, sessionid);
              clearForm();
              let [decaccountid, enckey, upptid] = [0, "", 0];
              let redirectToCreateProfile = false;

              const checkParamId = new Promise(async (resolve) => {
                if (checkEmptyVal(id) == false) {
                  await aesCtrDecrypt(id).then((decId) => {
                    [decaccountid, enckey, upptid] = decId.split(":");
                    decaccountid = parseInt(decaccountid);
                    upptid = parseInt(upptid);
                    if (
                      Number.isSafeInteger(decaccountid) &&
                      !checkEmptyVal(enckey) &&
                      Number.isSafeInteger(upptid)
                    ) {
                      if (respData.AccountId == decaccountid) {
                        redirectToCreateProfile = true;
                      }
                    }
                  });
                }
                resolve("");
              });

              checkParamId.then((response) => {
                if (redirectToCreateProfile) {
                  navigate(
                    routeNames.createprofile.path.replace(
                      ":ProfileType",
                      getKeyByValue(config.userProfileTypes, upptid)
                    ),
                    { replace: true }
                  );
                } else {
                  if (respData.Profiles.length > 1) {
                    navigate(routeNames.profiles.path + "?v", {
                      replace: true,
                    });
                  } else {
                    let defaultProfile = respData.Profiles?.filter(
                      (p) => p.ProfileId == respData.DefaultProfileId
                    )?.[0];
                    navigate(
                      getPagesPathByLoggedinUserProfile(
                        defaultProfile.ProfileTypeId,
                        "profile"
                      ),
                      { replace: true }
                    );
                  }
                }
              });
            } else {
              $(errctl).html(objResponse.Data.StatusMessage);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.login}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnlogin", "Sign in", "completed");
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      {/*============== Login Form Start ==============*/}
      <div className="container-fluid login-wrapper row p-0 m-0">
        <SigninLeftPanel />

        <div className="col-md-6 d-flex align-items-center justify-content-center bg-white box-shadow">
          <div className="form-section pb-0">
            <h6 className="mb-3 down-line pb-2">Sign in to Your Account</h6>
            <form noValidate onSubmit={onLogin}>
              <div className="col mb-2">
                <InputControl
                  lblClass="mb-0 lbl-req-field"
                  name="txtemail"
                  ctlType={formCtrlTypes.email}
                  isFocus={true}
                  required={true}
                  onChange={handleChange}
                  value={formData.txtemail}
                  inputClass="rounded"
                  errors={errors}
                  formErrors={formErrors}
                  tabIndex={1}
                  ctlicon={<i className="fa fa-envelope"></i>}
                ></InputControl>
              </div>
              <div className="col mb-0">
                <InputControl
                  lblClass="mb-0 lbl-req-field"
                  name="txtpassword"
                  ctlType={formCtrlTypes.pwd}
                  required={true}
                  onChange={handleChange}
                  value={formData.txtpassword}
                  inputClass="rounded"
                  errors={errors}
                  formErrors={formErrors}
                  tabIndex={2}
                  ctlicon={<i className="fa fa-lock"></i>}
                ></InputControl>
                <Link
                  to={routeNames.forgotPwd.path}
                  className="d-flex align-items-end justify-content-end font-500 font-small"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="col mb-3">
                <div className="custom-check-box-2">
                  <input
                    className="d-none"
                    type="checkbox"
                    id="cbremme"
                    name="cbremme"
                    value={formData.cbremme}
                    checked={formData.cbremme}
                    onChange={handleRememberMeChange}
                    tabIndex={3}
                  />
                  <label htmlFor="cbremme" className="pl-20">
                    Remember me
                  </label>
                </div>
              </div>
              <div className="col mb-2">
                <button
                  className="btn btn-primary w-100 rounded"
                  name="btnlogin"
                  id="btnlogin"
                  type="submit"
                >
                  Sign in
                </button>
                <div
                  className="form-error col d-flex justify-content-center align-items-center pt-2 pb-1"
                  id="err-message"
                ></div>
                <div className="col d-flex justify-content-center align-items-center pt-2 pb-0">
                  <Link
                    to={UrlWithoutParam(routeNames.signup)}
                    className="text-dark font-400 font-general"
                  >
                    Doesn't have an account?{" "}
                    <span className="font-500 font-general text-primary">
                      Sign Up
                    </span>
                  </Link>
                </div>
              </div>
            </form>
            <div className="so-or-line mb-0">
              <span>or</span>
            </div>
            <div className="social-icons">
              <OAuthLoginPanel></OAuthLoginPanel>
            </div>
          </div>
        </div>
      </div>
      {/*============== Login Form End ==============*/}
    </>
  );
};

export default Signin;
