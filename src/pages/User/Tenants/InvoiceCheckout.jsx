import React, { useEffect, useState } from "react";
import {
  apiReqResLoader,
  checkObjNullorEmpty,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  Encrypt,
  usioGetToken,
  checkEmptyVal,
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

const InvoiceCheckout = () => {
  let $ = window.$;
  let formErrors = {};

  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  const [paymentTypes, setPaymentTypes] = useState([
    { PaymentTypeId: "CreditCard", PaymentType: "Credit Card" },
    { PaymentTypeId: "ACH", PaymentType: "ACH Payment" },
  ]);
  const [selectedPaymentType, setSelectedPaymentType] = useState(
    paymentTypes[0].PaymentTypeId
  );

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(setInitFormData());
  const [amountFormData, setAmountFormData] = useState({});
  const [invoiceDetails, setInvoiceDetails] = useState({});
  const [recieverUserDetails, setRecieverUserDetails] = useState({});
  const [countriesData, setCountriesData] = useState([]);
  const [countrySelected, setCountrySelected] = useState(null);

  const [statesData, setStatesData] = useState([]);
  const [stateSelected, setStateSelected] = useState(null);

  const [citiesData, setCitiesData] = useState([]);
  const [citySelected, setCitySelected] = useState(null);

  const [initApisLoaded, setinitApisLoaded] = useState(false);

  let inoviceId = parseInt(
    getsessionStorageItem(SessionStorageKeys.TenantCheckoutInvoiceId, 0)
  );
  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const [accountTypes, setAccountTypes] = useState([
    { Text: "Checking", Id: "27" },
    { Text: "Savings", Id: "37" },
  ]);
  const [accountTypeSelected, setAccountTypeSelected] = useState(
    accountTypes[0].Id
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
      txtaccountnumber: "",
      txtroutingnumber: "",
    };

    return initFormData;
  }

  //Load
  useEffect(() => {
    Promise.allSettled([
      getInvoiceDetails(),
      getUserDetails(),
      getCountries(),
    ]).then(() => {
      setinitApisLoaded(true);
    });
    return () => {
      // deletesessionStorageItem(SessionStorageKeys.TenantCheckoutInvoiceId);
    };
  }, []);

  const getInvoiceDetails = async () => {
    if (inoviceId > 0) {
      let isapimethoderr = false;
      let objParams = {
        InvoiceId: inoviceId,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getInvoiceDetails}`, objParams)
        .then(async (response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setInvoiceDetails(objResponse.Data);
            setAmountFormData({
              ...objResponse.Data.TaxDetails,
              TotalAmountBeforeEdit: objResponse.Data.TaxDetails.TotalAmount,
            });
            if (
              objResponse.Data?.SentProfiles !== null &&
              objResponse.Data?.SentProfiles.length > 0
            ) {
              setRecieverUserDetails(
                objResponse.Data?.SentProfiles?.filter(
                  (p) => p.ProfileId == profileId
                )
              );
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.getInvoiceDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
        });
    } else {
      navigateToInvoices();
    }
  };

  const getUserDetails = () => {
    let objParams = {
      ProfileId: profileId,
    };
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserDetails}`, objParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          let details = objResponse.Data;
          if (checkObjNullorEmpty(details) == false) {
            setFormData({
              ...formData,
              txtfirstname: details.FirstName,
              txtlastname: details.LastName,
              txtemail: details.Email,
              txtaddressone: details.AddressOne,
              txtaddresstwo: details.AddressTwo,
              txtzip: details.Zip,
            });
            getCountries(details);
          }
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getUserDetails}, Error ::" ${err}`);
      })
      .finally(() => {});
  };

  //Get countries.
  const getCountries = (userDetails) => {
    return axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlCountries}`, {})
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          setCountriesData(objResponse.Data);
          if (checkObjNullorEmpty(userDetails) == false) {
            handleCountryChange(
              {
                value: userDetails.CountryId,
                label: userDetails.Country,
                shortname: userDetails.CountryShortName,
              },
              {
                value: userDetails.StateId,
                label: userDetails.State,
                shortname: userDetails.StateShortName,
              },
              { value: userDetails.CityId, label: userDetails.City }
            );
          }
        } else {
          setCountriesData([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlCountries}, Error ::" ${err}`);
        setCountriesData([]);
      })
      .finally(() => {});
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

  const handlePaymentTypeChange = (e) => {
    const { name, value } = e?.target;
    setSelectedPaymentType(e?.target?.value);
    calculateAmount(e?.target?.value);
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAccountTypeChange = (e) => {
    setAccountTypeSelected(e?.value);
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

    if (checkEmptyVal(accountTypeSelected)) {
      formErrors["ddlaccounttypes"] = ValidationMessages.AccountTypeReq;
    }

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader(
        "btnpay",
        "Payment processing...",
        API_ACTION_STATUS.START
      );
      setErrors({});

      if (selectedPaymentType.toLowerCase() == "ach") {
        let isapimethoderr = false;
        let objBodyParams = {
          FirstName: formData.txtfirstname,
          LastName: formData.txtlastname,
          EmailAddress: formData.txtemail,
          Address1: formData.txtaddressone,
          Address2: formData.txtaddresstwo,
          Country: countrySelected.shortname,
          State: stateSelected.shortname,
          City: citySelected.label,
          Zip: formData.txtzip,
          Amount: !checkObjNullorEmpty(amountFormData)
            ? amountFormData?.TotalPaymentAmount
            : invoiceDetails?.TaxDetails?.TotalPaymentAmount,
          AccountNumber: formData.txtaccountnumber,
          RoutingNumber: formData.txtroutingnumber,
          PaymentType: "ACH",
          TransCode: accountTypeSelected,
        };
        axiosPost(`${config.apiBaseUrl}${ApiUrls.createPaymentTransaction}`, {
          InvoiceNumber: invoiceDetails.InvoiceNumber,
          FromId: profileId,
          Tax: !checkObjNullorEmpty(amountFormData)
            ? amountFormData?.Tax
            : invoiceDetails?.TaxDetails?.Tax,
          Charges: !checkObjNullorEmpty(amountFormData)
            ? amountFormData?.ChargesAmount
            : invoiceDetails?.TaxDetails?.ChargesAmount,
          PaymentType: 2,
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
              `"API :: ${ApiUrls.createPaymentTransaction}, Error ::" ${err}`
            );
          })
          .finally(() => {
            if (isapimethoderr == true) {
              Toast.error(AppMessages.SomeProblem);
            }
            //Clear form
            formData.txtaccountnumber = "";
            formData.txtroutingnumber = "";
            setCountrySelected(null);
            setStateSelected(null);
            setCitySelected(null);
            apiReqResLoader("btnpay", "Pay", API_ACTION_STATUS.COMPLETED);
            navigate(routeNames.tenantpaymentsinvoices.path);
          });
      } else {
        usioGetToken({
          PaymentType: "CreditCard",
          EmailAddress: formData.txtemail,
          CardNumber: formData.txtcardnumber,
          ExpDate: formData.txtcardexpiry.replaceAll("/", ""),
          Cvv: formData.txtcvv,
          ProfileId: invoiceDetails.ProfileId,
        })
          .then((tokenResponse) => {
            let isapimethoderr = false;
            let objBodyParams = {
              FirstName: formData.txtfirstname,
              LastName: formData.txtlastname,
              EmailAddress: formData.txtemail,
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
              Amount: !checkObjNullorEmpty(amountFormData)
                ? amountFormData?.TotalPaymentAmount
                : invoiceDetails?.TaxDetails?.TotalPaymentAmount,
            };
            axiosPost(
              `${config.apiBaseUrl}${ApiUrls.createPaymentTransaction}`,
              {
                InvoiceNumber: invoiceDetails.InvoiceNumber,
                FromId: profileId,
                Tax: !checkObjNullorEmpty(amountFormData)
                  ? amountFormData?.Tax
                  : invoiceDetails?.TaxDetails?.Tax,
                Charges: !checkObjNullorEmpty(amountFormData)
                  ? amountFormData?.ChargesAmount
                  : invoiceDetails?.TaxDetails?.ChargesAmount,
                PaymentDetails: Encrypt(JSON.stringify(objBodyParams)),
                PaymentType: 1,
              }
            )
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
                  `"API :: ${ApiUrls.createPaymentTransaction}, Error ::" ${err}`
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
                setCountrySelected(null);
                setStateSelected(null);
                setCitySelected(null);
                apiReqResLoader("btnpay", "Pay", API_ACTION_STATUS.COMPLETED);
                navigate(routeNames.tenantpaymentsinvoices.path);
              });
          })
          .catch((err) => {
            console.error(`"API Token Error ::" ${err}`);
          });
      }
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const [showEditAmount, setShowEditAmount] = useState(false);
  const toggleEditAmount = (e) => {
    setShowEditAmount(!showEditAmount);
    if (checkObjNullorEmpty(amountFormData)) {
      setAmountFormData({
        ...invoiceDetails.TaxDetails,
        TotalAmount: invoiceDetails.TotalAmount,
        TotalAmountDisplay: invoiceDetails.TotalAmountDisplay,
        TotalAmountBeforeEdit: invoiceDetails.TotalAmount,
      });
    }
  };

  const handleAmountInputChange = (e) => {
    setAmountFormData({
      ...amountFormData,
      TotalAmount: e?.target?.value,
    });
  };

  const onCancelAmountChange = (e) => {
    e.preventDefault();
    setAmountFormData({
      ...amountFormData,
      TotalAmount: amountFormData.TotalAmountBeforeEdit,
    });
    toggleEditAmount(e);
  };

  const onAmountChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    calculateAmount();
  };

  const calculateAmount = (paymentType) => {
    apiReqResLoader("x", "x", API_ACTION_STATUS.START);

    let isapimethoderr = false;
    let objBodyParams = {
      Amount: amountFormData.TotalAmount,
      PaymentType: checkEmptyVal(paymentType)
        ? selectedPaymentType
        : paymentType,
    };
    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.calculatePaymentAmount}`,
      objBodyParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (response.status === 200) {
          setAmountFormData({
            ...amountFormData,
            ...objResponse,
            TotalAmountBeforeEdit: objResponse.TotalAmount,
          });
          setShowEditAmount(false);
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(
          `"API :: ${ApiUrls.calculatePaymentAmount}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
      });
  };

  const navigateToInvoices = () => {
    navigate(routeNames.tenantpaymentsinvoices.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="mx-auto col-md-12 col-xl-10">
              <div className="row">
                <div className="col-6">
                  <div className="breadcrumb">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-3 down-line pb-10">Invoices</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <label className="font-general font-500 cur-default">
                        Checkout
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10"></div>
              </div>
              <div className="row">
                <div className="col-xl-4 col-lg-4">
                  <div className="widget bg-white box-shadow rounded px-0 mb-20">
                    <h6 className="mb-3 down-line pb-10 px-20 down-line-mx20">
                      Payment Summary
                    </h6>
                    {!checkObjNullorEmpty(invoiceDetails) && (
                      <div className="px-20">
                        <div className="post-content pb-0">
                          <div className="row listing-location mb-2 font-general font-500">
                            <span className="col text-left">
                              Invoice#: {invoiceDetails.InvoiceNumber}
                            </span>
                          </div>
                          <div className="row listing-location mb-2 font-general font-500">
                            <span className="col text-left">Amount</span>
                            <span className="col text-right">
                              {!showEditAmount ? (
                                <>
                                  <i
                                    className="fa fa-pen font-small text-primary px-2 cur-pointer"
                                    onClick={(e) => toggleEditAmount(e)}
                                  />
                                  {!checkObjNullorEmpty(amountFormData)
                                    ? amountFormData.TotalAmountDisplay
                                    : invoiceDetails.TotalAmountDisplay}
                                </>
                              ) : (
                                <div className="d-flex grid-search">
                                  <InputControl
                                    lblClass="mb-0 lbl-req-field d-none"
                                    name="txtprice"
                                    ctlType={formCtrlTypes.amount}
                                    required={true}
                                    onChange={handleAmountInputChange}
                                    value={amountFormData.TotalAmount}
                                    inputClass="w-120px px-2 py-0 h-30px"
                                  ></InputControl>
                                  <i
                                    className="fa fa-check-circle d-flex flex-center font-general text-primary px-2 cur-pointer"
                                    onClick={(e) => onAmountChange(e)}
                                  />
                                  <i
                                    className="fa fa-times-circle d-flex flex-center font-general text-error px-0 cur-pointer"
                                    onClick={(e) => onCancelAmountChange(e)}
                                  />
                                </div>
                              )}
                            </span>
                          </div>
                          <div className="row listing-location mb-2 font-general font-500">
                            {checkObjNullorEmpty(amountFormData) ? (
                              <>
                                <span className="col text-left">
                                  {selectedPaymentType.toLowerCase() ==
                                  "creditcard" ? (
                                    <>
                                      CC Charges (
                                      {
                                        invoiceDetails.TaxDetails
                                          ?.ChargesPercentageDisplay
                                      }
                                      )
                                    </>
                                  ) : (
                                    <>Fee</>
                                  )}
                                </span>
                                <span className="col text-right">
                                  {
                                    invoiceDetails.TaxDetails
                                      ?.ChargesAmountDisplay
                                  }
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="col text-left">
                                  {selectedPaymentType.toLowerCase() ==
                                  "creditcard" ? (
                                    <>
                                      CC Charges (
                                      {
                                        invoiceDetails.TaxDetails
                                          ?.ChargesPercentageDisplay
                                      }
                                      )
                                    </>
                                  ) : (
                                    <>Fee</>
                                  )}
                                </span>
                                <span className="col text-right">
                                  {amountFormData?.ChargesAmountDisplay}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="row listing-location mb-2 font-general font-500">
                            <span className="col text-left">Tax</span>
                            <span className="col text-right">
                              {checkObjNullorEmpty(amountFormData)
                                ? invoiceDetails.TaxDetails?.TaxDisplay
                                : amountFormData?.TaxDisplay}
                            </span>
                          </div>
                          <hr className="w-100 text-primary my-10"></hr>
                          <div className="row listing-location mb-2 text-primary font-general font-500">
                            <span className="col text-left">Total Amount</span>
                            <span className="col text-right">
                              {checkObjNullorEmpty(amountFormData)
                                ? invoiceDetails.TaxDetails
                                    ?.TotalPaymentAmountDisplay
                                : amountFormData?.TotalPaymentAmountDisplay}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-xl-8 col-lg-8">
                  <form noValidate>
                    {/*============== Carddetails Start ==============*/}
                    <div className="full-row px-3 py-4 bg-white box-shadow rounded">
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col px-0">
                            <h6 className="mb-3 down-line  pb-10">
                              Payment Type
                            </h6>
                            <div className="row my-20">
                              {paymentTypes.map((pt, idx) => {
                                return (
                                  <div
                                    className="col-6 text-left"
                                    key={"ptkey-" + idx}
                                  >
                                    <div
                                      className={`custom-check-box-2  text-left`}
                                    >
                                      <input
                                        className="d-none"
                                        type="radio"
                                        value={pt.PaymentTypeId}
                                        checked={
                                          selectedPaymentType ==
                                          pt.PaymentTypeId
                                        }
                                        id={"pt-" + pt.PaymentTypeId}
                                        name="rblpaymenttype"
                                        onChange={(e) => {
                                          handlePaymentTypeChange(e);
                                        }}
                                      />
                                      <label
                                        htmlFor={"pt-" + pt.PaymentTypeId}
                                        className="radio-lbl"
                                      >
                                        {pt.PaymentType}
                                      </label>
                                    </div>
                                  </div>
                                );
                              })}
                              {errors?.[`rblpaymenttype`] && (
                                <div className="err-invalid">
                                  {errors?.[`rblpaymenttype`]}
                                </div>
                              )}
                            </div>
                            {selectedPaymentType.toLowerCase() ==
                            "creditcard" ? (
                              <>
                                <h6 className="mb-3 down-line  pb-10">
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
                                      tabIndex={2}
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
                                      tabIndex={3}
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
                              </>
                            ) : (
                              <>
                                <h6 className="mb-3 down-line  pb-10">
                                  Account Details
                                </h6>
                                <div className="row">
                                  <div className="col-md-4 mb-15">
                                    <InputControl
                                      lblClass="mb-0 lbl-req-field"
                                      name="txtaccountnumber"
                                      ctlType={formCtrlTypes.accountnum}
                                      isFocus={true}
                                      required={true}
                                      onChange={handleChange}
                                      value={formData.txtaccountnumber}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={2}
                                    ></InputControl>
                                  </div>
                                  <div className="col-md-4 mb-15">
                                    <InputControl
                                      lblClass="mb-0 lbl-req-field"
                                      name="txtroutingnumber"
                                      ctlType={formCtrlTypes.routingnum}
                                      isFocus={true}
                                      required={true}
                                      onChange={handleChange}
                                      value={formData.txtroutingnumber}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={3}
                                    ></InputControl>
                                  </div>
                                  <div className="col-md-4 mb-15">
                                    <AsyncSelect
                                      placeHolder={AppMessages.DdlDefaultSelect}
                                      noData={AppMessages.NoData}
                                      options={accountTypes}
                                      onChange={handleAccountTypeChange}
                                      value={accountTypeSelected}
                                      defualtselected={accountTypeSelected}
                                      name="ddlaccounttypes"
                                      lbl={formCtrlTypes.accounttype}
                                      lblClass="mb-0 lbl-req-field"
                                      required={true}
                                      isClearable={false}
                                      isSearchable={false}
                                      errors={errors}
                                      formErrors={formErrors}
                                      tabIndex={4}
                                    ></AsyncSelect>
                                  </div>
                                </div>
                              </>
                            )}
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
                            <h6 className="mb-3 down-line  pb-10">
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
                                  tabIndex={7}
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
                                  tabIndex={8}
                                ></InputControl>
                              </div>
                              <div className="col-md-6 mb-15">
                                <InputControl
                                  lblClass="mb-0"
                                  name="txtaddresstwo"
                                  ctlType={formCtrlTypes.addresstwo}
                                  onChange={handleChange}
                                  value={formData.txtaddresstwo}
                                  errors={errors}
                                  formErrors={formErrors}
                                  tabIndex={9}
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
                                      tabIndex={10}
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
                                      tabIndex={11}
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
                                      tabIndex={12}
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
                                  tabIndex={13}
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
                              onClick={navigateToInvoices}
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

export default InvoiceCheckout;
