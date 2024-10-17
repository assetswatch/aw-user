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
      height: "42px !important",
      padding: "0 0 0 0.375rem",
      cursor: state.isSelected ? "pointer" : "pointer",
      color: "var(--theme-general-color) !important",
      fontWeight: "400 !important",
      //caretColor: "transparent",
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
    indicatorSeparator: () => ({
      display: "none",
    }),
    clearIndicator: (base) => {
      return {
        ...base,
        width: "30px !important",
        padding: "8px 0 !important",
      };
    },
    dropdownIndicator: (base) => {
      return {
        ...base,
        width: "30px !important",
        padding: "8px 0 !important",
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

  return (
    <>
      <label className={ctlProps.lblClass}>
        {checkEmptyVal(ctlProps.lblText) ? ctlProps.lbl?.lbl : ctlProps.lblText}
      </label>
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
        }}
        isLoading={isLoading}
        noOptionsMessage={noOptionsMessage}
        isClearable={ctlProps?.isClearable ?? true}
        onInputChange={ctlProps.handleInputChange}
        onChange={ctlProps.onChange}
        isDisabled={ctlProps.isDisabled && true}
        defaultValue={ctlProps.placeHolder}
        value={selectedValue}
        tabIndex={ctlProps.tabIndex}
        defaultOptions
        cacheOptions
      />
      {ctlProps.errors?.[`${ctlProps.name}`] && (
        <div className="err-invalid">
          {ctlProps.errors?.[`${ctlProps.name}`]}
        </div>
      )}
    </>
  );
};

export default AsyncRemoteSelect;
