import React from "react";
import { formCtrlTypes, Regex } from "../../utils/formvalidation";
import { checkEmptyVal, checkObjNullorEmpty } from "../../utils/common";

const InputControl = ({
  lblClass,
  lblText,
  name,
  ctlType = formCtrlTypes.text,
  value,
  isFocus,
  tabIndex,
  required,
  onChange,
  objProps, //define any control specific props.
  ctlicon,
  onIconClick,
  errors,
  formErrors = {},
  placeHolder,
  inputClass = "",
}) => {
  let ctl = ctlType;

  let rex = "";
  switch (ctl) {
    case formCtrlTypes.email:
      rex = Regex.email;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.pwd:
      rex = Regex.pwd;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!(value.length >= rex.min && value.length <= rex.max)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.currentpwd:
      rex = Regex.currentpwd;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!(value.length >= rex.min && value.length <= rex.max)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.newpwd:
      rex = Regex.newpwd;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!(value.length >= rex.min && value.length <= rex.max)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.confirmpwd:
      rex = Regex.confirmpwd;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!(value.length >= rex.min && value.length <= rex.max)) {
        formErrors[name] = rex.invalid;
      } else if (!checkObjNullorEmpty(objProps) && value != objProps.pwdVal) {
        formErrors[name] = rex.match;
      }
      break;
    case formCtrlTypes.confirmnewpwd:
      rex = Regex.confirmnewpwd;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!(value.length >= rex.min && value.length <= rex.max)) {
        formErrors[name] = rex.invalid;
      } else if (!checkObjNullorEmpty(objProps) && value != objProps.pwdVal) {
        formErrors[name] = rex.match;
      }
      break;
    case formCtrlTypes.fname:
      rex = Regex.fname;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.lname:
      rex = Regex.lname;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.brandingheader:
      rex = Regex.brandingheader;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.brandingfooter:
      rex = Regex.brandingfooter;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.paymentsubaccountfname:
      rex = Regex.paymentsubaccountfname;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.paymentsubaccountlname:
      rex = Regex.paymentsubaccountlname;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.name:
      rex = Regex.name;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.subject:
      rex = Regex.subject;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.mobile:
      rex = Regex.mobile;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.landline:
      rex = Regex.landline;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.phone:
      rex = Regex.phone;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.website:
      rex = Regex.website;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.last4ssn:
      rex = Regex.last4ssn;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.federaltaxid:
      rex = Regex.federaltaxid;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.zip:
      rex = Regex.zip;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.invoicenum:
      rex = Regex.invoicenum;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.searchkeyword:
      rex = Regex.searchkeyword;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.propertytitle:
      rex = Regex.propertytitle;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && value?.length > rex.max) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.amount:
    case formCtrlTypes.price:
      rex = formCtrlTypes.price ? Regex.price : Regex.amount;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.invoiceitemprice:
      rex = Regex.invoiceitemprice;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.advance:
      rex = Regex.advance;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.area:
      rex = Regex.area;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.sqfeet:
      rex = Regex.sqfeet;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.brokerpercentage:
      rex = Regex.brokerpercentage;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.cardnumber:
      rex = Regex.cardnumber;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.cardexpirydate:
      rex = Regex.cardexpirydate;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.cvv:
      rex = Regex.cvv;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.txtcity:
      rex = Regex.txtcity;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && value?.length > rex.max) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.accountnum:
      rex = Regex.accountnum;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.routingnum:
      rex = Regex.routingnum;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.address50:
      rex = Regex.address50;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      if (!checkEmptyVal(value) && value?.length > rex.max) {
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
    case formCtrlTypes.title:
      rex = Regex.title;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      }
      break;
    case formCtrlTypes.dbaname:
      rex = Regex.dbaname;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.legalname:
      rex = Regex.legalname;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (!checkEmptyVal(value) && !rex.pattern.test(value)) {
        formErrors[name] = rex.invalid;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.businessdescription:
      rex = Regex.businessdescription;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
    case formCtrlTypes.businessnameonaccount:
      rex = Regex.businessnameonaccount;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
      } else if (
        !checkEmptyVal(value) &&
        !(value?.length >= rex.min && value?.length <= rex.max)
      ) {
        formErrors[name] = rex.invalid;
      }
      break;
  }

  return (
    <>
      <label className={lblClass}>
        {checkEmptyVal(lblText) ? ctl.lbl : lblText}
      </label>
      <div className={`${ctlicon && "input-group"}`}>
        {ctlicon && (
          <span className="input-group-text" onClick={onIconClick}>
            {ctlicon}
          </span>
        )}
        <input
          type={ctl.input.type}
          className={`form-control bg-white ${
            errors?.[`${name}`] && "invalid box-shadow"
          } ${inputClass}`}
          name={name}
          autoComplete="off"
          autoFocus={isFocus ?? false}
          tabIndex={tabIndex}
          value={value}
          onChange={onChange}
          maxLength={ctl.input.max}
          {...ctl.input.keyEvents}
          placeholder={
            !checkEmptyVal(placeHolder) ? placeHolder : ctl.input.placeHolder
          }
        />
      </div>
      {errors?.[`${name}`] && (
        <div className="err-invalid">{errors?.[`${name}`]}</div>
      )}
    </>
  );
};

export default InputControl;
