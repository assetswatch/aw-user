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
  setProfileDescText,
  setUserAccountTypeDescText,
  UrlWithoutParam,
} from "../../utils/common";
import { useAuth } from "../../contexts/AuthContext";
import OAuthLoginPanel from "../../oauth/OAuthLoginPanel";

const ProfileType = () => {
  let $ = window.$;

  const navigate = useNavigate();
  let formErrors = {};

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    rblprofiletype: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProfileTypeChange = (e) => {
    setFormData({
      ...formData,
      ["rblprofiletype"]: e?.currentTarget.getAttribute("value"),
    });

    onContinue(e);
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
      setTimeout(() => {
        apiReqResLoader("btncontinue", "Continue", API_ACTION_STATUS.COMPLETED);
        navigate(routeNames.supservices.path);
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
        <div className="col-md-6 d-none d-md-flex left-panel justify-content-start mt-20">
          <div>
            <div className="mb-30">
              <h5>Welcome Back!</h5>
              <p className="text-muted mb-0">
                Log in to manage your properties, track leads, and connect with
                buyers and sellers.
              </p>
            </div>

            <div className="feature-item">
              <i className="fa fa-home font-1dot8rem me-3"></i>
              <div>
                <h6 className="mb-1 fw-semibold">Property Maintenance</h6>
                <p className="mb-0">
                  Track repairs, schedule maintenance, and manage vendors
                  easily.
                </p>
              </div>
            </div>
            <div className="feature-item">
              <i className="fa fa-credit-card font-1dot8rem me-3"></i>
              <div>
                <h6 className="mb-1 fw-semibold">Electronic Payments</h6>
                <p className="mb-0">
                  Accept online rent securely with reminders and instant
                  receipts.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <i className="fa fa-file-signature font-1dot8rem me-3"></i>
              <div>
                <h5 className="mb-1 fw-semibold">Electronic Agreements</h5>
                <p className="mb-0">
                  Generate, sign, and store rental agreements securely online —
                  no paperwork required.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <i className="fa fa-bullseye font-1dot8rem me-3"></i>
              <div>
                <h6 className="mb-1 fw-semibold">Background Verification</h6>
                <p className="mb-0">
                  Run checks on tenants with built-in BGV tools and ID
                  validation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 d-flex align-items-center justify-content-center bg-white box-shadow">
          <div className="form-section max-w-700px">
            <h6 className="mb-3 down-line pb-2">
              Pick the Right Profile for You
            </h6>
            <div className="bg-white xs-p -20 pb-20">
              <div className="row row-cols-xl-3 pt-20 row-cols-1 g-4 f lex-center">
                <div
                  className="col cur-pointer"
                  data-iscat={false}
                  value={config.userProfileTypes.Owner}
                  onClick={(e) => {
                    handleProfileTypeChange(e);
                  }}
                >
                  <div className="text-center px-4 py-20 bg-li-hover-color hoverbo1bg-primary rounded-2rem hover-shadow bo2-transparent transition2sl">
                    <div>
                      <i className="fa fa-user-circle text-primary font-size-60" />
                    </div>
                    <div className="mt-3">
                      <span className="transation font-500 text-primary">
                        <a>Owner</a>
                      </span>
                      <p className="transation font-small font-500 lh-22">
                        {setProfileDescText(config.userProfileTypes.Owner)}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="col cur-pointer"
                  data-iscat={true}
                  value={config.userProfileTypes.Agent}
                  onClick={(e) => {
                    handleProfileTypeChange(e);
                  }}
                >
                  <div className="text-center px-4 py-20 bg-li-hover-color hoverbo1bg-primary rounded-2rem hover-shadow bo2-transparent transition2sl">
                    <div>
                      <i className="fa fa-user-circle text-primary font-size-60" />
                    </div>
                    <div className="mt-3">
                      <span className="transation font-500 text-primary">
                        <a>Agent</a>
                      </span>
                      <p className="transation font-small font-500 lh-22">
                        {setProfileDescText(config.userProfileTypes.Agent)}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="col cur-pointer"
                  data-iscat={true}
                  value={config.userProfileTypes.Tenant}
                  onClick={(e) => {
                    handleProfileTypeChange(e);
                  }}
                >
                  <div className="text-center px-4 py-20 bg-li-hover-color hoverbo1bg-primary rounded-2rem hover-shadow bo2-transparent transition2sl">
                    <div>
                      <i className="fa fa-user-circle text-primary font-size-60" />
                    </div>
                    <div className="mt-3">
                      <span className="transation font-500 text-primary">
                        <a>Tenant</a>
                      </span>
                      <p className="transation font-small font-500 lh-22">
                        {setProfileDescText(config.userProfileTypes.Tenant)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="form-error col d-flex justify-content-center align-items-center py-2"
              id="err-message"
            ></div>
            <div className="col-12 mt-40 mb-20 d-flex flex-center">
              <button
                className="btn btn-primary btn-mini w-200px rounded d-flex flex-sb"
                type="submit"
              >
                <span
                  className="flex-center flex-grow-1"
                  name="btncontinue"
                  id="btncontinue"
                  onClick={onContinue}
                >
                  Continue
                </span>
                <span className="flex-end position-relative me-2 t-2">
                  <i className="icons icon-arrow-right-circle" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileType;
