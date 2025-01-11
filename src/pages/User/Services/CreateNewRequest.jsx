import React, { lazy, useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkStartEndDateGreater,
  debounce,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import { formCtrlTypes } from "../../../utils/formvalidation";
import AsyncSelect from "../../../components/common/AsyncSelect";
import AsyncRemoteSelect from "../../../components/common/AsyncRemoteSelect";
import InputControl from "../../../components/common/InputControl";
import TextAreaControl from "../../../components/common/TextAreaControl";
import FileControl from "../../../components/common/FileControl";

const CreateNewRequest = () => {
  let $ = window.$;

  let formErrors = {};

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
      txtfromdate: moment().subtract(1, "month"),
      txttodate: moment(),
      ddlnotificationtype: null,
    };
  };

  const [searchFormData, setSearchFormData] = useState(
    setSearchInitialFormData
  );

  //Set search formdata

  //Input change
  const handleChange = (e) => {
    const { name, value } = e?.target;
    setSearchFormData({
      ...searchFormData,
      [name]: value,
    });
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-8 shadow">
            <div className="bg-white xs-p-20 p-30 pb-50 border rounded">
              <h4 className="mb-2 down-line pb-10">Create New Request</h4>
              <div className="row pt-20 pb-0 row-cols-1 g-4 flex-center">
                <div className="col-lg-6 ">
                  <AsyncSelect
                    lblText="Property"
                    className="ddlborder"
                    lblClass="mb-0 lbl-req-field"
                  ></AsyncSelect>
                </div>
                <div className="col-lg-6">
                  <AsyncRemoteSelect
                    lblText="Send To"
                    lblClass="mb-0 lbl-req-field"
                  ></AsyncRemoteSelect>
                </div>
                <div className="col-lg-6">
                  <InputControl
                    lblClass="mb-0 lbl-req-field"
                    lblText="Name"
                    name="txtkeyword"
                    ctlType={formCtrlTypes.searchkeyword}
                    value={searchFormData.txtkeyword}
                    onChange={handleChange}
                    formErrors={formErrors}
                  ></InputControl>
                </div>
                <div className="col-lg-6">
                  <FileControl
                    lblClass="mb-0"
                    name="uploadimage"
                    ctlType={formCtrlTypes.file}
                    onChange={"handleFileChange"}
                    file={""}
                  />
                </div>
                <div className="ccol-lg-6">
                  <TextAreaControl
                    lblClass="mb-0 lbl-req-field"
                    lblText="Description"
                    name="description"
                    ctlType={formCtrlTypes.message}
                    onChange={""}
                    value={""}
                    required={true}
                  ></TextAreaControl>
                </div>
              </div>
              <hr className="w-100 text-primary d -none"></hr>
              <div className="d-flex justify-content-end">
                <div className="m-1">
                  <button
                    className="btn btn-secondary box-shadow"
                    name="btnclear"
                    id="btnclear"
                    type="reset"
                  >
                    Clear
                  </button>
                </div>
                <div className="m-1">
                  <button
                    className="btn btn-primary box-shadow"
                    name="btnssubmit"npm 
                    id="btnssubmit"
                    type="submit"
                  >
                    Sumbit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateNewRequest;
