import React, { useState, useEffect, useCallback, useRef } from "react";
import { routeNames } from "../routes/routes";
import {
  DataLoader,
  GridList,
  NoData,
} from "../components/common/LazyComponents";
import PageTitle from "../components/layouts/PageTitle";
import { apiReqResLoader } from "../utils/common";
import config from "../config.json";
import { axiosPost } from "../helpers/axiosHelper";
import {
  ApiUrls,
  AppMessages,
  API_ACTION_STATUS,
  GridDefaultValues,
} from "../utils/constants";

const Testimonials = () => {
  let $ = window.$;

  const [testimonialsList, setTestimonialsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const getTestimonials = ({
    pi = GridDefaultValues.pi,
    ps = GridDefaultValues.ps12,
    showPageLoader = false,
  }) => {
    //show loader if search actions.
    if (showPageLoader) {
      apiReqResLoader("x");
    }
    setIsDataLoading(true);
    let isapimethoderr = false;
    let objParams = {};

    objParams = {
      keyword: "",
      SupportTypeId: 3, //testimonials
      Status: 1,
      pi: parseInt(pi),
      ps: parseInt(ps),
    };

    return axiosPost(
      `${config.apiBaseUrl}${ApiUrls.getSupportTickets}`,
      objParams
    )
      .then((response) => {
        let objResponse = response.data;
        if (objResponse.StatusCode === 200) {
          setTotalCount(objResponse.Data.TotalCount);
          setPageCount(Math.ceil(objResponse.Data.TotalCount / ps));
          setTestimonialsList(objResponse.Data.SupportTickets);
        } else {
          isapimethoderr = true;
          setTestimonialsList([]);
          setPageCount(0);
        }
      })
      .catch((err) => {
        isapimethoderr = true;
        setTestimonialsList([]);
        setPageCount(0);
        console.error(`"API :: ${ApiUrls.getSupportTickets}, Error ::" ${err}`);
      })
      .finally(() => {
        if (isapimethoderr === true) {
        }
        if (showPageLoader) {
          apiReqResLoader("x", "x", API_ACTION_STATUS.COMPLETED);
        }
        setIsDataLoading(false);
      });
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Testimonials",
        accessor: "Id",
        disableSortBy: true,
        Cell: ({ row }) => (
          <div
            className="testimonial-block-1 transation h-100 hover-underline-animation rounded box-shadow"
            key={`testi-key-${row.id}`}
            d-id={row.original.Id}
          >
            <i className="flaticon-right-quote flat-small text-primary d-table"></i>
            <p className="mb-50">
              “{row.original.Message}“{" "}
              {row.original.Id == 22 &&
                "flaticon-right-quote flat-small text-primary d-table laticon-right-quote flat-small text-primary d-table laticon-right-quote flat-small text-primary d-table"}
            </p>
            <div className="d-flex align-items-center gap-3 mb-10 flex-jc-r name-block">
              {/* <div className="image-avata">
                  <img
                    className="rounded-circle me-2"
                    src="assets/images/team/1.jpg"
                    alt="avata"
                  />
                </div> */}
              <div className="about-avata">
                {/* <div className="d-table">
                    by <span className="name">{row.original.Name}</span>
                  </div>
                  <span className="d-table designation">
                    {row.original.Name}
                  </span> */}
                <span className="text-primary pb-2 d-table tagline-2 w-20 font-fifteen">
                  <span className="name ls-0">{row.original.Name}</span>
                </span>
              </div>
            </div>
          </div>
        ),
      },
    ],
    []
  );

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(({ pageIndex, pageSize }) => {
    const fetchId = ++fetchIdRef.current;
    if (fetchId === fetchIdRef.current) {
      getTestimonials({
        pi: pageIndex,
        ps: pageSize,
        showPageLoader: pageIndex > 0 ? true : false,
      });
    }
  }, []);

  return (
    <>
      {/*============== Page title Start ==============*/}
      <PageTitle
        title="Testimonials"
        navLinks={[{ title: "Home", url: routeNames.home.path }]}
      ></PageTitle>
      {/*============== Page title End ==============*/}

      {/*============== Testimonials Start ==============*/}
      <div className="full-row pt-5 pb-5 bg-light mb-20">
        <div className="container">
          <GridList
            columns={columns}
            data={testimonialsList}
            loading={isDataLoading}
            fetchData={fetchData}
            pageCount={pageCount}
            totalInfo={{
              text: "Testimonials",
              count: totalCount,
            }}
            noData={AppMessages.NoTestimonials}
            containerClassName="row row-cols-lg-3 row-cols-md-3 row-cols-1"
            defaultPs={12}
            isshowHeader={false}
            isColumnParentDiv={false}
            pagingNavigationArrows={true}
            dataloaderParentDiv={false}
            noDataParentDiv={false}
          />
        </div>
      </div>
      {/*============== Testimonials End ==============*/}
    </>
  );
};

export default Testimonials;
