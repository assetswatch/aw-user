import React from "react";
import { DataLoader, NoData } from "../../components/common/LazyComponents";
import {
  apiReqResLoader,
  checkObjNullorEmpty,
  GetCookieValues,
  getPagesPathByLoggedinUserProfile,
  GetUserCookieValues,
} from "../../utils/common";
import { ApiUrls, AppMessages, UserCookie } from "../../utils/constants";
import { Link, useNavigate } from "react-router-dom";
import { routeNames } from "../../routes/routes";
import usePlansGateway from "../../hooks/usePlansGateway";
import { axiosPost } from "../../helpers/axiosHelper";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config.json";

const UpgradePlan = () => {
  let $ = window.$;

  const { plansList, isDataLoading } = usePlansGateway();
  const { loggedinUser, updateUserPlan } = useAuth();
  const navigate = useNavigate();

  const onUpgragePlan = (e, planid) => {
    apiReqResLoader("x");
    e.preventDefault();
    let errctl = ".form-error";
    $(errctl).html("");
    let isapimethoderr = false;

    let objBodyParams = {
      accountid: parseInt(
        GetUserCookieValues(UserCookie.AccountId, loggedinUser)
      ),
      planid: planid,
    };

    axiosPost(`${config.apiBaseUrl}${ApiUrls.upgradePlan}`, objBodyParams)
      .then((response) => {
        let objResponse = response.data;
        if (objResponse?.StatusCode === 200) {
          let respData = objResponse.Data;

          updateUserPlan({ PlanId: respData?.PlanId, Plan: respData?.Plan });
          navigate(
            getPagesPathByLoggedinUserProfile(
              GetCookieValues(UserCookie.ProfileTypeId),
              "profile"
            )
          );
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(`"API :: ${ApiUrls.login}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr == true) {
          $(errctl).html(AppMessages.SomeProblem);
        }
        apiReqResLoader("x", "", "completed");
      });
  };

  return (
    <>
      <div className="full-row  bg-light">
        <div className="container">
          <div className="row mx-auto col-lg-12 shadow">
            <div className="bg-white xs-p-20 p-30 pb-30 border rounded">
              <h4 className="mb-4 down-line">Upgrade your plan</h4>
              <div className="row pt-30 pb-0 g-4 flex-center">
                {isDataLoading && (
                  <div className="pb-100">
                    <DataLoader />
                  </div>
                )}
                {!isDataLoading && (
                  <>
                    {checkObjNullorEmpty(plansList) ||
                      (plansList.length == 0 && (
                        <div className="pb-100">
                          <NoData message={AppMessages.NoData} />
                        </div>
                      ))}
                    {!checkObjNullorEmpty(plansList) &&
                      plansList.length > 0 && (
                        <>
                          <div className="row divider-col-4 row-cols-xl-4 row-cols-md-2 row-cols-1">
                            {plansList?.map((p, pidx) => {
                              return (
                                <div
                                  className={`col pt-10 mt-20 ${
                                    GetUserCookieValues(
                                      UserCookie.PlanId,
                                      loggedinUser
                                    ) == p.PlanId
                                      ? "bg-light shadow"
                                      : ""
                                  }`}
                                  key={`plan-${pidx}`}
                                >
                                  <div className="px-2 sm-px-0 mb-20">
                                    <h4 className="text-start font-500 down-line text-primary pb-10">
                                      {p.Plan}
                                    </h4>
                                    <ul className="list-style-tick my-4 ul-plans">
                                      {p?.Features?.map((f, fidx) => {
                                        return (
                                          <li
                                            key={`f-${fidx}`}
                                            className={
                                              f.LimitDisplay == "na" ? "na" : ""
                                            }
                                          >
                                            {f.Name}
                                            {f.LimitDisplay == "na"
                                              ? ""
                                              : f.LimitDisplay == ""
                                              ? f.LimitDisplay
                                              : ` - ${f.LimitDisplay}`}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                    <div
                                      style={{
                                        justifyContent: "space-between",
                                        display: "flex",
                                      }}
                                      className="pt-10"
                                    >
                                      <div className="text-start text-primary">
                                        <span className="h2 font-400 text-primary">
                                          <sup>
                                            {p.StrPerMonth.substring(0, 1)}
                                          </sup>{" "}
                                          {p.StrPerMonth.substring(1)}
                                        </span>
                                        /mo
                                      </div>
                                      <div className="text-end text-primary pr-10">
                                        <span className="h2 font-400 text-primary">
                                          <sup>
                                            {p.StrPerAnnum.substring(0, 1)}
                                          </sup>{" "}
                                          {p.StrPerAnnum.substring(1)}
                                        </span>
                                        /yr
                                      </div>
                                    </div>
                                  </div>
                                  {GetUserCookieValues(
                                    UserCookie.PlanId,
                                    loggedinUser
                                  ) != p.PlanId && (
                                    <div className="text-center">
                                      <button
                                        className="btn btn-primary btn-mini box-shadow btn-glow rounded"
                                        onClick={(e) => {
                                          onUpgragePlan(e, p.PlanId);
                                        }}
                                      >
                                        Select
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <hr className="w-100 text-primary d -none"></hr>
                          <div className="w-100 pt-10 pr-10 d-flex mt-0">
                            <div className="d-flex flex-center flex-1 form-error"></div>
                            <Link
                              className="font-500 font-general d-flex flex-end text-primary"
                              to={getPagesPathByLoggedinUserProfile(
                                GetCookieValues(UserCookie.ProfileTypeId),
                                "profile"
                              )}
                            >
                              <u>
                                Skip
                                <i className="pl-5 fa fa-circle-chevron-right"></i>
                              </u>
                            </Link>
                          </div>
                        </>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpgradePlan;
