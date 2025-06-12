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
import AsyncSelect from "../../components/common/AsyncSelect";

const AccountInformation = () => {
  let $ = window.$;

  const navigate = useNavigate();
  let formErrors = {};

  const [errors, setErrors] = useState({});
  const [countriesData, setCountriesData] = useState([]);
  const [countrySelected, setCountrySelected] = useState(null);

  const [statesData, setStatesData] = useState([]);
  const [stateSelected, setStateSelected] = useState(null);

  const [citiesData, setCitiesData] = useState([]);
  const [citySelected, setCitySelected] = useState(null);

  const [profileTypes, setProfileTypes] = useState([]);
  const [initApisLoaded, setinitApisLoaded] = useState(false);

  const [profileCatData, setProfileCatData] = useState([]);
  const [selectedProfileCatId, setSelectedProfileCatId] = useState(null);

  const [formData, setFormData] = useState(setInitialFormData());

  useEffect(() => {
    Promise.allSettled([getCountries()]).then(() => {
      setinitApisLoaded(true);
    });
  }, []);

  //Get countries.
  const getCountries = () => {
    return axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlCountries}`, {})
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          setCountriesData(objResponse.Data);
        } else {
          setCountriesData([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlCountries}, Error ::" ${err}`);
        setCountriesData([]);
      })
      .finally(() => {
        setCountrySelected({});
      });
  };

  //Get States.
  const getStates = (countryid) => {
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlStates}`, {
      CountryId: parseInt(countryid),
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setStatesData(objResponse.Data);
        } else {
          setStatesData([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlStates}, Error ::" ${err}`);
        setStatesData([]);
      })
      .finally(() => {
        setStateSelected({});
      });
  };

  //Get cities.
  const getCities = (stateid) => {
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlCities}`, {
      StateId: parseInt(stateid),
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setCitiesData(objResponse.Data);
        } else {
          setCitiesData([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlCities}, Error ::" ${err}`);
        setCitiesData([]);
      })
      .finally(() => {
        setCitySelected({});
      });
  };

  const handleCountryChange = (selItem) => {
    setStateSelected(null);
    setStatesData([]);
    setCitySelected(null);
    setCitiesData([]);

    setCountrySelected(selItem);

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }

    getStates(selItem?.value);
  };

  const handleStateChange = (selItem) => {
    setCitySelected(null);
    setCitiesData([]);

    setStateSelected(selItem);

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }

    getCities(selItem?.value);
  };

  const handleCityChange = (selItem) => {
    setCitySelected(selItem);
  };

  function setInitialFormData() {
    return {
      txtemail: "",
      txtfirstname: "",
      txtlastname: "",
      txtmobile: "",
      txtlandline: "",
      txtzip: "",
      txtpassword: "",
      txtconfirmpassword: "",
      txtcompanyname: "",
      txtwebsite: "",
      txtaddressone: "",
      txtaddresstwo: "",
      rblprofiletype: 0,
      cbagreeterms: false,
    };
  }

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTermsChange = (e) => {
    setFormData({
      ...formData,
      ["cbagreeterms"]: e.target.checked,
    });
  };

  const onRegister = (e) => {
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
        navigate(routeNames.supaccounttype.path);
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
            <h6 className="mb-4 down-line pb-2">Set up Your Account</h6>
            <form noValidate onSubmit={onRegister}>
              <div className="row">
                <div className="col-12 mb-1">
                  <h6 className="mb-2 down-line pb-2">Login Information</h6>
                </div>
                <div className="col-xl-6 mb-15">
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
                  ></InputControl>
                </div>
                <div className="col-xl-6 mb-15">
                  <InputControl
                    lblClass="mb-0 lbl-req-field"
                    name="txtpassword"
                    ctlType={formCtrlTypes.pwd}
                    required={true}
                    onChange={handleChange}
                    value={formData.txtpassword}
                    errors={errors}
                    formErrors={formErrors}
                    tabIndex={3}
                  ></InputControl>
                </div>
                <div className="col-xl-6 mb-15">
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
                    tabIndex={4}
                  ></InputControl>
                </div>
                <div className="col-12 mb-1 mt-10">
                  <h6 className="mb-2 down-line pb-2">Contact Information</h6>
                </div>
                <div className="col-xl-6 mb-15">
                  <InputControl
                    lblClass="mb-0 lbl-req-field"
                    name="txtfirstname"
                    ctlType={formCtrlTypes.fname}
                    required={true}
                    onChange={handleChange}
                    value={formData.txtfirstname}
                    errors={errors}
                    formErrors={formErrors}
                    tabIndex={5}
                  ></InputControl>
                </div>
                <div className="col-xl-6 mb-15">
                  <InputControl
                    lblClass="mb-0 lbl-req-field"
                    name="txtlastname"
                    ctlType={formCtrlTypes.lname}
                    required={true}
                    onChange={handleChange}
                    value={formData.txtlastname}
                    errors={errors}
                    formErrors={formErrors}
                    tabIndex={6}
                  ></InputControl>
                </div>
                <div className="col-xl-6 mb-15">
                  <InputControl
                    lblClass="mb-0 lbl-req-field"
                    name="txtmobile"
                    ctlType={formCtrlTypes.mobile}
                    required={true}
                    onChange={handleChange}
                    value={formData.txtmobile}
                    errors={errors}
                    formErrors={formErrors}
                    tabIndex={7}
                  ></InputControl>
                </div>
                <div className="col-xl-6 mb-15">
                  <InputControl
                    lblClass="mb-0"
                    name="txtlandline"
                    ctlType={formCtrlTypes.landline}
                    onChange={handleChange}
                    value={formData.txtlandline}
                    errors={errors}
                    formErrors={formErrors}
                    tabIndex={8}
                  ></InputControl>
                </div>
                <div className="col-xl-6 mb-15">
                  <InputControl
                    lblClass="mb-0"
                    name="txtcompanyname"
                    ctlType={formCtrlTypes.companyname}
                    required={false}
                    onChange={handleChange}
                    value={formData.txtcompanyname}
                    errors={errors}
                    formErrors={formErrors}
                    tabIndex={9}
                  ></InputControl>
                </div>
                <div className="col-xl-6 mb-15">
                  <InputControl
                    lblClass="mb-0"
                    name="txtwebsite"
                    ctlType={formCtrlTypes.website}
                    required={false}
                    onChange={handleChange}
                    value={formData.txtwebsite}
                    errors={errors}
                    formErrors={formErrors}
                    tabIndex={10}
                  ></InputControl>
                </div>
                <div className="col-xl-6 mb-15">
                  <InputControl
                    lblClass="mb-0 lbl-req-field"
                    name="txtaddressone"
                    ctlType={formCtrlTypes.addressone}
                    required={true}
                    onChange={handleChange}
                    value={formData.txtaddressone}
                    errors={errors}
                    formErrors={formErrors}
                    tabIndex={11}
                  ></InputControl>
                </div>
                <div className="col-xl-6 mb-15">
                  <InputControl
                    lblClass="mb-0"
                    name="txtaddresstwo"
                    ctlType={formCtrlTypes.addresstwo}
                    required={false}
                    onChange={handleChange}
                    value={formData.txtaddresstwo}
                    errors={errors}
                    formErrors={formErrors}
                    tabIndex={12}
                  ></InputControl>
                </div>
                {initApisLoaded && (
                  <>
                    <div className="col-xl-6 mb-15">
                      <AsyncSelect
                        placeHolder={
                          countriesData.length <= 0 && countrySelected == null
                            ? AppMessages.DdLLoading
                            : AppMessages.DdlDefaultSelect
                        }
                        noData={
                          countriesData.length <= 0 && countrySelected == null
                            ? AppMessages.DdLLoading
                            : AppMessages.NoCountries
                        }
                        options={countriesData}
                        onChange={handleCountryChange}
                        value={countrySelected}
                        name="ddlcountries"
                        lbl={formCtrlTypes.country}
                        lblClass="mb-0 lbl-req-field"
                        required={true}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={13}
                      ></AsyncSelect>
                    </div>
                    <div className="col-xl-6 mb-15">
                      <AsyncSelect
                        placeHolder={
                          countrySelected == null ||
                          Object.keys(countrySelected).length === 0
                            ? AppMessages.DdlDefaultSelect
                            : statesData.length <= 0 && stateSelected == null
                            ? AppMessages.DdLLoading
                            : AppMessages.DdlDefaultSelect
                        }
                        noData={
                          countrySelected == null ||
                          Object.keys(countrySelected).length === 0
                            ? AppMessages.NoStates
                            : statesData.length <= 0 &&
                              stateSelected == null &&
                              countrySelected != null
                            ? AppMessages.DdLLoading
                            : AppMessages.NoStates
                        }
                        options={statesData}
                        onChange={handleStateChange}
                        value={stateSelected}
                        name="ddlstates"
                        lbl={formCtrlTypes.state}
                        lblClass="mb-0 lbl-req-field"
                        required={true}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={14}
                      ></AsyncSelect>
                    </div>
                    <div className="col-xl-6 mb-15">
                      <AsyncSelect
                        placeHolder={
                          stateSelected == null ||
                          Object.keys(stateSelected).length === 0
                            ? AppMessages.DdlDefaultSelect
                            : citiesData.length <= 0 && citySelected == null
                            ? AppMessages.DdLLoading
                            : AppMessages.DdlDefaultSelect
                        }
                        noData={
                          stateSelected == null ||
                          Object.keys(stateSelected).length === 0
                            ? AppMessages.NoCities
                            : citiesData.length <= 0 &&
                              citySelected == null &&
                              stateSelected != null
                            ? AppMessages.DdLLoading
                            : AppMessages.NoCities
                        }
                        options={citiesData}
                        onChange={handleCityChange}
                        value={citySelected}
                        name="ddlcities"
                        lbl={formCtrlTypes.city}
                        lblClass="mb-0 lbl-req-field"
                        required={true}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={15}
                      ></AsyncSelect>
                    </div>
                  </>
                )}
                <div className="col-xl-6 mb-15">
                  <InputControl
                    lblClass="mb-0 lbl-req-field"
                    name="txtzip"
                    ctlType={formCtrlTypes.zip}
                    required={true}
                    onChange={handleChange}
                    value={formData.txtzip}
                    errors={errors}
                    formErrors={formErrors}
                    tabIndex={16}
                  ></InputControl>
                </div>
                <div className="col-12 mb-20">
                  <div className="custom-check-box-2">
                    <input
                      className="d-none"
                      type="checkbox"
                      id="cbagreeterms"
                      name="cbagreeterms"
                      value={formData.cbagreeterms}
                      onChange={handleTermsChange}
                      tabIndex={17}
                    />
                    <label htmlFor="cbagreeterms" className="font-small">
                      I Agree to AssetsWatch Terms of use i would like to
                      receive property related communication through Email, call
                      or SMS.
                    </label>
                    {errors?.["cbagreeterms"] && (
                      <div className="err-invalid">
                        {errors?.["cbagreeterms"]}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="form-error col d-flex justify-content-center align-items-center"
                  id="err-message"
                ></div>
                <div className="col-12 mb-20 d-flex flex-end">
                  <button
                    className="btn btn-primary btn-mini w-150px rounded d-flex flex-sb"
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
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountInformation;
