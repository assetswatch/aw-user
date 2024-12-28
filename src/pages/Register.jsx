import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { routeNames } from "../routes/routes";
import {
  ApiUrls,
  AppDetails,
  AppMessages,
  ValidationMessages,
} from "../utils/constants";
import { formCtrlTypes } from "../utils/formvalidation";
import {
  apiReqResLoader,
  showHideCtrl,
  stringToBool,
  setSelectDefaultVal,
  checkObjNullorEmpty,
  checkEmptyVal,
} from "../utils/common";
import config from "../config.json";
import { axiosPost, axiosGet } from "../helpers/axiosHelper";
import AsyncSelect from "../components/common/AsyncSelect";
import PageTitle from "../components/layouts/PageTitle";
import InputControl from "../components/common/InputControl";
import { useAuth } from "../contexts/AuthContext";
import getuuid from "../helpers/uuidHelper";
import TextAreaControl from "../components/common/TextAreaControl";

const Register = () => {
  let $ = window.$;

  const { isAuthenticated, loginUser } = useAuth();
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

  //Load
  useEffect(() => {
    Promise.allSettled([getProfileTypes(), getCountries()]).then(() => {
      setinitApisLoaded(true);
    });
  }, []);

  //Get profile types.
  const getProfileTypes = () => {
    return axiosGet(`${config.apiBaseUrl}${ApiUrls.getProfileTypes}`)
      .then((response) => {
        let objProfileTypesResponse = response.data;
        if (objProfileTypesResponse.StatusCode === 200) {
          setProfileTypes(objProfileTypesResponse.Data);
        } else {
          setProfileTypes([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getProfileTypes}, Error ::" ${err}`);
        setProfileTypes([]);
      });
  };

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

  const getProfileCategories = (e) => {
    setSelectedProfileCatId(null);
    setProfileCatData([]);
    let profileTypeId = parseInt(e.target.value);
    let iscatavailable = stringToBool(e.target.attributes["data-iscat"].value);
    let divctrl = "divprofilecategory";
    showHideCtrl(divctrl, !iscatavailable);
    if (iscatavailable) {
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getProfileCategories}`, {
        ProfileTypeId: profileTypeId,
      })
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data?.length > 0) {
              setProfileCatData(objResponse.Data);
              setSelectedProfileCatId(objResponse.Data[0].Id);
            } else {
              setProfileCatData([]);
              setSelectedProfileCatId(null);
            }
          } else {
            setSelectedProfileCatId(null);
          }
        })
        .catch((err) => {
          console.error(
            `"API :: ${ApiUrls.getProfileCategories}, Error ::" ${err}`
          );
          setSelectedProfileCatId(null);
        })
        .finally(() => {});
    }
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

  const [formData, setFormData] = useState(setInitialFormData());

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProifleCatChange = (e) => {
    setSelectedProfileCatId(e?.value);
  };

  const handleTermsChange = (e) => {
    setFormData({
      ...formData,
      ["cbagreeterms"]: e.target.checked,
    });
  };

  function clearForm() {
    setFormData(setInitialFormData());
    setCountrySelected(null);
    setStateSelected(null);
    setCitySelected(null);
    setSelectedProfileCatId(null);
    $(".form-error").html("");
  }

  const register = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();

    if (parseInt(formData.rblprofiletype) == 0) {
      formErrors["rblprofiletype"] = ValidationMessages.ProfiletypeReq;
    }

    if (checkObjNullorEmpty(countrySelected)) {
      formErrors["ddlcountries"] = ValidationMessages.CountryReq;
    }

    if (checkObjNullorEmpty(stateSelected)) {
      formErrors["ddlstates"] = ValidationMessages.StateReq;
    }

    if (checkObjNullorEmpty(citySelected)) {
      formErrors["ddlcities"] = ValidationMessages.CityReq;
    }

    if (
      checkEmptyVal(selectedProfileCatId) &&
      !$("#divprofilecategory").css("display") == "none"
    ) {
      formErrors["ddlprofilecategory"] = ValidationMessages.CategoryReq;
    } else {
      delete formErrors["ddlprofilecategory"];
    }

    if (!formData.cbagreeterms) {
      formErrors["cbagreeterms"] = ValidationMessages.TermsReq;
    } else {
      delete formErrors["cbagreeterms"];
    }

    // if (Object.keys(formErrors).length === 0) {
    //   apiReqResLoader("btnregister", "Registering");
    //   let errctl = ".form-error";
    //   $(errctl).html("");
    //   setErrors({});
    //   let isapimethoderr = false;
    //   let sessionid = `web_${getuuid()}`;
    //   let objBodyParams = {
    //     email: formData.txtemail,
    //     pwd: formData.txtpassword,
    //     firstName: formData.txtfirstname,
    //     lastName: formData.txtlastname,
    //     mobile: formData.txtmobile,
    //     landLine: formData.txtlandline,
    //     addressOne: formData.txtaddressone,
    //     addressTwo: formData.txtaddresstwo,
    //     countryId: parseInt(setSelectDefaultVal(countrySelected)),
    //     stateId: parseInt(setSelectDefaultVal(stateSelected)),
    //     cityId: parseInt(setSelectDefaultVal(citySelected)),
    //     zip: formData.txtzip,
    //     profileTypeId: parseInt(formData.rblprofiletype),
    //     profileCategoryId: parseInt(setSelectDefaultVal(selectedProfileCatId)),
    //     planId: 1,
    //     CompanyName: formData.txtcompanyname,
    //     Website: formData.txtwebsite,
    //     ProfilePic: "",
    //     DeviceTypeId: AppDetails.devicetypeid,
    //     SessionId: sessionid,
    //   };

    //   axiosPost(`${config.apiBaseUrl}${ApiUrls.registerUser}`, objBodyParams)
    //     .then((response) => {
    //       let objResponse = response.data;
    //       if (objResponse.StatusCode === 200) {
    //         let respData = objResponse.Data;
    //         if (!checkObjNullorEmpty(respData) && respData?.AccountId > 0) {
    //           loginUser(respData, formData.cbremme, sessionid);
    //           clearForm();
    //           navigate(routeNames.upgradeplan.path, { replace: true });
    //         } else {
    //           $(errctl).html(objResponse.Data.Message);
    //         }
    //       } else {
    //         isapimethoderr = true;
    //       }
    //     })
    //     .catch((err) => {
    //       isapimethoderr = true;
    //       console.error(`"API :: ${ApiUrls.registerUser}, Error ::" ${err}`);
    //     })
    //     .finally(() => {
    //       if (isapimethoderr == true) {
    //         $(errctl).html(AppMessages.SomeProblem);
    //       }
    //       apiReqResLoader("btnregister", "Register", "completed");
    //     });
    // } else {
    //   $(`[name=${Object.keys(formErrors)[0]}]`).focus();
    //   setErrors(formErrors);
    // }
  };

  return (
    <>
      {isAuthenticated() == true ? (
        <Navigate to={routeNames.dashboard.path} replace />
      ) : (
        <>
          {/*============== Page title Start ==============*/}
          <PageTitle
            title="Register"
            navLinks={[{ title: "Home", url: routeNames.home.path }]}
          ></PageTitle>
          {/*============== Page title End ==============*/}

          {/*============== Register Form Start ==============*/}
          <div className="full-row  bg-light">
            <div className="container">
              <div className="row">
                <div className="col-xl-8 col-lg-10 mx-auto">
                  <div className="bg-white xs-p-20 p-30 border rounded shadow">
                    <div className="form-icon-left rounded form-boder">
                      <h4 className="mb-4 down-line">Create New Account</h4>
                      <form noValidate onSubmit={register}>
                        <div className="row">
                          <div className="col-md-12 mb-20 mt-10">
                            <h5 className="down-line">Login Information</h5>
                          </div>
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-12 mb-20 mt-20">
                            <h5 className="down-line">Contact Information</h5>
                          </div>
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-6 mb-15">
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
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    countriesData.length <= 0 &&
                                    countrySelected == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
                                  }
                                  noData={
                                    countriesData.length <= 0 &&
                                    countrySelected == null
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
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    countrySelected == null ||
                                    Object.keys(countrySelected).length === 0
                                      ? AppMessages.DdlDefaultSelect
                                      : statesData.length <= 0 &&
                                        stateSelected == null
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
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    stateSelected == null ||
                                    Object.keys(stateSelected).length === 0
                                      ? AppMessages.DdlDefaultSelect
                                      : citiesData.length <= 0 &&
                                        citySelected == null
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
                          <div className="col-md-6 mb-15">
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
                          <div className="col-md-12 mb-20">
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
                              <label htmlFor="cbagreeterms">
                                I Agree to AssetsWatch Terms of use i would like
                                to receive property relates communication
                                through Email, call or SMS.
                              </label>
                              {errors?.["cbagreeterms"] && (
                                <div className="err-invalid">
                                  {errors?.["cbagreeterms"]}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-md-12 mb-20">
                            <Link
                              to={routeNames.addprofiles.path}
                              className="btn btn-primary box-shadow"
                              name="btnregister"
                              id="btnregister"
                              type="submit"
                            >
                              Next
                            </Link>
                          </div>
                          <div
                            className="form-error text-left"
                            id="err-message"
                          ></div>
                          <div className="col">
                            <Link
                              to={routeNames.login.path}
                              className="text-dark d-table py-1"
                            >
                              <u>I already have account.</u>
                            </Link>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*============== Register Form End ==============*/}
        </>
      )}
    </>
  );
};

export default Register;
