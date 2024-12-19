import React, { lazy, useCallback, useEffect, useMemo, useState } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  debounce,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../utils/common";
import {
  ApiUrls,
  AppMessages,
  AppConstants,
  UserCookie,
  API_ACTION_STATUS,
  UserConnectionTabIds,
  ValidationMessages,
} from "../../utils/constants";
import AsyncSelect from "../../components/common/AsyncSelect";
import { useGetDdlUserAssetsGateway } from "../../hooks/useGetDdlUserAssetsGateway";
import { useAuth } from "../../contexts/AuthContext";
import { formCtrlTypes } from "../../utils/formvalidation";
import AsyncRemoteSelect from "../../components/common/AsyncRemoteSelect";
import moment from "moment";
import InputControl from "../../components/common/InputControl";
import TextAreaControl from "../../components/common/TextAreaControl";
import FileControl from "../../components/common/FileControl";

const CreateRequest = () => {
  let $ = window.$;

  const { loggedinUser } = useAuth();
  let formSendInvitaionErrors = {};
  const [sendInvitationErrors, setSendInvitationErrors] = useState({});

  const [selectedUsersProfile, setSelectedUsersProfile] = useState(null);

  const [selectedAsset, setSelectedAsset] = useState(null);

  const { userAssetsList } = useGetDdlUserAssetsGateway(
    "",
    parseInt(GetUserCookieValues(UserCookie.AccountId, loggedinUser)),
    parseInt(GetUserCookieValues(UserCookie.ProfileId, loggedinUser))
  );

  const handleAssetChange = (e) => {
    setSelectedAsset(e?.value);
  };

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
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-8 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <h4 className="mb-0 down-line">Create Service Request</h4>
              <div className="row m-2">
                <div className="col-12 mb-15">
                  <AsyncSelect
                    placeHolder={
                      userAssetsList.length <= 0 && selectedAsset == null
                        ? AppMessages.DdLLoading
                        : AppMessages.DdlDefaultSelect
                    }
                    noData={
                      userAssetsList.length <= 0 && selectedAsset == null
                        ? AppMessages.DdLLoading
                        : AppMessages.NoProperties
                    }
                    options={userAssetsList}
                    onChange={(e) => {
                      handleAssetChange(e);
                    }}
                    dataKey="AssetId"
                    dataVal="AddressOne"
                    value={selectedAsset}
                    name="ddlassets"
                    lbl={formCtrlTypes.asset}
                    lblText="Property"
                    lblClass="mb-0 lbl-req-field"
                    required={true}
                    errors={sendInvitationErrors}
                    formErrors={formSendInvitaionErrors}
                    tabIndex={1}
                  ></AsyncSelect>
                </div>
                <div className="col-12 mb-15">
                  <AsyncRemoteSelect
                    placeHolder={AppMessages.DdlTypetoSearch}
                    noData={AppMessages.NoAgents}
                    value={selectedUsersProfile}
                    name="ddlusersprofiles"
                    lblText="Send To"
                    lblClass="mb-0 lbl-req-field"
                    required={true}
                    errors={sendInvitationErrors}
                    formErrors={formSendInvitaionErrors}
                    isClearable={true}
                    tabIndex={2}
                  ></AsyncRemoteSelect>
                </div>
                <div className="col-12 mb-15">
                  <InputControl
                    lblClass="mb-0"
                    lblText=" Name"
                    name="txtkeyword"
                    ctlType={formCtrlTypes.searchkeyword}
                    value={searchFormData.txtkeyword}
                    onChange={handleChange}
                    formErrors={formSendInvitaionErrors}
                  ></InputControl>
                </div>
                <div className="col-md-12 mb-15">
                  <TextAreaControl
                    lblClass="mb-0 lbl-req-field"
                    lblText="Description"
                    name="description"
                    ctlType={formCtrlTypes.message}
                    onChange={""}
                    value={""}
                    required={true}
                    errors={sendInvitationErrors}
                    formErrors={formSendInvitaionErrors}
                    rows={3}
                    tabIndex={3}
                  ></TextAreaControl>
                </div>
                <div className="col-md-12 mb-15">
                  <FileControl
                    lblClass="mb-0"
                    name="uploadimage"
                    ctlType={formCtrlTypes.file}
                    onChange={"handleFileChange"}
                    file={""}
                    errors={sendInvitationErrors}
                    formErrors={formSendInvitaionErrors}
                    tabIndex={5}
                  />
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
                    name="btnsavechanges"
                    id="btnsavechanges"
                    type="submit"
                  >
                    Save Changes
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

export default CreateRequest;
