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
}) => {
  let ctl = ctlType;

  let rex = "";
  switch (ctl) {
    case formCtrlTypes.message:
      rex = Regex.message;
      if (required && checkEmptyVal(value)) {
        formErrors[name] = rex.required;
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
      />
      {errors?.[`${name}`] && (
        <div className="err-invalid">{errors?.[`${name}`]}</div>
      )}
    </>
  );
};

export default TextAreaControl;
