import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  GetCookieValues,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
  SetAccordion,
} from "../../../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import AsyncSelect from "../../../components/common/AsyncSelect";
import FileControl from "../../../components/common/FileControl";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { Toast } from "../../../components/common/ToastView";
import { axiosPost } from "../../../helpers/axiosHelper";
import { routeNames } from "../../../routes/routes";
import getuuid from "../../../helpers/uuidHelper";

const Settings = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser, updateUserProfile } = useAuth();

  let formErrors = {};

  let loggedinProfileTypeId = GetCookieValues(UserCookie.ProfileTypeId);
  const [errors, setErrors] = useState({});
  const [initApisLoaded, setinitApisLoaded] = useState(false);

  function setInitialFormData(pDetails) {
    return {
      txtfirstname: pDetails ? pDetails.FirstName : "",
      txtlastname: pDetails ? pDetails.LastName : "",
      txtmobile: pDetails ? pDetails.MobileNo : "",
      txtlandline: pDetails ? pDetails.LandLineNo : "",
      txtzip: pDetails ? pDetails.Zip : "",
      txtcompanyname: pDetails ? pDetails.CompanyName : "",
      txtwebsite: pDetails ? pDetails.Website : "",
      txtaddressone: pDetails ? pDetails.AddressOne : "",
      txtaddresstwo: pDetails ? pDetails.AddressTwo : "",
      profilepic: pDetails ? pDetails.PicPath : "",
      txtaboutme: pDetails ? pDetails.AboutUs : "",
      profileDetails: pDetails,
    };
  }

  const [formData, setFormData] = useState(setInitialFormData(null));

  const [countriesData, setCountriesData] = useState([]);
  const [countrySelected, setCountrySelected] = useState(null);

  const [statesData, setStatesData] = useState([]);
  const [stateSelected, setStateSelected] = useState(null);

  const [citiesData, setCitiesData] = useState([]);
  const [citySelected, setCitySelected] = useState(null);

  const [profileCatData, setProfileCatData] = useState([]);
  const [selectedProfileCatId, setSelectedProfileCatId] = useState(null);

  const [file, setFile] = useState(null);

  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let profileTypeId = parseInt(
    GetUserCookieValues(UserCookie.ProfileTypeId, loggedinUser)
  );

  //Load
  useEffect(() => {
    Promise.allSettled([getCountries(), getProfileDetails()]).then(() => {
      setinitApisLoaded(true);
    });
  }, []);

  const getProfileCategories = (profileDetails) => {
    setSelectedProfileCatId(null);
    setProfileCatData([]);
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getProfileCategories}`, {
      ProfileTypeId: parseInt(config.userProfileTypes.Agent),
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data?.length > 0) {
            setProfileCatData(objResponse.Data);
            handleProifleCatChange({
              value: profileDetails.ProfileCategoryId,
              label: profileDetails.ProfileCategory,
            });
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
  };

  const getProfileDetails = () => {
    let isapimethoderr = false;
    let objParams = {
      ProfileId: profileId,
    };
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserDetails}`, objParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          let details = objResponse.Data;
          if (checkObjNullorEmpty(details) == false) {
            setFormData(setInitialFormData(details));
            handleCountryChange(
              { value: details.CountryId, label: details.Country },
              { value: details.StateId, label: details.State },
              { value: details.CityId, label: details.City }
            );
            if (profileTypeId === config.userProfileTypes.Agent) {
              getProfileCategories(details);
            }
          } else {
            Toast.error(AppMessages.ProfileDetailsNotFound);
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(`"API :: ${ApiUrls.getUserDetails}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
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
        // setCountrySelected({});
      });
  };

  //Get States.
  const getStates = (countryid, selState, selCity) => {
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
        if (!checkObjNullorEmpty(selState) && checkEmptyVal(selState?.action)) {
          handleStateChange(selState, selCity);
        } else {
          setStateSelected({});
        }
      });
  };

  //Get cities.
  const getCities = (stateid, selCity) => {
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
        if (!checkObjNullorEmpty(selCity) && checkEmptyVal(selCity?.action)) {
          handleCityChange(selCity);
        } else {
          setCitySelected({});
        }
      });
  };

  const handleCountryChange = (selItem, selState, selCity) => {
    setStateSelected(null);
    setStatesData([]);
    setCitySelected(null);
    setCitiesData([]);

    setCountrySelected(selItem);

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }

    getStates(selItem?.value, selState, selCity);
  };

  const handleStateChange = (selItem, selCity) => {
    setCitySelected(null);
    setCitiesData([]);

    setStateSelected(selItem);

    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }
    getCities(selItem?.value, selCity);
  };

  const handleCityChange = (selItem) => {
    setCitySelected(selItem);
  };

  const handleProifleCatChange = (e) => {
    setSelectedProfileCatId(e?.value);
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (event) => {
    let selFile = event.target.files[0];
    if (selFile) {
      setFile(selFile);
      setFormData({
        ...formData,
        profilepic: URL.createObjectURL(selFile),
      });
    }
  };

  const setProfileInormationInitalState = () => {
    apiReqResLoader("x");
    setErrors({});
    Promise.allSettled([getCountries(), getProfileDetails()]).then(() => {
      setinitApisLoaded(true);
      apiReqResLoader("x", "", "completed");
    });
  };

  const onSave = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();

    if (checkObjNullorEmpty(countrySelected)) {
      formErrors["ddlcountries"] = ValidationMessages.CountryReq;
    }

    if (checkObjNullorEmpty(stateSelected)) {
      formErrors["ddlstates"] = ValidationMessages.StateReq;
    }

    if (checkObjNullorEmpty(citySelected)) {
      formErrors["ddlcities"] = ValidationMessages.CityReq;
    }

    if (profileTypeId === config.userProfileTypes.Agent) {
      if (checkEmptyVal(selectedProfileCatId) || selectedProfileCatId == 0) {
        formErrors["ddlprofilecategory"] = ValidationMessages.CategoryReq;
      }
    } else {
      delete formErrors["ddlprofilecategory"];
    }

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btnSave", "Saving...");
      let errctl = "#form-error";
      $(errctl).html("");
      setErrors({});
      let isapimethoderr = false;
      let objBodyParams = new FormData();
      objBodyParams.append("AccountId", accountId);
      objBodyParams.append("ProfileId", profileId);
      objBodyParams.append("ProfileTypeId", profileTypeId);
      objBodyParams.append("FirstName", formData.txtfirstname);
      objBodyParams.append("LastName", formData.txtlastname);
      objBodyParams.append("Mobile", formData.txtmobile);
      objBodyParams.append(
        "LandLine",
        checkEmptyVal(formData.txtlandline) ? "" : formData.txtlandline
      );
      objBodyParams.append("AddressOne", formData.txtaddressone);
      objBodyParams.append(
        "AddressTwo",
        checkEmptyVal(formData.txtaddresstwo) ? "" : formData.txtaddresstwo
      );
      objBodyParams.append(
        "CountryId",
        parseInt(setSelectDefaultVal(countrySelected))
      );
      objBodyParams.append(
        "StateId",
        parseInt(setSelectDefaultVal(stateSelected))
      );
      objBodyParams.append(
        "CityId",
        parseInt(setSelectDefaultVal(citySelected))
      );
      objBodyParams.append("Zip", formData.txtzip);
      objBodyParams.append(
        "ProfileCategoryId",
        profileTypeId === config.userProfileTypes.Agent
          ? parseInt(setSelectDefaultVal(selectedProfileCatId))
          : 0
      );
      objBodyParams.append("CompanyName", formData.txtcompanyname);
      objBodyParams.append("Website", formData.txtwebsite);
      objBodyParams.append("AboutUs", formData.txtaboutme);
      objBodyParams.append("DOB", "");
      objBodyParams.append("Gender", "");
      if (file) objBodyParams.append("ProfileImage", file);

      axiosPost(`${config.apiBaseUrl}${ApiUrls.updateUser}`, objBodyParams, {
        "Content-Type": "multipart/form-data",
      })
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data != null && objResponse.Data?.ProfileId > 0) {
              Toast.success(AppMessages.UpdateProfileSuccess);

              let profileData = {
                profileid: profileId,
                profiletype: formData.profileDetails.ProfileType,
                profilename: formData.txtfirstname + " " + formData.txtlastname,
                profilepic: objResponse.Data.PicPath + "?v=" + getuuid(),
                profiletypeid: formData.profileDetails.ProfileTypeId,
                profilecatid: formData.profileDetails.ProfileCategoryId,
              };
              updateUserProfile(profileData);
            } else {
              Toast.error(objResponse.Data.Message);
              $(errctl).html(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.updateUser}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
            $(errctl).html(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnSave", "Save", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  let formCpwdErrors = {};
  const [cpwdErrors, setCpwdErrors] = useState({});
  function setInitialFormCpwdData(pDetails) {
    return {
      txtoldpassword: "",
      txtpassword: "",
      txtconfirmpassword: "",
    };
  }

  const [formCpwdData, setFormCpwdData] = useState(
    setInitialFormCpwdData(null)
  );

  const handleCpwdChange = (e) => {
    const { name, value } = e?.target;
    setFormCpwdData({
      ...formCpwdData,
      [name]: value,
    });
  };

  const setConfirmPwdInitalState = () => {
    setFormCpwdData(setInitialFormCpwdData());
    setCpwdErrors({});
  };

  const onChangePassword = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (Object.keys(formCpwdErrors).length === 0) {
      apiReqResLoader("btnChangePassword", "Saving...");
      let errctl = "#form-error-cpwd";
      $(errctl).html("");
      setCpwdErrors({});
      let isapimethoderr = false;
      let objBodyParams = {
        accountid: accountId,
        oldpwd: formCpwdData.txtoldpassword,
        pwd: formCpwdData.txtpassword,
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.changePassword}`, objBodyParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data != null && objResponse.Data?.Status == 1) {
              Toast.success(objResponse.Data.Message);
              setConfirmPwdInitalState();
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.changePassword}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnChangePassword",
            "Save",
            API_ACTION_STATUS.COMPLETED
          );
        });
    } else {
      $(`[name=${Object.keys(formCpwdErrors)[0]}]`).focus();
      setCpwdErrors(formCpwdErrors);
    }
  };

  const tabsClick = (tab) => {
    if ($("#" + tab).hasClass("active")) {
      switch (tab.toLowerCase()) {
        case "profileinfotab":
          setProfileInormationInitalState();
          break;
        case "changepwdtab":
          setConfirmPwdInitalState();
          break;

        default:
          break;
      }
    }
  };

  const onBranding = (e) => {
    e.preventDefault();
    navigate(routeNames.branding.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      {SetAccordion()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-7 shadow">
            <div className="bg-white xs-p-20 p-30 pb-50 border rounded">
              <h6 className="mb-2 down-line pb-10">Settings</h6>
              <div className="row pt-20 pb-0 row-cols-1 g-4 flex-center">
                <div className="bb-accordion ac-single-show accordion-plus-right">
                  {/*============== Profile tab start ==============*/}
                  <div className="ac-card rounded border p-0 mb-20">
                    <a
                      className="ac-toggle text-dark text-truncate active text-primary p-10 px-15"
                      onClick={() => tabsClick("profileinfotab")}
                      id="profileinfotab"
                    >
                      <span className="text-primary">Profile Information</span>
                    </a>
                    <div
                      className="ac-collapse show p-15 mt-0"
                      style={{ display: "block" }}
                    >
                      <div className="col">
                        <form noValidate>
                          <div className="row">
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
                                tabIndex={1}
                                isFocus={true}
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
                                tabIndex={2}
                              ></InputControl>
                            </div>
                            {profileTypeId ===
                              config.userProfileTypes.Agent && (
                              <div className="col-md-6 mb-15">
                                <AsyncSelect
                                  placeHolder={
                                    profileCatData.length <= 0 &&
                                    selectedProfileCatId == null
                                      ? AppMessages.DdLLoading
                                      : AppMessages.DdlDefaultSelect
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
                            )}
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
                                tabIndex={3}
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
                                tabIndex={4}
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
                                tabIndex={5}
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
                                tabIndex={6}
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
                                tabIndex={7}
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
                                tabIndex={8}
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
                                tabIndex={12}
                              ></InputControl>
                            </div>
                            <div className="col-md-6 mb-15 d-flex flex-start">
                              <div className="d-flex">
                                <div className="w-100px">
                                  <img
                                    src={formData.profilepic}
                                    className="py-0 w-100px rounded"
                                    alt=""
                                  />
                                </div>
                                <div className="w-100 pl-20 flex-direction-col flex-start">
                                  <FileControl
                                    lblClass="mb-0 flex-grow"
                                    name="uploadimage"
                                    ctlType={formCtrlTypes.file}
                                    onChange={handleFileChange}
                                    file={file}
                                    errors={errors}
                                    formErrors={formErrors}
                                    tabIndex={14}
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              className={`${
                                profileTypeId === config.userProfileTypes.Agent
                                  ? "col-12"
                                  : "col-6"
                              } mb-15`}
                            >
                              <TextAreaControl
                                lblClass="mb-0"
                                name="txtaboutme"
                                ctlType={formCtrlTypes.aboutme}
                                onChange={handleChange}
                                value={formData.txtaboutme}
                                errors={errors}
                                formErrors={formErrors}
                                tabIndex={13}
                                rows={3}
                              ></TextAreaControl>
                            </div>
                          </div>
                        </form>
                        <hr className="w-100 text-primary"></hr>

                        <div className="container-fluid">
                          <div className="row form-action flex-center">
                            <div
                              className="col-md-6 px-0 form-error"
                              id="form-error"
                            ></div>
                            <div className="col-md-6 px-0">
                              <button
                                className="btn btn-primary"
                                id="btnSave"
                                onClick={onSave}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Profile tab end ==============*/}

                  {/*============== Change password tab start ==============*/}
                  <div className="ac-card rounded border p-0 mb-20">
                    <a
                      className="ac-toggle text-dark text-truncate text-primary p-10 px-15"
                      onClick={() => tabsClick("changepwdtab")}
                      id="changepwdtab"
                    >
                      <span className="text-primary">Change Password</span>
                    </a>
                    <div className="ac-collapse p-15 mt-0">
                      <div className="col">
                        <form noValidate>
                          <div className="row">
                            <div className="col-md-6 col-xl-4 mb-15">
                              <InputControl
                                lblClass="mb-0 lbl-req-field"
                                name="txtoldpassword"
                                lblText="Current password"
                                ctlType={formCtrlTypes.currentpwd}
                                required={true}
                                onChange={handleCpwdChange}
                                value={formCpwdData.txtoldpassword}
                                errors={cpwdErrors}
                                formErrors={formCpwdErrors}
                                tabIndex={1}
                              ></InputControl>
                            </div>
                            <div className="col-md-6 col-xl-4 mb-15">
                              <InputControl
                                lblClass="mb-0 lbl-req-field"
                                name="txtpassword"
                                lblText="New password"
                                ctlType={formCtrlTypes.newpwd}
                                required={true}
                                onChange={handleCpwdChange}
                                value={formCpwdData.txtpassword}
                                errors={cpwdErrors}
                                formErrors={formCpwdErrors}
                                tabIndex={2}
                              ></InputControl>
                            </div>
                            <div className="col-md-6 col-xl-4 mb-15">
                              <InputControl
                                lblClass="mb-0 lbl-req-field"
                                name="txtconfirmpassword"
                                lblText="Confirm new password"
                                ctlType={formCtrlTypes.confirmnewpwd}
                                required={true}
                                onChange={handleCpwdChange}
                                value={formCpwdData.txtconfirmpassword}
                                pwdVal={formCpwdData.txtpassword}
                                errors={cpwdErrors}
                                formErrors={formCpwdErrors}
                                objProps={{ pwdVal: formCpwdData.txtpassword }}
                                tabIndex={3}
                              ></InputControl>
                            </div>
                          </div>
                        </form>
                        <hr className="w-100 text-primary"></hr>
                        <div className="container-fluid">
                          <div className="row form-action flex-center">
                            <div
                              className="col-md-6 px-0 form-error"
                              id="form-error-cpwd"
                            ></div>
                            <div className="col-md-6 px-0">
                              <button
                                className="btn btn-primary"
                                id="btnChangePassword"
                                onClick={onChangePassword}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Change password tab end ==============*/}

                  {/*============== Notification settings tab start ==============*/}
                  <div className="ac-card rounded border p-0 mb-20">
                    <a
                      className="ac-toggle text-dark text-truncate text-primary p-10 px-15"
                      onClick={() => tabsClick("notificationsettingstab")}
                      id="notificationsettingstab"
                    >
                      <span className="text-primary">
                        Notification Settings
                      </span>
                    </a>
                    <div className="ac-collapse p-15 mt-0">
                      <div className="col">
                        <form noValidate>
                          <div className="row">
                            <div className="col-md-6 mb-15">
                              <div className="custom-check-box-2">
                                <input
                                  className="d-none"
                                  type="checkbox"
                                  id="smsnotification"
                                  name="smsnotification"
                                  defaultValue="false"
                                />
                                <label htmlFor="smsnotification">
                                  SMS Notification{" "}
                                </label>
                              </div>
                            </div>
                            <div className="col-md-6 mb-15 text-lg-center">
                              <div className="custom-check-box-2">
                                <input
                                  className="d-none"
                                  type="checkbox"
                                  id="emailnotification"
                                  name="emailnotification"
                                  defaultValue="false"
                                />
                                <label htmlFor="emailnotification">
                                  Email Notification{" "}
                                </label>
                              </div>
                            </div>
                          </div>
                        </form>
                        <hr className="w-100 text-primary"></hr>
                        <div className="container-fluid">
                          <div className="row form-action flex-center">
                            <div
                              className="col-md-6 px-0 form-error"
                              id="form-error-cpwd"
                            ></div>
                            <div className="col-md-6 px-0">
                              <button
                                className="btn btn-primary"
                                id="btnChangePassword"
                                onClick={() => {}}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*============== Notification settings tab end ==============*/}

                  {/*==============  Manage branding tab start ==============*/}

                  <div className="ac-card rounded border p-0 mb-20">
                    <a
                      className="ac-toggle text-dark text-truncate text-primary p-10 px-15"
                      onClick={onBranding}
                      id="managebrandingtab"
                    >
                      <span className="text-primary">Manage Branding</span>
                    </a>
                    {/* <div className="ac-collapse p-15 mt-20">
                      <div className="col">
                        <form noValidate>
                          <div className="row mb-30">
                            <div className="col-auto">
                              <label className="form-label pt-1">
                                Branding:
                              </label>
                            </div>
                            <div className="col-xl-4 col-lg-6 col-md-6 col pl-0">
                              <AsyncSelect
                                placeHolder={AppMessages.DdlDefaultSelect}
                                noData={AppMessages.NoData}
                                options={brandingList}
                                dataKey="Value"
                                dataVal="Name"
                                value={null}
                                name="ddlbranding"
                                lbl={formCtrlTypes.profiletype}
                                lblText="Profile type"
                                lblClass="mb-0 lbl-req-field d-none"
                                required={true}
                                tabIndex={1}
                                isSearchable={false}
                                menuPortalTarget="body"
                              ></AsyncSelect>
                            </div>
                          </div>
                        </form>
                        <hr className="w-100 text-primary"></hr>
                        <div className="container-fluid">
                          <div className="row form-action flex-center">
                            <div
                              className="col-md-6 px-0 form-error"
                              id="form-error-cpwd"
                            ></div>
                            <div className="col-md-6 px-0">
                              <button
                                className="btn btn-primary"
                                id="btnChangePassword"
                                onClick={() => {}}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div> */}
                  </div>

                  {/*============== Manage branding tab end ==============*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
