import React, { useState, useEffect, useRef } from "react";
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
import { useNavigate } from "react-router-dom";

const CreateTestimonial = () => {
  let $ = window.$;

  let formErrors = {};
  let profileid = 0;

  const { loggedinUser } = useAuth();

  if (!checkObjNullorEmpty(loggedinUser)) {
    profileid = parseInt(
      GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
    );
  }

  const navigate = useNavigate();

  function setInitialFormData() {
    return {
      txtemail: "",
      txtname: "",
      txtphone: "",
      txtoccupation: "",
      txttestimonial: "",
    };
  }

  const [formData, setFormData] = useState(setInitialFormData());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getLoggedInUserDetails();
  }, []);

  //get loggedinuser details
  const getLoggedInUserDetails = () => {
    if (profileid > 0) {
      let objParams = {
        ProfileId: profileid,
      };
      axiosPost(`${config.apiBaseUrl}${ApiUrls.getUserDetails}`, objParams)
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setFormData({
              ...formData,
              txtemail: objResponse.Data?.Email,
              txtname: objResponse.Data?.FirstName,
              txtphone: objResponse.Data?.MobileNo,
            });
          }
        })
        .catch((err) => {
          console.error(`"API :: ${ApiUrls.getUserDetails}, Error ::" ${err}`);
        })
        .finally(() => {});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  function clearForm() {
    setFormData(setInitialFormData());
    $(".form-error").html("");
  }

  const onCreate = (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    e.stopPropagation();

    if (Object.keys(formErrors).length === 0) {
      apiReqResLoader("btncreate", "Creating", API_ACTION_STATUS.START);
      let errctl = ".form-error";
      $(errctl).html("");
      setErrors({});
      let isapimethoderr = false;
      let objBodyParams = {
        Profileid: profileid,
        Name: formData.txtname,
        Email: formData.txtemail,
        Phone: formData.txtphone,
        Occupation: formData.txtoccupation,
        Testimonial: formData.txttestimonial,
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.createTestimonial}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data != null && objResponse.Data?.Id > 0) {
              Toast.success(objResponse.Data.Message);
              clearForm();
              onTestimonials();
            } else {
              $(errctl).html(objResponse.Data.Message);
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.createTestimonial}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          apiReqResLoader("btncreate", "Create", API_ACTION_STATUS.COMPLETED);
        });
    } else {
      $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const onTestimonials = () => {
    navigate(routeNames.testimonials.path);
  };

  return (
    <>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Create Testimonial"
        navLinks={[
          { title: "Home", url: routeNames.home.path },
          { title: "Testimonials", url: routeNames.testimonials.path },
        ]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Create Testimonial form Start ==============*/}

      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-xl-7 col-lg-10 mx-auto">
              <div className="bg-white xs-p-20 p-30 border rounded shadow">
                <h4 className="down-line pb-10 mb-4">Create Testimonial</h4>
                <form noValidate>
                  <div className="row">
                    <div className="col-md-6 mb-15">
                      <InputControl
                        lblClass="mb-0 lbl-req-field"
                        lblText="Your name:"
                        name="txtname"
                        ctlType={formCtrlTypes.name100}
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
                        lblClass="mb-0"
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
                      <InputControl
                        lblClass="mb-0"
                        name="txtoccupation"
                        ctlType={formCtrlTypes.occupation}
                        required={false}
                        onChange={handleChange}
                        value={formData.txtoccupation}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={4}
                      ></InputControl>
                    </div>
                    <div className="col-md-12 mb-30">
                      <TextAreaControl
                        lblClass="mb-0 lbl-req-field"
                        name="txttestimonial"
                        ctlType={formCtrlTypes.testimonial}
                        required={true}
                        onChange={handleChange}
                        value={formData.txttestimonial}
                        errors={errors}
                        formErrors={formErrors}
                        tabIndex={5}
                        rows={4}
                      ></TextAreaControl>
                    </div>
                    <div className="col-12 mt-10 px-0">
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
                              onClick={onTestimonials}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary"
                              name="btncreate"
                              id="btncreate"
                              onClick={onCreate}
                            >
                              Create
                            </button>
                          </div>
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
      {/*============== Contact form End ==============*/}
    </>
  );
};

export default CreateTestimonial;
