import React from "react";
import PageTitle from "../components/layouts/PageTitle";
import { routeNames } from "../routes/routes";
import { DataLoader, NoData } from "../components/common/LazyComponents";
import usePlansGateway from "../hooks/usePlansGateway";
import { checkEmptyVal } from "../utils/common";

const Plans = () => {
  let $ = window.$;

  const { plansList, isDataLoading } = usePlansGateway();

  return (
    <>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Plans"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Pricing Table Content Start ==============*/}

      <div className="full-row pt-4 pb-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 col-md-12">
              <div className="text-secondary mb-5">
                <span className="tagline-2 text-primary">Pricing Plans</span>
                <h4 className="text-secondary mb-4">
                  Choose the All-inclusive Packages Best Suited to You.
                </h4>
              </div>
            </div>
          </div>
          {isDataLoading && <DataLoader />}
          {!isDataLoading &&
            (checkEmptyVal(plansList) || plansList.length == 0) && (
              <NoData pos="left" />
            )}
          {!isDataLoading &&
            !checkEmptyVal(plansList) &&
            plansList.length > 0 && (
              <div className="row divider-col-4 row-cols-xl-4 row-cols-md-2 row-cols-1">
                {plansList?.map((p, pidx) => {
                  return (
                    <div className="col" key={`plan-${pidx}`}>
                      <div className="px-2 sm-px-0 mb-5">
                        <h4 className="text-start font-500 down-line pb-10 text-primary">
                          {p.Plan}
                        </h4>

                        <ul className="list-style-tick my-4 ul-plans">
                          {p?.Features?.map((f, fidx) => {
                            return (
                              <li
                                key={`f-${fidx}`}
                                className={f.LimitDisplay == "na" ? "na" : ""}
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
                              <sup>{p.StrPerMonth.substring(0, 1)}</sup>{" "}
                              {p.StrPerMonth.substring(1)}
                            </span>
                            /mo
                          </div>
                          <div className="text-end text-primary pr-10">
                            <span className="h2 font-400 text-primary">
                              <sup>{p.StrPerAnnum.substring(0, 1)}</sup>{" "}
                              {p.StrPerAnnum.substring(1)}
                            </span>
                            /yr
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
      {/*============== Pricing Table Content End ==============*/}
    </>
  );
};

export default Plans;
