import React from "react";
import { formCtrlTypes, Regex } from "../../utils/formvalidation";
import { checkEmptyVal, checkObjNullorEmpty } from "../../utils/common";
import { allowedFileTypes } from "../../utils/constants";

const FileControl = ({
  lblClass,
  lblText,
  name,
  file,
  ctlType = formCtrlTypes.file,
  isFocus,
  tabIndex,
  required,
  onChange,
  errors,
  formErrors = {},
}) => {
  let ctl = ctlType;
  let rex = "";

  rex = Regex.file;
  if (required && checkEmptyVal(file) && checkObjNullorEmpty(file)) {
    formErrors[name] = rex.required;
  } else if (file && !ctl.input.validateFileType(file)) {
    formErrors[name] = rex.formatinvalid;
  } else if (file && ctl.input.validateFileSize(file) == true) {
    formErrors[name] = rex.sizeinvalid;
  }

  return (
    <>
      <label className={lblClass}>
        {checkEmptyVal(lblText) ? ctl.lbl : lblText}
      </label>
      <input
        type="file"
        className={`form-control bg-white ${
          errors?.[`${name}`] && "invalid box-shadow"
        }`}
        name={name}
        onChange={onChange}
        autoComplete="off"
        autoFocus={isFocus ?? false}
        tabIndex={tabIndex}
      />
      {errors?.[`${name}`] && (
        <div className="err-invalid">{errors?.[`${name}`]}</div>
      )}
    </>
  );
};

export default FileControl;
