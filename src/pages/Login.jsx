import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";
import { formCtrlTypes } from "../utils/formvalidation";
import InputControl from "../components/common/InputControl";
import { AppDetails, ApiUrls, AppMessages } from "../utils/constants";
import getuuid from "../helpers/uuidHelper";
import { axiosPost } from "../helpers/axiosHelper";
import config from "../config.json";
import { apiReqResLoader } from "../utils/common";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  let $ = window.$;

  const { isAuthenticated } = useAuth();
  let formErrors = {};

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    txtemail: "",
    txtpassword: "",
    cbremme: true,
  });

  const navigate = useNavigate();
  const { loginUser } = useAuth();

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
              if (respData.Profiles.length > 1) {
                navigate(routeNames.profiles.path, { replace: true });
              } else {
                navigate(routeNames.dashboard.path, { replace: true });
              }
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
      {isAuthenticated() == true ? (
        <Navigate to={routeNames.dashboard.path} replace />
      ) : (
        <>
          {/*============== Page title Start ==============*/}
          <PageTitle
            title="Login"
            navLinks={[{ title: "Home", url: routeNames.home.path }]}
          ></PageTitle>
          {/*============== Page title End ==============*/}

          {/*============== Login Form Start ==============*/}
          <div className="full-row  bg-light">
            <div className="container">
              <div className="row">
                <div className="col-xl-5 col-lg-6 mx-auto">
                  <div className="bg-white xs-p-20 p-30 border rounded shadow">
                    <div className="form-icon-left rounded form-boder">
                      <h4 className="mb-4 down-line">User Login</h4>
                      <div className="row row-cols-1 g-3">
                        <form noValidate onSubmit={onLogin}>
                          <div className="col mb-15">
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
                              tabIndex={2}
                              ctlicon={<i className="fa fa-lock"></i>}
                            ></InputControl>
                          </div>
                          <div className="col mb-20">
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
                              <label htmlFor="cbremme">Remember me</label>
                            </div>
                          </div>
                          <div className="col mb-10">
                            <button
                              className="btn btn-primary box-shadow"
                              name="btnlogin"
                              id="btnlogin"
                              type="submit"
                            >
                              Sign in
                            </button>
                          </div>
                          <div
                            className="form-error text-left"
                            id="err-message"
                          ></div>
                        </form>
                        <div className="col d-flex flex-sb">
                          <Link
                            to={routeNames.forgotPwd.path}
                            className="text-dark"
                          >
                            <u>Forgot Password</u>
                          </Link>
                          <Link
                            to={routeNames.register.path}
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
          {/*============== Login Form End ==============*/}
        </>
      )}
    </>
  );
};

export default Login;
