import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";
import { useAuth } from "../contexts/AuthContext";
import {
  aesCtrDecrypt,
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  UrlWithoutParam,
} from "../utils/common";
import { API_ACTION_STATUS, ApiUrls, AppMessages } from "../utils/constants";
import InputControl from "../components/common/InputControl";
import { formCtrlTypes } from "../utils/formvalidation";
import config from "../config.json";
import moment from "moment";
import { axiosPost } from "../helpers/axiosHelper";
import { Toast } from "../components/common/ToastView";

const ResetPassword = () => {
  let $ = window.$;

  const { logoutUser } = useAuth();

  const navigate = useNavigate();

  const { id } = useParams();

  const [accountId, setAccountId] = useState(0);

  const checkParams = (decaccid, encKey, expiryDate, decId) => {
    return (
      checkEmptyVal(decId) ||
      checkEmptyVal(encKey) ||
      !moment.unix(expiryDate).isValid() ||
      moment().utc().unix() > expiryDate ||
      decaccid == 0
    );
  };

  useEffect(() => {
    logoutUser();
    if (checkEmptyVal(id) == true) {
      navigateToLogin();
    } else {
      aesCtrDecrypt(id).then((decId) => {
        let [decaccountid, enckey, expiryDate] = decId.split(":");
        decaccountid = parseInt(decaccountid);
        if (!checkParams(decaccountid, enckey, expiryDate, decId)) {
          Toast.error(AppMessages.PasswordResetLinkExpired);
          navigateToForgotPassword();
        } else {
          setAccountId(decaccountid);
          getUserAccountDetails(decaccountid);
        }
      });
    }
  }, []);

  const getUserAccountDetails = (accountid) => {
    if (Number.isSafeInteger(accountid)) {
      let isapimethoderr = false;
      let objParams = {
        AccountId: accountid,
      };
      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getUserAccountDetails}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (
            objResponse.StatusCode === 200 &&
            checkObjNullorEmpty(objResponse.Data) == false
          ) {
          } else {
            Toast.error(AppMessages.AccountDetailsNotFound);
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          Toast.error(err);
          console.error(
            `"API :: ${ApiUrls.getUserAccountDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr === true) {
            navigateToLogin();
          }
        });
    } else {
      navigateToLogin();
    }
  };

  let formErrors = {};
  const [errors, setErrors] = useState({});

  function setInitialFormData() {
    return {
      txtpassword: "",
      txtconfirmpassword: "",
    };
  }

  const [formData, setFormData] = useState(setInitialFormData());

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onReset = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    aesCtrDecrypt(id).then((decId) => {
      let [decaccountid, enckey, expiryDate] = decId.split(":");
      decaccountid = parseInt(decaccountid);
      if (!checkParams(decaccountid, enckey, expiryDate, decId)) {
        Toast.error(AppMessages.PasswordResetLinkExpired);
        navigateToForgotPassword();
      } else {
        let errctl = "#err-message";
        $(errctl).html("");

        if (Object.keys(formErrors).length === 0) {
          apiReqResLoader(
            "btnresetpwd",
            "Reset Password",
            API_ACTION_STATUS.START
          );
          setErrors({});
          let isapimethoderr = false;
          let objBodyParams = {
            AccountId: accountId,
            pwd: formData.txtpassword,
          };

          axiosPost(
            `${config.apiBaseUrl}${ApiUrls.resetPassword}`,
            objBodyParams
          )
            .then((response) => {
              let objResponse = response.data;
              if (objResponse.StatusCode === 200) {
                if (objResponse.Data.Status == 1) {
                  Toast.success(objResponse.Data.Message);
                  navigateToLogin();
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
                `"API :: ${ApiUrls.resetPassword}, Error ::" ${err}`
              );
            })
            .finally(() => {
              if (isapimethoderr == true) {
                $(errctl).html(AppMessages.SomeProblem);
              }
              setFormData(setInitialFormData());
              apiReqResLoader(
                "btnresetpwd",
                "Reset Password",
                API_ACTION_STATUS.COMPLETED
              );
            });
        } else {
          $(`[name=${Object.keys(formErrors)[0]}]`).focus();
          setErrors(formErrors);
        }
      }
    });
  };

  const navigateToLogin = () => {
    navigate(UrlWithoutParam(routeNames.login), { replace: true });
  };

  const navigateToForgotPassword = () => {
    navigate(routeNames.forgotPwd.path, { replace: true });
  };

  return (
    <>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Reset Password"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== ResetPassword Form Start ==============*/}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row">
            <div className="col-xl-5 col-lg-6 mx-auto">
              <div className="bg-white xs-p-20 p-30 border rounded shadow">
                <div className="form-icon-left rounded form-boder">
                  <h4 className="mb-4 down-line pb-10">Reset Password</h4>
                  <div className="row row-cols-1 g-3">
                    <form noValidate onSubmit={onReset}>
                      <div className="col mb-15">
                        <InputControl
                          lblClass="mb-0 lbl-req-field"
                          name="txtpassword"
                          ctlType={formCtrlTypes.pwd}
                          required={true}
                          onChange={handleChange}
                          value={formData.txtpassword}
                          errors={errors}
                          formErrors={formErrors}
                          tabIndex={1}
                          ctlicon={<i className="fa fa-lock"></i>}
                        ></InputControl>
                      </div>
                      <div className="col mb-20 pb-1">
                        <InputControl
                          lblClass="mb-0 lbl-req-field"
                          name="txtconfirmpassword"
                          ctlType={formCtrlTypes.confirmpwd}
                          required={true}
                          onChange={handleChange}
                          value={formData.txtconfirmpassword}
                          pwdVal={formData.txtpassword}
                          errors={errors}
                          formErrors={formErrors}
                          objProps={{ pwdVal: formData.txtpassword }}
                          tabIndex={2}
                          ctlicon={<i className="fa fa-lock"></i>}
                        ></InputControl>
                      </div>
                      <div className="col mb-10">
                        <button
                          className="btn btn-primary box-shadow"
                          name="btnresetpwd"
                          id="btnresetpwd"
                          type="submit"
                        >
                          Reset Password
                        </button>
                      </div>
                      <div
                        className="form-error text-left"
                        id="err-message"
                      ></div>
                    </form>
                    <div className="col d-flex flex-sb pb-20">
                      <Link
                        to={UrlWithoutParam(routeNames.login)}
                        replace={true}
                        className="text-dark"
                      >
                        <u>I already have account.</u>
                      </Link>
                      <Link
                        to={UrlWithoutParam(routeNames.register)}
                        replace={true}
                        className="text-dark"
                      >
                        <u>Don't have account?</u>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*============== ResetPassword Form End ==============*/}
    </>
  );
};

export default ResetPassword;
