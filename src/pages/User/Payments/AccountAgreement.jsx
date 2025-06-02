import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config.json";
import { useAuth } from "../../../contexts/AuthContext";
import {
  apiReqResLoader,
  checkObjNullorEmpty,
  GetCookieValues,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  API_ACTION_STATUS,
  ApiUrls,
  AppMessages,
  SessionStorageKeys,
  UserCookie,
} from "../../../utils/constants";
import { Toast } from "../../../components/common/ToastView";
import { axiosPost } from "../../../helpers/axiosHelper";
import { routeNames } from "../../../routes/routes";
import { getsessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { DataLoader } from "../../../components/common/LazyComponents";
import GoBackPanel from "../../../components/common/GoBackPanel";

const AccountAgreement = () => {
  let $ = window.$;

  const navigate = useNavigate();

  const { loggedinUser } = useAuth();

  let accountId = parseInt(
    GetUserCookieValues(UserCookie.AccountId, loggedinUser)
  );

  let profileId = parseInt(
    GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
  );

  let subAccountId = parseInt(
    getsessionStorageItem(SessionStorageKeys.ViewPaymentSubAccountId, 0)
  );

  const iframeRef = useRef(null);
  const [subAccountDetails, SetSubAccountDetails] = useState({});

  //Load
  useEffect(() => {
    Promise.allSettled([getAccountDetails()]).then(() => {});
  }, []);

  const getAccountDetails = () => {
    if (subAccountId > 0) {
      let isapimethoderr = false;
      let objParams = {
        SubAccountId: subAccountId,
      };
      axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getPaymentSubAccountDetails}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            let details = objResponse.Data;
            if (checkObjNullorEmpty(details) == false) {
              if (details.Status != config.paymentAccountCreateStatus.Pending) {
                Toast.success(
                  details.Status == config.paymentAccountCreateStatus.Active
                    ? AppMessages.PaymentSubaccountAlreadyActivated
                    : details.Status ==
                      config.paymentAccountCreateStatus.Processing
                    ? AppMessages.PaymentSubaccountProcessing
                    : AppMessages.PaymentSubaccountRejected
                );
                navigateToPaymentsAccounts();
              } else {
                SetSubAccountDetails(details);
              }
            } else {
              Toast.error(AppMessages.PaymentSubaccountDetailsNotFound);
              navigateToPaymentsAccounts();
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.getPaymentSubAccountDetails}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr == true) {
            Toast.error(AppMessages.SomeProblem);
            navigateToPaymentsAccounts();
          }
        });
    } else {
      let isapimethoderr = false;
      let objParams = {};
      objParams = {
        AccountId: accountId,
        ProfileId: profileId,
        Status: `${config.paymentAccountCreateStatus.Pending},${config.paymentAccountCreateStatus.Processing}`,
      };
      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getPaymentSubAccountsCountByStatus}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            if (objResponse.Data.TotalCount > 0) {
              navigateToPaymentsAccounts();
            } else {
              //Get  profile details
              let objProfileDetailsParams = {
                ProfileId: profileId,
              };
              axiosPost(
                `${config.apiBaseUrl}${ApiUrls.getUserDetails}`,
                objProfileDetailsParams
              )
                .then((response) => {
                  let objResponse = response.data;
                  if (objResponse.StatusCode === 200) {
                    let details = objResponse.Data;
                    if (checkObjNullorEmpty(details) == false) {
                      //Create subaccount
                      let objParams = {
                        Email: details.Email,
                        DbaName: details.FirstName,
                        LegalName: details.FirstName,
                        AccountId: accountId,
                        ProfileId: profileId,
                        ChannelId: 1,
                      };
                      axiosPost(
                        `${config.apiBaseUrl}${ApiUrls.createSubAccount}`,
                        objParams
                      )
                        .then((response) => {
                          let objResponse = response.data;
                          if (objResponse.StatusCode === 200) {
                            let details = objResponse.Data;
                            if (checkObjNullorEmpty(details) == false) {
                              SetSubAccountDetails(details);
                            } else {
                              Toast.error(details?.data?.Message);
                              navigateToPaymentsAccounts();
                            }
                          } else {
                            isapimethoderr = true;
                          }
                        })
                        .catch((err) => {
                          isapimethoderr = true;
                          console.error(
                            `"API :: ${ApiUrls.createSubAccount}, Error ::" ${err}`
                          );
                        })
                        .finally(() => {
                          if (isapimethoderr == true) {
                            Toast.error(AppMessages.SomeProblem);
                            navigateToPaymentsAccounts();
                          }
                        });
                      //Create subaccount
                    } else {
                      Toast.error(AppMessages.ProfileDetailsNotFound);
                      navigateToPaymentsAccounts();
                    }
                  } else {
                    isapimethoderr = true;
                  }
                })
                .catch((err) => {
                  isapimethoderr = true;
                  console.error(
                    `"API :: ${ApiUrls.getUserDetails}, Error ::" ${err}`
                  );
                })
                .finally(() => {
                  if (isapimethoderr == true) {
                    Toast.error(AppMessages.SomeProblem);
                    navigateToPaymentsAccounts();
                  }
                });
            }
          } else {
            isapimethoderr = true;
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          console.error(
            `"API :: ${ApiUrls.getPaymentSubAccountsCountByStatus}, Error ::" ${err}`
          );
        })
        .finally(() => {
          if (isapimethoderr === true) {
            Toast.error(AppMessages.SomeProblem);
          }
        });
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.toString().toLowerCase() == "complete") {
        apiReqResLoader("x");
        Toast.success(AppMessages.PaymentSubaccountCreatedSuccess);
        navigate(routeNames.paymentsaccounts.path, {
          state: {
            reload: true,
          },
        });
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const navigateToPaymentsAccounts = () => {
    navigate(routeNames.paymentsaccounts.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row  bg-light content-ph">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex w-100">
                <div className="flex-grow-1">
                  <div className="breadcrumb my-1">
                    <div className="breadcrumb-item bc-fh">
                      <h6
                        className="mb-3 down-line pb-10 cur-pointer"
                        onClick={navigateToPaymentsAccounts}
                      >
                        Payments
                      </h6>
                    </div>
                    <div className="breadcrumb-item bc-fh ctooltip-container">
                      <span className="font-general font-500 cur-default">
                        Account Details
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mx-auto col-lg-8 shadow">
                <div className="bg-white xs-p-20 px-30 py-20 pb-30 border rounded">
                  <div className="row">
                    <div className="d-flex w-100">
                      <div className="flex-grow-1">
                        <h6 className="mb-3 down-line pb-10 px-0 font-16">
                          Account Details
                        </h6>
                      </div>
                      <GoBackPanel
                        clickAction={navigateToPaymentsAccounts}
                        isformBack={true}
                      />
                    </div>
                  </div>
                  <div className="row pt-10 pb-0 row-cols-1 g-4 flex-center mx-0 p-0">
                    {subAccountDetails ? (
                      <>
                        <div className={`flex flex-center position-absolute`}>
                          <div className="data-loader"></div>
                        </div>
                        <iframe
                          ref={iframeRef}
                          src={subAccountDetails?.AgreementFormUrl}
                          onLoad={() => {
                            document.getElementsByClassName(
                              "data-loader"
                            )[0].style.display = "none";
                          }}
                          title="Paymnent Account Creation"
                          width="100%"
                          height="700px"
                          padding="0"
                          allowtransparency="true"
                          className="box-shadow rounded"
                          style={{
                            border: "1px solid #ccc",
                            padding: "0",
                          }}
                        />
                      </>
                    ) : (
                      <DataLoader />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountAgreement;
