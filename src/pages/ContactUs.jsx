import React, { useState, useEffect } from "react";
import { routeNames } from "../routes/routes";
import { DataLoader, NoData } from "../components/common/LazyComponents";
import useAppConfigGateway from "../hooks/useAppConfigGateway";
import PageTitle from "../components/layouts/PageTitle";
import { checkEmptyVal, checkObjNullorEmpty } from "../utils/common";
import { formCtrlTypes } from "../utils/formvalidation";
import InputControl from "../components/common/InputControl";
import TextAreaControl from "../components/common/TextAreaControl";
import { apiReqResLoader } from "../utils/common";
import config from "../config.json";
import { axiosPost } from "../helpers/axiosHelper";
import { ApiUrls, AppMessages, API_ACTION_STATUS } from "../utils/constants";
import AsyncSelect from "../components/common/AsyncSelect";
import FileControl from "../components/common/FileControl";
import { Toast } from "../components/common/ToastView";

const ContactUs = () => {
  let $ = window.$;

  let formErrors = {};

  const [errors, setErrors] = useState({});
  const { appConfigDetails, isDataLoading } = useAppConfigGateway();

  const [contactForData, setContactForData] = useState([]);
  const [selectedContactFor, setSelectedContactFor] = useState(null);
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
        setSelectedContactFor({});
      });
  };

  const handleContactforChange = (e) => {
    setSelectedContactFor(e?.value);
  };

  const [formData, setFormData] = useState({
    txtemail: "",
    txtname: "",
    txtphone: "",
    txtsubject: "",
    txtmessage: "",
  });

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

    apiReqResLoader(
      "btnsendmessage",
      "Sending Message",
      API_ACTION_STATUS.START,
      false
    );

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btnsendmessage", "Sending Message");

      setErrors({});
      let isapimethoderr = false;
      let objBodyParams = new FormData();
      objBodyParams.append("ProfileId", 0); // Send 0 if not logged in
      objBodyParams.append("AccountId", 0); // Send 0 if not logged in
      objBodyParams.append("Name", formData.txtname);
      objBodyParams.append("Email", formData.txtemail);
      objBodyParams.append("Phone", formData.txtphone);
      objBodyParams.append("Subject", formData.txtsubject);
      objBodyParams.append("Message", formData.txtmessage);
      objBodyParams.append("SupportTypeId", selectedContactFor);
      if (file) objBodyParams.append("Image", file); // Only append if a file is selected

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
              Toast.success(AppMessages.SupportTicketSuccessMessage);
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
          apiReqResLoader("btnsendmessage", "Send Message", "completed");
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
      <div className="full-row pt-5 pb-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-md-5 order-md-2">
              <h4 className="down-line mb-4">Get In Touch</h4>
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
                          height="305"
                          style={{ border: "0" }}
                          allowFullScreen
                        ></iframe>
                      </p>
                    </>
                  )}
              </div>
            </div>
            <div className="col-md-7 order-md-1">
              <h4 className="down-line mb-4">Send Message</h4>
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
                      isFocus={true}
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
                      tabIndex={2}
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
                      tabIndex={6}
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
                      tabIndex={3}
                      rows={7}
                    ></TextAreaControl>
                  </div>
                  <div className="col-md-12">
                    <button
                      className="btn btn-primary box-shadow"
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
