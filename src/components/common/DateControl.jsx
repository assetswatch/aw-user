import React from "react";
import { formCtrlTypes, Regex } from "../../utils/formvalidation";
import { checkEmptyVal, checkObjNullorEmpty } from "../../utils/common";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";

const DateControl = ({
  lblClass,
  lblText,
  name,
  value,
  isTime,
  isFocus,
  tabIndex,
  required,
  onChange,
  objProps,
  constraints,
  errors,
  formErrors = {},
}) => {
  let $ = window.$;
  let ctl = formCtrlTypes.date;

  let rex = "";
  rex = Regex.date;

  if (required && checkEmptyVal(value)) {
    formErrors[name] = rex.required;
  } else if (value?.length > rex.max) {
    formErrors[name] = rex.invalid;
  } else if (!checkObjNullorEmpty(objProps) && value != objProps.checkVal) {
  }

  const disableKeyEvents = (event) => {
    event.preventDefault(); // Prevent any key event
  };

  const togglePicker = (e) => {
    //$(".dt-ctrl .rdt").removeClass("rdtOpen");
    // if ($(`#${name}`).parent("div").hasClass("rdtOpen")) {
    //   $(`#${name}`).parent("div").removeClass("rdtOpen");
    // } else {
    //   $(`#${name}`).parent("div").addClass("rdtOpen");
    // }
  };

  $(document).on("click", function (e) {
    // if (!$(e.target).parent().parent().hasClass("dt-ctrl")) {
    //   $(e.target).parent().parent().find(".rdt").removeClass("rdtOpen");
    // }
  });

  var yesterday = moment().subtract(1, "day");

  function validate(current) {
    if ("disablepast" in constraints) {
      if (constraints?.disablepast == true) {
        return current.isAfter(yesterday);
      }
    }
    if ("disablefeature" in constraints) {
      if (constraints?.disablefeature == true) {
        return current.isBefore(moment());
      }
    }
  }

  return (
    <>
      <label className={lblClass}>
        {checkEmptyVal(lblText) ? ctl.lbl : lblText}
      </label>
      <div className="input-group dt-ctrl">
        <span className="input-group-text">
          <i className="fa fa-calendar"></i>
        </span>
        <Datetime
          className={`bg-white ${
            errors?.[`${name}`] && "invalid box-shadow w-100"
          }`}
          dateFormat="MM-DD-YYYY"
          inputProps={{
            placeholder: "MM-DD-YYYY",
            onKeyDown: disableKeyEvents,
            name: name,
            id: name,
            value: value ? moment(value).format("MM-DD-YYYY") : "",
          }}
          closeOnSelect={true}
          closeOnClickOutside={true}
          timeFormat={isTime == true ? "hh:mm a" : false}
          name={name}
          autoComplete="off"
          autoFocus={isFocus ?? false}
          tabIndex={tabIndex}
          value={value}
          selected={value}
          onChange={onChange}
          isValidDate={constraints && validate}
          maxLength={ctl.input.max}
          {...ctl.input.keyEvents}
        />
      </div>
      {errors?.[`${name}`] && (
        <div className="err-invalid">{errors?.[`${name}`]}</div>
      )}
    </>
  );
};

export default DateControl;
