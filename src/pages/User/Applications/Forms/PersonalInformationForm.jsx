import React, { useState } from "react";
import InputControl from "../../../../components/common/InputControl";
import { formCtrlTypes } from "../../../../utils/formvalidation";
import TextAreaControl from "../../../../components/common/TextAreaControl";
import { API_ACTION_STATUS } from "../../../../utils/constants";
import { apiReqResLoader } from "../../../../utils/common";

const PersonalInformationForm = () => {
  let $ = window.$;

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
      txtaboutme: "",
    };
  }

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

  const onCreate = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (Object.keys(personalInfoErrors).length === 0) {
      setPersonalInfoErrors({});
      apiReqResLoader("btnCreate", "Creating", API_ACTION_STATUS.START);
      apiReqResLoader("btnCreate", "Creating", API_ACTION_STATUS.COMPLETED.Com);
    } else {
      $(`[name=${Object.keys(personalInfoErrors)[0]}]`).focus();
      setPersonalInfoErrors(personalInfoErrors);
    }
  };

  return (
    <div className="row">
      <input
        name="txtdummyfocus"
        className="lh-0 h-0 p-0 bo-0"
        autoFocus
      ></input>
      <h6 className="text-primary">Personal Information</h6>
      <div className="col-md-6 mb-15">
        <InputControl
          lblClass="mb-0 lbl-req-field"
          name="txtfirstname"
          ctlType={formCtrlTypes.fname}
          required={true}
          onChange={handlepersonalInfoChange}
          value={personalInfoFormData.txtfirstname}
          errors={personalInfoErrors}
          formErrors={personalInfoFormErrors}
          tabIndex={1}
          isFocus={true}
        ></InputControl>
      </div>
      <div className="col-md-6 mb-15">
        <InputControl
          lblClass="mb-0"
          name="txtmiddlename"
          ctlType={formCtrlTypes.mname}
          required={false}
          onChange={handlepersonalInfoChange}
          value={personalInfoFormData.txtmiddlename}
          errors={personalInfoErrors}
          formErrors={personalInfoFormErrors}
          tabIndex={2}
        ></InputControl>
      </div>
      <div className="col-md-6 mb-15">
        <InputControl
          lblClass="mb-0 lbl-req-field"
          name="txtlastname"
          ctlType={formCtrlTypes.lname}
          required={true}
          onChange={handlepersonalInfoChange}
          value={personalInfoFormData.txtlastname}
          errors={personalInfoErrors}
          formErrors={personalInfoFormErrors}
          tabIndex={3}
        ></InputControl>
      </div>
      <h6 className="text-primary mt-10">Contact Information</h6>
      <div className="col-md-6 mb-15">
        <InputControl
          lblClass="mb-0 lbl-req-field"
          name="txtemail"
          ctlType={formCtrlTypes.email}
          required={true}
          onChange={handlepersonalInfoChange}
          value={personalInfoFormData.txtemail}
          errors={personalInfoErrors}
          formErrors={personalInfoFormErrors}
          tabIndex={4}
        ></InputControl>
      </div>
      <div className="col-md-6 mb-15">
        <InputControl
          lblClass="mb-0 lbl-req-field"
          name="txtphone"
          ctlType={formCtrlTypes.phone}
          required={true}
          onChange={handlepersonalInfoChange}
          value={personalInfoFormData.txtphone}
          errors={personalInfoErrors}
          formErrors={personalInfoFormErrors}
          tabIndex={5}
        ></InputControl>
      </div>
      <div className="col-md-12 mb-15">
        <TextAreaControl
          lblClass="mb-0"
          lblText="About me (optional): "
          name="txtaboutme"
          ctlType={formCtrlTypes.max1000}
          required={false}
          onChange={handlepersonalInfoChange}
          value={personalInfoFormData.txtaboutme}
          errors={personalInfoErrors}
          formErrors={personalInfoFormErrors}
          tabIndex={6}
          rows={4}
        ></TextAreaControl>
      </div>
    </div>
  );
};

export default PersonalInformationForm;
