import React, { useState, useEffect } from "react";
import { routeNames } from "../routes/routes";
import { DataLoader, NoData } from "../components/common/LazyComponents";
import useAppConfigGateway from "../hooks/useAppConfigGateway";
import PageTitle from "../components/layouts/PageTitle";
import {
  checkEmptyVal,
  checkObjNullorEmpty,
  GetUserCookieValues,
} from "../utils/common";
import { formCtrlTypes } from "../utils/formvalidation";
import InputControl from "../components/common/InputControl";
import TextAreaControl from "../components/common/TextAreaControl";
import { apiReqResLoader } from "../utils/common";
import config from "../config.json";
import { axiosPost } from "../helpers/axiosHelper";
import {
  ApiUrls,
  AppMessages,
  API_ACTION_STATUS,
  ValidationMessages,
  UserCookie,
} from "../utils/constants";
import AsyncSelect from "../components/common/AsyncSelect";
import FileControl from "../components/common/FileControl";
import { Toast } from "../components/common/ToastView";
import { useAuth } from "../contexts/AuthContext";

const ContactUs = () => {
  let $ = window.$;

  let formErrors = {};
  const { loggedinUser } = useAuth();

  const [errors, setErrors] = useState({});
  const { appConfigDetails, isDataLoading } = useAppConfigGateway();

  const [contactForData, setContactForData] = useState([]);
  const [selectedContactFor, setSelectedContactFor] = useState(0);
  const [file, setFile] = useState(null);

  const [initApisLoaded, setinitApisLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([geSupportTypes()]).then(() => {
      setinitApisLoaded(true);
    });
    return () => {};
  }, []);

  const geSupportTypes = () => {
    return axiosPost(`${config.apiBaseUrl}${ApiUrls.getDdlSupportTypes}`, {})
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          setContactForData(objResponse.Data);
        } else {
          setContactForData([]);
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getDdlSupportTypes}, Error ::" ${err}`
        );
        setContactForData([]);
      })
      .finally(() => {
        setSelectedContactFor(0);
      });
  };

  const handleContactforChange = (e) => {
    setSelectedContactFor(e?.value);
  };

  function setInitialFormData() {
    return {
      txtemail: "",
      txtname: "",
      txtphone: "",
      txtsubject: "",
      txtmessage: "",
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

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const onSendMessage = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedContactFor) || selectedContactFor == 0) {
      formErrors["ddlcontactfor"] = ValidationMessages.ContactforReq;
    }

    if (Object.keys(formErrors).length === 0) {
      const contactForType = contactForData?.find(
        (item) => item.Id == parseInt(selectedContactFor)
      );
      apiReqResLoader(
        "btnsendmessage",
        "Sending Message",
        API_ACTION_STATUS.START
      );

      let profileid = GetUserCookieValues(UserCookie.ProfileId, loggedinUser);
      let accountid = GetUserCookieValues(UserCookie.AccountId, loggedinUser);
      setErrors({});
      let isapimethoderr = false;
      let objBodyParams = new FormData();

      objBodyParams.append(
        "ProfileId",
        checkEmptyVal(profileid) ? 0 : profileid
      );
      objBodyParams.append(
        "AccountId",
        checkEmptyVal(accountid) ? 0 : accountid
      );
      objBodyParams.append("Name", formData.txtname);
      objBodyParams.append("Email", formData.txtemail);
      objBodyParams.append("Phone", formData.txtphone);
      objBodyParams.append("Subject", formData.txtsubject);
      objBodyParams.append("Message", formData.txtmessage);
      objBodyParams.append("SupportTypeId", selectedContactFor);
      objBodyParams.append("SupportType", contactForType?.Text);
      if (file) objBodyParams.append("Image", file);

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.createSupportTicket}`,
        objBodyParams,
        {
          "Content-Type": "multipart/form-data",
        }
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Status === 0) {
              setSelectedContactFor(null);
              setFormData(setInitialFormData());
              Toast.success(AppMessages.SupportTicketSuccess);
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
            `"API :: ${ApiUrls.createSupportTicket}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr === true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnsendmessage",
            "Yes",
            API_ACTION_STATUS.COMPLETED,
            false
          );
          apiReqResLoader(
            "btnsendmessage",
            "Send Message",
            API_ACTION_STATUS.COMPLETED
          );
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
        title="Contact US"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Contact form Start ==============*/}
      <div className="full-row pt-4 pb-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-md-5 order-md-2">
              <h4 className="down-line pb-10 mb-4">Get In Touch</h4>
              <p>Having issues with your Assetswatch account?</p>
              <div className="mb-10">
                {isDataLoading && <DataLoader />}
                {!isDataLoading &&
                  (checkEmptyVal(appConfigDetails) ||
                    checkObjNullorEmpty(appConfigDetails)) && (
                    <NoData pos="left" />
                  )}
                {!isDataLoading &&
                  !checkEmptyVal(appConfigDetails) &&
                  !checkObjNullorEmpty(appConfigDetails) && (
                    <>
                      <ul>
                        <li className="mb-3">
                          <h6 className="mb-0">Office Address :</h6>{" "}
                          {appConfigDetails.ContactDetails.Address}
                        </li>
                        <li className="mb-3">
                          <h6>Contact Number :</h6>{" "}
                          {appConfigDetails.ContactDetails.Phone}
                        </li>
                        <li className="mb-3">
                          <h6>Email Address :</h6>{" "}
                          {appConfigDetails.ContactDetails.Email}
                        </li>
                      </ul>

                      <h5 className="mb-2">Geo Address</h5>
                      <p>
                        <iframe
                          title="contactus"
                          src={appConfigDetails.ContactDetails.GeoAddress}
                          width="600"
                          height="335"
                          style={{ border: "0" }}
                          allowFullScreen
                        ></iframe>
                      </p>
                    </>
                  )}
              </div>
            </div>
            <div className="col-md-7 order-md-1">
              <h4 className="down-line pb-10 mb-4">Send Message</h4>
              <form noValidate onSubmit={onSendMessage}>
                <div className="row">
                  <div className="col-md-6 mb-15">
                    <InputControl
                      lblClass="mb-0 lbl-req-field"
                      lblText="Your name:"
                      name="txtname"
                      ctlType={formCtrlTypes.name}
                      isFocus={true}
                      required={true}
                      onChange={handleChange}
                      value={formData.txtname}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={1}
                    ></InputControl>
                  </div>
                  <div className="col-md-6 mb-15">
                    <InputControl
                      lblClass="mb-0 lbl-req-field"
                      lblText="Your email:"
                      name="txtemail"
                      ctlType={formCtrlTypes.email}
                      required={true}
                      onChange={handleChange}
                      value={formData.txtemail}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={2}
                    ></InputControl>
                  </div>
                  <div className="col-md-6 mb-15">
                    <InputControl
                      lblClass="mb-0 lbl-req-field"
                      lblText="Your phone:"
                      name="txtphone"
                      ctlType={formCtrlTypes.phone}
                      required={true}
                      onChange={handleChange}
                      value={formData.txtphone}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={3}
                    ></InputControl>
                  </div>
                  <div className="col-md-6 mb-15">
                    <AsyncSelect
                      placeHolder={
                        contactForData.length <= 0 && selectedContactFor == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlDefaultSelect
                      }
                      noData={
                        contactForData.length <= 0 && selectedContactFor == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlNoData
                      }
                      options={contactForData}
                      onChange={handleContactforChange}
                      value={selectedContactFor}
                      defualtselected={selectedContactFor}
                      name="ddlcontactfor"
                      lbl={formCtrlTypes.contactfor}
                      lblClass="mb-0 lbl-req-field"
                      className="ddlborder"
                      isClearable={false}
                      required={true}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={4}
                    ></AsyncSelect>
                  </div>
                  <div className="col-md-12 mb-15">
                    <FileControl
                      lblClass="mb-0"
                      name="uploadimage"
                      ctlType={formCtrlTypes.file}
                      onChange={handleFileChange}
                      file={file}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={5}
                    />
                  </div>
                  <div className="col-md-12 mb-15">
                    <InputControl
                      lblClass="mb-0 lbl-req-field"
                      name="txtsubject"
                      ctlType={formCtrlTypes.subject}
                      required={true}
                      onChange={handleChange}
                      value={formData.txtsubject}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={6}
                    ></InputControl>
                  </div>
                  <div className="col-md-12 mb-30">
                    <TextAreaControl
                      lblClass="mb-0 lbl-req-field"
                      name="txtmessage"
                      ctlType={formCtrlTypes.message}
                      required={true}
                      onChange={handleChange}
                      value={formData.txtmessage}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={7}
                      rows={6}
                    ></TextAreaControl>
                  </div>
                  <div className="col-md-12">
                    <button
                      className="btn btn-primary btn-mini btn-glow shadow rounded"
                      name="btnsendmessage"
                      id="btnsendmessage"
                      type="submit"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/*============== Contact form End ==============*/}
    </>
  );
};

export default ContactUs;
