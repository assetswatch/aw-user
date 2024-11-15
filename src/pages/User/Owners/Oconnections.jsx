import React, { lazy, useCallback, useEffect, useState } from "react";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  debounce,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import { useAuth } from "../../../contexts/AuthContext";
import { ModalView } from "../../../components/common/LazyComponents";
import {
  ApiUrls,
  AppMessages,
  AppConstants,
  UserCookie,
  API_ACTION_STATUS,
  UserConnectionTabIds,
  ValidationMessages,
} from "../../../utils/constants";
import AsyncRemoteSelect from "../../../components/common/AsyncRemoteSelect";
import { axiosPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import TextAreaControl from "../../../components/common/TextAreaControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import { Toast } from "../../../components/common/ToastView";
import { useLocation } from "react-router-dom";
import AsyncSelect from "../../../components/common/AsyncSelect";
import { useGetNotificationTypesGateway } from "../../../hooks/useGetNotificationTypesGateway";
import { useProfileTypesGateway } from "../../../hooks/useProfileTypesGateway";
import InputControl from "../../../components/common/InputControl";
const Owners = lazy(() => import("./Oowners"));
const Agents = lazy(() => import("./Oagents"));
const Tenants = lazy(() => import("./Otenants"));

const Oconnections = () => {
  let $ = window.$;

  let formErrors = {};

  const location = useLocation();
  const Tabs = [
    UserConnectionTabIds.owners,
    UserConnectionTabIds.agents,
    UserConnectionTabIds.tenants,
  ];
  let defaultTab = Tabs[0];
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    let checkStateTab = location.state || {};
    if (!checkObjNullorEmpty(checkStateTab)) {
      if (!checkObjNullorEmpty(checkStateTab.tab)) {
        defaultTab = checkStateTab?.tab?.toString().toLowerCase();
      }
    }
    $(".nav-tab-line").children("li").removeClass("active");
    document
      .querySelector(`[data-target="${defaultTab}"]`)
      ?.classList.add("active");

    handleTabClick(defaultTab);
  }, []);

  let formSendInvitaionErrors = {};
  const { loggedinUser } = useAuth();
  const [sendInvitationErrors, setSendInvitationErrors] = useState({});
  const [sendInviteModalState, setSendInviteModalState] = useState(false);
  const [selectedUsersProfile, setSelectedUsersProfile] = useState(null);
  const [tabOwnersKey, setTabOwnersKey] = useState(0);
  const [tabAgentsKey, setTabAgentsKey] = useState(0);
  const [tabTenantsKey, setTabTenantsKey] = useState(0);

  function setInitialSendInvitationFormData() {
    return {
      txtmessage: "",
    };
  }

  const [sendInvitationFormData, setSendInvitationFormData] = useState(
    setInitialSendInvitationFormData()
  );

  const handleTabClick = (tabselected) => {
    // switch (tabselected) {
    //   case Tabs[0]:
    //     setTabJoinedKey((prevKey) => prevKey + 1);
    //     break;
    //   case Tabs[1]:
    //     setTabRequestedKey((prevKey) => prevKey + 1);
    //     break;
    //   case Tabs[2]:
    //     setTabConnectionKey((prevKey) => prevKey + 1);
    //     break;
    // }

    setActiveTab(tabselected);
  };

  useEffect(() => {
    // default action
    // $(".tab-element .tab-pane").hide();
    // $(".tab-action > ul li:first-child").addClass("active");
    // $(".tab-element .tab-pane:first-child").show();

    // on click event
    $(".tab-action ul li").on("click", function (e) {
      apiReqResLoader("x");
      $(this).parent("ul").children("li").removeClass("active");
      $(this).addClass("active");
      $(this).parent("ul").next(".tab-element").children(".tab-pane").hide();
      var activeTab = $(this).attr("data-target");
      $(activeTab).fadeIn();

      const parentElement = e.target;
      const parentAttribute = parentElement.getAttribute("data-target");
      setActiveTab(parentAttribute);
      apiReqResLoader("x", "", "completed");
      //return false;
    });
  }, []);

  // Send invite modal

  let formSendNotificationErrors = {};
  const [sendNotificationErrors, setSendNotificationErrors] = useState({});
  const [sendNotificationModalState, setSendNotificationModalState] =
    useState(false);
  let { profileTypesList } = useProfileTypesGateway();
  profileTypesList = profileTypesList ?? [];

  const [selectedProfileType, setSelectedProfileType] = useState(null);
  const [selectedJoinedUser, setSelectedJoinedUser] = useState(null);
  function setInitialSendNotificationFormData() {
    return {
      txtmessage: "",
    };
  }
  const [sendNotificationFormData, setSendNotificationFormData] = useState(
    setInitialSendNotificationFormData()
  );

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

    let objParams = {
      keyword: searchValue,
      inviterid: parseInt(
        GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
      ),
      InviterProfileTypeId: config.userProfileTypes.Agent,
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
            label: item.FirstName + " " + item.LastName,
            value: item.ProfileId,
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

  const handleProfileTypeChange = (e) => {
    setSelectedProfileType(e?.value);
    setSelectedJoinedUser(null);
  };

  const handleDdlJoinedUsersChange = () => {
    joinedUserOptions();
  };

  const usersProfilesOptions = useCallback(
    debounce((inputval, callback) => {
      if (inputval?.length >= AppConstants.DdlSearchMinLength) {
        getUsersProfiles(inputval).then((options) => {
          callback && callback(options);
        });
      } else {
        callback && callback([]);
      }
    }, AppConstants.DebounceDelay), // 500ms debounce delay
    []
  );

  const handleDdlUsersProfilesChange = () => {
    usersProfilesOptions();
  };

  //Get users profiles.
  const getUsersProfiles = async (searchValue) => {
    if (checkEmptyVal(searchValue)) return [];
    let objParams = {
      AccountId: parseInt(
        GetUserCookieValues(UserCookie.AccountId, loggedinUser)
      ),
      ProfileTypeId: config.userProfileTypes.Owner,
      Keyword: searchValue,
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getDdlUsersProfiles}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode == 200) {
          return objResponse.Data.map((item) => ({
            label: item.FirstName + " " + item.LastName,
            value: item.ProfileId,
          }));
        } else {
          return [];
        }
      })
      .catch((err) => {
        console.error(
          `"API :: ${ApiUrls.getDdlUsersProfiles}, Error ::" ${err}`
        );
        return [];
      });
  };

  const handleSendInvitationInputChange = (e) => {
    const { name, value } = e?.target;
    setSendInvitationFormData({
      ...sendInvitationFormData,
      [name]: value,
    });
  };

  const onSendInviteModalShow = (e) => {
    e.preventDefault();
    setSendInviteModalState(true);
  };

  const onSendInviteModalHide = (e) => {
    e?.preventDefault();
    setSendInviteModalState(false);
    setSelectedUsersProfile(null);
    setSendInvitationErrors({});
    setSendInvitationFormData(setInitialSendInvitationFormData());
  };

  const onSendInvitation = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkEmptyVal(selectedUsersProfile)) {
      formSendInvitaionErrors["ddlusersprofiles"] = ValidationMessages.OwnerReq;
    }

    if (Object.keys(formSendInvitaionErrors).length === 0) {
      setSendInvitationErrors({});
      apiReqResLoader(
        "btnsendinvitation",
        "Sending",
        API_ACTION_STATUS.START,
        false
      );

      let isapimethoderr = false;
      let objBodyParams = {
        AssetId: 0,
        InviterId: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        InviteeId: parseInt(setSelectDefaultVal(selectedUsersProfile)),
        Message: sendInvitationFormData.txtmessage,
      };

      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.createUserConnection}`,
        objBodyParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.Id > 0) {
              if (objResponse.Data.Status === 200) {
                Toast.success(objResponse.Data.Message);
                onSendInviteModalHide();
              } else {
                Toast.info(objResponse.Data.Message);
              }
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.createConnection}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
          }
          apiReqResLoader(
            "btnsendinvitation",
            "Send",
            API_ACTION_STATUS.COMPLETED,
            false
          );
        });
    } else {
      $(`[name=${Object.keys(formSendInvitaionErrors)[0]}]`).focus();
      setSendInvitationErrors(formSendInvitaionErrors);
    }
  };

  // Send invite modal

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-6">
                  <h5 className="mb-4 down-line">Connections</h5>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10">
                  <button
                    className="btn btn-primary btn-mini btn-glow shadow rounded"
                    name="btnsendinvite"
                    id="btnsendinvite"
                    type="button"
                    onClick={onSendInviteModalShow}
                  >
                    <i className="flaticon-envelope flat-mini position-relative me-1 t-1"></i>{" "}
                    Send Invite
                  </button>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li
                    className="active"
                    data-target={Tabs[0]}
                    onClick={() => {
                      handleTabClick(Tabs[0]);
                    }}
                  >
                    Owners
                  </li>
                  <li
                    className=""
                    data-target={Tabs[1]}
                    onClick={() => {
                      handleTabClick(Tabs[1]);
                    }}
                  >
                    Agents
                  </li>
                  <li
                    className=""
                    data-target={Tabs[2]}
                    onClick={() => {
                      handleTabClick(Tabs[2]);
                    }}
                  >
                    Tenants
                  </li>
                </ul>
                <div className="tab-element">
                  {activeTab == Tabs[0] && (
                    <div
                      className="tab-pane tab"
                      id={Tabs[0].toString().substring(1)}
                    >
                      <Owners key={tabOwnersKey} />
                    </div>
                  )}
                  {activeTab == Tabs[1] && (
                    <div
                      className="tab-pane tab"
                      id={Tabs[1].toString().substring(1)}
                    >
                      <Agents key={tabAgentsKey} />
                    </div>
                  )}
                  {activeTab == Tabs[2] && (
                    <div
                      className="tab-pane tab"
                      id={Tabs[2].toString().substring(1)}
                    >
                      <Tenants key={tabTenantsKey} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*============== Send Invite Modal Start ==============*/}
      {sendInviteModalState && (
        <>
          <ModalView
            title={AppMessages.SendInvitaionModalTitle}
            content={
              <>
                <div className="row">
                  <form noValidate>
                    <div className="col-12 mb-15">
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
                        lblText="Profile type"
                        lblClass="mb-0 lbl-req-field"
                        required={true}
                        errors={sendNotificationErrors}
                        formErrors={formSendNotificationErrors}
                        tabIndex={1}
                      ></AsyncSelect>
                    </div>
                    <div className="col-12 mb-15">
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
                        errors={sendNotificationErrors}
                        formErrors={formSendNotificationErrors}
                        isClearable={true}
                        cacheOptions={false}
                        tabIndex={2}
                      ></AsyncRemoteSelect>
                    </div>
                    <div className="col-12 mb-0 mt-0 text-center">
                      <span>Or Invite Through Email</span>
                    </div>
                    <div className="col-12 mb-15">
                      <InputControl
                        lblClass="mb-0"
                        lblText="Email"
                        name="txtemail"
                        ctlType={formCtrlTypes.email}
                        formErrors={formErrors}
                      ></InputControl>
                    </div>
                    <div className="col-12 mb-0">
                      <TextAreaControl
                        lblClass="mb-0 lbl-req-field"
                        name={`txtmessage`}
                        ctlType={formCtrlTypes.message}
                        onChange={handleSendInvitationInputChange}
                        value={sendInvitationFormData.txtmessage}
                        required={true}
                        errors={sendInvitationErrors}
                        formErrors={formSendInvitaionErrors}
                        rows={3}
                        tabIndex={3}
                      ></TextAreaControl>
                    </div>
                  </form>
                </div>
              </>
            }
            onClose={onSendInviteModalHide}
            actions={[
              {
                id: "btnsendinvitation",
                text: "Send",
                displayOrder: 1,
                btnClass: "btn-primary",
                onClick: (e) => onSendInvitation(e),
              },
              {
                text: "Cancel",
                displayOrder: 2,
                btnClass: "btn-secondary",
                onClick: (e) => onSendInviteModalHide(e),
              },
            ]}
          ></ModalView>
        </>
      )}
      {/*============== Send Invite Modal End ==============*/}
    </>
  );
};

export default Oconnections;
