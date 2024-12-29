import React, { useState } from "react";
import { components } from "react-select";
import AsyncSelect from "react-select/async";
import makeAnimated from "react-select/animated";
import { checkEmptyVal } from "../../utils/common";
import { AppMessages } from "../../utils/constants";

const AsyncRemoteSelect = (ctlProps) => {
  //Hooks
  const [isLoading, setIsLoading] = useState(false);

  //set options
  let mapOptions = [];

  let selectedValue = null;

  if (ctlProps.hasOwnProperty("value")) {
    if (typeof ctlProps.value === "object") {
      let val = { ...ctlProps.value };
      if (Object.keys(val).length === 0) {
        selectedValue = null;
      } else {
        selectedValue = mapOptions.filter(
          (o) => o.value == ctlProps.value.value
        )[0];
      }
    } else {
      selectedValue = mapOptions.filter((o) => o.value == ctlProps.value)[0];
    }
  }

  const animatedComponents = makeAnimated();

  //dropdown indicator
  const DropdownIndicator = (props) => {
    return (
      components.DropdownIndicator && (
        <components.DropdownIndicator {...props}>
          <div className="form-select react_select_indicator"></div>
        </components.DropdownIndicator>
      )
    );
  };

  //clear indicator
  const ClearIndicator = (props) => {
    return (
      components.ClearIndicator && (
        <components.ClearIndicator {...props}>
          <div className="form-select react_clear_indicator"></div>
        </components.ClearIndicator>
      )
    );
  };

  //Menu list
  const Menu = (props) => (
    <components.Menu {...props} className="react_select_menu" />
  );

  //styles
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused
        ? "var(--form-border-color)"
        : "var(--form-border-color)",
      boxShadow: state.isFocused ? "var(--form-border-color)" : "none",
      "&:hover": {
        borderColor: state.isFocused
          ? "var(--form-border-color)"
          : "var(--form-border-color)",
      },
      fontSize: "14px !important",
      fontFamily: "var(--theme-general-font) !important",
      height: "38px !important",
      minHeight: "38px !important",
      padding: "0 0 0 0.375rem",
      cursor: state.isSelected ? "pointer" : "pointer",
      color: "var(--theme-general-color) !important",
      fontWeight: "400 !important",
      //caretColor: "transparent",
      display: "flex",
      alignItems: "center",
    }),
    option: (styles, { isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor:
          isFocused || isSelected
            ? "var(--react-select-option-color)"
            : "bg-white",
        "&:active": {
          backgroundColor:
            isFocused || isSelected
              ? "var(--react-select-option-color)"
              : "bg-white",
        },
        color: isFocused || isSelected ? "#000" : "#000",
        fontSize: "14px !important",
        fontFamily: "var(--theme-general-font) !important",
        cursor: isDisabled ? "not-allowed" : "pointer",
        padding: "6px 12px",
      };
    },
    valueContainer: (provided) => ({
      ...provided,
      height: "38px",
      padding: "0px 8px",
      display: "flex",
      alignItems: "center",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0",
      padding: "0",
      alignItems: "center",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    clearIndicator: (base) => {
      return {
        ...base,
        width: "30px !important",
        padding: "2px 0 !important",
      };
    },
    dropdownIndicator: (base) => {
      return {
        ...base,
        width: "30px !important",
        padding: "2px 0 !important",
      };
    },
    menuList: (base) => ({
      ...base,
      maxHeight: "200px",
      "::-webkit-scrollbar": {
        width: "5px",
        height: "0",
      },
      "::-webkit-scrollbar-track": {
        background: "var(--react-select-option-color)",
      },
      "::-webkit-scrollbar-thumb": {
        background: "var(--theme-primary-color)",
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: "var(--theme-primary-color)",
      },
    }),
  };

  //no data found.
  const noOptionsMessage = (obj) => {
    if (obj.inputValue.trim().length === 0) {
      return ctlProps.noData;
    }
    return ctlProps.noData;
  };

  //handle input change
  // const handleInputChange = (keyword) => {
  //   if (keyword.trim().length === 0) {
  //     return;
  //   }
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 500);
  // };

  const singleValue = (props) => {
    return (
      <div className="css-1dimb5e-singleValue">
        {props.data.customlabel ? props.data.customlabel : props.data.label}
      </div>
    );
  };

  const multiValue = (props) => {
    const { data, removeProps, innerRef, innerProps } = props;

    return (
      <div
        className="multiValue"
        ref={innerRef}
        {...innerProps}
        onClick={props.isSelected}
      >
        <span>
          {props.data.customlabel ? props.data.customlabel : props.data.label}
        </span>
        <span {...removeProps} className="remove">
          <i className="fa fa-times-circle"></i>
        </span>
      </div>
    );
  };

  const CheckboxOption = ({ children, ...props }) => {
    return (
      <components.Option {...props}>
        <div className="ccbox row pl-10">
          <input
            type="checkbox"
            className="d-none"
            checked={props.isSelected}
            onChange={() => null}
          />
          <span>{children}</span>
        </div>
      </components.Option>
    );
  };

  return (
    <>
      <label className={ctlProps.lblClass}>
        {checkEmptyVal(ctlProps.lblText) ? ctlProps.lbl?.lbl : ctlProps.lblText}
      </label>
      {ctlProps?.isMulti ? (
        <AsyncSelect
          className={`react_select_ctrl ${ctlProps.className} ${
            ctlProps.errors?.[`${ctlProps.name}`] && "invalid box-shadow"
          }`}
          styles={customStyles}
          loadOptions={ctlProps.loadOptions}
          placeholder={ctlProps.placeHolder}
          components={{
            Menu,
            animatedComponents,
            DropdownIndicator,
            ClearIndicator,
            // SingleValue: singleValue,
            MultiValue: multiValue,
            Option: CheckboxOption,
          }}
          isLoading={isLoading}
          noOptionsMessage={noOptionsMessage}
          isClearable={ctlProps?.isClearable ?? true}
          onInputChange={ctlProps.handleInputChange}
          onChange={ctlProps.onChange}
          isDisabled={ctlProps.isDisabled && true}
          defaultValue={ctlProps.placeHolder}
          onBlur={ctlProps.onBlur}
          blurInputOnSelect={false}
          closeMenuOnSelect={false}
          isMulti={true}
          hideSelectedOptions={false}
          //inputValue={ctlProps.inputValue}
          value={selectedValue}
          tabIndex={ctlProps.tabIndex}
          defaultOptions
          cacheOptions={ctlProps.cacheOptions ?? true}
          onFocus={ctlProps.onFocus}
        />
      ) : (
        <AsyncSelect
          className={`react_select_ctrl ${ctlProps.className} ${
            ctlProps.errors?.[`${ctlProps.name}`] && "invalid box-shadow"
          }`}
          styles={customStyles}
          loadOptions={ctlProps.loadOptions}
          placeholder={ctlProps.placeHolder}
          components={{
            Menu,
            animatedComponents,
            DropdownIndicator,
            ClearIndicator,
            SingleValue: singleValue,
          }}
          isLoading={isLoading}
          noOptionsMessage={noOptionsMessage}
          isClearable={ctlProps?.isClearable ?? true}
          onInputChange={ctlProps.handleInputChange}
          onChange={ctlProps.onChange}
          isDisabled={ctlProps.isDisabled && true}
          defaultValue={ctlProps.placeHolder}
          onBlur={ctlProps.onBlur}
          blurInputOnSelect={false}
          inputValue={ctlProps.inputValue}
          value={selectedValue}
          tabIndex={ctlProps.tabIndex}
          defaultOptions
          cacheOptions={ctlProps.cacheOptions ?? true}
        />
      )}
      {ctlProps.errors?.[`${ctlProps.name}`] && (
        <div className="err-invalid">
          {ctlProps.errors?.[`${ctlProps.name}`]}
        </div>
      )}
    </>
  );
};

export default AsyncRemoteSelect;
