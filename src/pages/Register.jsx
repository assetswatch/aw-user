import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { routeNames } from "../routes/routes";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppDetails,
  AppMessages,
  UserCookie,
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
  getPagesPathByLoggedinUserProfile,
  GetCookieValues,
  aesCtrDecrypt,
  GetUserCookieValues,
  UrlWithoutParam,
  setProfileDescText,
} from "../utils/common";
import config from "../config.json";
import { axiosPost, axiosGet } from "../helpers/axiosHelper";
import AsyncSelect from "../components/common/AsyncSelect";
import PageTitle from "../components/layouts/PageTitle";
import InputControl from "../components/common/InputControl";
import { useAuth } from "../contexts/AuthContext";
import getuuid from "../helpers/uuidHelper";
import GoBackPanel from "../components/common/GoBackPanel";

const Register = () => {
  let $ = window.$;

  const { isAuthenticated, loginUser, loggedinUser, logoutUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

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

  //Load
  useEffect(() => {
    if (isAuthenticated() == true && checkEmptyVal(id)) {
      let loggedinptid = parseInt(
        GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
      );
      navigate(getPagesPathByLoggedinUserProfile(loggedinptid, "profile"), {
        replace: true,
      });
    }
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
          let pt = objProfileTypesResponse.Data;
          let filteredpt = [];
          let isSetAllProfileTypes = true;
          if (!checkEmptyVal(id)) {
            aesCtrDecrypt(id).then((decId) => {
              logoutUser();
              let [upinviterid, enckey, upptid] = decId.split(":");
              upptid = parseInt(upptid);
              upinviterid = parseInt(upinviterid);
              let checkParams =
                Number.isSafeInteger(upinviterid) &&
                !checkEmptyVal(enckey) &&
                Number.isSafeInteger(upptid);
              if (checkParams) {
                filteredpt = pt.filter((p) => p.ProfileTypeId == upptid);
                if (filteredpt.length > 0) {
                  isSetAllProfileTypes = false;
                  setProfileTypes(filteredpt);
                  setFormData({
                    ...formData,
                    rblprofiletype: upptid,
                  });
                  if (filteredpt[0]?.ProfileTypeId == upptid) {
                    getProfileCategories(null, filteredpt[0]);
                  }
                }
              }
            });
          }
          if (isSetAllProfileTypes) {
            setProfileTypes(pt);
          }
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

  const getProfileCategories = (e, pt) => {
    if (pt == null) {
      apiReqResLoader("x", "x", API_ACTION_STATUS.START);
    }
    setSelectedProfileCatId(null);
    setProfileCatData([]);
    let profileTypeId = checkObjNullorEmpty(pt)
      ? parseInt(e?.currentTarget.getAttribute("value"))
      : pt.ProfileTypeId;
    let iscatavailable = checkObjNullorEmpty(pt)
      ? stringToBool(e?.currentTarget.getAttribute("data-iscat"))
      : pt.IsCategories;
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
        .finally(() => {
          apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
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

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btnregister", "Registering");
      let errctl = ".form-error";
      $(errctl).html("");
      setErrors({});
      let isapimethoderr = false;
      let sessionid = `web_${getuuid()}`;
      let objBodyParams = {
        email: formData.txtemail,
        pwd: formData.txtpassword,
        firstName: formData.txtfirstname,
        lastName: formData.txtlastname,
        mobile: formData.txtmobile,
        landLine: formData.txtlandline,
        addressOne: formData.txtaddressone,
        addressTwo: formData.txtaddresstwo,
        countryId: parseInt(setSelectDefaultVal(countrySelected)),
        stateId: parseInt(setSelectDefaultVal(stateSelected)),
        cityId: parseInt(setSelectDefaultVal(citySelected)),
        zip: formData.txtzip,
        profileTypeId: parseInt(formData.rblprofiletype),
        profileCategoryId: parseInt(setSelectDefaultVal(selectedProfileCatId)),
        planId: 1,
        CompanyName: formData.txtcompanyname,
        Website: formData.txtwebsite,
        ProfilePic: "",
        DeviceTypeId: AppDetails.devicetypeid,
        SessionId: sessionid,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.registerUser}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            let respData = objResponse.Data;
            if (!checkObjNullorEmpty(respData) && respData?.AccountId > 0) {
              loginUser(respData, formData.cbremme, sessionid);
              clearForm();
              navigate(routeNames.upgradeplan.path, { replace: true });
            } else {
              $(errctl).html(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.registerUser}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnregister", "Register", "completed");
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  return (
    <>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Register"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Register Form Start ==============*/}
      <div className="full-row pt-4 pb-5 bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-lg-10 mx-auto">
              {formData.rblprofiletype == 0 && checkEmptyVal(id) ? (
                <div className="row mx-auto mt-20 shadow">
                  <div className="bg-white xs-p-20 px-30 py-30 pb-30 border rounded">
                    <div className="breadcrumb mb-0">
                      <div className="breadcrumb-item bc-fh">
                        <h6 className="mb-2 down-line pb-10">Select Profile</h6>
                      </div>
                    </div>
                    <div className="row row-cols-lg-3 row-cols-md-3 pt-20 pb-50 row-cols-1 g-4 f lex-center">
                      <div
                        className="col cur-pointer"
                        data-iscat={false}
                        value={config.userProfileTypes.Owner}
                        onClick={(e) => {
                          handleProfileTypeChange(e);
                          getProfileCategories(e);
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
                              {setProfileDescText(
                                config.userProfileTypes.Owner
                              )}
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
                          getProfileCategories(e);
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
                              {setProfileDescText(
                                config.userProfileTypes.Agent
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="col cur-pointer"
                        data-iscat={false}
                        value={config.userProfileTypes.Tenant}
                        onClick={(e) => {
                          handleProfileTypeChange(e);
                          getProfileCategories(e);
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
                              {setProfileDescText(
                                config.userProfileTypes.Tenant
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded shadow">
                  <div className="form-icon-left rounded form-boder">
                    <div className="d-flex w-100">
                      <div className="flex-grow-1">
                        <h6 className="mb-3 down-line pb-10 px-0">
                          Create{" "}
                          {Object.keys(config.userProfileTypes).find(
                            (key) =>
                              config.userProfileTypes[key] ==
                              formData.rblprofiletype
                          )}{" "}
                          Profile
                        </h6>
                      </div>
                      {checkEmptyVal(id) && (
                        <GoBackPanel
                          clickAction={() => {
                            apiReqResLoader("x", "x", API_ACTION_STATUS.START);
                            clearForm();
                            apiReqResLoader(
                              "x",
                              "x",
                              API_ACTION_STATUS.COMPLETED
                            );
                          }}
                          isformBack={true}
                        />
                      )}
                    </div>
                    <form noValidate onSubmit={register}>
                      <div className="row">
                        <div className="col-md-12 mb-1">
                          <h6 className="down-line pb-10">Login Information</h6>
                        </div>
                        {/* <div className="row mb-15" tabIndex={0}>
                          {initApisLoaded &&
                            profileTypes.map((pt, idx) => {
                              return (
                                <div className="col-md-4" key={"ptkey-" + idx}>
                                  <div
                                    className={`custom-check-box-2  ${
                                      idx == 0
                                        ? "text-left"
                                        : idx == profileTypes.length - 1
                                        ? "text-right"
                                        : "text-center"
                                    }`}
                                  >
                                    <input
                                      className="d-none"
                                      type="radio"
                                      value={pt.ProfileTypeId}
                                      id={"pt-" + pt.ProfileTypeId}
                                      name="rblprofiletype"
                                      checked={
                                        formData.rblprofiletype ==
                                        pt.ProfileTypeId
                                      }
                                      onChange={(e) => {
                                        handleChange(e);
                                        getProfileCategories(e);
                                      }}
                                      data-iscat={pt.IsCategories}
                                    />
                                    <label
                                      htmlFor={"pt-" + pt.ProfileTypeId}
                                      className="radio-lbl"
                                    >
                                      {pt.ProfileType}
                                    </label>
                                  </div>
                                </div>
                              );
                            })}
                          {errors?.[`rblprofiletype`] && (
                            <div className="err-invalid">
                              {errors?.[`rblprofiletype`]}
                            </div>
                          )}
                        </div> */}
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
                          <div
                            id="divprofilecategory"
                            className={
                              formData.rblprofiletype ==
                              config.userProfileTypes.Agent
                                ? `show`
                                : `hide`
                            }
                          >
                            <AsyncSelect
                              placeHolder={
                                profileCatData.length <= 0 &&
                                selectedProfileCatId == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlNoData
                              }
                              noData={
                                profileCatData.length <= 0 &&
                                selectedProfileCatId == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.DdlNoData
                              }
                              options={profileCatData}
                              onChange={handleProifleCatChange}
                              value={selectedProfileCatId}
                              defualtselected={selectedProfileCatId}
                              name="ddlprofilecategory"
                              lbl={formCtrlTypes.category}
                              lblClass="mb-0 lbl-req-field"
                              isClearable={false}
                              required={true}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={2}
                            ></AsyncSelect>
                          </div>
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
                        <div className="col-md-12 mb-1 mt-10">
                          <h6 className="down-line pb-10">
                            Contact Information
                          </h6>
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
                              to receive property related communication through
                              Email, call or SMS.
                            </label>
                            {errors?.["cbagreeterms"] && (
                              <div className="err-invalid">
                                {errors?.["cbagreeterms"]}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-12 mb-20">
                          <button
                            className="btn btn-primary btn-mini btn-glow shadow rounded"
                            name="btnregister"
                            id="btnregister"
                            type="submit"
                          >
                            Register
                          </button>
                        </div>
                        <div
                          className="form-error text-left"
                          id="err-message"
                        ></div>
                        <div className="col">
                          <Link
                            to={UrlWithoutParam(routeNames.login)}
                            className="text-dark d-table py-1"
                          >
                            <u>I already have account.</u>
                          </Link>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/*============== Register Form End ==============*/}
    </>
  );
};

export default Register;
