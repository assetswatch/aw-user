import React, { lazy, useEffect, useState } from "react";
import { DocumentsTabIds } from "../../../utils/constants";
import { useLocation, useNavigate } from "react-router-dom";
import {
  apiReqResLoader,
  checkObjNullorEmpty,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import { routeNames } from "../../../routes/routes";

const MyDocuments = lazy(() => import("./MyDocuments"));
const SharedDocuments = lazy(() => import("./SharedDocuments"));

const Documents = () => {
  let $ = window.$;
  const location = useLocation();
  const navigate = useNavigate();

  const Tabs = [DocumentsTabIds.mydocuments, DocumentsTabIds.shareddocuments];
  let defaultTab = Tabs[0];

  const [activeTab, setActiveTab] = useState("");
  const [tabMyDocumentsKey, setTabMyDocumentsKey] = useState(0);
  const [tabSharedDocumentsKey, setTabSharedDocumentsKey] = useState(0);

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

  const handleTabClick = (tabselected) => {
    setActiveTab(tabselected);
  };

  useEffect(() => {
    // default action
    //$(".tab-element .tab-pane").hide();
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

  const onAdd = () => {
    navigate(routeNames.agentadddocument.path);
  };

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-6">
                  <h5 className="mb-4 down-line">My Documents</h5>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10">
                  <button
                    className="btn btn-primary btn-mini btn-glow shadow rounded"
                    name="btnsendinvite"
                    id="btnsendinvite"
                    type="button"
                    onClick={onAdd}
                  >
                    <i className="fa-regular fa-file-lines position-relative me-1 t-1"></i>{" "}
                    Add Document
                  </button>
                </div>
              </div>
              <div className="tabw100 tab-action shadow rounded bg-white">
                <ul className="nav-tab-line list-color-secondary d-table mb-0 d-flex box-shadow">
                  <li
                    className="ac tive"
                    data-target={Tabs[0]}
                    onClick={() => {
                      handleTabClick(Tabs[0]);
                    }}
                  >
                    My Documents
                  </li>
                  <li
                    className=""
                    data-target={Tabs[1]}
                    onClick={() => {
                      handleTabClick(Tabs[1]);
                    }}
                  >
                    Shared Documents
                  </li>
                </ul>
                <div className="tab-element">
                  {activeTab == Tabs[0] && (
                    <div
                      className="tab-pane tab"
                      id={Tabs[0].toString().substring(1)}
                    >
                      <MyDocuments key={tabMyDocumentsKey} />
                    </div>
                  )}
                  {activeTab == Tabs[1] && (
                    <div
                      className="tab-pane tab"
                      id={Tabs[1].toString().substring(1)}
                    >
                      <SharedDocuments key={tabSharedDocumentsKey} />
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

export default Documents;
