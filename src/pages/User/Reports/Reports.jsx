import React, { lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  apiReqResLoader,
  checkEmptyVal,
  checkObjNullorEmpty,
  debounce,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
  setSelectDefaultVal,
} from "../../../utils/common";
import {
  ApiUrls,
  AppMessages,
  AppConstants,
  UserCookie,
  API_ACTION_STATUS,
  UserConnectionTabIds,
  ValidationMessages,
} from "../../../utils/constants";

const PropertyReport = lazy(() => import("./PropertyReport"));
const TransactionReport = lazy(() => import("./TransactionReport"));

const Reports = () => {
  let $ = window.$;

  const location = useLocation();
  const Tabs = [
    UserConnectionTabIds.propertyreport,
    UserConnectionTabIds.transactionreport,
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

  const [tabPropertyReportKey, setTabPropertyReportKey] = useState(0);
  const [tabTransactionReportKey, setTabTransactionReportKey] = useState(0);

  const handleTabClick = (tabselected) => {
    setActiveTab(tabselected);
  };
  useEffect(() => {
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

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-6">
                  <h5 className="mb-4 down-line">Reports</h5>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li
                    className="" //"active"
                    data-target={Tabs[0]}
                    onClick={() => {
                      handleTabClick(Tabs[0]);
                    }}
                  >
                    Property Report
                  </li>
                  <li
                    className=""
                    data-target={Tabs[1]}
                    onClick={() => {
                      handleTabClick(Tabs[1]);
                    }}
                  >
                    Transaction Report
                  </li>
                </ul>
                <div className="tab-element">
                  {activeTab == Tabs[0] && (
                    <div
                      className="tab-pane tab"
                      id={Tabs[0].toString().substring(1)}
                    >
                      <PropertyReport key={tabPropertyReportKey} />
                    </div>
                  )}
                  {activeTab == Tabs[1] && (
                    <div
                      className="tab-pane tab"
                      id={Tabs[1].toString().substring(1)}
                    >
                      <TransactionReport key={tabTransactionReportKey} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
