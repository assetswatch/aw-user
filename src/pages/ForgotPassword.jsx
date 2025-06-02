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
    navigate(UrlWithoutParam(routeNames.login));
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
          {/*============== Page title Start ==============*/}
          <PageTitle
            title="Forgot Password"
            navLinks={[{ title: "Home", url: routeNames.home.path }]}
          ></PageTitle>
          {/*============== Page title End ==============*/}

          {/*============== ForgotPassword Form Start ==============*/}
          <div className="full-row pt-4 pb-5 bg-light">
            <div className="container mb-15">
              <div className="row">
                <div className="col-xl-4 col-lg-5 mx-auto">
                  <div className="bg-white xs-p-20 p-30 border rounded shadow">
                    <div className="form-icon-left rounded form-boder">
                      <h6 className="mb-4 down-line pb-10">Forgot Password</h6>
                      <div className="row row-cols-1 g-3">
                        {!showResponse ? (
                          <>
                            <form noValidate onSubmit={onSendResetLink}>
                              <div className="col mb-15 pb-3">
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
                              </div>
                              <div className="col mb-10">
                                <button
                                  className="btn btn-primary btn-mini btn-glow shadow rounded"
                                  name="btnsendresetlink"
                                  id="btnsendresetlink"
                                  type="submit"
                                >
                                  Send Reset Link
                                </button>
                              </div>
                              <div
                                className="form-error text-left"
                                id="err-message"
                              ></div>
                            </form>
                            <div className="col d-flex flex-sb pb-40">
                              <Link
                                to={UrlWithoutParam(routeNames.login)}
                                className="text-dark"
                              >
                                <u>I already have account.</u>
                              </Link>
                              <Link
                                to={UrlWithoutParam(routeNames.register)}
                                className="text-dark"
                              >
                                <u>Don't have account?</u>
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className="d-flex flex-column align-items-center justify-content-center text-center pt-0 pb-40">
                            <div className="px-20">
                              <h6
                                className={`font-600 font-large mt-1 text-primary`}
                              >
                                Password Reset Email Sent
                              </h6>
                              <p className="text-primary pt-2">
                                Please check your email for a reset link. If you
                                don’t receive it soon, check your spam folder or
                                try again.
                              </p>
                              <div className="form-action text-center mt-40">
                                <button
                                  className="btn btn-primary btn-mini btn-glow shadow rounded"
                                  id="btnRetry"
                                  onClick={toggleShowResponse}
                                >
                                  <i className="icon icon-refresh px-0 t-2 position-relative"></i>{" "}
                                  Retry
                                </button>
                                <button
                                  className="btn btn-primary btn-mini btn-glow shadow rounded"
                                  id="btnhome"
                                  onClick={navigateToLogin}
                                >
                                  Login
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*============== ForgotPassword Form End ==============*/}
        </>
      )}
    </>
  );
};

export default ForgotPassword;
