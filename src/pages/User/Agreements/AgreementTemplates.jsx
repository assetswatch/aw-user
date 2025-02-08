import React, { useCallback, useRef, useState } from "react";
import { Grid } from "../../../components/common/LazyComponents";
import InputControl from "../../../components/common/InputControl";
import { formCtrlTypes } from "../../../utils/formvalidation";
import {
  apiReqResLoader,
  GetUserCookieValues,
  SetPageLoaderNavLinks,
} from "../../../utils/common";
import {
  ApiUrls,
  AppMessages,
  UserCookie,
  API_ACTION_STATUS,
  GridDefaultValues,
  SessionStorageKeys,
} from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { axiosPost, fetchPost } from "../../../helpers/axiosHelper";
import config from "../../../config.json";
import { addSessionStorageItem } from "../../../helpers/sessionStorageHelper";
import { routeNames } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import { Toast } from "../../../components/common/ToastView";

const AgreementTemplates = () => {
  let $ = window.$;

  let formErrors = {};
  const { loggedinUser } = useAuth();
  const navigate = useNavigate();

  //Grid
  const [agreementsList, setAgreementsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

  //Set search form intial data
  const setSearchInitialFormData = () => {
    return {
      txtkeyword: "",
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

  //Set search formdata

  // Search events

  const onSearch = (e) => {
    e.preventDefault();
    getAgreements({ isSearch: true });
  };

  const onShowAll = (e) => {
    e.preventDefault();
    setSearchFormData(setSearchInitialFormData);
    getAgreements({ isShowall: true });
  };

  // Search events

  //Get agreements list
  const getAgreements = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps,
    isSearch = false,
    isShowall = false,
  }) => {
    let errctl = "#search-val-err-message";
    $(errctl).html("");

    //Validation check
    if (Object.keys(formErrors).length > 0) {
      $(errctl).html(formErrors[Object.keys(formErrors)[0]]);
    } else {
      //show loader if search actions.
      if (isSearch || isShowall) {
        apiReqResLoader("x", API_ACTION_STATUS.START);
      }
      setIsDataLoading(true);
      let isapimethoderr = false;
      let objParams = {};
      objParams = {
        ProfileId: parseInt(
          GetUserCookieValues(UserCookie.ProfileId, loggedinUser)
        ),
        accountid: parseInt(
          GetUserCookieValues(UserCookie.AccountId, loggedinUser)
        ),
        keyword: "",
        fromdate: "",
        todate: "",
        pi: parseInt(pi),
        ps: parseInt(ps),
      };

      if (!isShowall) {
        objParams = {
          ...objParams,
          keyword: searchFormData.txtkeyword,
        };
      }

      return axiosPost(
        `${config.apiBaseUrl}${ApiUrls.getAgreements}`,
        objParams
      )
        .then((response) => {
          let objResponse = response.data;
          if (objResponse.StatusCode === 200) {
            setTotalCount(objResponse.Data.TotalCount);
            setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
            setAgreementsList(objResponse.Data.Agreements);
          } else {
            isapimethoderr = true;
            setAgreementsList([]);
            setPageCount(0);
          }
        })
        .catch((err) => {
          isapimethoderr = true;
          setAgreementsList([]);
          setPageCount(0);
          console.error(`"API :: ${ApiUrls.getAgreements}, Error ::" ${err}`);
        })
        .finally(() => {
          if (isapimethoderr === true) {
            $(errctl).html(AppMessages.SomeProblem);
          }
          if (isSearch || isShowall) {
            apiReqResLoader("x", "", API_ACTION_STATUS.COMPLETED);
          }
          setIsDataLoading(false);
        });
    }
  };

  //Setup Grid.

  const columns = React.useMemo(
    () => [
      {
        Header: "Name",
        accessor: "Title",
        className: "w-300px",
        disableSortBy: true,
      },
      {
        Header: "Type",
        accessor: "FeeTypeDisplay",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Fee",
        accessor: "AmountDisplay",
        disableSortBy: true,
        className: "w-200px",
      },
      {
        Header: "Actions",
        className: "w-130px",
        actions: [
          {
            text: "View Agreement",
            onclick: (e, row) => onView(e, row),
          },
          {
            text: "Download",
            onclick: (e, row) => {
              downloadAgreement(e, row);
            },
            icssclass: "pr-10 pl-2px",
          },
        ],
      },
      // {
      //   Header: "Actions",
      //   showActionMenu: false,
      //   className: "w-150px gr-action",
      //   Cell: ({ row }) => (
      //     // row.original.IsPaid == 0 &&
      //     // row.original.FeeType.toUpperCase() == "P" ? (
      //     //   <button
      //     //     className="btn btn-primary btn-xs btn-glow shadow rounded lh-26 px-10"
      //     //     name="btnsendnotificationmodal"
      //     //     id="btnsendnotificationmodal"
      //     //     type="button"
      //     //   >
      //     //     <i className="fa fa-credit-card position-relative me-1 t-1 text-white"></i>{" "}
      //     //     Buy{" "}
      //     //   </button>
      //     // ) : (
      //     <>
      //       <a className="pr-10" title="view" onClick={(e) => onView(e, row)}>
      //         <i className="far fa-eye pe-2 text-general font-15 hovertxt-primary" />
      //       </a>
      //       <a className="pr-10" title="send" onClick={(e) => onSend(e, row)}>
      //         <i className="icons font-16 icon-action-redo text-general hovertxt-primary"></i>
      //       </a>
      //     </>
      //   ),
      //   // ),
      // },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
    if (fetchId === fetchIdRef.current) {
      getAgreements({ pi: pageIndex, ps: pageSize });
    }
  }, []);

  //Setup Grid.

  //Grid actions

  const onView = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(
      SessionStorageKeys.ViewAgreementId,
      row.original.AgreementId
    );
    navigate(routeNames.previewagreement.path);
  };

  const onSend = (e, row) => {
    e.preventDefault();
    addSessionStorageItem(
      SessionStorageKeys.SendAgreementId,
      row.original.AgreementId
    );
    navigate(routeNames.sendagreement.path);
  };

  const downloadAgreement = async (e, row) => {
    e.preventDefault();
    apiReqResLoader("x", "x", API_ACTION_STATUS.START);
    let isapimethoderr = false;
    let objParams = {
      AgreementId: parseInt(row.original.AgreementId),
    };
    axiosPost(`${config.apiBaseUrl}${ApiUrls.getAgreementDetails}`, objParams)
      .then(async (response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          const fresponse = await fetchPost(
            `${config.apiBaseUrl}${ApiUrls.getAgreementFile}`,
            {
              ...objParams,
              FileId: objResponse.Data.FileId,
            }
          );
          if (fresponse.ok) {
            const blob = await fresponse.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${objResponse.Data?.Title}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            isapimethoderr = true;
          }
        } else {
          isapimethoderr = true;
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        console.error(
          `"API :: ${ApiUrls.getAgreementDetails}, Error ::" ${err}`
        );
      })
      .finally(() => {
        if (isapimethoderr == true) {
          Toast.error(AppMessages.SomeProblem);
        }
        apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
      });
  };

  //Grid actions

  return (
    <>
      {SetPageLoaderNavLinks()}
      <div className="full-row bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-6">
                  <div className="breadcrumb">
                    <div className="breadcrumb-item bc-fh">
                      <h6 className="mb-3 down-line pb-10">
                        Agreement Templates
                      </h6>
                    </div>
                  </div>
                </div>
                <div className="col-6 d-flex justify-content-end align-items-end pb-10"></div>
              </div>
              {/*============== Search Start ==============*/}
              <div className="woo-filter-bar full-row px-3 py-4 box-shadow grid-search rounded">
                <div className="container-fluid v-center">
                  <div className="row">
                    <div className="col px-0">
                      <form noValidate>
                        <div className="row row-cols-lg- 6 row-cols-md- 4 row-cols- 1 g-3 div-search">
                          <div className="col-lg-4 col-xl-3 col-md-6">
                            <InputControl
                              lblClass="mb-0"
                              lblText="Search Name"
                              name="txtkeyword"
                              ctlType={formCtrlTypes.searchkeyword}
                              value={searchFormData.txtkeyword}
                              onChange={handleChange}
                              formErrors={formErrors}
                            ></InputControl>
                          </div>
                          <div className="col-lg-6 col-xl-4 col-md-6 grid-search-action">
                            <label
                              className="mb-0 form-error w-100"
                              id="search-val-err-message"
                            ></label>
                            <button
                              className="btn btn-primary w- 100"
                              value="Search"
                              name="btnsearch"
                              type="button"
                              onClick={onSearch}
                            >
                              Search
                            </button>
                            <button
                              className="btn btn-primary w- 100"
                              value="Show all"
                              name="btnshowall"
                              type="button"
                              onClick={onShowAll}
                            >
                              Show All
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              {/*============== Search End ==============*/}

              {/*============== Grid Start ==============*/}
              <div className="row rounded">
                <div className="col">
                  <div className="dashboard-panel border bg-white rounded overflow-hidden w-100 box-shadow">
                    <Grid
                      columns={columns}
                      data={agreementsList}
                      loading={isDataLoading}
                      fetchData={fetchData}
                      pageCount={pageCount}
                      totalInfo={{
                        text: "Total Templates",
                        count: totalCount,
                      }}
                      noData={AppMessages.NoAgreementTemplates}
                    />
                  </div>
                </div>
              </div>
              {/*============== Grid End ==============*/}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgreementTemplates;
