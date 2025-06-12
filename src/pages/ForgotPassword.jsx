import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";
import { useAuth } from "../contexts/AuthContext";
import {
  GetCookieValues,
  getPagesPathByLoggedinUserProfile,
  apiReqResLoader,
  UrlWithoutParam,
  SetPageLoaderNavLinks,
} from "../utils/common";
import {
  UserCookie,
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
} from "../utils/constants";
import { formCtrlTypes } from "../utils/formvalidation";
import InputControl from "../components/common/InputControl";
import config from "../config.json";
import moment from "moment";
import { axiosPost } from "../helpers/axiosHelper";
import { Toast } from "../components/common/ToastView";
import SigninLeftPanel from "../components/common/SigninLeftPanel";

const ForgotPassword = () => {
  let $ = window.$;

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  let formErrors = {};
  const [errors, setErrors] = useState({});

  function setInitialFormData() {
    return {
      txtemail: "",
    };
  }

  const [formData, setFormData] = useState(setInitialFormData());
  const [showResponse, setshowResponse] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onSendResetLink = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    let errctl = "#err-message";
    $(errctl).html("");

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader(
        "btnsendresetlink",
        "Send Reset Link",
        API_ACTION_STATUS.START
      );
      setErrors({});
      let isapimethoderr = false;
      let objBodyParams = {
        Email: formData.txtemail,
        ExpiryUnixTime: moment().utc().add(30, "minutes").unix(),
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.sendResetPassword}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status == 1) {
              Toast.success(objResponse.Data.Message);
              setFormData(setInitialFormData());
              toggleShowResponse();
            } else {
              $(errctl).html(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.sendResetPassword}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnsendresetlink",
            "Send Reset Link",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const toggleShowResponse = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setshowResponse(!showResponse);
  };

  // const navigateToHome = () => {
  //   navigate(routeNames.home.path);
  // };

  const navigateToLogin = () => {
    navigate(UrlWithoutParam(routeNames.signin));
  };

  return (
    <>
      {isAuthenticated() == true ? (
        <Navigate
          to={getPagesPathByLoggedinUserProfile(
            GetCookieValues(UserCookie.ProfileTypeId),
            "profile"
          )}
          replace
        />
      ) : (
        <>
          {SetPageLoaderNavLinks()}
          <div className="container-fluid login-wrapper row p-0 m-0">
            <SigninLeftPanel></SigninLeftPanel>

            <div className="col-md-6 d-flex align-items-center justify-content-center bg-white box-shadow">
              {!showResponse ? (
                <div className="form-section">
                  <h6 className="mb-3 down-line pb-2">Forgot your password?</h6>
                  <form noValidate onSubmit={onSendResetLink}>
                    <div className="col mb-2">
                      <InputControl
                        lblClass="mb-0 lbl-req-field"
                        name="txtemail"
                        ctlType={formCtrlTypes.email}
                        isFocus={true}
                        required={true}
                        onChange={handleChange}
                        value={formData.txtemail}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={1}
                        ctlicon={<i className="fa fa-envelope"></i>}
                      ></InputControl>
                      <Link
                        to={UrlWithoutParam(routeNames.signin)}
                        className="d-flex align-items-end justify-content-end font-500 font-small"
                      >
                        Back to Sign In
                      </Link>
                    </div>
                    <div className="col mb-2 mt-3">
                      <button
                        className="btn btn-primary w-100 rounded"
                        name="btnsendresetlink"
                        id="btnsendresetlink"
                        type="submit"
                      >
                        Request Password Reset
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
                </div>
              ) : (
                <div className="form-section max-w-600px">
                  <h6 className="mb-3 down-line pb-2">
                    Password Reset Email Sent
                  </h6>
                  <p className="font-general font-500 pt-2">
                    A secure link to reset your password has been sent to your
                    registered email. If it doesn't arrive within a few minutes,
                    check your spam folder or resend the email.
                  </p>
                  <div className="form-action mt-30 d-flex flex-cneter">
                    <button
                      className="btn btn-primary btn-mini rounded px-15"
                      id="btnRetry"
                      onClick={toggleShowResponse}
                    >
                      <i className="icon icon-envelope t-2 position-relative me-1"></i>{" "}
                      Resend Email
                    </button>
                    <button
                      className="btn btn-primary btn-mini rounded mx-md-4"
                      id="btnhome"
                      onClick={navigateToLogin}
                    >
                      <i className="icon icon-lock t-1 position-relative me-1"></i>{" "}
                      Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ForgotPassword;
