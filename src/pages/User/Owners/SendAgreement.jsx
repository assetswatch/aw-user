import React, { useState, useCallback } from "react";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  debounce,
  checkEmptyVal,
  checkStartEndDateGreater,
  setSelectDefaultVal,
} from "../../../utils/common";
import {
  ApiUrls,
  AppMessages,
  UserCookie,
  AppConstants,
  ValidationMessages,
  SessionStorageKeys,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { useNavigate } from "react-router-dom";
import { routeNames } from "../../../routes/routes";
import { useGetDdlUserAssetsGateway } from "../../../hooks/useGetDdlUserAssetsGateway";
import { useProfileTypesGateway } from "../../../hooks/useProfileTypesGateway";
import AsyncSelect from "../../../components/common/AsyncSelect";
import AsyncRemoteSelect from "../../../components/common/AsyncRemoteSelect";
import DateControl from "../../../components/common/DateControl";
import TextAreaControl from "../../../components/common/TextAreaControl";
import {
  addSessionStorageItem,
  deletesessionStorageItem,
} from "../../../helpers/sessionStorageHelper";

const SendAgreement = () => {
  let $ = window.$;

  const navigate = useNavigate();

  let formErrors = {};
  const [errors, setErrors] = useState({});

  const { loggedinUser } = useAuth();

  let accountid = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );
  let profileid = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  const { userAssetsList } = useGetDdlUserAssetsGateway(
    "",
    accountid
    //profileid
  );

  let { profileTypesList } = useProfileTypesGateway();

  let rentPaidToProfilesList = profileTypesList?.filter(
    (item) => item.ProfileTypeId != config.userProfileTypes.Tenant
  );

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedProfileType, setSelectedProfileType] = useState(null);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);
  const [selectedRentPaidTo, setSelectedRentPaidTo] = useState(null);

  const [formData, setFormData] = useState({
    txttenurestartdate: "",
    txttenureenddate: "",
    txtdescription: "",
  });

  const handleAssetChange = (e) => {
    setSelectedAsset(e?.value);
  };

  const handleProfileTypeChange = (e) => {
    setSelectedProfileType(e?.value);
    setSelectedJoinedUser(null);
  };

  const handleRentPaidToChange = (e) => {
    setSelectedRentPaidTo(e?.value);
  };

  const onDateChange = (newDate, name) => {
    setFormData({
      ...formData,
      [name]: newDate,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDdlJoinedUsersChange = () => {
    joinedUserOptions();
  };

  const joinedUserOptions = useCallback(
    debounce((inputval, callback) => {
      if (inputval?.length >= AppConstants.DdlSearchMinLength) {
        getJoinedUsers(inputval).then((options) => {
          callback && callback(options);
        });
      } else {
        callback && callback([]);
      }
    }, AppConstants.DebounceDelay), // 500ms debounce delay
    [selectedProfileType]
  );

  //Get joined users.
  const getJoinedUsers = async (searchValue) => {
    if (checkEmptyVal(searchValue)) return [];
    if (checkEmptyVal(selectedProfileType) == true) return [];
    let objParams = {
      keyword: searchValue,
      inviterid: parseInt(
        GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
      ),
      InviterProfileTypeId: config.userProfileTypes.Owner,
      InviteeProfileTypeId: parseInt(selectedProfileType),
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getDdlJoinedUserConnections}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          return objResponse.Data.map((item) => ({
            label: (
              <div className="flex items-center">
                <div className="w-40px h-40px mr-10 flex-shrink-0">
                  <img
                    alt=""
                    src={item.PicPath}
                    className="rounded cur-pointer w-40px"
                  />
                </div>
                <div>
                  <span className="text-primary lh-1 d-block">
                    {item.FirstName + " " + item.LastName}
                  </span>
                  <span className="small text-light">{item.ProfileType}</span>
                </div>
              </div>
            ),
            value: item.ProfileId,
            customlabel: item.FirstName + " " + item.LastName,
          }));
        } else {
          return [];
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getDdlJoinedUserConnections}, Error ::" ${err}`
        );
        return [];
      });
  };

  const onNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedJoinedUser)) {
      formErrors["ddljoinedusers"] = ValidationMessages.UserReq;
    }

    if (checkEmptyVal(selectedProfileType)) {
      formErrors["ddlprofiletype"] = ValidationMessages.ProfiletypeReq;
    }

    if (checkEmptyVal(selectedAsset)) {
      formErrors["ddlassets"] = ValidationMessages.PropertyReq;
    }

    if (checkEmptyVal(selectedRentPaidTo)) {
      formErrors["ddlrentpaidto"] = ValidationMessages.RentPaidToReq;
    }

    if (checkEmptyVal(formData.txttenurestartdate)) {
      formErrors["txttenurestartdate"] = ValidationMessages.TenureStartDateReq;
    }

    if (checkEmptyVal(formData.txttenureenddate)) {
      formErrors["txttenureenddate"] = ValidationMessages.TenureEndDateReq;
    } else {
      let dateCheck = checkStartEndDateGreater(
        formData.txttenurestartdate,
        formData.txttenureenddate
      );

      if (!checkEmptyVal(dateCheck)) {
        formErrors["txttenurestartdate"] = dateCheck;
      }
    }

    if (Object.keys(formErrors).length === 0) {
      setErrors({});
      addSessionStorageItem(
        SessionStorageKeys.ObjSendAgreement,
        JSON.stringify({
          aid: parseInt(setSelectDefaultVal(selectedAsset)),
          ptid: parseInt(setSelectDefaultVal(selectedProfileType)),
          pid: parseInt(setSelectDefaultVal(selectedJoinedUser)),
          rptid: parseInt(setSelectDefaultVal(selectedRentPaidTo)),
          d: formData.txtdescription,
          tstdt: formData.txttenurestartdate,
          tedt: formData.txttenureenddate,
        })
      );
      navigate(routeNames.ownerpreviewagreement.path);
    } else {
      // $(`[name=${Object.keys(formErrors)[0]}]`).focus();
      setErrors(formErrors);
    }
  };

  const onCancel = (e) => {
    e.preventDefault();
    window.history.go(-1);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-8 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <h6 className="mb-4 down-line pb-10">Send Agreement</h6>
              {/*============== Send Agreement Form Start ==============*/}
              <form noValidate>
                <div className="row">
                  <div className="col-md-6 mb-15">
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
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={1}
                    ></AsyncSelect>
                  </div>
                  <div className="col-md-6 mb-15">
                    <AsyncSelect
                      placeHolder={
                        profileTypesList.length <= 0 &&
                        selectedProfileType == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlDefaultSelect
                      }
                      noData={
                        profileTypesList.length <= 0 &&
                        selectedProfileType == null
                          ? AppMessages.DdLLoading
                          : AppMessages.NoProfileTypes
                      }
                      options={profileTypesList}
                      onChange={(e) => {
                        handleProfileTypeChange(e);
                      }}
                      dataKey="ProfileTypeId"
                      dataVal="ProfileType"
                      value={selectedProfileType}
                      name="ddlprofiletype"
                      lbl={formCtrlTypes.profiletype}
                      lblText="Send to profile type"
                      lblClass="mb-0 lbl-req-field"
                      required={true}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={2}
                    ></AsyncSelect>
                  </div>
                  <div className="col-md-6 mb-15">
                    <AsyncRemoteSelect
                      placeHolder={AppMessages.DdlTypetoSearch}
                      noData={AppMessages.NoUsers}
                      loadOptions={joinedUserOptions}
                      handleInputChange={(e, val) => {
                        handleDdlJoinedUsersChange(e, val.prevInputValue);
                      }}
                      onChange={(option) => setSelectedJoinedUser(option)}
                      value={selectedJoinedUser}
                      name="ddljoinedusers"
                      lblText="User"
                      lblClass="mb-0 lbl-req-field"
                      required={true}
                      errors={errors}
                      formErrors={formErrors}
                      isClearable={true}
                      cacheOptions={false}
                      tabIndex={3}
                    ></AsyncRemoteSelect>
                  </div>
                  <div className="col-md-6 mb-15">
                    <DateControl
                      lblClass="mb-0 lbl-req-field"
                      lblText="Tenure start date"
                      name="txttenurestartdate"
                      required={true}
                      onChange={(dt) => onDateChange(dt, "txttenurestartdate")}
                      value={formData.txttenurestartdate}
                      isTime={false}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={4}
                    ></DateControl>
                  </div>
                  <div className="col-md-6 mb-15">
                    <DateControl
                      lblClass="mb-0 lbl-req-field"
                      lblText="Tenure end date"
                      name="txttenureenddate"
                      required={true}
                      onChange={(dt) => onDateChange(dt, "txttenureenddate")}
                      value={formData.txttenureenddate}
                      isTime={false}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={5}
                    ></DateControl>
                  </div>
                  <div className="col-md-6 mb-15">
                    <AsyncSelect
                      placeHolder={
                        rentPaidToProfilesList.length <= 0 &&
                        selectedRentPaidTo == null
                          ? AppMessages.DdLLoading
                          : AppMessages.DdlDefaultSelect
                      }
                      noData={
                        rentPaidToProfilesList.length <= 0 &&
                        selectedRentPaidTo == null
                          ? AppMessages.DdLLoading
                          : AppMessages.NoProfileTypes
                      }
                      options={rentPaidToProfilesList}
                      onChange={(e) => {
                        handleRentPaidToChange(e);
                      }}
                      dataKey="ProfileTypeId"
                      dataVal="ProfileType"
                      value={selectedRentPaidTo}
                      name="ddlrentpaidto"
                      lbl={formCtrlTypes.rentpaidto}
                      lblText="Rent paid to"
                      lblClass="mb-0 lbl-req-field"
                      required={true}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={6}
                    ></AsyncSelect>
                  </div>
                  <div className="col-md-12 mb-15">
                    <TextAreaControl
                      lblClass="mb-0"
                      name="txtdescription"
                      ctlType={formCtrlTypes.description500}
                      required={false}
                      onChange={handleChange}
                      value={formData.txtdescription}
                      errors={errors}
                      formErrors={formErrors}
                      tabIndex={7}
                      rows={4}
                    ></TextAreaControl>
                  </div>
                </div>
                <hr className="w-100 text-primary my-20"></hr>
                <div className="container-fluid">
                  <div className="row form-action flex-center">
                    <div
                      className="col-md-6 px-0 form-error"
                      id="form-error"
                    ></div>
                    <div className="col-md-6 px-0">
                      <button
                        className="btn btn-secondary"
                        id="btnCancel"
                        onClick={onCancel}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        id="btnNext"
                        onClick={onNext}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              {/*============== Send Agreement Form End ==============*/}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SendAgreement;
