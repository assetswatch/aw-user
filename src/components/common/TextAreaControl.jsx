import React from "react";
import { formCtrlTypes, Regex } from "../../utils/formvalidation";
import { checkEmptyVal, checkObjNullorEmpty } from "../../utils/common";

const TextAreaControl = ({
  lblClass,
  lblText,
  name,
  ctlType = formCtrlTypes.text,
  value,
  isFocus,
  tabIndex,
  required,
  rows = 5,
  onChange,
  objProps, //define any control specific props.
  errors,
  formErrors = {},
  placeHolder,
}) => {
  let ctl = ctlType;

  let rex = "";
  switch (ctl) {
    case formCtrlTypes.max1000:
      rex = Regex.max1000;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.message:
      rex = Regex.message;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.aboutme:
      rex = Regex.aboutme;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.testimonial:
      rex = Regex.testimonial;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.addressone:
      rex = Regex.addressone;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && value?.length > rex.max) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.addresstwo:
      rex = Regex.addresstwo;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && value?.length > rex.max) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.comments:
      rex = Regex.comments;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && value?.length > rex.max) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.description:
      rex = Regex.description;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && value?.length > rex.max) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.description500:
      rex = Regex.description500;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && value?.length > rex.max) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.description300:
      rex = Regex.description300;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && value?.length > rex.max) {
        formErrors[name] = rex.invalid;
      }
      break;
  }

  return (
    <>
      <label className={lblClass}>
        {checkEmptyVal(lblText) ? ctl.lbl : lblText}
      </label>
      <textarea
        type={ctl.input.type}
        className={`form-control bg-white ${
          errors?.[`${name}`] && "invalid box-shadow"
        }`}
        name={name}
        autoComplete="off"
        autoFocus={isFocus ?? false}
        tabIndex={tabIndex}
        value={value}
        onChange={onChange}
        maxLength={ctl.input.max}
        rows={rows}
        placeholder={
          !checkEmptyVal(placeHolder) ? placeHolder : ctl.input.placeHolder
        }
      />
      {errors?.[`${name}`] && (
        <div className="err-invalid">{errors?.[`${name}`]}</div>
      )}
    </>
  );
};

export default TextAreaControl;
