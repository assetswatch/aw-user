import React, { useState } from "react";
import Select, { components } from "react-select";
import makeAnimated from "react-select/animated";
import { checkEmptyVal } from "../../utils/common";
import { AppMessages } from "../../utils/constants";

const AsyncSelect = (ctlProps) => {
  //Hooks
  const [isLoading, setIsLoading] = useState(false);

  //set options
  let mapOptions = [];

  let ctlHeight = ctlProps?.isSearchCtl ? "35px !important" : "38px !important";
  let ctlFont = ctlProps?.isSearchCtl ? "13px !important" : "14px !important";
  let indicatorSize = ctlProps?.isSearchCtl ? "16px 11px" : "16px 12px";
  let inputPadding = ctlProps?.isSearchCtl ? "2px 4px" : "2px 8px";

  if (ctlProps?.dataType == "string") {
    mapOptions = ctlProps?.options?.map((option) => {
      return {
        value: option,
        label: option,
      };
    });
  } else {
    if (ctlProps?.isRenderOptions == false) {
      mapOptions = ctlProps.options;
      // mapOptions = ctlProps.options?.map((option) => {
      //   let opt = {
      //     label: (
      //       <div className="items-center font-14 font-500">
      //         <i className={`${ctlProps?.icon} pe-1 text-primary`}></i>
      //         {option[ctlProps.dataVal] || option.Text}
      //       </div>
      //     ),
      //     value: option[ctlProps.dataKey] || option.Id,
      //     // options: option[ctlProps.subData?.objectKey].map((so) => ({
      //     //   label: (
      //     //     <div className="items-center font-14 font-500 pl-20">
      //     //       <i
      //     //         className={`${ctlProps.subData?.icon} pe-1 text-primary`}
      //     //       ></i>
      //     //       {so[ctlProps.subData?.dataVal]}
      //     //     </div>
      //     //   ),
      //     //   value: option[ctlProps.subData?.dataKey],
      //     //   isGroupLabel: true,
      //     // })),
      //   };
      //   return opt;
      // });
    } else {
      mapOptions = ctlProps.options?.map((option) => {
        let opt = {
          value: option[ctlProps.dataKey] || option.Id,
          label: option[ctlProps.dataVal] || option.Text,
        };

        //add extrapotions
        if (ctlProps.extraOptions) {
          opt[ctlProps.extraOptions.key] =
            option[ctlProps.extraOptions.dataVal];
        }

        return opt;
      });
    }
  }

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
          <div
            className="form-select react_select_indicator"
            style={{ backgroundSize: `${indicatorSize}` }}
          ></div>
        </components.DropdownIndicator>
      )
    );
  };

  //clear indicator
  const ClearIndicator = (props) => {
    return (
      components.ClearIndicator && (
        <components.ClearIndicator {...props}>
          <div
            className="form-select react_clear_indicator"
            style={{ backgroundSize: `${indicatorSize}` }}
          ></div>
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
      fontSize: ctlFont,
      fontFamily: "var(--theme-general-font) !important",
      height: ctlHeight,
      minHeight: ctlHeight,
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
        fontSize: ctlFont,
        fontFamily: "var(--theme-general-font) !important",
        cursor: isDisabled ? "not-allowed" : "pointer",
        padding: "6px 12px",
      };
    },
    valueContainer: (provided) => ({
      ...provided,
      height: ctlHeight,
      padding: inputPadding,
      display: "flex",
      alignItems: "center",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0",
      padding: "0",
      alignItems: "center",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: ctlHeight,
      display: "flex",
      alignItems: "center",
    }),
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
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
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
  const handleInputChange = (keyword) => {
    if (keyword.trim().length === 0) {
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

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

  const customFilterOptions = (options, { inputValue }) => {
    return options?.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  return (
    <>
      <label className={ctlProps.lblClass}>
        {checkEmptyVal(ctlProps.lblText) ? ctlProps.lbl?.lbl : ctlProps.lblText}
      </label>
      {ctlProps?.isMulti ? (
        <Select
          className={`react_select_ctrl ${ctlProps.className} ${
            ctlProps.errors?.[`${ctlProps.name}`] && "invalid box-shadow"
          }`}
          menuPortalTarget={ctlProps.menuPortalTarget ? document.body : null}
          styles={customStyles}
          options={mapOptions}
          placeholder={ctlProps.placeHolder}
          components={{
            Menu,
            animatedComponents,
            DropdownIndicator,
            ClearIndicator,
            MultiValue: multiValue,
            Option: CheckboxOption,
          }}
          isMulti={true}
          hideSelectedOptions={false}
          isLoading={isLoading}
          noOptionsMessage={noOptionsMessage}
          isClearable={ctlProps?.isClearable ?? true}
          onInputChange={handleInputChange}
          onChange={ctlProps.onChange}
          isDisabled={ctlProps.isDisabled && true}
          defaultValue={ctlProps.placeHolder}
          value={selectedValue}
          tabIndex={ctlProps.tabIndex}
          closeMenuOnSelect={false}
        />
      ) : (
        <Select
          className={`react_select_ctrl ${ctlProps.className} ${
            ctlProps.errors?.[`${ctlProps.name}`] && "invalid box-shadow"
          }`}
          menuPortalTarget={ctlProps.menuPortalTarget ? document.body : null}
          styles={customStyles}
          options={mapOptions}
          placeholder={ctlProps.placeHolder}
          components={{
            Menu,
            animatedComponents,
            DropdownIndicator,
            ClearIndicator,
            SingleValue: singleValue,
          }}
          filterOption={(option, inputValue) => {
            return option?.data?.customlabel
              ? option?.data?.customlabel
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
              : option?.data?.label
                  .toLowerCase()
                  .includes(inputValue.toLowerCase());
          }}
          isLoading={isLoading}
          noOptionsMessage={noOptionsMessage}
          isClearable={ctlProps?.isClearable ?? true}
          onInputChange={ctlProps.handleInputChange}
          onBlur={ctlProps.onBlur}
          blurInputOnSelect={false}
          inputValue={ctlProps.inputValue}
          onChange={ctlProps.onChange}
          isDisabled={ctlProps.isDisabled && true}
          defaultValue={ctlProps.placeHolder}
          value={selectedValue}
          tabIndex={ctlProps.tabIndex}
          isSearchable={ctlProps.isSearchable && true}
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

export default AsyncSelect;
