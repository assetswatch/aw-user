import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import {
  checkEmptyVal,
  checkObjNullorEmpty,
  SetAccordion,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { ApiUrls, AppMessages } from "../../../utils/constants";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import DateControl from "../../../components/common/DateControl";
import PersonalInformationForm from "./Forms/PersonalInformationForm";

const Application = () => {
  let $ = window.$;

  const steps = [
    "Personal info",
    "Household info",
    "Identity verification",
    "Employment history",
    "Residence history",
    "Review & submit",
  ];

  const [step, setStep] = useState(0);
  const percent = (step / (steps.length - 1)) * 100;

  let personalInfoFormErrors = {};
  const [personalInfoErrors, setPersonalInfoErrors] = useState({});
  const [personalInfoFormData, setPersonalInfoFormData] = useState(
    setInitialPersonalInfoFormData()
  );

  function setInitialPersonalInfoFormData() {
    return {
      txtfirstname: "",
      txtmiddlename: "",
      txtlastname: "",
      txtphone: "",
      txtemail: "",
      txtfewrentalhistorydetails: "",
      ddloccupants: "1",
      rblismoker: "N",
      ddlpets: "0",
      txtpetsdescription: "",
      txtlegalfirstname: "",
      txtlegalmiddlename: "",
      txtlegallastname: "",
      txtlegalcurrentaddress: "",
      ddllegalstate: null,
      ddllegalcity: null,
      txtlegalzip: "",
      txtlegalssn: "",
      txtlegaldob: null,
      txtlegalphone: "",
      ddlemploymenttype: null,
      txtemploymentmonthlyincome: "0.00",
      txtemploymentjobtitle: "",
      txtemploymentemployername: "",
      txtemploymentstartedon: null,
      txtemploymentemployercontactname: "",
      txtemploymentemployercontactphone: "",
      txttemploymentemployercontactemail: "",
      txtemploymentotherinfo: "",
      ddlrestype: null,
      txtresaddress: "",
      ddlresstate: null,
      ddlrescity: null,
      txtreszip: "",
      txtresmovedin: null,
      txtresmonthlyrent: "0.00",
      txtresreasonformoving: "",
      txtreslandlordname: "",
      txtreslandlordcontactphone: "",
      txtreslandlordcontactemail: "",
      txtrespreferredmoveindate: null,
    };
  }

  const [statesData, setStatesData] = useState([]);
  const [legalCitiesData, setLegalCitiesData] = useState([]);

  useEffect(() => {
    getStates();
  }, []);

  const getStates = () => {
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlStates}`, {
      CountryId: parseInt(231),
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
      .finally(() => {});
  };

  const getCities = (stateid, ctl) => {
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlCities}`, {
      StateId: parseInt(stateid),
    })
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          if (ctl === "ddllegalcity") {
            setLegalCitiesData(objResponse.Data);
          }
        } else {
          if (ctl === "ddllegalcity") {
            setLegalCitiesData([]);
          }
        }
      })
      .catch((err) => {
        console.error(`"API :: ${ApiUrls.getDdlCities}, Error ::" ${err}`);
        if (ctl === "ddllegalcity") {
          setLegalCitiesData([]);
        }
      })
      .finally(() => {});
  };

  const handlepersonalInfoChange = (e, ctlname, ctlType) => {
    if (ctlType === "ddl") {
      setPersonalInfoFormData({
        ...personalInfoFormData,
        [ctlname]: e?.value,
      });
    } else {
      const { name, value } = e?.target;
      setPersonalInfoFormData({
        ...personalInfoFormData,
        [name]: value,
      });
    }
  };

  const handleLegalStateChange = (e) => {
    setLegalCitiesData([]);

    setPersonalInfoFormData({
      ...personalInfoFormData,
      ddllegalstate: e?.value,
      ddllegalcity: null,
    });

    if (e == null || e == undefined || e == "") {
      return;
    }

    getCities(e?.value, "ddllegalcity");
  };

  const handleLegalCityChange = (e) => {
    setPersonalInfoFormData({
      ...personalInfoFormData,
      ddllegalcity: e?.value,
    });
  };

  const onDateChange = (newDate, name) => {
    setPersonalInfoFormData({
      ...personalInfoFormData,
      [name]: newDate,
    });
  };

  function GenerateDdlNumbersList(min, max) {
    const list = [];
    for (let i = min; i <= max; i++) {
      list.push({ Id: i.toString(), Text: i.toString() });
    }
    return list;
  }

  function GenerateRblYesNo() {
    return [
      { Id: "Y", Text: "Yes" },
      { Id: "N", Text: "No" },
    ];
  }

  function GetEmplomentTypes() {
    return [
      { Id: "Employment", Text: "Employment" },
      {
        Id: "Contract or Self Employment",
        Text: "Contract or Self Employment",
      },
      {
        Id: "Other",
        Text: "Other (Specify)",
      },
    ];
  }

  function GetResidenceTypes() {
    return [
      { Id: "Rented", Text: "Rented" },
      {
        Id: "Owned",
        Text: "Owned",
      },
      {
        Id: "Other",
        Text: "Other",
      },
    ];
  }

  useEffect(() => {
    if (document.querySelector(".bb-accordion") !== null) {
      $(".ac-toggle").on("click", function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass("active") && $this.next().hasClass("show")) {
          $this.removeClass("active");
          $this.next().removeClass("show");
          $this.next().slideUp(350);
        } else {
          // Check accordion type: for single item open
          if ($this.parent().parent().hasClass("ac-single-show")) {
            $this
              .parent()
              .parent()
              .find(".ac-card .ac-toggle")
              .removeClass("active");
            $this
              .parent()
              .parent()
              .find(".ac-card .ac-collapse")
              .removeClass("show");
            $this.parent().parent().find(".ac-card .ac-collapse").slideUp(350);
            $this.addClass("active");
            $this.next().addClass("show");
            $this.next().slideDown(350);
          }

          // Check accordion type: for group item open
          else if ($this.parent().parent().hasClass("ac-group-show")) {
            $this.addClass("active");
            $this.next().addClass("show");
            $this.next().slideDown(350);
          }

          // Default if not use any accordion type
          else {
            $this
              .parent()
              .parent()
              .find(".ac-card .ac-toggle")
              .removeClass("active");
            $this
              .parent()
              .parent()
              .find(".ac-card .ac-collapse")
              .removeClass("show");
            $this.parent().parent().find(".ac-card .ac-collapse").slideUp(350);
            $this.addClass("active");
            $this.next().addClass("show");
            $this.next().slideDown(350);
          }
        }
      });
    }
  }, [step === 5]);

  return (
    <>
      {SetPageLoaderNavLinks()}
      {SetAccordion()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-11 col-xl-9 shadow">
            <div className="bg-white xs-p-20 p-30 pb-50 border rounded">
              <div className="row">
                <div className="col-9">
                  <div className="breadcrumb">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-2 down-line pb-10">Application</h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        {steps[step]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-3 d-flex flex-ai-t flex-jc-r text-end pt-2">
                  <button
                    type="button"
                    className="btn btn-glow px-0 rounded-circle text-primary lh-1 d-flex flex-center"
                    // onClick={navigateToInvoices}
                  >
                    <i className="icons font-18 icon-arrow-left-circle text-primary me-1"></i>
                    <span className="font-general">Back</span>
                  </button>
                </div>
              </div>
              <div className="row pt-10 pb-20 row-cols-1 g-4 flex-center">
                {/* --- Wizard Indicator --- */}
                <div className="wizard-container mt-3 mb-3">
                  {steps.map((label, index) => (
                    <div
                      key={index}
                      className={`cur-pointer step-wrapper ${
                        index < step
                          ? "completed"
                          : index === step
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setStep(index);
                      }}
                    >
                      <div className="step-circle">
                        {/* {index + 1} */}
                        <i
                          className={`fas ${
                            index === 0
                              ? "fa-user"
                              : index === 1
                              ? "fa-house"
                              : index === 2
                              ? "fa-id-card"
                              : index === 3
                              ? "fa-briefcase"
                              : index === 4
                              ? "fa-house"
                              : index === 5
                              ? "fa-file-alt"
                              : ""
                          }`}
                        ></i>
                      </div>
                      <div className="step-label application font-500">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-50">
                  {/* --- Form Body (example for step 0) --- */}
                  <form noValidate>
                    {step === 0 && <PersonalInformationForm />}
                    {step === 1 && (
                      <div className="row">
                        <input
                          name="txtdummyfocus"
                          className="lh-0 h-0 p-0 bo-0"
                          autoFocus
                        ></input>
                        <h6 className="text-primary col-md-6">
                          Occupants Details
                        </h6>
                        <h6 className="text-primary col-md-6">Pets Details</h6>
                        <div className="col-md-6 mb-20">
                          <AsyncSelect
                            placeHolder={AppMessages.DdlDefaultSelect}
                            noData={AppMessages.NoData}
                            options={GenerateDdlNumbersList(1, 12)}
                            onChange={(e) =>
                              handlepersonalInfoChange(e, "ddloccupants", "ddl")
                            }
                            value={personalInfoFormData.ddloccupants}
                            name="ddloccupants"
                            lblClass="mb-0 lbl-req-field"
                            lblText="Number of residents (including children):"
                            required={true}
                            isClearable={false}
                            isSearchable={false}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={1}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-6 mb-20">
                          <AsyncSelect
                            placeHolder={AppMessages.DdlDefaultSelect}
                            noData={AppMessages.NoData}
                            options={GenerateDdlNumbersList(0, 20)}
                            onChange={(e) =>
                              handlepersonalInfoChange(e, "ddlpets", "ddl")
                            }
                            value={personalInfoFormData.ddlpets}
                            name="ddlpets"
                            lblClass="mb-0 lbl-req-field"
                            lblText="Number of pets in the household:"
                            required={true}
                            isClearable={false}
                            isSearchable={false}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={3}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-6 mb-20">
                          <label className="mb-0 lbl-req-field">
                            Does anyone in the household smoke?
                          </label>
                          <div className="row">
                            {GenerateRblYesNo().map((t, idx) => {
                              return (
                                <div
                                  className="col-6 text-left"
                                  key={"issmokerkey-" + idx}
                                >
                                  <div
                                    className={`custom-check-box-2  text-left`}
                                  >
                                    <input
                                      className="d-none"
                                      type="radio"
                                      value={t.Id}
                                      checked={
                                        personalInfoFormData.rblismoker == t.Id
                                      }
                                      id={"issmoker-" + t.Id}
                                      name="rblismoker"
                                      onChange={handlepersonalInfoChange}
                                    />
                                    <label
                                      htmlFor={"issmoker-" + t.Id}
                                      className="radio-lbl"
                                    >
                                      {t.Text}
                                    </label>
                                  </div>
                                </div>
                              );
                            })}
                            {personalInfoErrors?.[`rblismoker`] && (
                              <div className="err-invalid">
                                {personalInfoErrors?.[`rblismoker`]}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6 mb-15">
                          <TextAreaControl
                            lblClass="mb-0"
                            lblText="Pets description (optional): "
                            name="txtpetsdescription"
                            ctlType={formCtrlTypes.max1000}
                            required={false}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtpetsdescription}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={4}
                            rows={3}
                          ></TextAreaControl>
                        </div>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="row">
                        <input
                          name="txtdummyfocus"
                          className="lh-0 h-0 p-0 bo-0"
                          autoFocus
                        ></input>
                        <h6 className="text-primary">
                          Provide your details for verification.
                        </h6>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            name="txtlegalfirstname"
                            ctlType={formCtrlTypes.fname}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtlegalfirstname}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={1}
                            isFocus={true}
                          ></InputControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0"
                            name="txtlegalmiddlename"
                            ctlType={formCtrlTypes.mname}
                            required={false}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtlegalmiddlename}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={2}
                          ></InputControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            name="txtlegallastname"
                            ctlType={formCtrlTypes.lname}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtlegallastname}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={3}
                          ></InputControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText={"Current address:"}
                            name="txtlegalcurrentaddress"
                            ctlType={formCtrlTypes.address}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtlegalcurrentaddress}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={4}
                          ></InputControl>
                        </div>
                        <div className="col-md-4 mb-15">
                          <AsyncSelect
                            placeHolder={
                              statesData.length <= 0 &&
                              personalInfoFormData.ddllegalstate == null
                                ? AppMessages.DdLLoading
                                : AppMessages.DdlDefaultSelect
                            }
                            noData={AppMessages.NoStates}
                            options={statesData}
                            onChange={handleLegalStateChange}
                            value={personalInfoFormData.ddllegalstate}
                            name="ddllegalstates"
                            lbl={formCtrlTypes.state}
                            lblClass="mb-0 lbl-req-field"
                            required={true}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={5}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-4 mb-15">
                          <AsyncSelect
                            placeHolder={
                              personalInfoFormData.ddllegalstate == null ||
                              Object.keys(personalInfoFormData.ddllegalstate)
                                .length === 0
                                ? AppMessages.DdlDefaultSelect
                                : legalCitiesData.length <= 0 &&
                                  personalInfoFormData.ddllegalcity == null
                                ? AppMessages.DdLLoading
                                : AppMessages.DdlDefaultSelect
                            }
                            noData={
                              personalInfoFormData.ddllegalstate == null ||
                              Object.keys(personalInfoFormData.ddllegalstate)
                                .length === 0
                                ? AppMessages.NoCities
                                : legalCitiesData.length <= 0 &&
                                  personalInfoFormData.ddllegalcity == null &&
                                  personalInfoFormData.ddllegalstate != null
                                ? AppMessages.DdLLoading
                                : AppMessages.NoCities
                            }
                            options={legalCitiesData}
                            onChange={handleLegalCityChange}
                            value={personalInfoFormData.ddllegalcity}
                            name="ddllegalcity"
                            lbl={formCtrlTypes.city}
                            lblClass="mb-0 lbl-req-field"
                            required={true}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={6}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-4 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            name="txtlegalzip"
                            ctlType={formCtrlTypes.zip}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtlegalzip}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={7}
                          ></InputControl>
                        </div>
                        <div className="col-md-4 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            name="txtlegalphone"
                            ctlType={formCtrlTypes.phone}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtlegalphone}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={8}
                          ></InputControl>
                        </div>
                        <div className="col-md-4 mb-15">
                          <DateControl
                            lblClass="mb-0 lbl-req-field"
                            lblText="Date of birth:"
                            name="txtlegaldob"
                            required={true}
                            onChange={(dt) => onDateChange(dt, "txtlegaldob")}
                            value={personalInfoFormData.txtlegaldob}
                            isTime={false}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={9}
                          ></DateControl>
                        </div>
                        <div className="col-md-4 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            name="txtlegalssn"
                            placeHolder="XXX-XX-XXXX"
                            ctlType={formCtrlTypes.ssn}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtlegalssn}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={10}
                          ></InputControl>
                        </div>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="row">
                        <input
                          name="txtdummyfocus"
                          className="lh-0 h-0 p-0 bo-0"
                          autoFocus
                        ></input>
                        <h6 className="text-primary">
                          Current Employment Details.
                        </h6>
                        <div className="col-md-6 mb-15">
                          <AsyncSelect
                            placeHolder={AppMessages.DdlDefaultSelect}
                            noData={AppMessages.NoData}
                            options={GetEmplomentTypes()}
                            onChange={(e) =>
                              handlepersonalInfoChange(
                                e,
                                "ddlemploymenttype",
                                "ddl"
                              )
                            }
                            value={personalInfoFormData.ddlemploymenttype}
                            name="ddlemploymenttype"
                            lblClass="mb-0 lbl-req-field"
                            lblText="Employment type:"
                            required={true}
                            isClearable={false}
                            isSearchable={false}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={1}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0"
                            lblText="Monthly income before taxes($):"
                            name="txtemploymentmonthlyincome"
                            ctlType={formCtrlTypes.price}
                            required={false}
                            onChange={handlepersonalInfoChange}
                            value={
                              personalInfoFormData.txtemploymentmonthlyincome
                            }
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={2}
                          ></InputControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText="Job title:"
                            name="txtemploymentjobtitle"
                            ctlType={formCtrlTypes.propertytitle}
                            required={false}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtemploymentjobtitle}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={3}
                          ></InputControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText={"Employer name:"}
                            name="txtemploymentemployername"
                            ctlType={formCtrlTypes.fname}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={
                              personalInfoFormData.txtemploymentemployername
                            }
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={4}
                          ></InputControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <DateControl
                            lblClass="mb-0 lbl-req-field"
                            lblText="Started on:"
                            name="txtemploymentstartedon"
                            required={true}
                            onChange={(dt) =>
                              onDateChange(dt, "txtemploymentstartedon")
                            }
                            value={personalInfoFormData.txtemploymentstartedon}
                            isTime={false}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={5}
                          ></DateControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText={"Employer contact name:"}
                            name="txtemploymentemployercontactname"
                            ctlType={formCtrlTypes.fname}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={
                              personalInfoFormData.txtemploymentemployercontactname
                            }
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={6}
                          ></InputControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText={"Employer contact email:"}
                            name="txttemploymentemployercontactemail"
                            ctlType={formCtrlTypes.email}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={
                              personalInfoFormData.txttemploymentemployercontactemail
                            }
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={7}
                          ></InputControl>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText={"Employer contact phone:"}
                            name="txtemploymentemployercontactphone"
                            ctlType={formCtrlTypes.phone}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={
                              personalInfoFormData.txtemploymentemployercontactphone
                            }
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={8}
                          ></InputControl>
                        </div>
                        <div className="col-md-12 mb-15">
                          <TextAreaControl
                            lblClass="mb-0"
                            lblText="Other information (optional): "
                            name="txtemploymentotherinfo"
                            ctlType={formCtrlTypes.message}
                            required={false}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtemploymentotherinfo}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={9}
                            rows={3}
                          ></TextAreaControl>
                        </div>
                      </div>
                    )}
                    {step === 4 && (
                      <div className="row">
                        <input
                          name="txtdummyfocus"
                          className="lh-0 h-0 p-0 bo-0"
                          autoFocus
                        ></input>
                        <h6 className="text-primary">
                          Current residence details.
                        </h6>
                        <div className="col-md-6 mb-15">
                          <AsyncSelect
                            placeHolder={AppMessages.DdlDefaultSelect}
                            noData={AppMessages.NoData}
                            options={GetResidenceTypes()}
                            onChange={(e) =>
                              handlepersonalInfoChange(e, "ddlrestype", "ddl")
                            }
                            value={personalInfoFormData.ddlrestype}
                            name="ddlrestype"
                            lblClass="mb-0 lbl-req-field"
                            lblText="Residence type:"
                            required={true}
                            isClearable={false}
                            isSearchable={false}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={1}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-6 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText={"Address:"}
                            name="txtresaddress"
                            ctlType={formCtrlTypes.address}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtresaddress}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={2}
                          ></InputControl>
                        </div>
                        <div className="col-md-4 mb-15">
                          <AsyncSelect
                            placeHolder={
                              statesData.length <= 0 &&
                              personalInfoFormData.ddlresstate == null
                                ? AppMessages.DdLLoading
                                : AppMessages.DdlDefaultSelect
                            }
                            noData={AppMessages.NoStates}
                            options={statesData}
                            onChange={handleLegalStateChange}
                            value={personalInfoFormData.ddlresstate}
                            name="ddlresstate"
                            lbl={formCtrlTypes.state}
                            lblClass="mb-0 lbl-req-field"
                            required={true}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={3}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-4 mb-15">
                          <AsyncSelect
                            placeHolder={
                              personalInfoFormData.ddlresstate == null ||
                              Object.keys(personalInfoFormData.ddlresstate)
                                .length === 0
                                ? AppMessages.DdlDefaultSelect
                                : legalCitiesData.length <= 0 &&
                                  personalInfoFormData.ddlrescity == null
                                ? AppMessages.DdLLoading
                                : AppMessages.DdlDefaultSelect
                            }
                            noData={
                              personalInfoFormData.ddlresstate == null ||
                              Object.keys(personalInfoFormData.ddlresstate)
                                .length === 0
                                ? AppMessages.NoCities
                                : legalCitiesData.length <= 0 &&
                                  personalInfoFormData.ddlrescity == null &&
                                  personalInfoFormData.ddlresstate != null
                                ? AppMessages.DdLLoading
                                : AppMessages.NoCities
                            }
                            options={legalCitiesData}
                            onChange={handleLegalCityChange}
                            value={personalInfoFormData.ddlrescity}
                            name="ddlrescity"
                            lbl={formCtrlTypes.city}
                            lblClass="mb-0 lbl-req-field"
                            required={true}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={4}
                          ></AsyncSelect>
                        </div>
                        <div className="col-md-4 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            name="txtreszip"
                            ctlType={formCtrlTypes.zip}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtreszip}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={5}
                          ></InputControl>
                        </div>
                        <div className="col-md-4 mb-15">
                          <DateControl
                            lblClass="mb-0 lbl-req-field"
                            lblText="Moved in:"
                            name="txtresmovedin"
                            required={true}
                            onChange={(dt) => onDateChange(dt, "txtresmovedin")}
                            value={personalInfoFormData.txtresmovedin}
                            isTime={false}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={6}
                          ></DateControl>
                        </div>
                        <div className="col-md-4 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText="Monthly rent($):"
                            name="txtresmonthlyrent"
                            ctlType={formCtrlTypes.price}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtresmonthlyrent}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={7}
                          ></InputControl>
                        </div>{" "}
                        <div className="col-md-4 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText={"Landlord contact name:"}
                            name="txtreslandlordname"
                            ctlType={formCtrlTypes.fname}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtreslandlordname}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={8}
                          ></InputControl>
                        </div>
                        <div className="col-md-4 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText={"Landlord contact email:"}
                            name="txtreslandlordcontactemail"
                            ctlType={formCtrlTypes.email}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={
                              personalInfoFormData.txtreslandlordcontactemail
                            }
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={9}
                          ></InputControl>
                        </div>
                        <div className="col-md-4 mb-15">
                          <InputControl
                            lblClass="mb-0 lbl-req-field"
                            lblText={"Landlord contact phone:"}
                            name="txtreslandlordcontactphone"
                            ctlType={formCtrlTypes.phone}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={
                              personalInfoFormData.txtreslandlordcontactphone
                            }
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={10}
                          ></InputControl>
                        </div>
                        <div className="col-md-4 mb-15">
                          <DateControl
                            lblClass="mb-0 lbl-req-field"
                            lblText="Move in date:"
                            name="txtrespreferredmoveindate"
                            required={true}
                            onChange={(dt) =>
                              onDateChange(dt, "txtrespreferredmoveindate")
                            }
                            value={
                              personalInfoFormData.txtrespreferredmoveindate
                            }
                            isTime={false}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={11}
                          ></DateControl>
                        </div>
                        <div className="col-md-12 mb-15">
                          <TextAreaControl
                            lblClass="mb-0 lbl-req-field"
                            lblText="Reason for moving:"
                            name="txtresreasonformoving"
                            ctlType={formCtrlTypes.message}
                            required={true}
                            onChange={handlepersonalInfoChange}
                            value={personalInfoFormData.txtresreasonformoving}
                            errors={personalInfoErrors}
                            formErrors={personalInfoFormErrors}
                            tabIndex={12}
                            rows={3}
                          ></TextAreaControl>
                        </div>
                      </div>
                    )}
                    {step === 5 && (
                      <div className="row pt-10">
                        <input
                          name="txtdummyfocus"
                          className="lh-0 h-0 p-0 bo-0"
                          autoFocus
                        ></input>
                        <div className="bb-accordion ac-single-show accordion-plus-right">
                          {/*============== personalinfo tab start ==============*/}
                          <div className="ac-card rounded border p-0 mb-20">
                            <a
                              className="ac-toggle text-dark text-truncate text-primary p-10 px-15"
                              id="reviewpersonalinfotab"
                            >
                              <span className="text-primary">
                                Personal Information
                              </span>
                            </a>
                            <div className="ac-collapse show p-15 mt-0">
                              <div className="row form-view">
                                <div className="col-md-6 mb-15">
                                  <span>First name: </span>
                                  <span>
                                    {personalInfoFormData?.txtfirstname}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Middle name: </span>
                                  <span>
                                    {personalInfoFormData?.txtmiddlename}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Lastname: </span>
                                  <span>
                                    {personalInfoFormData?.txtlastname}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Phone number: </span>
                                  <span>{personalInfoFormData?.txtphone}</span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Email id: </span>
                                  <span>{personalInfoFormData?.txtemail}</span>
                                </div>
                                <div className="col-md-12 mb-15">
                                  <span>Rental history description: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtfewrentalhistorydetails
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/*============== personalinfo tab end ==============*/}
                          {/*============== Householdinfo tab start ==============*/}
                          <div className="ac-card rounded border p-0 mb-20">
                            <a
                              className="ac-toggle text-dark text-truncate text-primary p-10 px-15"
                              id="reviewhouseholdinfotab"
                            >
                              <span className="text-primary">
                                Household Information
                              </span>
                            </a>
                            <div className="ac-collapse show p-15 mt-0">
                              <div className="row form-view">
                                <div className="col-md-6 mb-15">
                                  <span>Number of residents: </span>
                                  <span>
                                    {personalInfoFormData?.ddloccupants}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>
                                    Does anyone in the household smoke?{" "}
                                  </span>
                                  <span>
                                    {personalInfoFormData?.rblismoker}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Number of pets: </span>
                                  <span>{personalInfoFormData?.ddlpets}</span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Pets description: </span>
                                  <span>
                                    {personalInfoFormData?.txtpetsdescription}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/*============== Householdinfo tab end ==============*/}
                          {/*============== Identityverification tab start ==============*/}
                          <div className="ac-card rounded border p-0 mb-20">
                            <a
                              className="ac-toggle text-dark text-truncate text-primary p-10 px-15"
                              id="reviewidentityverificationtab"
                            >
                              <span className="text-primary">
                                Identity Verification
                              </span>
                            </a>
                            <div className="ac-collapse show p-15 mt-0">
                              <div className="row form-view">
                                <div className="col-md-6 mb-15">
                                  <span>First name: </span>
                                  <span>
                                    {personalInfoFormData?.txtlegalfirstname}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Middle name: </span>
                                  <span>
                                    {personalInfoFormData?.txtlegalmiddlename}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Last name: </span>
                                  <span>
                                    {personalInfoFormData?.txtlegallastname}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Current address: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtlegalcurrentaddress
                                    }
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>State: </span>
                                  <span>
                                    {personalInfoFormData?.ddllegalstate}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>City: </span>
                                  <span>
                                    {personalInfoFormData?.ddllegalcity}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Zip: </span>
                                  <span>
                                    {personalInfoFormData?.txtlegalzip}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Phone number: </span>
                                  <span>
                                    {personalInfoFormData?.txtlegalphone}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Date of birth: </span>
                                  <span>
                                    {personalInfoFormData?.txtlegaldob}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>SSN: </span>
                                  <span>{"xxx-xx-xxxx"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/*============== Identityverification tab end ==============*/}
                          {/*============== Employmenthistory tab start ==============*/}
                          <div className="ac-card rounded border p-0 mb-20">
                            <a
                              className="ac-toggle text-dark text-truncate text-primary p-10 px-15"
                              id="reviewemploymenthistorytab"
                            >
                              <span className="text-primary">
                                Employment History
                              </span>
                            </a>
                            <div className="ac-collapse show p-15 mt-0">
                              <div className="row form-view">
                                <div className="col-md-6 mb-15">
                                  <span>Employment type: </span>
                                  <span>
                                    {personalInfoFormData?.ddlemploymenttype}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Monthly income before taxes($): </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtemploymentmonthlyincome
                                    }
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Job title: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtemploymentjobtitle
                                    }
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Employer name: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtemploymentemployername
                                    }
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Started on: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtemploymentstartedon
                                    }
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Employer contact name: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtemploymentemployercontactname
                                    }
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Employer contact email: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txttemploymentemployercontactemail
                                    }
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Employer contact phone: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtemploymentemployercontactphone
                                    }
                                  </span>
                                </div>
                                <div className="col-md-12 mb-15">
                                  <span>Other information: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtemploymentotherinfo
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/*============== Employmenthistory tab end ==============*/}
                          {/*============== Residence history tab start ==============*/}
                          <div className="ac-card rounded border p-0 mb-20">
                            <a
                              className="ac-toggle text-dark text-truncate text-primary p-10 px-15"
                              id="reviewresidencehistorytab"
                            >
                              <span className="text-primary">
                                Residence History
                              </span>
                            </a>
                            <div className="ac-collapse show p-15 mt-0">
                              <div className="row form-view">
                                <div className="col-md-6 mb-15">
                                  <span>Type: </span>
                                  <span>
                                    {personalInfoFormData?.ddlrestype}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Current address: </span>
                                  <span>
                                    {personalInfoFormData?.txtresaddress}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>State: </span>
                                  <span>
                                    {personalInfoFormData?.ddlresstate}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>City: </span>
                                  <span>
                                    {personalInfoFormData?.ddlrescity}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Zip: </span>
                                  <span>{personalInfoFormData?.txtreszip}</span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Moved in: </span>
                                  <span>
                                    {personalInfoFormData?.txtresmovedin}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Monthly rent($): </span>
                                  <span>
                                    {personalInfoFormData?.txtresmonthlyrent}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Landlord contact name: </span>
                                  <span>
                                    {personalInfoFormData?.txtreslandlordname}
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Landlord contact email: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtreslandlordcontactemail
                                    }
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Landlord contact phone: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtreslandlordcontactphone
                                    }
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Move in date: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtrespreferredmoveindate
                                    }
                                  </span>
                                </div>
                                <div className="col-md-6 mb-15">
                                  <span>Reason for moving: </span>
                                  <span>
                                    {
                                      personalInfoFormData?.txtresreasonformoving
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/*============== Residence history tab end ==============*/}
                        </div>
                      </div>
                    )}

                    <div className="d-flex mt-4 form-action row px-0">
                      <div className="col-6 text-left">
                        {step > 0 && (
                          <Button
                            className="btn btn-secondary"
                            onClick={() => setStep((s) => s - 1)}
                          >
                            Back
                          </Button>
                        )}
                      </div>
                      <div className="col-6">
                        <Button
                          className="btn btn-primary"
                          onClick={() =>
                            setStep((s) => Math.min(s + 1, steps.length - 1))
                          }
                        >
                          {step === steps.length - 1 ? "Submit" : "Next"}
                        </Button>
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

export default Application;
