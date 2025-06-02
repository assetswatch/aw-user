import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  Encrypt,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  SessionStorageKeys,
  UserCookie,
  ValidationMessages,
} from "../../../utils/constants";
import { Toast } from "../../../components/common/ToastView";
import { axiosPost } from "../../../helpers/axiosHelper";
import { routeNames } from "../../../routes/routes";
import {
  addSessionStorageItem,
  getsessionStorageItem,
} from "../../../helpers/sessionStorageHelper";
import InputControl from "../../../components/common/InputControl";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { useGetInvoiceItemForTypesGateway } from "../../../hooks/useGetInvoiceItemForTypesGateway";
import { useGetInvoiceItemAccountForTypesGateway } from "../../../hooks/usegetInvoiceItemAccountForTypesGateway";
import { useGetDdlInvoiceForItemsGateway } from "../../../hooks/useGetDdlInvoiceForItemsGateway";
import TextAreaControl from "../../../components/common/TextAreaControl";
import DateControl from "../../../components/common/DateControl";
import GoBackPanel from "../../../components/common/GoBackPanel";

const CreateAccount = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let formErrors = {};
  const [errors, setErrors] = useState({});

  function setInitialFormData() {
    return {
      txtdbaname: "",
      txtlegalname: "",
      txtbusinessdescription: "",
      txtbusinessstartdate: "",
      txtemail: "",
      txtphone: "",
      txtwebsite: "",
      txtfederaltaxid: "",
      txtaddress: "",
      txtcity: "",
      txtzip: "",
      txtaccountnumber: "",
      txtroutingnumber: "",
      txtbusinessnameonaccount: "",
      txtfname: "",
      txtlname: "",
      txtlast4ssn: "",
      txtdateofbirth: "",
      txtownerphone: "",
      txtowneraddress: "",
      txtownercity: "",
      txtownerzip: "",
    };
  }
  const [formData, setFormData] = useState(setInitialFormData());

  const [statesData, setStatesData] = useState([]);
  const [stateSelected, setStateSelected] = useState(null);
  const [ownerStateSelected, setOwnerStateSelected] = useState(null);
  const [accountTypes, setAccountTypes] = useState([
    { Text: "Personal", Id: true },
    { Text: "Commercial", Id: false },
  ]);
  const [accountTypeSelected, setAccountTypeSelected] = useState(
    accountTypes[0].Id
  );

  //Load
  useEffect(() => {
    Promise.allSettled([getUserDetails()]).then(() => {});
  }, []);

  const getUserDetails = () => {
    let isapimethoderr = false;
    let objSubAccountsParams = {};
    objSubAccountsParams = {
      AccountId: accountId,
      ProfileId: profileId,
      Status: `${config.paymentAccountCreateStatus.Pending},${config.paymentAccountCreateStatus.Processing}`,
    };
    axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getPaymentSubAccountsCountByStatus}`,
      objSubAccountsParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (objResponse.Data.TotalCount > 0) {
            navigateToPaymentsAccounts();
          } else {
            let objParams = {
              // AccountId: accountId,
              ProfileId: profileId,
            };
            axiosPost(
              `${config.apiBaseUrl}${ApiUrls.getUserDetails}`,
              objParams
            )
              .then((response) => {
                let objResponse = response.data;
                if (objResponse.StatusCode === 200) {
                  let details = objResponse.Data;
                  if (checkObjNullorEmpty(details) == false) {
                    setFormData({
                      ...formData,
                      txtdbaname: details.FirstName,
                      txtlegalname: checkEmptyVal(details.CompanyName)
                        ? details.FirstName
                        : details.CompanyName,
                      txtemail: details.Email,
                      txtphone: details.MobileNo,
                      txtownerphone: details.MobileNo,
                      txtfname: details.FirstName,
                      txtlname: details.LastName,
                      txtwebsite: details.Website,
                      txtaddress: details.AddressOne,
                      txtowneraddress: details.AddressOne,
                      txtzip: details.Zip,
                      txtownerzip: details.Zip,
                      txtcity: details.City,
                      txtownercity: details.City,
                      txtbusinessnameonaccount: details.FirstName,
                    });
                    getStates(details.CountryId, details);
                  }
                }
              })
              .catch((err) => {
                console.error(
                  `"API :: ${ApiUrls.getUserDetails}, Error ::" ${err}`
                );
              })
              .finally(() => {});
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(
          `"API :: ${ApiUrls.getPaymentSubAccountsCountByStatus}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr === true) {
          Toast.error(AppMessages.SomeProblem);
          navigateToPaymentsAccounts();
        }
      });
  };

  const getStates = (countryid, selState) => {
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlStates}`, {
      CountryId: parseInt(countryid),
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setStatesData(objResponse.Data);
          handleStateChange({
            value: selState.StateId,
            label: selState.State,
            shortname: selState.StateShortName,
          });
          handleOwnerStateChange({
            value: selState.StateId,
            label: selState.State,
            shortname: selState.StateShortName,
          });
        } else {
          setStatesData([]);
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlStates}, Error ::" ${err}`);
        setStatesData([]);
      })
      .finally(() => {});
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onDateChange = (newDate, name) => {
    setFormData({
      ...formData,
      [name]: newDate,
    });
  };

  const handleStateChange = (selItem) => {
    setStateSelected(selItem);
    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }
  };

  const handleOwnerStateChange = (selItem) => {
    setOwnerStateSelected(selItem);
    if (selItem == null || selItem == undefined || selItem == "") {
      return;
    }
  };

  const handleAccountTypeChange = (e) => {
    setAccountTypeSelected(e?.value);
  };

  const onCreate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let errctl = "#form-error";
    $(errctl).html("");

    if (checkObjNullorEmpty(stateSelected)) {
      formErrors["ddlstates"] = ValidationMessages.StateReq;
    }

    if (checkObjNullorEmpty(ownerStateSelected)) {
      formErrors["ddlownerstates"] = ValidationMessages.StateReq;
    }

    if (checkEmptyVal(accountTypeSelected)) {
      formErrors["ddlaccounttypes"] = ValidationMessages.AccountTypeReq;
    }

    if (Object.keys(formErrors).length === 0) {
      setErrors({});
      apiReqResLoader("btnReview", "Processing", API_ACTION_STATUS.START);
      let isapimethoderr = false;

      let objAccountInfo = {
        DBA_Name: formData.txtdbaname,
        Legal_Name: formData.txtlegalname,
        Description: formData.txtbusinessdescription,
        Business_Start_Date: formData.txtbusinessstartdate.format("MM/DD/YYYY"),
        Email_Id: formData.txtemail,
        Phone: formData.txtphone,
        Website: formData.txtwebsite,
        Federal_Tax_Id: formData.txtfederaltaxid,
        Address: formData.txtaddress,
        State: stateSelected.shortname,
        City: formData.txtcity,
        Zip: formData.txtzip,
        Account_Number: formData.txtaccountnumber,
        Routing_Number: formData.txtroutingnumber,
        Business_Name_on_Account: formData.txtbusinessnameonaccount,
        Is_Personal: accountTypeSelected,
        Fees_Account_Is_Personal: accountTypeSelected,
        Fees_Account_Number: formData.txtaccountnumber,
        Fees_Routing_Number: formData.txtroutingnumber,
        Fees_Name_on_Account: formData.txtbusinessnameonaccount,
        Principal_First_Name: formData.txtfname,
        Principal_Last_Name: formData.txtlname,
        Principal_Last_4_SSN: formData.txtlast4ssn,
        Principal_Date_Of_Birth: formData.txtdateofbirth.format("MM/DD/YYYY"),
        Principal_Phone: formData.txtownerphone,
        Principal_Address: formData.txtowneraddress,
        Principal_State: ownerStateSelected.shortname,
        Principal_City: formData.txtownercity,
        Principal_Zip: formData.txtownerzip,
      };

      let objParams = {
        Email: formData.txtemail,
        DbaName: formData.txtdbaname,
        LegalName: formData.txtlegalname,
        AccountId: accountId,
        ProfileId: profileId,
        ChannelId: 1,
        AccountInfo: Encrypt(JSON.stringify(objAccountInfo)),
      };

      axiosPost(`${config.apiBaseUrl}${ApiUrls.createSubAccount}`, objParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Id > 0) {
              setFormData(setInitialFormData());
              addSessionStorageItem(
                SessionStorageKeys.ViewPaymentSubAccountId,
                objResponse.Data.Id
              );
              navigate(routeNames.paymentsaccountagreement.path);
            } else {
              Toast.error(objResponse.Data.Message);
            }
          } else if (objResponse.StatusCode === 400) {
            $(errctl).html(
              objResponse.Data.validationErrors
                .map((error) => `${error.errorDescription}`)
                .join("<br/><br/>")
            );
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(`"API :: ${ApiUrls.addInvoiceItem}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr == true) {
            $(errctl).html(AppMessages.SomeProblem);
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader("btnReview", "Review", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const navigateToPaymentsAccounts = () => {
    navigate(routeNames.paymentsaccounts.path);
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
                        onClick={navigateToPaymentsAccounts}
                      >
                        Payments
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Create Account
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-lg-8 shadow">
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded">
                  <div className="row row-cols-1 g-4 flex-center">
                    <div className="col">
                      <form noValidate>
                        <div className="row">
                          <div className="d-flex w-100">
                            <div className="flex-grow-1">
                              <h6 className="mb-3 down-line pb-10 px-0 font-16">
                                About Your Business
                              </h6>
                            </div>
                            <GoBackPanel
                              clickAction={navigateToPaymentsAccounts}
                              isformBack={true}
                            />
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtdbaname"
                              ctlType={formCtrlTypes.dbaname}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtdbaname}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={1}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtlegalname"
                              ctlType={formCtrlTypes.legalname}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtlegalname}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={2}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtbusinessdescription"
                              ctlType={formCtrlTypes.businessdescription}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtbusinessdescription}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={3}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <DateControl
                              lblClass="mb-0 lbl-req-field"
                              lblText="Business Start Date: "
                              name="txtbusinessstartdate"
                              required={true}
                              onChange={(dt) =>
                                onDateChange(dt, "txtbusinessstartdate")
                              }
                              value={formData.txtbusinessstartdate}
                              isTime={false}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={4}
                            ></DateControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtphone"
                              ctlType={formCtrlTypes.phone}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtphone}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={5}
                            ></InputControl>
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
                              tabIndex={6}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtwebsite"
                              ctlType={formCtrlTypes.website}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtwebsite}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={7}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtfederaltaxid"
                              ctlType={formCtrlTypes.federaltaxid}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtfederaltaxid}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={8}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtaddress"
                              ctlType={formCtrlTypes.address50}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtaddress}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={9}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <AsyncSelect
                              placeHolder={
                                statesData.length <= 0 && stateSelected == null
                                  ? AppMessages.DdlDefaultSelect
                                  : AppMessages.DdlDefaultSelect
                              }
                              noData={
                                statesData.length <= 0 && stateSelected == null
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
                              isClearable={false}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={10}
                            ></AsyncSelect>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtcity"
                              ctlType={formCtrlTypes.txtcity}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtcity}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={11}
                            ></InputControl>
                          </div>
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
                          <h6 className="mb-3 pt-20 down-line pb-10 mx-10 px-0 font-16">
                            Settlement Account Information
                          </h6>
                          <div className="col-md-6 mb-15">
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
                              tabIndex={13}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
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
                              tabIndex={14}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtbusinessnameonaccount"
                              ctlType={formCtrlTypes.businessnameonaccount}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtbusinessnameonaccount}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={15}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
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
                              tabIndex={16}
                            ></AsyncSelect>
                          </div>
                          <h6 className="mb-3 pt-20 down-line pb-10 mx-10 px-0 font-16">
                            Business Owner Information
                          </h6>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtfname"
                              ctlType={formCtrlTypes.paymentsubaccountfname}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtfname}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={17}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtlname"
                              ctlType={formCtrlTypes.paymentsubaccountlname}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtlname}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={18}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtlast4ssn"
                              ctlType={formCtrlTypes.last4ssn}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtlast4ssn}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={19}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <DateControl
                              lblClass="mb-0 lbl-req-field"
                              lblText="Date of Birth: "
                              name="txtdateofbirth"
                              required={true}
                              onChange={(dt) =>
                                onDateChange(dt, "txtdateofbirth")
                              }
                              value={formData.txtdateofbirth}
                              isTime={false}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={20}
                            ></DateControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtownerphone"
                              ctlType={formCtrlTypes.phone}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtownerphone}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={21}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtowneraddress"
                              ctlType={formCtrlTypes.address50}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtowneraddress}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={22}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <AsyncSelect
                              placeHolder={
                                statesData.length <= 0 &&
                                ownerStateSelected == null
                                  ? AppMessages.DdlDefaultSelect
                                  : AppMessages.DdlDefaultSelect
                              }
                              noData={
                                statesData.length <= 0 &&
                                ownerStateSelected == null
                                  ? AppMessages.DdLLoading
                                  : AppMessages.NoStates
                              }
                              options={statesData}
                              extraOptions={{
                                key: "shortname",
                                dataVal: "ShortName",
                              }}
                              onChange={handleOwnerStateChange}
                              value={ownerStateSelected}
                              name="ddlownerstates"
                              lbl={formCtrlTypes.state}
                              lblClass="mb-0 lbl-req-field"
                              required={true}
                              isClearable={false}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={23}
                            ></AsyncSelect>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtownercity"
                              ctlType={formCtrlTypes.txtcity}
                              isFocus={true}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtownercity}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={24}
                            ></InputControl>
                          </div>
                          <div className="col-md-6 mb-15">
                            <InputControl
                              lblClass="mb-0 lbl-req-field"
                              name="txtownerzip"
                              ctlType={formCtrlTypes.zip}
                              required={true}
                              onChange={handleChange}
                              value={formData.txtownerzip}
                              errors={errors}
                              formErrors={formErrors}
                              tabIndex={25}
                            ></InputControl>
                          </div>
                        </div>
                      </form>
                      <hr className="w-100 text-primary my-20"></hr>

                      <div className="row form-action flex- center mx-0">
                        <div
                          className="col-md-7 px-0 form-error"
                          id="form-error"
                        ></div>
                        <div className="col-md-5 px-0">
                          <button
                            className="btn btn-secondary"
                            id="btnCancel"
                            onClick={navigateToPaymentsAccounts}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary"
                            id="btnReview"
                            onClick={onCreate}
                          >
                            Review
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

export default CreateAccount;
