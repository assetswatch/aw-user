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

const Services = () => {
  let $ = window.$;

  const navigate = useNavigate();
  let formErrors = {};

  const [errors, setErrors] = useState({});

  const [profileCatData, setProfileCatData] = useState([]);
  const [selectedCatIds, setSelectedCatIds] = useState([]);

  const handleChange = (e) => {
    const id = parseInt(e?.target?.value);
    setSelectedCatIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    getProfileCategories();
  }, []);

  const getProfileCategories = () => {
    setProfileCatData([]);
    let profileTypeId = config.userProfileTypes.Agent;
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getProfileCategories}`, {
      ProfileTypeId: profileTypeId,
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data?.length > 0) {
            setProfileCatData(objResponse.Data);
          } else {
            setProfileCatData([]);
          }
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getProfileCategories}, Error ::" ${err}`
        );
        setProfileCatData([]);
      })
      .finally(() => {
        apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
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

      setTimeout(() => {
        apiReqResLoader("btncontinue", "Continue", API_ACTION_STATUS.COMPLETED);
        navigate(routeNames.supbusinessinfo.path);
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
            <h6 className="mb-3 down-line pb-2">What Services Do You Offer?</h6>
            <div className="bg-white xs-p -20 pb-20">
              <div className="row row-cols-lg-3 pt-20 row-cols-1 g-4 f lex-center">
                {profileCatData &&
                  profileCatData?.map((p) => {
                    return (
                      <div className="col" key={`pc-k-${p.Id}`}>
                        <div className="custom-check-box-2">
                          <input
                            className="d-none"
                            type="checkbox"
                            id={`cb-cat-${p.Id}`}
                            name="cbcategories"
                            value={p.Id}
                            checked={selectedCatIds.includes(p.Id)}
                            onChange={handleChange}
                          />
                          <label
                            htmlFor={`cb-cat-${p.Id}`}
                            className="font-small font-500"
                          >
                            {p.Text}
                          </label>
                        </div>
                      </div>
                    );
                  })}
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
                  Complete & Sign In
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Services;
