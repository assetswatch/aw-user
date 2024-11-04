import React, { useEffect, useState } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  GetCookieValues,
  getPagesPathByLoggedinUserProfile,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import { useNavigate } from "react-router-dom";
import UserProfileCard from "../../../components/common/UserProfileCard";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import AsyncSelect from "../../../components/common/AsyncSelect";
import FileControl from "../../../components/common/FileControl";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { Toast } from "../../../components/common/ToastView";
import getuuid from "../../../helpers/uuidHelper";

const EditProfile = () => {
  let $ = window.$;

  const { loggedinUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
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
  const [file, setFile] = useState(null);

  let editProfileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );
  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  //Load
  useEffect(() => {
    Promise.allSettled([getCountries(), getProfileDetails()]).then(() => {
      setinitApisLoaded(true);
    });
  }, []);

  const returntoProfilePage = () => {
    navigate(
      getPagesPathByLoggedinUserProfile(loggedinProfileTypeId, "profile")
    );
  };

  const getProfileDetails = () => {
    let isapimethoderr = false;
    if (editProfileId > 0) {
      let objParams = {
        // AccountId: accountId,
        ProfileId: editProfileId,
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
            } else {
              Toast.error(AppMessages.ProfileDetailsNotFound);
              returntoProfilePage();
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
            returntoProfilePage();
          }
        });
    }
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
        if (!checkObjNullorEmpty(selState)) {
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
        if (!checkObjNullorEmpty(selCity)) {
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

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btnSave", "Saving...");
      let errctl = ".form-error";
      $(errctl).html("");
      setErrors({});
      let isapimethoderr = false;
      let objBodyParams = new FormData();
      objBodyParams.append("AccountId", accountId);
      objBodyParams.append("ProfileId", editProfileId);
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
      objBodyParams.append("ProfileCategoryId", 0);
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
                profileid: editProfileId,
                profiletype: formData.profileDetails.ProfileType,
                profilename: formData.txtfirstname + " " + formData.txtlastname,
                profilepic: objResponse.Data.PicPath + "?v=" + getuuid(),
                profiletypeid: formData.profileDetails.ProfileTypeId,
                profilecatid: formData.profileDetails.ProfileCategoryId,
              };
              updateUserProfile(profileData);
              returntoProfilePage();
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

  const onCancel = (e) => {
    returntoProfilePage();
  };

  return (
    <>
      {SetPageLoaderNavLinks()}

      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h5 className="mb-4 down-line">Edit Profile</h5>
              <div className="row">
                <div className="col-xl-3 col-lg-4">
                  {/*============== Profile Start ==============*/}
                  <UserProfileCard showEdit={false} />
                  {/*============== Profile End ==============*/}
                </div>
                <div className="col-xl-9 col-lg-8">
                  <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                    <div className="container-fluid">
                      <div className="row">
                        <div className="col px-0">
                          <h6 className="mb-4 down-line  pb-10">
                            Profile Information
                          </h6>
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
                                        Object.keys(countrySelected).length ===
                                          0
                                          ? AppMessages.DdlDefaultSelect
                                          : statesData.length <= 0 &&
                                            stateSelected == null
                                          ? AppMessages.DdLLoading
                                          : AppMessages.DdlDefaultSelect
                                      }
                                      noData={
                                        countrySelected == null ||
                                        Object.keys(countrySelected).length ===
                                          0
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
                              <div className="col-md-6 mb-15">
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
                              <div className="col-md-6 mb-15 min-h-130 d-flex flex-center">
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
                            </div>
                          </form>
                          <hr className="w-100 text-primary my-20"></hr>

                          <div className="container-fluid">
                            <div className="row form-action flex-center">
                              <div
                                className="col-md-6 px-0 form-error"
                                id="form-error"
                              ></div>
                              <div className="col-md-6 px-0">
                                <button
                                  className="btn btn-secondary"
                                  id="btnCancel"
                                  onClick={onCancel}
                                >
                                  Cancel
                                </button>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
