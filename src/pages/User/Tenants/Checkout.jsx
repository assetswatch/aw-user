import React, { useEffect, useState } from "react";
import {
  apiReqResLoader,
  checkObjNullorEmpty,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  Encrypt,
  usioGetToken,
} from "../../../utils/common";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { useNavigate } from "react-router-dom";
import TextAreaControl from "../../../components/common/TextAreaControl";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  SessionStorageKeys,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import { routeNames } from "../../../routes/routes";
import { useAuth } from "../../../contexts/AuthContext";
import {
  deletesessionStorageItem,
  getsessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import { Toast } from "../../../components/common/ToastView";
import { LazyImage } from "../../../components/common/LazyComponents";

const Checkout = () => {
  let $ = window.$;
  let formErrors = {};

  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(setInitFormData());
  const [paymentDetails, setPaymentDetails] = useState({});
  const [countriesData, setCountriesData] = useState([]);
  const [countrySelected, setCountrySelected] = useState(null);

  const [statesData, setStatesData] = useState([]);
  const [stateSelected, setStateSelected] = useState(null);

  const [citiesData, setCitiesData] = useState([]);
  const [citySelected, setCitySelected] = useState(null);

  const [initApisLoaded, setinitApisLoaded] = useState(false);

  let paymentId = parseInt(
    getsessionStorageItem(SessionStorageKeys.TenantCheckoutPaymentId, 0)
  );
  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  function setInitFormData() {
    let initFormData = {
      txtcardnumber: "",
      txtcardexpiry: "",
      txtcvv: "",
      txtfirstname: "",
      txtlastname: "",
      txtemail: "",
      txtaddressone: "",
      txtaddresstwo: "",
      txtzip: "",
    };

    return initFormData;
  }

  //Load
  useEffect(() => {
    getPaymentDetails();
    Promise.allSettled([getCountries()]).then(() => {
      setinitApisLoaded(true);
    });
    return () => {
      deletesessionStorageItem(SessionStorageKeys.TenantCheckoutPaymentId);
    };
  }, []);

  const getPaymentDetails = () => {
    if (paymentId > 0) {
      let objParams = {
        PaymentId: paymentId,
      };
      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getAssetPaymentDetails}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status == 0) {
              setPaymentDetails(objResponse.Data);
            } else {
              navigate(routeNames.tenantpayments.path);
            }
          } else {
            navigate(routeNames.tenantpayments.path);
          }
        })
        .catch((err) => {
          navigate(routeNames.tenantpayments.path);
          console.error(
            `"API :: ${ApiUrls.getAssetPaymentDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {});
    } else {
      navigate(routeNames.tenantpayments.path);
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
        setCountrySelected({});
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

  const onPay = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let errctl = "#form-error";
    $(errctl).html("");

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
      apiReqResLoader(
        "btnpay",
        "Payment processing...",
        API_ACTION_STATUS.START
      );
      setErrors({});
      usioGetToken({
        PaymentType: "CreditCard",
        EmailAddress: formData.txtemail,
        CardNumber: formData.txtcardnumber,
        ExpDate: formData.txtcardexpiry.replaceAll("/", ""),
        Cvv: formData.txtcvv,
        ProfileId: paymentDetails.FromId,
      })
        .then((tokenResponse) => {
          let isapimethoderr = false;
          let objBodyParams = {
            FirstName: formData.txtfirstname,
            LastName: formData.txtlastname,
            Email: formData.txtemail,
            Address1: formData.txtaddressone,
            Address2: formData.txtaddresstwo,
            Country: countrySelected.shortname,
            State: stateSelected.shortname,
            City: citySelected.label,
            Zip: formData.txtzip,
            Token: tokenResponse.token,
            PaymentType: tokenResponse.paymentType,
            CardType: tokenResponse.cardBrand,
            CardNumberLast4: tokenResponse.last4,
            ExpDate: tokenResponse.expDate,
            Amount: paymentDetails.TotalPaymentAmount,
            Tax: paymentDetails.Tax,
            CCCharges: paymentDetails.CCCharges,
          };
          axiosPost(`${config.apiBaseUrl}${ApiUrls.processAssetPayment}`, {
            PaymentId: paymentId,
            PaymentDetails: Encrypt(JSON.stringify(objBodyParams)),
          })
            .then((response) => {
              let objResponse = response.data;
              if (objResponse.StatusCode === 200) {
                if (objResponse.Data.Id > 0) {
                  Toast.success("Payment processed sucessfully...");
                } else {
                  Toast.error(objResponse.Data.Message);
                }
              } else {
                isapimethoderr = true;
              }
            })
            .catch((err) => {
              isapimethoderr = true;
              console.error(
                `"API :: ${ApiUrls.processAssetPayment}, Error ::" ${err}`
              );
            })
            .finally(() => {
              if (isapimethoderr == true) {
                Toast.error(AppMessages.SomeProblem);
              }
              //Clear form
              formData.txtcardnumber = "";
              formData.txtcardexpiry = "";
              formData.txtcvv = "";
              // formData.txtfirstname = "";
              // formData.txtlastname = "";
              // formData.txtemail = "";
              // formData.txtaddressone = "";
              // formData.txtaddresstwo = "";
              // formData.txtzip = "";
              setCountrySelected(null);
              setStateSelected(null);
              setCitySelected(null);
              apiReqResLoader("btnpay", "Pay", API_ACTION_STATUS.COMPLETED);
              navigate(routeNames.tenantpayments.path);
            });
        })
        .catch((err) => {
          console.error(`"API Token Error ::" ${err}`);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const onCancel = (e) => {
    navigate(routeNames.tenantpayments.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      {parseInt(
        getsessionStorageItem(SessionStorageKeys.TenantCheckoutPaymentId, 0)
      ) == 0
        ? navigate(routeNames.tenantpayments.path)
        : ""}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h5 className="mb-4 down-line">Checkout</h5>
              <div className="row">
                <div className="col-xl-3 col-lg-4">
                  <div className="widget bg-white box-shadow rounded px-0 mb-20">
                    <h6 className="mb-20 down-line pb-10 px-20 down-line-mx20">
                      Payment Summary
                    </h6>
                    <ul className="px-20">
                      {!checkObjNullorEmpty(paymentDetails) && (
                        <>
                          <li className={`v-center pt-3`}>
                            <LazyImage
                              src={paymentDetails.AssetImagePath}
                              className="img-fit-grid rounded box-shadow"
                              placeHolderClass="min-h-80 w-80px"
                            />
                            <div className="post-content py-3 pb-0">
                              <h5 className="listing-title">
                                <span className="text-primary font-15 font-500">
                                  <i className="fas fa-map-marker-alt me-2" />
                                  {paymentDetails.AddressOne}
                                </span>
                              </h5>
                              <div className="row listing-location mb-2 text-primary font-general font-500">
                                <span className="col text-left">Amount</span>
                                <span className="col text-right">
                                  {paymentDetails.TotalAmountDisplay}
                                </span>
                              </div>
                              <div className="row listing-location mb-2 text-primary font-general font-500">
                                <span className="col text-left">
                                  CC Charges (
                                  {paymentDetails.CCChargesPercentageDisplay})
                                </span>
                                <span className="col text-right">
                                  {paymentDetails.CCChargesAmountDisplay}
                                </span>
                              </div>
                              <div className="row listing-location mb-2 text-primary font-general font-500">
                                <span className="col text-left">Tax</span>
                                <span className="col text-right">
                                  {paymentDetails.TaxDisplay}
                                </span>
                              </div>
                              <hr className="w-100 text-primary my-10"></hr>
                              <div className="row listing-location mb-2 text-primary font-general font-500">
                                <span className="col text-left">
                                  Total Amount
                                </span>
                                <span className="col text-right">
                                  {paymentDetails.TotalPaymentAmountDisplay}
                                </span>
                              </div>
                            </div>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="col-xl-9 col-lg-8">
                  <form noValidate>
                    {/*============== Carddetails Start ==============*/}
                    <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col px-0">
                            <h6 className="mb-4 down-line  pb-10">
                              Card Details
                            </h6>
                            <div className="row">
                              <div className="col-md-6 mb-15">
                                <InputControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtcardnumber"
                                  ctlType={formCtrlTypes.cardnumber}
                                  isFocus={true}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtcardnumber}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={1}
                                ></InputControl>
                              </div>
                              <div className="col-md-4 mb-15">
                                <InputControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtcardexpiry"
                                  ctlType={formCtrlTypes.cardexpirydate}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtcardexpiry}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={2}
                                ></InputControl>
                              </div>
                              <div className="col-md-2 mb-15">
                                <InputControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtcvv"
                                  ctlType={formCtrlTypes.cvv}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtcvv}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={3}
                                ></InputControl>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/*============== Carddetails End ==============*/}

                    {/*============== Contactdetails Start ==============*/}
                    <div className="full-row px-3 py-4 mt-20 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col px-0">
                            <h6 className="mb-4 down-line  pb-10">
                              Billing Details
                            </h6>
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
                                  tabIndex={4}
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
                                  tabIndex={5}
                                ></InputControl>
                              </div>
                              <div className="col-md-12 mb-15">
                                <InputControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtemail"
                                  ctlType={formCtrlTypes.email}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtemail}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={6}
                                ></InputControl>
                              </div>
                              <div className="col-md-6 mb-15">
                                <TextAreaControl
                                  lblClass="mb-0 lbl-req-field"
                                  name="txtaddressone"
                                  ctlType={formCtrlTypes.addressone}
                                  required={true}
                                  onChange={handleChange}
                                  value={formData.txtaddressone}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={7}
                                  rows={2}
                                ></TextAreaControl>
                              </div>
                              <div className="col-md-6 mb-15">
                                <TextAreaControl
                                  lblClass="mb-0"
                                  name="txtaddresstwo"
                                  ctlType={formCtrlTypes.addresstwo}
                                  onChange={handleChange}
                                  value={formData.txtaddresstwo}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={8}
                                  rows={2}
                                ></TextAreaControl>
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
                                      extraOptions={{
                                        key: "shortname",
                                        dataVal: "ShortName",
                                      }}
                                      onChange={handleCountryChange}
                                      value={countrySelected}
                                      name="ddlcountries"
                                      lbl={formCtrlTypes.country}
                                      lblClass="mb-0 lbl-req-field"
                                      required={true}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={9}
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
                                      extraOptions={{
                                        key: "shortname",
                                        dataVal: "ShortName",
                                      }}
                                      onChange={handleStateChange}
                                      value={stateSelected}
                                      name="ddlstates"
                                      lbl={formCtrlTypes.state}
                                      lblClass="mb-0 lbl-req-field"
                                      required={true}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={10}
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
                                      tabIndex={11}
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
                          </div>
                        </div>
                      </div>
                    </div>
                    {/*============== Contactdetails End ==============*/}

                    <div className="full-row px-3 py-4 mt-20 bg-white box-shadow rounded">
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
                              id="btnPay"
                              onClick={onPay}
                            >
                              Pay
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
