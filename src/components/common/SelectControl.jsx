import React from "react";
import { formCtrlTypes, Regex } from "../../utils/formvalidation";
import { checkEmptyVal, checkObjNullorEmpty } from "../../utils/common";

const SelectControl = ({
  lblClass,
  lblText,
  name,
  ctlType = formCtrlTypes.text,
  value,
  isFocus,
  tabIndex,
  required,
  options,
  dataKey,
  dataValue,
  onChange,
  ctlicon,
  onIconClick,
  errors,
  formErrors = {},
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
        <select
          className={`form-control form-select bg-white ${
            errors?.[`${name}`] && "invalid box-shadow"
          }`}
          name={name}
          autoComplete="off"
          autoFocus={isFocus ?? false}
          tabIndex={tabIndex}
          value={value}
          onChange={onChange}
        >
          {options?.map((item, index) => {
            return (
              <option key={`${name}-${index}`} value={item[dataValue]}>
                {item[dataKey]}
              </option>
            );
          })}
        </select>
      </div>
      {errors?.[`${name}`] && (
        <div className="err-invalid">{errors?.[`${name}`]}</div>
      )}
    </>
  );
};

export default SelectControl;
