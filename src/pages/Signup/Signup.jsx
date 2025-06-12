import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/layouts/PageTitle";
import { routeNames } from "../../routes/routes";
import { formCtrlTypes } from "../../utils/formvalidation";
import InputControl from "../../components/common/InputControl";
import {
  AppDetails,
  ApiUrls,
  AppMessages,
  UserCookie,
  API_ACTION_STATUS,
} from "../../utils/constants";
import getuuid from "../../helpers/uuidHelper";
import { axiosPost } from "../../helpers/axiosHelper";
import config from "../../config.json";
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
} from "../../utils/common";
import { useAuth } from "../../contexts/AuthContext";
import OAuthLoginPanel from "../../oauth/OAuthLoginPanel";
import SigninLeftPanel from "../../components/common/SigninLeftPanel";

const Signup = () => {
  let $ = window.$;

  const navigate = useNavigate();
  let formErrors = {};

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    txtemail: "",
  });

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onContinue = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();
    let errctl = "#err-message";
    $(errctl).html("");

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btncontinue", "Continue", API_ACTION_STATUS.START);
      setErrors({});
      let isapimethoderr = false;
      let sessionid = `web_${getuuid()}`;
      let objBodyParams = {
        email: formData.txtemail,
      };

      //   axiosPost(`${config.apiBaseUrl}${ApiUrls.login}`, objBodyParams)
      //     .then((response) => {
      //       let objResponse = response.data;
      //       if (objResponse.StatusCode === 200) {
      //         if (objResponse.Data.Status == 1) {
      //           let respData = objResponse.Data;
      //           clearForm();
      //         } else {
      //           $(errctl).html(objResponse.Data.StatusMessage);
      //         }
      //       } else {
      //         isapimethoderr = true;
      //       }
      //     })
      //     .catch((err) => {
      //       isapimethoderr = true;
      //       console.error(`"API :: ${ApiUrls.login}, Error ::" ${err}`);
      //     })
      //     .finally(() => {
      //       if (isapimethoderr == true) {
      //         $(errctl).html(AppMessages.SomeProblem);
      //       }
      //       apiReqResLoader("btnlogin", "Sign in", "completed");
      //     });
      setTimeout(() => {
        apiReqResLoader("btncontinue", "Continue", API_ACTION_STATUS.COMPLETED);
        navigate(routeNames.supaccountinfo.path);
      }, 500);
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="container-fluid login-wrapper row p-0 m-0">
        <SigninLeftPanel></SigninLeftPanel>

        <div className="col-md-6 d-flex align-items-center justify-content-center bg-white box-shadow">
          <div className="form-section">
            <h6 className="mb-3 down-line pb-2">Sign up for a New Account</h6>
            <form noValidate onSubmit={onContinue}>
              <div className="col mb-4">
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
              <div className="col mb-2">
                <button
                  className="btn btn-primary w-100 rounded d-flex flex-sb"
                  type="submit"
                >
                  <span
                    className="flex-center flex-grow-1"
                    name="btncontinue"
                    id="btncontinue"
                  >
                    Continue
                  </span>
                  <span className="flex-end position-relative me-2 t-2">
                    <i className="icons icon-arrow-right-circle" />
                  </span>
                </button>
                <div
                  className="form-error col d-flex justify-content-center align-items-center pt-2 pb-1"
                  id="err-message"
                ></div>
                <div className="col d-flex justify-content-center align-items-center pt-2 pb-0">
                  <Link
                    to={UrlWithoutParam(routeNames.signin)}
                    className="text-dark font-400 font-general"
                  >
                    Already have an account?{" "}
                    <span className="font-500 font-general text-primary">
                      Sign In
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
    </>
  );
};

export default Signup;
