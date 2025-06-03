import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import GoBackPanel from "../../../components/common/GoBackPanel";

const AddBusiness = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

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
      txtaboutcompany: pDetails ? pDetails.AboutUs : "",
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

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onSave = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();

    apiReqResLoader("btnSave", "Saving...", API_ACTION_STATUS.START);
    navigateToBusiness();
    apiReqResLoader("btnSave", "Save", API_ACTION_STATUS.COMPLETED);
  };

  const navigateToSettings = () => {
    navigate(routeNames.settings.path);
  };
  const navigateToBusiness = () => {
    navigate(routeNames.businesses.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex w-100">
                <div className="flex-grow-1">
                  <div className="breadcrumb my-1">
                    <div className="breadcrumb-item bc-fh">
                      <h6
                        className="mb-3 down-line pb-10 cur-pointer"
                        onClick={navigateToSettings}
                      >
                        Settings
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span
                        className="font-general font-500 cur-pointer"
                        onClick={navigateToBusiness}
                      >
                        Business
                      </span>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Add Business
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-md-12 col-lg-10 col-xl-9 shadow">
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded">
                  <div className="row row-cols-1 g-4 flex-center">
                    <div className="col">
                      <form noValidate>
                        <div className="row">
                          <div className="d-flex w-100">
                            <div className="flex-grow-1">
                              <h6 className="mb-3 down-line pb-10 px-0 font-16">
                                Company Information
                              </h6>
                            </div>
                            <GoBackPanel
                              clickAction={navigateToBusiness}
                              isformBack={true}
                            />
                          </div>

                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
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
                              lblClass="mb-0 lbl-req-field"
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
                              name="txtemail"
                              ctlType={formCtrlTypes.email}
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
                              lblClass="mb-0 lbl-req-field"
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
                              <div className="col-md-4 mb-15">
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
                              <div className="col-md-4 mb-15">
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
                          <div className="col-md-4 mb-15">
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
                          <div className="col-md-12 mb-15">
                            <TextAreaControl
                              lblClass="mb-0"
                              name="txtaboutcompany"
                              lblText={"About company:"}
                              ctlType={formCtrlTypes.aboutcompany}
                              onChange={handleChange}
                              value={formData.txtaboutcompany}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={13}
                              rows={3}
                            ></TextAreaControl>
                          </div>
                          <div className="col-md-12 mt-10">
                            <h6 className="mb-3 down-line pb-10 px-0 font-16">
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
                              lblClass="mb-0 lbl-req-field"
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
                        </div>
                      </form>

                      <div className="row form-action flex-center mx-0 mt-30 my-20">
                        <div
                          className="col-md-8 px-0 form-error"
                          id="form-error"
                        ></div>
                        <div className="col-md-4 px-0">
                          <button
                            className="btn btn-secondary"
                            id="btnCancel"
                            onClick={navigateToBusiness}
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
    </>
  );
};

export default AddBusiness;
